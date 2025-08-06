const express = require('express');
const router = express.Router();
const JobsController = require('../controllers/jobsController');

// GET /api/jobs/stats - Get job queue statistics
router.get('/stats', JobsController.getJobStats);

// GET /api/jobs/types - Get available job types (MUST BE BEFORE /:jobId)
router.get('/types', JobsController.getJobTypes);

// GET /api/jobs/:jobId - Get specific job (MUST BE BEFORE other POST routes)
router.get('/:jobId', JobsController.getJob);

// GET /api/jobs - Get all jobs
router.get('/', JobsController.getAllJobs);

// POST /api/jobs/fetch-default-image - Schedule default image fetch
router.post('/fetch-default-image', JobsController.scheduleDefaultImageFetch);

// POST /api/jobs/cache-image - Schedule image caching
router.post('/cache-image', JobsController.scheduleCacheImage);

// POST /api/jobs/cache-cleanup - Schedule cache cleanup
router.post('/cache-cleanup', JobsController.scheduleCacheCleanup);

// POST /api/jobs/start-processing - Start job processing
router.post('/start-processing', JobsController.startProcessing);

// POST /api/jobs/stop-processing - Stop job processing
router.post('/stop-processing', JobsController.stopProcessing);

// DELETE /api/jobs/clear - Clear completed/failed jobs
router.delete('/clear', JobsController.clearJobs);

module.exports = router;