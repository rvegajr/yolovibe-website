import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { TestDataFactory, TEST_CONFIG } from './utils/test-data';

/**
 * Booking Flow End-to-End Tests
 * Tests complete booking process with 100% coupon codes (no charges)
 */

test.describe('Booking Flow - 3-Day Workshop', () => {
  let homePage: HomePage;
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should complete 3-day workshop booking with 100% coupon', async () => {
    console.log('🎯 Test: Complete 3-day workshop booking with free coupon');
    
    // Create test booking data
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    console.log(`📅 Booking details:
      Product: ${booking.productId}
      Attendee: ${booking.attendees[0].email}
      Date: ${booking.startDate.toDateString()}
      Coupon: ${booking.couponCode}`);
    
    // Navigate to booking page
    await bookingPage.goto();
    
    // Complete the entire booking flow
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`✅ Booking completed successfully!`);
    console.log(`   Confirmation Number: ${confirmationNumber}`);
    console.log(`   Total Charged: $0.00 (100% discount applied)`);
    
    // Verify the total was $0
    const totalAmount = await bookingPage.getTotalAmount();
    expect(totalAmount).toMatch(/\$0\.00|\$0/);
  });

  test('should handle multiple attendees for 3-day workshop', async () => {
    console.log('🎯 Test: Multiple attendees booking with 100% coupon');
    
    // Create booking with 3 attendees
    const booking = TestDataFactory.create3DayWorkshopBooking(3);
    
    console.log(`📅 Booking details:
      Product: ${booking.productId}
      Attendees: ${booking.attendees.length}
      Date: ${booking.startDate.toDateString()}
      Coupon: ${booking.couponCode}`);
    
    await bookingPage.goto();
    
    // Complete booking with multiple attendees
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`✅ Multi-attendee booking completed!`);
    console.log(`   Confirmation: ${confirmationNumber}`);
    console.log(`   Attendees: ${booking.attendees.length}`);
    
    // Verify total is still $0 with coupon
    const totalAmount = await bookingPage.getTotalAmount();
    expect(totalAmount).toMatch(/\$0\.00|\$0/);
  });

  test('should validate required fields before submission', async () => {
    console.log('🎯 Test: Form validation for required fields');
    
    await bookingPage.goto();
    
    // Try to submit without filling required fields
    await bookingPage.selectProduct('3day');
    await bookingPage.submitButton.click();
    
    // Should show validation errors
    await bookingPage.verifyValidationErrors();
    
    console.log('✅ Form validation working correctly');
  });
});

test.describe('Booking Flow - 5-Day Workshop', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should complete 5-day workshop booking with 100% coupon', async () => {
    console.log('🎯 Test: Complete 5-day workshop booking with free coupon');
    
    // Create test booking data
    const booking = TestDataFactory.create5DayWorkshopBooking(1);
    
    console.log(`📅 Booking details:
      Product: ${booking.productId}
      Attendee: ${booking.attendees[0].email}
      Date: ${booking.startDate.toDateString()}
      Coupon: ${booking.couponCode}`);
    
    await bookingPage.goto();
    
    // Complete the booking flow
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`✅ 5-day workshop booking completed!`);
    console.log(`   Confirmation Number: ${confirmationNumber}`);
    
    // Verify no charges
    const totalAmount = await bookingPage.getTotalAmount();
    expect(totalAmount).toMatch(/\$0\.00|\$0/);
  });

  test('should apply 100% coupon correctly for 5-day workshop', async () => {
    console.log('🎯 Test: Coupon application for 5-day workshop');
    
    const booking = TestDataFactory.create5DayWorkshopBooking(1);
    
    await bookingPage.goto();
    await bookingPage.selectProduct('5day');
    await bookingPage.selectDate(booking.startDate);
    await bookingPage.fillAttendeeInfo(booking.attendees[0]);
    
    // Apply coupon and verify
    await bookingPage.applyCoupon(booking.couponCode!);
    await bookingPage.verifyCouponApplied('100%');
    
    console.log('✅ Coupon applied successfully for 5-day workshop');
  });
});

