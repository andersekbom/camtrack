#!/bin/bash

# Keycloak Setup Script for CamTracker
# This script helps set up and manage the local Keycloak instance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin123"
REALM_NAME="camtracker"
CLIENT_ID="camtracker-client"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  CamTracker Keycloak Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

start_keycloak() {
    print_step "Starting Keycloak containers..."
    cd "$PROJECT_ROOT"
    
    # Use docker compose or docker-compose depending on availability
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.keycloak.yml up -d
    else
        docker-compose -f docker-compose.keycloak.yml up -d
    fi
    
    print_success "Keycloak containers started"
}

wait_for_keycloak() {
    print_step "Waiting for Keycloak to be ready..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; then
            print_success "Keycloak is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 5
        ((attempt++))
    done
    
    print_error "Keycloak did not become ready within 5 minutes"
    return 1
}

get_admin_token() {
    print_step "Getting admin access token..."
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USER" \
        -d "password=$ADMIN_PASSWORD" \
        -d "grant_type=password" \
        -d "client_id=admin-cli")
    
    if [ $? -eq 0 ]; then
        echo "$response" | jq -r '.access_token' 2>/dev/null || echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
    else
        print_error "Failed to get admin token"
        return 1
    fi
}

create_realm() {
    print_step "Creating CamTracker realm..."
    
    local token=$(get_admin_token)
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Could not obtain admin token"
        return 1
    fi
    
    # Check if realm already exists
    local realm_exists=$(curl -s -H "Authorization: Bearer $token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME" | jq -r '.id' 2>/dev/null)
    
    if [ "$realm_exists" = "$REALM_NAME" ]; then
        print_success "Realm '$REALM_NAME' already exists"
        return 0
    fi
    
    # Create realm
    local realm_config='{
        "realm": "'$REALM_NAME'",
        "enabled": true,
        "displayName": "CamTracker Authentication",
        "registrationAllowed": true,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "resetPasswordAllowed": true,
        "editUsernameAllowed": false,
        "bruteForceProtected": true
    }'
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$realm_config")
    
    if [ $? -eq 0 ]; then
        print_success "Realm '$REALM_NAME' created successfully"
    else
        print_error "Failed to create realm"
        return 1
    fi
}

create_client() {
    print_step "Creating CamTracker client..."
    
    local token=$(get_admin_token)
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Could not obtain admin token"
        return 1
    fi
    
    # Check if client already exists
    local clients=$(curl -s -H "Authorization: Bearer $token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" | jq -r '.[].clientId' 2>/dev/null)
    
    if echo "$clients" | grep -q "$CLIENT_ID"; then
        print_success "Client '$CLIENT_ID' already exists"
        return 0
    fi
    
    # Create client
    local client_config='{
        "clientId": "'$CLIENT_ID'",
        "name": "CamTracker Application",
        "description": "Client for CamTracker camera collection management app",
        "enabled": true,
        "publicClient": true,
        "directAccessGrantsEnabled": true,
        "implicitFlowEnabled": false,
        "standardFlowEnabled": true,
        "serviceAccountsEnabled": false,
        "protocol": "openid-connect",
        "redirectUris": [
            "http://localhost:5173/*",
            "http://localhost:5174/*",
            "http://localhost:3000/*"
        ],
        "webOrigins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000"
        ],
        "attributes": {
            "post.logout.redirect.uris": "http://localhost:5173/*"
        }
    }'
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$client_config")
    
    if [ $? -eq 0 ]; then
        print_success "Client '$CLIENT_ID' created successfully"
    else
        print_error "Failed to create client"
        return 1
    fi
}

create_roles() {
    print_step "Creating application roles..."
    
    local token=$(get_admin_token)
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Could not obtain admin token"
        return 1
    fi
    
    # Create realm roles
    local roles=("admin" "user")
    
    for role in "${roles[@]}"; do
        local role_config='{
            "name": "'$role'",
            "description": "CamTracker '$role' role"
        }'
        
        curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$role_config" > /dev/null
        
        print_success "Role '$role' created"
    done
}

