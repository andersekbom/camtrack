const express = require('express');
const router = express.Router();
const ImportExportController = require('../controllers/importExportController');

// GET /api/export - Export all cameras to CSV
router.get('/', (req, res) => {
  res.json({ error: 'ROUTE TEST - This should appear if route is working' });
});
// router.get('/', ImportExportController.exportCameras);

// Test endpoint to verify routing
router.get('/test', (req, res) => {
  res.json({ message: 'Export route is working', timestamp: new Date().toISOString() });
});

// POST /api/import - Import cameras from CSV file
router.post('/', ImportExportController.importCameras);

module.exports = router;