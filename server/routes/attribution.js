const express = require('express');
const router = express.Router();
const AttributionController = require('../controllers/attributionController');

// GET /api/attribution/report - Get comprehensive attribution report
router.get('/report', AttributionController.getAttributionReport);

// GET /api/attribution/compliance - Get compliance statistics
router.get('/compliance', AttributionController.getComplianceStats);

// GET /api/attribution/export - Export attribution data
router.get('/export', AttributionController.exportAttributions);

// GET /api/attribution/all - Get all attributions with validation
router.get('/all', AttributionController.getAllAttributions);

// GET /api/attribution/validate/:imageId - Validate specific image attribution
router.get('/validate/:imageId', AttributionController.validateAttribution);

// PUT /api/attribution/:imageId - Update attribution for specific image
router.put('/:imageId', AttributionController.updateAttribution);

// POST /api/attribution/batch-validate - Validate multiple attributions
router.post('/batch-validate', AttributionController.batchValidateAttributions);

// POST /api/attribution/generate/:imageId - Generate attribution for image
router.post('/generate/:imageId', AttributionController.generateAttribution);

module.exports = router;