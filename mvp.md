# Camera Collection Manager - MVP Specification

## 1. Application Overview

### Purpose
A web-based application for managing a personal collection of vintage analog cameras, tracking their technical/cosmetic condition, and monitoring their market value.

### Key Features
- CRUD operations for camera records
- Search and filter functionality
- Image storage (1-2 photos per camera)
- Collection value summary
- CSV import/export
- Modern, minimalistic interface

## 2. Architecture

### Technology Stack

#### Frontend
- **Framework**: React.js or Vue.js 3
- **UI Library**: Tailwind CSS for modern, minimalistic design
- **State Management**: Built-in state (useState/useReducer for React, or Pinia for Vue)
- **HTTP Client**: Axios or Fetch API
- **Image Handling**: Native file upload with preview

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: SQLite (perfect for single-user, file-based storage)
- **ORM**: Prisma or Sequelize for database management
- **File Storage**: Local filesystem for images
- **CSV Processing**: csv-parser and json2csv libraries

#### Development Tools
- **Build Tool**: Vite (fast, modern bundler)
- **Package Manager**: npm or yarn
- **Version Control**: Git

### System Architecture

```
┌─────────────────────────────────────────────┐
│           Browser (Client)                  │
│  ┌────────────────────────────────────┐    │
│  │     React/Vue Application          │    │
│  │  - Camera List View                │    │
│  │  - Camera Detail/Edit Form         │    │
│  │  - Search/Filter Components        │    │
│  │  - Summary Dashboard               │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    │
                    │ HTTP/REST API
                    ▼
┌─────────────────────────────────────────────┐
│           Node.js Server                    │
│  ┌────────────────────────────────────┐    │
│  │     Express.js API                 │    │
│  │  - /api/cameras (CRUD)             │    │
│  │  - /api/upload (images)            │    │
│  │  - /api/export (CSV)               │    │
│  │  - /api/import (CSV)               │    │
│  │  - /api/summary (statistics)       │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐       ┌──────────────┐
│   SQLite     │       │  File System │
│   Database   │       │   (Images)   │
│  cameras.db  │       │  /uploads/   │
└──────────────┘       └──────────────┘
```

## 3. Database Schema

### Cameras Table

```sql
CREATE TABLE cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    serial VARCHAR(100),
    mechanical_status INTEGER CHECK(mechanical_status >= 1 AND mechanical_status <= 5),
    cosmetic_status INTEGER CHECK(cosmetic_status >= 1 AND cosmetic_status <= 5),
    kamerastore_price DECIMAL(10, 2),
    weighted_price DECIMAL(10, 2),
    sold_price DECIMAL(10, 2),
    comment TEXT,
    image1_path VARCHAR(500),
    image2_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand ON cameras(brand);
CREATE INDEX idx_model ON cameras(model);
CREATE INDEX idx_serial ON cameras(serial);
```

## 4. API Endpoints

### Camera CRUD Operations

#### GET /api/cameras
- Query params: `?search=`, `?brand=`, `?minPrice=`, `?maxPrice=`, `?mechanicalStatus=`, `?cosmeticStatus=`
- Response: Array of camera objects

#### GET /api/cameras/:id
- Response: Single camera object with full details

#### POST /api/cameras
- Body: Camera data (JSON)
- Files: Multipart form data for images
- Response: Created camera object

#### PUT /api/cameras/:id
- Body: Updated camera data (JSON)
- Files: Optional new images
- Response: Updated camera object

#### DELETE /api/cameras/:id
- Response: Success message

### Data Operations

#### GET /api/summary
- Response: `{ totalCameras: number, totalValue: number, averageWeightedPrice: number }`

#### POST /api/import
- Body: CSV file
- Response: Import summary

#### GET /api/export
- Response: CSV file download

## 5. User Interface Components

