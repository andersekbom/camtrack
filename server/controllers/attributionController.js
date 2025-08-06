const AttributionService = require('../services/AttributionService');

class AttributionController {
  // GET /api/attribution/report - Get comprehensive attribution report
  static async getAttributionReport(req, res) {
    try {
      const report = await AttributionService.generateAttributionReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating attribution report:', error);
      res.status(500).json({ error: 'Failed to generate attribution report' });
    }
  }

  // GET /api/attribution/all - Get all attributions with validation
  static async getAllAttributions(req, res) {
    try {
      const data = await AttributionService.getAllAttributions();
      res.json(data);
    } catch (error) {
      console.error('Error getting attributions:', error);
      res.status(500).json({ error: 'Failed to get attributions' });
    }
  }

  // GET /api/attribution/validate/:imageId - Validate specific image attribution
  static async validateAttribution(req, res) {
    try {
      const { imageId } = req.params;
      
      // Get the image data first
      const DefaultImage = require('../models/DefaultImage');
      const image = DefaultImage.findById(parseInt(imageId));
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const validation = AttributionService.validateAttribution(image);
      const attribution = AttributionService.generateDetailedAttribution(image);

      res.json({
        image_id: parseInt(imageId),
        brand: image.brand,
        model: image.model,
        attribution,
        validation
      });
    } catch (error) {
      console.error('Error validating attribution:', error);
      res.status(500).json({ error: 'Failed to validate attribution' });
    }
  }

  // PUT /api/attribution/:imageId - Update attribution for specific image
  static async updateAttribution(req, res) {
    try {
      const { imageId } = req.params;
      const { source_attribution, author, license } = req.body;

      if (!source_attribution && !author && !license) {
        return res.status(400).json({ 
          error: 'At least one attribution field (source_attribution, author, license) is required' 
        });
      }

      const result = await AttributionService.updateAttribution(
        parseInt(imageId),
        { source_attribution, author, license }
      );

      res.json({
        message: 'Attribution updated successfully',
        ...result
      });
    } catch (error) {
      console.error('Error updating attribution:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update attribution' });
    }
  }

  // GET /api/attribution/export - Export attribution data
  static async exportAttributions(req, res) {
    try {
      const { format = 'json' } = req.query;
      
      if (!['json', 'csv'].includes(format.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Invalid format. Supported formats: json, csv' 
        });
      }

      const data = await AttributionService.exportAttributionData(format);
      
      if (format.toLowerCase() === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="camera_attributions.csv"');
      } else {
        res.setHeader('Content-Type', 'application/json');
      }
      
      res.send(data);
    } catch (error) {
      console.error('Error exporting attributions:', error);
      res.status(500).json({ error: 'Failed to export attribution data' });
    }
  }

  // GET /api/attribution/compliance - Get compliance statistics
  static async getComplianceStats(req, res) {
    try {
      const data = await AttributionService.getAllAttributions();
      
      const stats = {
        total_images: data.total,
        compliant_images: data.valid,
        non_compliant_images: data.invalid,
        compliance_rate: data.summary.compliance_rate,
        common_issues: data.summary.common_issues,
        by_source: {}
      };

      // Calculate compliance by source
      data.attributions.forEach(attr => {
        const source = attr.attribution?.source || 'Unknown';
        if (!stats.by_source[source]) {
          stats.by_source[source] = {
            total: 0,
            compliant: 0,
            compliance_rate: 0
          };
        }
        
        stats.by_source[source].total++;
        if (attr.validation.valid) {
          stats.by_source[source].compliant++;
        }
      });

      // Calculate compliance rates by source
      Object.keys(stats.by_source).forEach(source => {
        const sourceStats = stats.by_source[source];
        sourceStats.compliance_rate = sourceStats.total > 0 
          ? Math.round((sourceStats.compliant / sourceStats.total) * 100)
          : 0;
      });

      res.json(stats);
    } catch (error) {
      console.error('Error getting compliance stats:', error);
      res.status(500).json({ error: 'Failed to get compliance statistics' });
    }
  }

  // POST /api/attribution/batch-validate - Validate multiple attributions
  static async batchValidateAttributions(req, res) {
    try {
      const { image_ids } = req.body;
      
      if (!Array.isArray(image_ids) || image_ids.length === 0) {
        return res.status(400).json({ 
          error: 'image_ids array is required and must not be empty' 
        });
      }

      if (image_ids.length > 100) {
        return res.status(400).json({ 
          error: 'Maximum 100 images can be validated at once' 
        });
      }

      const DefaultImage = require('../models/DefaultImage');
      const results = [];

      for (const imageId of image_ids) {
        try {
          const image = DefaultImage.findById(parseInt(imageId));
          
          if (!image) {
            results.push({
              image_id: parseInt(imageId),
              error: 'Image not found'
            });
            continue;
          }

          const validation = AttributionService.validateAttribution(image);
          const attribution = AttributionService.generateDetailedAttribution(image);

          results.push({
            image_id: parseInt(imageId),
            brand: image.brand,
            model: image.model,
            attribution,
            validation
          });
        } catch (error) {
          results.push({
            image_id: parseInt(imageId),
            error: error.message
          });
        }
      }

      const summary = {
        total_processed: results.length,
        valid: results.filter(r => r.validation && r.validation.valid).length,
        invalid: results.filter(r => r.validation && !r.validation.valid).length,
        errors: results.filter(r => r.error).length
      };

      res.json({
        summary,
        results
      });
    } catch (error) {
      console.error('Error in batch validation:', error);
      res.status(500).json({ error: 'Failed to perform batch validation' });
    }
  }

  // POST /api/attribution/generate/:imageId - Generate attribution for image
  static async generateAttribution(req, res) {
    try {
      const { imageId } = req.params;
      
      const DefaultImage = require('../models/DefaultImage');
      const image = DefaultImage.findById(parseInt(imageId));
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const attribution = AttributionService.generateDetailedAttribution(image);
      const validation = AttributionService.validateAttribution(image);
      
      // If attribution is incomplete, try to generate a better one
      if (!validation.valid && image.source === 'Wikipedia Commons') {
        // Generate improved attribution
        const improvedAttribution = AttributionService.generateAttribution(image);
        
        res.json({
          image_id: parseInt(imageId),
          brand: image.brand,
          model: image.model,
          current_attribution: attribution,
          suggested_attribution: improvedAttribution,
          validation,
          recommendation: validation.valid 
            ? 'Attribution is compliant'
            : 'Consider updating attribution with suggested text'
        });
      } else {
        res.json({
          image_id: parseInt(imageId),
          brand: image.brand,
          model: image.model,
          attribution,
          validation
        });
      }
    } catch (error) {
      console.error('Error generating attribution:', error);
      res.status(500).json({ error: 'Failed to generate attribution' });
    }
  }
}

module.exports = AttributionController;