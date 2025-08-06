const DefaultImage = require('../models/DefaultImage');

class AttributionService {
  /**
   * Generate standardized attribution text for different image sources
   */
  static generateAttribution(imageData) {
    if (!imageData) return null;

    switch (imageData.source) {
      case 'Wikipedia Commons':
        return this.generateWikipediaAttribution(imageData);
      case 'Manual':
        return this.generateManualAttribution(imageData);
      case 'User Upload':
        return 'User uploaded image';
      case 'System':
        return 'System placeholder image';
      default:
        return imageData.source_attribution || `Image from ${imageData.source}`;
    }
  }

  /**
   * Generate Wikipedia Commons attribution following their guidelines
   */
  static generateWikipediaAttribution(imageData) {
    const parts = [];
    
    // Author information
    if (imageData.author) {
      const cleanAuthor = this.cleanAuthorName(imageData.author);
      parts.push(`Author: ${cleanAuthor}`);
    }

    // License information
    if (imageData.license) {
      parts.push(`License: ${imageData.license}`);
    }

    // Source
    parts.push('Source: Wikimedia Commons');

    // Quality indicator if available
    if (imageData.image_quality && imageData.image_quality >= 8) {
      parts.push('(High Quality)');
    }

    return parts.join(', ');
  }

  /**
   * Generate attribution for manually added images
   */
  static generateManualAttribution(imageData) {
    if (imageData.source_attribution) {
      return imageData.source_attribution;
    }
    return 'Manually curated reference image';
  }

  /**
   * Clean author names (remove HTML, links, etc.)
   */
  static cleanAuthorName(author) {
    if (!author) return 'Unknown';
    
    // Remove HTML tags
    let cleaned = author.replace(/<[^>]*>/g, '');
    
    // Remove wiki markup
    cleaned = cleaned.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1');
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return cleaned || 'Unknown';
  }

  /**
   * Generate detailed attribution with links for display
   */
  static generateDetailedAttribution(imageData) {
    if (!imageData) return null;

    const result = {
      text: this.generateAttribution(imageData),
      author: imageData.author ? this.cleanAuthorName(imageData.author) : null,
      license: imageData.license || null,
      source: imageData.source || 'Unknown',
      source_url: null,
      quality: imageData.image_quality || null,
      usage_notes: null
    };

    // Add source-specific information
    switch (imageData.source) {
      case 'Wikipedia Commons':
        result.source_url = 'https://commons.wikimedia.org/';
        result.usage_notes = 'Image used under fair use/Creative Commons license from Wikimedia Commons';
        break;
      case 'Manual':
        result.usage_notes = 'Manually curated reference image for camera identification';
        break;
    }

    return result;
  }

