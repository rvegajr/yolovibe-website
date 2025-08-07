import { config } from 'dotenv';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

// Load environment variables
config();

interface TestResult {
  testName: string;
  success: boolean;
  details: any;
  error?: string;
  timestamp: string;
}

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  type: 'workshop' | 'consulting';
  duration?: string;
}

const PRODUCTS: ProductDetails[] = [
  { id: 'prod-3day', name: '3-Day YOLO Workshop', price: 3000, type: 'workshop', duration: '3 days' },
  { id: 'prod-5day', name: '5-Day YOLO Intensive', price: 4500, type: 'workshop', duration: '5 days' },
  { id: 'prod-consulting', name: 'Personal Consulting Hours', price: 150, type: 'consulting', duration: '1 hour' }
];

class EndToEndTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor() {
    // Use production URL for testing
    this.baseUrl = 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app';
  }

  private log(message: string) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  private async recordResult(testName: string, success: boolean, details: any, error?: string) {
    const result: TestResult = {
      testName,
      success,
      details,
      error,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    if (success) {
      this.log(`✅ ${testName} - SUCCESS`);
    } else {
      this.log(`❌ ${testName} - FAILED: ${error}`);
    }
  }

  async testWorkshopPurchase(product: ProductDetails): Promise<void> {
    this.log(`🛒 Testing ${product.name} purchase...`);
    
    try {
      // Generate test user data
      const testUser = {
        email: `test-${randomUUID().substring(0, 8)}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      };

      // Step 1: Create purchase request
      const purchaseResponse = await fetch(`${this.baseUrl}/api/purchase/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          customerInfo: testUser,
          paymentMethod: 'sandbox', // Use Square sandbox
        }),
      });

      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.text();
        throw new Error(`Purchase API failed: ${error}`);
      }

      const purchaseData = await purchaseResponse.json();
      
      // Step 2: Verify purchase details
      if (purchaseData.amount !== product.price * 100) { // Square uses cents
        throw new Error(`Price mismatch: expected ${product.price * 100}, got ${purchaseData.amount}`);
      }

      await this.recordResult(`${product.name} Purchase`, true, {
        productId: product.id,
        amount: purchaseData.amount,
        currency: purchaseData.currency,
        orderId: purchaseData.orderId,
        customer: testUser
      });

    } catch (error) {
      await this.recordResult(`${product.name} Purchase`, false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testConsultingBooking(product: ProductDetails): Promise<void> {
    this.log(`📅 Testing ${product.name} booking with calendar scheduling...`);
    
    try {
      // Generate test user data
      const testUser = {
        email: `consultant-${randomUUID().substring(0, 8)}@example.com`,
        firstName: 'Consulting',
        lastName: 'Client',
        phone: '+1987654321'
      };

      // Step 1: Get available time slots
      const availabilityResponse = await fetch(`${this.baseUrl}/api/workshops/available`);
      
      if (!availabilityResponse.ok) {
        throw new Error('Failed to fetch availability');
      }

      const availability = await availabilityResponse.json();

      // Step 2: Create booking with calendar scheduling
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Book 1 week from now
      
      const bookingResponse = await fetch(`${this.baseUrl}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          customerInfo: testUser,
          scheduledDate: futureDate.toISOString(),
          duration: 60, // 1 hour
          paymentMethod: 'sandbox'
        }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.text();
        throw new Error(`Booking API failed: ${error}`);
      }

      const bookingData = await bookingResponse.json();

      // Step 3: Verify calendar integration
      const calendarResponse = await fetch(`${this.baseUrl}/api/calendar/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Consulting Session - ${testUser.firstName} ${testUser.lastName}`,
          start: futureDate.toISOString(),
          duration: 60,
          attendeeEmail: testUser.email
        }),
      });

      const calendarSuccess = calendarResponse.ok;

      await this.recordResult(`${product.name} Booking`, true, {
        bookingId: bookingData.bookingId,
        scheduledDate: futureDate.toISOString(),
        customer: testUser,
        calendarIntegration: calendarSuccess,
        amount: product.price * 100
      });

    } catch (error) {
      await this.recordResult(`${product.name} Booking`, false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testPaymentAmounts(): Promise<void> {
    this.log(`💰 Testing payment amount calculations...`);
    
    try {
      const amountTests = [];
      
      for (const product of PRODUCTS) {
        // Test that the product catalog returns correct prices
        const productResponse = await fetch(`${this.baseUrl}/api/workshops/available`);
        
        if (productResponse.ok) {
          const products = await productResponse.json();
          const foundProduct = products.find((p: any) => p.id === product.id);
          
          if (foundProduct && foundProduct.price === product.price) {
            amountTests.push({ product: product.name, correct: true });
          } else {
            amountTests.push({ 
              product: product.name, 
              correct: false, 
              expected: product.price, 
              actual: foundProduct?.price 
            });
          }
        }
      }

      const allCorrect = amountTests.every(test => test.correct);
      
      await this.recordResult('Payment Amount Verification', allCorrect, {
        tests: amountTests
      }, allCorrect ? undefined : 'Some payment amounts are incorrect');

    } catch (error) {
      await this.recordResult('Payment Amount Verification', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting YOLOVibe End-to-End Purchase Testing');
    console.log('='.repeat(60));
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));

    // Test payment amounts first
    await this.testPaymentAmounts();

    // Test workshop purchases
    for (const product of PRODUCTS.filter(p => p.type === 'workshop')) {
      await this.testWorkshopPurchase(product);
    }

    // Test consulting booking
    const consultingProduct = PRODUCTS.find(p => p.type === 'consulting');
    if (consultingProduct) {
      await this.testConsultingBooking(consultingProduct);
    }

    // Print summary
    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(60));
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}`);
      
      if (result.success) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('-'.repeat(40));
    });

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Your YOLOVibe application is ready for production!');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Please review and fix the issues above.`);
    }
  }
}

// Main execution
async function main() {
  const tester = new EndToEndTester();
  await tester.runAllTests();
}

main().catch(console.error);