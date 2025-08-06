const Camera = require('../models/Camera');

class SummaryController {
  // Get collection summary statistics
  static async getSummary(req, res) {
    try {
      // Get all cameras
      const cameras = Camera.getAllCameras();
      
      if (!cameras || cameras.length === 0) {
        return res.json({
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
          leastExpensive: null
        });
      }

      // Basic statistics
      const totalCameras = cameras.length;
      const validPrices = cameras.filter(c => c.weighted_price && c.weighted_price > 0);
      const totalValue = validPrices.reduce((sum, camera) => sum + camera.weighted_price, 0);
      const averageValue = validPrices.length > 0 ? totalValue / validPrices.length : 0;

      // Condition statistics
      const mechanicalRatings = cameras.filter(c => c.mechanical_status);
      const cosmeticRatings = cameras.filter(c => c.cosmetic_status);
      
      const averageMechanicalCondition = mechanicalRatings.length > 0 
        ? mechanicalRatings.reduce((sum, c) => sum + c.mechanical_status, 0) / mechanicalRatings.length 
        : 0;
      
      const averageCosmeticCondition = cosmeticRatings.length > 0
        ? cosmeticRatings.reduce((sum, c) => sum + c.cosmetic_status, 0) / cosmeticRatings.length
        : 0;

      // Brand breakdown
      const brandCounts = {};
      const brandValues = {};
      
      cameras.forEach(camera => {
        const brand = camera.brand;
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        if (camera.weighted_price && camera.weighted_price > 0) {
          brandValues[brand] = (brandValues[brand] || 0) + camera.weighted_price;
        }
      });

      const brandBreakdown = Object.keys(brandCounts)
        .map(brand => ({
          brand,
          count: brandCounts[brand],
          totalValue: brandValues[brand] || 0,
          averageValue: brandValues[brand] ? brandValues[brand] / brandCounts[brand] : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Condition breakdown
      const mechanicalBreakdown = {};
      const cosmeticBreakdown = {};
      
      cameras.forEach(camera => {
        if (camera.mechanical_status) {
          mechanicalBreakdown[camera.mechanical_status] = (mechanicalBreakdown[camera.mechanical_status] || 0) + 1;
        }
        if (camera.cosmetic_status) {
          cosmeticBreakdown[camera.cosmetic_status] = (cosmeticBreakdown[camera.cosmetic_status] || 0) + 1;
        }
      });

      // Price range breakdown
      const priceRanges = {
        under100: 0,
        range100to300: 0,
        range300to500: 0,
        range500to1000: 0,
        over1000: 0
      };

      validPrices.forEach(camera => {
        const price = camera.weighted_price;
        if (price < 100) {
          priceRanges.under100++;
        } else if (price < 300) {
          priceRanges.range100to300++;
        } else if (price < 500) {
          priceRanges.range300to500++;
        } else if (price < 1000) {
          priceRanges.range500to1000++;
        } else {
          priceRanges.over1000++;
        }
      });

      // Most and least expensive cameras
      let mostExpensive = null;
      let leastExpensive = null;
      
      if (validPrices.length > 0) {
        mostExpensive = validPrices.reduce((max, camera) => 
          camera.weighted_price > max.weighted_price ? camera : max
        );
        
        leastExpensive = validPrices.reduce((min, camera) => 
          camera.weighted_price < min.weighted_price ? camera : min
        );
      }

      // Recent additions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCameras = cameras.filter(camera => {
        const createdDate = new Date(camera.created_at);
        return createdDate >= thirtyDaysAgo;
      });

      const summary = {
        totalCameras,
        totalValue: Math.round(totalValue * 100) / 100,
        averageValue: Math.round(averageValue * 100) / 100,
        averageMechanicalCondition: Math.round(averageMechanicalCondition * 100) / 100,
        averageCosmeticCondition: Math.round(averageCosmeticCondition * 100) / 100,
        brandBreakdown: brandBreakdown.slice(0, 10), // Top 10 brands
        conditionBreakdown: {
          mechanical: mechanicalBreakdown,
          cosmetic: cosmeticBreakdown
        },
        priceRanges,
        mostExpensive: mostExpensive ? {
          id: mostExpensive.id,
          brand: mostExpensive.brand,
          model: mostExpensive.model,
          price: mostExpensive.weighted_price
        } : null,
        leastExpensive: leastExpensive ? {
          id: leastExpensive.id,
          brand: leastExpensive.brand,
          model: leastExpensive.model,
          price: leastExpensive.weighted_price
        } : null,
        recentAdditions: recentCameras.length,
        camerasWithImages: cameras.filter(c => c.image1_path || c.image2_path).length
      };

      res.json(summary);

    } catch (error) {
      console.error('Summary error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SummaryController;