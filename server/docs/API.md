# CamTracker Deluxe API Documentation

## Overview

The CamTracker Deluxe API provides comprehensive endpoints for managing vintage analog camera collections with advanced condition tracking, market value monitoring, and professional features.

**Base URL**: `http://localhost:3000/api` (Development)  
**Version**: 1.0.0  
**Format**: JSON  

## Features

- **Camera Management**: Full CRUD operations for camera records
- **Search & Filtering**: Advanced search by brand, model, serial number with filtering options  
- **Image Management**: Upload and manage camera images with caching
- **Import/Export**: CSV import/export functionality with validation
- **Statistics**: Collection analytics, brand distribution, and condition analysis
- **Performance Monitoring**: Cache management and performance metrics
- **Job Processing**: Background image processing and data management

## Authentication

This is a local application API - no authentication required.

## Error Handling

The API uses conventional HTTP response codes:

- `200` - Success
- `201` - Created  
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive error message:
```json
{
  "error": "Brand is required"
}
```

## Endpoints

### System

#### Health Check
```http
GET /api/health
```

Check if the API server is running and healthy.

**Response**
```json
{
  "status": "ok"
}
```

---

### Cameras

#### List All Cameras
```http
GET /api/cameras
```

Retrieve all cameras with optional search and filtering parameters.

**Query Parameters**
- `search` (string) - Search term for brand, model, or serial number
- `minPrice` (number) - Minimum kamerastore price filter  
- `maxPrice` (number) - Maximum kamerastore price filter
- `condition` (integer, 1-5) - Minimum condition rating
- `brand` (string) - Filter by specific brand
- `sort` (string) - Sort field: `date`, `brand`, `model`, `price` (default: `date`)
- `order` (string) - Sort order: `asc`, `desc` (default: `desc`)

**Example Request**
```http
GET /api/cameras?search=Nikon&minPrice=100&maxPrice=500
```

**Response**
```json
[
  {
    "id": 1,
    "brand": "Nikon",
    "model": "F50",
    "serial": "2922618",
    "mechanical_status": 5,
    "cosmetic_status": 4,
    "kamerastore_price": 600,
    "weighted_price": 540,
    "sold_price": 540,
    "comment": "Excellent condition",
    "image1_path": "/uploads/cameras/uuid-image1.jpg",
    "image2_path": null,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

#### Get Single Camera
```http
GET /api/cameras/{id}
```

Retrieve detailed information about a specific camera.

**Path Parameters**
- `id` (integer) - Camera ID

**Response**
```json
{
  "id": 1,
  "brand": "Nikon",
  "model": "F50",
  "serial": "2922618",
  "mechanical_status": 5,
  "cosmetic_status": 4,
  "kamerastore_price": 600,
  "weighted_price": 540,
  "sold_price": 540,
  "comment": "Excellent condition",
  "image1_path": "/uploads/cameras/uuid-image1.jpg",
  "image2_path": null,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Create New Camera
```http
POST /api/cameras
```

Create a new camera record. Supports both JSON and multipart form data for image uploads.

**Request Body (JSON)**
```json
{
  "brand": "Nikon",
  "model": "F50",
  "serial": "2922618",
  "mechanical_status": 5,
  "cosmetic_status": 4,
  "kamerastore_price": 600,
  "sold_price": 540,
  "comment": "Excellent condition"
}
```

**Request Body (Multipart Form Data)**
```
brand: Nikon
model: F50
serial: 2922618
mechanical_status: 5
cosmetic_status: 4
kamerastore_price: 600
sold_price: 540
comment: Excellent condition
image1: [file] (JPEG/PNG, max 5MB)
image2: [file] (JPEG/PNG, max 5MB)
```

**Required Fields**
- `brand` (string)
- `model` (string)

**Optional Fields**
- `serial` (string)
- `mechanical_status` (integer, 1-5)
- `cosmetic_status` (integer, 1-5)  
- `kamerastore_price` (number, ≥0)
- `sold_price` (number, ≥0)
- `comment` (string)
- `image1` (file) - First camera image
- `image2` (file) - Second camera image

**Response** (201 Created)
```json
{
  "id": 1,
  "brand": "Nikon",
  "model": "F50",
  "serial": "2922618",
  "mechanical_status": 5,
  "cosmetic_status": 4,
  "kamerastore_price": 600,
  "weighted_price": 540,
  "sold_price": 540,
  "comment": "Excellent condition",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Update Camera
```http
PUT /api/cameras/{id}
```

Update an existing camera record. Only provided fields will be updated.

**Path Parameters**
- `id` (integer) - Camera ID

**Request Body**
```json
{
  "comment": "Updated comment",
  "mechanical_status": 4,
  "sold_price": 580
}
```

**Response**
```json
{
  "id": 1,
  "brand": "Nikon",
  "model": "F50",
  "comment": "Updated comment",
  "mechanical_status": 4,
  "weighted_price": 480,
  "sold_price": 580,
  "updated_at": "2024-01-01T13:00:00Z"
}
```

#### Delete Camera
```http
DELETE /api/cameras/{id}
```

Remove a camera record and associated images.

**Path Parameters**
- `id` (integer) - Camera ID

**Response**
```json
{
  "message": "Camera deleted successfully",
  "id": 1
}
```

#### Clear All Cameras (Development Only)
```http
DELETE /api/cameras/clear
```

⚠️ **Development Only**: Remove all cameras from the database.

**Response**
```json
{
  "message": "All cameras cleared",
  "count": 5
}
```

---

### Statistics

#### Collection Summary
```http
GET /api/summary
```

Get comprehensive statistics about the camera collection.

**Response**
```json
{
  "totalCameras": 25,
  "totalValue": 12500.00,
  "averageValue": 500.00,
  "averageMechanicalCondition": 4.2,
  "averageCosmeticCondition": 3.8,
  "brandBreakdown": [
    {
      "brand": "Nikon",
      "count": 8,
      "totalValue": 4800.00,
      "averageValue": 600.00
    }
  ],
  "conditionBreakdown": {
    "mechanical": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 8,
      "5": 9
    },
    "cosmetic": {
      "1": 0,
      "2": 3,
      "3": 6,
      "4": 10,
      "5": 6
    }
  },
  "priceRanges": {
    "under100": 2,
    "range100to300": 8,
    "range300to500": 6,
    "range500to1000": 7,
    "over1000": 2
  },
  "mostExpensive": {
    "id": 15,
    "brand": "Leica",
    "model": "M3",
    "price": 2500
  },
  "leastExpensive": {
    "id": 3,
    "brand": "Canon",
    "model": "Rebel",
    "price": 50
  },
  "recentAdditions": 3,
  "camerasWithImages": 18
}
```

---

### Import/Export

#### Export Cameras to CSV
```http
GET /api/export
```

Export all cameras to a CSV file with all camera data.

**Response**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="cameras_export_20240101.csv"`

