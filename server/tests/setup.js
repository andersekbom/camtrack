const fs = require('fs');
const path = require('path');

// Create test database in memory for faster tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

// Disable job queue processing in tests
process.env.DISABLE_JOB_QUEUE = 'true';

// Mock Wikipedia service to avoid external calls
jest.mock('../services/WikipediaImageService', () => ({
  searchImages: jest.fn(() => Promise.resolve([])),
  downloadImage: jest.fn(() => Promise.resolve(null))
}));

// Mock performance service to avoid issues
jest.mock('../services/PerformanceService', () => ({
  recordMetric: jest.fn(),
  getMetrics: jest.fn(() => ({}))
}));

// Clean up test files after all tests
afterAll(() => {
  // Clean up any test files if needed
});