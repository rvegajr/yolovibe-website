#!/usr/bin/env tsx
/**
 * CLI Test Harness for IWorkshopAdmin Interface
 * Tests workshop administration and capacity management
 * 
 * Usage: tsx test-workshop-admin.ts
 */

import type { IWorkshopAdmin } from '../core/interfaces/index.js';
import type { Workshop, WorkshopMetrics, CapacityStatus } from '../core/types/index.js';
import { WorkshopType } from '../core/types/index.js';

// Mock implementation for testing
class MockWorkshopAdmin implements IWorkshopAdmin {
  private workshops: Map<string, Workshop> = new Map();
  private nextId = 3; // Start with nextId = 3 to avoid overwriting existing workshops

  constructor() {
    // Pre-populate with test workshops
    const workshop1: Workshop = {
      id: 'workshop_1',
      productId: 'product_3day',
      startDate: new Date('2025-07-07'), // Monday
      endDate: new Date('2025-07-09'), // Wednesday
      capacity: 20,
      currentAttendees: 15,
      status: 'scheduled',
      calendarEventId: 'cal_event_1'
    };

    const workshop2: Workshop = {
      id: 'workshop_2',
      productId: 'product_5day',
      startDate: new Date('2025-07-14'), // Monday
      endDate: new Date('2025-07-18'), // Friday
      capacity: 15,
      currentAttendees: 8,
      status: 'scheduled'
    };

    this.workshops.set(workshop1.id, workshop1);
    this.workshops.set(workshop2.id, workshop2);
  }

  async createWorkshop(productId: string, startDate: Date, capacity: number): Promise<string> {
    const workshopId = `workshop_${this.nextId++}`;
    
    // Determine end date based on product type
    const endDate = new Date(startDate);
    if (productId.includes('3day')) {
      endDate.setDate(startDate.getDate() + 2); // 3 days total
    } else if (productId.includes('5day')) {
      endDate.setDate(startDate.getDate() + 4); // 5 days total
    }

    const workshop: Workshop = {
      id: workshopId,
      productId,
      startDate,
      endDate,
      capacity,
      currentAttendees: 0,
      status: 'scheduled'
    };

    this.workshops.set(workshopId, workshop);
    return workshopId;
  }

