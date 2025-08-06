const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

class ImageCacheService {
  static CACHE_DIR = path.join(__dirname, '../cached_images');
  static MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size
  static ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  /**
   * Initialize cache directory
   */
  static async initializeCache() {
    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
      console.log(`📁 Image cache directory initialized: ${this.CACHE_DIR}`);
    } catch (error) {
      console.error('Failed to initialize image cache directory:', error.message);
      throw error;
    }
  }

  /**
   * Generate cache key from URL
   */
  static getCacheKey(url) {
    const hash = crypto.createHash('sha256').update(url).digest('hex');
    const urlObj = new URL(url);
    const extension = path.extname(urlObj.pathname) || '.jpg';
    return `${hash}${extension}`;
  }

  /**
   * Get cached image path
   */
  static getCachePath(cacheKey) {
    return path.join(this.CACHE_DIR, cacheKey);
  }

  /**
   * Check if image is cached and not expired
   */
  static async isCached(url) {
    try {
      const cacheKey = this.getCacheKey(url);
      const cachePath = this.getCachePath(cacheKey);
      
      const stats = await fs.stat(cachePath);
      const age = Date.now() - stats.mtime.getTime();
      
      return age < this.MAX_CACHE_AGE;
    } catch (error) {
      return false; // File doesn't exist or error occurred
    }
  }

  /**
   * Get cached image info
   */
  static async getCachedImageInfo(url) {
    try {
      const cacheKey = this.getCacheKey(url);
      const cachePath = this.getCachePath(cacheKey);
      
      const stats = await fs.stat(cachePath);
      const age = Date.now() - stats.mtime.getTime();
      
      if (age >= this.MAX_CACHE_AGE) {
        return null; // Expired
      }
      
      return {
        cacheKey,
        cachePath,
        size: stats.size,
        cached: stats.mtime,
        age: age,
        url: `/cached-images/${cacheKey}` // Serving URL
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Download and cache image from URL
   */
  static async cacheImage(url) {
    const cacheKey = this.getCacheKey(url);
    const cachePath = this.getCachePath(cacheKey);
    
    return new Promise((resolve, reject) => {
      const options = {
        timeout: 30000,
        headers: {
          'User-Agent': 'CamTracker-Deluxe/1.0 (https://github.com/user/camtrack; contact@example.com)'
        }
      };
      
      const request = https.get(url, options, (response) => {
        // Check response status
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        // Check content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          reject(new Error(`Invalid content type: ${contentType}`));
          return;
        }

        // Check content length
        const contentLength = parseInt(response.headers['content-length']);
        if (contentLength && contentLength > this.MAX_FILE_SIZE) {
          reject(new Error(`File too large: ${contentLength} bytes`));
          return;
        }

        let downloadedBytes = 0;
        const chunks = [];

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          
          // Check size limit during download
          if (downloadedBytes > this.MAX_FILE_SIZE) {
            response.destroy();
            reject(new Error(`File too large: ${downloadedBytes} bytes`));
            return;
          }
          
          chunks.push(chunk);
        });

        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            
            // Ensure cache directory exists
            await this.initializeCache();
            
            // Write file to cache
            await fs.writeFile(cachePath, buffer);
            
            const stats = await fs.stat(cachePath);
            
            resolve({
              cacheKey,
              cachePath,
              size: stats.size,
              url: `/cached-images/${cacheKey}`,
              originalUrl: url,
              cached: new Date()
            });
          } catch (error) {
            reject(new Error(`Failed to write cache file: ${error.message}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  /**
   * Get cached image or download and cache it
   */
  static async getCachedImage(url) {
    try {
      // Check if already cached and not expired
      const cachedInfo = await this.getCachedImageInfo(url);
      if (cachedInfo) {
        return cachedInfo;
      }

      // Download and cache the image
      return await this.cacheImage(url);
    } catch (error) {
      console.error(`Failed to cache image ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Clean up expired cached images
   */
  static async cleanupExpiredCache() {
    try {
      await this.initializeCache();
      
      const files = await fs.readdir(this.CACHE_DIR);
      let deletedCount = 0;
      let errorCount = 0;
      
      for (const file of files) {
        try {
          const filePath = path.join(this.CACHE_DIR, file);
          const stats = await fs.stat(filePath);
          const age = Date.now() - stats.mtime.getTime();
          
          if (age >= this.MAX_CACHE_AGE) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        } catch (error) {
          console.warn(`Failed to process cache file ${file}:`, error.message);
          errorCount++;
        }
      }
      
      return { deletedCount, errorCount, totalFiles: files.length };
    } catch (error) {
      console.error('Failed to cleanup cache:', error.message);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    try {
      await this.initializeCache();
      
      const files = await fs.readdir(this.CACHE_DIR);
      let totalSize = 0;
      let expiredCount = 0;
      let validCount = 0;
      
      for (const file of files) {
        try {
          const filePath = path.join(this.CACHE_DIR, file);
          const stats = await fs.stat(filePath);
          const age = Date.now() - stats.mtime.getTime();
          
          totalSize += stats.size;
          
          if (age >= this.MAX_CACHE_AGE) {
            expiredCount++;
          } else {
            validCount++;
          }
        } catch (error) {
          // Skip files with errors
          continue;
        }
      }
      
      return {
        totalFiles: files.length,
        validFiles: validCount,
        expiredFiles: expiredCount,
        totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        cacheDir: this.CACHE_DIR,
        maxAge: this.MAX_CACHE_AGE,
        maxAgeHours: Math.round(this.MAX_CACHE_AGE / (1000 * 60 * 60))
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error.message);
      throw error;
    }
  }

  /**
   * Clear entire cache
   */
  static async clearCache() {
    try {
      await this.initializeCache();
      
      const files = await fs.readdir(this.CACHE_DIR);
      let deletedCount = 0;
      
      for (const file of files) {
        try {
          const filePath = path.join(this.CACHE_DIR, file);
          await fs.unlink(filePath);
          deletedCount++;
        } catch (error) {
          console.warn(`Failed to delete cache file ${file}:`, error.message);
        }
      }
      
      return { deletedCount };
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
      throw error;
    }
  }

  /**
   * Batch cache multiple images
   */
  static async batchCacheImages(urls, concurrency = 3) {
    const results = [];
    const errors = [];
    
    // Process URLs in batches to avoid overwhelming the server
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (url) => {
        try {
          const result = await this.getCachedImage(url);
          return { url, status: 'success', result };
        } catch (error) {
          return { url, status: 'error', error: error.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'success') {
          results.push(result);
        } else {
          errors.push(result);
        }
      });
      
      // Small delay between batches
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      successful: results.length,
      failed: errors.length,
      total: urls.length,
      results,
      errors
    };
  }

  /**
   * Validate cached file integrity
   */
  static async validateCachedFile(cacheKey) {
    try {
      const cachePath = this.getCachePath(cacheKey);
      const stats = await fs.stat(cachePath);
      
      // Check file size
      if (stats.size === 0) {
        return { valid: false, reason: 'Empty file' };
      }
      
      if (stats.size > this.MAX_FILE_SIZE) {
        return { valid: false, reason: 'File too large' };
      }
      
      // Basic file header check for common image formats
      const buffer = await fs.readFile(cachePath, { encoding: null });
      const header = buffer.slice(0, 4);
      
      // Check for common image file signatures
      const signatures = {
        'jpeg': [0xFF, 0xD8, 0xFF],
        'png': [0x89, 0x50, 0x4E, 0x47],
        'webp': [0x57, 0x45, 0x42, 0x50] // Actually RIFF header, but WebP is inside
      };
      
      let validSignature = false;
      for (const [format, signature] of Object.entries(signatures)) {
        if (signature.every((byte, index) => header[index] === byte)) {
          validSignature = true;
          break;
        }
      }
      
      return {
        valid: validSignature,
        reason: validSignature ? 'Valid image file' : 'Invalid image signature',
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Get cache usage by age
   */
  static async getCacheUsageByAge() {
    try {
      await this.initializeCache();
      
      const files = await fs.readdir(this.CACHE_DIR);
      const usage = {
        last24h: 0,
        last7days: 0,
        last30days: 0,
        older: 0
      };
      
      const now = Date.now();
      
      for (const file of files) {
        try {
          const filePath = path.join(this.CACHE_DIR, file);
          const stats = await fs.stat(filePath);
          const age = now - stats.mtime.getTime();
          
          if (age < 24 * 60 * 60 * 1000) {
            usage.last24h++;
          } else if (age < 7 * 24 * 60 * 60 * 1000) {
            usage.last7days++;
          } else if (age < 30 * 24 * 60 * 60 * 1000) {
            usage.last30days++;
          } else {
            usage.older++;
          }
        } catch (error) {
          continue;
        }
      }
      
      return usage;
    } catch (error) {
      console.error('Failed to get cache usage:', error.message);
      throw error;
    }
  }
}

module.exports = ImageCacheService;