const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class ImageDownloadService {
  constructor() {
    this.downloadDir = path.join(__dirname, '../../uploads/default-images');
    this.maxFileSize = 500 * 1024; // 500KB max
    this.maxWidth = 800;
    this.maxHeight = 600;
    this.jpegQuality = 85;
  }

  /**
   * Download and process an image from a URL
   * @param {string} imageUrl - The URL of the image to download
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Download result with local file path
   */
  async downloadAndProcessImage(imageUrl, options = {}) {
    try {
      console.log(`📥 Downloading image from: ${imageUrl}`);

      // Generate unique filename
      const fileId = uuidv4();
      const tempFilename = `${fileId}_temp`;
      const finalFilename = `${fileId}.jpg`;
      const tempFilePath = path.join(this.downloadDir, tempFilename);
      const finalFilePath = path.join(this.downloadDir, finalFilename);

      // Ensure directory exists
      await this.ensureDirectoryExists();

      // Download the image
      const response = await this.fetchWithTimeout(imageUrl, 30000);
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Get the image buffer
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      // Save temporary file
      await fs.writeFile(tempFilePath, imageBuffer);

      // Process the image with Sharp
      const processedImageInfo = await this.processImage(tempFilePath, finalFilePath, options);

      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn(`Warning: Could not delete temp file: ${cleanupError.message}`);
      }

      // Return the local file path
      const relativePath = `/uploads/default-images/${finalFilename}`;
      
      console.log(`✅ Image processed and saved: ${relativePath}`);
      console.log(`📊 Original size: ${Math.round(imageBuffer.length / 1024)}KB, Final size: ${Math.round(processedImageInfo.size / 1024)}KB`);

      return {
        success: true,
        localPath: relativePath,
        filename: finalFilename,
        originalSize: imageBuffer.length,
        finalSize: processedImageInfo.size,
        dimensions: {
          width: processedImageInfo.width,
          height: processedImageInfo.height
        },
        compressionRatio: Math.round((1 - processedImageInfo.size / imageBuffer.length) * 100)
      };

    } catch (error) {
      console.error(`❌ Failed to download and process image: ${error.message}`);
      throw new Error(`Image download failed: ${error.message}`);
    }
  }

  /**
   * Process an image file with compression and resizing
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path for output image
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processing result
   */
  async processImage(inputPath, outputPath, options = {}) {
    const {
      maxWidth = this.maxWidth,
      maxHeight = this.maxHeight,
      quality = this.jpegQuality,
      maxFileSize = this.maxFileSize
    } = options;

    try {
      // Get image metadata
      const imageInfo = await sharp(inputPath).metadata();
      console.log(`🔍 Original image: ${imageInfo.width}x${imageInfo.height}, format: ${imageInfo.format}`);

      // Calculate resize dimensions if needed
      let resizeOptions = null;
      if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
        resizeOptions = {
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        };
      }

      // Start with initial quality
      let currentQuality = quality;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        attempts++;
        
        // Create Sharp pipeline
        let pipeline = sharp(inputPath);
        
        // Apply resize if needed
        if (resizeOptions) {
          pipeline = pipeline.resize(resizeOptions);
        }
        
        // Convert to JPEG with quality setting
        pipeline = pipeline.jpeg({ 
          quality: currentQuality,
          progressive: true,
          mozjpeg: true
        });

        // Process the image
        const outputBuffer = await pipeline.toBuffer();
        
        // Check file size
        if (outputBuffer.length <= maxFileSize || currentQuality <= 30) {
          // Save the final image
          await fs.writeFile(outputPath, outputBuffer);
          
          // Get final dimensions
          const finalInfo = await sharp(outputPath).metadata();
          
          return {
            width: finalInfo.width,
            height: finalInfo.height,
            size: outputBuffer.length,
            quality: currentQuality,
            attempts
          };
        }
        
        // Reduce quality for next attempt
        currentQuality = Math.max(30, currentQuality - 15);
        console.log(`🔄 File too large (${Math.round(outputBuffer.length / 1024)}KB), reducing quality to ${currentQuality}%`);
      }

      throw new Error(`Could not compress image to under ${Math.round(maxFileSize / 1024)}KB after ${maxAttempts} attempts`);

    } catch (error) {
      console.error(`❌ Image processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch with timeout
   * @param {string} url - URL to fetch
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithTimeout(url, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'CamTracker/1.0 (Image Download Service)'
        }
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Ensure the download directory exists
   */
  async ensureDirectoryExists() {
    try {
      await fs.access(this.downloadDir);
    } catch (error) {
      await fs.mkdir(this.downloadDir, { recursive: true });
      console.log(`📁 Created directory: ${this.downloadDir}`);
    }
  }

  /**
   * Get file size in a human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  }

  /**
   * Validate if a URL is a valid image URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid image URL
   */
  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      const validHosts = ['upload.wikimedia.org', 'commons.wikimedia.org'];
      return validHosts.some(host => urlObj.hostname.includes(host));
    } catch {
      return false;
    }
  }

  /**
   * Clean up old temporary files
   */
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.downloadDir);
      const tempFiles = files.filter(file => file.includes('_temp'));
      
      for (const file of tempFiles) {
        const filePath = path.join(this.downloadDir, file);
        const stats = await fs.stat(filePath);
        
        // Delete temp files older than 1 hour
        if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      console.warn(`Warning: Cleanup failed: ${error.message}`);
    }
  }
}

module.exports = ImageDownloadService;