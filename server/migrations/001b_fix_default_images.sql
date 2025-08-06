-- Migration Fix: Complete default image support
-- Date: 2025-01-06
-- Description: Fix missing default_image_url column and add missing index

-- Add the missing default_image_url column
ALTER TABLE cameras ADD COLUMN default_image_url VARCHAR(500);

-- Update existing records to set has_user_images based on existing image paths
UPDATE cameras SET has_user_images = 1 WHERE image1_path IS NOT NULL OR image2_path IS NOT NULL;

-- Add index for performance on queries filtering by has_user_images
CREATE INDEX IF NOT EXISTS idx_has_user_images ON cameras(has_user_images);