#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

function runMigration(migrationFile) {
  console.log(`Running migration: ${migrationFile}`);
  
  try {
    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements and execute them
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Run all statements in a transaction
    const transaction = db.transaction(() => {
      statements.forEach(statement => {
        const trimmed = statement.trim();
        if (trimmed.length > 0 && !trimmed.startsWith('--')) {
          console.log(`Executing: ${trimmed.substring(0, 50)}...`);
          db.exec(trimmed);
        }
      });
    });
    
    transaction();
    console.log(`✅ Migration ${migrationFile} completed successfully`);
    
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node run-migration.js <migration-file>');
  console.error('Example: node run-migration.js 001_add_default_images.sql');
  process.exit(1);
}

runMigration(migrationFile);