# Camera Collection Manager - Development Tasks

## Phase 1: Project Setup and Basic Backend (Get it Running)

### 1.1 Project Initialization
- [ ] Create root project directory `camera-collection-manager`
- [ ] Initialize git repository with `.gitignore` for Node.js
- [ ] Create `server` and `client` subdirectories
- [ ] Create `uploads/cameras` directory structure
- [ ] **Test**: Verify folder structure is created correctly

### 1.2 Backend Setup
- [ ] Navigate to `server` directory and run `npm init -y`
- [ ] Install core dependencies: `express`, `cors`, `dotenv`
- [ ] Install database dependencies: `sqlite3`, `better-sqlite3`
- [ ] Install file handling: `multer`, `uuid`
- [ ] Create basic `index.js` with Express server on port 3000
- [ ] Add basic health check endpoint `GET /api/health`
- [ ] **Test**: Start server and verify health endpoint returns `{ status: "ok" }`

### 1.3 Database Setup
- [ ] Create `config/database.js` with SQLite connection setup
- [ ] Create `database` folder in server directory
- [ ] Write SQL schema for cameras table in `schema.sql` file
- [ ] Create database initialization script that runs schema
- [ ] Add npm script `"init-db": "node scripts/initDb.js"`
- [ ] **Test**: Run init-db script and verify `cameras.db` file is created

### 1.4 Basic Camera Model
- [ ] Create `models/Camera.js` with basic CRUD functions using raw SQL
- [ ] Implement `getAllCameras()` function
- [ ] Implement `getCameraById(id)` function
- [ ] Implement `createCamera(data)` function
- [ ] Implement `updateCamera(id, data)` function
- [ ] Implement `deleteCamera(id)` function
- [ ] **Test**: Use a database viewer to verify table structure

## Phase 2: Core API Endpoints (Make it Functional)

### 2.1 Camera Routes Setup
- [ ] Create `routes/cameras.js` with Express router
- [ ] Create `controllers/cameraController.js` for business logic
- [ ] Connect routes to controller functions
- [ ] Mount camera routes in main `index.js` at `/api/cameras`
- [ ] **Test**: Verify router is mounted (should return 404 for now)

### 2.2 GET Endpoints
- [ ] Implement `GET /api/cameras` to return all cameras
- [ ] Add error handling with try-catch blocks
- [ ] Implement `GET /api/cameras/:id` to return single camera
- [ ] Add 404 handling for non-existent camera IDs
- [ ] **Test**: Use Postman/curl to verify both endpoints work with empty database

### 2.3 POST Endpoint
- [ ] Implement `POST /api/cameras` to create new camera
- [ ] Add request body validation for required fields
- [ ] Calculate weighted_price automatically based on formula
- [ ] Return created camera with generated ID
- [ ] **Test**: Create a camera via Postman and verify it appears in GET request

### 2.4 PUT Endpoint
- [ ] Implement `PUT /api/cameras/:id` to update camera
- [ ] Recalculate weighted_price on update
- [ ] Handle partial updates (only update provided fields)
- [ ] Return updated camera data
- [ ] **Test**: Update a camera and verify changes persist

### 2.5 DELETE Endpoint
- [ ] Implement `DELETE /api/cameras/:id` to remove camera
- [ ] Return success message with deleted camera ID
- [ ] Handle deletion of non-existent cameras gracefully
- [ ] **Test**: Delete a camera and verify it's removed from database

## Phase 3: Frontend Foundation (Make it Visible)

### 3.1 Frontend Setup
- [ ] Navigate to `client` directory and create React app with Vite
- [ ] Install dependencies: `axios`, `react-router-dom`
- [ ] Install Tailwind CSS and configure it
- [ ] Clean up default Vite template files
- [ ] Create basic App component with "Camera Collection" header
- [ ] **Test**: Run dev server and see the header displayed

### 3.2 API Service Layer
- [ ] Create `services/api.js` with axios instance
- [ ] Set base URL to `http://localhost:3000/api`
- [ ] Create `getCameras()` function
- [ ] Create `getCamera(id)` function
- [ ] Create `createCamera(data)` function
- [ ] Create `updateCamera(id, data)` function
- [ ] Create `deleteCamera(id)` function
- [ ] **Test**: Import and call getCameras() in console to verify connection

### 3.3 Camera List Component
- [ ] Create `components/CameraList.jsx` component
- [ ] Fetch cameras on component mount using useEffect
- [ ] Display loading state while fetching
- [ ] Show basic list of cameras (just brand and model)
- [ ] Handle empty state with "No cameras yet" message
- [ ] **Test**: Add a camera via Postman and see it appear in the list

### 3.4 Camera Card Component
- [ ] Create `components/CameraCard.jsx` component
- [ ] Display brand, model, and serial number
- [ ] Show mechanical and cosmetic status as numbers (1-5)
- [ ] Display weighted price formatted as currency
- [ ] Add basic card styling with Tailwind
- [ ] **Test**: Verify each camera displays as a styled card

