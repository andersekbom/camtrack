# Keycloak IAM Setup for CamTracker

This guide explains how to set up a local Keycloak server for authentication and authorization in the CamTracker application.

## Prerequisites

- Docker and Docker Compose installed
- `curl` and `jq` (for the setup script)
- Ports 8080 (Keycloak) and 5432 (PostgreSQL) available

## Quick Start

### 1. Automated Setup (Recommended)

Run the automated setup script:

```bash
./scripts/keycloak-setup.sh setup
```

This will:
- Start Keycloak and PostgreSQL containers
- Wait for Keycloak to be ready
- Create the `camtracker` realm
- Create the `camtracker-client` application
- Create `admin` and `user` roles
- Create a test admin user (`testadmin` / `admin123`)

### 2. Manual Setup

If you prefer manual setup:

```bash
# Start containers
docker-compose -f docker-compose.keycloak.yml up -d

# Wait for Keycloak to start (check http://localhost:8080)
# Then configure manually via the admin console
```

## Configuration Details

### Keycloak Server
- **URL**: http://localhost:8080
- **Admin Console**: http://localhost:8080/admin
- **Admin User**: `admin`
- **Admin Password**: `admin123`

### Realm Configuration
- **Realm Name**: `camtracker`
- **Display Name**: CamTracker Authentication
- **Settings**:
  - User registration: Enabled
  - Email login: Enabled
  - Password reset: Enabled
  - Brute force protection: Enabled

### Client Configuration
- **Client ID**: `camtracker-client`
- **Client Type**: Public (for SPA)
- **Valid Redirect URIs**:
  - `http://localhost:5173/*` (Vite dev server)
  - `http://localhost:5174/*` (Alternative port)
  - `http://localhost:3000/*` (Node.js server)
- **Web Origins**: Same as redirect URIs
- **Flows Enabled**:
  - Standard Flow (Authorization Code)
  - Direct Access Grants (Resource Owner Password)

### Roles
- **admin**: Full access to all features
- **user**: Standard user access

### Test User
- **Username**: `testadmin`
- **Password**: `admin123`
- **Email**: `admin@camtracker.local`
- **Role**: `admin`

## Important URLs

### Authentication Endpoints
- **Authorization URL**: `http://localhost:8080/realms/camtracker/protocol/openid-connect/auth`
- **Token URL**: `http://localhost:8080/realms/camtracker/protocol/openid-connect/token`
- **UserInfo URL**: `http://localhost:8080/realms/camtracker/protocol/openid-connect/userinfo`
- **Logout URL**: `http://localhost:8080/realms/camtracker/protocol/openid-connect/logout`

### Admin URLs
- **Admin Console**: `http://localhost:8080/admin`
- **Realm Management**: `http://localhost:8080/admin/master/console/#/camtracker`

## Management Commands

Use the provided script for easy management:

```bash
# Full setup (first time)
./scripts/keycloak-setup.sh setup

# Start services
./scripts/keycloak-setup.sh start

# Stop services
./scripts/keycloak-setup.sh stop

# Restart services
./scripts/keycloak-setup.sh restart

# View logs
./scripts/keycloak-setup.sh logs

# Check status
./scripts/keycloak-setup.sh status
```

## Environment Variables

Copy `.env.keycloak` to `.env.local` and update as needed:

```bash
cp .env.keycloak .env.local
```

Key variables:
- `KEYCLOAK_URL`: Keycloak server URL
- `KEYCLOAK_REALM`: Realm name
- `KEYCLOAK_CLIENT_ID`: Client identifier
- `JWT_SECRET`: Secret for JWT token signing

## Integration with CamTracker

### Frontend (React)
You'll need to install and configure a Keycloak adapter:

```bash
cd client
npm install @react-keycloak/web keycloak-js
```

### Backend (Node.js)
Install Keycloak middleware:

```bash
cd server
npm install keycloak-connect express-session
```

## Security Considerations

### Development Setup
- Uses HTTP (not HTTPS) for local development
- Default passwords are simple for ease of testing
- Database credentials are in plain text

### Production Checklist
- [ ] Use HTTPS/TLS certificates
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Configure proper CORS origins
- [ ] Enable proper logging and monitoring
- [ ] Use external database (not Docker volume)
- [ ] Configure backup and recovery
- [ ] Set up proper network security

## Troubleshooting

### Container Issues
```bash
# Check container status
docker ps

# View logs
docker logs keycloak-server
docker logs keycloak-postgres

# Restart containers
docker-compose -f docker-compose.keycloak.yml restart
```

### Connection Issues
```bash
# Check if ports are available
netstat -tlnp | grep :8080
netstat -tlnp | grep :5432

# Test Keycloak connectivity
curl http://localhost:8080/health/ready
```

### Database Issues
```bash
# Connect to PostgreSQL
docker exec -it keycloak-postgres psql -U keycloak -d keycloak

# Check tables
\dt
```

## Data Persistence

Data is persisted in Docker volumes:
- `keycloak_postgres_data`: Database data

To completely reset:
```bash
docker-compose -f docker-compose.keycloak.yml down -v
./scripts/keycloak-setup.sh setup
```

## Development vs Production

### Development (Current Setup)
- Single Docker container
- SQLite/PostgreSQL in container
- HTTP protocol
- Simple passwords
- Permissive CORS

### Production Recommendations
- Use managed Keycloak service (e.g., Red Hat SSO)
- External PostgreSQL cluster
- HTTPS with proper certificates
- Strong passwords and secrets management
- Strict CORS and security headers
- Monitoring and logging
- Backup and disaster recovery

## Next Steps

1. **Test the Setup**: Verify Keycloak is running and accessible
2. **Integrate with Frontend**: Add Keycloak authentication to React app
3. **Integrate with Backend**: Add JWT validation to Node.js API
4. **Configure Authorization**: Set up role-based access control
5. **Test Authentication Flow**: Ensure login/logout works end-to-end

## Support

For issues:
1. Check the logs: `./scripts/keycloak-setup.sh logs`
2. Verify container status: `./scripts/keycloak-setup.sh status`
3. Review Keycloak documentation: https://www.keycloak.org/documentation
4. Check Docker logs for database connectivity issues