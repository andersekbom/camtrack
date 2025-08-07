const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../docs/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function generateScreenshots() {
  console.log('🚀 Starting screenshot generation...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1200, height: 800 });
    
    // Wait for application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Wait a bit more for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Screenshot 1: Main Dashboard/Camera List View
    console.log('📸 Taking screenshot: Main Dashboard');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-main-dashboard.png'),
      fullPage: false
    });

    // Screenshot 2: Search functionality  
    console.log('📸 Taking screenshot: Search');
    try {
      // Find search input
      const searchInput = await page.$('input[placeholder*="Search"], input[placeholder*="search"]');
      if (searchInput) {
        await searchInput.click();
        await searchInput.type('Nikon');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '02-search-functionality.png'),
          fullPage: false
        });
        
        // Clear search
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log('Search input not found, skipping search screenshot');
    }

    // Screenshot 3: Add Camera Button Click
    console.log('📸 Taking screenshot: Add Camera');
    try {
      // Wait for and click add camera button
      await page.waitForSelector('button', { timeout: 5000 });
      const buttons = await page.$$('button');
      
      let addButtonClicked = false;
      for (const button of buttons) {
        const text = await page.evaluate(btn => btn.textContent, button);
        if (text.toLowerCase().includes('add') || text.includes('+')) {
          await button.click();
          addButtonClicked = true;
          break;
        }
      }

      if (addButtonClicked) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '03-add-camera-form.png'),
          fullPage: false
        });

        // Fill out form if visible
        const brandInput = await page.$('input[name="brand"], input[placeholder*="brand"], input[placeholder*="Brand"]');
        if (brandInput) {
          await brandInput.type('Canon');
          
          const modelInput = await page.$('input[name="model"], input[placeholder*="model"], input[placeholder*="Model"]');
          if (modelInput) {
            await modelInput.type('AE-1');
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          await page.screenshot({
            path: path.join(screenshotsDir, '04-add-camera-filled.png'),
            fullPage: false
          });
        }

        // Try to close the form
        try {
          const cancelButton = await page.$('button[type="button"]');
          if (cancelButton) {
            const cancelText = await page.evaluate(btn => btn.textContent, cancelButton);
            if (cancelText.toLowerCase().includes('cancel')) {
              await cancelButton.click();
            }
          }
        } catch (e) {
          await page.reload();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (e) {
      console.log('Add camera button not found or form not accessible');
      await page.reload();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Screenshot 4: Settings Panel
    console.log('📸 Taking screenshot: Settings');
    try {
      // Look for settings button - try multiple approaches
      const settingsButton = await page.$('button[title*="Settings"], button[title*="Admin"]');
      if (settingsButton) {
        await settingsButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '05-admin-settings.png'),
          fullPage: false
        });

        // Try to close settings
        const closeButton = await page.$('button');
        if (closeButton) {
          const closeText = await page.evaluate(btn => btn.textContent, closeButton);
          if (closeText.includes('×') || closeText.toLowerCase().includes('close')) {
            await closeButton.click();
          }
        }
      }
    } catch (e) {
      console.log('Settings panel not found');
    }

    // Screenshot 5: Try Summary/Stats
    console.log('📸 Taking screenshot: Summary');
    try {
      const summaryButton = await page.$('button[title*="Summary"]');
      if (summaryButton) {
        await summaryButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '06-summary-stats.png'),
          fullPage: false
        });

        // Close summary
        const closeButton = await page.$('button');
        if (closeButton) {
          const closeText = await page.evaluate(btn => btn.textContent, closeButton);
          if (closeText.includes('×') || closeText.toLowerCase().includes('close')) {
            await closeButton.click();
          }
        }
      }
    } catch (e) {
      console.log('Summary panel not found');
    }

    // Screenshot 6: Mobile responsive view
    console.log('📸 Taking screenshot: Mobile View');
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE size
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '07-mobile-view.png'),
      fullPage: false
    });

    // Return to desktop view
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Screenshot generation completed successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the screenshot generation
if (require.main === module) {
  generateScreenshots().catch(console.error);
}

module.exports = { generateScreenshots };