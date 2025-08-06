#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Testing database schema...');
  
  // Test inserting a camera with new columns
  const insertTest = db.prepare(`
    INSERT INTO cameras (brand, model, default_image_url, default_image_source, has_user_images)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const testId = insertTest.run('Test Brand', 'Test Model', 'http://example.com/image.jpg', 'test', 1).lastInsertRowid;
  console.log('✅ Successfully inserted test camera with ID:', testId);
  
  // Test querying the new columns
  const queryTest = db.prepare(`
    SELECT id, brand, model, default_image_url, default_image_source, has_user_images
    FROM cameras WHERE id = ?
  `);
  
  const result = queryTest.get(testId);
  console.log('✅ Successfully queried camera:', result);
  
  // Clean up test data
  const deleteTest = db.prepare('DELETE FROM cameras WHERE id = ?');
  deleteTest.run(testId);
  console.log('✅ Cleaned up test data');
  
  // Show final schema
  console.log('\n📋 Current schema columns:');
  const schema = db.pragma('table_info(cameras)');
  schema.forEach(column => {
    if (column.name.includes('default') || column.name.includes('has_user')) {
      console.log(`  ✨ ${column.name}: ${column.type} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
    } else if (column.name.includes('image')) {
      console.log(`  📷 ${column.name}: ${column.type}`);
    }
  });
  
} catch (error) {
  console.error('❌ Schema test failed:', error.message);
  process.exit(1);
}