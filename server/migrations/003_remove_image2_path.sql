-- Migration 003: Remove image2_path column and optimize for single user image
-- This migration removes the ability to store a second user image per camera

BEGIN TRANSACTION;

-- First, back up any image2_path data to a temporary table for safety
CREATE TEMPORARY TABLE image2_backup AS
SELECT id, image2_path 
FROM cameras 
WHERE image2_path IS NOT NULL;

-- Update has_user_images flag to only consider image1_path
UPDATE cameras 
SET has_user_images = CASE 
    WHEN image1_path IS NOT NULL THEN 1 
    ELSE 0 
END;

-- Create new cameras table without image2_path
CREATE TABLE cameras_new (
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
    default_image_url VARCHAR(500),
    default_image_source VARCHAR(200),
    has_user_images BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table (excluding image2_path)
INSERT INTO cameras_new (
    id, brand, model, serial, mechanical_status, cosmetic_status,
    kamerastore_price, weighted_price, sold_price, comment,
    image1_path, default_image_url, default_image_source, has_user_images,
    created_at, updated_at
)
SELECT 
    id, brand, model, serial, mechanical_status, cosmetic_status,
    kamerastore_price, weighted_price, sold_price, comment,
    image1_path, default_image_url, default_image_source, has_user_images,
    created_at, updated_at
FROM cameras;

-- Drop the old table
DROP TABLE cameras;

-- Rename the new table
ALTER TABLE cameras_new RENAME TO cameras;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_brand ON cameras(brand);
CREATE INDEX IF NOT EXISTS idx_model ON cameras(model);
CREATE INDEX IF NOT EXISTS idx_serial ON cameras(serial);
CREATE INDEX IF NOT EXISTS idx_has_user_images ON cameras(has_user_images);

-- Log the migration
INSERT INTO migrations (migration_name, executed_at) 
VALUES ('003_remove_image2_path', CURRENT_TIMESTAMP);

COMMIT;