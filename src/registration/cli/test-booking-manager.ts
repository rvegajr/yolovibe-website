#!/usr/bin/env node
/**
 * CLI Test Harness for IBookingManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-booking-manager.ts
 */

import type { IBookingManager } from '../core/interfaces/index.js';
import type { BookingRequest, BookingResult, Booking, ContactInfo, AttendeeInfo, PaymentMethod } from '../core/types/index.js';
import { BookingManager } from '../implementations/BookingManager.js';

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IBookingManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  const bookingManager: IBookingManager = new BookingManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Create a new booking
  testsTotal++;
  try {
    const contactInfo: ContactInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Test Corp'
    };

    const attendeeInfo: AttendeeInfo = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      company: 'Test Corp'
    };

    const paymentMethod: PaymentMethod = {
      type: 'card'
    };

    const bookingRequest: BookingRequest = {
      productId: 'prod-3day',
      startDate: new Date('2025-07-01'),
      attendeeCount: 1,
      pointOfContact: contactInfo,
      attendees: [attendeeInfo],
      paymentMethod
    };

    const result = await bookingManager.createBooking(bookingRequest);
    
    console.log('✅ Test 1: createBooking()');
    console.log(`   Booking ID: ${result.bookingId}`);
    console.log(`   Workshop ID: ${result.workshopId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Total: $${result.totalAmount}`);
    console.log(`   Confirmation: ${result.confirmationNumber}`);
    
    if (result.status === 'confirmed' && result.totalAmount > 0) {
      testsPassed++;
      console.log('   ✅ Booking created successfully\n');
    } else {
      console.log('   ❌ Booking creation failed\n');
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error, '\n');
  }

  // Test 2: Retrieve booking details
  testsTotal++;
  try {
    // Use the booking from Test 1
    const booking = await bookingManager.getBooking('booking-1');
    
    console.log('✅ Test 2: getBooking()');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Workshop ID: ${booking.workshopId}`);
    console.log(`   Attendees: ${booking.attendees.length}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment Status: ${booking.paymentStatus}`);
    
    if (booking.attendees.length === 1 && booking.status === 'active') {
      testsPassed++;
      console.log('   ✅ Booking details retrieved correctly\n');
    } else {
      console.log('   ❌ Booking details incorrect\n');
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error, '\n');
  }

  // Test 3: Cancel booking
  testsTotal++;
  try {
    await bookingManager.cancelBooking('booking-1');
    const cancelledBooking = await bookingManager.getBooking('booking-1');
    
    console.log('✅ Test 3: cancelBooking()');
    console.log(`   Status after cancellation: ${cancelledBooking.status}`);
    
    if (cancelledBooking.status === 'cancelled') {
      testsPassed++;
      console.log('   ✅ Booking cancelled successfully\n');
    } else {
      console.log('   ❌ Booking not cancelled properly\n');
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error, '\n');
  }

  // Test 4: Error handling for invalid booking ID
  testsTotal++;
  try {
    await bookingManager.getBooking('invalid-booking-id');
    console.log('❌ Test 4 FAILED: Should have thrown error for invalid ID\n');
  } catch (error) {
    console.log('✅ Test 4: getBooking() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    testsPassed++;
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! IBookingManager interface is ready for implementation!');
    process.exit(0);
  } else {
    console.log('   ❌ Some tests failed. Interface needs refinement.');
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests as testBookingManager };
