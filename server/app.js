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

// Note: Cached images have been migrated to /uploads/default-images/

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Camera routes
app.use('/api/cameras', require('./routes/cameras'));

// Camera image routes (separate to avoid route conflicts)
app.use('/api/camera-images', require('./routes/cameraImages'));

// Default Images routes
app.use('/api/default-images', require('./routes/defaultImages'));

// Image Search routes
app.use('/api/image-search', require('./routes/imageSearch'));

// Note: Cache routes removed - now using local image storage

// Job Queue routes
app.use('/api/jobs', require('./routes/jobs'));

// Attribution routes
app.use('/api/attribution', require('./routes/attribution'));

// Performance routes
app.use('/api/performance', require('./routes/performance'));

// Image Proxy routes (for Wikipedia images)
app.use('/api/image-proxy', require('./routes/imageProxy'));

// Import/Export routes
console.log('Loading import/export routes');
app.use('/api/export', require('./routes/importExport'));
app.use('/api/import', require('./routes/importExport'));

// Summary routes
app.use('/api/summary', require('./routes/summary'));

// API Documentation routes
app.use('/api/docs', require('./routes/docs'));

// Help and User Guide routes
app.use('/api/help', require('./routes/help'));

// Database management routes
app.use('/api/database', require('./routes/database'));

module.exports = app;