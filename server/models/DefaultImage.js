const db = require('../config/database');

class DefaultImage {
  // Find all default images with optional filtering
  static findAll(filters = {}) {
    let query = 'SELECT * FROM default_camera_images WHERE 1=1';
    const params = [];

    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.model) {
      query += ' AND model = ?';
      params.push(filters.model);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY brand ASC, model ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Find default image by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM default_camera_images WHERE id = ?');
    return stmt.get(id);
  }

  // Find default image by brand and model
  static findByBrandAndModel(brand, model) {
    const stmt = db.prepare(`
      SELECT * FROM default_camera_images 
      WHERE brand = ? AND model = ? AND is_active = 1
    `);
    return stmt.get(brand, model);
  }

  // Create new default image
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO default_camera_images 
      (brand, model, image_url, source, source_attribution, image_quality, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.brand,
      data.model,
      data.image_url,
      data.source,
      data.source_attribution,
      data.image_quality,
      data.is_active !== undefined ? data.is_active : 1
    );

    return this.findById(result.lastInsertRowid);
  }

  // Update default image
  static update(id, data) {
    const fields = [];
    const params = [];

    // Build dynamic update query
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Always update the updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE default_camera_images SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      throw new Error('Default image not found or no changes made');
    }

    return this.findById(id);
  }

  // Delete default image
  static delete(id) {
    const stmt = db.prepare('DELETE FROM default_camera_images WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error('Default image not found');
    }

    return result.changes;
  }

  // Get all unique brands
  static getBrands() {
    const stmt = db.prepare(`
      SELECT DISTINCT brand 
      FROM default_camera_images 
      WHERE is_active = 1 
      ORDER BY brand ASC
    `);
    return stmt.all().map(row => row.brand);
  }

  // Get models for a specific brand
  static getModelsByBrand(brand) {
    const stmt = db.prepare(`
      SELECT DISTINCT model 
      FROM default_camera_images 
      WHERE brand = ? AND is_active = 1 
      ORDER BY model ASC
    `);
    return stmt.all(brand).map(row => row.model);
  }

  // Get count of default images
  static getCount(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM default_camera_images WHERE 1=1';
    const params = [];

    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params).count;
  }

  // Batch insert multiple default images
  static createMany(defaultImages) {
    const stmt = db.prepare(`
      INSERT INTO default_camera_images 
      (brand, model, image_url, source, source_attribution, image_quality)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((images) => {
      const results = [];
      for (const image of images) {
        try {
          const result = stmt.run(
            image.brand,
            image.model,
            image.image_url,
            image.source,
            image.source_attribution,
            image.image_quality || 5
          );
          results.push({ success: true, id: result.lastInsertRowid, brand: image.brand, model: image.model });
        } catch (error) {
          results.push({ success: false, error: error.message, brand: image.brand, model: image.model });
        }
      }
      return results;
    });

    return insertMany(defaultImages);
  }
}

// Brand default images model methods
DefaultImage.Brand = {
  // Find all brand default images
  findAll(filters = {}) {
    let query = 'SELECT * FROM brand_default_images WHERE 1=1';
    const params = [];

    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY brand ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  // Find brand default by brand name
  findByBrand(brand) {
    const stmt = db.prepare('SELECT * FROM brand_default_images WHERE brand = ? AND is_active = 1');
    return stmt.get(brand);
  },

  // Create new brand default
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO brand_default_images 
      (brand, image_url, source, source_attribution, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.brand,
      data.image_url,
      data.source,
      data.source_attribution,
      data.is_active !== undefined ? data.is_active : 1
    );

    const findStmt = db.prepare('SELECT * FROM brand_default_images WHERE id = ?');
    return findStmt.get(result.lastInsertRowid);
  },

  // Update brand default
  update(id, data) {
    const fields = [];
    const params = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    const query = `UPDATE brand_default_images SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      throw new Error('Brand default image not found or no changes made');
    }

    const findStmt = db.prepare('SELECT * FROM brand_default_images WHERE id = ?');
    return findStmt.get(id);
  }
};

module.exports = DefaultImage;