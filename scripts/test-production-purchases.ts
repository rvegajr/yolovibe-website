import { config } from 'dotenv';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

// Load environment variables
config();

interface TestUser {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface TestResult {
  testName: string;
  success: boolean;
  details: any;
  error?: string;
  timestamp: string;
}

class ProductionPurchaseTester {
  private baseUrl: string = 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app';
  private results: TestResult[] = [];

  private log(message: string) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  private generateTestUser(prefix: string = 'test'): TestUser {
    const id = randomUUID().substring(0, 8);
    return {
      email: `${prefix}-${id}@example.com`,
      firstName: `Test${id.substring(0, 4)}`,
      lastName: 'User',
      phone: '+1234567890'
    };
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

  async test3DayWorkshopPurchase(): Promise<void> {
    this.log('🛒 Testing 3-Day Workshop Purchase...');
    
    const testUser = this.generateTestUser('workshop3day');
    
    try {
      // Test the purchase API endpoint
      const response = await fetch(`${this.baseUrl}/api/purchase/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'prod-3day',
          customerInfo: testUser,
          paymentMethod: 'square_sandbox'
        }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        await this.recordResult('3-Day Workshop Purchase', true, {
          productId: 'prod-3day',
          expectedPrice: 300000, // $3000 in cents
          actualAmount: data.amount,
          customer: testUser,
          orderId: data.orderId || 'N/A'
        });
      } else {
        // Even if it fails, record what we learned
        await this.recordResult('3-Day Workshop Purchase', false, {
          productId: 'prod-3day',
          responseStatus: response.status,
          responseBody: responseText
        }, `API returned ${response.status}: ${responseText}`);
      }

    } catch (error) {
      await this.recordResult('3-Day Workshop Purchase', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async test5DayWorkshopPurchase(): Promise<void> {
    this.log('🛒 Testing 5-Day Workshop Purchase...');
    
    const testUser = this.generateTestUser('workshop5day');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/purchase/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'prod-5day',
          customerInfo: testUser,
          paymentMethod: 'square_sandbox'
        }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        await this.recordResult('5-Day Workshop Purchase', true, {
          productId: 'prod-5day',
          expectedPrice: 450000, // $4500 in cents
          actualAmount: data.amount,
          customer: testUser,
          orderId: data.orderId || 'N/A'
        });
      } else {
        await this.recordResult('5-Day Workshop Purchase', false, {
          productId: 'prod-5day',
          responseStatus: response.status,
          responseBody: responseText
        }, `API returned ${response.status}: ${responseText}`);
      }

    } catch (error) {
      await this.recordResult('5-Day Workshop Purchase', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testConsultingBooking(): Promise<void> {
    this.log('📅 Testing Consulting Hours Booking...');
    
    const testUser = this.generateTestUser('consulting');
    
    try {
      // First try to book consulting hours
      const response = await fetch(`${this.baseUrl}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'prod-consulting',
          customerInfo: testUser,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          duration: 60, // 1 hour
          paymentMethod: 'square_sandbox'
        }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        
        // Test calendar integration
        const calendarResponse = await fetch(`${this.baseUrl}/api/calendar/events/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `Consulting Session - ${testUser.firstName} ${testUser.lastName}`,
            start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            attendeeEmail: testUser.email
          }),
        });

        await this.recordResult('Consulting Hours Booking', true, {
          productId: 'prod-consulting',
          expectedPrice: 15000, // $150 in cents
          bookingId: data.bookingId || 'N/A',
          customer: testUser,
          calendarIntegration: calendarResponse.ok,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        await this.recordResult('Consulting Hours Booking', false, {
          productId: 'prod-consulting',
          responseStatus: response.status,
          responseBody: responseText
        }, `Booking API returned ${response.status}: ${responseText}`);
      }

    } catch (error) {
      await this.recordResult('Consulting Hours Booking', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testSquarePaymentIntegration(): Promise<void> {
    this.log('💳 Testing Square Payment Integration...');
    
    try {
      // Test Square sandbox environment
      const squareResponse = await fetch(`${this.baseUrl}/api/purchase/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'prod-consulting',
          customerInfo: this.generateTestUser('payment'),
          paymentMethod: 'square_sandbox',
          testMode: true
        }),
      });

      const responseText = await squareResponse.text();
      
      if (squareResponse.ok) {
        const data = JSON.parse(responseText);
        await this.recordResult('Square Payment Integration', true, {
          environment: 'sandbox',
          paymentProcessed: data.paymentProcessed || false,
          amount: data.amount,
          currency: data.currency || 'USD'
        });
      } else {
        await this.recordResult('Square Payment Integration', false, {
          responseStatus: squareResponse.status,
          responseBody: responseText
        }, `Square API returned ${squareResponse.status}`);
      }

    } catch (error) {
      await this.recordResult('Square Payment Integration', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testProductCatalog(): Promise<void> {
    this.log('📋 Testing Product Catalog...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/workshops/available`);
      
      if (response.ok) {
        const products = await response.json();
        
        const expectedProducts = [
          { id: 'prod-3day', price: 3000 },
          { id: 'prod-5day', price: 4500 },
          { id: 'prod-consulting', price: 150 }
        ];

        const productValidation = expectedProducts.map(expected => {
          const found = products.find((p: any) => p.id === expected.id);
          return {
            productId: expected.id,
            found: !!found,
            priceCorrect: found ? found.price === expected.price : false,
            expectedPrice: expected.price,
            actualPrice: found?.price
          };
        });

        const allValid = productValidation.every(p => p.found && p.priceCorrect);

        await this.recordResult('Product Catalog', allValid, {
          totalProducts: products.length,
          productValidation
        }, allValid ? undefined : 'Some products missing or have incorrect prices');

      } else {
        await this.recordResult('Product Catalog', false, {
          responseStatus: response.status
        }, `Catalog API returned ${response.status}`);
      }

    } catch (error) {
      await this.recordResult('Product Catalog', false, {}, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 YOLOVibe Production Purchase Testing');
    console.log('='.repeat(60));
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    // Run all test cases
    await this.testProductCatalog();
    await this.test3DayWorkshopPurchase();
    await this.test5DayWorkshopPurchase();
    await this.testConsultingBooking();
    await this.testSquarePaymentIntegration();

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 PRODUCTION TESTING RESULTS');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (successful > 0) {
      console.log('\n🎉 Successful Tests:');
      console.log('-'.repeat(40));
      this.results.filter(r => r.success).forEach(result => {
        console.log(`✅ ${result.testName}`);
        console.log(`   ${JSON.stringify(result.details, null, 2)}`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('-'.repeat(40));
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`❌ ${result.testName}`);
        console.log(`   Error: ${result.error}`);
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    if (failed === 0) {
      console.log('🎉 ALL PRODUCTION TESTS PASSED!');
      console.log('Your YOLOVibe application is ready for customers!');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Review the issues above.`);
      console.log('Some functionality may need attention before going live.');
    }
  }
}

// Main execution
async function main() {
  const tester = new ProductionPurchaseTester();
  await tester.runAllTests();
}

main().catch(console.error);