const PerformanceService = require('../services/PerformanceService');

class PerformanceController {
  // GET /api/performance/stats - Get current performance statistics
  static async getPerformanceStats(req, res) {
    try {
      const stats = PerformanceService.getPerformanceStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting performance stats:', error);
      res.status(500).json({ error: 'Failed to get performance statistics' });
    }
  }

  // GET /api/performance/report - Generate comprehensive performance report
  static async getPerformanceReport(req, res) {
    try {
      const report = PerformanceService.generatePerformanceReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating performance report:', error);
      res.status(500).json({ error: 'Failed to generate performance report' });
    }
  }

  // GET /api/performance/optimize - Analyze and get optimization recommendations
  static async getOptimizationRecommendations(req, res) {
    try {
      const analysis = await PerformanceService.optimizeImageLoading();
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing optimizations:', error);
      res.status(500).json({ error: 'Failed to analyze optimization opportunities' });
    }
  }

  // POST /api/performance/optimize/auto - Implement automatic optimizations
  static async implementAutoOptimizations(req, res) {
    try {
      const results = await PerformanceService.implementAutoOptimizations();
      res.json({
        message: 'Auto optimizations completed',
        ...results
      });
    } catch (error) {
      console.error('Error implementing auto optimizations:', error);
      res.status(500).json({ error: 'Failed to implement automatic optimizations' });
    }
  }

  // POST /api/performance/reset - Reset performance statistics
  static async resetPerformanceStats(req, res) {
    try {
      PerformanceService.resetStats();
      res.json({
        message: 'Performance statistics reset successfully',
        reset_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error resetting performance stats:', error);
      res.status(500).json({ error: 'Failed to reset performance statistics' });
    }
  }

  // GET /api/performance/monitor - Get real-time monitoring data
  static async getMonitoringData(req, res) {
    try {
      const stats = PerformanceService.getPerformanceStats();
      
      // Add system-level metrics
      const monitoring = {
        performance: stats,
        system: {
          memory_usage: process.memoryUsage(),
          uptime_seconds: process.uptime(),
          timestamp: new Date().toISOString()
        },
        health_status: this.calculateHealthStatus(stats)
      };

      res.json(monitoring);
    } catch (error) {
      console.error('Error getting monitoring data:', error);
      res.status(500).json({ error: 'Failed to get monitoring data' });
    }
  }

  // Helper method to calculate overall health status
  static calculateHealthStatus(stats) {
    const issues = [];
    let status = 'healthy';

    // Check cache performance
    if (stats.cacheHitRate < 50) {
      issues.push('Low cache hit rate');
      status = 'degraded';
    }

    // Check response time
    if (stats.averageResponseTime > 2000) {
      issues.push('High response times');
      status = 'degraded';
    }

    // Check for critical issues
    if (stats.averageResponseTime > 5000 || stats.cacheHitRate < 20) {
      status = 'critical';
    }

    return {
      status,
      grade: stats.performance_grade,
      issues,
      recommendations_count: stats.optimizationsSuggested.length,
      last_updated: new Date().toISOString()
    };
  }

  // GET /api/performance/trends - Get performance trends over time
  static async getPerformanceTrends(req, res) {
    try {
      const { hours = 24 } = req.query;
      
      // This would ideally store historical data in a database
      // For now, return current stats with trend simulation
      const currentStats = PerformanceService.getPerformanceStats();
      
      const trends = {
        timeframe_hours: parseInt(hours),
        current: currentStats,
        trends: {
          cache_hit_rate: {
            current: currentStats.cacheHitRate,
            change_24h: Math.random() * 10 - 5, // Simulated change
            trend: 'stable'
          },
          response_time: {
            current: currentStats.averageResponseTime,
            change_24h: Math.random() * 100 - 50, // Simulated change
            trend: 'improving'
          },
          request_volume: {
            current: currentStats.totalRequests,
            change_24h: Math.random() * 20, // Simulated growth
            trend: 'increasing'
          }
        },
        recommendations: currentStats.optimizationsSuggested
      };

      res.json(trends);
    } catch (error) {
      console.error('Error getting performance trends:', error);
      res.status(500).json({ error: 'Failed to get performance trends' });
    }
  }

  // POST /api/performance/track - Manually track a performance event
  static async trackPerformanceEvent(req, res) {
    try {
      const { 
        start_time, 
        was_cached = false, 
        image_size = null, 
        event_type = 'image_request' 
      } = req.body;

      if (!start_time) {
        return res.status(400).json({ 
          error: 'start_time is required' 
        });
      }

      const startTime = parseInt(start_time);
      PerformanceService.trackImageRequest(startTime, was_cached, image_size);

      const updatedStats = PerformanceService.getPerformanceStats();

      res.json({
        message: 'Performance event tracked successfully',
        event_type,
        response_time_ms: Date.now() - startTime,
        updated_stats: {
          total_requests: updatedStats.totalRequests,
          cache_hit_rate: updatedStats.cacheHitRate,
          average_response_time: updatedStats.averageResponseTime
        }
      });
    } catch (error) {
      console.error('Error tracking performance event:', error);
      res.status(500).json({ error: 'Failed to track performance event' });
    }
  }
}

module.exports = PerformanceController;