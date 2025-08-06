const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve cached images statically
app.use('/cached-images', express.static(path.join(__dirname, 'cached_images')));

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

// Import/Export routes
app.use('/api/export', require('./routes/importExport'));
app.use('/api/import', require('./routes/importExport'));

// Summary routes
app.use('/api/summary', require('./routes/summary'));

module.exports = app;