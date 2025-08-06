const express = require('express');
const router = express.Router();
const CameraController = require('../controllers/cameraController');
const { uploadCameraImages, handleUploadError } = require('../middleware/upload');

// GET /api/cameras - Get all cameras
router.get('/', CameraController.getAllCameras);

// DELETE /api/cameras/clear - Clear all cameras (for development/testing) - MUST BE BEFORE /:id
router.delete('/clear', CameraController.clearAllCameras);

// GET /api/cameras/:id - Get camera by ID
router.get('/:id', CameraController.getCameraById);

// POST /api/cameras - Create new camera with image upload
router.post('/', uploadCameraImages, handleUploadError, CameraController.createCamera);

// PUT /api/cameras/:id - Update camera with image upload
router.put('/:id', uploadCameraImages, handleUploadError, CameraController.updateCamera);

// DELETE /api/cameras/:id - Delete camera
router.delete('/:id', CameraController.deleteCamera);

module.exports = router;