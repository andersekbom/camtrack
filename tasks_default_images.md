# Default Camera Images System - Implementation Tasks

## Overview
Implementation plan for the Default Camera Images System that automatically provides reference images for cameras without user-uploaded photos.

## Phase 1: Database Foundation

### Task 1.1: Extend Camera Database Schema
**Goal**: Add default image support to database
**Steps**:
1. Add `default_image_url` column to cameras table
2. Add `default_image_source` column for attribution
3. Add `has_user_images` boolean column
4. Run database migration
**Test**: Verify new columns exist and accept data
**Completion Criteria**: Database schema updated, migration successful

### Task 1.2: Create Default Images Reference Table
**Goal**: Create lookup table for model-based default images
**Steps**:
1. Create `default_camera_images` table with columns: id, brand, model, image_url, source, created_at
2. Add unique constraint on brand+model combination
3. Seed table with 5-10 test entries for common camera models
**Test**: Insert, update, query operations work correctly
**Completion Criteria**: Table created, seeded with test data

## Phase 2: Backend API Development

### Task 2.1: Create Default Images API Endpoints
**Goal**: Build REST endpoints for default image management
**Steps**:
1. Create `/api/default-images` GET endpoint to list all default images
2. Create `/api/default-images` POST endpoint to add new default image
3. Create `/api/default-images/:id` PUT endpoint to update default image
4. Create `/api/default-images/:id` DELETE endpoint to remove default image
5. Add validation for required fields and URL format
**Test**: All CRUD operations work via API testing
**Completion Criteria**: All endpoints functional with proper validation

### Task 2.2: Integrate Default Images with Camera API
**Goal**: Update camera endpoints to include default image logic
**Steps**:
1. Modify GET `/api/cameras` to include default_image_url in response
2. Modify GET `/api/cameras/:id` to return appropriate image (user or default)
3. Update camera creation to check for available default images
4. Implement image priority logic (user images override defaults)
**Test**: Camera API returns correct images based on priority
**Completion Criteria**: Camera endpoints properly handle image fallback

### Task 2.3: Build Image Fallback Logic
**Goal**: Implement cascading fallback system
**Steps**:
1. Create utility function `getImageForCamera(camera)`
2. Implement priority: user images → model default → brand default → placeholder
3. Add generic brand placeholder images for major brands (Nikon, Canon, Leica, etc.)
4. Create fallback to generic camera placeholder
**Test**: Fallback logic returns appropriate image for all scenarios
**Completion Criteria**: All cameras return valid image URL

## Phase 3: External Image Integration

### Task 3.1: Research and Document Image Sources
**Goal**: Identify reliable sources for default camera images
**Steps**:
1. Research Wikipedia Commons API for camera images
2. Investigate Camera-wiki.org image availability and usage rights
3. Document image licensing and attribution requirements
4. Create list of 20+ camera models with available images
**Test**: Successfully fetch sample images from each source
**Completion Criteria**: Documentation complete, sample images retrieved

### Task 3.2: Implement Wikipedia Commons Integration
**Goal**: Fetch images from Wikipedia Commons API
**Steps**:
1. Create service class `WikipediaImageService`
2. Implement search by camera brand/model
3. Add image quality filtering (minimum resolution, format validation)
4. Handle API rate limiting and error responses
5. Cache successful lookups to reduce API calls
**Test**: Successfully fetch images for 10+ camera models
**Completion Criteria**: Service retrieves and validates Wikipedia images

### Task 3.3: Build Image Caching System
**Goal**: Store fetched images locally to reduce external API calls
**Steps**:
1. Create `cached_images` directory structure
2. Implement image download and local storage
3. Add cache invalidation logic (30-day expiry)
4. Create cleanup job for expired cached images
5. Update fallback logic to check cache first
**Test**: Images cached locally, cache expiry works correctly
**Completion Criteria**: Local caching operational with proper cleanup

## Phase 4: Batch Processing

### Task 4.1: Create Default Image Population Script
**Goal**: Batch process to populate default images for existing cameras
**Steps**:
1. Create script `populate-default-images.js` in server/scripts/
2. Query all cameras without user images
3. Attempt to find default images for each camera
4. Update camera records with found default images
5. Generate report of successful/failed image assignments
**Test**: Script processes test dataset without errors
**Completion Criteria**: Batch script functional with progress reporting

### Task 4.2: Implement Background Job System
**Goal**: Automatic background processing for new cameras
**Steps**:
1. Create job queue system using simple in-memory queue
2. Add job to queue when new camera is created without images
3. Process jobs to fetch default images asynchronously
4. Add retry logic for failed image fetches
5. Log job results for monitoring
**Test**: Background jobs process correctly, retry failed attempts
**Completion Criteria**: Background processing operational

## Phase 5: Frontend Integration

