#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const DefaultImage = require('../models/DefaultImage');

class DefaultImageRenamer {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      ...options
    };
    
    this.defaultImagesDir = path.join(__dirname, '../../uploads/default-images');
    
    this.stats = {
      total: 0,
      renamed: 0,
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
   * Create a safe filename from brand and model
   */
  createSafeFilename(brand, model) {
    // Remove special characters and replace spaces with dashes
    const safeBrand = brand.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const safeModel = model.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    return `${safeBrand}-${safeModel}.jpg`.toLowerCase();
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique filename if there's a conflict
   */
  async generateUniqueFilename(baseFilename, targetDir) {
    let filename = baseFilename;
    let counter = 1;
    
    while (await this.fileExists(path.join(targetDir, filename))) {
      const namePart = baseFilename.replace('.jpg', '');
      filename = `${namePart}-${counter}.jpg`;
      counter++;
    }
    
    return filename;
  }

  /**
   * Rename a single default image
   */
  async renameImage(defaultImage) {
    const { id, brand, model, image_url } = defaultImage;
    
    try {
      // Skip if image_url doesn't start with /uploads/default-images/
      if (!image_url || !image_url.startsWith('/uploads/default-images/')) {
        this.log(`⏭️  Skipping ${brand} ${model} - not a local default image`, 'debug');
        this.stats.skipped++;
        return { status: 'skipped', reason: 'not_local_image' };
      }

      // Extract current filename
      const currentFilename = path.basename(image_url);
      const currentPath = path.join(this.defaultImagesDir, currentFilename);

      // Check if current file exists
      if (!(await this.fileExists(currentPath))) {
        this.log(`❌ File not found for ${brand} ${model}: ${currentPath}`, 'error');
        this.stats.failed++;
        return { status: 'failed', reason: 'file_not_found' };
      }

      // Generate new filename
      const baseNewFilename = this.createSafeFilename(brand, model);
      const newFilename = await this.generateUniqueFilename(baseNewFilename, this.defaultImagesDir);
      const newPath = path.join(this.defaultImagesDir, newFilename);
      const newImageUrl = `/uploads/default-images/${newFilename}`;

      // Check if already has the correct name
      if (currentFilename === newFilename) {
        this.log(`⏭️  Skipping ${brand} ${model} - already has correct name: ${newFilename}`, 'debug');
        this.stats.skipped++;
        return { status: 'skipped', reason: 'already_correct_name' };
      }

      if (this.options.dryRun) {
        this.log(`🔍 [DRY RUN] Would rename: ${currentFilename} → ${newFilename}`, 'debug');
        this.stats.renamed++;
        return { 
          status: 'would_rename', 
          oldFilename: currentFilename, 
          newFilename,
          newImageUrl
        };
      }

      // Rename the file
      await fs.rename(currentPath, newPath);

      // Update database record
      const updatedImage = DefaultImage.update(id, {
        image_url: newImageUrl,
        updated_at: new Date().toISOString()
      });

      this.log(`✅ Renamed ${brand} ${model}: ${currentFilename} → ${newFilename}`, 'success');
      this.stats.renamed++;

      return {
        status: 'renamed',
        oldFilename: currentFilename,
        newFilename,
        oldImageUrl: image_url,
        newImageUrl
      };

    } catch (error) {
      this.log(`❌ Failed to rename ${brand} ${model}: ${error.message}`, 'error');
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
   * Run the renaming process
   */
  async run() {
    try {
      this.log('🚀 Starting Default Image Renaming...');
      
      if (this.options.dryRun) {
        this.log('🔍 Running in DRY RUN mode - no changes will be made', 'warning');
      }

      // Get all default images
      const allImages = DefaultImage.findAll();
      this.stats.total = allImages.length;
      
      this.log(`📊 Found ${this.stats.total} default images to process`);

      // Process each image
      const results = [];
      for (const image of allImages) {
        const result = await this.renameImage(image);
        results.push({ ...image, renameResult: result });
        
        // Progress indicator
        const processed = this.stats.renamed + this.stats.skipped + this.stats.failed;
        if (processed % 10 === 0) {
          const progress = Math.round((processed / this.stats.total) * 100);
          this.log(`📈 Progress: ${processed}/${this.stats.total} (${progress}%)`);
        }
      }

      return this.generateReport(results);

    } catch (error) {
      this.log(`❌ Renaming failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate renaming report
   */
  generateReport(results = []) {
    const duration = Date.now() - this.stats.startTime;
    const successRate = this.stats.total > 0 ? 
      Math.round((this.stats.renamed / this.stats.total) * 100) : 100;

    const report = {
      renaming: 'completed',
      stats: this.stats,
      duration: `${Math.round(duration / 1000)}s`,
      successRate: `${successRate}%`,
      dryRun: this.options.dryRun,
      results: results.length > 0 ? results : undefined
    };

    this.log('');
    this.log('📊 Renaming Report:');
    this.log(`   Total images: ${this.stats.total}`);
    this.log(`   Renamed: ${this.stats.renamed}`);
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

    // Show some examples of renames
    const renamedResults = results.filter(r => 
      r.renameResult.status === 'renamed' || r.renameResult.status === 'would_rename'
    ).slice(0, 5);

    if (renamedResults.length > 0) {
      this.log('');
      this.log('📝 Example renames:');
      renamedResults.forEach(result => {
        const { brand, model, renameResult } = result;
        this.log(`   ${brand} ${model}: ${renameResult.oldFilename} → ${renameResult.newFilename}`);
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

  const renamer = new DefaultImageRenamer({
    dryRun,
    verbose
  });

  renamer.run()
    .then(report => {
      console.log('\n✅ Renaming completed successfully');
      if (dryRun) {
        console.log('ℹ️  This was a dry run. Use without --dry-run to perform actual renaming.');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Renaming failed:', error.message);
      process.exit(1);
    });
}

module.exports = DefaultImageRenamer;