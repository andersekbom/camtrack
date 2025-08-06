#!/usr/bin/env node

const db = require('../config/database');

try {
  console.log('Cameras table schema:');
  const schema = db.pragma('table_info(cameras)');
  schema.forEach(column => {
    console.log(`${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
  });
  
  console.log('\nIndexes on cameras table:');
  const indexes = db.pragma('index_list(cameras)');
  indexes.forEach(index => {
    console.log(`${index.name}: ${index.unique ? 'UNIQUE' : 'INDEX'}`);
  });
  
} catch (error) {
  console.error('Error checking schema:', error.message);
  process.exit(1);
}