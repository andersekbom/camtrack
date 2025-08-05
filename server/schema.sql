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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brand ON cameras(brand);
CREATE INDEX IF NOT EXISTS idx_model ON cameras(model);
CREATE INDEX IF NOT EXISTS idx_serial ON cameras(serial);