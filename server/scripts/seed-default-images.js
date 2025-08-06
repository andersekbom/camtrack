#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Seeding default images tables with test data...');
  
  // Sample default camera images for testing
  const defaultCameraImages = [
    {
      brand: 'Nikon',
      model: 'F',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Nikon_F_img_2535.jpg',
      source: 'Wikipedia Commons',
      source_attribution: 'By Rama - Own work, CC BY-SA 2.0 fr, https://commons.wikimedia.org/w/index.php?curid=476788',
      image_quality: 8
    },
    {
      brand: 'Canon',
      model: 'AE-1',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Canon_AE-1_img_1726.jpg',
      source: 'Wikipedia Commons',
      source_attribution: 'By Rama - Own work, CC BY-SA 2.0 fr, https://commons.wikimedia.org/w/index.php?curid=1665287',
      image_quality: 8
    },
    {
      brand: 'Leica',
      model: 'M3',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Leica_M3_mg_4395.jpg',
      source: 'Wikipedia Commons',
      source_attribution: 'By Rama - Own work, CC BY-SA 2.0 fr, https://commons.wikimedia.org/w/index.php?curid=1665302',
      image_quality: 9
    },
    {
      brand: 'Pentax',
      model: 'K1000',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Pentax_K1000_camera.jpg',
      source: 'Wikipedia Commons',
      source_attribution: 'By Julo - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=9467089',
      image_quality: 7
    },
    {
      brand: 'Olympus',
      model: 'OM-1',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Olympus_OM-1_img_1851.jpg',
      source: 'Wikipedia Commons',
      source_attribution: 'By Rama - Own work, CC BY-SA 2.0 fr, https://commons.wikimedia.org/w/index.php?curid=1665309',
      image_quality: 8
    }
  ];
  
  // Insert default camera images
  const insertDefaultCamera = db.prepare(`
    INSERT INTO default_camera_images (brand, model, image_url, source, source_attribution, image_quality)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertManyDefaults = db.transaction((images) => {
    for (const image of images) {
      insertDefaultCamera.run(image.brand, image.model, image.image_url, image.source, image.source_attribution, image.image_quality);
    }
  });
  
  insertManyDefaults(defaultCameraImages);
  console.log(`✅ Inserted ${defaultCameraImages.length} default camera images`);
  
  // Sample brand default images for fallback
  const brandDefaultImages = [
    {
      brand: 'Nikon',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Nikon_logo.svg',
      source: 'Wikipedia Commons',
      source_attribution: 'Nikon Corporation logo - Public domain'
    },
    {
      brand: 'Canon',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Canon_wordmark.svg',
      source: 'Wikipedia Commons',
      source_attribution: 'Canon Inc. logo - Public domain'
    },
    {
      brand: 'Leica',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Leica_Camera_AG_logo.svg',
      source: 'Wikipedia Commons',
      source_attribution: 'Leica Camera AG logo - Public domain'
    }
  ];
  
  // Insert brand default images
  const insertBrandDefault = db.prepare(`
    INSERT INTO brand_default_images (brand, image_url, source, source_attribution)
    VALUES (?, ?, ?, ?)
  `);
  
  const insertManyBrands = db.transaction((brands) => {
    for (const brand of brands) {
      insertBrandDefault.run(brand.brand, brand.image_url, brand.source, brand.source_attribution);
    }
  });
  
  insertManyBrands(brandDefaultImages);
  console.log(`✅ Inserted ${brandDefaultImages.length} brand default images`);
  
  // Verify the data
  const cameraCount = db.prepare('SELECT COUNT(*) as count FROM default_camera_images').get();
  const brandCount = db.prepare('SELECT COUNT(*) as count FROM brand_default_images').get();
  
  console.log(`\n📊 Summary:`);
  console.log(`  Default camera images: ${cameraCount.count}`);
  console.log(`  Brand default images: ${brandCount.count}`);
  
  // Show sample data
  console.log(`\n📋 Sample default camera images:`);
  const samples = db.prepare('SELECT brand, model, source FROM default_camera_images LIMIT 3').all();
  samples.forEach(sample => {
    console.log(`  📷 ${sample.brand} ${sample.model} (from ${sample.source})`);
  });
  
} catch (error) {
  console.error('❌ Failed to seed data:', error.message);
  process.exit(1);
}