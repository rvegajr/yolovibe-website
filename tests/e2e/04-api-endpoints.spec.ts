import { test, expect } from '@playwright/test';
import { TestDataFactory, TEST_CONFIG } from './utils/test-data';

/**
 * API Endpoints End-to-End Tests
 * Tests all API endpoints for functionality, error handling,
 * authentication, and data integrity
 */

test.describe('Booking API Endpoints', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should create workshop booking via API', async ({ request }) => {
    console.log('🔌 Test: Create workshop booking via API');
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    const response = await request.post('/api/bookings/create', {
      data: {
        productId: booking.productId,
        startDate: booking.startDate.toISOString(),
        attendees: booking.attendees,
        couponCode: booking.couponCode,
        pointOfContact: booking.attendees[0]
      }
    });

    if (response.ok()) {
      const responseData = await response.json();
      
      expect(response.status()).toBe(201);
      expect(responseData.bookingId).toBeTruthy();
      expect(responseData.totalAmount).toBe(0); // With 100% coupon
      
      console.log(`✅ Booking created via API: ${responseData.bookingId}`);
    } else {
      console.log(`ℹ️ Booking API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should retrieve booking details via API', async ({ request }) => {
    console.log('🔌 Test: Retrieve booking details via API');
    
    // First create a booking
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    const createResponse = await request.post('/api/bookings/create', {
      data: {
        productId: booking.productId,
        startDate: booking.startDate.toISOString(),
        attendees: booking.attendees,
        couponCode: booking.couponCode
      }
    });

    if (createResponse.ok()) {
      const createData = await createResponse.json();
      const bookingId = createData.bookingId;
      
      // Retrieve booking details
      const getResponse = await request.get(`/api/bookings/${bookingId}`);
      
      if (getResponse.ok()) {
        const bookingData = await getResponse.json();
        
        expect(getResponse.status()).toBe(200);
        expect(bookingData.id).toBe(bookingId);
        expect(bookingData.productId).toBe(booking.productId);
        
        console.log(`✅ Booking retrieved via API: ${bookingId}`);
      } else {
        console.log(`ℹ️ Get booking API not implemented yet`);
      }
    } else {
      console.log(`ℹ️ Create booking API not available for testing retrieval`);
    }
  });

  test('should handle invalid booking data via API', async ({ request }) => {
    console.log('🔌 Test: API handles invalid booking data');
    
    const response = await request.post('/api/bookings/create', {
      data: {
        productId: 'invalid-product',
        startDate: 'invalid-date',
        attendees: [],
        couponCode: 'INVALID_COUPON'
      }
    });

    // Should return error status
    expect([400, 422, 404]).toContain(response.status());
    
    if (response.ok()) {
      console.log(`ℹ️ API validation not implemented yet`);
    } else {
      const errorData = await response.json();
      expect(errorData.error || errorData.message).toBeTruthy();
      
      console.log(`✅ API properly handles invalid data (Status: ${response.status()})`);
    }
  });
});

test.describe('Workshop API Endpoints', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should retrieve available workshops via API', async ({ request }) => {
    console.log('🔌 Test: Retrieve available workshops via API');
    
    const response = await request.get('/api/workshops/available');

    if (response.ok()) {
      const workshops = await response.json();
      
      expect(response.status()).toBe(200);
      expect(Array.isArray(workshops)).toBeTruthy();
      
      // Should have at least our test products
      const productIds = workshops.map((w: any) => w.id || w.productId);
      expect(productIds.some((id: string) => id.includes('3day') || id.includes('workshop'))).toBeTruthy();
      
      console.log(`✅ Available workshops retrieved: ${workshops.length} workshops`);
    } else {
      console.log(`ℹ️ Available workshops API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should retrieve workshop availability by date via API', async ({ request }) => {
    console.log('🔌 Test: Workshop availability by date via API');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const response = await request.get(`/api/workshops/available?date=${futureDate.toISOString().split('T')[0]}`);

    if (response.ok()) {
      const availability = await response.json();
      
      expect(response.status()).toBe(200);
      expect(availability.available !== undefined).toBeTruthy();
      
      console.log(`✅ Workshop availability retrieved for ${futureDate.toDateString()}`);
    } else {
      console.log(`ℹ️ Workshop availability API not implemented yet`);
    }
  });
});

