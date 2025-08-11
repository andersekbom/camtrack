const DefaultImage = require('../models/DefaultImage');

class ImageService {
  /**
   * Get the appropriate image for a camera using the fallback chain:
   * 1. User uploaded images (image1_path, image2_path)
   * 2. Model-specific default image (from default_camera_images)
   * 3. Brand-specific default image (from brand_default_images)
   * 4. Generic placeholder image
   */
  static getImageForCamera(camera) {
    const result = {
      primary_image: null,
      secondary_image: null,
      default_image_info: null,
      has_user_images: false,
      image_source: 'none'
    };

    // Priority 1: User uploaded images
    if (camera.image1_path || camera.image2_path) {
      result.primary_image = camera.image1_path;
      result.secondary_image = camera.image2_path;
      result.has_user_images = true;
      result.image_source = 'user';
      return result;
    }

    // Priority 2: Model-specific default image
    if (camera.brand && camera.model) {
      const defaultImage = DefaultImage.findByBrandAndModel(camera.brand, camera.model);
      if (defaultImage) {
        result.primary_image = defaultImage.image_url;
        result.default_image_info = {
          source: defaultImage.source,
          attribution: defaultImage.source_attribution,
          quality: defaultImage.image_quality,
          type: 'model'
        };
        result.image_source = 'default_model';
        return result;
      }
    }

    // Priority 3: Brand-specific default image
    if (camera.brand) {
      const brandDefault = DefaultImage.Brand.findByBrand(camera.brand);
      if (brandDefault) {
        result.primary_image = brandDefault.image_url;
        result.default_image_info = {
          source: brandDefault.source,
          attribution: brandDefault.source_attribution,
          quality: null,
          type: 'brand'
        };
        result.image_source = 'default_brand';
        return result;
      }
    }

    // Priority 4: Generic placeholder
    result.primary_image = '/uploads/placeholders/camera-placeholder.svg';
    result.default_image_info = {
      source: 'System',
      attribution: 'Generic camera placeholder',
      quality: null,
      type: 'placeholder'
    };
    result.image_source = 'placeholder';
    
    return result;
  }

  /**
   * Enhance multiple cameras with image information
   */
  static enhanceCamerasWithImages(cameras) {
    return cameras.map(camera => this.enhanceCameraWithImages(camera));
  }

  /**
   * Enhance a single camera with image information
   */
  static enhanceCameraWithImages(camera) {
    const imageInfo = this.getImageForCamera(camera);
    
    return {
      ...camera,
      ...imageInfo,
      // Update the has_user_images flag in case it wasn't set correctly
      has_user_images: imageInfo.has_user_images ? 1 : 0
    };
  }

  /**
   * Get image statistics for a collection
   */
  static getImageStatistics(cameras) {
    const stats = {
      total_cameras: cameras.length,
      with_user_images: 0,
      with_default_model: 0,
      with_default_brand: 0,
      with_placeholder: 0,
      coverage_percentage: 0
    };

    cameras.forEach(camera => {
      const imageInfo = this.getImageForCamera(camera);
      
      switch (imageInfo.image_source) {
        case 'user':
          stats.with_user_images++;
          break;
        case 'default_model':
          stats.with_default_model++;
          break;
        case 'default_brand':
          stats.with_default_brand++;
          break;
        case 'placeholder':
          stats.with_placeholder++;
          break;
      }
    });

    stats.coverage_percentage = stats.total_cameras > 0 
      ? Math.round(((stats.with_user_images + stats.with_default_model + stats.with_default_brand) / stats.total_cameras) * 100)
      : 0;

    return stats;
  }

  /**
   * Update camera's has_user_images flag based on actual image paths
   */
  static updateHasUserImagesFlag(cameraId, image1_path, image2_path) {
    const db = require('../config/database');
    const hasImages = !!(image1_path || image2_path);
    
    const stmt = db.prepare('UPDATE cameras SET has_user_images = ? WHERE id = ?');
    stmt.run(hasImages ? 1 : 0, cameraId);
    
    return hasImages;
  }

  /**
   * Check if a camera needs a default image assignment
   */
  static needsDefaultImage(camera) {
    return !camera.image1_path && !camera.image2_path && !camera.default_image_url;
  }

  /**
   * Batch update has_user_images flags for all cameras
   */
  static updateAllHasUserImagesFlags() {
    const db = require('../config/database');
    
    const stmt = db.prepare(`
      UPDATE cameras 
      SET has_user_images = CASE 
        WHEN image1_path IS NOT NULL OR image2_path IS NOT NULL THEN 1 
        ELSE 0 
      END
    `);
    
    const result = stmt.run();
    return result.changes;
  }
}

module.exports = ImageService;