  /**
   * Validate attribution completeness
   */
  static validateAttribution(imageData) {
    const issues = [];

    if (!imageData) {
      issues.push('No image data provided');
      return { valid: false, issues };
    }

    if (!imageData.source) {
      issues.push('Missing source information');
    }

    if (imageData.source === 'Wikipedia Commons') {
      if (!imageData.author && !imageData.source_attribution) {
        issues.push('Missing author information for Wikipedia Commons image');
      }
      if (!imageData.license && !imageData.source_attribution) {
        issues.push('Missing license information for Wikipedia Commons image');
      }
    }

    if (imageData.source === 'Manual' && !imageData.source_attribution) {
      issues.push('Manual images should include attribution information');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get attribution for all default images with validation
   */
  static async getAllAttributions() {
    try {
      const images = DefaultImage.findAll();
      
      const attributions = images.map(image => ({
        id: image.id,
        brand: image.brand,
        model: image.model,
        attribution: this.generateDetailedAttribution(image),
        validation: this.validateAttribution(image),
        created_at: image.created_at
      }));

      // Separate valid and invalid attributions
      const valid = attributions.filter(attr => attr.validation.valid);
      const invalid = attributions.filter(attr => !attr.validation.valid);

      return {
        total: attributions.length,
        valid: valid.length,
        invalid: invalid.length,
        attributions,
        summary: {
          compliance_rate: attributions.length > 0 ? Math.round((valid.length / attributions.length) * 100) : 0,
          missing_attribution: invalid.length,
          common_issues: this.analyzeCommonIssues(invalid)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get attributions: ${error.message}`);
    }
  }

  /**
   * Analyze common attribution issues
   */
  static analyzeCommonIssues(invalidAttributions) {
    const issueCount = {};
    
    invalidAttributions.forEach(attr => {
      attr.validation.issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Update attribution for a specific image
   */
  static async updateAttribution(imageId, attributionData) {
    try {
      const image = DefaultImage.findById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Update attribution fields
      const updates = {};
      if (attributionData.source_attribution) {
        updates.source_attribution = attributionData.source_attribution;
      }
      if (attributionData.author) {
        updates.author = attributionData.author;
      }
      if (attributionData.license) {
        updates.license = attributionData.license;
      }

      const updatedImage = DefaultImage.update(imageId, updates);
      
      return {
        success: true,
        image: updatedImage,
        attribution: this.generateDetailedAttribution(updatedImage),
        validation: this.validateAttribution(updatedImage)
      };
    } catch (error) {
      throw new Error(`Failed to update attribution: ${error.message}`);
    }
  }

  /**
   * Generate attribution report for compliance
   */
  static async generateAttributionReport() {
    try {
      const data = await this.getAllAttributions();
      const report = {
        generated_at: new Date().toISOString(),
        summary: data.summary,
        total_images: data.total,
        compliance: {
          compliant: data.valid,
          non_compliant: data.invalid,
          rate: data.summary.compliance_rate
        },
        source_breakdown: this.getSourceBreakdown(data.attributions),
        issues: data.summary.common_issues,
        recommendations: this.generateRecommendations(data)
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate attribution report: ${error.message}`);
    }
  }

  /**
   * Get breakdown by image source
   */
  static getSourceBreakdown(attributions) {
    const breakdown = {};
    
    attributions.forEach(attr => {
      const source = attr.attribution?.source || 'Unknown';
      if (!breakdown[source]) {
        breakdown[source] = {
          total: 0,
          compliant: 0,
          non_compliant: 0
        };
      }
      
      breakdown[source].total++;
      if (attr.validation.valid) {
        breakdown[source].compliant++;
      } else {
        breakdown[source].non_compliant++;
      }
    });

    // Calculate compliance rates
    Object.keys(breakdown).forEach(source => {
      const data = breakdown[source];
      data.compliance_rate = data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0;
    });

    return breakdown;
  }

  /**
   * Generate recommendations for improving attribution compliance
   */
  static generateRecommendations(data) {
    const recommendations = [];
    
    if (data.summary.compliance_rate < 80) {
      recommendations.push({
        priority: 'high',
        issue: 'Low compliance rate',
        suggestion: 'Review and update attribution information for non-compliant images'
      });
    }

    if (data.summary.missing_attribution > 5) {
      recommendations.push({
        priority: 'medium',
        issue: 'Multiple images missing attribution',
        suggestion: 'Implement automated attribution extraction during image import'
      });
    }

    // Source-specific recommendations
    const wikimediaCount = data.attributions.filter(attr => 
      attr.attribution?.source === 'Wikipedia Commons'
    ).length;
    
    if (wikimediaCount > 10) {
      recommendations.push({
        priority: 'medium',
        issue: 'Heavy reliance on Wikipedia Commons',
        suggestion: 'Consider diversifying image sources to reduce licensing dependencies'
      });
    }

    return recommendations;
  }

  /**
   * Export attribution data for compliance documentation
   */
  static async exportAttributionData(format = 'json') {
    try {
      const data = await this.getAllAttributions();
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportAsCSV(data.attributions);
        case 'json':
        default:
          return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      throw new Error(`Failed to export attribution data: ${error.message}`);
    }
  }

  /**
   * Export attributions as CSV
   */
  static exportAsCSV(attributions) {
    const headers = [
      'ID', 'Brand', 'Model', 'Source', 'Author', 'License', 
      'Attribution Text', 'Valid', 'Issues', 'Created Date'
    ];

    const rows = attributions.map(attr => [
      attr.id,
      attr.brand,
      attr.model,
      attr.attribution?.source || '',
      attr.attribution?.author || '',
      attr.attribution?.license || '',
      attr.attribution?.text || '',
      attr.validation.valid ? 'Yes' : 'No',
      attr.validation.issues.join('; '),
      new Date(attr.created_at).toISOString().split('T')[0]
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

module.exports = AttributionService;