## Phase 4: CRUD UI (Make it Interactive)

### 4.1 Add Camera Form
- [ ] Create `components/CameraForm.jsx` component
- [ ] Add input fields for brand, model, serial
- [ ] Add number inputs for mechanical_status (1-5)
- [ ] Add number inputs for cosmetic_status (1-5)
- [ ] Add input for kamerastore_price
- [ ] Add textarea for comments
- [ ] **Test**: Fill out form and verify all inputs work

### 4.2 Create Functionality
- [ ] Add submit handler to CameraForm
- [ ] Call createCamera API on form submission
- [ ] Show success message on successful creation
- [ ] Clear form after successful submission
- [ ] Refresh camera list after adding new camera
- [ ] **Test**: Add a new camera and verify it appears in the list immediately

### 4.3 Edit Mode
- [ ] Add "Edit" button to each CameraCard
- [ ] Create edit mode state in CameraCard
- [ ] Show CameraForm pre-filled when in edit mode
- [ ] Implement update functionality on form submission
- [ ] Exit edit mode after successful update
- [ ] **Test**: Edit a camera and verify changes are saved

### 4.4 Delete Functionality
- [ ] Add "Delete" button to each CameraCard
- [ ] Add confirmation dialog before deletion
- [ ] Call deleteCamera API on confirmation
- [ ] Remove camera from list after successful deletion
- [ ] Show success message after deletion
- [ ] **Test**: Delete a camera and verify it's removed from the list

## Phase 5: Search and Filter (Make it Searchable)

### 5.1 Search Backend
- [ ] Add search query parameter to `GET /api/cameras`
- [ ] Implement SQL LIKE search for brand, model, serial
- [ ] Make search case-insensitive
- [ ] Return filtered results based on search term
- [ ] **Test**: Test search endpoint with Postman using various search terms

### 5.2 Search UI Component
- [ ] Create `components/SearchBar.jsx` component
- [ ] Add text input with search icon
- [ ] Implement controlled input with useState
- [ ] Add debouncing (300ms) to reduce API calls
- [ ] Update camera list based on search results
- [ ] **Test**: Search for a camera brand and verify filtering works

### 5.3 Filter Backend
- [ ] Add filter parameters to `GET /api/cameras` (mechanicalStatus, cosmeticStatus)
- [ ] Add price range filters (minPrice, maxPrice)
- [ ] Combine multiple filters with AND logic
- [ ] Handle filters together with search
- [ ] **Test**: Test various filter combinations via Postman

### 5.4 Filter UI Component
- [ ] Create `components/FilterPanel.jsx` component
- [ ] Add mechanical status filter (checkboxes 1-5)
- [ ] Add cosmetic status filter (checkboxes 1-5)
- [ ] Add price range inputs (min and max)
- [ ] Apply filters on change
- [ ] **Test**: Apply different filters and verify results update

## Phase 6: Image Handling (Make it Visual)

### 6.1 Image Upload Backend
- [ ] Configure multer for file uploads in `middleware/upload.js`
- [ ] Set destination to `uploads/cameras/`
- [ ] Limit file size to 5MB
- [ ] Accept only JPEG and PNG files
- [ ] Generate unique filenames using UUID
- [ ] **Test**: Test file upload endpoint with Postman

### 6.2 Update Camera Endpoints for Images
- [ ] Modify POST `/api/cameras` to handle image uploads
- [ ] Store image paths in database (image1_path, image2_path)
- [ ] Modify PUT `/api/cameras/:id` to handle image updates
- [ ] Add static file serving for uploads directory
- [ ] **Test**: Upload images and verify URLs are accessible

### 6.3 Image Upload UI
- [ ] Add file input fields to CameraForm (max 2 images)
- [ ] Show image preview before upload
- [ ] Display upload progress/status
- [ ] Handle file size and type validation on frontend
- [ ] **Test**: Upload images when creating/editing camera

### 6.4 Image Display
- [ ] Update CameraCard to display camera images
- [ ] Add placeholder image when no image exists
- [ ] Make images clickable for larger view
- [ ] Handle loading states for images
- [ ] **Test**: Verify images display correctly in camera cards

## Phase 7: Data Import/Export (Make it Portable)

### 7.1 CSV Export Backend
- [ ] Install `json2csv` package
- [ ] Create `GET /api/export` endpoint
- [ ] Convert camera data to CSV format
- [ ] Set appropriate headers for file download
- [ ] **Test**: Call export endpoint and verify CSV downloads

