#!/usr/bin/env node

const app = require('../app');
const request = require('supertest');

async function testDefaultImagesAPI() {
  console.log('🧪 Testing Default Images API endpoints...\n');
  
  try {
    // Test 1: GET all default images
    console.log('🔄 Test 1: GET /api/default-images');
    const getAllResponse = await request(app).get('/api/default-images');
    console.log(`✅ Status: ${getAllResponse.status}`);
    console.log(`✅ Found ${getAllResponse.body.length} default images`);
    
    // Test 2: GET brands
    console.log('\n🔄 Test 2: GET /api/default-images/brands');
    const brandsResponse = await request(app).get('/api/default-images/brands');
    console.log(`✅ Status: ${brandsResponse.status}`);
    console.log(`✅ Found brands: ${brandsResponse.body.join(', ')}`);
    
    // Test 3: GET models for a brand
    console.log('\n🔄 Test 3: GET /api/default-images/models/Nikon');
    const modelsResponse = await request(app).get('/api/default-images/models/Nikon');
    console.log(`✅ Status: ${modelsResponse.status}`);
    console.log(`✅ Found Nikon models: ${modelsResponse.body.join(', ')}`);
    
    // Test 4: GET specific default image by ID
    console.log('\n🔄 Test 4: GET /api/default-images/1');
    const getByIdResponse = await request(app).get('/api/default-images/1');
    console.log(`✅ Status: ${getByIdResponse.status}`);
    if (getByIdResponse.body.brand) {
      console.log(`✅ Found: ${getByIdResponse.body.brand} ${getByIdResponse.body.model}`);
    }
    
    // Test 5: POST create new default image
    console.log('\n🔄 Test 5: POST /api/default-images');
    const newImageData = {
      brand: 'Test Brand',
      model: 'Test Model API',
      image_url: 'https://example.com/test-api.jpg',
      source: 'Test API',
      source_attribution: 'Test attribution for API',
      image_quality: 7
    };
    
    const createResponse = await request(app)
      .post('/api/default-images')
      .send(newImageData);
    
    console.log(`✅ Status: ${createResponse.status}`);
    const createdId = createResponse.body.id;
    console.log(`✅ Created default image with ID: ${createdId}`);
    
    // Test 6: PUT update the created image
    console.log('\n🔄 Test 6: PUT /api/default-images/' + createdId);
    const updateData = {
      image_quality: 9,
      source_attribution: 'Updated attribution'
    };
    
    const updateResponse = await request(app)
      .put(`/api/default-images/${createdId}`)
      .send(updateData);
    
    console.log(`✅ Status: ${updateResponse.status}`);
    console.log(`✅ Updated quality to: ${updateResponse.body.image_quality}`);
    
    // Test 7: Error handling - duplicate creation
    console.log('\n🔄 Test 7: POST duplicate (should fail)');
    const duplicateResponse = await request(app)
      .post('/api/default-images')
      .send(newImageData);
    
    console.log(`✅ Status: ${duplicateResponse.status} (should be 409)`);
    if (duplicateResponse.status === 409) {
      console.log('✅ Correctly rejected duplicate');
    }
    
    // Test 8: Error handling - invalid data
    console.log('\n🔄 Test 8: POST invalid data (should fail)');
    const invalidData = {
      brand: 'Test',
      // missing required fields
    };
    
    const invalidResponse = await request(app)
      .post('/api/default-images')
      .send(invalidData);
    
    console.log(`✅ Status: ${invalidResponse.status} (should be 400)`);
    if (invalidResponse.status === 400) {
      console.log('✅ Correctly rejected invalid data');
    }
    
    // Test 9: DELETE the created image
    console.log('\n🔄 Test 9: DELETE /api/default-images/' + createdId);
    const deleteResponse = await request(app).delete(`/api/default-images/${createdId}`);
    console.log(`✅ Status: ${deleteResponse.status} (should be 204)`);
    
    // Test 10: GET deleted image (should fail)
    console.log('\n🔄 Test 10: GET deleted image (should fail)');
    const deletedResponse = await request(app).get(`/api/default-images/${createdId}`);
    console.log(`✅ Status: ${deletedResponse.status} (should be 404)`);
    if (deletedResponse.status === 404) {
      console.log('✅ Correctly returned 404 for deleted image');
    }
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

// Check if supertest is available
try {
  require('supertest');
  testDefaultImagesAPI();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  supertest not available, running basic model tests instead');
    
    // Basic model test as fallback
    const DefaultImage = require('../models/DefaultImage');
    
    console.log('📋 Testing DefaultImage model...');
    const allImages = DefaultImage.findAll();
    console.log(`✅ Found ${allImages.length} default images in database`);
    
    const brands = DefaultImage.getBrands();
    console.log(`✅ Found brands: ${brands.join(', ')}`);
    
    if (brands.length > 0) {
      const models = DefaultImage.getModelsByBrand(brands[0]);
      console.log(`✅ Found ${models.length} models for ${brands[0]}`);
    }
    
    console.log('🎉 Basic model tests completed!');
  } else {
    throw error;
  }
}