#!/usr/bin/env node
/**
 * CLI Test Harness for IAttendeeManager Interface
 * This test DRIVES the interface design - written BEFORE implementation!
 * 
 * Usage: tsx test-attendee-manager.ts
 */

import type { IAttendeeManager } from '../core/interfaces/index.js';
import type { AttendeeInfo, Attendee, AttendeeUpdates, AccessStatus } from '../core/types/index.js';

// Mock implementation for testing
class MockAttendeeManager implements IAttendeeManager {
  private attendees: Map<string, Attendee> = new Map();
  private bookingAttendees: Map<string, string[]> = new Map(); // bookingId -> attendeeIds
  private nextAttendeeId = 1;

  async addAttendee(bookingId: string, attendeeInfo: AttendeeInfo): Promise<void> {
    const attendeeId = `attendee-${this.nextAttendeeId++}`;
    
    const attendee: Attendee = {
      ...attendeeInfo,
      id: attendeeId,
      bookingId,
      accessStatus: {
        attendeeId,
        hasAccess: false,
        passwordGenerated: false
      },
      registrationDate: new Date()
    };

    this.attendees.set(attendeeId, attendee);
    
    // Track attendees by booking
    const bookingAttendeeIds = this.bookingAttendees.get(bookingId) || [];
    bookingAttendeeIds.push(attendeeId);
    this.bookingAttendees.set(bookingId, bookingAttendeeIds);
  }

  async getAttendees(bookingId: string): Promise<Attendee[]> {
    const attendeeIds = this.bookingAttendees.get(bookingId) || [];
    return attendeeIds.map(id => this.attendees.get(id)!).filter(Boolean);
  }

  async removeAttendee(attendeeId: string): Promise<void> {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }

    // Remove from booking tracking
    const bookingAttendeeIds = this.bookingAttendees.get(attendee.bookingId) || [];
    const updatedIds = bookingAttendeeIds.filter(id => id !== attendeeId);
    this.bookingAttendees.set(attendee.bookingId, updatedIds);

