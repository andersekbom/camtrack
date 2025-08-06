const PerformanceService = require('../services/PerformanceService');

/**
 * Middleware to track image request performance
 */
function trackImagePerformance(req, res, next) {
  // Only track image requests
  const isImageRequest = req.path.includes('/uploads/') || 
                        req.path.includes('/cached-images/') ||
                        req.headers.accept?.includes('image/');

  if (!isImageRequest) {
    return next();
  }

  const startTime = Date.now();
  
  // Track the original end method
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    try {
      // Determine if image was cached based on response headers or path
      const wasCached = req.path.includes('/cached-images/') || 
                       res.getHeader('x-cache-status') === 'hit';
      
      // Get image size from content-length header
      const imageSize = res.getHeader('content-length') ? 
                       parseInt(res.getHeader('content-length')) : null;
      
      // Track the performance
      PerformanceService.trackImageRequest(startTime, wasCached, imageSize);
    } catch (error) {
      console.warn('Performance tracking error:', error.message);
    }
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Middleware to add cache headers for optimization
 */
function addCacheHeaders(req, res, next) {
  // Add cache headers for static images
  if (req.path.includes('/uploads/') || req.path.includes('/cached-images/')) {
    try {
      // Cache for 7 days for uploaded images
      if (req.path.includes('/uploads/')) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      }
      
      // Cache for 30 days for cached default images
      if (req.path.includes('/cached-images/')) {
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        res.setHeader('x-cache-status', 'hit'); // Mark as cached
      }
      
      // Add ETag for better caching
      res.setHeader('ETag', `"${Date.now()}"`);
    } catch (error) {
      console.warn('Cache headers error:', error.message);
    }
  }

  next();
}

/**
 * Middleware to compress responses for better performance
 */
function compressionHints(req, res, next) {
  // Add hints for compression
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('Vary', 'Accept-Encoding');
  }

  next();
}

/**
 * Performance monitoring middleware for all requests
 */
function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  
  // Override res.end to capture timing before headers are sent
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Set response time header before ending response
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${responseTime}ms`);
    }
    
    // Log slow requests
    if (responseTime > 2000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

module.exports = {
  trackImagePerformance,
  addCacheHeaders,
  compressionHints,
  performanceMonitor
};