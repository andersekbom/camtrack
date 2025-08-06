const express = require('express');
const router = express.Router();
const CacheController = require('../controllers/cacheController');

// GET /api/cache/stats - Get cache statistics
router.get('/stats', CacheController.getCacheStats);

// GET /api/cache/usage - Get cache usage by age
router.get('/usage', CacheController.getCacheUsage);

// GET /api/cache/validate/:cacheKey - Validate cached file
router.get('/validate/:cacheKey', CacheController.validateCachedFile);

// GET /api/cache/info/:url - Get cache info for URL (URL must be encoded)
router.get('/info/:url', CacheController.getCacheInfo);

// POST /api/cache/cleanup - Clean up expired cache files
router.post('/cleanup', CacheController.cleanupCache);

// POST /api/cache/image - Cache a specific image URL
router.post('/image', CacheController.cacheImage);

// POST /api/cache/batch - Batch cache multiple images
router.post('/batch', CacheController.batchCacheImages);

// POST /api/cache/preload - Preload images for existing default images
router.post('/preload', CacheController.preloadDefaultImages);

// DELETE /api/cache/clear - Clear entire cache
router.delete('/clear', CacheController.clearCache);

module.exports = router;