const { expect } = require('@playwright/test');

/**
 * Test utilities for E2E tests
 */
class TestUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Clear all cameras from the database
   */
  async clearDatabase() {
    const response = await this.page.request.delete('http://localhost:3000/api/cameras/clear');
    expect(response.ok()).toBeTruthy();
  }

  /**
   * Create a test camera via API
   */
  async createTestCamera(cameraData = {}) {
    const defaultCamera = {
      brand: 'Nikon',
      model: 'F50',
      serial: 'TEST001',
      mechanical_status: 5,
      cosmetic_status: 4,
      kamerastore_price: 600,
      comment: 'Test camera',
      ...cameraData
    };

    const response = await this.page.request.post('http://localhost:3000/api/cameras', {
      data: defaultCamera
    });
    
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Create multiple test cameras via API
   */
  async createMultipleTestCameras() {
    const cameras = [
      {
        brand: 'Nikon',
        model: 'F50',
        serial: 'TEST001',
        mechanical_status: 5,
        cosmetic_status: 4,
        kamerastore_price: 600,
        comment: 'High-end Nikon'
      },
      {
        brand: 'Canon',
        model: 'AE-1',
        serial: 'TEST002',
        mechanical_status: 4,
        cosmetic_status: 3,
        kamerastore_price: 150,
        comment: 'Classic Canon'
      },
      {
        brand: 'Pentax',
        model: 'K1000',
        serial: 'TEST003',
        mechanical_status: 3,
        cosmetic_status: 5,
        kamerastore_price: 200,
        comment: 'Student favorite'
      },
      {
        brand: 'Leica',
        model: 'M6',
        serial: 'TEST004',
        mechanical_status: 5,
        cosmetic_status: 5,
        kamerastore_price: 2500,
        sold_price: 2200,
        comment: 'Premium rangefinder'
      }
    ];

    const created = [];
    for (const camera of cameras) {
      const result = await this.createTestCamera(camera);
      created.push(result);
    }
    return created;
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    // Wait for React to render
    await this.page.waitForSelector('[data-testid="camera-list"], [data-testid="loading-spinner"]', { timeout: 10000 });
    // If loading spinner is present, wait for it to disappear
    const loadingSpinner = await this.page.locator('[data-testid="loading-spinner"]').count();
    if (loadingSpinner > 0) {
      await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'detached', timeout: 10000 });
    }
  }

  /**
   * Wait for API requests to complete
   */
  async waitForApiRequests() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with a custom name
   */
  async screenshot(name) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Check if dark mode is active
   */
  async isDarkMode() {
    const html = await this.page.locator('html');
    return await html.getAttribute('class') === 'dark';
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode() {
    await this.page.click('[data-testid="dark-mode-toggle"]');
    await this.page.waitForTimeout(300); // Wait for transition
  }

  /**
   * Navigate to a specific section
   */
  async navigateTo(section) {
    switch (section) {
      case 'cameras':
        await this.page.click('[data-testid="nav-cameras"]');
        break;
      case 'summary':
        await this.page.click('[data-testid="nav-summary"]');
        break;
      case 'import-export':
        await this.page.click('[data-testid="nav-import-export"]');
        break;
      case 'admin':
        await this.page.click('[data-testid="nav-admin"]');
        break;
    }
    await this.waitForPageLoad();
  }

  /**
   * Fill camera form fields
   */
  async fillCameraForm(data) {
    if (data.brand) {
      await this.page.fill('[data-testid="camera-brand"]', data.brand);
    }
    if (data.model) {
      await this.page.fill('[data-testid="camera-model"]', data.model);
    }
    if (data.serial) {
      await this.page.fill('[data-testid="camera-serial"]', data.serial);
    }
    if (data.mechanical_status) {
      await this.page.click(`[data-testid="mechanical-star-${data.mechanical_status}"]`);
    }
    if (data.cosmetic_status) {
      await this.page.click(`[data-testid="cosmetic-star-${data.cosmetic_status}"]`);
    }
    if (data.kamerastore_price) {
      await this.page.fill('[data-testid="camera-kamerastore-price"]', data.kamerastore_price.toString());
    }
    if (data.sold_price) {
      await this.page.fill('[data-testid="camera-sold-price"]', data.sold_price.toString());
    }
    if (data.comment) {
      await this.page.fill('[data-testid="camera-comment"]', data.comment);
    }
  }

  /**
   * Submit camera form
   */
  async submitCameraForm() {
    await this.page.click('[data-testid="submit-camera"]');
    await this.waitForApiRequests();
  }

  /**
   * Search for cameras
   */
  async searchCameras(searchTerm) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    // Wait for debounced search
    await this.page.waitForTimeout(500);
    await this.waitForApiRequests();
  }

  /**
   * Apply price filter
   */
  async applyPriceFilter(minPrice, maxPrice) {
    if (minPrice) {
      await this.page.fill('[data-testid="min-price-filter"]', minPrice.toString());
    }
    if (maxPrice) {
      await this.page.fill('[data-testid="max-price-filter"]', maxPrice.toString());
    }
    await this.page.waitForTimeout(500);
    await this.waitForApiRequests();
  }

  /**
   * Click on a camera card
   */
  async clickCameraCard(index = 0) {
    const cameras = await this.page.locator('[data-testid="camera-card"]');
    await cameras.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Get camera count from the UI
   */
  async getCameraCount() {
    const cameras = await this.page.locator('[data-testid="camera-card"]');
    return await cameras.count();
  }

  /**
   * Verify camera details in list
   */
  async verifyCameraInList(brand, model, index = 0) {
    const cameraCard = this.page.locator('[data-testid="camera-card"]').nth(index);
    await expect(cameraCard.locator('[data-testid="camera-brand"]')).toContainText(brand);
    await expect(cameraCard.locator('[data-testid="camera-model"]')).toContainText(model);
  }

  /**
   * Switch view mode (grid/list)
   */
  async switchViewMode(mode = 'grid') {
    const currentMode = mode === 'grid' ? 'list' : 'grid';
    const buttonSelector = `[data-testid="view-mode-${mode}"]`;
    
    // Only click if not already in the desired mode
    const isActive = await this.page.locator(`${buttonSelector}.active, ${buttonSelector}[aria-pressed="true"]`).count();
    if (isActive === 0) {
      await this.page.click(buttonSelector);
      await this.page.waitForTimeout(200); // Wait for transition
    }
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Wait for toast message
   */
  async waitForToast(message) {
    const toast = this.page.locator('[data-testid="toast"], .toast').filter({ hasText: message });
    await toast.waitFor({ timeout: 5000 });
    return toast;
  }

  /**
   * Create CSV content for import testing
   */
  createCSVContent(cameras) {
    const header = 'Brand,Model,Serial,Mechanical,Cosmetic,Kamerastore,Weighted Price,Sold Price,Comment\n';
    const rows = cameras.map(camera => {
      const weightedPrice = camera.kamerastore_price * (0.2 + ((camera.mechanical_status + camera.cosmetic_status) / 2 - 1) * 0.2);
      return [
        camera.brand,
        camera.model,
        camera.serial || '',
        camera.mechanical_status,
        camera.cosmetic_status,
        camera.kamerastore_price,
        weightedPrice.toFixed(0),
        camera.sold_price || '',
        camera.comment || ''
      ].join(',');
    }).join('\n');
    
    return header + rows;
  }
}

module.exports = { TestUtils };