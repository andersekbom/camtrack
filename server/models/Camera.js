const db = require('../config/database');
const ImageService = require('../services/ImageService');

class Camera {
  // Get all cameras with optional search and filter parameters
  static getAllCameras(options = {}) {
    try {
      const {
        search,
        brand,
        mechanicalStatus,
        cosmeticStatus,
        minPrice,
        maxPrice
      } = options;

      let query = 'SELECT * FROM cameras';
      const params = [];
      const conditions = [];

      // Add search functionality
      if (search && search.trim()) {
        conditions.push('(LOWER(brand) LIKE ? OR LOWER(model) LIKE ? OR LOWER(serial) LIKE ?)');
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add brand filter
      if (brand && brand.trim()) {
        conditions.push('LOWER(brand) = ?');
        params.push(brand.toLowerCase());
      }

      // Add mechanical status filter
      if (mechanicalStatus && Array.isArray(mechanicalStatus) && mechanicalStatus.length > 0) {
        const placeholders = mechanicalStatus.map(() => '?').join(',');
        conditions.push(`mechanical_status IN (${placeholders})`);
        params.push(...mechanicalStatus);
      }

      // Add cosmetic status filter
      if (cosmeticStatus && Array.isArray(cosmeticStatus) && cosmeticStatus.length > 0) {
        const placeholders = cosmeticStatus.map(() => '?').join(',');
        conditions.push(`cosmetic_status IN (${placeholders})`);
        params.push(...cosmeticStatus);
      }

      // Add price range filters
      if (minPrice !== undefined && minPrice !== null && minPrice >= 0) {
        conditions.push('weighted_price >= ?');
        params.push(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== null && maxPrice >= 0) {
        conditions.push('weighted_price <= ?');
        params.push(maxPrice);
      }

      // Build final query
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      const stmt = db.prepare(query);
      const cameras = stmt.all(...params);
      
      // Enhance cameras with image information
      return ImageService.enhanceCamerasWithImages(cameras);
    } catch (error) {
      throw new Error(`Error fetching cameras: ${error.message}`);
    }
  }

  // Get camera by ID
  static getCameraById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM cameras WHERE id = ?');
      const camera = stmt.get(id);
      
      if (!camera) {
        return null;
      }
      
      // Enhance camera with image information
      return ImageService.enhanceCameraWithImages(camera);
    } catch (error) {
      throw new Error(`Error fetching camera: ${error.message}`);
    }
  }

  // Create new camera
  static createCamera(data) {
    try {
      const {
        brand,
        model,
        serial,
        mechanical_status,
        cosmetic_status,
        kamerastore_price,
        sold_price,
        comment,
        image1_path,
        image2_path
      } = data;

      // Calculate weighted price
      const weighted_price = this.calculateWeightedPrice(
        kamerastore_price,
        mechanical_status,
        cosmetic_status
      );

      // Determine if camera has user images
      const has_user_images = !!(image1_path || image2_path);

      const stmt = db.prepare(`
        INSERT INTO cameras (
          brand, model, serial, mechanical_status, cosmetic_status,
          kamerastore_price, weighted_price, sold_price, comment,
          image1_path, image2_path, has_user_images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        brand, model, serial, mechanical_status, cosmetic_status,
        kamerastore_price, weighted_price, sold_price, comment,
        image1_path, image2_path, has_user_images ? 1 : 0
      );

      return this.getCameraById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Error creating camera: ${error.message}`);
    }
  }

  // Update camera
  static updateCamera(id, data) {
    try {
      const existing = this.getCameraById(id);
      if (!existing) {
        throw new Error('Camera not found');
      }

      // Merge existing data with updates
      const updatedData = { ...existing, ...data };

      // Recalculate weighted price if relevant fields changed
      if (data.kamerastore_price || data.mechanical_status || data.cosmetic_status) {
        updatedData.weighted_price = this.calculateWeightedPrice(
          updatedData.kamerastore_price,
          updatedData.mechanical_status,
          updatedData.cosmetic_status
        );
      }

      // Update has_user_images flag if image paths changed
      if (data.image1_path !== undefined || data.image2_path !== undefined) {
        updatedData.has_user_images = !!(updatedData.image1_path || updatedData.image2_path) ? 1 : 0;
      }

      const stmt = db.prepare(`
        UPDATE cameras SET
          brand = ?, model = ?, serial = ?, mechanical_status = ?, cosmetic_status = ?,
          kamerastore_price = ?, weighted_price = ?, sold_price = ?, comment = ?,
          image1_path = ?, image2_path = ?, has_user_images = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        updatedData.brand, updatedData.model, updatedData.serial,
        updatedData.mechanical_status, updatedData.cosmetic_status,
        updatedData.kamerastore_price, updatedData.weighted_price,
        updatedData.sold_price, updatedData.comment,
        updatedData.image1_path, updatedData.image2_path, 
        updatedData.has_user_images, id
      );

      return this.getCameraById(id);
    } catch (error) {
      throw new Error(`Error updating camera: ${error.message}`);
    }
  }

  // Delete camera
  static deleteCamera(id) {
    try {
      const existing = this.getCameraById(id);
      if (!existing) {
        throw new Error('Camera not found');
      }

      const stmt = db.prepare('DELETE FROM cameras WHERE id = ?');
      const result = stmt.run(id);

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting camera: ${error.message}`);
    }
  }

  // Clear all cameras (for development/testing)
  static clearAllCameras() {
    try {
      const stmt = db.prepare('DELETE FROM cameras');
      const result = stmt.run();
      return result.changes;
    } catch (error) {
      throw new Error(`Error clearing cameras: ${error.message}`);
    }
  }

  // Get image statistics for all cameras
  static getImageStatistics() {
    try {
      const stmt = db.prepare('SELECT * FROM cameras');
      const cameras = stmt.all();
      return ImageService.getImageStatistics(cameras);
    } catch (error) {
      throw new Error(`Error getting image statistics: ${error.message}`);
    }
  }

  // Update has_user_images flags for all cameras
  static updateAllHasUserImagesFlags() {
    try {
      return ImageService.updateAllHasUserImagesFlags();
    } catch (error) {
      throw new Error(`Error updating has_user_images flags: ${error.message}`);
    }
  }

  // Calculate weighted price using the formula from MVP
  static calculateWeightedPrice(kamerstorePrice, mechanicalStatus, cosmeticStatus) {
    if (!kamerstorePrice || !mechanicalStatus || !cosmeticStatus) {
      return 0;
    }

    // Average of mechanical and cosmetic status (1-5 scale)
    const avgStatus = (mechanicalStatus + cosmeticStatus) / 2;
    
    // Weight factor: 0.2 for status 1, up to 1.0 for status 5
    const weightFactor = 0.2 + (avgStatus - 1) * 0.2;
    
    return Math.round(kamerstorePrice * weightFactor * 100) / 100; // Round to 2 decimal places
  }
}

module.exports = Camera;