const DefaultImage = require('../models/DefaultImage');

class DefaultImagesController {
  // GET /api/default-images - Get all default images
  static async getAllDefaultImages(req, res) {
    try {
      const { brand, model, active } = req.query;
      const filters = {};
      
      if (brand) filters.brand = brand;
      if (model) filters.model = model;
      if (active !== undefined) filters.is_active = active === 'true' ? 1 : 0;

      const defaultImages = DefaultImage.findAll(filters);
      res.json(defaultImages);
    } catch (error) {
      console.error('Error fetching default images:', error);
      res.status(500).json({ error: 'Failed to fetch default images' });
    }
  }

  // GET /api/default-images/:id - Get default image by ID
  static async getDefaultImageById(req, res) {
    try {
      const { id } = req.params;
      const defaultImage = DefaultImage.findById(id);
      
      if (!defaultImage) {
        return res.status(404).json({ error: 'Default image not found' });
      }
      
      res.json(defaultImage);
    } catch (error) {
      console.error('Error fetching default image:', error);
      res.status(500).json({ error: 'Failed to fetch default image' });
    }
  }

  // POST /api/default-images - Create new default image
  static async createDefaultImage(req, res) {
    try {
      const { brand, model, image_url, source, source_attribution, image_quality } = req.body;
      
      // Validation
      if (!brand || !model || !image_url || !source) {
        return res.status(400).json({ 
          error: 'Missing required fields: brand, model, image_url, source' 
        });
      }

      // Validate URL format
      try {
        new URL(image_url);
      } catch {
        return res.status(400).json({ 
          error: 'Invalid image_url format' 
        });
      }

      // Validate image quality range
      if (image_quality !== undefined && (image_quality < 1 || image_quality > 10)) {
        return res.status(400).json({ 
          error: 'image_quality must be between 1 and 10' 
        });
      }

      const defaultImageData = {
        brand: brand.trim(),
        model: model.trim(),
        image_url: image_url.trim(),
        source: source.trim(),
        source_attribution: source_attribution?.trim() || null,
        image_quality: image_quality || 5
      };

      const newDefaultImage = DefaultImage.create(defaultImageData);
      res.status(201).json(newDefaultImage);
    } catch (error) {
      console.error('Error creating default image:', error);
      
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          error: 'Default image already exists for this brand and model combination' 
        });
      }
      
      res.status(500).json({ error: 'Failed to create default image' });
    }
  }

  // PUT /api/default-images/:id - Update default image
  static async updateDefaultImage(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.query;
      
      // Handle replace action
      if (action === 'replace') {
        return await DefaultImagesController.replaceDefaultImage(req, res);
      }
      
      const { brand, model, image_url, source, source_attribution, image_quality, is_active } = req.body;
      
      // Check if default image exists
      const existingImage = DefaultImage.findById(id);
      if (!existingImage) {
        return res.status(404).json({ error: 'Default image not found' });
      }

      // Validate URL format if provided
      if (image_url) {
        try {
          new URL(image_url);
        } catch {
          return res.status(400).json({ 
            error: 'Invalid image_url format' 
          });
        }
      }

      // Validate image quality range if provided
      if (image_quality !== undefined && (image_quality < 1 || image_quality > 10)) {
        return res.status(400).json({ 
          error: 'image_quality must be between 1 and 10' 
        });
      }

      const updateData = {};
      if (brand !== undefined) updateData.brand = brand.trim();
      if (model !== undefined) updateData.model = model.trim();
      if (image_url !== undefined) updateData.image_url = image_url.trim();
      if (source !== undefined) updateData.source = source.trim();
      if (source_attribution !== undefined) updateData.source_attribution = source_attribution?.trim() || null;
      if (image_quality !== undefined) updateData.image_quality = image_quality;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

      const updatedImage = DefaultImage.update(id, updateData);
      res.json(updatedImage);
    } catch (error) {
      console.error('Error updating default image:', error);
      
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          error: 'Default image already exists for this brand and model combination' 
        });
      }
      
      res.status(500).json({ error: 'Failed to update default image' });
    }
  }

  // Replace default image with file upload
  static async replaceDefaultImageWithFile(req, res) {
    try {
      const { id, source = 'Manual Upload', attribution = '' } = req.body;
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file was uploaded' });
      }
      
      // Check if default image exists
      const existingImage = DefaultImage.findById(id);
      if (!existingImage) {
        return res.status(404).json({ error: 'Default image not found' });
      }

      // Build the image URL path for the uploaded file
      const imageUrl = `/uploads/default-images/${req.file.filename}`;

      // Update the existing default image record with new image
      const updatedImage = DefaultImage.update(id, {
        image_url: imageUrl,
        source: source,
        source_attribution: attribution,
        image_quality: 8 // Default quality for manual uploads
      });

      res.json({
        message: 'Default image replaced successfully',
        defaultImage: updatedImage,
        previousImageUrl: existingImage.image_url,
        newImageUrl: imageUrl
      });
    } catch (error) {
      console.error('Error replacing default image with file:', error);
      res.status(500).json({ 
        error: 'Failed to replace default image',
        details: error.message 
      });
    }
  }

  // Replace default image with manual upload (called from updateDefaultImage)
  static async replaceDefaultImage(req, res) {
    try {
      const { id } = req.params;
      const { imageUrl, source = 'Manual Upload', attribution = '' } = req.body;
      
      // Validate that imageUrl is provided
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required for replacement' });
      }

      // Validate URL format
      try {
        new URL(imageUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid image URL format' });
      }
      
      // Check if default image exists
      const existingImage = DefaultImage.findById(id);
      if (!existingImage) {
        return res.status(404).json({ error: 'Default image not found' });
      }

      // Update the existing default image record with new image
      const updatedImage = DefaultImage.update(id, {
        image_url: imageUrl,
        source: source,
        source_attribution: attribution,
        image_quality: 8 // Default quality for manual uploads
      });

      res.json({
        message: 'Default image replaced successfully',
        defaultImage: updatedImage,
        previousImageUrl: existingImage.image_url,
        newImageUrl: imageUrl
      });
    } catch (error) {
      console.error('Error replacing default image:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to replace default image',
        details: error.message 
      });
    }
  }

  // DELETE /api/default-images/:id - Delete default image
  static async deleteDefaultImage(req, res) {
    try {
      const { id } = req.params;
      
      // Check if default image exists
      const existingImage = DefaultImage.findById(id);
      if (!existingImage) {
        return res.status(404).json({ error: 'Default image not found' });
      }

      DefaultImage.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting default image:', error);
      res.status(500).json({ error: 'Failed to delete default image' });
    }
  }

  // GET /api/default-images/brands - Get all unique brands
  static async getBrands(req, res) {
    try {
      const brands = DefaultImage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  }

  // GET /api/default-images/models/:brand - Get models for a specific brand
  static async getModelsByBrand(req, res) {
    try {
      const { brand } = req.params;
      const models = DefaultImage.getModelsByBrand(brand);
      res.json(models);
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  }
}

module.exports = DefaultImagesController;