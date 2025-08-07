# CamTracker Deluxe API Documentation

This directory contains comprehensive API documentation for the CamTracker Deluxe application.

## Documentation Formats

### 1. Interactive Documentation (Recommended)

#### Swagger UI - Interactive API Explorer
- **URL**: `http://localhost:3000/api/docs`
- **Features**:
  - Try out API endpoints directly in browser
  - Interactive request/response examples
  - Built-in authentication testing
  - Schema validation
  - Code generation in multiple languages

#### Redoc - Clean Documentation View
- **URL**: `http://localhost:3000/api/docs/redoc`
- **Features**:
  - Clean, readable format
  - Optimized for browsing and reference
  - Search functionality
  - Responsive design
  - Print-friendly

### 2. Machine-Readable Specifications

#### OpenAPI 3.0 JSON
- **URL**: `http://localhost:3000/api/docs/openapi.json`
- **Use Cases**:
  - Import into Postman, Insomnia, or other API clients
  - Generate client libraries with OpenAPI Generator
  - API testing and validation tools
  - Integration with CI/CD pipelines

#### OpenAPI 3.0 YAML
- **URL**: `http://localhost:3000/api/docs/openapi.yaml`
- **Use Cases**:
  - Human-readable specification format
  - Version control friendly
  - Documentation as code workflows
  - Custom documentation generation

### 3. Markdown Documentation
- **File**: `API.md`
- **URL**: `http://localhost:3000/api/docs/markdown`
- **Use Cases**:
  - Offline reference
  - Integration with documentation sites
  - README files and wikis
  - Version control and diff tracking

## Files in this Directory

- `openapi.yaml` - Complete OpenAPI 3.0 specification
- `API.md` - Comprehensive markdown documentation
- `README.md` - This file

## Getting Started

### For Developers
1. Start the CamTracker server: `npm start`
2. Visit `http://localhost:3000/api/docs` for interactive documentation
3. Try out the endpoints using the "Try it out" button
4. Use the examples provided for your integration

### For API Integration
1. Download the OpenAPI specification from `http://localhost:3000/api/docs/openapi.json`
2. Import into your preferred API client (Postman, Insomnia, etc.)
3. Use the specification to generate client libraries in your preferred language
4. Refer to the markdown documentation for detailed examples

### For Testing
1. Use the Postman collections in `/postman/` directory
2. Import the collections and environment files
3. Run the automated test suite to verify API functionality
4. Use the sample data provided for testing

## API Overview

The CamTracker Deluxe API provides:

- **15 endpoints** across 9 functional areas
- **Full CRUD operations** for camera management
- **Advanced search and filtering** capabilities
- **File upload support** for camera images
- **CSV import/export** functionality
- **Real-time statistics** and analytics
- **Cache management** and performance monitoring
- **Background job processing** for images

## Authentication

The API currently does not require authentication as it's designed for local use. Future versions may include authentication for multi-user deployments.

## Rate Limiting

No rate limiting is currently implemented. The API is designed for local use with reasonable request volumes.

## Error Handling

The API follows REST conventions:
- `2xx` - Success responses
- `4xx` - Client errors (validation, not found, etc.)
- `5xx` - Server errors

All error responses include descriptive error messages in JSON format.

## Versioning

Current version: `1.0.0`

API versioning strategy:
- Major version changes for breaking changes
- Minor version changes for new features (backward compatible)
- Patch version changes for bug fixes

## Support and Issues

For API documentation issues or questions:
1. Check the interactive documentation at `/api/docs`
2. Review the markdown documentation in `API.md`
3. Test with the Postman collections in `/postman/`
4. Check the project issues or create a new one

## Contributing

When adding new API endpoints:
1. Update `openapi.yaml` with the new endpoint specification
2. Add examples and documentation to `API.md`
3. Create corresponding Postman requests
4. Add tests to the test suites
5. Update this README if needed

## Tools Integration

### Code Generation
Use the OpenAPI specification to generate client libraries:

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate JavaScript client
openapi-generator-cli generate \
  -i http://localhost:3000/api/docs/openapi.json \
  -g javascript \
  -o ./generated-client

# Generate Python client
openapi-generator-cli generate \
  -i http://localhost:3000/api/docs/openapi.json \
  -g python \
  -o ./generated-client-python
```

### API Testing
```bash
# Using curl with the API
curl -H "Content-Type: application/json" \
     -X GET http://localhost:3000/api/cameras

# Using HTTPie
http GET localhost:3000/api/cameras search==Nikon

# Using Node.js
const response = await fetch('http://localhost:3000/api/cameras');
const cameras = await response.json();
```

### Validation
Validate API requests and responses against the OpenAPI schema using tools like:
- Swagger Inspector
- Prism (API mocking and validation)
- Dredd (API testing framework)
- Postman (built-in validation)

## Best Practices

### API Usage
1. **Check endpoint documentation** before implementation
2. **Use proper HTTP methods** (GET, POST, PUT, DELETE)
3. **Handle errors gracefully** with proper error checking
4. **Validate data** before sending requests
5. **Use appropriate content types** (JSON, multipart/form-data)

### Performance
1. **Use search parameters** to limit large result sets
2. **Cache responses** when appropriate
3. **Handle timeouts** for long-running operations
4. **Monitor API usage** with the performance endpoints

### Security
1. **Validate file uploads** (size, type)
2. **Sanitize input data** to prevent injection
3. **Use HTTPS** in production environments
4. **Implement rate limiting** for public deployments

## Changelog

### Version 1.0.0 (Current)
- Initial API documentation
- Complete OpenAPI 3.0 specification
- Interactive Swagger UI implementation
- Comprehensive markdown documentation
- Postman collection integration