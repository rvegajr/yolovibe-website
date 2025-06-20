#!/usr/bin/env tsx

/**
 * Comprehensive API Integration Test for YOLOVibe Booking System
 * 
 * Tests all API endpoints with the database-backed implementations:
 * - Workshop availability
 * - User authentication (register, login, logout, validate)
 * - Booking creation, retrieval, updates, and cancellation
 * - User booking queries and statistics
 * 
 * Run with: npx tsx src/registration/cli/test-api-integration.ts
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:4321'; // Astro dev server
const TEST_DB_PATH = join(__dirname, '../../../test-api-integration.db');

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
}

interface TestBookingRequest {
  productId: string;
  startDate: string;
  attendeeCount: number;
  attendees: Array<{
    firstName: string;
    lastName: string;
    email: string;
  }>;
  pointOfContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: {
    type: 'card';
  };
  couponCode?: string;
}

class APIIntegrationTester {
  private sessionToken: string | null = null;
  private testUser: TestUser;
  private createdBookingId: string | null = null;

  constructor() {
    this.testUser = {
      email: `test-${Date.now()}@yolovibe.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      company: 'YOLOVibe Test Co'
    };
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Integration Tests...\n');

    try {
      // Set test environment
      process.env.NODE_ENV = 'test';
      process.env.DB_PATH = TEST_DB_PATH;

      await this.testWorkshopAvailability();
      await this.testUserRegistration();
      await this.testUserLogin();
      await this.testSessionValidation();
      await this.testBookingCreation();
      await this.testBookingRetrieval();
      await this.testUserBookings();
      await this.testBookingCancellation();
      await this.testUserLogout();
      await this.testInvalidSessionAfterLogout();

      console.log('\n✅ All API Integration Tests Passed!');
      console.log('🎉 The booking system is ready for production!');

    } catch (error) {
      console.error('\n❌ API Integration Tests Failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add session token if available
    if (this.sessionToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return response;
  }

  private async testWorkshopAvailability(): Promise<void> {
    console.log('🔍 Testing Workshop Availability API...');

    const response = await this.makeRequest('/api/workshops/available');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Workshop availability failed: ${data.error}`);
    }

    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid workshop availability response format');
    }

    console.log(`✅ Found ${data.count} available workshops`);
  }

  private async testUserRegistration(): Promise<void> {
    console.log('📝 Testing User Registration API...');

    const response = await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(this.testUser),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`User registration failed: ${data.error}`);
    }

    if (!data.success || !data.data.user || !data.data.sessionToken) {
      throw new Error('Invalid registration response format');
    }

    this.sessionToken = data.data.sessionToken;
    console.log(`✅ User registered: ${this.testUser.email}`);
  }

  private async testUserLogin(): Promise<void> {
    console.log('🔐 Testing User Login API...');

    // Clear session token to test fresh login
    this.sessionToken = null;

    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.testUser.email,
        password: this.testUser.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`User login failed: ${data.error}`);
    }

    if (!data.success || !data.data.user || !data.data.sessionToken) {
      throw new Error('Invalid login response format');
    }

    this.sessionToken = data.data.sessionToken;
    console.log(`✅ User logged in: ${this.testUser.email}`);
  }

  private async testSessionValidation(): Promise<void> {
    console.log('🔍 Testing Session Validation API...');

    const response = await this.makeRequest('/api/auth/validate');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Session validation failed: ${data.error}`);
    }

    if (!data.success || !data.authenticated || !data.data.user) {
      throw new Error('Invalid session validation response');
    }

    console.log(`✅ Session validated for: ${data.data.user.email}`);
  }

  private async testBookingCreation(): Promise<void> {
    console.log('🎯 Testing Booking Creation API...');

    const bookingRequest: TestBookingRequest = {
      productId: 'three-day-intensive',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      attendeeCount: 2,
      attendees: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      ],
      pointOfContact: {
        firstName: this.testUser.firstName,
        lastName: this.testUser.lastName,
        email: this.testUser.email,
        phone: '+1-555-123-4567',
      },
      paymentMethod: {
        type: 'card',
      },
    };

    const response = await this.makeRequest('/api/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Booking creation failed: ${data.error}`);
    }

    if (!data.success || !data.data.id) {
      throw new Error('Invalid booking creation response format');
    }

    this.createdBookingId = data.data.id;
    console.log(`✅ Booking created: ${this.createdBookingId}`);
  }

  private async testBookingRetrieval(): Promise<void> {
    console.log('🔍 Testing Booking Retrieval API...');

    if (!this.createdBookingId) {
      throw new Error('No booking ID available for retrieval test');
    }

    const response = await this.makeRequest(`/api/bookings/${this.createdBookingId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Booking retrieval failed: ${data.error}`);
    }

    if (!data.success || !data.data.id) {
      throw new Error('Invalid booking retrieval response format');
    }

    console.log(`✅ Booking retrieved: ${data.data.id}`);
  }

  private async testUserBookings(): Promise<void> {
    console.log('📊 Testing User Bookings API...');

    // For this test, we'll use a mock user ID since we don't have user ID from auth
    const mockUserId = 'test-user-123';

    const response = await this.makeRequest(`/api/bookings/user/${mockUserId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`User bookings retrieval failed: ${data.error}`);
    }

    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid user bookings response format');
    }

    console.log(`✅ User bookings retrieved: ${data.count} bookings found`);
  }

  private async testBookingCancellation(): Promise<void> {
    console.log('🚫 Testing Booking Cancellation API...');

    if (!this.createdBookingId) {
      throw new Error('No booking ID available for cancellation test');
    }

    const response = await this.makeRequest(`/api/bookings/${this.createdBookingId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Booking cancellation failed: ${data.error}`);
    }

    if (!data.success || data.data.status !== 'cancelled') {
      throw new Error('Invalid booking cancellation response');
    }

    console.log(`✅ Booking cancelled: ${this.createdBookingId}`);
  }

  private async testUserLogout(): Promise<void> {
    console.log('🚪 Testing User Logout API...');

    const response = await this.makeRequest('/api/auth/logout', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`User logout failed: ${data.error}`);
    }

    if (!data.success) {
      throw new Error('Invalid logout response format');
    }

    console.log(`✅ User logged out successfully`);
  }

  private async testInvalidSessionAfterLogout(): Promise<void> {
    console.log('🔒 Testing Invalid Session After Logout...');

    const response = await this.makeRequest('/api/auth/validate');
    const data = await response.json();

    if (response.ok || data.authenticated) {
      throw new Error('Session should be invalid after logout');
    }

    console.log(`✅ Session correctly invalidated after logout`);
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Clean up test database file
      const fs = await import('fs');
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
        console.log('✅ Test database cleaned up');
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error);
    }
  }
}

// Run the tests
async function main(): Promise<void> {
  const tester = new APIIntegrationTester();
  await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}
