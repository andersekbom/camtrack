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
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait a bit more for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Screenshot 1: Main Dashboard/Camera List View
    console.log('📸 Taking screenshot: Main Dashboard');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-main-dashboard.png'),
      fullPage: false
    });

    // Screenshot 2: Search functionality
    console.log('📸 Taking screenshot: Search');
    await page.click('input[placeholder*="Search"]');
    await page.type('input[placeholder*="Search"]', 'Nikon');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '02-search-functionality.png'),
      fullPage: false
    });

    // Clear search
    await page.click('input[placeholder*="Search"]');
    await page.keyboard.selectAll();
    await page.keyboard.press('Delete');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Screenshot 3: Add Camera Form
    console.log('📸 Taking screenshot: Add Camera Form');
    // Look for Add Camera button (could be text or icon)
    const addButtonSelectors = [
      'button:has-text("Add Camera")',
      'button[title*="Add"]',
      'button:has-text("+")',
      'button:contains("Add")'
    ];
    
    let addButtonFound = false;
    for (const selector of addButtonSelectors) {
      try {
        await page.click(selector);
        addButtonFound = true;
        break;
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!addButtonFound) {
      // Try clicking any button that might be the add button
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent.toLowerCase());
        if (text.includes('add') || text.includes('+') || text.includes('camera')) {
          await button.click();
          addButtonFound = true;
          break;
        }
      }
    }

    if (addButtonFound) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({
        path: path.join(screenshotsDir, '03-add-camera-form.png'),
        fullPage: false
      });

      // Fill out the form for demonstration
      await page.type('input[name="brand"], input[placeholder*="brand"]', 'Canon');
      await page.type('input[name="model"], input[placeholder*="model"]', 'AE-1');
      await page.type('input[name="serial"], input[placeholder*="serial"]', '1234567');
      
      // Try to find and set condition dropdowns/inputs
      try {
        const mechanicalSelect = await page.$('select[name="mechanical_status"], select:has(option[value="5"])');
        if (mechanicalSelect) {
          await mechanicalSelect.select('4');
        }
        
        const cosmeticSelect = await page.$('select[name="cosmetic_status"]');
        if (cosmeticSelect) {
          await cosmeticSelect.select('3');
        }
      } catch (e) {
        console.log('Could not find condition selects, continuing...');
      }

      await page.type('input[name="kamerastore_price"], input[type="number"]', '150');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.screenshot({
        path: path.join(screenshotsDir, '04-add-camera-filled.png'),
        fullPage: false
      });

      // Cancel or go back to main view
      try {
        await page.click('button:has-text("Cancel"), button:contains("Back")');
      } catch (e) {
        // If no cancel button, just reload the page
        await page.goto('http://localhost:5173');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Screenshot 4: Filter Panel (if available)
    console.log('📸 Taking screenshot: Filter Panel');
    try {
      const filterButton = await page.$('button:has-text("Filter"), button[title*="filter"], button:contains("🔍")');
      if (filterButton) {
        await filterButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
          path: path.join(screenshotsDir, '05-filter-panel.png'),
          fullPage: false
        });
      }
    } catch (e) {
      console.log('Filter panel not found, skipping...');
    }

    // Screenshot 5: View Mode Toggle
    console.log('📸 Taking screenshot: View Modes');
    try {
      // Try to find grid/list toggle buttons
      const toggleButtons = await page.$$('button[title*="view"], button:has-text("Grid"), button:has-text("List")');
      if (toggleButtons.length > 0) {
        await toggleButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
          path: path.join(screenshotsDir, '06-list-view.png'),
          fullPage: false
        });
        
        // Switch back to grid view
        if (toggleButtons.length > 1) {
          await toggleButtons[1].click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (e) {
      console.log('View toggle not found, skipping...');
    }

    // Screenshot 6: Settings/Admin Panel
    console.log('📸 Taking screenshot: Settings Panel');
    try {
      // Look for settings button (gear icon or settings text)
      const settingsSelectors = [
        'button[title*="Settings"]',
        'button[title*="Admin"]',
        'button:has-text("⚙️")',
        'button:contains("Settings")'
      ];
      
      let settingsFound = false;
      for (const selector of settingsSelectors) {
        try {
          await page.click(selector);
          settingsFound = true;
          break;
        } catch (e) {
          // Try next selector
        }
      }
      
      if (settingsFound) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '07-admin-settings.png'),
          fullPage: false
        });

        // Try to navigate to API docs tab
        try {
          await page.click('button:has-text("API Documentation"), [role="tab"]:has-text("API")');
          await new Promise(resolve => setTimeout(resolve, 500));
          await page.screenshot({
            path: path.join(screenshotsDir, '08-api-documentation.png'),
            fullPage: false
          });
        } catch (e) {
          console.log('API Documentation tab not found');
        }

        // Close settings
        try {
          await page.click('button:has-text("×"), button:contains("Close")');
        } catch (e) {
          await page.reload();
        }
      }
    } catch (e) {
      console.log('Settings panel not accessible, skipping...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Screenshot 7: Summary/Statistics (if available)
    console.log('📸 Taking screenshot: Summary View');
    try {
      const summaryButton = await page.$('button:has-text("Summary"), button:contains("📊"), button[title*="Summary"]');
      if (summaryButton) {
        await summaryButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '09-summary-statistics.png'),
          fullPage: false
        });

        // Close summary
        try {
          await page.click('button:has-text("Close"), button:contains("×")');
        } catch (e) {
          await page.reload();
        }
      }
    } catch (e) {
      console.log('Summary view not found, skipping...');
    }

    // Screenshot 8: Dark Mode
    console.log('📸 Taking screenshot: Dark Mode');
    try {
      // Look for dark mode toggle
      const darkModeToggle = await page.$('button[title*="Dark"], button:contains("🌙"), button:contains("☀️")');
      if (darkModeToggle) {
        await darkModeToggle.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(screenshotsDir, '10-dark-mode.png'),
          fullPage: false
        });
      }
    } catch (e) {
      console.log('Dark mode toggle not found, skipping...');
    }

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