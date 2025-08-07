const request = require('supertest');
const app = require('../app');

describe('Summary Routes', () => {
  const testCameras = [
    {
      brand: 'Nikon',
      model: 'F50',
      serial: '001',
      mechanical_status: 5,
      cosmetic_status: 4,
      kamerastore_price: 600,
      sold_price: 540,
      comment: 'Excellent'
    },
    {
      brand: 'Canon',
      model: 'AE-1',
      serial: '002',
      mechanical_status: 4,
      cosmetic_status: 3,
      kamerastore_price: 150,
      sold_price: 120,
      comment: 'Good'
    },
    {
      brand: 'Pentax',
      model: 'K1000',
      serial: '003',
      mechanical_status: 3,
      cosmetic_status: 2,
      kamerastore_price: 200,
      sold_price: 180,
      comment: 'Fair'
    }
  ];

  beforeEach(async () => {
    // Clear all cameras before each test
    await request(app).delete('/api/cameras/clear');
  });

  describe('GET /api/summary', () => {
    test('should return empty summary when no cameras exist', async () => {
      const response = await request(app)
        .get('/api/summary')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        totalCameras: 0,
        totalValue: 0,
        averageValue: 0,
        averageMechanicalCondition: 0,
        averageCosmeticCondition: 0,
        brandBreakdown: [],
        conditionBreakdown: {
          mechanical: {},
          cosmetic: {}
        },
        priceRanges: {
          under100: 0,
          range100to300: 0,
          range300to500: 0,
          range500to1000: 0,
          over1000: 0
        },
        mostExpensive: null,
        leastExpensive: null,
        recentAdditions: 0,
        camerasWithImages: 0
      });
    });

    test('should calculate correct summary with multiple cameras', async () => {
      // Create test cameras
      for (const camera of testCameras) {
        await request(app)
          .post('/api/cameras')
          .send(camera);
      }

      const response = await request(app)
        .get('/api/summary')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.totalCameras).toBe(3);
      
      // Average mechanical status: (5 + 4 + 3) / 3 = 4
      expect(response.body.averageMechanicalCondition).toBeCloseTo(4.0, 1);
      
      // Average cosmetic status: (4 + 3 + 2) / 3 = 3
      expect(response.body.averageCosmeticCondition).toBeCloseTo(3.0, 1);

      // Brand distribution
      expect(response.body.brandBreakdown).toHaveLength(3);
      expect(response.body.brandBreakdown.map(b => b.brand)).toContain('Nikon');
      expect(response.body.brandBreakdown.map(b => b.brand)).toContain('Canon');
      expect(response.body.brandBreakdown.map(b => b.brand)).toContain('Pentax');
      
      // Each brand should have count of 1
      response.body.brandBreakdown.forEach(brand => {
        expect(brand.count).toBe(1);
      });
    });

    test('should calculate condition distribution correctly', async () => {
      // Add cameras with specific conditions for testing distribution
      const conditionTestCameras = [
        { ...testCameras[0], mechanical_status: 5, cosmetic_status: 5 }, // excellent
        { ...testCameras[1], mechanical_status: 4, cosmetic_status: 4 }, // very good
        { ...testCameras[2], mechanical_status: 3, cosmetic_status: 3 }, // good
        { 
          brand: 'Olympus', 
          model: 'OM-1', 
          serial: '004',
          mechanical_status: 2, 
          cosmetic_status: 2, 
          kamerastore_price: 100 
        }, // fair
        { 
          brand: 'Minolta', 
          model: 'X-700', 
          serial: '005',
          mechanical_status: 1, 
          cosmetic_status: 1, 
          kamerastore_price: 50 
        } // poor
      ];

      for (const camera of conditionTestCameras) {
        await request(app)
          .post('/api/cameras')
          .send(camera);
      }

      const response = await request(app)
        .get('/api/summary')
        .expect(200);

      const { conditionBreakdown } = response.body;
      expect(conditionBreakdown.mechanical[5]).toBe(1); // excellent
      expect(conditionBreakdown.mechanical[4]).toBe(1); // very good
      expect(conditionBreakdown.mechanical[3]).toBe(1); // good
      expect(conditionBreakdown.mechanical[2]).toBe(1); // fair
      expect(conditionBreakdown.mechanical[1]).toBe(1); // poor
    });

    test('should calculate weighted prices correctly', async () => {
      // Create a camera and verify weighted price calculation
      const camera = {
        brand: 'Nikon',
        model: 'F50',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600
      };

      await request(app)
        .post('/api/cameras')
        .send(camera);

      const response = await request(app)
        .get('/api/summary')
        .expect(200);

      // Should have positive total value
      expect(response.body.totalValue).toBeGreaterThan(0);
      expect(response.body.averageValue).toBeGreaterThan(0);
    });
  });
});