const express = require('express');
const router = express.Router();
const DefaultImagesController = require('../controllers/defaultImagesController');

// GET /api/default-images - Get all default images
router.get('/', DefaultImagesController.getAllDefaultImages);

// GET /api/default-images/brands - Get all unique brands (MUST BE BEFORE /:id)
router.get('/brands', DefaultImagesController.getBrands);

// GET /api/default-images/models/:brand - Get models for a specific brand (MUST BE BEFORE /:id)
router.get('/models/:brand', DefaultImagesController.getModelsByBrand);

// GET /api/default-images/:id - Get default image by ID
router.get('/:id', DefaultImagesController.getDefaultImageById);

// POST /api/default-images - Create new default image
router.post('/', DefaultImagesController.createDefaultImage);

// PUT /api/default-images/:id - Update default image
router.put('/:id', DefaultImagesController.updateDefaultImage);

// DELETE /api/default-images/:id - Delete default image
router.delete('/:id', DefaultImagesController.deleteDefaultImage);

module.exports = router;