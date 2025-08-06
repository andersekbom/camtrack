-- Migration: Add default image support to cameras table
-- Date: 2025-01-06
-- Description: Extends cameras table with default image functionality

-- Add default image columns to cameras table
ALTER TABLE cameras ADD COLUMN default_image_url VARCHAR(500);
ALTER TABLE cameras ADD COLUMN default_image_source VARCHAR(200);
ALTER TABLE cameras ADD COLUMN has_user_images BOOLEAN DEFAULT 0;

-- Update existing records to set has_user_images based on existing image paths
UPDATE cameras SET has_user_images = 1 WHERE image1_path IS NOT NULL OR image2_path IS NOT NULL;

-- Add index for performance on queries filtering by has_user_images
CREATE INDEX IF NOT EXISTS idx_has_user_images ON cameras(has_user_images);