#!/usr/bin/env node
/**
 * CLI Test for Database-backed Calendar Manager
 * Tests time blocking enforcement with database persistence
 * 
 * Usage: tsx test-calendar-db.ts
 */

import { CalendarManagerDB } from '../implementations/CalendarManagerDB.js';

async function runTests() {
  console.log('🧪 Testing CalendarManagerDB - Database Integration...\n');
  
  const calendar = new CalendarManagerDB();
  let testsPassed = 0;
  let testsTotal = 0;

  // Give database time to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Block a date
  testsTotal++;
  try {
    const testDate = new Date('2024-12-25'); // Christmas
    await calendar.blockDate(testDate, 'Christmas Holiday');
    
    console.log('✅ Test 1: blockDate()');
    console.log(`   Successfully blocked ${testDate.toDateString()}`);
    testsPassed++;
  } catch (error: unknown) {
    console.log('❌ Test 1 FAILED: blockDate()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 2: Check if blocked date is unavailable
  testsTotal++;
  try {
    const testDate = new Date('2024-12-25');
    const available = await calendar.isDateAvailable(testDate, '3-day' as any);
    
    console.log('✅ Test 2: isDateAvailable() - blocked date');
    console.log(`   Date ${testDate.toDateString()} available: ${available}`);
    
    if (!available) {
      console.log('   ✅ Correctly shows blocked date as unavailable');
      testsPassed++;
    } else {
      console.log('   ❌ Blocked date still shows as available');
    }
  } catch (error: unknown) {
    console.log('❌ Test 2 FAILED: isDateAvailable()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 3: Check if unblocked date is available
  testsTotal++;
  try {
    const testDate = new Date('2024-12-26'); // Day after Christmas
    const available = await calendar.isDateAvailable(testDate, '3-day' as any);
    
    console.log('✅ Test 3: isDateAvailable() - unblocked date');
    console.log(`   Date ${testDate.toDateString()} available: ${available}`);
    
    if (available) {
      console.log('   ✅ Correctly shows unblocked date as available');
      testsPassed++;
    } else {
      console.log('   ❌ Unblocked date shows as unavailable');
    }
  } catch (error: unknown) {
    console.log('❌ Test 3 FAILED: isDateAvailable()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 4: Get blocked dates
  testsTotal++;
  try {
    const dateRange = {
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31')
    };
    
    const blockedDates = await calendar.getBlockedDates(dateRange);
    
    console.log('✅ Test 4: getBlockedDates()');
    console.log(`   Found ${blockedDates.length} blocked dates in December 2024`);
    if (blockedDates.length > 0) {
      console.log(`   First blocked date: ${blockedDates[0].toDateString()}`);
    }
    testsPassed++;
  } catch (error: unknown) {
    console.log('❌ Test 4 FAILED: getBlockedDates()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 5: Block date range
  testsTotal++;
  try {
    const startDate = new Date('2024-12-30');
    const endDate = new Date('2025-01-02');
    await calendar.blockDateRange(startDate, endDate, 'New Year Holiday');
    
    console.log('✅ Test 5: blockDateRange()');
    console.log(`   Successfully blocked range ${startDate.toDateString()} to ${endDate.toDateString()}`);
    testsPassed++;
  } catch (error: unknown) {
    console.log('❌ Test 5 FAILED: blockDateRange()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Test 6: Get all blocks (admin function)
  testsTotal++;
  try {
    const allBlocks = await (calendar as any).getAllBlocks();
    
    console.log('✅ Test 6: getAllBlocks() - admin function');
    console.log(`   Found ${allBlocks.length} total blocks in database`);
    if (allBlocks.length > 0) {
      console.log(`   Latest block: ${allBlocks[allBlocks.length - 1].reason}`);
    }
    testsPassed++;
  } catch (error: unknown) {
    console.log('❌ Test 6 FAILED: getAllBlocks()');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${message}`);
  }
  console.log();

  // Results
  console.log('🎯 DATABASE INTEGRATION TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! Database-backed calendar blocking is working!');
    process.exit(0);
  } else {
    console.log('   ⚠️  Some tests failed, but this is expected if database is not set up.');
    console.log('   💡 Run database migrations first: npm run db:migrate');
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests as testCalendarDB }; 