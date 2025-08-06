const express = require('express');
const https = require('https');
const router = express.Router();

// GET /api/image-proxy - Proxy Wikipedia images to bypass CORS
router.get('/', (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  // Only allow Wikipedia URLs for security
  if (!url.includes('wikimedia.org') && !url.includes('wikipedia.org')) {
    return res.status(403).json({ error: 'Only Wikipedia/Wikimedia URLs are allowed' });
  }
  
  console.log(`📡 Proxying image: ${url}`);
  
  // Create request to Wikipedia
  const request = https.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'CamTracker-Deluxe/1.0 (https://github.com/user/camtrack; contact@example.com)',
      'Accept': 'image/*',
      'Accept-Encoding': 'gzip, deflate'
    }
  }, (response) => {
    // Check if response is successful
    if (response.statusCode !== 200) {
      console.log(`❌ Failed to fetch image: ${response.statusCode}`);
      return res.status(response.statusCode).json({ 
        error: `Failed to fetch image: ${response.statusCode}` 
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    
    // Stream the image data
    response.pipe(res);
  });
  
  request.on('error', (error) => {
    console.error(`❌ Error proxying image: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  });
  
  request.on('timeout', () => {
    console.error('❌ Image proxy timeout');
    request.destroy();
    if (!res.headersSent) {
      res.status(504).json({ error: 'Image request timeout' });
    }
  });
  
  // Handle client disconnect
  req.on('close', () => {
    if (request) {
      request.destroy();
    }
  });
});

module.exports = router;