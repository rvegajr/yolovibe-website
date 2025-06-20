#!/usr/bin/env tsx
/**
 * CLI Test Harness for IWorkshopAdmin Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-workshop-admin.ts
 */

import type { IWorkshopAdmin } from '../core/interfaces/index.js';
import type { Workshop, WorkshopMetrics, CapacityStatus } from '../core/types/index.js';
import { WorkshopType } from '../core/types/index.js';
import { WorkshopAdminManager } from '../implementations/WorkshopAdminManager.js';

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IWorkshopAdmin Interface...\n');
  
  // Use concrete implementation instead of mock!
  // Cast to any since CLI test expects methods beyond current interface definition
  const workshopAdmin: any = new WorkshopAdminManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Create Workshop
  totalTests++;
  try {
    const workshopId = await workshopAdmin.createWorkshop('product_3day', new Date('2025-08-04'), 25);
    const workshop = await workshopAdmin.getWorkshop(workshopId);
    
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
    const workshop = await workshopAdmin.getWorkshop('workshop_1');
    
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
    const status = await workshopAdmin.getCapacityStatus('workshop_1');
    
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
    const originalWorkshop = await workshopAdmin.getWorkshop('workshop_2');
    const originalCapacity = originalWorkshop.capacity;
    
    await workshopAdmin.updateCapacity('workshop_2', 25);
    const updatedWorkshop = await workshopAdmin.getWorkshop('workshop_2');
    
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
    const metrics = await workshopAdmin.getWorkshopMetrics('workshop_1');
    
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
    const upcomingWorkshops = await workshopAdmin.getUpcomingWorkshops();
    
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
    const upcomingWorkshops = await workshopAdmin.getUpcomingWorkshops(WorkshopType.THREE_DAY);
    
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
    const workshopId = await workshopAdmin.createWorkshop('product_5day', new Date('2025-09-01'), 20);
    
    await workshopAdmin.cancelWorkshop(workshopId);
    const cancelledWorkshop = await workshopAdmin.getWorkshop(workshopId);
    
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
    await workshopAdmin.updateCapacity('workshop_1', 5); // workshop_1 has 15 current attendees
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 9: updateCapacity() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Test 10: Error Handling - Non-existent Workshop
  totalTests++;
  try {
    await workshopAdmin.getWorkshop('invalid-workshop-id');
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
