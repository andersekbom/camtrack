-- Migration: Create default camera images reference table
-- Date: 2025-01-06
-- Description: Creates lookup table for model-based default images

-- Create default camera images lookup table
CREATE TABLE IF NOT EXISTS default_camera_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    source VARCHAR(200) NOT NULL,
    source_attribution TEXT,
    image_quality INTEGER DEFAULT 5 CHECK(image_quality >= 1 AND image_quality <= 10),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, model)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_default_brand ON default_camera_images(brand);
CREATE INDEX IF NOT EXISTS idx_default_model ON default_camera_images(model);
CREATE INDEX IF NOT EXISTS idx_default_brand_model ON default_camera_images(brand, model);
CREATE INDEX IF NOT EXISTS idx_default_active ON default_camera_images(is_active);

-- Create generic brand default images table for fallback
CREATE TABLE IF NOT EXISTS brand_default_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(500) NOT NULL,
    source VARCHAR(200) NOT NULL,
    source_attribution TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for brand defaults
CREATE INDEX IF NOT EXISTS idx_brand_default_active ON brand_default_images(is_active);