    // Remove attendee
    this.attendees.delete(attendeeId);
  }

  async updateAttendee(attendeeId: string, updates: AttendeeUpdates): Promise<void> {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }

    // Apply updates
    Object.assign(attendee, updates);
    this.attendees.set(attendeeId, attendee);
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IAttendeeManager Interface...\n');
  
  const manager: IAttendeeManager = new MockAttendeeManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Add attendee to booking
  testsTotal++;
  try {
    const attendeeInfo: AttendeeInfo = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '555-1111',
      company: 'Tech Corp',
      dietaryRestrictions: 'Vegetarian',
      accessibilityNeeds: 'None'
    };

    await manager.addAttendee('booking-123', attendeeInfo);
    
    console.log('✅ Test 1: addAttendee()');
    console.log(`   Added: ${attendeeInfo.firstName} ${attendeeInfo.lastName}`);
    console.log(`   Email: ${attendeeInfo.email}`);
    console.log(`   Company: ${attendeeInfo.company}`);
    console.log(`   Dietary: ${attendeeInfo.dietaryRestrictions}`);
    
    testsPassed++;
    console.log('   ✅ Attendee added successfully\n');
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error, '\n');
  }

  // Test 2: Add multiple attendees to same booking
  testsTotal++;
  try {
    const attendee2: AttendeeInfo = {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      phone: '555-2222',
      company: 'Design Studio'
    };

    const attendee3: AttendeeInfo = {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol@example.com',
      phone: '555-3333',
      company: 'Marketing Inc',
      accessibilityNeeds: 'Wheelchair access'
    };

    await manager.addAttendee('booking-123', attendee2);
    await manager.addAttendee('booking-123', attendee3);
    
    console.log('✅ Test 2: addAttendee() - Multiple Attendees');
    console.log(`   Added: ${attendee2.firstName} ${attendee2.lastName}`);
    console.log(`   Added: ${attendee3.firstName} ${attendee3.lastName}`);
    
    testsPassed++;
    console.log('   ✅ Multiple attendees added successfully\n');
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error, '\n');
  }

  // Test 3: Get all attendees for booking
  testsTotal++;
  try {
    const attendees = await manager.getAttendees('booking-123');
    
    console.log('✅ Test 3: getAttendees()');
    console.log(`   Found ${attendees.length} attendees for booking-123:`);
    attendees.forEach((attendee, index) => {
      console.log(`   ${index + 1}. ${attendee.firstName} ${attendee.lastName} (${attendee.email})`);
      console.log(`      Company: ${attendee.company || 'N/A'}`);
      console.log(`      Access Status: ${attendee.accessStatus.hasAccess ? 'Active' : 'Pending'}`);
    });
    
    if (attendees.length === 3) {
      testsPassed++;
      console.log('   ✅ All attendees retrieved correctly\n');
    } else {
      console.log(`   ❌ Expected 3 attendees, got ${attendees.length}\n`);
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error, '\n');
  }

  // Test 4: Update attendee information
  testsTotal++;
  try {
    const updates: AttendeeUpdates = {
      phone: '555-1111-UPDATED',
      company: 'Tech Corp - Updated',
      dietaryRestrictions: 'Vegan'
    };

    await manager.updateAttendee('attendee-1', updates);
    
    const updatedAttendees = await manager.getAttendees('booking-123');
    const updatedAttendee = updatedAttendees.find(a => a.id === 'attendee-1');
    
    console.log('✅ Test 4: updateAttendee()');
    console.log(`   Updated attendee: ${updatedAttendee?.firstName} ${updatedAttendee?.lastName}`);
    console.log(`   New phone: ${updatedAttendee?.phone}`);
    console.log(`   New company: ${updatedAttendee?.company}`);
    console.log(`   New dietary: ${updatedAttendee?.dietaryRestrictions}`);
    
    if (updatedAttendee?.phone === '555-1111-UPDATED' && 
        updatedAttendee?.company === 'Tech Corp - Updated' &&
        updatedAttendee?.dietaryRestrictions === 'Vegan') {
      testsPassed++;
      console.log('   ✅ Attendee updated successfully\n');
    } else {
      console.log('   ❌ Attendee update failed\n');
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error, '\n');
  }

  // Test 5: Remove attendee
  testsTotal++;
  try {
    await manager.removeAttendee('attendee-2');
    
    const remainingAttendees = await manager.getAttendees('booking-123');
    
    console.log('✅ Test 5: removeAttendee()');
    console.log(`   Remaining attendees: ${remainingAttendees.length}`);
    remainingAttendees.forEach((attendee, index) => {
      console.log(`   ${index + 1}. ${attendee.firstName} ${attendee.lastName}`);
    });
    
    if (remainingAttendees.length === 2 && !remainingAttendees.find(a => a.id === 'attendee-2')) {
      testsPassed++;
      console.log('   ✅ Attendee removed successfully\n');
    } else {
      console.log('   ❌ Attendee removal failed\n');
    }
  } catch (error) {
    console.log('❌ Test 5 FAILED:', error, '\n');
  }

  // Test 6: Error handling for invalid attendee ID
  testsTotal++;
  try {
    await manager.updateAttendee('invalid-attendee-id', { firstName: 'Test' });
    console.log('❌ Test 6 FAILED: Should have thrown error for invalid attendee ID\n');
  } catch (error) {
    console.log('✅ Test 6: updateAttendee() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    testsPassed++;
  }

  // Test 7: Get attendees for non-existent booking
  testsTotal++;
  try {
    const attendees = await manager.getAttendees('non-existent-booking');
    
    console.log('✅ Test 7: getAttendees() - Non-existent Booking');
    console.log(`   Found ${attendees.length} attendees for non-existent booking`);
    
    if (attendees.length === 0) {
      testsPassed++;
      console.log('   ✅ Correctly returned empty array for non-existent booking\n');
    } else {
      console.log('   ❌ Should have returned empty array\n');
    }
  } catch (error) {
    console.log('❌ Test 7 FAILED:', error, '\n');
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! IAttendeeManager interface is ready for implementation!');
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

export { runTests as testAttendeeManager };
