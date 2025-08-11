const { Parser } = require('json2csv');
const csvParser = require('csv-parser');
const fs = require('fs');
const Camera = require('../models/Camera');
const jobQueue = require('../services/JobQueueService');
const multer = require('multer');

// Configure multer for CSV file uploads
const csvUpload = multer({
  dest: 'temp/', // Temporary directory for uploaded files
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv' && !file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for CSV files
  }
}).single('csvFile');

class ImportExportController {
  // Export all cameras to CSV
  static async exportCameras(req, res) {
    try {
      console.log('Export endpoint called'); // Debug log
      // Get all cameras from database
      const cameras = Camera.getAllCameras();
      console.log('Cameras found:', cameras ? cameras.length : 'null'); // Debug log
      
      if (!cameras || cameras.length === 0) {
        // Return empty CSV with just headers
        const fields = [
          { label: 'Brand', value: 'brand' },
          { label: 'Model', value: 'model' },
          { label: 'Serial', value: 'serial' },
          { label: 'Mechanical', value: 'mechanical_status' },
          { label: 'Cosmetic', value: 'cosmetic_status' },
          { label: 'Kamerastore Price', value: 'kamerastore_price' },
          { label: 'Weighted Price', value: 'weighted_price' },
          { label: 'Sold Price', value: 'sold_price' },
          { label: 'Comment', value: 'comment' },
          { label: 'Image 1 Path', value: 'image1_path' },
          { label: 'Image 2 Path', value: 'image2_path' },
          { label: 'Created At', value: 'created_at' },
          { label: 'Updated At', value: 'updated_at' }
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse([]);
        
        const filename = `cameras_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csv);
      }

      // Define CSV fields and headers
      const fields = [
        { label: 'Brand', value: 'brand' },
        { label: 'Model', value: 'model' },
        { label: 'Serial', value: 'serial' },
        { label: 'Mechanical', value: 'mechanical_status' },
        { label: 'Cosmetic', value: 'cosmetic_status' },
        { label: 'Kamerastore Price', value: 'kamerastore_price' },
        { label: 'Weighted Price', value: 'weighted_price' },
        { label: 'Sold Price', value: 'sold_price' },
        { label: 'Comment', value: 'comment' },
        { label: 'Image 1 Path', value: 'image1_path' },
        { label: 'Image 2 Path', value: 'image2_path' },
        { label: 'Created At', value: 'created_at' },
        { label: 'Updated At', value: 'updated_at' }
      ];

      // Convert to CSV
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(cameras);

      // Set headers for file download
      const filename = `cameras_export_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send CSV data
      res.send(csv);

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Import cameras from CSV
  static async importCameras(req, res) {
    csvUpload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: 'File too large. Maximum size is 10MB.' 
            });
          }
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'No CSV file uploaded' 
        });
      }

      const results = [];
      const errors = [];
      let processed = 0;
      let created = 0;
      let skipped = 0;

      try {
        // Read and parse CSV file
        const stream = fs.createReadStream(req.file.path)
          .pipe(csvParser({
            // Map CSV headers to expected field names (case-insensitive)
            mapHeaders: ({ header }) => {
              const headerMap = {
                'brand': 'brand',
                'model': 'model', 
                'serial': 'serial',
                'mechanical': 'mechanical_status',
                'mechanical_status': 'mechanical_status',
                'cosmetic': 'cosmetic_status',
                'cosmetic_status': 'cosmetic_status',
                'kamerastore': 'kamerastore_price',
                'kamerastore_price': 'kamerastore_price',
                'kamerastore price': 'kamerastore_price',
                'weighted_price': 'weighted_price',
                'weighted price': 'weighted_price',
                'sold_price': 'sold_price',
                'sold price': 'sold_price',
                'comment': 'comment',
                'comments': 'comment'
              };
              
              const normalizedHeader = header.toLowerCase().trim();
              return headerMap[normalizedHeader] || header;
            }
          }));

        // Process each row
        stream.on('data', (row) => {
          processed++;
          
          try {
            // Validate required fields
            if (!row.brand || !row.model) {
              errors.push(`Row ${processed}: Brand and Model are required`);
              skipped++;
              return;
            }

            // Clean and validate data
            const cameraData = {
              brand: row.brand?.trim(),
              model: row.model?.trim(),
              serial: row.serial?.trim() || null,
              mechanical_status: row.mechanical_status ? parseInt(row.mechanical_status) : null,
              cosmetic_status: row.cosmetic_status ? parseInt(row.cosmetic_status) : null,
              kamerastore_price: row.kamerastore_price ? parseFloat(row.kamerastore_price) : null,
              sold_price: row.sold_price ? parseFloat(row.sold_price) : null,
              comment: row.comment?.trim() || null
            };

            // Validate status values
            if (cameraData.mechanical_status && (cameraData.mechanical_status < 1 || cameraData.mechanical_status > 5)) {
              errors.push(`Row ${processed}: Mechanical status must be between 1 and 5`);
              skipped++;
              return;
            }

            if (cameraData.cosmetic_status && (cameraData.cosmetic_status < 1 || cameraData.cosmetic_status > 5)) {
              errors.push(`Row ${processed}: Cosmetic status must be between 1 and 5`);
              skipped++;
              return;
            }

            // Create camera
            const camera = Camera.createCamera(cameraData);
            results.push(camera);
            created++;

            // Schedule background job to fetch default image if no user images
            const jobId = jobQueue.scheduleDefaultImageFetch(camera);
            if (jobId) {
              console.log(`Scheduled default image job ${jobId} for ${camera.brand} ${camera.model}`);
            }

          } catch (error) {
            errors.push(`Row ${processed}: ${error.message}`);
            skipped++;
          }
        });

        // Handle completion
        stream.on('end', () => {
          // Clean up temporary file
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temp file:', unlinkErr);
            }
          });

          // Send response
          res.json({
            message: 'Import completed',
            summary: {
              processed,
              created,
              skipped,
              errors: errors.length
            },
            errors: errors.length > 0 ? errors : undefined,
            sample: results.slice(0, 3) // Show first 3 imported cameras
          });
        });

        // Handle stream errors
        stream.on('error', (streamError) => {
          // Clean up temporary file
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temp file:', unlinkErr);
            }
          });

          res.status(500).json({ 
            error: `Error reading CSV file: ${streamError.message}` 
          });
        });

      } catch (error) {
        // Clean up temporary file
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temp file:', unlinkErr);
          }
        });

        res.status(500).json({ error: error.message });
      }
    });
  }
}

module.exports = ImportExportController;