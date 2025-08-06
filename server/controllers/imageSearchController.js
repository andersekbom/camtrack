const WikipediaImageService = require('../services/WikipediaImageService');
const DefaultImage = require('../models/DefaultImage');

class ImageSearchController {
  // POST /api/image-search/wikipedia - Search for images on Wikipedia Commons
  static async searchWikipediaImages(req, res) {
    try {
      const { brand, model, limit = 5 } = req.body;
      
      if (!brand || !model) {
        return res.status(400).json({ 
          error: 'Brand and model are required' 
        });
      }

      const results = await WikipediaImageService.searchCameraImages(
        brand.trim(), 
        model.trim(), 
        Math.min(limit, 20) // Cap at 20 results
      );

      res.json({
        brand,
        model,
        resultsCount: results.length,
        results: results.map(result => ({
          filename: result.filename,
          url: result.url,
          width: result.width,
          height: result.height,
          quality: result.quality,
          relevanceScore: result.relevanceScore,
          combinedScore: result.combinedScore,
          license: result.license,
          author: result.author,
          attribution: result.attribution,
          source: result.source
        }))
      });
    } catch (error) {
      console.error('Error searching Wikipedia images:', error);
      res.status(500).json({ error: 'Failed to search for images' });
    }
  }

  // POST /api/image-search/find-best - Find best image for a camera
  static async findBestImage(req, res) {
    try {
      const { brand, model } = req.body;
      
      if (!brand || !model) {
        return res.status(400).json({ 
          error: 'Brand and model are required' 
        });
      }

      const bestImage = await WikipediaImageService.findBestImageForCamera(
        brand.trim(), 
        model.trim()
      );

      if (!bestImage) {
        return res.status(404).json({ 
          error: 'No suitable image found for this camera',
          brand,
          model
        });
      }

      res.json({
        brand,
        model,
        image: bestImage,
        message: 'Best image found successfully'
      });
    } catch (error) {
      console.error('Error finding best image:', error);
      res.status(500).json({ error: 'Failed to find best image' });
    }
  }

