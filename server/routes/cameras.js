const express = require('express');
const router = express.Router();
const CameraController = require('../controllers/cameraController');
const { uploadCameraImages, handleUploadError } = require('../middleware/upload');

// GET /api/cameras - Get all cameras
router.get('/', CameraController.getAllCameras);

// POST /api/cameras - Create new camera with image upload
router.post('/', uploadCameraImages, handleUploadError, CameraController.createCamera);

// DELETE /api/cameras/clear - Clear all cameras (for development/testing) - MUST BE BEFORE /:id
router.delete('/clear', CameraController.clearAllCameras);

// DELETE /api/cameras/delete-image/:id/:imageNumber - Delete individual camera image - MUST BE BEFORE /:id
router.delete('/delete-image/:id/:imageNumber', CameraController.deleteCameraImage);

// ALL SPECIFIC ROUTES MUST BE BEFORE THE PARAMETER ROUTES BELOW

// GET /api/cameras/:id - Get camera by ID
router.get('/:id', CameraController.getCameraById);

// PUT /api/cameras/:id - Update camera with image upload
router.put('/:id', uploadCameraImages, handleUploadError, CameraController.updateCamera);

// DELETE /api/cameras/:id - Delete camera - MUST BE AFTER ALL specific routes
router.delete('/:id', CameraController.deleteCamera);

module.exports = router;