create_test_user() {
    print_step "Creating test admin user..."
    
    local token=$(get_admin_token)
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Could not obtain admin token"
        return 1
    fi
    
    # Create test user
    local user_config='{
        "username": "testadmin",
        "email": "admin@camtracker.local",
        "firstName": "Test",
        "lastName": "Admin",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "admin123",
            "temporary": false
        }]
    }'
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$user_config")
    
    if [ $? -eq 0 ]; then
        print_success "Test admin user created (username: testadmin, password: admin123)"
        
        # Get user ID and assign admin role
        local user_id=$(curl -s -H "Authorization: Bearer $token" \
            "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=testadmin" | \
            jq -r '.[0].id' 2>/dev/null)
        
        if [ "$user_id" != "null" ] && [ -n "$user_id" ]; then
            # Get admin role
            local admin_role=$(curl -s -H "Authorization: Bearer $token" \
                "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/admin")
            
            # Assign admin role to user
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$user_id/role-mappings/realm" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "[$admin_role]" > /dev/null
            
            print_success "Admin role assigned to test user"
        fi
    else
        print_error "Failed to create test user"
        return 1
    fi
}

show_summary() {
    echo
    echo -e "${GREEN}🎉 Keycloak setup completed successfully!${NC}"
    echo
    echo -e "${BLUE}📋 Configuration Summary:${NC}"
    echo "  • Keycloak URL: $KEYCLOAK_URL"
    echo "  • Admin Console: $KEYCLOAK_URL/admin"
    echo "  • Realm: $REALM_NAME"
    echo "  • Client ID: $CLIENT_ID"
    echo
    echo -e "${BLUE}👤 Test Credentials:${NC}"
    echo "  • Admin Console: admin / admin123"
    echo "  • Test User: testadmin / admin123"
    echo
    echo -e "${BLUE}🔗 URLs:${NC}"
    echo "  • Admin Console: $KEYCLOAK_URL/admin"
    echo "  • Realm Console: $KEYCLOAK_URL/admin/master/console/#/$REALM_NAME"
    echo "  • Authentication URL: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/auth"
    echo "  • Token URL: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token"
    echo
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "  1. Configure your CamTracker app to use these Keycloak settings"
    echo "  2. Update your .env file with the Keycloak configuration"
    echo "  3. Install Keycloak adapters in your Node.js and React apps"
    echo
}

stop_keycloak() {
    print_step "Stopping Keycloak containers..."
    cd "$PROJECT_ROOT"
    
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.keycloak.yml down
    else
        docker-compose -f docker-compose.keycloak.yml down
    fi
    
    print_success "Keycloak containers stopped"
}

show_logs() {
    cd "$PROJECT_ROOT"
    
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.keycloak.yml logs -f
    else
        docker-compose -f docker-compose.keycloak.yml logs -f
    fi
}

case "${1:-setup}" in
    "setup")
        print_header
        check_dependencies
        start_keycloak
        wait_for_keycloak
        create_realm
        create_client
        create_roles
        create_test_user
        show_summary
        ;;
    "start")
        start_keycloak
        print_success "Keycloak started. Visit $KEYCLOAK_URL/admin"
        ;;
    "stop")
        stop_keycloak
        ;;
    "restart")
        stop_keycloak
        start_keycloak
        print_success "Keycloak restarted"
        ;;
    "logs")
        show_logs
        ;;
    "status")
        cd "$PROJECT_ROOT"
        if docker compose version &> /dev/null; then
            docker compose -f docker-compose.keycloak.yml ps
        else
            docker-compose -f docker-compose.keycloak.yml ps
        fi
        ;;
    *)
        echo "Usage: $0 {setup|start|stop|restart|logs|status}"
        echo
        echo "Commands:"
        echo "  setup   - Full setup (start containers, create realm, client, users)"
        echo "  start   - Start Keycloak containers"
        echo "  stop    - Stop Keycloak containers"
        echo "  restart - Restart Keycloak containers"
        echo "  logs    - Show container logs"
        echo "  status  - Show container status"
        exit 1
        ;;
esac