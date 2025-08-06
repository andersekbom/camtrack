const express = require('express');
const router = express.Router();
const ImageSearchController = require('../controllers/imageSearchController');

// POST /api/image-search/wikipedia - Search for images on Wikipedia Commons
router.post('/wikipedia', ImageSearchController.searchWikipediaImages);

// POST /api/image-search/find-best - Find best image for a camera
router.post('/find-best', ImageSearchController.findBestImage);

// POST /api/image-search/auto-assign - Automatically assign default image to a camera model
router.post('/auto-assign', ImageSearchController.autoAssignImage);

// POST /api/image-search/batch-assign - Batch assign images to multiple cameras
router.post('/batch-assign', ImageSearchController.batchAssignImages);

// GET /api/image-search/suggestions/:brand - Get model suggestions for a brand
router.get('/suggestions/:brand', ImageSearchController.getModelSuggestions);

// POST /api/image-search/validate-url - Validate image URL accessibility
router.post('/validate-url', ImageSearchController.validateImageUrl);

module.exports = router;