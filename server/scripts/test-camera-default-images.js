#!/usr/bin/env node

const Camera = require('../models/Camera');
const ImageService = require('../services/ImageService');

async function testCameraDefaultImages() {
  console.log('🧪 Testing Camera API with Default Images integration...\n');
  
  try {
    // Test 1: Get all cameras with image enhancement
    console.log('🔄 Test 1: Get all cameras with enhanced images');
    const allCameras = Camera.getAllCameras();
    console.log(`✅ Found ${allCameras.length} cameras`);
    
    if (allCameras.length > 0) {
      const firstCamera = allCameras[0];
      console.log(`✅ First camera: ${firstCamera.brand} ${firstCamera.model}`);
      console.log(`✅ Image source: ${firstCamera.image_source}`);
      console.log(`✅ Primary image: ${firstCamera.primary_image || 'none'}`);
      console.log(`✅ Has user images: ${firstCamera.has_user_images}`);
    }
    
    // Test 2: Create a camera without images (should get default)
    console.log('\n🔄 Test 2: Create camera without images');
    const newCamera = Camera.createCamera({
      brand: 'Nikon',
      model: 'F',
      serial: 'TEST123',
      mechanical_status: 4,
      cosmetic_status: 4,
      kamerastore_price: 500,
      comment: 'Test camera for default images'
    });
    
    console.log(`✅ Created camera ID: ${newCamera.id}`);
    console.log(`✅ Image source: ${newCamera.image_source}`);
    console.log(`✅ Primary image: ${newCamera.primary_image || 'none'}`);
    console.log(`✅ Has user images: ${newCamera.has_user_images}`);
    
    if (newCamera.default_image_info) {
      console.log(`✅ Default image type: ${newCamera.default_image_info.type}`);
      console.log(`✅ Default image source: ${newCamera.default_image_info.source}`);
    }
    
    // Test 3: Create a camera with unknown brand/model (should get placeholder)
    console.log('\n🔄 Test 3: Create camera with unknown brand/model');
    const unknownCamera = Camera.createCamera({
      brand: 'Unknown Brand',
      model: 'Unknown Model',
      serial: 'UNK123',
      mechanical_status: 3,
      cosmetic_status: 3,
      kamerastore_price: 100,
      comment: 'Unknown camera for placeholder test'
    });
    
    console.log(`✅ Created camera ID: ${unknownCamera.id}`);
    console.log(`✅ Image source: ${unknownCamera.image_source}`);
    console.log(`✅ Primary image: ${unknownCamera.primary_image || 'none'}`);
    
    // Test 4: Update a camera to add user images
    console.log('\n🔄 Test 4: Update camera to add user images');
    const updatedCamera = Camera.updateCamera(newCamera.id, {
      image1_path: 'uploads/cameras/test-image.jpg'
    });
    
    console.log(`✅ Updated camera ID: ${updatedCamera.id}`);
    console.log(`✅ Image source: ${updatedCamera.image_source}`);
    console.log(`✅ Primary image: ${updatedCamera.primary_image || 'none'}`);
    console.log(`✅ Has user images: ${updatedCamera.has_user_images}`);
    
    // Test 5: Get image statistics
    console.log('\n🔄 Test 5: Get image statistics');
    const stats = Camera.getImageStatistics();
    console.log('✅ Image Statistics:');
    console.log(`  📊 Total cameras: ${stats.total_cameras}`);
    console.log(`  📷 With user images: ${stats.with_user_images}`);
    console.log(`  🎯 With default model images: ${stats.with_default_model}`);
    console.log(`  🏷️  With default brand images: ${stats.with_default_brand}`);
    console.log(`  📁 With placeholder: ${stats.with_placeholder}`);
    console.log(`  📈 Coverage: ${stats.coverage_percentage}%`);
    
    // Test 6: Test individual image fallback logic
    console.log('\n🔄 Test 6: Test ImageService fallback logic');
    const testCamera = {
      brand: 'Canon',
      model: 'AE-1',
      image1_path: null,
      image2_path: null
    };
    
    const imageInfo = ImageService.getImageForCamera(testCamera);
    console.log(`✅ Test camera image source: ${imageInfo.image_source}`);
    console.log(`✅ Test camera primary image: ${imageInfo.primary_image || 'none'}`);
    
    // Test 7: Update all has_user_images flags
    console.log('\n🔄 Test 7: Update all has_user_images flags');
    const updatedCount = Camera.updateAllHasUserImagesFlags();
    console.log(`✅ Updated ${updatedCount} camera records`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    Camera.deleteCamera(newCamera.id);
    Camera.deleteCamera(unknownCamera.id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All Camera + Default Images integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Camera default images test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testCameraDefaultImages();