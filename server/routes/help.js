const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Define base docs directory
const docsDir = path.join(__dirname, '..', '..');

// Serve user guide documentation files
router.get('/user-guide', (req, res) => {
  const filePath = path.join(docsDir, 'docs', 'USER-GUIDE.md');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/markdown');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'User guide not found' });
  }
});

// Serve quick start guide
router.get('/quick-start', (req, res) => {
  const filePath = path.join(docsDir, 'docs', 'QUICK-START.md');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/markdown');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Quick start guide not found' });
  }
});

// Serve documentation overview
router.get('/overview', (req, res) => {
  const filePath = path.join(docsDir, 'docs', 'README.md');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/markdown');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Documentation overview not found' });
  }
});

// Serve screenshots
router.use('/screenshots', express.static(path.join(docsDir, 'docs', 'screenshots')));

// Help menu with links to all documentation
router.get('/menu', (req, res) => {
  res.json({
    title: 'CamTracker Deluxe Help',
    sections: [
      {
        title: 'Getting Started',
        items: [
          {
            title: 'Quick Start Guide',
            description: 'Get up and running in 5 minutes',
            url: '/api/help/quick-start',
            icon: '🚀',
            type: 'markdown'
          },
          {
            title: 'Complete User Guide',
            description: 'Comprehensive documentation with screenshots',
            url: '/api/help/user-guide',
            icon: '📖',
            type: 'markdown'
          }
        ]
      },
      {
        title: 'Technical Documentation',
        items: [
          {
            title: 'API Documentation',
            description: 'Interactive API explorer and reference',
            url: '/api/docs',
            icon: '🔧',
            type: 'external'
          },
          {
            title: 'API Documentation (Clean)',
            description: 'Clean documentation format',
            url: '/api/docs/redoc',
            icon: '📚',
            type: 'external'
          }
        ]
      },
      {
        title: 'Resources',
        items: [
          {
            title: 'Documentation Overview',
            description: 'Complete documentation navigation',
            url: '/api/help/overview',
            icon: '📋',
            type: 'markdown'
          },
          {
            title: 'Sample Data',
            description: 'Download sample CSV for testing',
            url: '/api/help/sample-data',
            icon: '📊',
            type: 'download'
          }
        ]
      }
    ]
  });
});

// Serve sample data CSV
router.get('/sample-data', (req, res) => {
  const csvContent = `Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
Nikon,F50,2922618,5,4,600,540,540,Excellent condition with original box
Canon,AE-1,1234567,4,3,150,105,120,Classic 35mm SLR camera
Pentax,K1000,7891011,5,5,200,200,180,Perfect student camera
Olympus,OM-1,5551234,3,2,180,108,150,Needs some cleaning but functional
Leica,M3,1122334,5,5,2500,2500,2200,Legendary rangefinder camera
Minolta,X-700,9876543,4,4,250,200,220,Great condition with 50mm lens
Canon,F-1,4445556,5,4,800,720,720,Professional grade camera
Hasselblad,500CM,1234567,4,4,1500,1200,1300,Medium format excellence
Rolleiflex,2.8F,9876543,3,3,1200,720,1000,Twin lens reflex classic
Contax,G2,5556667,5,5,1800,1800,1600,Modern rangefinder with autofocus`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample-cameras.csv"');
  res.send(csvContent);
});

module.exports = router;