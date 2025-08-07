import { randomUUID } from 'crypto';

/**
 * Production Test Data Factory
 * Generates realistic test data for production testing scenarios
 */

export interface ProductionTestUser {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
}

export interface ProductionBooking {
  productId: string;
  productName: string;
  price: number;
  user: ProductionTestUser;
  scheduledDate?: Date;
  duration?: number; // in hours
  notes?: string;
}

export class ProductionTestDataFactory {
  private static counter = 0;

  static resetCounter(): void {
    this.counter = 0;
  }

  /**
   * Generate a unique test user for production testing
   */
  static generateTestUser(prefix: string = 'test'): ProductionTestUser {
    this.counter++;
    const uniqueId = randomUUID().substring(0, 8);
    const timestamp = Date.now().toString().slice(-6);
    
    return {
      email: `${prefix}-${uniqueId}-${timestamp}@example.com`,
      firstName: `Test${this.counter}`,
      lastName: `User${uniqueId.substring(0, 4)}`,
      phone: `+1555${this.counter.toString().padStart(3, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      company: `Test Company ${this.counter}`
    };
  }

  /**
   * Generate 3-day workshop booking data
   */
  static create3DayWorkshopBooking(): ProductionBooking {
    const user = this.generateTestUser('3day-workshop');
    
    return {
      productId: 'prod-3day',
      productName: '3-Day YOLO Workshop',
      price: 3000,
      user,
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      duration: 24, // 3 days * 8 hours
      notes: 'Production test booking for 3-day workshop'
    };
  }

  /**
   * Generate 5-day workshop booking data
   */
  static create5DayWorkshopBooking(): ProductionBooking {
    const user = this.generateTestUser('5day-workshop');
    
    return {
      productId: 'prod-5day', 
      productName: '5-Day YOLO Intensive',
      price: 4500,
      user,
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      duration: 40, // 5 days * 8 hours
      notes: 'Production test booking for 5-day intensive workshop'
    };
  }

  /**
   * Generate consulting hours booking data
   */
  static createConsultingBooking(hours: number = 1): ProductionBooking {
    const user = this.generateTestUser('consulting');
    
    return {
      productId: 'prod-consulting',
      productName: 'Personal Consulting Hours',
      price: 150 * hours,
      user,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: hours,
      notes: `Production test booking for ${hours} hour(s) of consulting`
    };
  }

  /**
   * Generate Square test card data for sandbox testing
   */
  static getSquareTestCards() {
    return {
      visa: {
        number: '4111 1111 1111 1111',
        cvv: '123',
        expiry: '12/25',
        name: 'Test User'
      },
      visaDeclined: {
        number: '4000 0000 0000 0002',
        cvv: '123', 
        expiry: '12/25',
        name: 'Declined Test'
      },
      mastercard: {
        number: '5555 5555 5555 4444',
        cvv: '123',
        expiry: '12/25',
        name: 'Test User'
      }
    };
  }

  /**
   * Generate test scenarios for comprehensive testing
   */
  static getTestScenarios() {
    return [
      {
        name: '3-Day Workshop - Standard Flow',
        booking: this.create3DayWorkshopBooking(),
        paymentCard: this.getSquareTestCards().visa,
        expectedOutcome: 'success'
      },
      {
        name: '5-Day Workshop - Standard Flow',
        booking: this.create5DayWorkshopBooking(),
        paymentCard: this.getSquareTestCards().mastercard,
        expectedOutcome: 'success'
      },
      {
        name: 'Consulting - 1 Hour',
        booking: this.createConsultingBooking(1),
        paymentCard: this.getSquareTestCards().visa,
        expectedOutcome: 'success'
      },
      {
        name: 'Consulting - 2 Hours',
        booking: this.createConsultingBooking(2),
        paymentCard: this.getSquareTestCards().visa,
        expectedOutcome: 'success'
      },
      {
        name: '3-Day Workshop - Declined Payment',
        booking: this.create3DayWorkshopBooking(),
        paymentCard: this.getSquareTestCards().visaDeclined,
        expectedOutcome: 'payment_declined'
      }
    ];
  }
}

/**
 * Production Test Configuration
 */
export const PRODUCTION_TEST_CONFIG = {
  URLS: {
    PRODUCTION: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app',
    HOMEPAGE: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app',
    BOOKING: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app/book',
    PRICING: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app/pricing'
  },
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    PAYMENT: 60000
  },
  PRODUCTS: {
    '3DAY_WORKSHOP': {
      id: 'prod-3day',
      name: '3-Day YOLO Workshop',
      price: 3000,
      currency: 'USD'
    },
    '5DAY_WORKSHOP': {
      id: 'prod-5day',
      name: '5-Day YOLO Intensive', 
      price: 4500,
      currency: 'USD'
    },
    'CONSULTING': {
      id: 'prod-consulting',
      name: 'Personal Consulting Hours',
      price: 150,
      currency: 'USD'
    }
  },
  EMAIL: {
    TEST_RECIPIENT: 'test-recipient@example.com',
    CONFIRMATION_TIMEOUT: 30000
  },
  SQUARE: {
    ENVIRONMENT: 'sandbox',
    TEST_CARDS: {
      VISA_SUCCESS: '4111111111111111',
      VISA_DECLINE: '4000000000000002',
      MASTERCARD_SUCCESS: '5555555555554444'
    }
  }
};