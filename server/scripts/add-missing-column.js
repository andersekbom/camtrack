#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Adding missing default_image_url column...');
  
  // Add the missing column
  db.exec('ALTER TABLE cameras ADD COLUMN default_image_url VARCHAR(500);');
  console.log('✅ Added default_image_url column');
  
  // Verify all columns exist
  console.log('\n📋 Verifying all default image columns:');
  const schema = db.pragma('table_info(cameras)');
  const defaultColumns = schema.filter(col => 
    col.name === 'default_image_url' || 
    col.name === 'default_image_source' || 
    col.name === 'has_user_images'
  );
  
  defaultColumns.forEach(column => {
    console.log(`  ✅ ${column.name}: ${column.type}`);
  });
  
  if (defaultColumns.length === 3) {
    console.log('🎉 All default image columns are now present!');
  } else {
    console.log('❌ Still missing columns');
  }
  
} catch (error) {
  console.error('❌ Failed to add column:', error.message);
  process.exit(1);
}