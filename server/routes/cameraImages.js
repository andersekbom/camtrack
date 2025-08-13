const express = require('express');
const router = express.Router();
const CameraController = require('../controllers/cameraController');

console.log('Loading camera images routes...');

// DELETE /api/camera-images/:id/:imageNumber - Delete individual camera image
router.delete('/:id/:imageNumber', CameraController.deleteCameraImage);

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Camera images router is working!' });
});

module.exports = router;