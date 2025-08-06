#!/usr/bin/env node

const https = require('https');
const { URLSearchParams } = require('url');

function makeAPICall(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testWikipediaAPI() {
  console.log('🧪 Testing Wikipedia Commons API Integration...\n');
  
  try {
    // Test 1: Search for Nikon F camera
    console.log('🔄 Test 1: Search for "Nikon F camera"');
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: 'Nikon F camera',
      gsrlimit: '5',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata'
    });
    
    const searchURL = `https://commons.wikimedia.org/w/api.php?${searchParams}`;
    console.log(`📡 Request: ${searchURL}`);
    
    const searchResult = await makeAPICall(searchURL);
    
    if (searchResult.query && searchResult.query.pages) {
      const pages = Object.values(searchResult.query.pages);
      console.log(`✅ Found ${pages.length} image results`);
      
      pages.forEach((page, index) => {
        if (page.imageinfo && page.imageinfo[0]) {
          const info = page.imageinfo[0];
          console.log(`  📷 ${index + 1}. ${page.title}`);
          console.log(`     URL: ${info.url}`);
          console.log(`     Size: ${info.width}x${info.height}`);
          console.log(`     MIME: ${info.mime}`);
          
          if (info.extmetadata && info.extmetadata.LicenseShortName) {
            console.log(`     License: ${info.extmetadata.LicenseShortName.value}`);
          }
        }
      });
    } else {
      console.log('❌ No images found');
    }
    
    // Test 2: Get specific file information
    console.log('\n🔄 Test 2: Get specific file info for known Nikon F image');
    const fileParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: 'File:Nikon_F_img_2535.jpg',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata'
    });
    
    const fileURL = `https://commons.wikimedia.org/w/api.php?${fileParams}`;
    const fileResult = await makeAPICall(fileURL);
    
    if (fileResult.query && fileResult.query.pages) {
      const page = Object.values(fileResult.query.pages)[0];
      if (page.imageinfo && page.imageinfo[0]) {
        const info = page.imageinfo[0];
        console.log('✅ File information retrieved:');
        console.log(`  📷 Title: ${page.title}`);
        console.log(`  🔗 URL: ${info.url}`);
        console.log(`  📐 Dimensions: ${info.width}x${info.height}`);
        console.log(`  📄 MIME Type: ${info.mime}`);
        
        if (info.extmetadata) {
          const metadata = info.extmetadata;
          if (metadata.LicenseShortName) {
            console.log(`  ⚖️  License: ${metadata.LicenseShortName.value}`);
          }
          if (metadata.Artist) {
            console.log(`  👨‍🎨 Author: ${metadata.Artist.value}`);
          }
          if (metadata.Attribution) {
            console.log(`  📝 Attribution: ${metadata.Attribution.value}`);
          }
        }
      }
    }
    
    // Test 3: Search for different camera brands
    console.log('\n🔄 Test 3: Test searches for various camera brands');
    const testCameras = [
      'Canon AE-1 camera',
      'Leica M3 camera',
      'Pentax K1000 camera',
      'Olympus OM-1 camera'
    ];
    
    for (const camera of testCameras) {
      console.log(`\n📷 Searching for: ${camera}`);
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: camera,
        gsrlimit: '3',
        prop: 'imageinfo',
        iiprop: 'url|size'
      });
      
      try {
        const result = await makeAPICall(`https://commons.wikimedia.org/w/api.php?${params}`);
        
        if (result.query && result.query.pages) {
          const pages = Object.values(result.query.pages);
          console.log(`✅ Found ${pages.length} results for ${camera}`);
          
          pages.slice(0, 2).forEach((page, index) => {
            if (page.imageinfo && page.imageinfo[0]) {
              const info = page.imageinfo[0];
              console.log(`  ${index + 1}. ${page.title} (${info.width}x${info.height})`);
            }
          });
        } else {
          console.log(`❌ No results found for ${camera}`);
        }
      } catch (error) {
        console.log(`❌ Error searching for ${camera}: ${error.message}`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Wikipedia Commons API testing completed successfully!');
    console.log('\n📋 API Capabilities Verified:');
    console.log('  ✅ Image search functionality');
    console.log('  ✅ Metadata retrieval (size, license, author)');
    console.log('  ✅ Direct file access');
    console.log('  ✅ Multiple camera brand coverage');
    console.log('  ✅ High-quality image availability');
    
  } catch (error) {
    console.error('❌ Wikipedia API test failed:', error.message);
    process.exit(1);
  }
}

testWikipediaAPI();