# Image Storage Structure

This document describes how CamTracker Deluxe stores and manages images.

## Directory Structure

```
uploads/
├── cameras/           # Individual camera images uploaded by users
│   ├── .gitkeep
│   └── [uuid].jpg     # User-uploaded camera photos (1-2 per camera)
├── default-images/    # Default model images (manual uploads)
│   ├── .gitkeep
│   └── [uuid].jpg     # Manual replacement default images
└── placeholders/      # Brand logos and fallback images
    ├── camera-placeholder.svg
    ├── canon-logo.svg
    ├── leica-logo.svg
    └── nikon-logo.svg

server/cached_images/  # Automatically downloaded default images
├── [hash].jpg         # Wikipedia Commons images (auto-downloaded)
└── [hash].png         # Cached external images
```

## Image Types

### 1. **Individual Camera Images** (`/uploads/cameras/`)
- **Purpose**: User-uploaded photos of specific camera instances
- **Source**: Manual upload via camera forms
- **Naming**: UUID-based filenames (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`)
- **Limit**: 1-2 images per camera
- **Git Tracking**: ✅ Included in repository

### 2. **Default Model Images** (`/uploads/default-images/`)
- **Purpose**: Manually uploaded replacement images for camera models
- **Source**: Manual upload via Default Images Admin
- **Naming**: UUID-based filenames
- **Usage**: Replaces automatically downloaded defaults
- **Git Tracking**: ✅ Included in repository

### 3. **Cached Default Images** (`/server/cached_images/`)
- **Purpose**: Automatically downloaded images from Wikipedia Commons
- **Source**: Automatic background job system
- **Naming**: Hash-based filenames for caching
- **Usage**: Default fallback images for camera models
- **Git Tracking**: ✅ Included in repository

### 4. **Placeholder Images** (`/uploads/placeholders/`)
- **Purpose**: Brand logos and fallback graphics
- **Source**: Pre-designed SVG graphics
- **Usage**: Fallback when no model-specific image exists
- **Git Tracking**: ✅ Included in repository

## Image Fallback Chain

When displaying a camera image, the system follows this priority:

1. **User-uploaded images** (`/uploads/cameras/`)
2. **Manual default images** (`/uploads/default-images/`)
3. **Cached Wikipedia images** (`/server/cached_images/`)
4. **Brand logo placeholders** (`/uploads/placeholders/`)
5. **Generic camera placeholder** (`/uploads/placeholders/camera-placeholder.svg`)

## File Management

### File Size Limits
- **Individual cameras**: 5MB per image, max 2 images
- **Default images**: 5MB per image, 1 image per model

### Supported Formats
- **JPEG** (`.jpg`, `.jpeg`)
- **PNG** (`.png`)

### File Naming
- **User uploads**: UUID v4 + original extension
- **Cached images**: SHA-256 hash + extension
- **Placeholders**: Descriptive names

## Git Configuration

The `.gitignore` is configured to:
- ✅ **Include** all image directories and their contents
- ❌ **Exclude** temporary files (`*.tmp`, `*.temp`)
- ❌ **Exclude** cache directories (`uploads/cache/`, `uploads/temp/`)

This ensures that:
1. The application works immediately after cloning
2. All images are preserved across deployments
3. No temporary or cache files clutter the repository

## Development Notes

- **Directory Creation**: Image directories are auto-created by middleware
- **Permissions**: Ensure write permissions on upload directories
- **Backup**: All images are version-controlled with Git
- **Performance**: Images are served statically with caching headers