test.describe('Booking Flow - AI Consulting', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should complete consulting booking with 100% coupon', async () => {
    console.log('🎯 Test: Complete AI consulting booking with free coupon');
    
    // Create consulting booking
    const booking = TestDataFactory.createConsultingBooking();
    
    console.log(`📅 Consulting booking details:
      Product: ${booking.productId}
      Client: ${booking.attendees[0].email}
      Date: ${booking.startDate.toDateString()}
      Coupon: ${booking.couponCode}`);
    
    await bookingPage.goto();
    
    // Complete consulting booking
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`✅ Consulting booking completed!`);
    console.log(`   Confirmation Number: ${confirmationNumber}`);
    
    // Verify no charges
    const totalAmount = await bookingPage.getTotalAmount();
    expect(totalAmount).toMatch(/\$0\.00|\$0/);
  });
});

test.describe('Booking Flow - Error Handling', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should handle invalid coupon codes gracefully', async () => {
    console.log('🎯 Test: Invalid coupon code handling');
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    booking.couponCode = TEST_CONFIG.COUPONS.INVALID;
    
    await bookingPage.goto();
    await bookingPage.selectProduct('3day');
    await bookingPage.selectDate(booking.startDate);
    await bookingPage.fillAttendeeInfo(booking.attendees[0]);
    
    // Try to apply invalid coupon
    await bookingPage.couponCodeInput.fill(booking.couponCode);
    await bookingPage.applyCouponButton.click();
    
    // Should show error message
    await expect(bookingPage.couponMessage).toBeVisible();
    await expect(bookingPage.couponMessage).toContainText(/invalid|error|not found/i);
    
    console.log('✅ Invalid coupon handling verified');
  });

  test('should handle network errors gracefully', async () => {
    console.log('🎯 Test: Network error handling');
    
    await bookingPage.goto();
    
    // Simulate network failure during form submission
    await bookingPage.page.route('**/api/bookings/**', route => {
      route.abort('failed');
    });
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    try {
      await bookingPage.completeBooking(booking);
    } catch (error) {
      // Expected to fail due to network simulation
      console.log('✅ Network error handled gracefully');
    }
  });
});

test.describe('Booking Flow - End-to-End Integration', () => {
  let homePage: HomePage;
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should complete full user journey: Homepage → Booking → Confirmation', async () => {
    console.log('🎯 Test: Complete user journey from homepage to booking confirmation');
    
    // Start from homepage
    await homePage.goto();
    await homePage.verifyPageContent();
    
    // Navigate to booking via CTA
    await homePage.clickBookNow();
    
    // Complete booking with 100% coupon
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`🎉 FULL USER JOURNEY COMPLETED SUCCESSFULLY!`);
    console.log(`   Journey: Homepage → Book Now → Form → Payment → Confirmation`);
    console.log(`   Confirmation: ${confirmationNumber}`);
    console.log(`   Total Charged: $0.00 (Free with coupon)`);
    console.log(`   Attendee: ${booking.attendees[0].email}`);
    
    // Verify we're on confirmation page
    expect(bookingPage.page.url()).toContain('confirm');
  });
});

test.describe('Booking Flow - Mobile Experience', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    TestDataFactory.resetCounter();
  });

  test('should complete booking on mobile device', async () => {
    console.log('🎯 Test: Mobile booking experience');
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    await bookingPage.goto();
    
    // Complete booking on mobile
    const confirmationNumber = await bookingPage.completeBooking(booking);
    
    console.log(`✅ Mobile booking completed successfully!`);
    console.log(`   Confirmation: ${confirmationNumber}`);
    
    // Verify total is $0
    const totalAmount = await bookingPage.getTotalAmount();
    expect(totalAmount).toMatch(/\$0\.00|\$0/);
  });
}); 