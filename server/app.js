const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { 
  trackImagePerformance, 
  addCacheHeaders, 
  compressionHints, 
  performanceMonitor 
} = require('./middleware/performanceMiddleware');

const app = express();

// Performance middleware (before other middleware)
app.use(performanceMonitor);
app.use(compressionHints);

// Standard middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically with performance tracking
app.use('/uploads', addCacheHeaders, trackImagePerformance, express.static(path.join(__dirname, '../uploads')));

// Serve cached images statically with performance tracking
app.use('/cached-images', addCacheHeaders, trackImagePerformance, express.static(path.join(__dirname, 'cached_images')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Camera routes
app.use('/api/cameras', require('./routes/cameras'));

// Default Images routes
app.use('/api/default-images', require('./routes/defaultImages'));

// Image Search routes
app.use('/api/image-search', require('./routes/imageSearch'));

// Cache routes
app.use('/api/cache', require('./routes/cache'));

// Job Queue routes
app.use('/api/jobs', require('./routes/jobs'));

// Attribution routes
app.use('/api/attribution', require('./routes/attribution'));

// Performance routes
app.use('/api/performance', require('./routes/performance'));

// Image Proxy routes (for Wikipedia images)
app.use('/api/image-proxy', require('./routes/imageProxy'));

// Import/Export routes
app.use('/api/export', require('./routes/importExport'));
app.use('/api/import', require('./routes/importExport'));

// Summary routes
app.use('/api/summary', require('./routes/summary'));

// API Documentation routes
app.use('/api/docs', require('./routes/docs'));

// Help and User Guide routes
app.use('/api/help', require('./routes/help'));

module.exports = app;