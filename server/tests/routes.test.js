const request = require('supertest');
const app = require('../app'); // We'll create this

describe('Camera Routes', () => {
  describe('Route mounting', () => {
    test('should mount camera routes at /api/cameras', async () => {
      const response = await request(app)
        .get('/api/cameras')
        .expect('Content-Type', /json/);
      
      // Should return 200 (not 404) indicating routes are mounted
      expect(response.status).not.toBe(404);
    });

    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/cameras', () => {
    test('should return empty array when no cameras exist', async () => {
      const response = await request(app)
        .get('/api/cameras')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/cameras/:id', () => {
    test('should return 404 for non-existent camera', async () => {
      const response = await request(app)
        .get('/api/cameras/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/cameras', () => {
    test('should create a new camera', async () => {
      const newCamera = {
        brand: 'Nikon',
        model: 'F50',
        serial: '2922618',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600,
        comment: 'Test camera'
      };

      const response = await request(app)
        .post('/api/cameras')
        .send(newCamera)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('id');
      expect(response.body.brand).toBe('Nikon');
      expect(response.body.weighted_price).toBe(540); // Should calculate automatically
    });

    test('should validate required fields', async () => {
      const invalidCamera = {
        model: 'F50' // Missing required brand
      };

      const response = await request(app)
        .post('/api/cameras')
        .send(invalidCamera)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/cameras/:id', () => {
    test('should update an existing camera', async () => {
      const newCamera = {
        brand: 'Nikon',
        model: 'F50',
        serial: '2922618',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600,
        comment: 'Test camera'
      };

      // First create a camera
      const createResponse = await request(app)
        .post('/api/cameras')
        .send(newCamera);

      const cameraId = createResponse.body.id;

      // Then update it
      const updateData = {
        comment: 'Updated test camera',
        mechanical_status: 3
      };

      const response = await request(app)
        .put(`/api/cameras/${cameraId}`)
        .send(updateData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.comment).toBe('Updated test camera');
      expect(response.body.mechanical_status).toBe(3);
      expect(response.body.weighted_price).toBe(420); // Should recalculate
    });

    test('should return 404 for non-existent camera', async () => {
      const response = await request(app)
        .put('/api/cameras/999')
        .send({ comment: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cameras/:id', () => {
    test('should delete an existing camera', async () => {
      const newCamera = {
        brand: 'Nikon',
        model: 'F50',
        serial: '2922618',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600,
        comment: 'Test camera'
      };

      // First create a camera
      const createResponse = await request(app)
        .post('/api/cameras')
        .send(newCamera);

      const cameraId = createResponse.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/cameras/${cameraId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.id).toBe(cameraId);

      // Verify it's actually deleted
      await request(app)
        .get(`/api/cameras/${cameraId}`)
        .expect(404);
    });

    test('should return 404 for non-existent camera', async () => {
      const response = await request(app)
        .delete('/api/cameras/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});