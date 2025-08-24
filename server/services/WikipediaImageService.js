const https = require('https');
const { URLSearchParams } = require('url');
const ImageDownloadService = require('./ImageDownloadService');

class WikipediaImageService {
  static BASE_URL = 'https://commons.wikimedia.org/w/api.php';
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 1000; // 1 second

  /**
   * Make an API call to Wikipedia Commons
   */
  static async makeAPICall(params) {
    const url = `${this.BASE_URL}?${params.toString()}`;
    
    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': 'CamTracker-Deluxe/1.0 (https://github.com/user/camtrack; contact@example.com)'
      }
    };
    
    return new Promise((resolve, reject) => {
      const request = https.get(url, options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              reject(new Error(`Wikipedia API Error: ${parsed.error.info}`));
              return;
            }
            
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${error.message}`));
          }
        });
      });
      
      request.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('API request timeout'));
      });
    });
  }

  /**
   * Search for camera images on Wikipedia Commons
   */
  static async searchCameraImages(brand, model, limit = 10) {
    const searchTerms = [
      `${brand} ${model} camera`,
      `${brand} ${model}`,
      `${brand} camera ${model}`
    ];

    for (const searchTerm of searchTerms) {
      try {
        const results = await this.performSearch(searchTerm, limit);
        if (results.length > 0) {
          // Sort by quality and relevance
          const sortedResults = this.rankSearchResults(results, brand, model);
          return sortedResults;
        }
      } catch (error) {
        console.warn(`Search failed for term "${searchTerm}":`, error.message);
        continue;
      }
    }

    return [];
  }

  /**
   * Perform a search query
   */
  static async performSearch(searchTerm, limit = 10) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: searchTerm,
      gsrlimit: limit.toString(),
      gsrnamespace: '6', // File namespace only
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata'
    });

    const response = await this.makeAPICall(params);
    
    if (!response.query || !response.query.pages) {
      return [];
    }

    const pages = Object.values(response.query.pages);
    const results = [];

    for (const page of pages) {
      if (page.imageinfo && page.imageinfo[0]) {
        const imageInfo = page.imageinfo[0];
        
        // Filter for image files only
        if (!imageInfo.mime || !imageInfo.mime.startsWith('image/')) {
          continue;
        }

        // Extract metadata
        const result = {
          title: page.title,
          filename: page.title.replace('File:', ''),
          url: imageInfo.url,
          width: imageInfo.width,
          height: imageInfo.height,
          mime: imageInfo.mime,
          size: imageInfo.size,
          quality: this.calculateImageQuality(imageInfo),
          license: null,
          author: null,
          attribution: null,
          source: 'Wikipedia Commons'
        };

        // Extract licensing information
        if (imageInfo.extmetadata) {
          const meta = imageInfo.extmetadata;
          
          if (meta.LicenseShortName) {
            result.license = meta.LicenseShortName.value;
          }
          
          if (meta.Artist) {
            result.author = this.cleanMetadataValue(meta.Artist.value);
          }
          
          if (meta.Attribution) {
            result.attribution = this.cleanMetadataValue(meta.Attribution.value);
          } else if (meta.LicenseUrl && meta.Artist) {
            // Generate attribution if not provided
            result.attribution = `By ${result.author}, ${result.license}`;
          }
        }

        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get detailed information about a specific file
   */
  static async getFileInfo(filename) {
    const title = filename.startsWith('File:') ? filename : `File:${filename}`;
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: title,
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata'
    });

    const response = await this.makeAPICall(params);
    
    if (!response.query || !response.query.pages) {
      return null;
    }

    const page = Object.values(response.query.pages)[0];
    
    if (!page.imageinfo || !page.imageinfo[0]) {
      return null;
    }

    const imageInfo = page.imageinfo[0];
    
    return {
      title: page.title,
      filename: page.title.replace('File:', ''),
      url: imageInfo.url,
      width: imageInfo.width,
      height: imageInfo.height,
      mime: imageInfo.mime,
      quality: this.calculateImageQuality(imageInfo),
      license: imageInfo.extmetadata?.LicenseShortName?.value || null,
      author: imageInfo.extmetadata?.Artist?.value || null,
      attribution: imageInfo.extmetadata?.Attribution?.value || null,
      source: 'Wikipedia Commons'
    };
  }

  /**
   * Calculate image quality score (1-10)
   */
  static calculateImageQuality(imageInfo) {
    let score = 5; // Base score

    // Size scoring
    const minDimension = Math.min(imageInfo.width, imageInfo.height);
    if (minDimension >= 800) score += 2;
    else if (minDimension >= 400) score += 1;
    else if (minDimension < 300) score -= 2;

    // Aspect ratio scoring (cameras typically 1:1 to 3:2)
    const aspectRatio = imageInfo.width / imageInfo.height;
    if (aspectRatio >= 0.75 && aspectRatio <= 2.0) {
      score += 1;
    } else {
      score -= 1;
    }

    // File size considerations (too small likely low quality)
    if (imageInfo.size && imageInfo.size < 50000) { // Less than 50KB
      score -= 1;
    }

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Rank search results by relevance and quality
   */
  static rankSearchResults(results, brand, model) {
    return results.map(result => {
      let relevanceScore = 0;
      const titleLower = result.title.toLowerCase();
      const brandLower = brand.toLowerCase();
      const modelLower = model.toLowerCase();

      // Exact model match gets highest score
      if (titleLower.includes(modelLower)) {
        relevanceScore += 10;
      }

      // Brand match
      if (titleLower.includes(brandLower)) {
        relevanceScore += 5;
      }

      // Camera-related keywords
      if (titleLower.includes('camera')) {
        relevanceScore += 2;
      }

      // Prefer certain file patterns
      if (titleLower.includes('img') || titleLower.includes('photo')) {
        relevanceScore += 1;
      }

      // Avoid certain patterns
      if (titleLower.includes('logo') || titleLower.includes('diagram') || titleLower.includes('manual')) {
        relevanceScore -= 3;
      }

      return {
        ...result,
        relevanceScore,
        combinedScore: relevanceScore + result.quality
      };
    }).sort((a, b) => b.combinedScore - a.combinedScore);
  }

  /**
   * Clean metadata values (remove HTML tags, etc.)
   */
  static cleanMetadataValue(value) {
    if (!value) return null;
    
    // Remove HTML tags
    const cleaned = value.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    return cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Find best image for a camera with local download support
   */
  static async findBestImageForCamera(brand, model, enableDownload = true) {
    try {
      const results = await this.searchCameraImages(brand, model, 5);
      
      if (results.length === 0) {
        return null;
      }

      // Return the best result
      const bestResult = results[0];
      
      // Validate minimum quality requirements
      if (bestResult.quality < 3 || bestResult.width < 200 || bestResult.height < 200) {
        return null;
      }

      let finalImageUrl = bestResult.url;
      let downloadInfo = null;

      // Download and process the image locally if enabled
      if (enableDownload) {
        try {
          const imageDownloadService = new ImageDownloadService();
          downloadInfo = await imageDownloadService.downloadAndProcessImage(bestResult.url);
          finalImageUrl = downloadInfo.localPath; // Use local path
          
          console.log(`✅ Downloaded and processed image for ${brand} ${model}: ${downloadInfo.localPath}`);
        } catch (downloadError) {
          console.warn(`Failed to download image for ${brand} ${model}:`, downloadError.message);
          // Continue with original URL if download fails
        }
      }

      return {
        image_url: finalImageUrl,
        original_url: bestResult.url,
        source: bestResult.source,
        source_attribution: bestResult.attribution || `${bestResult.author || 'Unknown'}, ${bestResult.license || 'Wikipedia Commons'}`,
        image_quality: bestResult.quality,
        width: downloadInfo ? downloadInfo.dimensions.width : bestResult.width,
        height: downloadInfo ? downloadInfo.dimensions.height : bestResult.height,
        license: bestResult.license,
        author: bestResult.author,
        downloaded: downloadInfo ? true : false,
        download_info: downloadInfo
      };
    } catch (error) {
      console.error(`Failed to find image for ${brand} ${model}:`, error.message);
      return null;
    }
  }

  /**
   * Validate image URL is accessible
   */
  static async validateImageUrl(url) {
    return new Promise((resolve) => {
      const request = https.get(url, { timeout: 5000 }, (response) => {
        const isValid = response.statusCode === 200 && 
                       response.headers['content-type'] && 
                       response.headers['content-type'].startsWith('image/');
        resolve(isValid);
        request.destroy();
      });
      
      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Get search suggestions for partial matches
   */
  static async getSearchSuggestions(brand, partialModel = '') {
    const searchTerm = partialModel 
      ? `${brand} ${partialModel} camera`
      : `${brand} camera`;

    try {
      const results = await this.performSearch(searchTerm, 20);
      
      // Extract model names from results
      const suggestions = results
        .filter(result => result.quality >= 4)
        .map(result => {
          const title = result.title.toLowerCase();
          // Try to extract model name patterns
          const matches = title.match(new RegExp(`${brand.toLowerCase()}\\s+([\\w\\d-]+)`, 'i'));
          return matches ? matches[1] : null;
        })
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .slice(0, 10);

      return suggestions;
    } catch (error) {
      console.error(`Failed to get suggestions for ${brand}:`, error.message);
      return [];
    }
  }
}

module.exports = WikipediaImageService;