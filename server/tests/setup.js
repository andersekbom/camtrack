const fs = require('fs');
const path = require('path');

// Create test database in memory for faster tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

// Clean up test files after all tests
afterAll(() => {
  // Clean up any test files if needed
});