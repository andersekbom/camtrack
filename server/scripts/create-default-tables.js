#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Creating default images tables...');
  
  // Create default camera images table
  db.exec(`
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
  `);
  console.log('✅ Created default_camera_images table');
  
  // Create indexes for default camera images
  db.exec('CREATE INDEX IF NOT EXISTS idx_default_brand ON default_camera_images(brand);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_default_model ON default_camera_images(model);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_default_brand_model ON default_camera_images(brand, model);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_default_active ON default_camera_images(is_active);');
  console.log('✅ Created indexes for default_camera_images');
  
  // Create brand default images table
  db.exec(`
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
  `);
  console.log('✅ Created brand_default_images table');
  
  // Create index for brand defaults
  db.exec('CREATE INDEX IF NOT EXISTS idx_brand_default_active ON brand_default_images(is_active);');
  console.log('✅ Created index for brand_default_images');
  
  // Verify tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%default%'").all();
  console.log('\n📋 Created tables:', tables.map(t => t.name));
  
} catch (error) {
  console.error('❌ Failed to create tables:', error.message);
  process.exit(1);
}