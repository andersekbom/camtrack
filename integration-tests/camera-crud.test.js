const request = require('supertest');
const path = require('path');

describe('Camera CRUD Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Start the server for integration tests
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_PATH = ':memory:';
    process.env.PORT = 0; // Use random available port
    
    app = require('../server/app');
    server = app.listen();
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clear all cameras before each test
    await request(app).delete('/api/cameras/clear');
  });

  describe('Complete Camera Lifecycle', () => {
    test('should create, read, update, and delete a camera', async () => {
      // Create a camera
      const newCamera = {
        brand: 'Nikon',
        model: 'F50',
        serial: '2922618',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600,
        comment: 'Test camera'
      };

      const createResponse = await request(app)
        .post('/api/cameras')
        .send(newCamera)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.brand).toBe('Nikon');
      expect(createResponse.body.weighted_price).toBe(540);

      const cameraId = createResponse.body.id;

      // Read the camera
      const readResponse = await request(app)
        .get(`/api/cameras/${cameraId}`)
        .expect(200);

      expect(readResponse.body.id).toBe(cameraId);
      expect(readResponse.body.brand).toBe('Nikon');
      expect(readResponse.body.model).toBe('F50');

      // Update the camera
      const updateData = {
        comment: 'Updated test camera',
        mechanical_status: 3,
        kamerastore_price: 500
      };

      const updateResponse = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.comment).toBe('Updated test camera');
      expect(updateResponse.body.mechanical_status).toBe(3);
      expect(updateResponse.body.kamerastore_price).toBe(500);
      // Weighted price should be recalculated
      expect(updateResponse.body.weighted_price).toBe(350); // 500 * (0.2 + (3.5 - 1) * 0.2) = 500 * 0.7 = 350

      // Delete the camera
      const deleteResponse = await request(app)
        .delete(`/api/cameras/${cameraId}`)
        .expect(200);

      expect(deleteResponse.body.message).toContain('deleted successfully');

      // Verify deletion
      await request(app)
        .get(`/api/cameras/${cameraId}`)
        .expect(404);
    });

    test('should handle concurrent operations correctly', async () => {
      const cameras = [
        {
          brand: 'Canon',
          model: 'AE-1',
          mechanical_status: 4,
          cosmetic_status: 3,
          kamerastore_price: 150
        },
        {
          brand: 'Pentax',
          model: 'K1000',
          mechanical_status: 5,
          cosmetic_status: 5,
          kamerastore_price: 200
        },
        {
          brand: 'Olympus',
          model: 'OM-1',
          mechanical_status: 3,
          cosmetic_status: 2,
          kamerastore_price: 180
        }
      ];

      // Create multiple cameras concurrently
      const createPromises = cameras.map(camera =>
        request(app).post('/api/cameras').send(camera)
      );

      const createResponses = await Promise.all(createPromises);
      
      // All should succeed
      createResponses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
      });

      // Get all cameras
      const getAllResponse = await request(app)
        .get('/api/cameras')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(3);
      expect(getAllResponse.body.map(c => c.brand)).toContain('Canon');
      expect(getAllResponse.body.map(c => c.brand)).toContain('Pentax');
      expect(getAllResponse.body.map(c => c.brand)).toContain('Olympus');
    });
  });

  describe('Search and Filter Integration', () => {
    beforeEach(async () => {
      // Create test cameras
      const testCameras = [
        {
          brand: 'Nikon',
          model: 'F50',
          serial: '001',
          mechanical_status: 5,
          cosmetic_status: 4,
          kamerastore_price: 600
        },
        {
          brand: 'Canon',
          model: 'AE-1',
          serial: '002',
          mechanical_status: 3,
          cosmetic_status: 3,
          kamerastore_price: 150
        },
        {
          brand: 'Nikon',
          model: 'FM',
          serial: '003',
          mechanical_status: 4,
          cosmetic_status: 5,
          kamerastore_price: 400
        }
      ];

      for (const camera of testCameras) {
        await request(app).post('/api/cameras').send(camera);
      }
    });

    test('should search cameras by brand', async () => {
      const response = await request(app)
        .get('/api/cameras?search=Nikon')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(camera => camera.brand === 'Nikon')).toBe(true);
    });

    test('should search cameras by model', async () => {
      const response = await request(app)
        .get('/api/cameras?search=AE-1')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].model).toBe('AE-1');
    });

    test('should filter cameras by price range', async () => {
      const response = await request(app)
        .get('/api/cameras?minPrice=300&maxPrice=500')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].kamerastore_price).toBe(400);
    });

    test('should combine search and filters', async () => {
      const response = await request(app)
        .get('/api/cameras?search=Nikon&minPrice=500')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].brand).toBe('Nikon');
      expect(response.body[0].model).toBe('F50');
      expect(response.body[0].kamerastore_price).toBe(600);
    });
  });

  describe('Summary Integration', () => {
    test('should calculate accurate summary statistics', async () => {
      const testCameras = [
        {
          brand: 'Nikon',
          model: 'F50',
          mechanical_status: 5,
          cosmetic_status: 4,
          kamerastore_price: 600,
          sold_price: 540
        },
        {
          brand: 'Canon',
          model: 'AE-1',
          mechanical_status: 4,
          cosmetic_status: 3,
          kamerastore_price: 150,
          sold_price: 120
        },
        {
          brand: 'Canon',
          model: 'A-1',
          mechanical_status: 3,
          cosmetic_status: 2,
          kamerastore_price: 200
        }
      ];

      for (const camera of testCameras) {
        await request(app).post('/api/cameras').send(camera);
      }

      const response = await request(app)
        .get('/api/summary')
        .expect(200);

      expect(response.body.total_cameras).toBe(3);
      expect(response.body.total_value_kamerastore).toBe(950);
      expect(response.body.total_value_sold).toBe(660); // Only 2 cameras have sold prices

      // Brand distribution
      expect(response.body.brand_distribution).toHaveLength(2);
      const nikonBrand = response.body.brand_distribution.find(b => b.brand === 'Nikon');
      const canonBrand = response.body.brand_distribution.find(b => b.brand === 'Canon');
      
      expect(nikonBrand.count).toBe(1);
      expect(canonBrand.count).toBe(2);
    });
  });

  describe('Import/Export Integration', () => {
    test('should export and import cameras maintaining data integrity', async () => {
      const originalCameras = [
        {
          brand: 'Nikon',
          model: 'F50',
          serial: '001',
          mechanical_status: 5,
          cosmetic_status: 4,
          kamerastore_price: 600,
          sold_price: 540,
          comment: 'Excellent camera'
        },
        {
          brand: 'Canon',
          model: 'AE-1',
          serial: '002',
          mechanical_status: 4,
          cosmetic_status: 3,
          kamerastore_price: 150,
          comment: 'Good condition'
        }
      ];

      // Create original cameras
      for (const camera of originalCameras) {
        await request(app).post('/api/cameras').send(camera);
      }

      // Export cameras
      const exportResponse = await request(app)
        .get('/api/export/csv')
        .expect(200);

      // Clear all cameras
      await request(app).delete('/api/cameras/clear');

      // Verify empty
      const emptyCheck = await request(app).get('/api/cameras').expect(200);
      expect(emptyCheck.body).toHaveLength(0);

      // Import cameras back
      const importResponse = await request(app)
        .post('/api/import/csv')
        .attach('file', Buffer.from(exportResponse.text), 'cameras.csv')
        .expect(200);

      expect(importResponse.body.imported).toBe(2);
      expect(importResponse.body.errors).toHaveLength(0);

      // Verify imported cameras
      const importedCameras = await request(app).get('/api/cameras').expect(200);
      expect(importedCameras.body).toHaveLength(2);

      // Verify data integrity (excluding IDs which will be different)
      const nikonCamera = importedCameras.body.find(c => c.brand === 'Nikon');
      const canonCamera = importedCameras.body.find(c => c.brand === 'Canon');

      expect(nikonCamera.model).toBe('F50');
      expect(nikonCamera.mechanical_status).toBe(5);
      expect(nikonCamera.cosmetic_status).toBe(4);
      expect(nikonCamera.kamerastore_price).toBe(600);
      expect(nikonCamera.sold_price).toBe(540);

      expect(canonCamera.model).toBe('AE-1');
      expect(canonCamera.mechanical_status).toBe(4);
      expect(canonCamera.cosmetic_status).toBe(3);
      expect(canonCamera.kamerastore_price).toBe(150);
    });
  });
});