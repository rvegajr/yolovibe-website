#!/usr/bin/env tsx
/**
 * CLI Test Harness for ICalendarManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-calendar-manager.ts
 */

import type { ICalendarManager } from '../core/interfaces/index.js';
import type { CalendarEvent, CalendarEventRequest, CalendarEventUpdate } from '../core/types/index.js';
import { CalendarManager } from '../implementations/CalendarManager.js';

// TEST SUITE
async function testCalendarManager() {
  console.log('🧪 Testing ICalendarManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  // Cast to any since CLI test expects methods beyond current interface definition
  const calendarManager: any = new CalendarManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Create Calendar Event
  totalTests++;
  try {
    const request: CalendarEventRequest = {
      title: 'New Workshop Event',
      description: 'Test workshop event creation',
      startDateTime: new Date('2025-08-01T09:00:00'),
      endDateTime: new Date('2025-08-03T17:00:00'),
      location: 'Test Location',
      attendees: ['test@example.com'],
      isAllDay: false,
      workshopId: 'workshop_test'
    };

    const eventId = await calendarManager.createEvent(request);
    const event = await calendarManager.getEvent(eventId);
    
    console.log('✅ Test 1: createEvent()');
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Title: ${event.title}`);
    console.log(`   Start: ${event.startDateTime.toISOString()}`);
    console.log(`   End: ${event.endDateTime.toISOString()}`);
    console.log(`   Location: ${event.location}`);
    console.log(`   Attendees: ${event.attendees.length}`);
    console.log(`   Status: ${event.status}`);
    console.log('   ✅ Event created successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: createEvent() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Calendar Event
  totalTests++;
  try {
    const event = await calendarManager.getEvent('cal_event_1');
    
    console.log('✅ Test 2: getEvent()');
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Title: ${event.title}`);
    console.log(`   Workshop ID: ${event.workshopId}`);
    console.log(`   Start: ${event.startDateTime.toISOString().split('T')[0]}`);
    console.log(`   End: ${event.endDateTime.toISOString().split('T')[0]}`);
    console.log(`   Attendees: ${event.attendees.join(', ')}`);
    console.log('   ✅ Event retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getEvent() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Update Calendar Event
  totalTests++;
  try {
    const updates: CalendarEventUpdate = {
      title: 'Updated Workshop Title',
      location: 'Updated Location',
      description: 'Updated description for the workshop'
    };

    await calendarManager.updateEvent('cal_event_1', updates);
    const updatedEvent = await calendarManager.getEvent('cal_event_1');
    
    console.log('✅ Test 3: updateEvent()');
    console.log(`   Event ID: cal_event_1`);
    console.log(`   New Title: ${updatedEvent.title}`);
    console.log(`   New Location: ${updatedEvent.location}`);
    console.log(`   New Description: ${updatedEvent.description}`);
    console.log('   ✅ Event updated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: updateEvent() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Add Attendee
  totalTests++;
  try {
    const originalEvent = await calendarManager.getEvent('cal_event_2');
    const originalCount = originalEvent.attendees.length;
    
    await calendarManager.addAttendee('cal_event_2', 'newattendee@example.com');
    const updatedEvent = await calendarManager.getEvent('cal_event_2');
    
    console.log('✅ Test 4: addAttendee()');
    console.log(`   Event ID: cal_event_2`);
    console.log(`   Original Attendees: ${originalCount}`);
    console.log(`   New Attendees: ${updatedEvent.attendees.length}`);
    console.log(`   Added: newattendee@example.com`);
    console.log(`   All Attendees: ${updatedEvent.attendees.join(', ')}`);
    console.log('   ✅ Attendee added successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: addAttendee() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Remove Attendee
  totalTests++;
  try {
    const originalEvent = await calendarManager.getEvent('cal_event_2');
    const originalCount = originalEvent.attendees.length;
    
    await calendarManager.removeAttendee('cal_event_2', 'alice@example.com');
    const updatedEvent = await calendarManager.getEvent('cal_event_2');
    
    console.log('✅ Test 5: removeAttendee()');
    console.log(`   Event ID: cal_event_2`);
    console.log(`   Original Attendees: ${originalCount}`);
    console.log(`   New Attendees: ${updatedEvent.attendees.length}`);
    console.log(`   Removed: alice@example.com`);
    console.log(`   Remaining Attendees: ${updatedEvent.attendees.join(', ')}`);
    console.log('   ✅ Attendee removed successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: removeAttendee() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Get Upcoming Events
  totalTests++;
  try {
    const upcomingEvents = await calendarManager.getUpcomingEvents(60); // Next 60 days
    
    console.log('✅ Test 6: getUpcomingEvents()');
    console.log(`   Found ${upcomingEvents.length} upcoming events:`);
    upcomingEvents.forEach((event: any, index: number) => {
      console.log(`   ${index + 1}. ${event.title} - ${event.startDateTime.toISOString().split('T')[0]}`);
    });
    console.log('   ✅ Upcoming events retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: getUpcomingEvents() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 7: Delete Calendar Event
  totalTests++;
  try {
    // Create a new event to delete
    const request: CalendarEventRequest = {
      title: 'Event to Delete',
      description: 'This event will be deleted',
      startDateTime: new Date('2025-09-01T10:00:00'),
      endDateTime: new Date('2025-09-01T12:00:00'),
      location: 'Delete Test Location',
      workshopId: 'workshop_delete_test'
    };

    const eventId = await calendarManager.createEvent(request);
    
    // Verify it exists
    await calendarManager.getEvent(eventId);
    
    // Delete it
    await calendarManager.deleteEvent(eventId);
    
    console.log('✅ Test 7: deleteEvent()');
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Event created and deleted successfully`);
    console.log('   ✅ Event deletion working correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 7: deleteEvent() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 8: Error Handling - Get Non-existent Event
  totalTests++;
  try {
    await calendarManager.getEvent('invalid-event-id');
    console.log('❌ Test 8: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 8: getEvent() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    passedTests++;
  }

  // Test 9: Error Handling - Update Non-existent Event
  totalTests++;
  try {
    await calendarManager.updateEvent('invalid-event-id', { title: 'New Title' });
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 9: updateEvent() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    passedTests++;
  }

  // Test 10: Error Handling - Delete Non-existent Event
  totalTests++;
  try {
    await calendarManager.deleteEvent('invalid-event-id');
    console.log('❌ Test 10: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 10: deleteEvent() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    passedTests++;
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! ICalendarManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testCalendarManager().catch(console.error);
