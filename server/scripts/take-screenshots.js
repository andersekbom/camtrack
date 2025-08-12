#!/usr/bin/env node

/**
 * CamTracker Deluxe Screenshot Generator
 * 
 * This script uses Puppeteer to take screenshots of the CamTracker Deluxe application
 * for documentation and presentation purposes.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function takeScreenshots() {
  console.log('🚀 Starting CamTracker Deluxe screenshot generation...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser in action
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📱 Navigating to CamTracker Deluxe application...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Wait for the application to load
    console.log('⏳ Waiting for application to load...');
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // Give React time to render
    
    // Screenshot 1: Main dashboard/camera grid
    console.log('📸 Taking screenshot: Main Dashboard');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-main-dashboard.png'),
      fullPage: true
    });
    
    // Try to wait for camera cards to load
    try {
      await page.waitForSelector('[class*="camera"], .card, [data-testid*="camera"]', { timeout: 5000 });
      console.log('✅ Camera cards detected');
    } catch (error) {
      console.log('⚠️  Camera cards not detected, continuing...');
    }
    
    // Screenshot 2: Camera grid view (if cameras are loaded)
    console.log('📸 Taking screenshot: Camera Grid View');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-camera-grid.png'),
      fullPage: true
    });
    
    // Try to click on a camera if available
    const cameraCards = await page.$$('[class*="camera"], .card');
    if (cameraCards.length > 0) {
      console.log('🎯 Found camera cards, clicking first one...');
      await cameraCards[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Screenshot 3: Camera detail view
      console.log('📸 Taking screenshot: Camera Detail View');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-camera-detail.png'),
        fullPage: true
      });
      
      // Close modal if it exists
      const closeButton = await page.$('[class*="close"], button[aria-label="Close"], .modal button');
      if (closeButton) {
        await closeButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Try to access settings/admin page
    console.log('🔧 Looking for settings/admin access...');
    const settingsButton = await page.$('[class*="settings"], [class*="admin"], button[title*="Settings"]');
    if (settingsButton) {
      await settingsButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Screenshot 4: Settings/Admin page
      console.log('📸 Taking screenshot: Settings/Admin Page');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '04-settings-admin.png'),
        fullPage: true
      });
    }
    
    // Try different viewport sizes for responsive design
    console.log('📱 Testing mobile responsive design...');
    await page.setViewport({ width: 375, height: 667 }); // iPhone size
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Screenshot 5: Mobile view
    console.log('📸 Taking screenshot: Mobile Responsive View');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-mobile-view.png'),
      fullPage: true
    });
    
    // Reset to desktop view
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to test dark mode if toggle exists
    console.log('🌙 Looking for dark mode toggle...');
    const darkModeToggle = await page.$('[class*="dark"], [class*="theme"], button[title*="Dark"]');
    if (darkModeToggle) {
      await darkModeToggle.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Screenshot 6: Dark mode
      console.log('📸 Taking screenshot: Dark Mode');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '06-dark-mode.png'),
        fullPage: true
      });
    }
    
    console.log('\n✅ Screenshot generation completed!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
    // List generated files
    const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
    console.log('\n📋 Generated screenshots:');
    files.forEach(file => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
    });
    
  } catch (error) {
    console.error('❌ Error during screenshot generation:', error);
  } finally {
    await browser.close();
  }
}

// Check if servers are running before starting
async function checkServers() {
  const http = require('http');
  
  function checkUrl(url) {
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }
  
  try {
    const backendOk = await checkUrl(BACKEND_URL + '/api/health');
    if (!backendOk) {
      throw new Error('Backend not responding');
    }
    console.log('✅ Backend server is running');
    
    const frontendOk = await checkUrl(FRONTEND_URL);
    if (!frontendOk) {
      throw new Error('Frontend not responding');
    }
    console.log('✅ Frontend server is running');
    
    return true;
  } catch (error) {
    console.error('❌ Server check failed:', error.message);
    console.log('\nPlease ensure both servers are running:');
    console.log('Backend: npm start (in server/ directory)');
    console.log('Frontend: npm run dev (in client/ directory)');
    return false;
  }
}

// Main execution
async function main() {
  const serversRunning = await checkServers();
  if (!serversRunning) {
    process.exit(1);
  }
  
  await takeScreenshots();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { takeScreenshots };