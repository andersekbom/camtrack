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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Camera routes
app.use('/api/cameras', require('./routes/cameras'));

// Import/Export routes
app.use('/api/export', require('./routes/importExport'));
app.use('/api/import', require('./routes/importExport'));

// Summary routes
app.use('/api/summary', require('./routes/summary'));

module.exports = app;