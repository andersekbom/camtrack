const jobQueue = require('../services/JobQueueService');

class JobsController {
  // GET /api/jobs/stats - Get job queue statistics
  static async getJobStats(req, res) {
    try {
      const stats = jobQueue.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting job stats:', error);
      res.status(500).json({ error: 'Failed to get job statistics' });
    }
  }

  // GET /api/jobs - Get all jobs
  static async getAllJobs(req, res) {
    try {
      const { status, type, limit = 50, offset = 0 } = req.query;
      
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      
      let jobs = jobQueue.getAllJobs(filter);
      
      // Sort by creation time (newest first)
      jobs = jobs.sort((a, b) => b.createdAt - a.createdAt);
      
      // Apply pagination
      const totalJobs = jobs.length;
      const limitNum = Math.min(parseInt(limit), 100); // Max 100 jobs per request
      const offsetNum = parseInt(offset);
      
      jobs = jobs.slice(offsetNum, offsetNum + limitNum);
      
      res.json({
        jobs,
        pagination: {
          total: totalJobs,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalJobs
        }
      });
    } catch (error) {
      console.error('Error getting jobs:', error);
      res.status(500).json({ error: 'Failed to get jobs' });
    }
  }

  // GET /api/jobs/:jobId - Get specific job
  static async getJob(req, res) {
    try {
      const { jobId } = req.params;
      
      const jobIdNum = parseInt(jobId);
      if (isNaN(jobIdNum)) {
        return res.status(400).json({ error: 'Invalid job ID' });
      }
      
      const job = jobQueue.getJob(jobIdNum);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error getting job:', error);
      res.status(500).json({ error: 'Failed to get job' });
    }
  }

  // POST /api/jobs/fetch-default-image - Manually schedule default image fetch
  static async scheduleDefaultImageFetch(req, res) {
    try {
      const { brand, model, cameraId, priority = 5 } = req.body;
      
      if (!brand || !model) {
        return res.status(400).json({ 
          error: 'Brand and model are required' 
        });
      }

      const jobId = jobQueue.addJob('fetch-default-image', {
        cameraId: cameraId || null,
        brand: brand.trim(),
        model: model.trim()
      }, {
        priority: Math.max(1, Math.min(10, priority)) // Clamp between 1-10
      });
      
      res.status(201).json({
        message: 'Default image fetch job scheduled',
        jobId,
        brand,
        model
      });
    } catch (error) {
      console.error('Error scheduling default image fetch:', error);
      res.status(500).json({ error: 'Failed to schedule job' });
    }
  }

