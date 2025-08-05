const express = require('express');
const router = express.Router();
const CameraController = require('../controllers/cameraController');

// GET /api/cameras - Get all cameras
router.get('/', CameraController.getAllCameras);

// GET /api/cameras/:id - Get camera by ID
router.get('/:id', CameraController.getCameraById);

// POST /api/cameras - Create new camera
router.post('/', CameraController.createCamera);

// PUT /api/cameras/:id - Update camera
router.put('/:id', CameraController.updateCamera);

// DELETE /api/cameras/:id - Delete camera
router.delete('/:id', CameraController.deleteCamera);

module.exports = router;