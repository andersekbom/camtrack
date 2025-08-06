#!/usr/bin/env node

const DefaultImage = require('../models/DefaultImage');
const ImageCacheService = require('../services/ImageCacheService');
const WikipediaImageService = require('../services/WikipediaImageService');

async function fixUncachedImages() {
  console.log('🔧 Fixing uncached Wikipedia image URLs...\n');

  try {
    // Find all images with direct Wikipedia URLs
    const images = DefaultImage.findAll();
    const uncachedImages = images.filter(img => 
      img.image_url && img.image_url.startsWith('https://upload.wikimedia.org/')
    );

    console.log(`📋 Found ${uncachedImages.length} images with direct Wikipedia URLs`);

    if (uncachedImages.length === 0) {
      console.log('✅ No images need fixing!');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const image of uncachedImages) {
      console.log(`\n🔄 Processing: ${image.brand} ${image.model}`);
      console.log(`   Original URL: ${image.image_url}`);

      try {
        // Try to cache the image with proper headers
        const cacheResult = await ImageCacheService.getCachedImage(image.image_url);
        
        if (cacheResult && cacheResult.url) {
          // Update the database with the cached URL
          const updated = DefaultImage.update(image.id, {
            image_url: cacheResult.url
          });

          console.log(`✅ Successfully cached and updated: ${updated.image_url}`);
          successCount++;
        } else {
          throw new Error('Caching failed - no result returned');
        }
      } catch (cacheError) {
        console.log(`⚠️  Caching failed: ${cacheError.message}`);
        
        // Try to find a new image from Wikipedia
        console.log('🔍 Searching for alternative image...');
        
        try {
          const newImageData = await WikipediaImageService.findBestImageForCamera(
            image.brand, 
            image.model, 
            true // Enable caching
          );

          if (newImageData && newImageData.image_url) {
            const updated = DefaultImage.update(image.id, {
              image_url: newImageData.image_url,
              source_attribution: newImageData.source_attribution,
              image_quality: newImageData.image_quality
            });

            console.log(`✅ Found and cached new image: ${updated.image_url}`);
            successCount++;
          } else {
            throw new Error('No alternative image found');
          }
        } catch (searchError) {
          console.log(`❌ Failed to find alternative: ${searchError.message}`);
          
          // As last resort, use placeholder
          const updated = DefaultImage.update(image.id, {
            image_url: '/uploads/placeholders/camera-placeholder.jpg',
            source: 'System',
            source_attribution: 'Generic camera placeholder'
          });

          console.log(`🔄 Using placeholder image`);
          failureCount++;
        }
      }

      // Add delay to be respectful to Wikipedia
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Fix Uncached Images Report');
    console.log('='.repeat(60));
    console.log(`📊 Total images processed: ${uncachedImages.length}`);
    console.log(`✅ Successfully fixed: ${successCount}`);
    console.log(`❌ Failed to fix: ${failureCount}`);
    console.log(`📈 Success rate: ${Math.round((successCount / uncachedImages.length) * 100)}%`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Images fixed! Restart your frontend to see the changes.');
    }

  } catch (error) {
    console.error('❌ Error fixing uncached images:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run if called directly
if (require.main === module) {
  fixUncachedImages();
}

module.exports = fixUncachedImages;