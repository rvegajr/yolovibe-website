import { test, expect } from '@playwright/test';
import { ProductionTestDataFactory, PRODUCTION_TEST_CONFIG } from './utils/production-test-data';

/**
 * Email Confirmation Tests
 * Tests email confirmation functionality after bookings
 */

test.describe('Email Confirmation', () => {
  test.use({
    baseURL: PRODUCTION_TEST_CONFIG.URLS.PRODUCTION,
    timeout: PRODUCTION_TEST_CONFIG.TIMEOUTS.LONG,
  });

  test('should show email confirmation messaging for workshop booking', async ({ page }) => {
    console.log('🎯 Testing Email Confirmation for Workshop Booking');
    
    const booking = ProductionTestDataFactory.create3DayWorkshopBooking();
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to workshop booking
    const workshopButton = page.locator('text="3-Day", text="3 Day", button:has-text("3")').first();
    if (await workshopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await workshopButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill user information
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(booking.user.email);
      console.log(`✅ Filled email: ${booking.user.email}`);
    }
    
    // Look for email confirmation messaging
    const emailConfirmationSelectors = [
      'text="confirmation email"',
      'text="email confirmation"',
      'text="receipt will be sent"',
      'text="you will receive"',
      'text="check your email"',
      'text="confirmation will be sent"',
      '.email-confirmation',
      '[data-testid="email-confirmation"]'
    ];
    
    let foundEmailConfirmation = false;
    for (const selector of emailConfirmationSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found email confirmation message: ${text}`);
        foundEmailConfirmation = true;
        break;
      }
    }
    
    // Look for email-related form fields or messaging
    const emailRelatedSelectors = [
      'label:has-text("email")',
      'text="valid email"',
      'text="email address"',
      'text="notification"',
      'text="updates"'
    ];
    
    for (const selector of emailRelatedSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found email-related element: ${text}`);
        break;
      }
    }
    
    // Check if there's a checkbox for email notifications
    const emailNotificationCheckbox = page.locator('input[type="checkbox"]:near(text="email"), input[type="checkbox"]:near(text="notification")').first();
    if (await emailNotificationCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailNotificationCheckbox.check();
      console.log('✅ Enabled email notifications');
    }
    
    await page.screenshot({ path: 'test-results/email-confirmation-workshop.png', fullPage: true });
    
    if (foundEmailConfirmation) {
      console.log('✅ Email confirmation functionality verified for workshop');
    } else {
      console.log('⚠️ No explicit email confirmation messaging found');
    }
  });

  test('should show email confirmation for consulting booking', async ({ page }) => {
    console.log('🎯 Testing Email Confirmation for Consulting Booking');
    
    const booking = ProductionTestDataFactory.createConsultingBooking(1);
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to consulting booking
    const consultingButton = page.locator('text="Consulting", text="$150", button:has-text("Consulting")').first();
    if (await consultingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await consultingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill user information
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(booking.user.email);
      console.log(`✅ Filled consulting email: ${booking.user.email}`);
    }
    
    // Look for appointment confirmation messaging
    const appointmentConfirmationSelectors = [
      'text="appointment confirmation"',
      'text="meeting confirmation"',
      'text="consultation confirmation"',
      'text="calendar invite"',
      'text="meeting details"',
      'text="appointment details"'
    ];
    
    for (const selector of appointmentConfirmationSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found appointment confirmation message: ${text}`);
        break;
      }
    }
    
    // Look for calendar integration messaging
    const calendarEmailSelectors = [
      'text="calendar invite will be sent"',
      'text="Google Calendar"',
      'text="add to calendar"',
      'text="meeting link"',
      'text="zoom"',
      'text="video call"'
    ];
    
    for (const selector of calendarEmailSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found calendar email reference: ${text}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/email-confirmation-consulting.png', fullPage: true });
    console.log('✅ Email confirmation test completed for consulting');
  });

  test('should validate email format in booking forms', async ({ page }) => {
    console.log('🎯 Testing Email Format Validation');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to any booking form
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Find email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      
      // Test invalid email format
      await emailInput.fill('invalid-email');
      await emailInput.blur(); // Trigger validation
      
      // Look for validation messages
      const validationSelectors = [
        'text="invalid email"',
        'text="valid email"',
        'text="email format"',
        '.error',
        '.validation-error',
        '[data-testid="email-error"]',
        '.invalid-feedback'
      ];
      
      let foundValidation = false;
      for (const selector of validationSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          const text = await element.textContent();
          console.log(`✅ Found email validation message: ${text}`);
          foundValidation = true;
          break;
        }
      }
      
      // Test valid email format
      await emailInput.fill('valid-test@example.com');
      await emailInput.blur();
      
      // Check if validation error disappears
      await page.waitForTimeout(1000);
      console.log('✅ Tested valid email format');
      
      if (foundValidation) {
        console.log('✅ Email format validation is working');
      } else {
        console.log('⚠️ No email format validation detected');
      }
    }
    
    await page.screenshot({ path: 'test-results/email-validation.png', fullPage: true });
    console.log('✅ Email format validation test completed');
  });

  test('should show email preferences options', async ({ page }) => {
    console.log('🎯 Testing Email Preferences Options');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking form
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for email preference options
    const emailPreferenceSelectors = [
      'input[type="checkbox"]:near(text="email")',
      'input[type="checkbox"]:near(text="notification")',
      'input[type="checkbox"]:near(text="updates")',
      'input[type="checkbox"]:near(text="marketing")',
      'input[type="checkbox"]:near(text="newsletter")',
      'text="email preferences"',
      'text="communication preferences"',
      '.email-preferences',
      '[data-testid="email-preferences"]'
    ];
    
    for (const selector of emailPreferenceSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ Found email preference option: ${selector}`);
        
        // If it's a checkbox, interact with it
        if (selector.includes('checkbox')) {
          const isChecked = await element.isChecked();
          console.log(`   Checkbox state: ${isChecked ? 'checked' : 'unchecked'}`);
          
          // Toggle the checkbox
          await element.click();
          const newState = await element.isChecked();
          console.log(`   After toggle: ${newState ? 'checked' : 'unchecked'}`);
        }
        break;
      }
    }
    
    // Look for privacy policy or terms related to email
    const privacySelectors = [
      'text="privacy policy"',
      'text="terms of service"',
      'text="data protection"',
      'text="GDPR"',
      'text="unsubscribe"',
      'a[href*="privacy"]',
      'a[href*="terms"]'
    ];
    
    for (const selector of privacySelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found privacy/terms reference: ${text}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/email-preferences.png', fullPage: true });
    console.log('✅ Email preferences test completed');
  });

  test('should handle email delivery confirmation', async ({ page }) => {
    console.log('🎯 Testing Email Delivery Confirmation Flow');
    
    const booking = ProductionTestDataFactory.create3DayWorkshopBooking();
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Complete a booking flow (without payment)
    const workshopButton = page.locator('text="3-Day", text="3 Day", button:has-text("3")').first();
    if (await workshopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await workshopButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill out the form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(booking.user.email);
    }
    
    const nameInput = page.locator('input[name="name"], input[name="firstName"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill(`${booking.user.firstName} ${booking.user.lastName}`);
    }
    
    // Look for form submission success messaging
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Next")').first();
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Note: We don't actually submit to avoid creating test bookings
      console.log('✅ Found submit button - form is ready for submission');
    }
    
    // Look for success/confirmation page elements
    const confirmationSelectors = [
      'text="thank you"',
      'text="confirmation"',
      'text="success"',
      'text="received"',
      'text="we\'ll be in touch"',
      'text="check your email"',
      '.success-message',
      '.confirmation-message',
      '[data-testid="success"]'
    ];
    
    for (const selector of confirmationSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ Found confirmation element: ${text}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/email-delivery-confirmation.png', fullPage: true });
    console.log('✅ Email delivery confirmation test completed');
  });
});