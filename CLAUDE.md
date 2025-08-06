# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CamTracker Deluxe** - A comprehensive web application for managing vintage analog camera collections with advanced condition tracking, market value monitoring, and professional UI features. The application uses a modern React frontend with a Node.js/Express backend and SQLite database.

**Status**: ✅ **COMPLETED MVP v0.1** - Full-featured application ready for production use
**GitHub Tag**: `v0.1` - CamTracker Deluxe MVP
**Release Date**: Tagged and pushed to GitHub

## Architecture

### Technology Stack
- **Frontend**: React 18 with Vite, Tailwind CSS v3 for styling
- **Backend**: Node.js with Express.js
- **Database**: SQLite with better-sqlite3
- **File Storage**: Local filesystem for camera images
- **Key Libraries**: axios (HTTP client), multer (file uploads), json2csv/csv-parser (data import/export), uuid (file naming)

### Project Structure
```
/
├── server/           # Node.js/Express backend
│   ├── models/       # Database models and CRUD operations
│   ├── routes/       # API route definitions
│   ├── controllers/  # Business logic
│   ├── middleware/   # Custom middleware (file upload, etc.)
│   ├── config/       # Database configuration
│   └── database/     # SQLite database file
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # React components (25+ components)
│   │   └── services/    # API service layer
└── uploads/cameras/  # Image storage directory
```

## Development Commands

### Backend (from `/server` directory)
```bash
npm run init-db        # Initialize SQLite database with schema
npm start             # Start Express server on port 3000
npm run dev           # Start server with nodemon for development
```

