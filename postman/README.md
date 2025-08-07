# CamTracker Deluxe API - Postman Collections

This directory contains comprehensive Postman collections for testing and exploring the CamTracker Deluxe API.

## Files Included

### Collections
- **CamTracker-Deluxe-API.postman_collection.json** - Main API collection with all endpoints
- **CamTracker-API-Tests.postman_collection.json** - Automated test suite with assertions

### Environments
- **CamTracker-Development.postman_environment.json** - Development environment (localhost:3000)
- **CamTracker-Production.postman_environment.json** - Production environment template

### Sample Data
- **sample-cameras.csv** - Sample CSV file for testing import functionality

## Setup Instructions

### 1. Import Collections and Environments

1. Open Postman
2. Click "Import" in the top left
3. Import all JSON files from this directory
4. Select the "CamTracker Development" environment

### 2. Start the Server

Before testing, make sure the CamTracker server is running:

```bash
cd /home/anders/code/react/camtrack/server
npm start
```

The server should be running on `http://localhost:3000`

### 3. Using the Collections

#### Main API Collection
- Contains all available API endpoints
- Organized by functionality (Cameras, Summary, Import/Export, etc.)
- Includes examples for different use cases
- Variables automatically set for dependent requests

#### Test Collection  
- Comprehensive automated test suite
- Run individually or as a complete suite
- Tests include validation, error handling, and edge cases
- Automatically manages test data creation and cleanup

## API Endpoints Overview

### Core Camera Operations
- `GET /api/cameras` - List all cameras with search/filter support
- `GET /api/cameras/:id` - Get single camera details
- `POST /api/cameras` - Create new camera (with optional image upload)
- `PUT /api/cameras/:id` - Update existing camera
- `DELETE /api/cameras/:id` - Delete camera
- `DELETE /api/cameras/clear` - Clear all cameras (development only)

### Search & Filtering
- Search: `?search=term` - Search brand, model, serial number
- Filter: `?minPrice=100&maxPrice=500` - Price range filtering
- Filter: `?condition=4` - Filter by condition rating

### Statistics & Analytics
- `GET /api/summary` - Collection statistics and analytics

### Data Import/Export
- `GET /api/export/csv` - Export cameras to CSV
- `POST /api/import/csv` - Import cameras from CSV file

### Image Management
- `GET /api/default-images/search` - Search for default camera images
- `POST /api/image-search` - Search for images using external APIs
- `GET /uploads/cameras/:filename` - Serve uploaded images
- `GET /cached-images/:filename` - Serve cached images

### System Management
- `GET /api/health` - Health check endpoint
- `GET /api/cache/stats` - Cache statistics
- `DELETE /api/cache/clear` - Clear image cache
- `GET /api/jobs/status` - Job queue status
- `GET /api/performance/metrics` - Performance metrics

## Testing Workflow

### Manual Testing
1. Use the main API collection to explore endpoints
2. Start with "Health Check" to verify server is running
3. Create test cameras using the "Create Camera" requests
4. Test search and filter functionality
5. Try import/export with the sample CSV file

### Automated Testing
1. Select the "CamTracker-API-Tests" collection
2. Click "Run collection" in Postman
3. Choose environment and run settings
4. View test results and coverage

### Sample Test Scenarios

#### Basic CRUD Operations
```
1. Health Check ✓
2. Clear All Cameras ✓
3. Create Camera 1 ✓
4. Create Camera 2 ✓
5. Get All Cameras ✓
6. Update Camera ✓
7. Delete Camera ✓
8. Verify Deletion ✓
```

#### Search and Filter Testing
```
1. Search by Brand ✓
2. Search by Model ✓
3. Filter by Price Range ✓
4. Combine Search + Filters ✓
```

#### Validation Testing
```
1. Missing Required Fields ✓
2. Invalid Status Values ✓
3. Nonexistent Resources ✓
```

## CSV Import/Export Testing

### Testing Import
1. Use the "Import Cameras from CSV" request
2. Attach the `sample-cameras.csv` file
3. Verify successful import with response showing imported count
4. Check cameras were created with "Get All Cameras"

### Testing Export  
1. Create some test cameras
2. Use "Export Cameras to CSV" request
3. Verify CSV format and data integrity
4. Save the exported file for re-import testing

## Variables and Environment

### Collection Variables
- `baseUrl` - API base URL (http://localhost:3000)
- `cameraId` - Automatically set when creating cameras
- `camera1Id`, `camera2Id` - Used in test workflows

### Environment Setup
- Development: localhost:3000
- Production: Update the production environment file with your actual URL
- Test: Can use the same as development

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Server Error

Error responses include descriptive messages:
```json
{
  "error": "Brand is required"
}
```

## Advanced Features

### Image Upload Testing
- Use the "Create Camera with Images" request
- Attach image files (JPEG/PNG, max 5MB)
- Test with multiple images per camera

### Performance Testing
- Run collections with high iteration counts
- Monitor response times
- Check performance metrics endpoint

### Database State Management
- Use "Clear All Cameras" for clean test runs
- Create consistent test datasets
- Verify data persistence across requests

## Tips for Effective Testing

1. **Use Environments** - Switch between dev/prod easily
2. **Run Full Test Suites** - Use the automated test collection regularly
3. **Monitor Variables** - Check that IDs are being set correctly
4. **Validate Responses** - Look for proper data structure and values
5. **Test Edge Cases** - Try invalid inputs, empty data, large datasets
6. **Check Status Codes** - Verify appropriate HTTP responses
7. **Use Pre/Post Scripts** - Add custom validation as needed

## Troubleshooting

### Common Issues
- **Connection Refused**: Server not running on localhost:3000
- **404 Errors**: Check endpoint URLs match the API routes
- **Validation Errors**: Verify required fields are included
- **File Upload Issues**: Check file size and format restrictions

### Debug Steps
1. Verify server is running with Health Check
2. Check Postman console for detailed error messages
3. Review server logs for backend errors
4. Validate request format against API documentation
5. Test with minimal data first, then add complexity

## Contributing

When adding new API endpoints:
1. Add requests to the main collection
2. Include corresponding tests in the test collection
3. Update this README with new endpoint documentation
4. Test thoroughly before committing changes