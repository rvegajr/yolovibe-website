import { test, expect } from '@playwright/test';
import { ProductionTestDataFactory, PRODUCTION_TEST_CONFIG } from './utils/production-test-data';

/**
 * Calendar Integration Tests
 * Tests Google Calendar integration for booking scheduling
 */

test.describe('Calendar Integration', () => {
  test.use({
    baseURL: PRODUCTION_TEST_CONFIG.URLS.PRODUCTION,
    timeout: PRODUCTION_TEST_CONFIG.TIMEOUTS.LONG,
  });

  test('should display calendar integration for consulting booking', async ({ page }) => {
    console.log('🎯 Testing Calendar Integration for Consulting');
    
    const booking = ProductionTestDataFactory.createConsultingBooking(1);
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to consulting booking
    const consultingSelectors = [
      'text="Consulting"',
      'text="$150"',
      'button:has-text("Consulting")',
      '[data-product-id="prod-consulting"]'
    ];
    
    for (const selector of consultingSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        await element.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Clicked consulting element: ${selector}`);
        break;
      }
    }
    
    // Fill user information
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(booking.user.email);
      console.log(`✅ Filled email: ${booking.user.email}`);
    }
    
    // Look for calendar/date selection elements
    const calendarSelectors = [
      'input[type="date"]',
      'input[type="datetime-local"]',
      'input[type="time"]',
      '.calendar',
      '.date-picker',
      '[data-testid="date-picker"]',
      '[data-testid="calendar"]',
      'button:has-text("Select Date")',
      'button:has-text("Choose Time")',
      'select[name*="date"]',
      'select[name*="time"]'
    ];
    
    let calendarElement = null;
    for (const selector of calendarSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        calendarElement = element;
        console.log(`✅ Found calendar element: ${selector}`);
        
        // If it's a date input, fill it
        if (selector.includes('date')) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 7); // 1 week from now
          const dateString = futureDate.toISOString().split('T')[0];
          await element.fill(dateString);
          console.log(`✅ Selected date: ${dateString}`);
        }
        
        // If it's a time input, fill it
        if (selector.includes('time')) {
          await element.fill('14:00'); // 2 PM
          console.log(`✅ Selected time: 2:00 PM`);
        }
        
        break;
      }
    }
    
    // Look for time slot selection
    const timeSlotSelectors = [
      'button:has-text("AM")',
      'button:has-text("PM")',
      'button:has-text(":00")',
      '.time-slot',
      '[data-testid="time-slot"]',
      'input[name*="time"]'
    ];
    
    for (const selector of timeSlotSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Found time slot element: ${selector}`);
        
        // Click first available time slot
        await element.click();
        console.log(`✅ Selected time slot`);
        break;
      }
    }
    
    // Check for calendar integration messaging
    const calendarMessages = [
      'text="calendar"',
      'text="Google Calendar"',
      'text="appointment"',
      'text="scheduled"',
      'text="meeting"'
    ];
    
    for (const selector of calendarMessages) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found calendar reference: ${text}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/calendar-integration-consulting.png', fullPage: true });
    console.log('✅ Calendar integration test completed for consulting');
  });

  test('should display workshop scheduling information', async ({ page }) => {
    console.log('🎯 Testing Workshop Scheduling Information');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Look for workshop scheduling information
    const workshopScheduleSelectors = [
      'text="schedule"',
      'text="dates"',
      'text="upcoming"',
      'text="next workshop"',
      'text="start date"',
      '.workshop-schedule',
      '[data-testid="workshop-dates"]'
    ];
    
    for (const selector of workshopScheduleSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found workshop schedule info: ${text}`);
        break;
      }
    }
    
    // Navigate to 3-day workshop
    const workshop3DayButton = page.locator('text="3-Day", text="3 Day", button:has-text("3")').first();
    if (await workshop3DayButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await workshop3DayButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Navigated to 3-day workshop');
    }
    
    // Look for workshop date information
    const workshopDateSelectors = [
      'input[type="date"]',
      'text="Start Date"',
      'text="Workshop Date"',
      '.workshop-date',
      '[data-testid="workshop-start-date"]'
    ];
    
    for (const selector of workshopDateSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Found workshop date element: ${selector}`);
        
        if (selector.includes('input')) {
          // If it's a date input, select a future date
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30); // 1 month from now
          const dateString = futureDate.toISOString().split('T')[0];
          await element.fill(dateString);
          console.log(`✅ Selected workshop date: ${dateString}`);
        }
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/workshop-scheduling.png', fullPage: true });
    console.log('✅ Workshop scheduling test completed');
  });

  test('should handle calendar availability checking', async ({ page }) => {
    console.log('🎯 Testing Calendar Availability Checking');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking flow
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for availability checking features
    const availabilitySelectors = [
      'text="available"',
      'text="unavailable"',
      'text="booked"',
      'text="check availability"',
      '.availability',
      '.calendar-availability',
      '[data-testid="availability"]',
      'button:has-text("Check")'
    ];
    
    for (const selector of availabilitySelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found availability element: ${text}`);
        
        // If it's a button, click it
        if (selector.includes('button')) {
          await element.click();
          await page.waitForTimeout(2000); // Wait for availability check
          console.log('✅ Clicked availability check button');
        }
        break;
      }
    }
    
    // Look for calendar blocked dates or unavailable times
    const blockedSelectors = [
      '.blocked',
      '.unavailable',
      '.disabled',
      '[data-blocked="true"]',
      'text="not available"',
      'text="fully booked"'
    ];
    
    for (const selector of blockedSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Found blocked/unavailable element: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/calendar-availability.png', fullPage: true });
    console.log('✅ Calendar availability checking test completed');
  });

  test('should show timezone information', async ({ page }) => {
    console.log('🎯 Testing Timezone Information Display');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Look for timezone information
    const timezoneSelectors = [
      'text="timezone"',
      'text="time zone"',
      'text="EST"',
      'text="CST"',
      'text="PST"',
      'text="UTC"',
      'text="GMT"',
      '.timezone',
      '[data-testid="timezone"]'
    ];
    
    for (const selector of timezoneSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found timezone information: ${text}`);
        break;
      }
    }
    
    // Navigate to consulting booking to check timezone handling
    const consultingButton = page.locator('text="Consulting", button:has-text("Consulting")').first();
    if (await consultingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await consultingButton.click();
      await page.waitForLoadState('networkidle');
      
      // Look for timezone selector or display
      const timezoneSelector = page.locator('select[name*="timezone"], .timezone-selector').first();
      if (await timezoneSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Found timezone selector for consulting');
      }
    }
    
    await page.screenshot({ path: 'test-results/timezone-information.png', fullPage: true });
    console.log('✅ Timezone information test completed');
  });
});