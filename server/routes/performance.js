const express = require('express');
const router = express.Router();
const PerformanceController = require('../controllers/performanceController');

// GET /api/performance/stats - Get current performance statistics
router.get('/stats', PerformanceController.getPerformanceStats);

// GET /api/performance/report - Generate comprehensive performance report
router.get('/report', PerformanceController.getPerformanceReport);

// GET /api/performance/monitor - Get real-time monitoring data
router.get('/monitor', PerformanceController.getMonitoringData);

// GET /api/performance/trends - Get performance trends over time
router.get('/trends', PerformanceController.getPerformanceTrends);

// GET /api/performance/optimize - Analyze and get optimization recommendations
router.get('/optimize', PerformanceController.getOptimizationRecommendations);

// POST /api/performance/optimize/auto - Implement automatic optimizations
router.post('/optimize/auto', PerformanceController.implementAutoOptimizations);

// POST /api/performance/track - Manually track a performance event
router.post('/track', PerformanceController.trackPerformanceEvent);

// POST /api/performance/reset - Reset performance statistics
router.post('/reset', PerformanceController.resetPerformanceStats);

module.exports = router;