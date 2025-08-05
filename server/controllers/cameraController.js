const Camera = require('../models/Camera');

class CameraController {
  // Get all cameras
  static async getAllCameras(req, res) {
    try {
      const cameras = Camera.getAllCameras();
      res.json(cameras);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get camera by ID
  static async getCameraById(req, res) {
    try {
      const { id } = req.params;
      const camera = Camera.getCameraById(id);
      
      if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      
      res.json(camera);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new camera
  static async createCamera(req, res) {
    try {
      const {
        brand,
        model,
        serial,
        mechanical_status,
        cosmetic_status,
        kamerastore_price,
        sold_price,
        comment
      } = req.body;

      // Validate required fields
      if (!brand || !model) {
        return res.status(400).json({ 
          error: 'Brand and model are required fields' 
        });
      }

      // Validate status values
      if (mechanical_status && (mechanical_status < 1 || mechanical_status > 5)) {
        return res.status(400).json({ 
          error: 'Mechanical status must be between 1 and 5' 
        });
      }

      if (cosmetic_status && (cosmetic_status < 1 || cosmetic_status > 5)) {
        return res.status(400).json({ 
          error: 'Cosmetic status must be between 1 and 5' 
        });
      }

      const camera = Camera.createCamera({
        brand,
        model,
        serial,
        mechanical_status,
        cosmetic_status,
        kamerastore_price,
        sold_price,
        comment
      });

      res.status(201).json(camera);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update camera
  static async updateCamera(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate status values if provided
      if (updates.mechanical_status && (updates.mechanical_status < 1 || updates.mechanical_status > 5)) {
        return res.status(400).json({ 
          error: 'Mechanical status must be between 1 and 5' 
        });
      }

      if (updates.cosmetic_status && (updates.cosmetic_status < 1 || updates.cosmetic_status > 5)) {
        return res.status(400).json({ 
          error: 'Cosmetic status must be between 1 and 5' 
        });
      }

      const camera = Camera.updateCamera(id, updates);
      
      if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      
      res.json(camera);
    } catch (error) {
      if (error.message.includes('Camera not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Delete camera
  static async deleteCamera(req, res) {
    try {
      const { id } = req.params;
      const deleted = Camera.deleteCamera(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      
      res.json({ 
        message: 'Camera deleted successfully', 
        id: parseInt(id) 
      });
    } catch (error) {
      if (error.message.includes('Camera not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CameraController;