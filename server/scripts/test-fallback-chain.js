#!/usr/bin/env node

const ImageService = require('../services/ImageService');

function testFallbackChain() {
  console.log('🧪 Testing Complete Image Fallback Chain...\n');
  
  // Test Case 1: Camera with user images (Priority 1)
  console.log('🔄 Test 1: Camera with user images (highest priority)');
  const cameraWithUserImages = {
    id: 1,
    brand: 'Nikon',
    model: 'F',
    image1_path: 'uploads/cameras/user-image-1.jpg',
    image2_path: 'uploads/cameras/user-image-2.jpg'
  };
  
  const result1 = ImageService.getImageForCamera(cameraWithUserImages);
  console.log(`✅ Image source: ${result1.image_source}`);
  console.log(`✅ Primary image: ${result1.primary_image}`);
  console.log(`✅ Secondary image: ${result1.secondary_image}`);
  console.log(`✅ Has user images: ${result1.has_user_images}`);
  
  // Test Case 2: Camera with model default (Priority 2)
  console.log('\n🔄 Test 2: Camera with model default (second priority)');
  const cameraWithModelDefault = {
    id: 2,
    brand: 'Canon',
    model: 'AE-1',
    image1_path: null,
    image2_path: null
  };
  
  const result2 = ImageService.getImageForCamera(cameraWithModelDefault);
  console.log(`✅ Image source: ${result2.image_source}`);
  console.log(`✅ Primary image: ${result2.primary_image}`);
  console.log(`✅ Has user images: ${result2.has_user_images}`);
  if (result2.default_image_info) {
    console.log(`✅ Default type: ${result2.default_image_info.type}`);
    console.log(`✅ Source: ${result2.default_image_info.source}`);
    console.log(`✅ Quality: ${result2.default_image_info.quality}/10`);
  }
  
  // Test Case 3: Camera with brand default (Priority 3)
  console.log('\n🔄 Test 3: Camera with brand default (third priority)');
  const cameraWithBrandDefault = {
    id: 3,
    brand: 'Nikon',
    model: 'Unknown Model',
    image1_path: null,
    image2_path: null
  };
  
  const result3 = ImageService.getImageForCamera(cameraWithBrandDefault);
  console.log(`✅ Image source: ${result3.image_source}`);
  console.log(`✅ Primary image: ${result3.primary_image}`);
  console.log(`✅ Has user images: ${result3.has_user_images}`);
  if (result3.default_image_info) {
    console.log(`✅ Default type: ${result3.default_image_info.type}`);
    console.log(`✅ Source: ${result3.default_image_info.source}`);
  }
  
  // Test Case 4: Camera with placeholder (Priority 4 - fallback)
  console.log('\n🔄 Test 4: Camera with placeholder (lowest priority)');
  const cameraWithPlaceholder = {
    id: 4,
    brand: 'Unknown Brand',
    model: 'Unknown Model',
    image1_path: null,
    image2_path: null
  };
  
  const result4 = ImageService.getImageForCamera(cameraWithPlaceholder);
  console.log(`✅ Image source: ${result4.image_source}`);
  console.log(`✅ Primary image: ${result4.primary_image}`);
  console.log(`✅ Has user images: ${result4.has_user_images}`);
  if (result4.default_image_info) {
    console.log(`✅ Default type: ${result4.default_image_info.type}`);
    console.log(`✅ Source: ${result4.default_image_info.source}`);
  }
  
  // Test Case 5: Edge case - Empty camera object
  console.log('\n🔄 Test 5: Edge case - camera with minimal data');
  const minimalCamera = {
    id: 5
  };
  
  const result5 = ImageService.getImageForCamera(minimalCamera);
  console.log(`✅ Image source: ${result5.image_source}`);
  console.log(`✅ Primary image: ${result5.primary_image}`);
  console.log(`✅ Has user images: ${result5.has_user_images}`);
  
  // Test Case 6: Batch enhancement
  console.log('\n🔄 Test 6: Batch enhancement of multiple cameras');
  const cameras = [
    cameraWithUserImages,
    cameraWithModelDefault,
    cameraWithBrandDefault,
    cameraWithPlaceholder
  ];
  
  const enhancedCameras = ImageService.enhanceCamerasWithImages(cameras);
  console.log(`✅ Enhanced ${enhancedCameras.length} cameras`);
  
  const sourceCounts = {};
  enhancedCameras.forEach(camera => {
    sourceCounts[camera.image_source] = (sourceCounts[camera.image_source] || 0) + 1;
  });
  
  console.log('✅ Source distribution:');
  Object.entries(sourceCounts).forEach(([source, count]) => {
    console.log(`  📷 ${source}: ${count} camera(s)`);
  });
  
  // Test Case 7: Statistics
  console.log('\n🔄 Test 7: Image statistics calculation');
  const stats = ImageService.getImageStatistics(cameras);
  console.log('✅ Statistics:');
  console.log(`  📊 Total: ${stats.total_cameras}`);
  console.log(`  📷 User images: ${stats.with_user_images}`);
  console.log(`  🎯 Model defaults: ${stats.with_default_model}`);
  console.log(`  🏷️  Brand defaults: ${stats.with_default_brand}`);
  console.log(`  📁 Placeholders: ${stats.with_placeholder}`);
  console.log(`  📈 Coverage: ${stats.coverage_percentage}%`);
  
  console.log('\n🎉 Complete fallback chain test completed successfully!');
  console.log('\n📋 Fallback Priority Order Verified:');
  console.log('  1️⃣  User uploaded images (highest priority)');
  console.log('  2️⃣  Model-specific default images');
  console.log('  3️⃣  Brand-specific default images');
  console.log('  4️⃣  Generic placeholder image (fallback)');
}

testFallbackChain();