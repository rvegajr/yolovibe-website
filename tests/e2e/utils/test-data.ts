/**
 * Test Data Utilities
 * Provides consistent test data for end-to-end testing
 */

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

export interface TestAttendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

export interface TestBooking {
  productId: string;
  attendees: TestAttendee[];
  couponCode?: string;
  startDate: Date;
}

export class TestDataFactory {
  private static counter = 0;

  /**
   * Generate a unique test user
   */
  static createTestUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = ++this.counter;
    const timestamp = Date.now();
    
    return {
      firstName: `Test${id}`,
      lastName: `User${timestamp}`,
      email: `test.user.${id}.${timestamp}@example.com`,
      phone: `555-0${String(100 + id).padStart(3, '0')}`,
      company: `Test Company ${id}`,
      password: 'TestPassword123!',
      ...overrides
    };
  }

  /**
   * Generate a test attendee
   */
  static createTestAttendee(overrides: Partial<TestAttendee> = {}): TestAttendee {
    const id = ++this.counter;
    const timestamp = Date.now();
    
    return {
      firstName: `Attendee${id}`,
      lastName: `Test${timestamp}`,
      email: `attendee.${id}.${timestamp}@example.com`,
      phone: `555-1${String(100 + id).padStart(3, '0')}`,
      company: `Attendee Company ${id}`,
      ...overrides
    };
  }

  /**
   * Generate a test booking for 3-day workshop
   */
  static create3DayWorkshopBooking(attendeeCount: number = 1, overrides: Partial<TestBooking> = {}): TestBooking {
    const attendees = Array.from({ length: attendeeCount }, () => this.createTestAttendee());
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30); // 30 days from now
    
    return {
      productId: '3day-workshop',
      attendees,
      couponCode: 'E2E_TEST_100', // 100% discount for testing
      startDate,
      ...overrides
    };
  }

  /**
   * Generate a test booking for 5-day workshop
   */
  static create5DayWorkshopBooking(attendeeCount: number = 1, overrides: Partial<TestBooking> = {}): TestBooking {
    const attendees = Array.from({ length: attendeeCount }, () => this.createTestAttendee());
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 45); // 45 days from now
    
    return {
      productId: '5day-workshop',
      attendees,
      couponCode: 'E2E_TEST_100', // 100% discount for testing
      startDate,
      ...overrides
    };
  }

  /**
   * Generate a test booking for AI consulting
   */
  static createConsultingBooking(overrides: Partial<TestBooking> = {}): TestBooking {
    const attendees = [this.createTestAttendee()];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14); // 14 days from now
    
    return {
      productId: 'ai-consulting',
      attendees,
      couponCode: 'E2E_TEST_100', // 100% discount for testing
      startDate,
      ...overrides
    };
  }

  /**
   * Generate admin test user
   */
  static createAdminUser(): TestUser {
    return {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@yolovibe.test',
      phone: '555-0001',
      company: 'YOLOVibe',
      password: 'AdminPassword123!'
    };
  }

  /**
   * Reset counter for consistent test runs
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  // Coupon codes for testing
  COUPONS: {
    FREE_100: 'E2E_TEST_100',
    DISCOUNT_50: 'E2E_TEST_50',
    INVALID: 'INVALID_COUPON'
  },
  
  // Timeouts
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    VERY_LONG: 60000
  },
  
  // URLs
  URLS: {
    HOME: '/',
    BOOK: '/book',
    PRICING: '/pricing',
    ABOUT: '/about',
    CONTACT: '/contact',
    LOGIN: '/login',
    ADMIN: '/admin'
  },
  
  // Test environment
  ENV: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:4321',
    TEST_EMAIL_DOMAIN: 'example.com'
  }
};

/**
 * Utility functions for test data validation
 */
export class TestDataValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate required fields for user
   */
  static validateUser(user: TestUser): string[] {
    const errors: string[] = [];
    
    if (!user.firstName?.trim()) errors.push('First name is required');
    if (!user.lastName?.trim()) errors.push('Last name is required');
    if (!user.email?.trim()) errors.push('Email is required');
    if (!this.isValidEmail(user.email)) errors.push('Email format is invalid');
    if (!user.phone?.trim()) errors.push('Phone is required');
    
    return errors;
  }

  /**
   * Validate booking data
   */
  static validateBooking(booking: TestBooking): string[] {
    const errors: string[] = [];
    
    if (!booking.productId?.trim()) errors.push('Product ID is required');
    if (!booking.attendees?.length) errors.push('At least one attendee is required');
    if (!booking.startDate) errors.push('Start date is required');
    
    // Validate each attendee
    booking.attendees?.forEach((attendee, index) => {
      const attendeeErrors = this.validateUser(attendee as TestUser);
      attendeeErrors.forEach(error => errors.push(`Attendee ${index + 1}: ${error}`));
    });
    
    return errors;
  }
} 