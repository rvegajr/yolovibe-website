#!/usr/bin/env npx tsx

/**
 * API Integration Test for YOLOVibe Registration System
 * 
 * Tests all authentication and booking API endpoints to ensure:
 * - Database initialization works correctly
 * - API routes respond with proper JSON
 * - Authentication flows work end-to-end
 * - Error handling is working properly
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  response?: any;
  duration: number;
}

class APIIntegrationTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:4321') {
    this.baseUrl = baseUrl;
  }

  /**
   * Run all API integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Integration Tests');
    console.log(`📡 Base URL: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    // Check if server is running
    const serverRunning = await this.checkServerHealth();
    if (!serverRunning) {
      console.log('❌ Astro dev server is not running');
      console.log('💡 Please start the server with: npm run dev');
      process.exit(1);
    }

    // Test authentication endpoints
    await this.testUserRegistration();
    await this.testUserLogin();
    await this.testSessionValidation();
    await this.testUserLogout();

    // Test workshop endpoints
    await this.testAvailableWorkshops();
    await this.testBookingCreation();

    // Print summary
    this.printSummary();
  }

  /**
   * Check if the Astro dev server is running
   */
  private async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test user registration endpoint
   */
  private async testUserRegistration(): Promise<void> {
    const testName = 'POST /api/auth/register';
    const startTime = Date.now();

    try {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company'
      };

      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.success) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - User registered successfully (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - ${data.error || `HTTP ${response.status}: ${response.statusText}`} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Test user login endpoint
   */
  private async testUserLogin(): Promise<void> {
    const testName = 'POST /api/auth/login';
    const startTime = Date.now();

    try {
      // First register a user to login with
      const testUser = {
        email: `login-test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Login',
        lastName: 'Test'
      };

      await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      // Now test login
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const data = await loginResponse.json();
      const duration = Date.now() - startTime;

      if (loginResponse.ok && data.success) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - User logged in successfully (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: data.error || `HTTP ${loginResponse.status}: ${loginResponse.statusText}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - ${data.error || `HTTP ${loginResponse.status}: ${loginResponse.statusText}`} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Test session validation endpoint
   */
  private async testSessionValidation(): Promise<void> {
    const testName = 'GET /api/auth/validate';
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      // We expect this to fail with invalid token
      if (response.status === 401 && !data.success) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - Invalid token correctly rejected (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: `Expected 401 for invalid token, got ${response.status}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - Expected 401 for invalid token, got ${response.status} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Test user logout endpoint
   */
  private async testUserLogout(): Promise<void> {
    const testName = 'POST /api/auth/logout';
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-session-token'
        }
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      // We expect this to fail with invalid token (which is correct behavior)
      if (response.status === 401 || (data.error && data.error.includes('Invalid session token'))) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - Invalid token correctly rejected (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - ${data.error || `HTTP ${response.status}: ${response.statusText}`} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Test available workshops endpoint
   */
  private async testAvailableWorkshops(): Promise<void> {
    const testName = 'GET /api/workshops/available';
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/workshops/available`);
      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.success && Array.isArray(data.data)) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - Retrieved ${data.data.length} workshops (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: `Expected success response with data array, got ${typeof data}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - Expected success response with data array, got ${typeof data} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Test booking creation endpoint
   */
  private async testBookingCreation(): Promise<void> {
    const testName = 'POST /api/bookings/create';
    const startTime = Date.now();

    try {
      const testBooking = {
        productId: 'prod-3day',
        startDate: '2024-07-15',
        attendeeCount: 1,
        attendees: [
          {
            firstName: 'Test',
            lastName: 'Attendee',
            email: `attendee-${Date.now()}@example.com`,
            company: 'Test Company'
          }
        ],
        pointOfContact: {
          firstName: 'Test',
          lastName: 'Contact',
          email: `contact-${Date.now()}@example.com`,
          phone: '555-0123',
          company: 'Test Company'
        },
        paymentMethod: 'credit_card'
      };

      const response = await fetch(`${this.baseUrl}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBooking)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.success) {
        this.results.push({
          name: testName,
          success: true,
          response: data,
          duration
        });
        console.log(`✅ ${testName} - Booking created successfully (${duration}ms)`);
      } else {
        this.results.push({
          name: testName,
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          response: data,
          duration
        });
        console.log(`❌ ${testName} - ${data.error || `HTTP ${response.status}: ${response.statusText}`} (${duration}ms)`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} - ${error} (${duration}ms)`);
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('=' .repeat(60));
    console.log('📊 API Integration Test Summary');
    console.log('=' .repeat(60));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   ❌ ${r.name}: ${r.error}`);
        });
    }

    console.log('\n🎯 Next Steps:');
    if (failed === 0) {
      console.log('   ✅ All API endpoints are working correctly!');
      console.log('   🚀 Ready for frontend integration and production deployment');
    } else {
      console.log('   🔧 Fix the failing API endpoints');
      console.log('   🧪 Re-run tests after fixes');
    }

    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run the tests
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:4321';
  const tester = new APIIntegrationTester(baseUrl);
  await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