  // POST /api/image-search/auto-assign - Automatically assign default image to a camera model
  static async autoAssignImage(req, res) {
    try {
      const { brand, model, overwrite = false } = req.body;
      
      if (!brand || !model) {
        return res.status(400).json({ 
          error: 'Brand and model are required' 
        });
      }

      const cleanBrand = brand.trim();
      const cleanModel = model.trim();

      // Check if default image already exists
      const existing = DefaultImage.findByBrandAndModel(cleanBrand, cleanModel);
      if (existing && !overwrite) {
        return res.status(409).json({ 
          error: 'Default image already exists for this camera',
          existing: {
            id: existing.id,
            image_url: existing.image_url,
            source: existing.source,
            quality: existing.image_quality
          }
        });
      }

      // Find best image from Wikipedia
      const bestImage = await WikipediaImageService.findBestImageForCamera(cleanBrand, cleanModel);
      
      if (!bestImage) {
        return res.status(404).json({ 
          error: 'No suitable image found for automatic assignment',
          brand: cleanBrand,
          model: cleanModel
        });
      }

      // Create or update default image record
      let defaultImage;
      if (existing && overwrite) {
        defaultImage = DefaultImage.update(existing.id, {
          image_url: bestImage.image_url,
          source: bestImage.source,
          source_attribution: bestImage.source_attribution,
          image_quality: bestImage.image_quality
        });
      } else {
        defaultImage = DefaultImage.create({
          brand: cleanBrand,
          model: cleanModel,
          image_url: bestImage.image_url,
          source: bestImage.source,
          source_attribution: bestImage.source_attribution,
          image_quality: bestImage.image_quality
        });
      }

      res.status(201).json({
        message: 'Default image assigned successfully',
        defaultImage,
        imageDetails: bestImage
      });
    } catch (error) {
      console.error('Error auto-assigning image:', error);
      
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          error: 'Default image already exists for this camera model' 
        });
      }
      
      res.status(500).json({ error: 'Failed to assign default image' });
    }
  }

  // POST /api/image-search/batch-assign - Batch assign images to multiple cameras
  static async batchAssignImages(req, res) {
    try {
      const { cameras, overwrite = false } = req.body;
      
      if (!Array.isArray(cameras) || cameras.length === 0) {
        return res.status(400).json({ 
          error: 'Cameras array is required and must not be empty' 
        });
      }

      if (cameras.length > 50) {
        return res.status(400).json({ 
          error: 'Maximum 50 cameras can be processed in a single batch' 
        });
      }

      const results = [];
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const camera of cameras) {
        const { brand, model } = camera;
        
        if (!brand || !model) {
          results.push({
            brand: brand || 'Unknown',
            model: model || 'Unknown',
            status: 'error',
            error: 'Brand and model are required'
          });
          errorCount++;
          continue;
        }

        const cleanBrand = brand.trim();
        const cleanModel = model.trim();

        try {
          // Check if default image already exists
          const existing = DefaultImage.findByBrandAndModel(cleanBrand, cleanModel);
          if (existing && !overwrite) {
            results.push({
              brand: cleanBrand,
              model: cleanModel,
              status: 'skipped',
              reason: 'Default image already exists',
              existingImageId: existing.id
            });
            skippedCount++;
            continue;
          }

          // Find best image
          const bestImage = await WikipediaImageService.findBestImageForCamera(cleanBrand, cleanModel);
          
          if (!bestImage) {
            results.push({
              brand: cleanBrand,
              model: cleanModel,
              status: 'no_image',
              reason: 'No suitable image found'
            });
            continue;
          }

          // Create or update default image
          let defaultImage;
          if (existing && overwrite) {
            defaultImage = DefaultImage.update(existing.id, {
              image_url: bestImage.image_url,
              source: bestImage.source,
              source_attribution: bestImage.source_attribution,
              image_quality: bestImage.image_quality
            });
          } else {
            defaultImage = DefaultImage.create({
              brand: cleanBrand,
              model: cleanModel,
              image_url: bestImage.image_url,
              source: bestImage.source,
              source_attribution: bestImage.source_attribution,
              image_quality: bestImage.image_quality
            });
          }

          results.push({
            brand: cleanBrand,
            model: cleanModel,
            status: 'success',
            defaultImageId: defaultImage.id,
            imageQuality: defaultImage.image_quality,
            imageUrl: defaultImage.image_url
          });
          successCount++;

        } catch (error) {
          results.push({
            brand: cleanBrand,
            model: cleanModel,
            status: 'error',
            error: error.message
          });
          errorCount++;
        }

        // Small delay to be respectful to Wikipedia API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      res.json({
        message: 'Batch image assignment completed',
        summary: {
          total: cameras.length,
          successful: successCount,
          skipped: skippedCount,
          errors: errorCount
        },
        results
      });
    } catch (error) {
      console.error('Error in batch assign images:', error);
      res.status(500).json({ error: 'Failed to process batch image assignment' });
    }
  }

  // GET /api/image-search/suggestions/:brand - Get model suggestions for a brand
  static async getModelSuggestions(req, res) {
    try {
      const { brand } = req.params;
      const { partial = '' } = req.query;
      
      if (!brand) {
        return res.status(400).json({ 
          error: 'Brand parameter is required' 
        });
      }

      const suggestions = await WikipediaImageService.getSearchSuggestions(
        brand.trim(), 
        partial.trim()
      );

      res.json({
        brand: brand.trim(),
        partial: partial.trim(),
        suggestions
      });
    } catch (error) {
      console.error('Error getting model suggestions:', error);
      res.status(500).json({ error: 'Failed to get model suggestions' });
    }
  }

  // POST /api/image-search/validate-url - Validate image URL accessibility
  static async validateImageUrl(req, res) {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ 
          error: 'URL is required' 
        });
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ 
          error: 'Invalid URL format' 
        });
      }

      const isValid = await WikipediaImageService.validateImageUrl(url);

      res.json({
        url,
        isValid,
        message: isValid ? 'URL is accessible' : 'URL is not accessible'
      });
    } catch (error) {
      console.error('Error validating image URL:', error);
      res.status(500).json({ error: 'Failed to validate image URL' });
    }
  }
}

module.exports = ImageSearchController;