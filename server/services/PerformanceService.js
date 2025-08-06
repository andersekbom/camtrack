const fs = require('fs').promises;
const path = require('path');
const ImageCacheService = require('./ImageCacheService');

class PerformanceService {
  static stats = {
    imageRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    requestTimes: [],
    largeImageWarnings: 0,
    optimizationsSuggested: []
  };

  /**
   * Track image request performance
   */
  static trackImageRequest(startTime, wasCached = false, imageSize = null) {
    const responseTime = Date.now() - startTime;
    
    this.stats.imageRequests++;
    this.stats.requestTimes.push(responseTime);
    
    if (wasCached) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }
    
    // Calculate rolling average (last 100 requests)
    const recentTimes = this.stats.requestTimes.slice(-100);
    this.stats.averageResponseTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
    
    // Track large images
    if (imageSize && imageSize > 2 * 1024 * 1024) { // > 2MB
      this.stats.largeImageWarnings++;
    }
    
    // Auto-suggest optimizations
    this.analyzePerformance();
  }

  /**
   * Analyze performance and suggest optimizations
   */
  static analyzePerformance() {
    const cacheHitRate = this.stats.imageRequests > 0 
      ? (this.stats.cacheHits / this.stats.imageRequests) * 100 
      : 0;

    // Clear previous suggestions
    this.stats.optimizationsSuggested = [];

    if (cacheHitRate < 70 && this.stats.imageRequests > 20) {
      this.stats.optimizationsSuggested.push({
        type: 'cache',
        priority: 'high',
        message: 'Low cache hit rate detected. Consider preloading popular images.',
        metric: `${cacheHitRate.toFixed(1)}% cache hit rate`
      });
    }

    if (this.stats.averageResponseTime > 1000) {
      this.stats.optimizationsSuggested.push({
        type: 'response_time',
        priority: 'high',
        message: 'Slow average response time. Consider image optimization or CDN.',
        metric: `${this.stats.averageResponseTime.toFixed(0)}ms average response`
      });
    }

    if (this.stats.largeImageWarnings > 5) {
      this.stats.optimizationsSuggested.push({
        type: 'image_size',
        priority: 'medium',
        message: 'Multiple large images detected. Consider image compression.',
        metric: `${this.stats.largeImageWarnings} large images (>2MB)`
      });
    }
  }

  /**
   * Get comprehensive performance statistics
   */
  static getPerformanceStats() {
    const cacheHitRate = this.stats.imageRequests > 0 
      ? (this.stats.cacheHits / this.stats.imageRequests) * 100 
      : 0;

    return {
      ...this.stats,
      cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
      totalRequests: this.stats.imageRequests,
      performance_grade: this.calculatePerformanceGrade()
    };
  }

  /**
   * Calculate overall performance grade (A-F)
   */
  static calculatePerformanceGrade() {
    const cacheHitRate = this.stats.imageRequests > 0 
      ? (this.stats.cacheHits / this.stats.imageRequests) * 100 
      : 100;

    let score = 100;

    // Cache performance (40% of grade)
    if (cacheHitRate < 50) score -= 40;
    else if (cacheHitRate < 70) score -= 20;
    else if (cacheHitRate < 90) score -= 10;

    // Response time performance (40% of grade)
    if (this.stats.averageResponseTime > 2000) score -= 40;
    else if (this.stats.averageResponseTime > 1000) score -= 20;
    else if (this.stats.averageResponseTime > 500) score -= 10;

    // Image optimization (20% of grade)
    const largeImageRatio = this.stats.imageRequests > 0 
      ? (this.stats.largeImageWarnings / this.stats.imageRequests) * 100 
      : 0;
    
    if (largeImageRatio > 30) score -= 20;
    else if (largeImageRatio > 15) score -= 10;
    else if (largeImageRatio > 5) score -= 5;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Reset performance statistics
   */
  static resetStats() {
    this.stats = {
      imageRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      requestTimes: [],
      largeImageWarnings: 0,
      optimizationsSuggested: []
    };
  }

  /**
   * Optimize image loading strategy based on usage patterns
   */
  static async optimizeImageLoading() {
    try {
      const recommendations = [];
      const cacheStats = await ImageCacheService.getCacheStats();
      
      // Analyze cache usage
      if (cacheStats.hitRate < 0.7) {
        recommendations.push({
          type: 'preload',
          action: 'Preload popular camera model images',
          impact: 'High',
          implementation: 'Create preload job for top 20 most viewed models'
        });
      }

      // Check for unused cached images
      const unusedImages = await this.findUnusedCachedImages();
      if (unusedImages.length > 10) {
        recommendations.push({
          type: 'cleanup',
          action: `Remove ${unusedImages.length} unused cached images`,
          impact: 'Medium',
          implementation: 'Run cache cleanup job to free disk space'
        });
      }

      // Memory optimization
      if (this.stats.averageResponseTime > 800) {
        recommendations.push({
          type: 'memory',
          action: 'Implement image response caching in memory',
          impact: 'High',
          implementation: 'Add in-memory LRU cache for recently requested images'
        });
      }

      return {
        current_performance: this.getPerformanceStats(),
        recommendations,
        estimated_improvement: this.estimateImprovements(recommendations)
      };
    } catch (error) {
      throw new Error(`Failed to analyze image loading optimization: ${error.message}`);
    }
  }

  /**
   * Find cached images that haven't been accessed recently
   */
  static async findUnusedCachedImages() {
    try {
      const cacheDir = path.join(__dirname, '../cached_images');
      const files = await fs.readdir(cacheDir);
      const unusedImages = [];
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      for (const file of files) {
        if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
          const filePath = path.join(cacheDir, file);
          const stats = await fs.stat(filePath);
          
          // If not accessed in a week, consider unused
          if (stats.atime.getTime() < oneWeekAgo) {
            unusedImages.push({
              filename: file,
              lastAccessed: stats.atime,
              size: stats.size
            });
          }
        }
      }

      return unusedImages;
    } catch (error) {
      console.error('Error finding unused cached images:', error);
      return [];
    }
  }

  /**
   * Estimate performance improvements from recommendations
   */
  static estimateImprovements(recommendations) {
    let estimatedResponseTimeImprovement = 0;
    let estimatedCacheHitImprovement = 0;
    let estimatedStorageReduction = 0;

    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'preload':
          estimatedCacheHitImprovement += 20; // 20% improvement in cache hit rate
          estimatedResponseTimeImprovement += 200; // 200ms faster response
          break;
        case 'cleanup':
          estimatedStorageReduction += 50; // 50MB estimated space saved
          break;
        case 'memory':
          estimatedResponseTimeImprovement += 300; // 300ms faster response
          break;
      }
    });

    return {
      response_time_ms: Math.min(estimatedResponseTimeImprovement, this.stats.averageResponseTime * 0.8),
      cache_hit_rate_percent: Math.min(estimatedCacheHitImprovement, 30),
      storage_saved_mb: estimatedStorageReduction
    };
  }

  /**
   * Implement automated optimizations
   */
  static async implementAutoOptimizations() {
    const optimizations = [];

    try {
      // Auto cleanup of old cached images
      const unusedImages = await this.findUnusedCachedImages();
      if (unusedImages.length > 20) {
        const cleaned = await this.cleanupOldCachedImages(unusedImages.slice(0, 10));
        optimizations.push({
          type: 'auto_cleanup',
          action: `Removed ${cleaned.length} old cached images`,
          space_saved_mb: cleaned.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024)
        });
      }

      // Auto preload popular models (if not already cached)
      const popularModels = await this.getPopularModels();
      let preloadCount = 0;
      
      for (const model of popularModels.slice(0, 5)) {
        const hasCache = await ImageCacheService.isImageCached(model.sample_image_url);
        if (!hasCache && model.sample_image_url) {
          try {
            await ImageCacheService.getCachedImage(model.sample_image_url);
            preloadCount++;
          } catch (error) {
            console.warn(`Failed to preload image for ${model.brand} ${model.model}:`, error.message);
          }
        }
      }

      if (preloadCount > 0) {
        optimizations.push({
          type: 'auto_preload',
          action: `Preloaded ${preloadCount} popular model images`,
          expected_performance_gain: `${preloadCount * 10}% cache hit improvement`
        });
      }

      return {
        optimizations_applied: optimizations,
        timestamp: new Date().toISOString(),
        next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
      };
    } catch (error) {
      throw new Error(`Failed to implement auto optimizations: ${error.message}`);
    }
  }

  /**
   * Clean up old cached images
   */
  static async cleanupOldCachedImages(imagesToClean) {
    const cleaned = [];
    const cacheDir = path.join(__dirname, '../cached_images');

    for (const image of imagesToClean) {
      try {
        const filePath = path.join(cacheDir, image.filename);
        await fs.unlink(filePath);
        cleaned.push(image);
      } catch (error) {
        console.warn(`Failed to delete cached image ${image.filename}:`, error.message);
      }
    }

    return cleaned;
  }

  /**
   * Get popular models based on default image usage
   */
  static async getPopularModels() {
    try {
      const DefaultImage = require('../models/DefaultImage');
      const images = DefaultImage.findAll();
      
      // Sort by quality and return top models
      return images
        .filter(img => img.image_quality >= 7)
        .sort((a, b) => (b.image_quality || 0) - (a.image_quality || 0))
        .slice(0, 10)
        .map(img => ({
          brand: img.brand,
          model: img.model,
          sample_image_url: img.image_url,
          quality: img.image_quality
        }));
    } catch (error) {
      console.error('Error getting popular models:', error);
      return [];
    }
  }

  /**
   * Generate performance monitoring report
   */
  static generatePerformanceReport() {
    const stats = this.getPerformanceStats();
    
    return {
      generated_at: new Date().toISOString(),
      summary: {
        grade: stats.performance_grade,
        total_requests: stats.totalRequests,
        cache_hit_rate: stats.cacheHitRate,
        average_response_time: stats.averageResponseTime,
        large_images_detected: stats.largeImageWarnings
      },
      metrics: {
        cache_performance: {
          hits: stats.cacheHits,
          misses: stats.cacheMisses,
          hit_rate: stats.cacheHitRate,
          status: stats.cacheHitRate > 80 ? 'excellent' : stats.cacheHitRate > 60 ? 'good' : 'needs_improvement'
        },
        response_performance: {
          average_ms: stats.averageResponseTime,
          p95_ms: this.calculatePercentile(stats.requestTimes, 95),
          p99_ms: this.calculatePercentile(stats.requestTimes, 99),
          status: stats.averageResponseTime < 500 ? 'excellent' : stats.averageResponseTime < 1000 ? 'good' : 'needs_improvement'
        }
      },
      recommendations: stats.optimizationsSuggested,
      next_actions: this.getNextActions(stats)
    };
  }

  /**
   * Calculate percentile from array of values
   */
  static calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get recommended next actions based on performance
   */
  static getNextActions(stats) {
    const actions = [];

    if (stats.cacheHitRate < 70) {
      actions.push({
        priority: 'high',
        action: 'Implement image preloading for popular models',
        expected_impact: '15-25% improvement in cache hit rate'
      });
    }

    if (stats.averageResponseTime > 1000) {
      actions.push({
        priority: 'high', 
        action: 'Enable image compression and optimize image sizes',
        expected_impact: '30-50% reduction in response time'
      });
    }

    if (stats.largeImageWarnings > 10) {
      actions.push({
        priority: 'medium',
        action: 'Implement automatic image optimization during caching',
        expected_impact: '20-30% reduction in bandwidth usage'
      });
    }

    if (actions.length === 0) {
      actions.push({
        priority: 'low',
        action: 'Continue monitoring performance metrics',
        expected_impact: 'Maintain current excellent performance'
      });
    }

    return actions;
  }
}

module.exports = PerformanceService;