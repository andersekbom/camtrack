#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const DefaultImage = require('../models/DefaultImage');
const { v4: uuidv4 } = require('uuid');

class ImageStorageConsolidator {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      deleteOriginals: true,
      ...options
    };
    
    this.cachedImagesDir = path.join(__dirname, '../cached_images');
    this.targetDir = path.join(__dirname, '../../uploads/default-images');
    
    this.stats = {
      totalFound: 0,
      moved: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      startTime: Date.now()
    };
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
   * Check if cached images directory exists
   */
  async checkCachedImagesDirectory() {
    try {
      await fs.access(this.cachedImagesDir);
      const files = await fs.readdir(this.cachedImagesDir);
      const imageFiles = files.filter(file => 
        file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      this.stats.totalFound = imageFiles.length;
      this.log(`📁 Found ${imageFiles.length} cached images in ${this.cachedImagesDir}`);
      
      return imageFiles;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.log('📁 No cached images directory found', 'info');
        return [];
      }
      throw error;
    }
  }

  /**
   * Ensure target directory exists
   */
  async ensureTargetDirectory() {
    try {
      await fs.access(this.targetDir);
    } catch (error) {
      await fs.mkdir(this.targetDir, { recursive: true });
      this.log(`📁 Created target directory: ${this.targetDir}`);
    }
  }

  /**
   * Move a cached image to the uploads directory
   */
  async moveCachedImage(filename) {
    try {
      const sourcePath = path.join(this.cachedImagesDir, filename);
      const newFilename = `${uuidv4()}.jpg`;
      const targetPath = path.join(this.targetDir, newFilename);
      const relativePath = `/uploads/default-images/${newFilename}`;

      if (this.options.dryRun) {
        this.log(`🔍 [DRY RUN] Would move ${filename} to ${newFilename}`, 'debug');
        return {
          moved: true,
          originalPath: `/cached-images/${filename}`,
          newPath: relativePath,
          dryRun: true
        };
      }

      // Copy the file to new location
      await fs.copyFile(sourcePath, targetPath);

      // Get file stats
      const stats = await fs.stat(targetPath);

      this.log(`✅ Moved cached image: ${filename} → ${newFilename} (${Math.round(stats.size / 1024)}KB)`, 'success');
      this.stats.moved++;

      // Optionally delete original
      if (this.options.deleteOriginals) {
        try {
          await fs.unlink(sourcePath);
          this.log(`🗑️  Deleted original: ${filename}`, 'debug');
        } catch (deleteError) {
          this.log(`⚠️  Could not delete original ${filename}: ${deleteError.message}`, 'warning');
        }
      }

      return {
        moved: true,
        originalPath: `/cached-images/${filename}`,
        newPath: relativePath,
        fileSize: stats.size
      };

    } catch (error) {
      this.log(`❌ Failed to move ${filename}: ${error.message}`, 'error');
      this.stats.failed++;
      this.stats.errors.push({
        filename,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { moved: false, error: error.message };
    }
  }

  /**
   * Update database references to point to new paths
   */
  async updateDatabaseReferences(pathMappings) {
    const allImages = DefaultImage.findAll();
    let updatedCount = 0;

    for (const image of allImages) {
      const oldPath = image.image_url;
      
      // Check if this image uses a cached path that we moved
      const mapping = pathMappings.find(m => m.originalPath === oldPath);
      
      if (mapping && mapping.moved) {
        try {
          if (this.options.dryRun) {
            this.log(`🔍 [DRY RUN] Would update ${image.brand} ${image.model}: ${oldPath} → ${mapping.newPath}`, 'debug');
            updatedCount++;
            continue;
          }

          DefaultImage.update(image.id, {
            image_url: mapping.newPath,
            updated_at: new Date().toISOString()
          });

          this.log(`✅ Updated DB reference for ${image.brand} ${image.model}: ${mapping.newPath}`, 'success');
          updatedCount++;

        } catch (error) {
          this.log(`❌ Failed to update DB for ${image.brand} ${image.model}: ${error.message}`, 'error');
          this.stats.errors.push({
            imageId: image.id,
            brand: image.brand,
            model: image.model,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    this.stats.updated = updatedCount;
    this.log(`📊 Updated ${updatedCount} database references`);
    
    return updatedCount;
  }

  /**
   * Clean up any remaining cached image references in database
   */
  async cleanupCachedReferences() {
    const allImages = DefaultImage.findAll();
    const cachedReferences = allImages.filter(img => 
      img.image_url && img.image_url.startsWith('/cached-images/')
    );

    if (cachedReferences.length === 0) {
      this.log('✅ No cached image references found in database', 'success');
      return 0;
    }

    this.log(`⚠️  Found ${cachedReferences.length} images still referencing cached paths:`, 'warning');
    cachedReferences.forEach(img => {
      this.log(`   - ${img.brand} ${img.model}: ${img.image_url}`, 'warning');
    });

    return cachedReferences.length;
  }

  /**
   * Run the consolidation process
   */
  async run() {
    try {
      this.log('🚀 Starting Image Storage Consolidation...');
      
      if (this.options.dryRun) {
        this.log('🔍 Running in DRY RUN mode - no changes will be made', 'warning');
      }

      // Check for cached images
      const cachedFiles = await this.checkCachedImagesDirectory();
      
      if (cachedFiles.length === 0) {
        this.log('ℹ️  No cached images to consolidate');
        await this.cleanupCachedReferences();
        return this.generateReport();
      }

      // Ensure target directory exists
      await this.ensureTargetDirectory();

      // Move all cached images
      this.log(`📦 Moving ${cachedFiles.length} cached images...`);
      const pathMappings = [];

      for (const filename of cachedFiles) {
        const result = await this.moveCachedImage(filename);
        pathMappings.push({
          filename,
          originalPath: `/cached-images/${filename}`,
          newPath: result.newPath,
          moved: result.moved,
          error: result.error
        });

        // Progress indicator
        if (pathMappings.length % 10 === 0) {
          const progress = Math.round((pathMappings.length / cachedFiles.length) * 100);
          this.log(`📈 Progress: ${pathMappings.length}/${cachedFiles.length} (${progress}%)`);
        }
      }

      // Update database references
      this.log('🔄 Updating database references...');
      await this.updateDatabaseReferences(pathMappings);

      // Check for any remaining cached references
      await this.cleanupCachedReferences();

      return this.generateReport();

    } catch (error) {
      this.log(`❌ Consolidation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate consolidation report
   */
  generateReport() {
    const duration = Date.now() - this.stats.startTime;
    const successRate = this.stats.totalFound > 0 ? 
      Math.round((this.stats.moved / this.stats.totalFound) * 100) : 100;

    const report = {
      consolidation: 'completed',
      stats: this.stats,
      duration: `${Math.round(duration / 1000)}s`,
      successRate: `${successRate}%`,
      dryRun: this.options.dryRun
    };

    this.log('');
    this.log('📊 Consolidation Report:');
    this.log(`   Cached images found: ${this.stats.totalFound}`);
    this.log(`   Images moved: ${this.stats.moved}`);
    this.log(`   DB references updated: ${this.stats.updated}`);
    this.log(`   Failed: ${this.stats.failed}`);
    this.log(`   Success rate: ${successRate}%`);
    this.log(`   Duration: ${Math.round(duration / 1000)}s`);

    if (this.stats.errors.length > 0) {
      this.log('');
      this.log('❌ Errors:');
      this.stats.errors.forEach(error => {
        if (error.filename) {
          this.log(`   ${error.filename}: ${error.error}`);
        } else {
          this.log(`   ${error.brand} ${error.model}: ${error.error}`);
        }
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
  const keepOriginals = args.includes('--keep-originals');

  const consolidator = new ImageStorageConsolidator({
    dryRun,
    verbose,
    deleteOriginals: !keepOriginals
  });

  consolidator.run()
    .then(report => {
      console.log('\n✅ Consolidation completed successfully');
      if (dryRun) {
        console.log('ℹ️  This was a dry run. Use without --dry-run to perform actual consolidation.');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Consolidation failed:', error.message);
      process.exit(1);
    });
}

module.exports = ImageStorageConsolidator;