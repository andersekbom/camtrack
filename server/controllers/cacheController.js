const ImageCacheService = require('../services/ImageCacheService');

class CacheController {
  // GET /api/cache/stats - Get cache statistics
  static async getCacheStats(req, res) {
    try {
      const stats = await ImageCacheService.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting cache stats:', error);
      res.status(500).json({ error: 'Failed to get cache statistics' });
    }
  }

  // GET /api/cache/usage - Get cache usage by age
  static async getCacheUsage(req, res) {
    try {
      const usage = await ImageCacheService.getCacheUsageByAge();
      res.json(usage);
    } catch (error) {
      console.error('Error getting cache usage:', error);
      res.status(500).json({ error: 'Failed to get cache usage' });
    }
  }

  // POST /api/cache/cleanup - Clean up expired cache files
  static async cleanupCache(req, res) {
    try {
      const result = await ImageCacheService.cleanupExpiredCache();
      res.json({
        message: 'Cache cleanup completed',
        ...result
      });
    } catch (error) {
      console.error('Error cleaning up cache:', error);
      res.status(500).json({ error: 'Failed to cleanup cache' });
    }
  }

  // DELETE /api/cache/clear - Clear entire cache
  static async clearCache(req, res) {
    try {
      const result = await ImageCacheService.clearCache();
      res.json({
        message: 'Cache cleared successfully',
        ...result
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }

  // POST /api/cache/image - Cache a specific image URL
  static async cacheImage(req, res) {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const cachedImage = await ImageCacheService.getCachedImage(url);
      
      res.json({
        message: 'Image cached successfully',
        cached: cachedImage
      });
    } catch (error) {
      console.error('Error caching image:', error);
      res.status(500).json({ error: 'Failed to cache image' });
    }
  }

  // POST /api/cache/batch - Batch cache multiple images
  static async batchCacheImages(req, res) {
    try {
      const { urls, concurrency = 3 } = req.body;
      
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'URLs array is required' });
      }

      if (urls.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 URLs can be cached in one batch' });
      }

      // Validate URLs
      for (const url of urls) {
        try {
          new URL(url);
        } catch {
          return res.status(400).json({ error: `Invalid URL format: ${url}` });
        }
      }

      const result = await ImageCacheService.batchCacheImages(urls, concurrency);
      
      res.json({
        message: 'Batch caching completed',
        ...result
      });
    } catch (error) {
      console.error('Error batch caching images:', error);
      res.status(500).json({ error: 'Failed to batch cache images' });
    }
  }

  // GET /api/cache/validate/:cacheKey - Validate cached file
  static async validateCachedFile(req, res) {
    try {
      const { cacheKey } = req.params;
      
      if (!cacheKey) {
        return res.status(400).json({ error: 'Cache key is required' });
      }

      const validation = await ImageCacheService.validateCachedFile(cacheKey);
      
      res.json({
        cacheKey,
        validation
      });
    } catch (error) {
      console.error('Error validating cached file:', error);
      res.status(500).json({ error: 'Failed to validate cached file' });
    }
  }

  // GET /api/cache/info/:url - Get cache info for a specific URL
  static async getCacheInfo(req, res) {
    try {
      const { url } = req.params;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const decodedUrl = decodeURIComponent(url);
      
      // Validate URL format
      try {
        new URL(decodedUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const cacheInfo = await ImageCacheService.getCachedImageInfo(decodedUrl);
      
      if (!cacheInfo) {
        return res.status(404).json({ 
          error: 'Image not cached or cache expired',
          url: decodedUrl
        });
      }

      res.json({
        url: decodedUrl,
        cache: cacheInfo
      });
    } catch (error) {
      console.error('Error getting cache info:', error);
      res.status(500).json({ error: 'Failed to get cache info' });
    }
  }

  // POST /api/cache/preload - Preload images for existing default images
  static async preloadDefaultImages(req, res) {
    try {
      const DefaultImage = require('../models/DefaultImage');
      
      // Get all default images that aren't cached yet
      const defaultImages = DefaultImage.findAll({ is_active: 1 });
      
      const urlsToCache = [];
      for (const img of defaultImages) {
        const isCached = await ImageCacheService.isCached(img.image_url);
        if (!isCached) {
          urlsToCache.push(img.image_url);
        }
      }

      if (urlsToCache.length === 0) {
        return res.json({
          message: 'All default images are already cached',
          totalImages: defaultImages.length,
          alreadyCached: defaultImages.length
        });
      }

      const result = await ImageCacheService.batchCacheImages(urlsToCache, 2); // Lower concurrency for preloading
      
      res.json({
        message: 'Default images preloading completed',
        totalDefaultImages: defaultImages.length,
        urlsToCache: urlsToCache.length,
        alreadyCached: defaultImages.length - urlsToCache.length,
        ...result
      });
    } catch (error) {
      console.error('Error preloading default images:', error);
      res.status(500).json({ error: 'Failed to preload default images' });
    }
  }
}

module.exports = CacheController;