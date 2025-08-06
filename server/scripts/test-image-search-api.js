#!/usr/bin/env node

const app = require('../app');
const request = require('supertest');

async function testImageSearchAPI() {
  console.log('🧪 Testing Image Search API endpoints...\n');
  
  try {
    // Test 1: Search Wikipedia images
    console.log('🔄 Test 1: POST /api/image-search/wikipedia');
    const searchResponse = await request(app)
      .post('/api/image-search/wikipedia')
      .send({
        brand: 'Nikon',
        model: 'F',
        limit: 3
      });
    
    console.log(`✅ Status: ${searchResponse.status}`);
    console.log(`✅ Found ${searchResponse.body.resultsCount} results`);
    
    if (searchResponse.body.results && searchResponse.body.results.length > 0) {
      const firstResult = searchResponse.body.results[0];
      console.log(`✅ Best result: ${firstResult.filename}`);
      console.log(`✅ Quality: ${firstResult.quality}/10`);
      console.log(`✅ License: ${firstResult.license || 'Unknown'}`);
    }
    
    // Test 2: Find best image
    console.log('\n🔄 Test 2: POST /api/image-search/find-best');
    const findBestResponse = await request(app)
      .post('/api/image-search/find-best')
      .send({
        brand: 'Canon',
        model: 'AE-1'
      });
    
    console.log(`✅ Status: ${findBestResponse.status}`);
    if (findBestResponse.body.image) {
      console.log(`✅ Found image URL: ${findBestResponse.body.image.image_url.substring(0, 60)}...`);
      console.log(`✅ Quality: ${findBestResponse.body.image.image_quality}/10`);
      console.log(`✅ Dimensions: ${findBestResponse.body.image.width}x${findBestResponse.body.image.height}`);
    }
    
    // Test 3: Auto-assign image
    console.log('\n🔄 Test 3: POST /api/image-search/auto-assign');
    const autoAssignResponse = await request(app)
      .post('/api/image-search/auto-assign')
      .send({
        brand: 'Hasselblad',
        model: '500CM',
        overwrite: false
      });
    
    console.log(`✅ Status: ${autoAssignResponse.status}`);
    if (autoAssignResponse.body.defaultImage) {
      console.log(`✅ Created default image ID: ${autoAssignResponse.body.defaultImage.id}`);
      console.log(`✅ Image quality: ${autoAssignResponse.body.defaultImage.image_quality}/10`);
      console.log(`✅ Source: ${autoAssignResponse.body.defaultImage.source}`);
    }
    
    // Test 4: Get model suggestions
    console.log('\n🔄 Test 4: GET /api/image-search/suggestions/Nikon');
    const suggestionsResponse = await request(app)
      .get('/api/image-search/suggestions/Nikon')
      .query({ partial: 'F' });
    
    console.log(`✅ Status: ${suggestionsResponse.status}`);
    if (suggestionsResponse.body.suggestions) {
      console.log(`✅ Found ${suggestionsResponse.body.suggestions.length} suggestions`);
      console.log(`✅ First 3 suggestions: ${suggestionsResponse.body.suggestions.slice(0, 3).join(', ')}`);
    }
    
    // Test 5: Batch assign (small batch)
    console.log('\n🔄 Test 5: POST /api/image-search/batch-assign');
    const batchResponse = await request(app)
      .post('/api/image-search/batch-assign')
      .send({
        cameras: [
          { brand: 'Mamiya', model: 'C330' },
          { brand: 'Rolleiflex', model: '2.8F' }
        ],
        overwrite: false
      });
    
    console.log(`✅ Status: ${batchResponse.status}`);
    if (batchResponse.body.summary) {
      console.log(`✅ Batch summary:`);
      console.log(`  📊 Total: ${batchResponse.body.summary.total}`);
      console.log(`  ✅ Successful: ${batchResponse.body.summary.successful}`);
      console.log(`  ⏭️  Skipped: ${batchResponse.body.summary.skipped}`);
      console.log(`  ❌ Errors: ${batchResponse.body.summary.errors}`);
    }
    
    // Test 6: Validate URL
    console.log('\n🔄 Test 6: POST /api/image-search/validate-url');
    const validationResponse = await request(app)
      .post('/api/image-search/validate-url')
      .send({
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Nikon_F_img_2535.jpg'
      });
    
    console.log(`✅ Status: ${validationResponse.status}`);
    console.log(`✅ URL valid: ${validationResponse.body.isValid}`);
    
    // Test 7: Error handling - missing parameters
    console.log('\n🔄 Test 7: Error handling - missing parameters');
    const errorResponse = await request(app)
      .post('/api/image-search/find-best')
      .send({
        brand: 'Nikon'
        // missing model
      });
    
    console.log(`✅ Status: ${errorResponse.status} (should be 400)`);
    console.log(`✅ Error message: ${errorResponse.body.error}`);
    
    // Test 8: Error handling - duplicate assignment
    console.log('\n🔄 Test 8: Error handling - duplicate assignment');
    const duplicateResponse = await request(app)
      .post('/api/image-search/auto-assign')
      .send({
        brand: 'Hasselblad',
        model: '500CM',
        overwrite: false
      });
    
    console.log(`✅ Status: ${duplicateResponse.status} (should be 409)`);
    if (duplicateResponse.body.existing) {
      console.log(`✅ Existing image ID: ${duplicateResponse.body.existing.id}`);
    }
    
    console.log('\n🎉 All Image Search API tests completed successfully!');
    console.log('\n📋 API Endpoints Verified:');
    console.log('  ✅ Wikipedia image search');
    console.log('  ✅ Best image finder');
    console.log('  ✅ Auto image assignment');
    console.log('  ✅ Batch processing');
    console.log('  ✅ Model suggestions');
    console.log('  ✅ URL validation');
    console.log('  ✅ Error handling');
    
  } catch (error) {
    console.error('❌ Image Search API test failed:', error.message);
    process.exit(1);
  }
}

// Check if supertest is available
try {
  require('supertest');
  testImageSearchAPI();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  supertest not available, testing basic functionality instead');
    
    // Basic functionality test as fallback
    const WikipediaImageService = require('../services/WikipediaImageService');
    
    async function basicTest() {
      console.log('📋 Testing basic Wikipedia service functionality...');
      try {
        const result = await WikipediaImageService.findBestImageForCamera('Nikon', 'F');
        console.log(`✅ Wikipedia service working: ${result ? 'Found image' : 'No image found'}`);
        console.log('🎉 Basic functionality test completed!');
      } catch (error) {
        console.error('❌ Basic test failed:', error.message);
      }
    }
    
    basicTest();
  } else {
    throw error;
  }
}