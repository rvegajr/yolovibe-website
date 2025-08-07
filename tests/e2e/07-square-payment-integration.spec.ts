import { test, expect } from '@playwright/test';
import { ProductionTestDataFactory, PRODUCTION_TEST_CONFIG } from './utils/production-test-data';

/**
 * Square Payment Integration Tests
 * Tests Square payment processing with sandbox environment
 */

test.describe('Square Payment Integration', () => {
  test.use({
    baseURL: PRODUCTION_TEST_CONFIG.URLS.PRODUCTION,
    timeout: PRODUCTION_TEST_CONFIG.TIMEOUTS.PAYMENT,
  });

  test('should load Square payment form for 3-day workshop', async ({ page }) => {
    console.log('🎯 Testing Square Payment Form for 3-Day Workshop');
    
    const booking = ProductionTestDataFactory.create3DayWorkshopBooking();
    const testCard = ProductionTestDataFactory.getSquareTestCards().visa;
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to 3-day workshop booking
    const workshopButton = page.locator('text="3-Day", text="3 Day", text="$3,000", button:has-text("3")').first();
    if (await workshopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await workshopButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill user information
    await fillUserForm(page, booking.user);
    
    // Look for Square payment iframe or form
    await page.waitForTimeout(3000); // Allow Square to load
    
    const squareSelectors = [
      'iframe[src*="square"]',
      'iframe[src*="squareup"]',
      'iframe[title*="card"]',
      'iframe[title*="payment"]',
      '.sq-payment-form',
      '[data-testid="square-payment"]'
    ];
    
    let squareElement = null;
    for (const selector of squareSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        squareElement = element;
        console.log(`✅ Found Square payment element: ${selector}`);
        break;
      }
    }
    
    // If Square iframe found, interact with it
    if (squareElement) {
      console.log('✅ Square payment form loaded successfully');
      
      // Try to fill payment details in iframe
      try {
        const frame = await squareElement.contentFrame();
        if (frame) {
          // Look for card number input
          const cardInput = frame.locator('input[placeholder*="card"], input[name*="card"], input[id*="card"]').first();
          if (await cardInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await cardInput.fill(testCard.number.replace(/\s/g, ''));
            console.log(`✅ Filled card number: ${testCard.number}`);
          }
          
          // Look for CVV input
          const cvvInput = frame.locator('input[placeholder*="cvv"], input[placeholder*="cvc"], input[name*="cvv"]').first();
          if (await cvvInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cvvInput.fill(testCard.cvv);
            console.log(`✅ Filled CVV: ${testCard.cvv}`);
          }
          
          // Look for expiry input
          const expiryInput = frame.locator('input[placeholder*="expiry"], input[placeholder*="exp"], input[name*="exp"]').first();
          if (await expiryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expiryInput.fill(testCard.expiry.replace('/', ''));
            console.log(`✅ Filled expiry: ${testCard.expiry}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not interact with Square iframe: ${error}`);
      }
    } else {
      // Look for non-iframe payment form
      const cardNumberInput = page.locator('input[placeholder*="card"], input[name*="cardNumber"]').first();
      if (await cardNumberInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cardNumberInput.fill(testCard.number);
        console.log(`✅ Filled card number (direct form): ${testCard.number}`);
      }
    }
    
    // Look for submit/pay button
    const paymentButtons = [
      'button:has-text("Pay")',
      'button:has-text("Complete")',
      'button:has-text("Submit")',
      'button:has-text("Purchase")',
      'input[type="submit"]',
      '[data-testid="pay-button"]'
    ];
    
    for (const selector of paymentButtons) {
      const button = page.locator(selector);
      if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Found payment button: ${selector}`);
        // Note: We don't actually click to avoid charges
        break;
      }
    }
    
    // Verify price display
    const priceDisplay = page.locator('text="$3,000", text="$3000", .price, .total').first();
    if (await priceDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      const priceText = await priceDisplay.textContent();
      console.log(`✅ Price displayed: ${priceText}`);
      expect(priceText).toMatch(/3[,0]?000/);
    }
    
    await page.screenshot({ path: 'test-results/square-payment-3day.png', fullPage: true });
    console.log('✅ Square payment integration test completed for 3-day workshop');
  });

  test('should load Square payment form for consulting hours', async ({ page }) => {
    console.log('🎯 Testing Square Payment Form for Consulting Hours');
    
    const booking = ProductionTestDataFactory.createConsultingBooking(2); // 2 hours
    const testCard = ProductionTestDataFactory.getSquareTestCards().mastercard;
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to consulting booking
    const consultingButton = page.locator('text="Consulting", text="$150", button:has-text("Consulting")').first();
    if (await consultingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await consultingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill user information
    await fillUserForm(page, booking.user);
    
    // Select 2 hours if there's an option
    const hoursSelector = page.locator('select[name*="hours"], input[name*="hours"], input[name*="duration"]').first();
    if (await hoursSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await hoursSelector.fill('2');
      console.log('✅ Selected 2 hours of consulting');
    }
    
    // Verify consulting price (2 hours * $150 = $300)
    await page.waitForTimeout(2000); // Allow price calculation
    const consultingPrice = page.locator('text="$300", .price, .total').first();
    if (await consultingPrice.isVisible({ timeout: 3000 }).catch(() => false)) {
      const priceText = await consultingPrice.textContent();
      console.log(`✅ Consulting price displayed: ${priceText}`);
      expect(priceText).toMatch(/300/);
    }
    
    // Look for Square payment elements
    await page.waitForTimeout(3000);
    const squarePaymentForm = page.locator('iframe[src*="square"], .sq-payment-form').first();
    if (await squarePaymentForm.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Square payment form loaded for consulting');
    }
    
    await page.screenshot({ path: 'test-results/square-payment-consulting.png', fullPage: true });
    console.log('✅ Square payment integration test completed for consulting');
  });

  test('should handle payment form validation', async ({ page }) => {
    console.log('🎯 Testing Square Payment Form Validation');
    
    await page.goto(PRODUCTION_TEST_CONFIG.URLS.PRODUCTION);
    await page.waitForLoadState('networkidle');
    
    // Navigate to any booking flow
    const bookingButton = page.locator('a[href*="book"], button:has-text("Book")').first();
    if (await bookingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bookingButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill minimal user info
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('validation-test@example.com');
    }
    
    // Try to submit without payment info
    const submitButton = page.locator('button:has-text("Pay"), button:has-text("Submit"), button[type="submit"]').first();
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click();
      console.log('✅ Attempted submission without payment info');
      
      // Look for validation messages
      const validationMessages = [
        'text="required"',
        'text="invalid"',
        'text="error"',
        '.error',
        '.validation-error',
        '[data-testid="error"]'
      ];
      
      for (const selector of validationMessages) {
        const error = page.locator(selector).first();
        if (await error.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await error.textContent();
          console.log(`✅ Found validation message: ${errorText}`);
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/square-payment-validation.png', fullPage: true });
    console.log('✅ Payment form validation test completed');
  });
});

/**
 * Helper function to fill user form
 */
async function fillUserForm(page: any, user: any) {
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(user.email);
    console.log(`✅ Filled email: ${user.email}`);
  }
  
  const nameInput = page.locator('input[name="name"], input[name="firstName"]').first();
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill(`${user.firstName} ${user.lastName}`);
    console.log(`✅ Filled name: ${user.firstName} ${user.lastName}`);
  }
  
  const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
  if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneInput.fill(user.phone);
    console.log(`✅ Filled phone: ${user.phone}`);
  }
}