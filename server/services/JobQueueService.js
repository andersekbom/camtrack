const EventEmitter = require('events');

class JobQueueService extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.workers = new Map();
    this.isProcessing = false;
    this.nextJobId = 1;
    this.config = {
      maxConcurrency: 2,
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
      jobTimeout: 120000, // 2 minutes
      cleanupInterval: 300000, // 5 minutes
    };
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, this.config.cleanupInterval);
    
    this.startProcessing();
  }

  /**
   * Add a job to the queue
   */
  addJob(type, data, options = {}) {
    const jobId = this.nextJobId++;
    const job = {
      id: jobId,
      type,
      data,
      status: 'pending',
      priority: options.priority || 5,
      maxRetries: options.maxRetries || this.config.retryAttempts,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      error: null,
      result: null
    };
    
    this.jobs.set(jobId, job);
    this.emit('jobAdded', job);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
    
    return jobId;
  }

  /**
   * Get job status
   */
  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(filter = {}) {
    const jobs = Array.from(this.jobs.values());
    
    if (filter.status) {
      return jobs.filter(job => job.status === filter.status);
    }
    
    if (filter.type) {
      return jobs.filter(job => job.type === filter.type);
    }
    
    return jobs;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      activeWorkers: this.workers.size,
      maxConcurrency: this.config.maxConcurrency,
      isProcessing: this.isProcessing
    };
    
    return stats;
  }

  /**
   * Start processing jobs
   */
  async startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.emit('processingStarted');
    
    while (this.isProcessing) {
      // Check if we have available worker slots
      if (this.workers.size >= this.config.maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Find next job to process
      const nextJob = this.getNextJob();
      if (!nextJob) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // Start processing the job
      this.processJob(nextJob);
    }
  }

  /**
   * Stop processing jobs
   */
  stopProcessing() {
    this.isProcessing = false;
    this.emit('processingStopped');
  }

  /**
   * Get next job to process (priority queue)
   */
  getNextJob() {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        // Higher priority first
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Older jobs first for same priority
        return a.createdAt - b.createdAt;
      });
    
    return pendingJobs[0] || null;
  }

  /**
   * Process a single job
   */
  async processJob(job) {
    const workerId = `worker_${job.id}_${Date.now()}`;
    
    try {
      // Mark job as running
      job.status = 'running';
      job.attempts++;
      job.updatedAt = new Date();
      job.startedAt = new Date();
      
      // Add to active workers
      this.workers.set(workerId, { jobId: job.id, startedAt: new Date() });
      
      this.emit('jobStarted', job);
      
      // Set timeout for job
      const timeoutId = setTimeout(() => {
        this.handleJobTimeout(job, workerId);
      }, this.config.jobTimeout);
      
      // Process the job based on type
      let result;
      switch (job.type) {
        case 'fetch-default-image':
          result = await this.processFetchDefaultImageJob(job.data);
          break;
        case 'cache-image':
          result = await this.processCacheImageJob(job.data);
          break;
        case 'cleanup-cache':
          result = await this.processCleanupCacheJob(job.data);
          break;
        case 'populate-default-images':
          result = await this.processPopulateDefaultImagesJob(job.data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Mark job as completed
      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      job.updatedAt = new Date();
      
      this.emit('jobCompleted', job);
      
    } catch (error) {
      this.handleJobError(job, error);
    } finally {
      // Remove from active workers
      this.workers.delete(workerId);
      job.updatedAt = new Date();
    }
  }

  /**
   * Handle job timeout
   */
  handleJobTimeout(job, workerId) {
    const error = new Error(`Job timed out after ${this.config.jobTimeout}ms`);
    this.handleJobError(job, error);
    this.workers.delete(workerId);
  }

  /**
   * Handle job error
   */
  async handleJobError(job, error) {
    job.error = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    };
    
    if (job.attempts < job.maxRetries) {
      // Retry the job
      job.status = 'pending';
      job.updatedAt = new Date();
      
      this.emit('jobRetry', job);
      
      // Add delay before retry
      setTimeout(() => {
        // Job will be picked up in next processing cycle
      }, this.config.retryDelay);
      
    } else {
      // Mark as failed
      job.status = 'failed';
      job.failedAt = new Date();
      job.updatedAt = new Date();
      
      this.emit('jobFailed', job);
    }
  }

  /**
   * Process fetch default image job
   */
  async processFetchDefaultImageJob(data) {
    const { brand, model, cameraId } = data;
    
    const WikipediaImageService = require('./WikipediaImageService');
    const DefaultImage = require('../models/DefaultImage');
    
    // Check if default image already exists
    const existing = DefaultImage.findByBrandAndModel(brand, model);
    if (existing) {
      return { 
        action: 'skipped', 
        reason: 'default_image_exists',
        existingId: existing.id 
      };
    }
    
    // Find best image
    const bestImage = await WikipediaImageService.findBestImageForCamera(brand, model, true);
    
    if (!bestImage) {
      return { 
        action: 'failed', 
        reason: 'no_image_found' 
      };
    }
    
    // Create default image record
    const defaultImage = DefaultImage.create({
      brand,
      model,
      image_url: bestImage.image_url,
      source: bestImage.source,
      source_attribution: bestImage.source_attribution,
      image_quality: bestImage.image_quality
    });
    
    return {
      action: 'created',
      defaultImageId: defaultImage.id,
      imageUrl: bestImage.image_url,
      quality: bestImage.image_quality,
      cached: bestImage.cached || false
    };
  }

  /**
   * Process cache image job
   */
  async processCacheImageJob(data) {
    const { imageUrl } = data;
    
    const ImageCacheService = require('./ImageCacheService');
    
    const cachedImage = await ImageCacheService.getCachedImage(imageUrl);
    
    return {
      action: 'cached',
      cacheKey: cachedImage.cacheKey,
      size: cachedImage.size,
      url: cachedImage.url
    };
  }

  /**
   * Process cleanup cache job
   */
  async processCleanupCacheJob(data) {
    const ImageCacheService = require('./ImageCacheService');
    
    const result = await ImageCacheService.cleanupExpiredCache();
    
    return {
      action: 'cleanup',
      deletedCount: result.deletedCount,
      errorCount: result.errorCount
    };
  }

  /**
   * Process populate default images job
   */
  async processPopulateDefaultImagesJob(data) {
    const DefaultImagePopulator = require('../scripts/populate-default-images');
    
    const { 
      dryRun = false, 
      enableCaching = true, 
      skipExisting = true, 
      minQuality = 4,
      batchSize = 10 
    } = data;
    
    const populator = new DefaultImagePopulator({
      dryRun,
      enableCaching,
      skipExisting,
      minQuality,
      batchSize,
      verbose: false // Reduce verbosity in job context
    });
    
    const report = await populator.run();
    
    return {
      action: 'populate-completed',
      stats: report.stats,
      duration: report.duration,
      successRate: report.successRate,
      dryRun
    };
  }

  /**
   * Clean up old completed/failed jobs
   */
  cleanupOldJobs() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    let cleanedCount = 0;
    
    for (const [jobId, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') && 
          job.updatedAt < cutoffTime) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.emit('jobsCleanedUp', { count: cleanedCount });
    }
  }

  /**
   * Schedule automatic default image fetching for new camera
   */
  scheduleDefaultImageFetch(cameraData) {
    const { id: cameraId, brand, model, has_user_images } = cameraData;
    
    // Skip if camera already has user images
    if (has_user_images) {
      return null;
    }
    
    // Skip if brand or model is missing
    if (!brand || !model) {
      return null;
    }
    
    // Add job with medium priority
    const jobId = this.addJob('fetch-default-image', {
      cameraId,
      brand: brand.trim(),
      model: model.trim()
    }, {
      priority: 6
    });
    
    return jobId;
  }

  /**
   * Schedule image caching
   */
  scheduleCacheImage(imageUrl) {
    if (!imageUrl) return null;
    
    const jobId = this.addJob('cache-image', {
      imageUrl
    }, {
      priority: 3 // Lower priority than default image fetching
    });
    
    return jobId;
  }

  /**
   * Schedule cache cleanup
   */
  scheduleCacheCleanup() {
    const jobId = this.addJob('cleanup-cache', {}, {
      priority: 1 // Lowest priority
    });
    
    return jobId;
  }

  /**
   * Clear all jobs
   */
  clearAllJobs() {
    const count = this.jobs.size;
    this.jobs.clear();
    this.emit('allJobsCleared', { count });
    return count;
  }

  /**
   * Shutdown the job queue service
   */
  shutdown() {
    this.stopProcessing();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.removeAllListeners();
    this.emit('shutdown');
  }
}

// Create singleton instance
const jobQueueService = new JobQueueService();

module.exports = jobQueueService;