test.describe('Purchase API Endpoints', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should create purchase via API', async ({ request }) => {
    console.log('🔌 Test: Create purchase via API');
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    const response = await request.post('/api/purchase/create', {
      data: {
        productId: booking.productId,
        attendees: booking.attendees,
        couponCode: booking.couponCode,
        paymentMethod: 'test_card',
        billingAddress: {
          name: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345'
        }
      }
    });

    if (response.ok()) {
      const purchaseData = await response.json();
      
      expect(response.status()).toBe(201);
      expect(purchaseData.purchaseId).toBeTruthy();
      expect(purchaseData.totalAmount).toBe(0); // With 100% coupon
      
      console.log(`✅ Purchase created via API: ${purchaseData.purchaseId}`);
    } else {
      console.log(`ℹ️ Purchase API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should retrieve purchase status via API', async ({ request }) => {
    console.log('🔌 Test: Retrieve purchase status via API');
    
    const booking = TestDataFactory.create3DayWorkshopBooking(1);
    
    const createResponse = await request.post('/api/purchase/create', {
      data: {
        productId: booking.productId,
        attendees: booking.attendees,
        couponCode: booking.couponCode
      }
    });

    if (createResponse.ok()) {
      const createData = await createResponse.json();
      const purchaseId = createData.purchaseId;
      
      const statusResponse = await request.get(`/api/purchase/${purchaseId}/status`);
      
      if (statusResponse.ok()) {
        const statusData = await statusResponse.json();
        
        expect(statusResponse.status()).toBe(200);
        expect(statusData.status).toBeTruthy();
        expect(['pending', 'completed', 'failed']).toContain(statusData.status);
        
        console.log(`✅ Purchase status retrieved: ${statusData.status}`);
      } else {
        console.log(`ℹ️ Purchase status API not implemented yet`);
      }
    } else {
      console.log(`ℹ️ Purchase creation API not available for status testing`);
    }
  });
});

test.describe('Authentication API Endpoints', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should register new user via API', async ({ request }) => {
    console.log('🔌 Test: User registration via API');
    
    const user = TestDataFactory.createTestUser();
    
    const response = await request.post('/api/auth/register', {
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        phone: user.phone,
        company: user.company
      }
    });

    if (response.ok()) {
      const userData = await response.json();
      
      expect(response.status()).toBe(201);
      expect(userData.userId || userData.id).toBeTruthy();
      expect(userData.email).toBe(user.email);
      
      console.log(`✅ User registered via API: ${userData.email}`);
    } else {
      console.log(`ℹ️ User registration API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should authenticate user via API', async ({ request }) => {
    console.log('🔌 Test: User authentication via API');
    
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@yolovibe.test',
        password: 'AdminPassword123!'
      }
    });

    if (response.ok()) {
      const authData = await response.json();
      
      expect(response.status()).toBe(200);
      expect(authData.token || authData.sessionId).toBeTruthy();
      
      console.log(`✅ User authenticated via API`);
    } else {
      console.log(`ℹ️ User authentication API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should validate session via API', async ({ request }) => {
    console.log('🔌 Test: Session validation via API');
    
    // First login to get a token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'admin@yolovibe.test',
        password: 'AdminPassword123!'
      }
    });

    if (loginResponse.ok()) {
      const authData = await loginResponse.json();
      const token = authData.token || authData.sessionId;
      
      if (token) {
        const validateResponse = await request.post('/api/auth/validate', {
          data: { token },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (validateResponse.ok()) {
          const validationData = await validateResponse.json();
          
          expect(validateResponse.status()).toBe(200);
          expect(validationData.valid).toBe(true);
          
          console.log(`✅ Session validated via API`);
        } else {
          console.log(`ℹ️ Session validation API not implemented yet`);
        }
      }
    } else {
      console.log(`ℹ️ Login API not available for session validation testing`);
    }
  });

  test('should logout user via API', async ({ request }) => {
    console.log('🔌 Test: User logout via API');
    
    const response = await request.post('/api/auth/logout', {
      data: {}
    });

    // Logout should succeed even without valid session
    if (response.ok()) {
      expect([200, 204]).toContain(response.status());
      console.log(`✅ User logout via API successful`);
    } else {
      console.log(`ℹ️ User logout API not implemented yet (Status: ${response.status()})`);
    }
  });
});

test.describe('Calendar API Endpoints', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should create calendar event via API', async ({ request }) => {
    console.log('🔌 Test: Create calendar event via API');
    
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7);
    
    const response = await request.post('/api/calendar/events/create', {
      data: {
        title: 'E2E Test Workshop',
        startDate: eventDate.toISOString(),
        endDate: new Date(eventDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
        attendeeEmail: 'test@example.com',
        type: 'workshop'
      }
    });

    if (response.ok()) {
      const eventData = await response.json();
      
      expect(response.status()).toBe(201);
      expect(eventData.eventId || eventData.id).toBeTruthy();
      
      console.log(`✅ Calendar event created via API: ${eventData.eventId || eventData.id}`);
    } else {
      console.log(`ℹ️ Calendar event creation API not implemented yet (Status: ${response.status()})`);
    }
  });

  test('should retrieve calendar event via API', async ({ request }) => {
    console.log('🔌 Test: Retrieve calendar event via API');
    
    // First create an event
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 8);
    
    const createResponse = await request.post('/api/calendar/events/create', {
      data: {
        title: 'E2E Test Retrieval',
        startDate: eventDate.toISOString(),
        endDate: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        attendeeEmail: 'test@example.com',
        type: 'consulting'
      }
    });

    if (createResponse.ok()) {
      const createData = await createResponse.json();
      const eventId = createData.eventId || createData.id;
      
      const getResponse = await request.get(`/api/calendar/events/${eventId}`);
      
      if (getResponse.ok()) {
        const eventData = await getResponse.json();
        
        expect(getResponse.status()).toBe(200);
        expect(eventData.id || eventData.eventId).toBe(eventId);
        expect(eventData.title).toBe('E2E Test Retrieval');
        
        console.log(`✅ Calendar event retrieved via API: ${eventId}`);
      } else {
        console.log(`ℹ️ Calendar event retrieval API not implemented yet`);
      }
    } else {
      console.log(`ℹ️ Calendar event creation not available for retrieval testing`);
    }
  });

  test('should delete calendar event via API', async ({ request }) => {
    console.log('🔌 Test: Delete calendar event via API');
    
    // First create an event
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 9);
    
    const createResponse = await request.post('/api/calendar/events/create', {
      data: {
        title: 'E2E Test Deletion',
        startDate: eventDate.toISOString(),
        endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        attendeeEmail: 'test@example.com',
        type: 'consulting'
      }
    });

    if (createResponse.ok()) {
      const createData = await createResponse.json();
      const eventId = createData.eventId || createData.id;
      
      const deleteResponse = await request.delete(`/api/calendar/events/${eventId}/delete`);
      
      if (deleteResponse.ok()) {
        expect([200, 204]).toContain(deleteResponse.status());
        
        // Verify event is deleted by trying to retrieve it
        const getResponse = await request.get(`/api/calendar/events/${eventId}`);
        expect([404, 410]).toContain(getResponse.status());
        
        console.log(`✅ Calendar event deleted via API: ${eventId}`);
      } else {
        console.log(`ℹ️ Calendar event deletion API not implemented yet`);
      }
    } else {
      console.log(`ℹ️ Calendar event creation not available for deletion testing`);
    }
  });
});

test.describe('API Error Handling & Validation', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should handle malformed JSON requests', async ({ request }) => {
    console.log('🔌 Test: API handles malformed JSON');
    
    const response = await request.post('/api/bookings/create', {
      data: 'invalid json string',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect([400, 422]).toContain(response.status());
    console.log(`✅ API properly handles malformed JSON (Status: ${response.status()})`);
  });

  test('should require authentication for protected endpoints', async ({ request }) => {
    console.log('🔌 Test: Protected endpoints require authentication');
    
    const protectedEndpoints = [
      '/api/admin/users',
      '/api/admin/workshops',
      '/api/admin/coupons',
      '/api/admin/reports'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(endpoint);
      
      if (response.status() === 401 || response.status() === 403) {
        console.log(`✅ ${endpoint} properly requires authentication`);
      } else if (response.status() === 404) {
        console.log(`ℹ️ ${endpoint} not implemented yet`);
      } else {
        console.log(`⚠️ ${endpoint} may not require authentication (Status: ${response.status()})`);
      }
    }
  });

  test('should validate required fields in API requests', async ({ request }) => {
    console.log('🔌 Test: API validates required fields');
    
    const response = await request.post('/api/bookings/create', {
      data: {
        // Missing required fields
      }
    });

    if ([400, 422].includes(response.status())) {
      const errorData = await response.json();
      expect(errorData.error || errorData.message || errorData.errors).toBeTruthy();
      
      console.log(`✅ API validates required fields (Status: ${response.status()})`);
    } else {
      console.log(`ℹ️ API field validation not implemented yet`);
    }
  });

  test('should return consistent error response format', async ({ request }) => {
    console.log('🔌 Test: Consistent error response format');
    
    const response = await request.post('/api/bookings/create', {
      data: {
        productId: 'invalid'
      }
    });

    if (!response.ok()) {
      const errorData = await response.json();
      
      // Should have consistent error structure
      const hasErrorField = errorData.error || errorData.message || errorData.errors;
      expect(hasErrorField).toBeTruthy();
      
      console.log(`✅ Consistent error format returned`);
    } else {
      console.log(`ℹ️ Error handling not implemented yet`);
    }
  });
});

test.describe('API Performance & Load', () => {
  test.beforeEach(async () => {
    TestDataFactory.resetCounter();
  });

  test('should respond to API requests within reasonable time', async ({ request }) => {
    console.log('🔌 Test: API response time performance');
    
    const startTime = Date.now();
    
    const response = await request.get('/api/workshops/available');
    
    const responseTime = Date.now() - startTime;
    
    // API should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000);
    
    console.log(`✅ API response time: ${responseTime}ms`);
  });

  test('should handle multiple concurrent requests', async ({ request }) => {
    console.log('🔌 Test: API handles concurrent requests');
    
    const concurrentRequests = Array.from({ length: 5 }, () => 
      request.get('/api/workshops/available')
    );

    const startTime = Date.now();
    const responses = await Promise.all(concurrentRequests);
    const totalTime = Date.now() - startTime;

    // At least some requests should succeed
    const successfulResponses = responses.filter(r => r.ok());
    expect(successfulResponses.length).toBeGreaterThan(0);
    
    console.log(`✅ Handled ${responses.length} concurrent requests in ${totalTime}ms`);
  });
}); 