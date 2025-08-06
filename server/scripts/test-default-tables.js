#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Testing default images table operations...\n');
  
  // Test 1: INSERT operation
  console.log('🔄 Test 1: INSERT new default image');
  const insertTest = db.prepare(`
    INSERT INTO default_camera_images (brand, model, image_url, source, source_attribution, image_quality)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const testId = insertTest.run(
    'Test Brand', 
    'Test Model', 
    'http://example.com/test.jpg', 
    'test', 
    'Test attribution', 
    6
  ).lastInsertRowid;
  console.log('✅ Inserted test camera with ID:', testId);
  
  // Test 2: SELECT operation
  console.log('\n🔄 Test 2: SELECT by brand and model');
  const selectTest = db.prepare(`
    SELECT * FROM default_camera_images 
    WHERE brand = ? AND model = ?
  `);
  
  const result = selectTest.get('Test Brand', 'Test Model');
  console.log('✅ Found record:', {
    id: result.id,
    brand: result.brand,
    model: result.model,
    source: result.source,
    quality: result.image_quality
  });
  
  // Test 3: UPDATE operation
  console.log('\n🔄 Test 3: UPDATE image quality');
  const updateTest = db.prepare(`
    UPDATE default_camera_images 
    SET image_quality = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const changes = updateTest.run(9, testId).changes;
  console.log('✅ Updated records:', changes);
  
  // Test 4: Complex query with JOIN-like functionality
  console.log('\n🔄 Test 4: Query for brand fallback');
  const brandFallback = db.prepare(`
    SELECT image_url, source FROM brand_default_images 
    WHERE brand = ? AND is_active = 1
  `);
  
  const nikonFallback = brandFallback.get('Nikon');
  console.log('✅ Nikon brand fallback:', nikonFallback ? 'Found' : 'Not found');
  
  // Test 5: Query performance with indexes
  console.log('\n🔄 Test 5: Query performance test');
  const perfTest = db.prepare(`
    SELECT COUNT(*) as count FROM default_camera_images 
    WHERE brand = ? AND is_active = 1
  `);
  
  const start = Date.now();
  const nikonCount = perfTest.get('Nikon');
  const duration = Date.now() - start;
  console.log(`✅ Query completed in ${duration}ms, found ${nikonCount.count} Nikon images`);
  
  // Test 6: DELETE operation (cleanup)
  console.log('\n🔄 Test 6: DELETE test data');
  const deleteTest = db.prepare('DELETE FROM default_camera_images WHERE id = ?');
  const deleted = deleteTest.run(testId).changes;
  console.log('✅ Deleted records:', deleted);
  
  // Test 7: Unique constraint test
  console.log('\n🔄 Test 7: Unique constraint validation');
  try {
    const duplicateTest = db.prepare(`
      INSERT INTO default_camera_images (brand, model, image_url, source)
      VALUES (?, ?, ?, ?)
    `);
    duplicateTest.run('Nikon', 'F', 'http://duplicate.com', 'test');
    console.log('❌ Unique constraint failed - duplicate was inserted');
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('✅ Unique constraint working - duplicate rejected');
    } else {
      throw error;
    }
  }
  
  console.log('\n🎉 All table operations working correctly!');
  
} catch (error) {
  console.error('❌ Table test failed:', error.message);
  process.exit(1);
}