### 7.2 CSV Import Backend
- [ ] Install `csv-parser` package
- [ ] Create `POST /api/import` endpoint
- [ ] Parse uploaded CSV file
- [ ] Validate CSV structure and data
- [ ] Bulk insert cameras from CSV
- [ ] Return import summary (success/failed count)
- [ ] **Test**: Import a sample CSV and verify cameras are created

### 7.3 Import/Export UI
- [ ] Add "Export to CSV" button to main page
- [ ] Implement CSV download on button click
- [ ] Add "Import CSV" button with file input
- [ ] Show import progress and results
- [ ] Display error messages for failed imports
- [ ] **Test**: Export current data and re-import it

## Phase 8: Summary and Statistics (Make it Informative)

### 8.1 Summary Endpoint
- [ ] Create `GET /api/summary` endpoint
- [ ] Calculate total number of cameras
- [ ] Calculate total collection value (sum of weighted prices)
- [ ] Calculate average weighted price
- [ ] Return summary as JSON
- [ ] **Test**: Verify calculations are correct via Postman

### 8.2 Summary Dashboard Component
- [ ] Create `components/Summary.jsx` component
- [ ] Fetch summary data on mount
- [ ] Display total cameras count
- [ ] Display total collection value
- [ ] Format currency values properly
- [ ] Style with card layout
- [ ] **Test**: Add/remove cameras and verify summary updates

## Phase 9: UI Polish (Make it Beautiful)

### 9.1 Status Display Enhancement
- [ ] Create star rating component for status display
- [ ] Replace number inputs with clickable star ratings
- [ ] Add visual feedback on hover
- [ ] Use filled/empty stars to show rating
- [ ] **Test**: Verify star ratings work for input and display

### 9.2 Responsive Layout
- [ ] Add responsive grid for camera cards
- [ ] Make form layouts mobile-friendly
- [ ] Adjust navigation for smaller screens
- [ ] Test on various screen sizes
- [ ] **Test**: Resize browser and verify layout adapts

### 9.3 Loading States and Transitions
- [ ] Add loading spinner component
- [ ] Show loading state while fetching data
- [ ] Add smooth transitions for card appearances
- [ ] Implement skeleton loading for camera cards
- [ ] Add fade transitions for form changes
- [ ] **Test**: Verify smooth transitions throughout the app

### 9.4 Error Handling UI
- [ ] Create error message component
- [ ] Display user-friendly error messages
- [ ] Add retry buttons where appropriate
- [ ] Handle network errors gracefully
- [ ] Add form validation error displays
- [ ] **Test**: Disconnect backend and verify error messages appear

## Phase 10: Final Testing and Refinement

### 10.1 Data Validation
- [ ] Add frontend validation for all form fields
- [ ] Validate status values are between 1-5
- [ ] Validate price inputs are positive numbers
- [ ] Add required field indicators
- [ ] **Test**: Try submitting invalid data and verify validation works

### 10.2 Performance Optimization
- [ ] Add pagination or lazy loading for large camera lists
- [ ] Optimize image loading with lazy loading
- [ ] Add image compression on upload
- [ ] Implement debouncing for all search/filter inputs
- [ ] **Test**: Add 50+ cameras and verify performance remains good

### 10.3 Cross-browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Fix any browser-specific issues
- [ ] **Test**: Verify all features work across browsers

### 10.4 Documentation
- [ ] Create README.md with setup instructions
- [ ] Document all API endpoints
- [ ] Add example CSV format for import
- [ ] Include troubleshooting section
- [ ] Add screenshots of the application
- [ ] **Test**: Follow your own setup instructions on a clean machine

## Completion Checklist

### Core Functionality
- [ ] Can create new cameras with all fields
- [ ] Can view list of all cameras
- [ ] Can edit existing cameras
- [ ] Can delete cameras
- [ ] Can search cameras by brand/model/serial
- [ ] Can filter by status and price
- [ ] Can upload and view images
- [ ] Can import cameras from CSV
- [ ] Can export cameras to CSV
- [ ] Shows collection summary statistics

### Quality Checks
- [ ] No console errors in normal operation
- [ ] All API endpoints have error handling
- [ ] UI provides feedback for all actions
- [ ] Form validation prevents invalid data
- [ ] Application is visually consistent
- [ ] Code is organized and maintainable

## Notes for the Coding LLM

1. **Start with Phase 1-2** to get a working backend that can be tested with Postman
2. **Phase 3-4** creates a minimal but functional UI
3. **Complete each phase fully** before moving to the next
4. **Test each task** as indicated before marking it complete
5. **Weighted price formula**: `weighted_price = kamerastore_price * (0.2 + ((mechanical_status + cosmetic_status) / 2 - 1) * 0.2)`
6. **Use console.log** liberally during development for debugging
7. **Commit after each phase** for easy rollback if needed
8. **Skip authentication** - this is a personal use application
9. **Keep the UI simple** - functionality over fancy features
10. **If stuck**, implement a simpler version first, then enhance