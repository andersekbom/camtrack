const fs = require('fs');
const path = require('path');
const db = require('../config/database');

try {
  // Read and execute schema
  const schemaPath = path.join(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split schema by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
  
  statements.forEach(statement => {
    db.exec(statement);
  });
  
  console.log('✅ Database initialized successfully!');
  console.log('📁 Database file: server/database/cameras.db');
  
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
} finally {
  db.close();
}