import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { TEST_CONFIG } from '../utils/test-data';
import type { TestBooking, TestAttendee } from '../utils/test-data';

/**
 * Booking Page Object Model
 * Handles all interactions with the booking page and flow
 */
export class BookingPage {
  readonly page: Page;
  
  // Product selection
  readonly productSelection: Locator;
  readonly threeDayWorkshop: Locator;
  readonly fiveDayWorkshop: Locator;
  readonly consultingOption: Locator;
  
  // Date selection
  readonly dateSelection: Locator;
  readonly dateInput: Locator;
  readonly availableDates: Locator;
  
  // Attendee information
  readonly attendeeSection: Locator;
  readonly addAttendeeButton: Locator;
  readonly removeAttendeeButton: Locator;
  
  // Form fields (for first attendee)
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;
  readonly dietaryRestrictionsInput: Locator;
  readonly accessibilityNeedsInput: Locator;
  
  // Point of contact
  readonly pointOfContactSection: Locator;
  readonly pocFirstNameInput: Locator;
  readonly pocLastNameInput: Locator;
  readonly pocEmailInput: Locator;
  readonly pocPhoneInput: Locator;
  readonly pocCompanyInput: Locator;
  
  // Coupon code
  readonly couponSection: Locator;
  readonly couponCodeInput: Locator;
  readonly applyCouponButton: Locator;
  readonly couponMessage: Locator;
  
  // Pricing and totals
  readonly pricingSection: Locator;
  readonly subtotalAmount: Locator;
  readonly discountAmount: Locator;
  readonly totalAmount: Locator;
  
  // Payment section
  readonly paymentSection: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryDateInput: Locator;
  readonly cvvInput: Locator;
  readonly nameOnCardInput: Locator;
  readonly billingAddressInput: Locator;
  
  // Form actions
  readonly submitButton: Locator;
  readonly backButton: Locator;
  readonly cancelButton: Locator;
  
  // Confirmation
  readonly confirmationSection: Locator;
  readonly confirmationNumber: Locator;
  readonly confirmationEmail: Locator;
  readonly calendarLink: Locator;
  
  // Error handling
  readonly errorMessages: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Product selection
    this.productSelection = page.locator('[data-testid="product-selection"], .product-selection');
    this.threeDayWorkshop = page.locator('[data-testid="3day-workshop"], input[value*="3day"], input[value*="3-day"]');
    this.fiveDayWorkshop = page.locator('[data-testid="5day-workshop"], input[value*="5day"], input[value*="5-day"]');
    this.consultingOption = page.locator('[data-testid="consulting"], input[value*="consulting"]');
    
    // Date selection
    this.dateSelection = page.locator('[data-testid="date-selection"], .date-selection');
    this.dateInput = page.locator('input[type="date"], [data-testid="date-input"]');
    this.availableDates = page.locator('[data-testid="available-dates"], .available-dates');
    
    // Attendee information
    this.attendeeSection = page.locator('[data-testid="attendee-section"], .attendee-section');
    this.addAttendeeButton = page.locator('[data-testid="add-attendee"], button:has-text("Add Attendee")');
    this.removeAttendeeButton = page.locator('[data-testid="remove-attendee"], button:has-text("Remove")');
    
    // Form fields (first attendee)
    this.firstNameInput = page.locator('input[name*="firstName"], [data-testid="first-name"]').first();
    this.lastNameInput = page.locator('input[name*="lastName"], [data-testid="last-name"]').first();
    this.emailInput = page.locator('input[name*="email"], [data-testid="email"]').first();
    this.phoneInput = page.locator('input[name*="phone"], [data-testid="phone"]').first();
    this.companyInput = page.locator('input[name*="company"], [data-testid="company"]').first();
    this.dietaryRestrictionsInput = page.locator('textarea[name*="dietary"], [data-testid="dietary"]').first();
    this.accessibilityNeedsInput = page.locator('textarea[name*="accessibility"], [data-testid="accessibility"]').first();
    
    // Point of contact
    this.pointOfContactSection = page.locator('[data-testid="point-of-contact"], .point-of-contact');
    this.pocFirstNameInput = page.locator('input[name*="poc"][name*="firstName"], [data-testid="poc-first-name"]');
    this.pocLastNameInput = page.locator('input[name*="poc"][name*="lastName"], [data-testid="poc-last-name"]');
    this.pocEmailInput = page.locator('input[name*="poc"][name*="email"], [data-testid="poc-email"]');
    this.pocPhoneInput = page.locator('input[name*="poc"][name*="phone"], [data-testid="poc-phone"]');
    this.pocCompanyInput = page.locator('input[name*="poc"][name*="company"], [data-testid="poc-company"]');
    