  // POST /api/jobs/cache-image - Manually schedule image caching
  static async scheduleCacheImage(req, res) {
    try {
      const { imageUrl, priority = 3 } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ 
          error: 'Image URL is required' 
        });
      }

      // Validate URL format
      try {
        new URL(imageUrl);
      } catch {
        return res.status(400).json({ 
          error: 'Invalid image URL format' 
        });
      }

      const jobId = jobQueue.addJob('cache-image', {
        imageUrl: imageUrl.trim()
      }, {
        priority: Math.max(1, Math.min(10, priority))
      });
      
      res.status(201).json({
        message: 'Image caching job scheduled',
        jobId,
        imageUrl
      });
    } catch (error) {
      console.error('Error scheduling image caching:', error);
      res.status(500).json({ error: 'Failed to schedule job' });
    }
  }

  // POST /api/jobs/cache-cleanup - Schedule cache cleanup
  static async scheduleCacheCleanup(req, res) {
    try {
      const { priority = 1 } = req.body;

      const jobId = jobQueue.addJob('cleanup-cache', {}, {
        priority: Math.max(1, Math.min(10, priority))
      });
      
      res.status(201).json({
        message: 'Cache cleanup job scheduled',
        jobId
      });
    } catch (error) {
      console.error('Error scheduling cache cleanup:', error);
      res.status(500).json({ error: 'Failed to schedule job' });
    }
  }

  // POST /api/jobs/start-processing - Start job processing
  static async startProcessing(req, res) {
    try {
      if (jobQueue.isProcessing) {
        return res.json({
          message: 'Job processing is already running',
          isProcessing: true
        });
      }
      
      jobQueue.startProcessing();
      
      res.json({
        message: 'Job processing started',
        isProcessing: true
      });
    } catch (error) {
      console.error('Error starting job processing:', error);
      res.status(500).json({ error: 'Failed to start job processing' });
    }
  }

  // POST /api/jobs/stop-processing - Stop job processing
  static async stopProcessing(req, res) {
    try {
      jobQueue.stopProcessing();
      
      res.json({
        message: 'Job processing stopped',
        isProcessing: false
      });
    } catch (error) {
      console.error('Error stopping job processing:', error);
      res.status(500).json({ error: 'Failed to stop job processing' });
    }
  }

  // POST /api/jobs/populate-default-images - Run default image population script
  static async populateDefaultImages(req, res) {
    try {
      const { 
        dryRun = false, 
        enableDownload = true, 
        skipExisting = true, 
        minQuality = 4,
        batchSize = 10,
        priority = 5 
      } = req.body;

      // Add a job to run the default image population
      const jobId = jobQueue.addJob('populate-default-images', {
        dryRun,
        enableDownload,
        skipExisting,
        minQuality: Math.max(1, Math.min(10, minQuality)),
        batchSize: Math.max(1, Math.min(50, batchSize))
      }, {
        priority: Math.max(1, Math.min(10, priority))
      });
      
      res.status(201).json({
        message: 'Default image population job scheduled',
        jobId,
        options: {
          dryRun,
          enableDownload,
          skipExisting,
          minQuality,
          batchSize
        }
      });
    } catch (error) {
      console.error('Error scheduling default image population:', error);
      res.status(500).json({ error: 'Failed to schedule default image population' });
    }
  }

  // DELETE /api/jobs/clear - Clear all completed/failed jobs
  static async clearJobs(req, res) {
    try {
      const { status } = req.query;
      
      if (status && !['completed', 'failed', 'all'].includes(status)) {
        return res.status(400).json({ 
          error: 'Status must be "completed", "failed", or "all"' 
        });
      }
      
      let clearedCount = 0;
      
      if (status === 'all') {
        clearedCount = jobQueue.clearAllJobs();
      } else {
        // Clear specific status jobs
        const allJobs = jobQueue.getAllJobs();
        for (const job of allJobs) {
          if (!status || job.status === status) {
            jobQueue.jobs.delete(job.id);
            clearedCount++;
          }
        }
      }
      
      res.json({
        message: `Cleared ${clearedCount} job(s)`,
        clearedCount
      });
    } catch (error) {
      console.error('Error clearing jobs:', error);
      res.status(500).json({ error: 'Failed to clear jobs' });
    }
  }

  // GET /api/jobs/types - Get available job types
  static async getJobTypes(req, res) {
    try {
      const jobTypes = [
        {
          type: 'fetch-default-image',
          description: 'Fetch default image for camera from Wikipedia Commons',
          priority: '1-10 (6 recommended)',
          requiredData: ['brand', 'model'],
          optionalData: ['cameraId']
        },
        {
          type: 'cache-image',
          description: 'Cache image from external URL locally',
          priority: '1-10 (3 recommended)',
          requiredData: ['imageUrl'],
          optionalData: []
        },
        {
          type: 'cleanup-cache',
          description: 'Clean up expired cached images',
          priority: '1-10 (1 recommended)',
          requiredData: [],
          optionalData: []
        },
        {
          type: 'populate-default-images',
          description: 'Run default image population for all camera models',
          priority: '1-10 (5 recommended)',
          requiredData: [],
          optionalData: ['dryRun', 'enableDownload', 'skipExisting', 'minQuality', 'batchSize']
        }
      ];
      
      res.json({
        jobTypes,
        config: {
          maxConcurrency: jobQueue.config.maxConcurrency,
          retryAttempts: jobQueue.config.retryAttempts,
          retryDelay: jobQueue.config.retryDelay,
          jobTimeout: jobQueue.config.jobTimeout
        }
      });
    } catch (error) {
      console.error('Error getting job types:', error);
      res.status(500).json({ error: 'Failed to get job types' });
    }
  }
}

module.exports = JobsController;