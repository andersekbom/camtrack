const express = require('express');
const router = express.Router();
const SummaryController = require('../controllers/summaryController');

// GET /api/summary - Get collection summary statistics
router.get('/', SummaryController.getSummary);

module.exports = router;