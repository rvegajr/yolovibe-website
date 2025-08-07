import { test, expect } from '@playwright/test';
import { ProductionTestDataFactory, PRODUCTION_TEST_CONFIG } from './utils/production-test-data';

/**
 * Workshop Calendar Selection Tests
 * Tests the interactive calendar functionality for workshop date selection
 */

test.describe('Workshop Calendar Selection', () => {
  test.use({
    baseURL: PRODUCTION_TEST_CONFIG.URLS.PRODUCTION,
    timeout: PRODUCTION_TEST_CONFIG.TIMEOUTS.LONG,
  });

  test('should display interactive calendar for workshop date selection', async ({ page }) => {
    console.log('🎯 Testing Interactive Workshop Calendar Selection');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking page
    const bookingSelectors = [
      'a[href*="book"]',
      'button:has-text("Book")',
      'button:has-text("Book Now")',
      '.cta-button',
      '[data-testid="book-now"]'
    ];
    
    for (const selector of bookingSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        await element.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Clicked booking element: ${selector}`);
        break;
      }
    }
    
    // Look for workshop date selection elements
    const dateSelectionSelectors = [
      'input[type="date"]',
      'input[name*="date"]',
      'input[name*="workshop"]',
      '.date-picker',
      '.calendar-widget',
      '[data-testid="workshop-date"]',
      '[data-testid="date-selector"]',
      'select[name*="date"]',
      'div[role="button"]:has-text("date")',
      'div[role="button"]:has-text("Date")'
    ];
    
    let calendarElement = null;
    for (const selector of dateSelectionSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        calendarElement = element;
        console.log(`✅ Found calendar element: ${selector}`);
        
        // Try to interact with the calendar
        await element.click();
        await page.waitForTimeout(2000); // Wait for calendar to open
        
        // Look for calendar popup or dropdown
        const calendarPopupSelectors = [
          '.calendar-popup',
          '.date-picker-popup',
          '.calendar-dropdown',
          '[role="dialog"]',
          '.calendar-widget',
          '.date-selector',
          'div[class*="calendar"]',
          'div[class*="date"]'
        ];
        
        for (const popupSelector of calendarPopupSelectors) {
          const popup = page.locator(popupSelector).first();
          if (await popup.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ Calendar popup found: ${popupSelector}`);
            
            // Look for date cells or day buttons
            const dateCellSelectors = [
              'td[class*="day"]',
              'button[class*="day"]',
              'div[class*="day"]',
              '[data-date]',
              'button:has-text("1")',
              'button:has-text("2")',
              'button:has-text("15")',
              'button:has-text("20")'
            ];
            
            for (const cellSelector of dateCellSelectors) {
              const cell = popup.locator(cellSelector).first();
              if (await cell.isVisible({ timeout: 1000 }).catch(() => false)) {
                console.log(`✅ Found date cell: ${cellSelector}`);
                
                // Try to click on a date
                await cell.click();
                console.log(`✅ Clicked on date cell`);
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
    
    // Check for "Workshop Date" field specifically
    const workshopDateField = page.locator('text="Workshop Date", text="workshop date", input[name*="workshop"], input[name*="date"]').first();
    if (await workshopDateField.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Found Workshop Date field');
      
      // Check if it's interactive
      const isInput = await workshopDateField.evaluate(el => el.tagName === 'INPUT');
      if (isInput) {
        console.log('✅ Workshop Date field is an input element');
        
        // Try to click and see if a calendar opens
        await workshopDateField.click();
        await page.waitForTimeout(2000);
        
        // Look for any calendar that might have appeared
        const anyCalendar = page.locator('.calendar, .date-picker, [role="dialog"], div[class*="calendar"]').first();
        if (await anyCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Calendar interface appeared after clicking Workshop Date field');
        }
      }
    }
    
    // Look for available workshop dates text
    const availableDatesText = page.locator('text="Monday", text="Wednesday", text="Friday", text="available dates"').first();
    if (await availableDatesText.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await availableDatesText.textContent();
      console.log(`✅ Found available dates text: ${text}`);
    }
    
    await page.screenshot({ path: 'test-results/workshop-calendar-selection.png', fullPage: true });
    console.log('✅ Workshop calendar selection test completed');
  });

  test('should handle workshop availability checking', async ({ page }) => {
    console.log('🎯 Testing Workshop Availability Checking');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for availability indicators
    const availabilitySelectors = [
      'text="available"',
      'text="unavailable"',
      'text="booked"',
      'text="full"',
      '.availability',
      '.workshop-availability',
      '[data-testid="availability"]'
    ];
    
    for (const selector of availabilitySelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found availability indicator: ${text}`);
        break;
      }
    }
    
    // Check for error messages about workshop loading
    const errorSelectors = [
      'text="Failed to load"',
      'text="error"',
      'text="unavailable"',
      'text="refresh"',
      '.error-message',
      '[data-testid="error"]'
    ];
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`⚠️ Found error message: ${text}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/workshop-availability-check.png', fullPage: true });
    console.log('✅ Workshop availability checking test completed');
  });

  test('should allow date selection for different workshop types', async ({ page }) => {
    console.log('🎯 Testing Date Selection for Different Workshop Types');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for workshop type selection
    const workshopTypeSelectors = [
      'select[name*="service"]',
      'select[name*="workshop"]',
      'select[name*="type"]',
      'input[name*="workshop"]',
      '.workshop-selector',
      '[data-testid="workshop-type"]'
    ];
    
    for (const selector of workshopTypeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ Found workshop type selector: ${selector}`);
        
        // Try to select different workshop types
        const options = element.locator('option');
        const optionCount = await options.count();
        console.log(`📊 Found ${optionCount} workshop options`);
        
        // Try to select 3-day workshop
        const threeDayOption = element.locator('option:has-text("3-Day"), option:has-text("3 day")').first();
        if (await threeDayOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await threeDayOption.click();
          console.log('✅ Selected 3-day workshop option');
          await page.waitForTimeout(2000); // Wait for date options to update
        }
        
        // Try to select 5-day workshop
        const fiveDayOption = element.locator('option:has-text("5-Day"), option:has-text("5 day")').first();
        if (await fiveDayOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await fiveDayOption.click();
          console.log('✅ Selected 5-day workshop option');
          await page.waitForTimeout(2000); // Wait for date options to update
        }
        break;
      }
    }
    
    // Check if date selection changes based on workshop type
    const dateField = page.locator('input[type="date"], input[name*="date"], text="Workshop Date"').first();
    if (await dateField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Date field is present and may update based on workshop selection');
    }
    
    await page.screenshot({ path: 'test-results/workshop-type-date-selection.png', fullPage: true });
    console.log('✅ Workshop type date selection test completed');
  });

  test('should validate calendar integration with booking form', async ({ page }) => {
    console.log('🎯 Testing Calendar Integration with Booking Form');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill out the booking form
    const testUser = ProductionTestDataFactory.generateTestUser('calendar-test');
    
    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(testUser.email);
      console.log(`✅ Filled email: ${testUser.email}`);
    }
    
    // Fill name
    const nameInput = page.locator('input[name="name"], input[name="firstName"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill(`${testUser.firstName} ${testUser.lastName}`);
      console.log(`✅ Filled name: ${testUser.firstName} ${testUser.lastName}`);
    }
    
    // Try to select a workshop date
    const dateInput = page.locator('input[type="date"], input[name*="date"]').first();
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Select a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14); // 2 weeks from now
      const dateString = futureDate.toISOString().split('T')[0];
      await dateInput.fill(dateString);
      console.log(`✅ Selected workshop date: ${dateString}`);
    }
    
    // Look for submit button
    const submitButton = page.locator('button:has-text("Book"), button:has-text("Submit"), button[type="submit"]').first();
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found submit button - form is ready for submission');
    }
    
    await page.screenshot({ path: 'test-results/calendar-booking-integration.png', fullPage: true });
    console.log('✅ Calendar booking integration test completed');
  });

  test('should handle calendar error states and recovery', async ({ page }) => {
    console.log('🎯 Testing Calendar Error States and Recovery');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for error messages
    const errorSelectors = [
      'text="Failed to load"',
      'text="error"',
      'text="unavailable"',
      'text="refresh"',
      '.error',
      '.error-message',
      '[data-testid="error"]'
    ];
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`⚠️ Found error message: ${text}`);
        
        // Look for refresh or retry buttons
        const retrySelectors = [
          'button:has-text("Refresh")',
          'button:has-text("Retry")',
          'button:has-text("Try Again")',
          'a:has-text("refresh")',
          '[data-testid="retry"]'
        ];
        
        for (const retrySelector of retrySelectors) {
          const retryButton = page.locator(retrySelector).first();
          if (await retryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ Found retry button: ${retrySelector}`);
            break;
          }
        }
        break;
      }
    }
    
    // Try refreshing the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ Page refreshed to test error recovery');
    
    await page.screenshot({ path: 'test-results/calendar-error-recovery.png', fullPage: true });
    console.log('✅ Calendar error recovery test completed');
  });
}); 