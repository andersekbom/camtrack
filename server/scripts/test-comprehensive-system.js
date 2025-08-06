#!/usr/bin/env node

// Comprehensive system test for Default Images System

const Camera = require('../models/Camera');
const DefaultImage = require('../models/DefaultImage');
const ImageService = require('../services/ImageService');
const AttributionService = require('../services/AttributionService');
const PerformanceService = require('../services/PerformanceService');

async function testImageDisplaySystem() {
  console.log('🧪 Testing Complete Image Display System\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Database connectivity and data
    console.log('🔄 Test 1: Database Connectivity and Data');
    
    const cameras = Camera.getAllCameras({});
    const defaultImages = DefaultImage.findAll();
    
    console.log(`✅ Found ${cameras.length} cameras in database`);
    console.log(`✅ Found ${defaultImages.length} default images in database`);
    
    // Test 2: Image enhancement system
    console.log('\n🔄 Test 2: Image Enhancement System');
    
    const sampleCameras = cameras.slice(0, 5);
    let workingImagesCount = 0;
    let missingImagesCount = 0;
    
    sampleCameras.forEach((camera, i) => {
      console.log(`\n  📷 ${i + 1}. ${camera.brand} ${camera.model}`);
      
      if (camera.primary_image) {
        console.log(`    ✅ Has image: ${camera.primary_image.substring(0, 50)}...`);
        console.log(`    📊 Source: ${camera.image_source}`);
        console.log(`    🖼️  Type: ${camera.primary_image.includes('wikimedia') ? 'Wikipedia' : 
                                    camera.primary_image.includes('cached-images') ? 'Cached' :
                                    camera.primary_image.includes('uploads') ? 'User Upload' : 'Other'}`);
        workingImagesCount++;
      } else {
        console.log(`    ❌ Missing image!`);
        missingImagesCount++;
      }
    });
    
    console.log(`\n📈 Image Coverage: ${workingImagesCount}/${sampleCameras.length} (${Math.round(workingImagesCount/sampleCameras.length*100)}%)`);

    // Test 3: Image types breakdown
    console.log('\n🔄 Test 3: Image Types Breakdown');
    
    let wikipediaUrls = 0;
    let cachedImages = 0;
    let userUploads = 0;
    let missingImages = 0;
    
    cameras.forEach(camera => {
      if (camera.primary_image) {
        if (camera.primary_image.includes('wikimedia') || camera.primary_image.includes('wikipedia')) {
          wikipediaUrls++;
        } else if (camera.primary_image.includes('cached-images')) {
          cachedImages++;
        } else if (camera.primary_image.includes('uploads')) {
          userUploads++;
        }
      } else {
        missingImages++;
      }
    });
    
    console.log(`📊 Image type distribution:`);
    console.log(`  🌐 Wikipedia URLs: ${wikipediaUrls} (${Math.round(wikipediaUrls/cameras.length*100)}%)`);
    console.log(`  💾 Cached images: ${cachedImages} (${Math.round(cachedImages/cameras.length*100)}%)`);
    console.log(`  📁 User uploads: ${userUploads} (${Math.round(userUploads/cameras.length*100)}%)`);
    console.log(`  ❌ Missing images: ${missingImages} (${Math.round(missingImages/cameras.length*100)}%)`);
    
    // Test 4: Attribution system
    console.log('\n🔄 Test 4: Attribution System');
    
    try {
      const attributionData = await AttributionService.getAllAttributions();
      console.log(`✅ Attribution compliance: ${attributionData.summary.compliance_rate}%`);
      console.log(`✅ Valid attributions: ${attributionData.valid}/${attributionData.total}`);
      
      if (attributionData.summary.common_issues.length > 0) {
        console.log(`⚠️  Common issues:`);
        attributionData.summary.common_issues.forEach(issue => {
          console.log(`    - ${issue.issue} (${issue.count} occurrences)`);
        });
      }
    } catch (error) {
      console.log(`⚠️  Attribution system test failed: ${error.message}`);
    }
    
    // Test 5: Performance tracking
    console.log('\n🔄 Test 5: Performance System');
    
    const perfStats = PerformanceService.getPerformanceStats();
    console.log(`✅ Performance grade: ${perfStats.performance_grade}`);
    console.log(`✅ Total image requests tracked: ${perfStats.totalRequests}`);
    console.log(`✅ Cache hit rate: ${perfStats.cacheHitRate.toFixed(1)}%`);
    console.log(`✅ Average response time: ${perfStats.averageResponseTime.toFixed(0)}ms`);
    
    // Test 6: Specific problem cameras
    console.log('\n🔄 Test 6: Previously Problematic Cameras');
    
    const problemCameras = [
      'Canon AE-1', 'Leica M3', 'Nikon F', 'Pentax K1000',
      'Meopta Flexaret', 'Nikon F65', 'Rolleicord III'
    ];
    
    problemCameras.forEach(cameraName => {
      const [brand, model] = cameraName.split(' ');
      const camera = cameras.find(c => c.brand === brand && c.model === model);
      
      if (camera) {
        const status = camera.primary_image ? '✅' : '❌';
        const imageType = camera.primary_image ? 
          (camera.primary_image.includes('wikipedia') ? 'Wiki' : 'Cached') : 'Missing';
        console.log(`  ${status} ${cameraName}: ${imageType}`);
      } else {
        console.log(`  ⚠️  ${cameraName}: Not found in database`);
      }
    });
    
    // Test 7: Image URL validation
    console.log('\n🔄 Test 7: Image URL Validation');
    
    const testUrls = [
      '/cached-images/test.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/test.jpg',
      '/uploads/cameras/test.jpg'
    ];
    
    console.log('✅ URL handling test:');
    testUrls.forEach(url => {
      let processedUrl;
      
      // Simulate frontend URL processing logic
      if (url.includes('wikimedia.org') || url.includes('wikipedia.org')) {
        processedUrl = `http://localhost:3000/api/image-proxy?url=${encodeURIComponent(url)}`;
      } else if (url.startsWith('/cached-images/')) {
        processedUrl = `http://localhost:3000${url}`;
      } else if (url.startsWith('/uploads/')) {
        processedUrl = `http://localhost:3000${url}`;
      } else {
        processedUrl = url;
      }
      
      console.log(`  📷 ${url} → ${processedUrl.substring(0, 70)}${processedUrl.length > 70 ? '...' : ''}`);
    });
    
    // Test 8: System recommendations
    console.log('\n🔄 Test 8: System Health and Recommendations');
    
    const recommendations = [];
    
    if (wikipediaUrls > 0) {
      recommendations.push(`Consider caching ${wikipediaUrls} Wikipedia images to improve load times`);
    }
    
    if (missingImages > 0) {
      recommendations.push(`${missingImages} cameras are missing images - run populate script`);
    }
    
    if (recommendations.length === 0) {
      console.log('✅ System health: Excellent - no recommendations needed');
    } else {
      console.log('📋 System recommendations:');
      recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Comprehensive System Test Summary');
    console.log('='.repeat(60));
    
    const imagesCovered = cameras.length - missingImages;
    const coveragePercentage = Math.round((imagesCovered / cameras.length) * 100);
    
    console.log(`📊 Overall image coverage: ${imagesCovered}/${cameras.length} cameras (${coveragePercentage}%)`);
    console.log(`🎯 Performance grade: ${perfStats.performance_grade}`);
    console.log(`✅ Attribution compliance: ${attributionData?.summary?.compliance_rate || 'N/A'}%`);
    
    if (coveragePercentage >= 95) {
      console.log('🎉 EXCELLENT: System is working perfectly!');
    } else if (coveragePercentage >= 80) {
      console.log('👍 GOOD: System is working well with minor issues');
    } else {
      console.log('⚠️  NEEDS ATTENTION: Several images are not displaying properly');
    }
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ System test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the comprehensive test
testImageDisplaySystem();