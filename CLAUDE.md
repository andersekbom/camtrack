# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Camera Collection Manager - A web application for managing vintage analog camera collections with condition tracking and market value monitoring. The application uses a React frontend with a Node.js/Express backend and SQLite database.

## Architecture

### Technology Stack
- **Frontend**: React with Vite, Tailwind CSS for styling
- **Backend**: Node.js with Express.js
- **Database**: SQLite with better-sqlite3
- **File Storage**: Local filesystem for camera images
- **Key Libraries**: axios (HTTP client), multer (file uploads), json2csv/csv-parser (data import/export)

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
│   │   ├── components/  # React components
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

## Key Implementation Details

### Database Schema
The `cameras` table includes fields for brand, model, serial, condition ratings (mechanical_status, cosmetic_status 1-5), pricing (kamerastore_price, weighted_price, sold_price), and image paths. The weighted_price is auto-calculated using the formula:
```
weighted_price = kamerastore_price * (0.2 + ((mechanical_status + cosmetic_status) / 2 - 1) * 0.2)
```

### API Design
RESTful API at `/api/cameras` with full CRUD operations. Search and filtering via query parameters. File uploads handled through multipart form data. CSV import/export endpoints at `/api/import` and `/api/export`.

### Data Import
The application supports CSV import matching the format in `cameras.csv`: Brand, Model, Serial, Mechanical, Cosmetic, Kamerastore, Weighted Price, Sold Price, Comment.

### Image Handling
Support for 1-2 images per camera, stored in `/uploads/cameras/` with UUID-based filenames. File size limited to 5MB, JPEG/PNG only.

## Development Phases

The project follows a 10-phase development approach detailed in `tasks.md`:
1. Project Setup & Backend Foundation
2. Core API Endpoints
3. Frontend Foundation
4. CRUD UI Implementation
5. Search & Filter Functionality
6. Image Handling
7. Data Import/Export
8. Summary & Statistics
9. UI Polish & Enhancement
10. Final Testing & Refinement

Each phase should be completed fully before moving to the next, with testing after each task.

## Testing Strategy

Use Postman or curl for API testing during backend development. Frontend testing involves manual verification of UI functionality. The application is designed for personal use, so no authentication is implemented.