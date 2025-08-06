CREATE TABLE IF NOT EXISTS cameras (
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
    image2_path VARCHAR(500),
    default_image_url VARCHAR(500),
    default_image_source VARCHAR(200),
    has_user_images BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brand ON cameras(brand);
CREATE INDEX IF NOT EXISTS idx_model ON cameras(model);
CREATE INDEX IF NOT EXISTS idx_serial ON cameras(serial);
CREATE INDEX IF NOT EXISTS idx_has_user_images ON cameras(has_user_images);

-- Default camera images lookup table
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

CREATE INDEX IF NOT EXISTS idx_default_brand ON default_camera_images(brand);
CREATE INDEX IF NOT EXISTS idx_default_model ON default_camera_images(model);
CREATE INDEX IF NOT EXISTS idx_default_brand_model ON default_camera_images(brand, model);
CREATE INDEX IF NOT EXISTS idx_default_active ON default_camera_images(is_active);

-- Brand default images for fallback
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

CREATE INDEX IF NOT EXISTS idx_brand_default_active ON brand_default_images(is_active);