### 5.1 Main Layout
```
┌──────────────────────────────────────────────┐
│  Camera Collection Manager      [+ Add New]  │
├──────────────────────────────────────────────┤
│  Search: [___________]  Filters: [▼]        │
├──────────────────────────────────────────────┤
│  Collection Value: $12,450                   │
│  Total Cameras: 24                           │
├──────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │ Nikon F2 - #7234567                 │    │
│  │ Mech: ★★★★☆ Cosm: ★★★☆☆            │    │
│  │ Weighted Price: $450                │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ Yashica Electro 35 - #8901234       │    │
│  │ Mech: ★★★☆☆ Cosm: ★★★★☆            │    │
│  │ Weighted Price: $120                │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 5.2 Camera Detail/Edit Form
```
┌──────────────────────────────────────────────┐
│  Edit Camera                          [Save] │
├──────────────────────────────────────────────┤
│  Brand:     [___________]                    │
│  Model:     [___________]                    │
│  Serial:    [___________]                    │
│                                              │
│  Mechanical: ○1 ○2 ○3 ○4 ○5                 │
│  Cosmetic:   ○1 ○2 ○3 ○4 ○5                 │
│                                              │
│  Kamerastore Price: $[____]                  │
│  Weighted Price:    $[____] (auto-calc)      │
│  Sold Price:        $[____]                  │
│                                              │
│  Comments:                                   │
│  [________________________]                  │
│                                              │
│  Images:                                     │
│  [📷 Upload] [📷 Upload]                     │
│                                              │
│  [Cancel] [Delete] [Save]                    │
└──────────────────────────────────────────────┘
```

### 5.3 UI Design Principles
- **Color Scheme**: Neutral grays with subtle accent color
- **Typography**: Clean sans-serif (Inter, Roboto, or system fonts)
- **Spacing**: Generous whitespace for clarity
- **Components**: Card-based layout with subtle shadows
- **Interactions**: Smooth transitions, hover states
- **Status Display**: Star ratings for visual clarity
- **Responsive**: Flexible grid that works on various screen sizes

## 6. Core Functionality Details

### 6.1 Weighted Price Calculation
```javascript
function calculateWeightedPrice(kamerstorePrice, mechanicalStatus, cosmeticStatus) {
    // Average of mechanical and cosmetic status (1-5 scale)
    const avgStatus = (mechanicalStatus + cosmeticStatus) / 2;
    
    // Weight factor: 0.4 for status 1, up to 1.0 for status 5
    const weightFactor = 0.2 + (avgStatus - 1) * 0.2;
    
    return kamerstorePrice * weightFactor;
}
```

### 6.2 Search Implementation
- Real-time search across brand, model, and serial fields
- Debounced input (300ms) to reduce database queries
- Case-insensitive matching

### 6.3 Filter Options
- Brand (dropdown with unique values from database)
- Mechanical Status (1-5 slider or checkboxes)
- Cosmetic Status (1-5 slider or checkboxes)
- Price Range (min/max input fields)
- Sold/Unsold toggle

### 6.4 Image Handling
- Accept JPEG, PNG formats
- Client-side preview before upload
- Resize to max 1200px width while maintaining aspect ratio
- Store in `/uploads/cameras/{id}/` directory
- Unique filename generation to prevent conflicts

## 7. Development Phases

### Phase 1: Setup (Day 1)
- Initialize project structure
- Set up Node.js/Express server
- Configure SQLite database
- Create basic API structure

### Phase 2: Backend (Days 2-3)
- Implement all CRUD endpoints
- Add image upload functionality
- Implement search/filter logic
- Create CSV import/export

### Phase 3: Frontend Structure (Days 4-5)
- Set up React/Vue application
- Configure routing
- Implement state management
- Create base components

### Phase 4: UI Implementation (Days 6-7)
- Build camera list view
- Create add/edit forms
- Implement search/filter UI
- Add summary dashboard

### Phase 5: Integration & Polish (Day 8)
- Connect frontend to backend
- Add error handling
- Implement loading states
- Final UI polish

## 8. File Structure

```
camera-collection-manager/
├── server/
│   ├── index.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Camera.js
│   ├── routes/
│   │   ├── cameras.js
│   │   └── data.js
│   ├── controllers/
│   │   ├── cameraController.js
│   │   └── dataController.js
│   ├── middleware/
│   │   └── upload.js
│   └── database/
│       └── cameras.db
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraList.jsx
│   │   │   ├── CameraCard.jsx
│   │   │   ├── CameraForm.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── Summary.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── uploads/
│   └── cameras/
└── package.json
```

## 9. Environment Variables

```env
# .env file
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database/cameras.db
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

## 10. Testing Considerations

### Manual Testing Checklist
- [ ] Add new camera with all fields
- [ ] Edit existing camera
- [ ] Delete camera
- [ ] Upload images
- [ ] Search by brand/model/serial
- [ ] Apply all filter combinations
- [ ] Import CSV with existing data
- [ ] Export current collection to CSV
- [ ] Verify weighted price calculation
- [ ] Check summary statistics

## 11. Future Enhancements (Post-MVP)

1. **Mobile Responsive Design**: Optimize for tablet/phone viewing
2. **Advanced Reporting**: Repair recommendations, value trends
3. **Batch Operations**: Edit multiple cameras at once
4. **History Tracking**: Log of all changes made
5. **Backup System**: Automated database backups
6. **Print View**: Generate printable collection reports
7. **Lens Management**: Track lens collection separately
8. **Repair Log**: Detailed repair history per camera
9. **Market Price Updates**: Auto-fetch prices from Kamerastore API
10. **Collection Sharing**: Generate shareable read-only links

## 12. Security Considerations

- Input validation on all forms
- SQL injection prevention (use parameterized queries)
- File type validation for image uploads
- Size limits on file uploads
- CORS configuration for production
- Basic authentication (in future versions)

## 13. Performance Optimizations

- Lazy loading for camera list (pagination or infinite scroll)
- Image compression on upload
- Database indexing on frequently searched fields
- Caching for summary statistics
- Debounced search inputs

## 14. Deployment Instructions

1. Clone repository
2. Install dependencies: `npm install` in both /server and /client
3. Initialize database: `npm run migrate`
4. Build frontend: `npm run build` in /client
5. Start server: `npm start` in /server
6. Access at: `http://localhost:3000`

For production deployment, consider using:
- PM2 for process management
- Nginx as reverse proxy
- SSL certificate for HTTPS
- Regular database backups