### Task 5.1: Update Camera Card Components
**Goal**: Display default images in camera cards
**Steps**:
1. Update `CameraCard.jsx` to use image fallback logic
2. Modify image display to show loading state while fetching defaults
3. Add visual indicator when displaying default vs user images
4. Update responsive image sizing for default images
**Test**: Camera cards display appropriate images in grid/list views
**Completion Criteria**: Cards show default images when user images unavailable

### Task 5.2: Update Camera Detail View
**Goal**: Show default images in detailed camera view
**Steps**:
1. Update `CameraDetail.jsx` to display default images
2. Add image source attribution display
3. Show "Add Your Photos" prompt when using default images
4. Update image zoom/lightbox to work with default images
**Test**: Detail view shows default images with proper attribution
**Completion Criteria**: Detail view handles default images correctly

### Task 5.3: Create Admin Interface for Default Images
**Goal**: Allow manual management of default images
**Steps**:
1. Create `DefaultImageManager.jsx` component
2. Add CRUD interface for default image entries
3. Include image preview and source validation
4. Add bulk import functionality for default images
5. Create admin route and navigation menu item
**Test**: Admin can manage default images through UI
**Completion Criteria**: Complete admin interface operational

## Phase 6: Image Attribution & Polish

### Task 6.1: Implement Image Attribution System
**Goal**: Proper crediting of image sources
**Steps**:
1. Add attribution data to all default image records
2. Create `ImageAttribution.jsx` component for credit display
3. Update camera views to show image credits when using defaults
4. Add attribution to exported data and reports
**Test**: Attribution displays correctly across all views
**Completion Criteria**: All default images properly attributed

### Task 6.2: Add Image Quality Validation
**Goal**: Ensure default images meet quality standards
**Steps**:
1. Implement minimum resolution requirements (400x300px)
2. Add image format validation (JPEG, PNG, WebP)
3. Check for appropriate aspect ratios for cameras
4. Add image loading error handling and retry logic
**Test**: Only quality images are accepted and cached
**Completion Criteria**: Quality validation prevents poor images

### Task 6.3: Performance Optimization
**Goal**: Optimize image loading and display performance
**Steps**:
1. Implement lazy loading for default images
2. Add image compression for cached images
3. Create responsive image sizes (thumbnail, medium, large)
4. Add preloading for commonly viewed camera models
**Test**: Image loading is smooth and performant
**Completion Criteria**: Optimized performance across all views

## Phase 7: Testing & Documentation

### Task 7.1: Comprehensive Testing Suite
**Goal**: Ensure system reliability and edge case handling
**Steps**:
1. Write unit tests for image fallback logic
2. Create integration tests for API endpoints
3. Add tests for external API integration and error handling
4. Test batch processing and background jobs
5. Add frontend component tests for image display
**Test**: All tests pass, coverage > 80%
**Completion Criteria**: Complete test suite with good coverage

### Task 7.2: Error Handling & Edge Cases
**Goal**: Handle all failure scenarios gracefully
**Steps**:
1. Handle external API failures and timeouts
2. Manage missing images and broken URLs
3. Add fallback for network connectivity issues
4. Handle malformed or corrupt image files
5. Test system behavior with large datasets
**Test**: System handles all error conditions gracefully
**Completion Criteria**: Robust error handling implemented

### Task 7.3: Documentation & User Guide
**Goal**: Document the default images system
**Steps**:
1. Update CLAUDE.md with default images system overview
2. Create user documentation for image attribution
3. Document API endpoints for default images
4. Add troubleshooting guide for common issues
5. Update development setup instructions
**Test**: Documentation is complete and accurate
**Completion Criteria**: All documentation updated

## Success Criteria

### Functional Requirements
- ✅ Default images automatically assigned to cameras without user photos
- ✅ Image priority system (user > default > placeholder) working
- ✅ External image sources integrated with proper attribution
- ✅ Admin interface for managing default images
- ✅ Background processing for new cameras

### Performance Requirements
- ✅ Image loading time < 2 seconds for cached images
- ✅ External API calls limited with proper caching
- ✅ No impact on existing camera management performance
- ✅ Graceful degradation when external sources unavailable

### Quality Requirements
- ✅ All default images properly attributed to sources
- ✅ Only quality images (min 400x300px) accepted
- ✅ Error handling for all failure scenarios
- ✅ Comprehensive test coverage (>80%)
- ✅ Complete documentation

## Estimated Timeline
- **Phase 1-2**: 2 days (Database + Backend API)
- **Phase 3**: 3 days (External Integration + Caching)
- **Phase 4**: 1 day (Batch Processing)
- **Phase 5**: 2 days (Frontend Integration)
- **Phase 6**: 1 day (Attribution + Polish)
- **Phase 7**: 1 day (Testing + Documentation)

**Total Estimated Time**: 10 days