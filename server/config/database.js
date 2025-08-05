const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let dbPath;

if (process.env.NODE_ENV === 'test' || process.env.DATABASE_PATH === ':memory:') {
  // Use in-memory database for tests
  dbPath = ':memory:';
} else {
  const dbDir = path.join(__dirname, '../database');
  dbPath = path.join(dbDir, 'cameras.db');
  
  // Ensure database directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema for in-memory/test databases
if (dbPath === ':memory:') {
  const schemaPath = path.join(__dirname, '../schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    statements.forEach(statement => {
      db.exec(statement);
    });
  }
}

module.exports = db;