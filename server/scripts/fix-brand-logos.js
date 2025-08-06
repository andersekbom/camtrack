#!/usr/bin/env node

/**
 * Fix Brand Logos Migration
 * 
 * This script fixes the broken Wikipedia brand logo URLs by:
 * 1. Creating local SVG brand logo files
 * 2. Updating the brand_default_images table to use local paths
 * 
 * Run this script after database initialization to ensure brand logos work properly.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// Brand logo SVG templates
const brandLogos = {
  'Nikon': {
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" rx="4" fill="#1a1a1a"/>
  <text x="60" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">
    NIKON
  </text>
</svg>`,
    attribution: 'Nikon Corporation logo - Local placeholder'
  },
  'Canon': {
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" rx="4" fill="#c41e3a"/>
  <text x="60" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">
    Canon
  </text>
</svg>`,
    attribution: 'Canon Inc. logo - Local placeholder'
  },
  'Leica': {
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" rx="4" fill="#d70027"/>
  <circle cx="25" cy="20" r="8" fill="#ffffff"/>
  <text x="70" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">
    LEICA
  </text>
</svg>`,
    attribution: 'Leica Camera AG logo - Local placeholder'
  }
};

function createBrandLogos() {
  console.log('🎨 Creating brand logo files...');
  
  // Ensure uploads/placeholders directory exists
  const placeholdersDir = path.join(__dirname, '../../uploads/placeholders');
  if (!fs.existsSync(placeholdersDir)) {
    fs.mkdirSync(placeholdersDir, { recursive: true });
    console.log('📁 Created placeholders directory');
  }
  
  let created = 0;
  
  Object.entries(brandLogos).forEach(([brand, data]) => {
    const filename = `${brand.toLowerCase()}-logo.svg`;
    const filepath = path.join(placeholdersDir, filename);
    
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, data.svg);
      console.log(`✅ Created ${filename}`);
      created++;
    } else {
      console.log(`⏭️  ${filename} already exists`);
    }
  });
  
  return created;
}

function updateBrandDatabase() {
  console.log('🗃️  Updating brand_default_images database...');
  
  const stmt = db.prepare('UPDATE brand_default_images SET image_url = ?, source_attribution = ? WHERE brand = ?');
  let updated = 0;
  
  Object.entries(brandLogos).forEach(([brand, data]) => {
    const logoPath = `/uploads/placeholders/${brand.toLowerCase()}-logo.svg`;
    
    try {
      const result = stmt.run(logoPath, data.attribution, brand);
      if (result.changes > 0) {
        console.log(`✅ Updated ${brand} brand logo`);
        updated++;
      } else {
        // Brand might not exist, try to create it
        const insertStmt = db.prepare(`
          INSERT OR IGNORE INTO brand_default_images 
          (brand, image_url, source, source_attribution, is_active)
          VALUES (?, ?, ?, ?, ?)
        `);
        const insertResult = insertStmt.run(brand, logoPath, 'Local', data.attribution, 1);
        if (insertResult.changes > 0) {
          console.log(`🆕 Created ${brand} brand logo entry`);
          updated++;
        }
      }
    } catch (error) {
      console.error(`❌ Error updating ${brand}:`, error.message);
    }
  });
  
  return updated;
}

function verifyBrandLogos() {
  console.log('🔍 Verifying brand logo setup...');
  
  const brands = db.prepare('SELECT * FROM brand_default_images WHERE brand IN (?, ?, ?)').all('Nikon', 'Canon', 'Leica');
  
  brands.forEach(brand => {
    const logoPath = path.join(__dirname, '../../', brand.image_url);
    const exists = fs.existsSync(logoPath);
    console.log(`${exists ? '✅' : '❌'} ${brand.brand}: ${brand.image_url} ${exists ? 'exists' : 'missing'}`);
  });
  
  return brands.length;
}

function main() {
  console.log('🚀 Starting brand logo fix migration...\n');
  
  try {
    const filesCreated = createBrandLogos();
    const dbUpdated = updateBrandDatabase();
    const verified = verifyBrandLogos();
    
    console.log('\n📊 Migration Summary:');
    console.log(`📁 Logo files created: ${filesCreated}`);
    console.log(`🗃️  Database entries updated: ${dbUpdated}`);
    console.log(`🔍 Brand logos verified: ${verified}`);
    
    if (filesCreated > 0 || dbUpdated > 0) {
      console.log('\n✅ Brand logo fix migration completed successfully!');
      console.log('🎯 Cameras without model-specific images will now display brand logos.');
    } else {
      console.log('\n💡 No changes needed - brand logos already configured.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

module.exports = { createBrandLogos, updateBrandDatabase, verifyBrandLogos };