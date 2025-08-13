# CLAUDE.md

**CamTracker Deluxe** - Web application for managing vintage analog camera collections with React frontend, Node.js/Express backend, and SQLite database.

## Architecture

**Tech Stack**: React 18 + Vite + Tailwind CSS, Node.js + Express, SQLite, Multer (uploads)

**Structure**:
```
server/     # Node.js backend (models, routes, controllers, middleware)
client/     # React frontend (components, services)  
uploads/    # Image storage (cameras, default-images, placeholders)
docs/       # User documentation
```

## Development

**Backend**: `npm start` (server/) - Port 3000
**Frontend**: `npm run dev` (client/) - Port 5173/5174
**Database**: `npm run init-db` (server/) - Initialize SQLite

## Key Features

- **Camera Management**: Full CRUD with image uploads (1-2 per camera)
- **Default Images System**: Auto-fetch from Wikipedia + manual replacement via file upload
- **Search & Filtering**: Real-time search, brand filtering, condition/price ranges
- **Dual Layouts**: Grid (1-5 columns) / List view with persistent preferences
- **Data Import/Export**: CSV with validation and error reporting
- **Analytics**: Collection statistics and value summaries
- **Professional UI**: Dark mode, responsive design, smooth animations
- **Documentation System**: Formatted markdown docs with consistent styling

## API Design

RESTful at `/api/cameras` with full CRUD + search/filter support
Additional endpoints: `/api/default-images`, `/api/jobs`, `/api/help`

## Current Status

**Production Ready** - Complete MVP with professional UI, comprehensive features, and thorough testing. All major functionality implemented including latest enhancements:

- ✅ File upload system for default image replacement
- ✅ Inline form UX for image management  
- ✅ Git storage for multi-location deployment
- ✅ Formatted documentation system with consistent styling
- ✅ Modal navigation without blocking issues

## Development Guidelines

- **Components**: Follow existing patterns (dark mode support, error handling, loading states)
- **Styling**: Use Tailwind CSS with consistent spacing and responsive design
- **Git**: Track all images and documentation for deployment portability
- **Testing**: Manual verification across features and responsive breakpoints

## Quick Start

1. `cd server && npm start`
2. `cd client && npm run dev` 
3. Navigate to `http://localhost:5173` or `http://localhost:5174`
- Make sure to back up the database whenever working on camera management tasks such as troubleshooting API endpoints or adding updating/deleting features.