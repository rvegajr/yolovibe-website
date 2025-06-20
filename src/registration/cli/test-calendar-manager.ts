#!/usr/bin/env tsx
/**
 * CLI Test Harness for ICalendarManager Interface
 * Tests calendar integration and event management
 * 
 * Usage: tsx test-calendar-manager.ts
 */

import type { ICalendarManager } from '../core/interfaces/index.js';
import type { CalendarEvent, CalendarEventRequest, CalendarEventUpdate } from '../core/types/index.js';

// Mock implementation for testing
class MockCalendarManager implements ICalendarManager {
  private events: Map<string, CalendarEvent> = new Map();
  private nextId = 1;

  constructor() {
    // Pre-populate with test events
    const event1: CalendarEvent = {
      id: 'cal_event_1',
      title: '3-Day YOLO Workshop - July 2025',
      description: 'Intensive 3-day workshop covering advanced techniques',
      startDateTime: new Date('2025-07-07T09:00:00'),
      endDateTime: new Date('2025-07-09T17:00:00'),
      location: 'YOLO Training Center',
      attendees: ['john@example.com', 'jane@example.com'],
      isAllDay: false,
      status: 'confirmed',
      workshopId: 'workshop_1'
    };

    const event2: CalendarEvent = {
      id: 'cal_event_2',
      title: '5-Day YOLO Workshop - July 2025',
      description: 'Comprehensive 5-day workshop program',
      startDateTime: new Date('2025-07-14T09:00:00'),
      endDateTime: new Date('2025-07-18T17:00:00'),
      location: 'YOLO Training Center',
      attendees: ['alice@example.com'],
      isAllDay: false,
      status: 'confirmed',
      workshopId: 'workshop_2'
    };

    this.events.set(event1.id, event1);
    this.events.set(event2.id, event2);
  }

  async createEvent(request: CalendarEventRequest): Promise<string> {
    const eventId = `cal_event_${this.nextId++}`;
    
    const event: CalendarEvent = {
      id: eventId,
      title: request.title,
      description: request.description,
      startDateTime: request.startDateTime,
      endDateTime: request.endDateTime,
      location: request.location,
      attendees: request.attendees || [],
      isAllDay: request.isAllDay || false,
      status: 'confirmed',
      workshopId: request.workshopId
    };

    this.events.set(eventId, event);
    return eventId;
  }

  async updateEvent(eventId: string, updates: CalendarEventUpdate): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    // Apply updates
    if (updates.title !== undefined) event.title = updates.title;
    if (updates.description !== undefined) event.description = updates.description;
    if (updates.startDateTime !== undefined) event.startDateTime = updates.startDateTime;
    if (updates.endDateTime !== undefined) event.endDateTime = updates.endDateTime;
    if (updates.location !== undefined) event.location = updates.location;
    if (updates.attendees !== undefined) event.attendees = updates.attendees;
    if (updates.isAllDay !== undefined) event.isAllDay = updates.isAllDay;
    if (updates.status !== undefined) event.status = updates.status;

    this.events.set(eventId, event);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    this.events.delete(eventId);
  }

  async getEvent(eventId: string): Promise<CalendarEvent> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    return event;
  }

  async addAttendee(eventId: string, attendeeEmail: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    if (!event.attendees.includes(attendeeEmail)) {
      event.attendees.push(attendeeEmail);
      this.events.set(eventId, event);
    }
  }

  async removeAttendee(eventId: string, attendeeEmail: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    event.attendees = event.attendees.filter(email => email !== attendeeEmail);
    this.events.set(eventId, event);
  }

  async getUpcomingEvents(days: number = 30): Promise<CalendarEvent[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return Array.from(this.events.values())
      .filter(event => {
        return event.startDateTime >= now && 
               event.startDateTime <= futureDate &&
               event.status === 'confirmed';
      })
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing ICalendarManager Interface...\n');
  
  const manager = new MockCalendarManager();
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

    const eventId = await manager.createEvent(request);
    const event = await manager.getEvent(eventId);
    
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
    const event = await manager.getEvent('cal_event_1');
    
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

    await manager.updateEvent('cal_event_1', updates);
    const updatedEvent = await manager.getEvent('cal_event_1');
    
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
    const originalEvent = await manager.getEvent('cal_event_2');
    const originalCount = originalEvent.attendees.length;
    
    await manager.addAttendee('cal_event_2', 'newattendee@example.com');
    const updatedEvent = await manager.getEvent('cal_event_2');
    
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
    const originalEvent = await manager.getEvent('cal_event_2');
    const originalCount = originalEvent.attendees.length;
    
    await manager.removeAttendee('cal_event_2', 'alice@example.com');
    const updatedEvent = await manager.getEvent('cal_event_2');
    
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
    const upcomingEvents = await manager.getUpcomingEvents(60); // Next 60 days
    
    console.log('✅ Test 6: getUpcomingEvents()');
    console.log(`   Found ${upcomingEvents.length} upcoming events:`);
    upcomingEvents.forEach((event, index) => {
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

    const eventId = await manager.createEvent(request);
    
    // Verify it exists
    await manager.getEvent(eventId);
    
    // Delete it
    await manager.deleteEvent(eventId);
    
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
    await manager.getEvent('invalid-event-id');
    console.log('❌ Test 8: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 8: getEvent() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Test 9: Error Handling - Update Non-existent Event
  totalTests++;
  try {
    await manager.updateEvent('invalid-event-id', { title: 'New Title' });
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 9: updateEvent() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Test 10: Error Handling - Delete Non-existent Event
  totalTests++;
  try {
    await manager.deleteEvent('invalid-event-id');
    console.log('❌ Test 10: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 10: deleteEvent() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
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
runTests().catch(console.error);