```csv
Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
Nikon,F50,2922618,5,4,600,540,540,Excellent condition
Canon,AE-1,1234567,4,3,150,105,120,Good working order
```

#### Import Cameras from CSV
```http
POST /api/import
```

Import camera data from a CSV file. Validates all data before importing.

**Request Body**
- Content-Type: `multipart/form-data`
- `file`: CSV file with camera data

**CSV Format**
```csv
Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
Nikon,F50,2922618,5,4,600,540,540,Excellent condition
```

**Response**
```json
{
  "imported": 8,
  "errors": [
    "Row 3: Brand is required",
    "Row 7: Invalid mechanical status"
  ]
}
```

---

### Images

#### Search Default Images
```http
GET /api/default-images/search?brand=Nikon&model=F50
```

Find default images for a specific camera brand and model.

**Query Parameters**
- `brand` (string, required) - Camera brand
- `model` (string, required) - Camera model

**Response**
```json
[
  {
    "id": 1,
    "brand": "Nikon",
    "model": "F50",
    "image_url": "https://example.com/nikon-f50.jpg",
    "cached_path": "/cached-images/nikon-f50-hash.jpg",
    "attribution": "Wikipedia",
    "attribution_url": "https://wikipedia.org",
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

#### Get All Default Images
```http
GET /api/default-images
```

Retrieve all available default camera images.

#### Add Default Image
```http
POST /api/default-images
```

Add a new default image for a camera model.

**Request Body**
```json
{
  "brand": "Nikon",
  "model": "F50",
  "image_url": "https://example.com/nikon-f50.jpg",
  "attribution": "Wikipedia",
  "attribution_url": "https://wikipedia.org"
}
```

#### Search for Images
```http
POST /api/image-search
```

Search for camera images using external APIs (Wikipedia, etc.)

**Request Body**
```json
{
  "query": "Nikon F50 camera",
  "brand": "Nikon",
  "model": "F50"
}
```

**Response**
```json
{
  "results": [
    {
      "url": "https://example.com/image.jpg",
      "title": "Nikon F50 Camera",
      "source": "Wikipedia",
      "thumbnail": "https://example.com/thumb.jpg"
    }
  ]
}
```

---

### Cache Management

#### Get Cache Statistics
```http
GET /api/cache/stats
```

Retrieve cache performance statistics.

**Response**
```json
{
  "total_images": 142,
  "cache_size": "45.2 MB",
  "hit_rate": 0.87,
  "last_cleanup": "2024-01-01T10:30:00Z"
}
```

#### Clear Image Cache
```http
DELETE /api/cache/clear
```

Clear all cached images and reset cache statistics.

**Response**
```json
{
  "message": "Cache cleared successfully",
  "cleared_files": 42
}
```

---

### Job Processing

#### Get Job Queue Status
```http
GET /api/jobs/status
```

Get the current status of background job processing.

**Response**
```json
{
  "active": true,
  "pending_jobs": 3,
  "completed_jobs": 247,
  "failed_jobs": 2
}
```

#### Get Job Queue
```http
GET /api/jobs/queue
```

List all jobs in the queue with their status.

**Response**
```json
[
  {
    "id": "job-001",
    "type": "image-processing",
    "status": "pending",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

---

### Performance

#### Get Performance Metrics
```http
GET /api/performance/metrics
```

Retrieve API performance metrics and statistics.

**Response**
```json
{
  "response_times": {
    "average": 45.2,
    "p95": 120.5,
    "p99": 250.1
  },
  "request_counts": {
    "total": 15420,
    "success": 14892,
    "errors": 528
  },
  "error_rates": {
    "4xx": 0.025,
    "5xx": 0.009
  },
  "uptime": "15 days, 4 hours, 23 minutes"
}
```

#### Get Attribution Information
```http
GET /api/attribution/info
```

Get attribution information for images and data sources.

**Response**
```json
{
  "sources": [
    {
      "name": "Wikipedia",
      "url": "https://wikipedia.org",
      "license": "CC BY-SA"
    }
  ]
}
```

---

## Data Models

### Camera Object
```json
{
  "id": 1,                                    // Unique identifier
  "brand": "Nikon",                          // Camera brand (required)
  "model": "F50",                            // Camera model (required)
  "serial": "2922618",                       // Serial number (optional)
  "mechanical_status": 5,                    // Mechanical condition 1-5 (optional)
  "cosmetic_status": 4,                      // Cosmetic condition 1-5 (optional)
  "kamerastore_price": 600,                  // Kamerastore price (optional)
  "weighted_price": 540,                     // Auto-calculated weighted price
  "sold_price": 540,                         // Actual sold price (optional)
  "comment": "Excellent condition",          // Additional comments (optional)
  "image1_path": "/uploads/cameras/uuid1.jpg", // First image path (optional)
  "image2_path": "/uploads/cameras/uuid2.jpg", // Second image path (optional)
  "created_at": "2024-01-01T12:00:00Z",     // Creation timestamp
  "updated_at": "2024-01-01T12:00:00Z"      // Last update timestamp
}
```

### Weighted Price Calculation
The `weighted_price` is automatically calculated based on condition and kamerastore_price:

```
weighted_price = kamerastore_price × (0.2 + ((mechanical_status + cosmetic_status) / 2 - 1) × 0.2)
```

Examples:
- Perfect condition (5,5): multiplier = 0.9 (90% of kamerastore_price)
- Good condition (3,3): multiplier = 0.6 (60% of kamerastore_price)  
- Poor condition (1,1): multiplier = 0.2 (20% of kamerastore_price)

---

## Usage Examples

### JavaScript/Node.js
```javascript
// Get all cameras
const response = await fetch('http://localhost:3000/api/cameras');
const cameras = await response.json();

// Create a new camera
const newCamera = {
  brand: 'Canon',
  model: 'AE-1',
  mechanical_status: 4,
  cosmetic_status: 3,
  kamerastore_price: 150
};

const createResponse = await fetch('http://localhost:3000/api/cameras', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newCamera)
});

const createdCamera = await createResponse.json();
```

### Python
```python
import requests

# Get collection summary
response = requests.get('http://localhost:3000/api/summary')
summary = response.json()

print(f"Total cameras: {summary['totalCameras']}")
print(f"Total value: ${summary['totalValue']}")
```

### cURL
```bash
# Search for Nikon cameras
curl "http://localhost:3000/api/cameras?search=Nikon"

# Create a new camera
curl -X POST http://localhost:3000/api/cameras \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Pentax",
    "model": "K1000",
    "mechanical_status": 5,
    "cosmetic_status": 4,
    "kamerastore_price": 200
  }'

# Upload camera with images
curl -X POST http://localhost:3000/api/cameras \
  -F "brand=Olympus" \
  -F "model=OM-1" \
  -F "mechanical_status=4" \
  -F "image1=@camera-front.jpg" \
  -F "image2=@camera-back.jpg"
```

---

## Rate Limits

Currently, there are no rate limits implemented. This may change in future versions.

---

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- Full CRUD operations for cameras
- Search and filtering capabilities
- Import/export functionality
- Image management system
- Performance monitoring
- Job queue processing

---

## Support

- **Interactive Documentation**: Visit `/api/docs` for Swagger UI
- **Alternative Documentation**: Visit `/api/docs/redoc` for Redoc format
- **OpenAPI Specification**: Download from `/api/docs/openapi.json` or `/api/docs/openapi.yaml`
- **Testing**: Postman collections available in `/postman/` directory

For issues or questions, please refer to the project repository or contact the development team.