    // Coupon code
    this.couponSection = page.locator('[data-testid="coupon-section"], .coupon-section');
    this.couponCodeInput = page.locator('input[name*="coupon"], [data-testid="coupon-code"]');
    this.applyCouponButton = page.locator('[data-testid="apply-coupon"], button:has-text("Apply")');
    this.couponMessage = page.locator('[data-testid="coupon-message"], .coupon-message');
    
    // Pricing
    this.pricingSection = page.locator('[data-testid="pricing-section"], .pricing-section');
    this.subtotalAmount = page.locator('[data-testid="subtotal"], .subtotal');
    this.discountAmount = page.locator('[data-testid="discount"], .discount');
    this.totalAmount = page.locator('[data-testid="total"], .total-amount');
    
    // Payment
    this.paymentSection = page.locator('[data-testid="payment-section"], .payment-section');
    this.cardNumberInput = page.locator('input[name*="cardNumber"], [data-testid="card-number"]');
    this.expiryDateInput = page.locator('input[name*="expiry"], [data-testid="expiry"]');
    this.cvvInput = page.locator('input[name*="cvv"], [data-testid="cvv"]');
    this.nameOnCardInput = page.locator('input[name*="nameOnCard"], [data-testid="name-on-card"]');
    this.billingAddressInput = page.locator('input[name*="address"], [data-testid="billing-address"]');
    
    // Actions
    this.submitButton = page.locator('button[type="submit"], [data-testid="submit-booking"]');
    this.backButton = page.locator('button:has-text("Back"), [data-testid="back-button"]');
    this.cancelButton = page.locator('button:has-text("Cancel"), [data-testid="cancel-button"]');
    
    // Confirmation
    this.confirmationSection = page.locator('[data-testid="confirmation"], .confirmation-section');
    this.confirmationNumber = page.locator('[data-testid="confirmation-number"], .confirmation-number');
    this.confirmationEmail = page.locator('[data-testid="confirmation-email"], .confirmation-email');
    this.calendarLink = page.locator('[data-testid="calendar-link"], a[href*="calendar"]');
    
