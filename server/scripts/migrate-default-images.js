#!/usr/bin/env node

const DefaultImage = require('../models/DefaultImage');
const ImageDownloadService = require('../services/ImageDownloadService');

class DefaultImageMigrator {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      batchSize: 5,
      delayBetweenDownloads: 1000,
      ...options
    };
    
    this.stats = {
      total: 0,
      processed: 0,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      startTime: Date.now()
    };
    
    this.imageDownloadService = new ImageDownloadService();
  }

  log(message, level = 'info') {
    if (!this.options.verbose && level === 'debug') return;
    
    const timestamp = new Date().toISOString().substr(11, 8);
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[level] || 'ℹ️';
    
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  /**
   * Check if an image URL needs migration
   * @param {string} imageUrl - The image URL to check
   * @returns {boolean} - True if needs migration
   */
  needsMigration(imageUrl) {
    if (!imageUrl) return false;
    
    // Already local uploads - no migration needed
    if (imageUrl.startsWith('/uploads/default-images/')) {
      return false;
    }
    
    // External URLs or cached images need migration
    return imageUrl.startsWith('https://') || 
           imageUrl.startsWith('http://') || 
           imageUrl.startsWith('/cached-images/');
  }

  /**
   * Migrate a single default image
   * @param {Object} defaultImage - The default image record
   * @returns {Promise<Object>} - Migration result
   */
  async migrateImage(defaultImage) {
    const { id, brand, model, image_url } = defaultImage;
    
    try {
      this.log(`🔄 Migrating: ${brand} ${model} (ID: ${id})`, 'debug');
      
      if (!this.needsMigration(image_url)) {
        this.log(`⏭️  Skipping ${brand} ${model} - already local`, 'debug');
        this.stats.skipped++;
        return { status: 'skipped', reason: 'already_local' };
      }

      // For cached images, try to find the original file first
      let downloadUrl = image_url;
      if (image_url.startsWith('/cached-images/')) {
        // Convert cached path to full local path
        const cachedPath = `server${image_url}`;
        try {
          const fs = require('fs').promises;
          await fs.access(cachedPath);
          // If cached file exists, we can skip downloading and just move it
          return await this.moveCachedImage(defaultImage, cachedPath);
        } catch {
          // Cached file doesn't exist, we'll need the original URL
          // For now, we'll skip cached images that don't have the file
          this.log(`⚠️  Cached file not found for ${brand} ${model}: ${image_url}`, 'warning');
          this.stats.skipped++;
          return { status: 'skipped', reason: 'cached_file_not_found' };
        }
      }

      if (!downloadUrl.startsWith('http')) {
        this.log(`❌ Invalid URL format for ${brand} ${model}: ${downloadUrl}`, 'error');
        this.stats.failed++;
        return { status: 'failed', reason: 'invalid_url' };
      }

      if (this.options.dryRun) {
        this.log(`🔍 [DRY RUN] Would migrate ${brand} ${model} from ${downloadUrl}`, 'debug');
        this.stats.migrated++;
        return { status: 'would_migrate', originalUrl: downloadUrl };
      }

      // Download and process the image
      const downloadResult = await this.imageDownloadService.downloadAndProcessImage(downloadUrl);
      
      if (!downloadResult.success) {
        throw new Error('Download failed');
      }

      // Update the database record
      const updatedImage = DefaultImage.update(id, {
        image_url: downloadResult.localPath,
        updated_at: new Date().toISOString()
      });

      this.log(`✅ Migrated ${brand} ${model}: ${downloadResult.localPath} (${Math.round(downloadResult.finalSize / 1024)}KB)`, 'success');
      this.stats.migrated++;

      return {
        status: 'migrated',
        originalUrl: downloadUrl,
        newPath: downloadResult.localPath,
        fileSize: downloadResult.finalSize,
        dimensions: downloadResult.dimensions,
        compressionRatio: downloadResult.compressionRatio
      };

    } catch (error) {
      this.log(`❌ Failed to migrate ${brand} ${model}: ${error.message}`, 'error');
      this.stats.failed++;
      this.stats.errors.push({
        id,
        brand,
        model,
        originalUrl: image_url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Move a cached image to the default-images directory
   * @param {Object} defaultImage - The default image record
   * @param {string} cachedPath - Path to the cached file
   * @returns {Promise<Object>} - Migration result
   */
  async moveCachedImage(defaultImage, cachedPath) {
    const { id, brand, model } = defaultImage;
    
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const { v4: uuidv4 } = require('uuid');

      // Generate new filename
      const newFilename = `${uuidv4()}.jpg`;
      const newPath = path.join(__dirname, '../../uploads/default-images', newFilename);
      const relativePath = `/uploads/default-images/${newFilename}`;

      if (this.options.dryRun) {
        this.log(`🔍 [DRY RUN] Would move cached file for ${brand} ${model}`, 'debug');
        this.stats.migrated++;
        return { status: 'would_move_cached' };
      }

      // Copy the cached file to the default-images directory
      await fs.copyFile(cachedPath, newPath);

      // Update the database record
      const updatedImage = DefaultImage.update(id, {
        image_url: relativePath,
        updated_at: new Date().toISOString()
      });

      // Get file stats
      const stats = await fs.stat(newPath);

      this.log(`✅ Moved cached image for ${brand} ${model}: ${relativePath} (${Math.round(stats.size / 1024)}KB)`, 'success');
      this.stats.migrated++;

      return {
        status: 'moved_cached',
        originalPath: cachedPath,
        newPath: relativePath,
        fileSize: stats.size
      };

    } catch (error) {
      this.log(`❌ Failed to move cached image for ${brand} ${model}: ${error.message}`, 'error');
      this.stats.failed++;
      
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Run the migration process
   * @returns {Promise<Object>} - Migration report
   */
  async run() {
    try {
      this.log('🚀 Starting Default Image Migration...');
      
      if (this.options.dryRun) {
        this.log('🔍 Running in DRY RUN mode - no changes will be made', 'warning');
      }

      // Get all default images
      const allImages = DefaultImage.findAll();
      this.stats.total = allImages.length;
      
      this.log(`📊 Found ${this.stats.total} default images to check`);

      // Filter images that need migration
      const imagesToMigrate = allImages.filter(img => this.needsMigration(img.image_url));
      
      this.log(`🎯 ${imagesToMigrate.length} images need migration`);

      if (imagesToMigrate.length === 0) {
        this.log('✅ No images need migration', 'success');
        return this.generateReport();
      }

      // Process in batches
      const results = [];
      for (let i = 0; i < imagesToMigrate.length; i += this.options.batchSize) {
        const batch = imagesToMigrate.slice(i, i + this.options.batchSize);
        const batchNum = Math.floor(i / this.options.batchSize) + 1;
        const totalBatches = Math.ceil(imagesToMigrate.length / this.options.batchSize);
        
        this.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} images)...`);
        
        for (const image of batch) {
          const result = await this.migrateImage(image);
          results.push({ ...image, migrationResult: result });
          this.stats.processed++;
          
          // Progress indicator
          if (this.stats.processed % 5 === 0) {
            const progress = Math.round((this.stats.processed / imagesToMigrate.length) * 100);
            this.log(`📈 Progress: ${this.stats.processed}/${imagesToMigrate.length} (${progress}%)`);
          }
          
          // Delay between downloads
          if (this.options.delayBetweenDownloads > 0) {
            await new Promise(resolve => setTimeout(resolve, this.options.delayBetweenDownloads));
          }
        }
        
        // Delay between batches
        if (i + this.options.batchSize < imagesToMigrate.length) {
          this.log('⏸️  Waiting before next batch...', 'debug');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return this.generateReport(results);

    } catch (error) {
      this.log(`❌ Migration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate migration report
   * @param {Array} results - Migration results
   * @returns {Object} - Report object
   */
  generateReport(results = []) {
    const duration = Date.now() - this.stats.startTime;
    const successRate = this.stats.total > 0 ? Math.round((this.stats.migrated / this.stats.total) * 100) : 0;

    const report = {
      migration: 'completed',
      stats: this.stats,
      duration: `${Math.round(duration / 1000)}s`,
      successRate: `${successRate}%`,
      dryRun: this.options.dryRun,
      results: results.length > 0 ? results : undefined
    };

    this.log('');
    this.log('📊 Migration Report:');
    this.log(`   Total images: ${this.stats.total}`);
    this.log(`   Processed: ${this.stats.processed}`);
    this.log(`   Migrated: ${this.stats.migrated}`);
    this.log(`   Skipped: ${this.stats.skipped}`);
    this.log(`   Failed: ${this.stats.failed}`);
    this.log(`   Success rate: ${successRate}%`);
    this.log(`   Duration: ${Math.round(duration / 1000)}s`);

    if (this.stats.errors.length > 0) {
      this.log('');
      this.log('❌ Errors:');
      this.stats.errors.forEach(error => {
        this.log(`   ${error.brand} ${error.model}: ${error.error}`);
      });
    }

    return report;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = !args.includes('--quiet');
  const batchSize = args.includes('--batch-size') ? 
    parseInt(args[args.indexOf('--batch-size') + 1]) : 5;

  const migrator = new DefaultImageMigrator({
    dryRun,
    verbose,
    batchSize
  });

  migrator.run()
    .then(report => {
      console.log('\n✅ Migration completed successfully');
      if (dryRun) {
        console.log('ℹ️  This was a dry run. Use without --dry-run to perform actual migration.');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = DefaultImageMigrator;