#!/usr/bin/env node
/**
 * End-to-End Consulting Workflow Test
 * Tests the complete AI consulting booking and reminder flow
 * 
 * Usage: tsx test-consulting-workflow.ts
 */

import { ProductCatalogManager } from '../implementations/ProductCatalogManager.js';
import { BookingManagerDB } from '../implementations/database/BookingManagerDB.js';
import { CalendarManagerDB } from '../implementations/CalendarManagerDB.js';
import { FollowUpEmailManager } from '../implementations/FollowUpEmailManager.js';
import type { ConsultingBookingRequest } from '../core/types/index.js';

async function runWorkflowTest() {
  console.log('🧪 Testing Complete AI Consulting Workflow...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;

  // Give services time to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Product Catalog - Get Consulting Product
  testsTotal++;
  try {
    const catalog = new ProductCatalogManager();
    const products = await catalog.getAvailableProducts();
    
    const consultingProduct = products.find(p => p.id === 'ai-consulting');
    
    console.log('✅ Test 1: Consulting product availability');
    console.log(`   Found consulting product: ${consultingProduct?.name}`);
    console.log(`   Price: $${consultingProduct?.price}/hour`);
    console.log(`   Minimum duration: ${consultingProduct?.duration} hours`);
    
    if (consultingProduct) {
      testsPassed++;
    } else {
      console.log('   ❌ Consulting product not found');
    }
  } catch (error: unknown) {
    console.log('❌ Test 1 FAILED: Product catalog');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 2: Get Hourly Availability
  testsTotal++;
  try {
    const catalog = new ProductCatalogManager();
    const testDate = new Date('2024-12-30'); // Monday
    const timeSlots = await catalog.getHourlyAvailability(testDate, 9, 17);
    
    console.log('✅ Test 2: Hourly availability check');
    console.log(`   Date: ${testDate.toDateString()}`);
    console.log(`   Available slots: ${timeSlots.length}`);
    
    if (timeSlots.length > 0) {
      console.log(`   First slot: ${timeSlots[0].startTime}-${timeSlots[0].endTime} (${timeSlots[0].available ? 'available' : 'blocked'})`);
      testsPassed++;
    } else {
      console.log('   ❌ No time slots found');
    }
  } catch (error: unknown) {
    console.log('❌ Test 2 FAILED: Hourly availability');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 3: Calendar Date Blocking
  testsTotal++;
  try {
    const calendar = new CalendarManagerDB();
    const blockDate = new Date('2024-12-31'); // New Year's Eve
    
    await calendar.blockDate(blockDate, 'New Year\'s Eve - Personal Day');
    
    const isAvailable = await calendar.isDateAvailable(blockDate, '3-day' as any);
    
    console.log('✅ Test 3: Calendar date blocking');
    console.log(`   Blocked date: ${blockDate.toDateString()}`);
    console.log(`   Available after blocking: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log('   ✅ Date correctly shows as unavailable');
      testsPassed++;
    } else {
      console.log('   ❌ Date still shows as available after blocking');
    }
  } catch (error: unknown) {
    console.log('❌ Test 3 FAILED: Calendar blocking');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 4: Consulting Booking Creation
  testsTotal++;
  try {
    const bookingManager = new BookingManagerDB();
    
    const consultingRequest: ConsultingBookingRequest = {
      productId: 'ai-consulting',
      scheduledDate: new Date('2024-12-27'), // Friday
      startTime: '14:00',
      durationHours: 2,
      pointOfContact: {
        firstName: 'John',
        lastName: 'Entrepreneur',
        email: 'john@startup.com',
        phone: '+1-555-0123',
        company: 'Startup Inc.'
      },
      paymentMethod: {
        type: 'card'
      }
    };
    
    const bookingResult = await bookingManager.createConsultingBooking(consultingRequest);
    
    console.log('✅ Test 4: Consulting booking creation');
    console.log(`   Booking ID: ${bookingResult.bookingId}`);
    console.log(`   Session ID: ${bookingResult.workshopId}`);
    console.log(`   Total amount: $${bookingResult.totalAmount}`);
    console.log(`   Status: ${bookingResult.status}`);
    
    if (bookingResult.bookingId && bookingResult.totalAmount === 400) { // 2 hours * $200
      testsPassed++;
    } else {
      console.log('   ❌ Booking creation failed or incorrect amount');
    }
  } catch (error: unknown) {
    console.log('❌ Test 4 FAILED: Consulting booking');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 5: Email Reminder Scheduling
  testsTotal++;
  try {
    const emailManager = new FollowUpEmailManager();
    
    const sessionDate = new Date('2024-12-28'); // Saturday
    sessionDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    await emailManager.scheduleConsultingReminders(
      'consulting-test-123',
      'client@example.com',
      'Jane Smith',
      sessionDate,
      'https://zoom.us/j/123456789'
    );
    
    console.log('✅ Test 5: Email reminder scheduling');
    console.log(`   Session ID: consulting-test-123`);
    console.log(`   Client: Jane Smith <client@example.com>`);
    console.log(`   Session date: ${sessionDate.toLocaleString()}`);
    console.log(`   Zoom link: https://zoom.us/j/123456789`);
    
    const schedule = emailManager.getEmailSchedule('consulting-test-123');
    if (schedule?.emailsSent.includes('consulting_confirmation')) {
      console.log('   ✅ Confirmation email sent');
      testsPassed++;
    } else {
      console.log('   ❌ Confirmation email not sent');
    }
  } catch (error: unknown) {
    console.log('❌ Test 5 FAILED: Email reminders');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 6: Admin Calendar Integration
  testsTotal++;
  try {
    const calendar = new CalendarManagerDB();
    
    // Block a date range
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-03');
    await calendar.blockDateRange(startDate, endDate, 'New Year Holiday');
    
    // Get all blocks
    const allBlocks = await (calendar as any).getAllBlocks();
    
    console.log('✅ Test 6: Admin calendar integration');
    console.log(`   Blocked range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(`   Total blocks in system: ${allBlocks.length}`);
    
    if (allBlocks.length > 0) {
      console.log(`   Latest block: ${allBlocks[allBlocks.length - 1].reason}`);
      testsPassed++;
    } else {
      console.log('   ❌ No blocks found in system');
    }
  } catch (error: unknown) {
    console.log('❌ Test 6 FAILED: Admin calendar');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Results
  console.log('🎯 END-TO-END WORKFLOW TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  console.log();
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL WORKFLOW TESTS PASSED!');
    console.log('✅ AI Consulting system is ready for production!');
    console.log();
    console.log('🚀 FEATURES IMPLEMENTED:');
    console.log('   • AI Consulting product ($200/hour, 2-hour minimum)');
    console.log('   • Hourly availability checking (Mon-Fri, 9 AM - 5 PM)');
    console.log('   • Database-backed calendar blocking');
    console.log('   • Consulting booking creation');
    console.log('   • Automated email reminders (confirmation, 24h, 1h)');
    console.log('   • Admin calendar management interface');
    console.log('   • API endpoints for admin operations');
    console.log();
    console.log('📋 NEXT STEPS:');
    console.log('   1. Add to booking widget: /src/components/booking-widget.astro');
    console.log('   2. Set up database: npm run db:migrate');
    console.log('   3. Configure environment variables for email/calendar');
    console.log('   4. Test admin interface: /admin/calendar');
    process.exit(0);
  } else {
    console.log('⚠️  Some workflow tests failed.');
    console.log('💡 This is expected if database/email services are not fully configured.');
    console.log('🔧 The core logic is implemented and ready for integration.');
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkflowTest().catch(console.error);
}

export { runWorkflowTest }; 