    // Errors
    this.errorMessages = page.locator('.error-message, [data-testid="error"]');
    this.fieldErrors = page.locator('.field-error, .error');
  }

  /**
   * Navigate to the booking page
   */
  async goto(): Promise<void> {
    await this.page.goto(TEST_CONFIG.URLS.BOOK);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the booking page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for either product selection or form to be visible
    await expect(this.productSelection.or(this.attendeeSection)).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Select a workshop product
   */
  async selectProduct(productType: '3day' | '5day' | 'consulting'): Promise<void> {
    switch (productType) {
      case '3day':
        await this.threeDayWorkshop.click();
        break;
      case '5day':
        await this.fiveDayWorkshop.click();
        break;
      case 'consulting':
        await this.consultingOption.click();
        break;
    }
    
    // Wait for form to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Select a date for the workshop
   */
  async selectDate(date: Date): Promise<void> {
    const dateString = date.toISOString().split('T')[0];
    await this.dateInput.fill(dateString);
    await this.page.waitForTimeout(500); // Allow for date validation
  }

  /**
   * Fill attendee information
   */
  async fillAttendeeInfo(attendee: TestAttendee, index: number = 0): Promise<void> {
    // If not the first attendee, we need to find the specific attendee section
    const attendeePrefix = index === 0 ? '' : `[${index}]`;
    
    const firstNameField = index === 0 ? this.firstNameInput : 
      this.page.locator(`input[name*="attendees${attendeePrefix}"][name*="firstName"]`);
    const lastNameField = index === 0 ? this.lastNameInput : 
      this.page.locator(`input[name*="attendees${attendeePrefix}"][name*="lastName"]`);
    const emailField = index === 0 ? this.emailInput : 
      this.page.locator(`input[name*="attendees${attendeePrefix}"][name*="email"]`);
    const phoneField = index === 0 ? this.phoneInput : 
      this.page.locator(`input[name*="attendees${attendeePrefix}"][name*="phone"]`);
    const companyField = index === 0 ? this.companyInput : 
      this.page.locator(`input[name*="attendees${attendeePrefix}"][name*="company"]`);

    await firstNameField.fill(attendee.firstName);
    await lastNameField.fill(attendee.lastName);
    await emailField.fill(attendee.email);
    await phoneField.fill(attendee.phone);
    await companyField.fill(attendee.company);

    if (attendee.dietaryRestrictions) {
      const dietaryField = index === 0 ? this.dietaryRestrictionsInput : 
        this.page.locator(`textarea[name*="attendees${attendeePrefix}"][name*="dietary"]`);
      await dietaryField.fill(attendee.dietaryRestrictions);
    }

    if (attendee.accessibilityNeeds) {
      const accessibilityField = index === 0 ? this.accessibilityNeedsInput : 
        this.page.locator(`textarea[name*="attendees${attendeePrefix}"][name*="accessibility"]`);
      await accessibilityField.fill(attendee.accessibilityNeeds);
    }
  }

  /**
   * Fill point of contact information
   */
  async fillPointOfContact(contact: TestAttendee): Promise<void> {
    await this.pocFirstNameInput.fill(contact.firstName);
    await this.pocLastNameInput.fill(contact.lastName);
    await this.pocEmailInput.fill(contact.email);
    await this.pocPhoneInput.fill(contact.phone);
    await this.pocCompanyInput.fill(contact.company);
  }

  /**
   * Apply a coupon code
   */
  async applyCoupon(couponCode: string): Promise<void> {
    await this.couponCodeInput.fill(couponCode);
    await this.applyCouponButton.click();
    
    // Wait for coupon to be processed
    await expect(this.couponMessage).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Verify coupon was applied successfully
   */
  async verifyCouponApplied(expectedDiscount?: string): Promise<void> {
    await expect(this.couponMessage).toContainText(/applied|success/i);
    
    if (expectedDiscount === '100%') {
      // For 100% discount, total should be $0
      await expect(this.totalAmount).toContainText(/\$0\.00|\$0/);
    }
    
    if (expectedDiscount) {
      await expect(this.discountAmount).toBeVisible();
    }
  }

  /**
   * Fill payment information (for non-free bookings)
   */
  async fillPaymentInfo(): Promise<void> {
    // Only fill payment if payment section is visible and total > 0
    if (await this.paymentSection.isVisible()) {
      const totalText = await this.totalAmount.textContent();
      if (!totalText?.includes('$0')) {
        await this.cardNumberInput.fill('4242424242424242'); // Test card
        await this.expiryDateInput.fill('12/25');
        await this.cvvInput.fill('123');
        await this.nameOnCardInput.fill('Test User');
        await this.billingAddressInput.fill('123 Test St');
      }
    }
  }

  /**
   * Submit the booking
   */
  async submitBooking(): Promise<void> {
    await this.submitButton.click();
    
    // Wait for either confirmation or error
    await Promise.race([
      this.confirmationSection.waitFor({ timeout: TEST_CONFIG.TIMEOUTS.LONG }),
      this.errorMessages.first().waitFor({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM })
    ]);
  }

  /**
   * Verify booking confirmation
   */
  async verifyBookingConfirmation(): Promise<string> {
    await expect(this.confirmationSection).toBeVisible();
    await expect(this.confirmationNumber).toBeVisible();
    
    const confirmationNum = await this.confirmationNumber.textContent();
    expect(confirmationNum).toBeTruthy();
    
    // Verify confirmation email is displayed
    await expect(this.confirmationEmail).toBeVisible();
    
    return confirmationNum || '';
  }

  /**
   * Complete full booking flow
   */
  async completeBooking(booking: TestBooking): Promise<string> {
    // Select product based on productId
    let productType: '3day' | '5day' | 'consulting' = '3day';
    if (booking.productId.includes('5day')) productType = '5day';
    if (booking.productId.includes('consulting')) productType = 'consulting';
    
    await this.selectProduct(productType);
    await this.selectDate(booking.startDate);
    
    // Fill attendee information
    for (let i = 0; i < booking.attendees.length; i++) {
      if (i > 0) {
        // Add additional attendee
        await this.addAttendeeButton.click();
        await this.page.waitForTimeout(500);
      }
      await this.fillAttendeeInfo(booking.attendees[i], i);
    }
    
    // Use first attendee as point of contact
    await this.fillPointOfContact(booking.attendees[0]);
    
    // Apply coupon if provided
    if (booking.couponCode) {
      await this.applyCoupon(booking.couponCode);
      await this.verifyCouponApplied('100%');
    }
    
    // Fill payment info (will be skipped if total is $0)
    await this.fillPaymentInfo();
    
    // Submit booking
    await this.submitBooking();
    
    // Verify confirmation
    return await this.verifyBookingConfirmation();
  }

  /**
   * Verify form validation errors
   */
  async verifyValidationErrors(): Promise<void> {
    await expect(this.fieldErrors.first()).toBeVisible();
  }

  /**
   * Get current total amount
   */
  async getTotalAmount(): Promise<string> {
    return await this.totalAmount.textContent() || '';
  }

  /**
   * Verify pricing calculation
   */
  async verifyPricing(expectedSubtotal: number, expectedDiscount: number = 0): Promise<void> {
    const subtotalText = await this.subtotalAmount.textContent();
    expect(subtotalText).toContain(expectedSubtotal.toString());
    
    if (expectedDiscount > 0) {
      const discountText = await this.discountAmount.textContent();
      expect(discountText).toContain(expectedDiscount.toString());
    }
    
    const expectedTotal = expectedSubtotal - expectedDiscount;
    const totalText = await this.totalAmount.textContent();
    expect(totalText).toContain(expectedTotal.toString());
  }
} 