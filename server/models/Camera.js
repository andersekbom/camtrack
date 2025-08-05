const db = require('../config/database');

class Camera {
  // Get all cameras
  static getAllCameras() {
    try {
      const stmt = db.prepare('SELECT * FROM cameras ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      throw new Error(`Error fetching cameras: ${error.message}`);
    }
  }

  // Get camera by ID
  static getCameraById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM cameras WHERE id = ?');
      return stmt.get(id);
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

      const stmt = db.prepare(`
        INSERT INTO cameras (
          brand, model, serial, mechanical_status, cosmetic_status,
          kamerastore_price, weighted_price, sold_price, comment,
          image1_path, image2_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        brand, model, serial, mechanical_status, cosmetic_status,
        kamerastore_price, weighted_price, sold_price, comment,
        image1_path, image2_path
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

      const stmt = db.prepare(`
        UPDATE cameras SET
          brand = ?, model = ?, serial = ?, mechanical_status = ?, cosmetic_status = ?,
          kamerastore_price = ?, weighted_price = ?, sold_price = ?, comment = ?,
          image1_path = ?, image2_path = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        updatedData.brand, updatedData.model, updatedData.serial,
        updatedData.mechanical_status, updatedData.cosmetic_status,
        updatedData.kamerastore_price, updatedData.weighted_price,
        updatedData.sold_price, updatedData.comment,
        updatedData.image1_path, updatedData.image2_path, id
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