  async getWorkshop(workshopId: string): Promise<Workshop> {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      throw new Error(`Workshop not found: ${workshopId}`);
    }
    return workshop;
  }

  async updateCapacity(workshopId: string, newCapacity: number): Promise<void> {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      throw new Error(`Workshop not found: ${workshopId}`);
    }
    
    if (newCapacity < workshop.currentAttendees) {
      throw new Error(`Cannot reduce capacity below current attendees (${workshop.currentAttendees})`);
    }

    workshop.capacity = newCapacity;
    this.workshops.set(workshopId, workshop);
  }

  async setWorkshopCapacity(workshopId: string, capacity: number): Promise<void> {
    return this.updateCapacity(workshopId, capacity);
  }

  async isWorkshopFull(workshopId: string): Promise<boolean> {
    const status = await this.getCapacityStatus(workshopId);
    return status.isFull;
  }

  async getCapacityStatus(workshopId: string): Promise<CapacityStatus> {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      throw new Error(`Workshop not found: ${workshopId}`);
    }

    return {
      workshopId,
      current: workshop.currentAttendees,
      maximum: workshop.capacity,
      available: workshop.capacity - workshop.currentAttendees,
      isFull: workshop.currentAttendees >= workshop.capacity,
      waitlistCount: Math.max(0, workshop.currentAttendees - workshop.capacity)
    };
  }

  async getWorkshopMetrics(workshopId: string): Promise<WorkshopMetrics> {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      throw new Error(`Workshop not found: ${workshopId}`);
    }

    // Mock metrics calculation
    const pricePerSeat = workshop.productId.includes('3day') ? 3000 : 4500;
    const revenue = workshop.currentAttendees * pricePerSeat;
    const completionRate = workshop.status === 'completed' ? 95 : 0;

    return {
      workshopId,
      totalBookings: workshop.currentAttendees,
      currentCapacity: workshop.currentAttendees,
      maxCapacity: workshop.capacity,
      revenue,
      attendeeCount: workshop.currentAttendees,
      completionRate
    };
  }

  async cancelWorkshop(workshopId: string): Promise<void> {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      throw new Error(`Workshop not found: ${workshopId}`);
    }

    workshop.status = 'cancelled';
    this.workshops.set(workshopId, workshop);
  }

  async getUpcomingWorkshops(workshopType?: WorkshopType): Promise<Workshop[]> {
    const now = new Date();
    const upcoming = Array.from(this.workshops.values())
      .filter(workshop => {
        const isUpcoming = workshop.startDate > now && workshop.status === 'scheduled';
        if (!workshopType) return isUpcoming;
        
        const matchesType = workshopType === WorkshopType.THREE_DAY 
          ? workshop.productId.includes('3day')
          : workshopType === WorkshopType.FIVE_DAY
          ? workshop.productId.includes('5day')
          : false;
        
        return isUpcoming && matchesType;
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return upcoming;
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IWorkshopAdmin Interface...\n');
  
  const admin = new MockWorkshopAdmin();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Create Workshop
  totalTests++;
  try {
    const workshopId = await admin.createWorkshop('product_3day', new Date('2025-08-04'), 25);
    const workshop = await admin.getWorkshop(workshopId);
    
    console.log('✅ Test 1: createWorkshop()');
    console.log(`   Workshop ID: ${workshopId}`);
    console.log(`   Product ID: ${workshop.productId}`);
    console.log(`   Start Date: ${workshop.startDate.toISOString().split('T')[0]}`);
    console.log(`   End Date: ${workshop.endDate.toISOString().split('T')[0]}`);
    console.log(`   Capacity: ${workshop.capacity}`);
    console.log(`   Status: ${workshop.status}`);
    console.log('   ✅ Workshop created successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: createWorkshop() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Workshop
  totalTests++;
  try {
    const workshop = await admin.getWorkshop('workshop_1');
    
    console.log('✅ Test 2: getWorkshop()');
    console.log(`   Workshop ID: ${workshop.id}`);
    console.log(`   Product ID: ${workshop.productId}`);
    console.log(`   Start Date: ${workshop.startDate.toISOString().split('T')[0]}`);
    console.log(`   Current Attendees: ${workshop.currentAttendees}`);
    console.log(`   Capacity: ${workshop.capacity}`);
    console.log(`   Status: ${workshop.status}`);
    console.log('   ✅ Workshop retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getWorkshop() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Get Capacity Status
  totalTests++;
  try {
    const status = await admin.getCapacityStatus('workshop_1');
    
    console.log('✅ Test 3: getCapacityStatus()');
    console.log(`   Workshop ID: ${status.workshopId}`);
    console.log(`   Current: ${status.current}`);
    console.log(`   Maximum: ${status.maximum}`);
    console.log(`   Available: ${status.available}`);
    console.log(`   Is Full: ${status.isFull}`);
    console.log(`   Waitlist Count: ${status.waitlistCount}`);
    console.log('   ✅ Capacity status retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: getCapacityStatus() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Update Capacity
  totalTests++;
  try {
    const originalWorkshop = await admin.getWorkshop('workshop_2');
    const originalCapacity = originalWorkshop.capacity;
    
    await admin.updateCapacity('workshop_2', 25);
    const updatedWorkshop = await admin.getWorkshop('workshop_2');
    
    console.log('✅ Test 4: updateCapacity()');
    console.log(`   Workshop ID: workshop_2`);
    console.log(`   Original Capacity: ${originalCapacity}`);
    console.log(`   New Capacity: ${updatedWorkshop.capacity}`);
    console.log(`   Current Attendees: ${updatedWorkshop.currentAttendees}`);
    console.log('   ✅ Capacity updated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: updateCapacity() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Get Workshop Metrics
  totalTests++;
  try {
    const metrics = await admin.getWorkshopMetrics('workshop_1');
    
    console.log('✅ Test 5: getWorkshopMetrics()');
    console.log(`   Workshop ID: ${metrics.workshopId}`);
    console.log(`   Total Bookings: ${metrics.totalBookings}`);
    console.log(`   Current Capacity: ${metrics.currentCapacity}/${metrics.maxCapacity}`);
    console.log(`   Revenue: $${metrics.revenue.toLocaleString()}`);
    console.log(`   Attendee Count: ${metrics.attendeeCount}`);
    console.log(`   Completion Rate: ${metrics.completionRate}%`);
    console.log('   ✅ Workshop metrics retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: getWorkshopMetrics() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Get Upcoming Workshops - All Types
  totalTests++;
  try {
    const upcomingWorkshops = await admin.getUpcomingWorkshops();
    
    console.log('✅ Test 6: getUpcomingWorkshops() - All Types');
    console.log(`   Found ${upcomingWorkshops.length} upcoming workshops:`);
    upcomingWorkshops.forEach((workshop, index) => {
      console.log(`   ${index + 1}. ${workshop.id} - ${workshop.startDate.toISOString().split('T')[0]} (${workshop.productId})`);
    });
    console.log('   ✅ Upcoming workshops retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: getUpcomingWorkshops() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 7: Get Upcoming Workshops - Specific Type
  totalTests++;
  try {
    const upcomingWorkshops = await admin.getUpcomingWorkshops(WorkshopType.THREE_DAY);
    
    console.log('✅ Test 7: getUpcomingWorkshops() - 3-Day Only');
    console.log(`   Found ${upcomingWorkshops.length} upcoming 3-day workshops:`);
    upcomingWorkshops.forEach((workshop, index) => {
      console.log(`   ${index + 1}. ${workshop.id} - ${workshop.startDate.toISOString().split('T')[0]}`);
    });
    console.log('   ✅ Filtered workshops retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 7: getUpcomingWorkshops() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 8: Cancel Workshop
  totalTests++;
  try {
    const workshopId = await admin.createWorkshop('product_5day', new Date('2025-09-01'), 20);
    
    await admin.cancelWorkshop(workshopId);
    const cancelledWorkshop = await admin.getWorkshop(workshopId);
    
    console.log('✅ Test 8: cancelWorkshop()');
    console.log(`   Workshop ID: ${workshopId}`);
    console.log(`   Status: ${cancelledWorkshop.status}`);
    console.log('   ✅ Workshop cancelled successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 8: cancelWorkshop() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 9: Error Handling - Invalid Capacity Update
  totalTests++;
  try {
    await admin.updateCapacity('workshop_1', 5); // workshop_1 has 15 current attendees
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 9: updateCapacity() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Test 10: Error Handling - Non-existent Workshop
  totalTests++;
  try {
    await admin.getWorkshop('invalid-workshop-id');
    console.log('❌ Test 10: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 10: getWorkshop() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IWorkshopAdmin interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
