const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');

describe('Import/Export Routes', () => {
  const testCamera = {
    brand: 'Nikon',
    model: 'F50',
    serial: '2922618',
    mechanical_status: 5,
    cosmetic_status: 4,
    kamerastore_price: 600,
    comment: 'Test camera'
  };

  beforeEach(async () => {
    // Clear all cameras before each test
    await request(app).delete('/api/cameras/clear');
  });

  describe('CSV Export', () => {
    test('should export empty CSV when no cameras exist', async () => {
      const response = await request(app)
        .get('/api/export')
        .expect(200)
        .expect('Content-Type', /text\/csv/);

      expect(response.text).toContain('Brand,Model,Serial');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="cameras_export_\d+\.csv"/);
    });

    test('should export CSV with camera data', async () => {
      // First create a camera
      await request(app)
        .post('/api/cameras')
        .send(testCamera);

      const response = await request(app)
        .get('/api/export')
        .expect(200)
        .expect('Content-Type', /text\/csv/);

      expect(response.text).toContain('Brand,Model,Serial');
      expect(response.text).toContain('Nikon,F50,2922618');
      expect(response.text).toContain('5,4,600');
    });
  });

  describe('CSV Import', () => {
    test('should reject invalid file format', async () => {
      const response = await request(app)
        .post('/api/import')
        .attach('file', Buffer.from('invalid data'), 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('CSV file required');
    });

    test('should import valid CSV data', async () => {
      const csvData = `Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
Canon,AE-1,123456,4,3,150,,120,Great camera
Pentax,K1000,789012,5,5,200,,180,Excellent condition`;

      const response = await request(app)
        .post('/api/import')
        .attach('file', Buffer.from(csvData), 'cameras.csv')
        .expect(200);

      expect(response.body).toHaveProperty('imported');
      expect(response.body.imported).toBe(2);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual([]);

      // Verify cameras were actually imported
      const getCamerasResponse = await request(app)
        .get('/api/cameras')
        .expect(200);

      expect(getCamerasResponse.body).toHaveLength(2);
      expect(getCamerasResponse.body[0].brand).toBe('Canon');
      expect(getCamerasResponse.body[1].brand).toBe('Pentax');
    });

    test('should handle CSV with validation errors', async () => {
      const csvData = `Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
,AE-1,123456,4,3,150,,120,Missing brand
Canon,,789012,5,5,200,,180,Missing model
Pentax,K1000,111111,6,3,200,,180,Invalid mechanical status`;

      const response = await request(app)
        .post('/api/import')
        .attach('file', Buffer.from(csvData), 'cameras.csv')
        .expect(200);

      expect(response.body.imported).toBe(0);
      expect(response.body.errors).toHaveLength(3);
      expect(response.body.errors[0]).toContain('Brand is required');
      expect(response.body.errors[1]).toContain('Model is required');
      expect(response.body.errors[2]).toContain('Mechanical status must be between 1 and 5');
    });

    test('should handle partial import with some valid and some invalid rows', async () => {
      const csvData = `Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment
Canon,AE-1,123456,4,3,150,,120,Valid camera
,InvalidCamera,789012,5,5,200,,180,Missing brand
Pentax,K1000,111111,5,4,300,,250,Another valid camera`;

      const response = await request(app)
        .post('/api/import')
        .attach('file', Buffer.from(csvData), 'cameras.csv')
        .expect(200);

      expect(response.body.imported).toBe(2);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0]).toContain('Brand is required');

      // Verify only valid cameras were imported
      const getCamerasResponse = await request(app)
        .get('/api/cameras')
        .expect(200);

      expect(getCamerasResponse.body).toHaveLength(2);
      expect(getCamerasResponse.body.map(c => c.brand)).toContain('Canon');
      expect(getCamerasResponse.body.map(c => c.brand)).toContain('Pentax');
    });
  });
});