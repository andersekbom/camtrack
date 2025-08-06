#!/usr/bin/env node

const Camera = require('../models/Camera');
const DefaultImage = require('../models/DefaultImage');
const WikipediaImageService = require('../services/WikipediaImageService');
const ImageCacheService = require('../services/ImageCacheService');

class DefaultImagePopulator {
  constructor(options = {}) {
    this.options = {
      batchSize: 10,
      delayBetweenBatches: 2000, // 2 seconds
      delayBetweenImages: 1000, // 1 second
      enableCaching: true,
      skipExisting: true,
      minQuality: 4,
      dryRun: false,
      verbose: true,
      ...options
    };
    
    this.stats = {
      totalCameras: 0,
      uniqueModels: 0,
      processed: 0,
      successful: 0,
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

  async initialize() {
    this.log('🚀 Initializing Default Image Populator...');
    
    try {
      // Initialize image cache
      await ImageCacheService.initializeCache();
      this.log('📁 Image cache initialized');
      
      // Get existing cameras
      const allCameras = await this.getAllCamerasRaw();
      this.stats.totalCameras = allCameras.length;
      
      // Get unique brand/model combinations
      const uniqueModels = this.getUniqueModels(allCameras);
      this.stats.uniqueModels = uniqueModels.length;
      
      this.log(`📊 Found ${this.stats.totalCameras} cameras with ${this.stats.uniqueModels} unique models`);
      
      return uniqueModels;
    } catch (error) {
      this.log(`Failed to initialize: ${error.message}`, 'error');
      throw error;
    }
  }

  async getAllCamerasRaw() {
    // Get cameras without image enhancement to avoid circular dependency
    const db = require('../config/database');
    const stmt = db.prepare('SELECT id, brand, model, has_user_images FROM cameras ORDER BY brand, model');
    return stmt.all();
  }

  getUniqueModels(cameras) {
    const modelMap = new Map();
    
    cameras.forEach(camera => {
      if (!camera.brand || !camera.model) return;
      
      const key = `${camera.brand}|${camera.model}`;
      if (!modelMap.has(key)) {
        modelMap.set(key, {
          brand: camera.brand,
          model: camera.model,
          count: 1,
          hasUserImages: camera.has_user_images ? 1 : 0
        });
      } else {
        const existing = modelMap.get(key);
        existing.count++;
        existing.hasUserImages += camera.has_user_images ? 1 : 0;
      }
    });
    
    return Array.from(modelMap.values());
  }

  async checkExistingDefaultImage(brand, model) {
    try {
      const existing = DefaultImage.findByBrandAndModel(brand, model);
      return existing || null;
    } catch (error) {
      this.log(`Error checking existing image for ${brand} ${model}: ${error.message}`, 'debug');
      return null;
    }
  }

  async processModel(modelInfo) {
    const { brand, model, count } = modelInfo;
    this.log(`🔄 Processing: ${brand} ${model} (${count} cameras)`, 'debug');
    
    try {
      // Check if default image already exists
      if (this.options.skipExisting) {
        const existing = await this.checkExistingDefaultImage(brand, model);
        if (existing) {
          this.log(`⏭️  Skipping ${brand} ${model} - default image already exists (ID: ${existing.id})`, 'debug');
          this.stats.skipped++;
          return { status: 'skipped', reason: 'already_exists', existingId: existing.id };
        }
      }
      
      // Find best image from Wikipedia
      const bestImage = await WikipediaImageService.findBestImageForCamera(
        brand, 
        model, 
        this.options.enableCaching
      );
      
      if (!bestImage) {
        this.log(`❌ No image found for ${brand} ${model}`, 'debug');
        this.stats.failed++;
        return { status: 'failed', reason: 'no_image_found' };
      }
      
      // Check minimum quality requirements
      if (bestImage.image_quality < this.options.minQuality) {
        this.log(`⚠️  Image quality too low for ${brand} ${model}: ${bestImage.image_quality}`, 'debug');
        this.stats.failed++;
        return { status: 'failed', reason: 'quality_too_low', quality: bestImage.image_quality };
      }
      
      // Create default image record if not in dry run mode
      if (!this.options.dryRun) {
        const defaultImage = DefaultImage.create({
          brand,
          model,
          image_url: bestImage.image_url,
          source: bestImage.source,
          source_attribution: bestImage.source_attribution,
          image_quality: bestImage.image_quality
        });
        
        this.log(`✅ Created default image for ${brand} ${model} (ID: ${defaultImage.id}, Quality: ${bestImage.image_quality})`, 'success');
        this.stats.successful++;
        
        return { 
          status: 'success', 
          defaultImageId: defaultImage.id,
          imageUrl: bestImage.image_url,
          quality: bestImage.image_quality,
          cached: bestImage.cached || false
        };
      } else {
        this.log(`🔍 [DRY RUN] Would create default image for ${brand} ${model} (Quality: ${bestImage.image_quality})`, 'debug');
        this.stats.successful++;
        
        return { 
          status: 'success_dry_run',
          imageUrl: bestImage.image_url,
          quality: bestImage.image_quality
        };
      }
      
    } catch (error) {
      this.log(`❌ Error processing ${brand} ${model}: ${error.message}`, 'error');
      this.stats.failed++;
      this.stats.errors.push({
        brand,
        model,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { status: 'error', error: error.message };
    }
  }

  async processBatch(models) {
    const results = [];
    
    for (const model of models) {
      const result = await this.processModel(model);
      results.push({ ...model, result });
      this.stats.processed++;
      
      // Progress indicator
      if (this.stats.processed % 5 === 0) {
        const progress = Math.round((this.stats.processed / this.stats.uniqueModels) * 100);
        this.log(`📈 Progress: ${this.stats.processed}/${this.stats.uniqueModels} (${progress}%)`);
      }
      
      // Delay between images to be respectful to APIs
      if (this.options.delayBetweenImages > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delayBetweenImages));
      }
    }
    
    return results;
  }

  async run() {
    try {
      const uniqueModels = await this.initialize();
      
      if (uniqueModels.length === 0) {
        this.log('No unique camera models found to process', 'warning');
        return this.generateReport();
      }
      
      this.log(`🎯 Starting batch processing of ${uniqueModels.length} unique models...`);
      if (this.options.dryRun) {
        this.log('🔍 Running in DRY RUN mode - no changes will be made', 'warning');
      }
      
      // Process in batches
      const allResults = [];
      for (let i = 0; i < uniqueModels.length; i += this.options.batchSize) {
        const batch = uniqueModels.slice(i, i + this.options.batchSize);
        const batchNum = Math.floor(i / this.options.batchSize) + 1;
        const totalBatches = Math.ceil(uniqueModels.length / this.options.batchSize);
        
        this.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} models)...`);
        
        const batchResults = await this.processBatch(batch);
        allResults.push(...batchResults);
        
        // Delay between batches
        if (i + this.options.batchSize < uniqueModels.length && this.options.delayBetweenBatches > 0) {
          this.log(`⏸️  Waiting ${this.options.delayBetweenBatches}ms before next batch...`, 'debug');
          await new Promise(resolve => setTimeout(resolve, this.options.delayBetweenBatches));
        }
      }
      
      return this.generateReport(allResults);
      
    } catch (error) {
      this.log(`❌ Fatal error during processing: ${error.message}`, 'error');
      throw error;
    }
  }

  generateReport(results = []) {
    const duration = Date.now() - this.stats.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;
    
    this.log('\n' + '='.repeat(60));
    this.log('📊 DEFAULT IMAGE POPULATION REPORT');
    this.log('='.repeat(60));
    
    this.log(`⏱️  Duration: ${durationMinutes} minutes`);
    this.log(`📋 Total cameras: ${this.stats.totalCameras}`);
    this.log(`🎯 Unique models: ${this.stats.uniqueModels}`);
    this.log(`⚙️  Processed: ${this.stats.processed}`);
    this.log(`✅ Successful: ${this.stats.successful}`);
    this.log(`⏭️  Skipped: ${this.stats.skipped}`);
    this.log(`❌ Failed: ${this.stats.failed}`);
    
    const successRate = this.stats.processed > 0 
      ? Math.round((this.stats.successful / this.stats.processed) * 100) 
      : 0;
    this.log(`📈 Success rate: ${successRate}%`);
    
    // Show sample successes
    if (results.length > 0) {
      const successes = results.filter(r => r.result.status === 'success' || r.result.status === 'success_dry_run');
      if (successes.length > 0) {
        this.log('\n📸 Sample successful assignments:');
        successes.slice(0, 5).forEach(r => {
          const status = this.options.dryRun ? '[DRY RUN]' : '';
          this.log(`  ✅ ${r.brand} ${r.model} ${status} (Quality: ${r.result.quality})`, 'success');
        });
        if (successes.length > 5) {
          this.log(`  ... and ${successes.length - 5} more`);
        }
      }
    }
    
    // Show errors
    if (this.stats.errors.length > 0) {
      this.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 10).forEach(error => {
        this.log(`  • ${error.brand} ${error.model}: ${error.error}`, 'error');
      });
      if (this.stats.errors.length > 10) {
        this.log(`  ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
    
    // Cache statistics
    if (this.options.enableCaching) {
      this.log('\n💾 Cache performance will be available via /api/cache/stats');
    }
    
    this.log('='.repeat(60));
    
    return {
      stats: this.stats,
      results: results,
      duration: durationMinutes,
      successRate
    };
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-cache':
        options.enableCaching = false;
        break;
      case '--include-existing':
        options.skipExisting = false;
        break;
      case '--min-quality':
        options.minQuality = parseInt(args[++i]) || 4;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 10;
        break;
      case '--delay':
        options.delayBetweenImages = parseInt(args[++i]) || 1000;
        break;
      case '--quiet':
        options.verbose = false;
        break;
      case '--help':
        console.log(`
Usage: node populate-default-images.js [options]

Options:
  --dry-run              Run without making changes (preview mode)
  --no-cache             Disable image caching
  --include-existing     Process models that already have default images
  --min-quality N        Minimum image quality (1-10, default: 4)
  --batch-size N         Process N models at a time (default: 10)
  --delay N              Delay between images in ms (default: 1000)
  --quiet                Reduce output verbosity
  --help                 Show this help message

Examples:
  node populate-default-images.js --dry-run
  node populate-default-images.js --min-quality 6 --batch-size 5
  node populate-default-images.js --include-existing --no-cache
        `);
        process.exit(0);
    }
  }
  
  const populator = new DefaultImagePopulator(options);
  
  try {
    const report = await populator.run();
    
    if (report.stats.failed > 0 || report.stats.errors.length > 0) {
      process.exit(1); // Exit with error code if there were failures
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DefaultImagePopulator;