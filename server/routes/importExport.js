const express = require('express');
const router = express.Router();
const ImportExportController = require('../controllers/importExportController');

// GET /api/export - Export all cameras to CSV
router.get('/', ImportExportController.exportCameras);

// POST /api/import - Import cameras from CSV file
router.post('/', ImportExportController.importCameras);

module.exports = router;