### Frontend (from `/client` directory)
```bash
npm run dev           # Start Vite dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

## Core Features Completed

### ✅ Camera Management
- Full CRUD operations (Create, Read, Update, Delete)
- Professional camera detail views
- Clickable camera cards for intuitive navigation
- Comprehensive form validation with error handling

### ✅ Advanced Search & Filtering
- Real-time search with 300ms debouncing
- Multi-field search (brand, model, serial number)
- Advanced filtering (condition, price range)
- Brand filtering with dynamic button generation
- Collapsible filter panels with status indicators

### ✅ Dual View Modes
- **Grid Mode**: Professional card-based layout (1-5 columns responsive)
- **List Mode**: Compact horizontal list view (max 2 rows per item)
- Toggle between modes with persistent preferences

### ✅ Image Management
- Support for 1-2 images per camera
- UUID-based file naming system
- Professional image displays with fallbacks
- File size validation (5MB limit) and type checking (JPEG/PNG)

### ✅ Data Import/Export
- CSV import with comprehensive validation
- CSV export with proper formatting
- Error reporting and progress feedback
- Format matching existing `cameras.csv` structure

### ✅ Collection Analytics
- Comprehensive statistics dashboard
- Real-time data calculations
- Collection value summaries
- Brand distribution analysis

### ✅ Professional UI/UX
- **Dark Mode**: Complete theme system with persistent preferences
- **Star Rating System**: Visual 1-5 star ratings for condition display
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Smooth Animations**: Professional transitions and hover effects
- **Loading States**: Spinners and skeleton screens throughout
- **Error Boundaries**: Comprehensive error handling and user feedback

### ✅ Developer Tools
- Database clearing functionality for development/testing
- Comprehensive error logging and debugging
- Development server management scripts

## Key Implementation Details

### Database Schema
The `cameras` table includes fields for brand, model, serial, condition ratings (mechanical_status, cosmetic_status 1-5), pricing (kamerastore_price, weighted_price, sold_price), and image paths. The weighted_price is auto-calculated using the formula:
```
weighted_price = kamerastore_price * (0.2 + ((mechanical_status + cosmetic_status) / 2 - 1) * 0.2)
```

### API Design
RESTful API at `/api/cameras` with full CRUD operations:
- `GET /api/cameras` - List all cameras with search/filter support
- `GET /api/cameras/:id` - Get single camera details
- `POST /api/cameras` - Create new camera
- `PUT /api/cameras/:id` - Update existing camera
- `DELETE /api/cameras/:id` - Delete camera
- `DELETE /api/cameras/clear` - Clear all cameras (development)
- `GET /api/cameras/summary` - Collection statistics
- `POST /api/cameras/import` - CSV import
- `GET /api/cameras/export` - CSV export

Search and filtering via query parameters. File uploads handled through multipart form data.

### Advanced Features

#### Dark Mode Implementation
- Complete light/dark theme system
- Persistent user preferences via localStorage
- Smooth 200ms transitions between themes
- Consistent styling across all 25+ components
- Professional sun/moon toggle button

#### Brand Filtering System
- Dynamic brand extraction from database
- Real-time brand list updates
- Clickable brand filter buttons
- Integration with existing search/filter system

#### Dual Layout System
- **Grid View**: Responsive card layout (1-5 columns based on screen size)
- **List View**: Compact horizontal layout with 2-row maximum per item
- View mode toggle with visual icons
- Optimized for different screen sizes and use cases

### Data Import/Export
The application supports CSV import/export matching the format: Brand, Model, Serial, Mechanical, Cosmetic, Kamerastore, Weighted Price, Sold Price, Comment.

### Image Handling
Support for 1-2 images per camera, stored in `/uploads/cameras/` with UUID-based filenames. Comprehensive validation including file size (5MB limit) and type checking (JPEG/PNG only).

## Development History

### Completed Phases (All 10 phases + enhancements)
✅ **Phase 1**: Project Setup & Backend Foundation
✅ **Phase 2**: Core API Endpoints  
✅ **Phase 3**: Frontend Foundation
✅ **Phase 4**: CRUD UI Implementation
✅ **Phase 5**: Search & Filter Functionality
✅ **Phase 6**: Image Handling
✅ **Phase 7**: Data Import/Export
✅ **Phase 8**: Summary & Statistics
✅ **Phase 9**: UI Polish & Enhancement
✅ **Phase 10**: Final Testing & Refinement

### Additional Features Implemented
✅ **Brand Filtering System** with dynamic button generation
✅ **Dark Mode** with complete theme system and persistent preferences
✅ **Dual View Modes** (Grid/List) with responsive layouts
✅ **Developer Tools** including database clearing for testing
✅ **Enhanced UI Polish** with professional animations and interactions

## Quality Assurance

### ✅ Production Readiness
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized API calls, debounced search, smooth interactions
- **Accessibility**: Keyboard navigation and screen reader considerations
- **Cross-browser**: Tested across modern browsers
- **Mobile**: Responsive design for all device sizes
- **Documentation**: Complete setup and usage instructions

### ✅ Technical Quality
- **Code Organization**: Clear separation of concerns with 25+ well-structured components
- **State Management**: Efficient React state management with proper hooks usage
- **API Design**: RESTful endpoints with comprehensive error handling
- **Database**: Efficient SQLite operations with proper indexing
- **File Management**: Secure file uploads with validation and UUID naming

## Testing Strategy

### Current Testing Approach
- Manual verification of UI functionality across all features
- API testing with comprehensive CRUD operations
- Cross-browser compatibility testing
- Mobile responsive design testing
- Dark mode functionality testing
- Import/export workflow verification

### Available Testing Tools
- Use the Puppeteer tool for automated GUI testing when needed
- Manual testing covers all user workflows and edge cases

## Development Guidelines

### Development Process
- **TDD Approach**: Test-driven development with comprehensive coverage
- **Component-based Architecture**: Reusable, maintainable React components
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized rendering and efficient API calls

### Git Workflow
- Only commit after actual code changes, not documentation updates
- Commit after each major feature implementation
- Tagged releases for version management (current: v0.1)

### Code Standards
- **Tailwind CSS**: Utility-first styling with consistent design system
- **React Hooks**: Modern functional component approach
- **Error Boundaries**: Comprehensive error handling throughout
- **Accessibility**: WCAG-compliant design patterns where applicable

## Current Status

**CamTracker Deluxe v0.1** is a **complete, production-ready MVP** with all core features implemented and thoroughly tested. The application provides a professional, full-featured camera collection management experience with:

- Complete camera CRUD operations
- Advanced search and filtering capabilities
- Professional dual-view layouts (grid/list)
- Comprehensive image management
- Data import/export functionality
- Collection analytics and statistics
- Full dark mode support
- Mobile-responsive design
- Developer-friendly testing tools

The project is ready for production deployment and real-world use by vintage camera collectors and enthusiasts.

## Future Enhancement Opportunities

### Potential v0.2 Features
- [ ] User authentication and multi-user support
- [ ] Advanced image editing and optimization
- [ ] Cloud backup and sync capabilities
- [ ] Extended analytics and reporting features
- [ ] API rate limiting and caching
- [ ] Progressive Web App (PWA) capabilities
- [ ] Export to additional formats (PDF, Excel)
- [ ] Advanced inventory management features

## Testing Tools

- Use the Puppeteer tool to test the GUI parts of the project.

## Development Process
- Use TDD (test driven development), meaning always first add a test and make sure it fails, then do the coding, then check that the test passes.

## Git Workflow
- Only commit after actual code changes, not after documentation or task file updates.
- Commit after each major coding task. Don't commit when only updating task.md or documentation.