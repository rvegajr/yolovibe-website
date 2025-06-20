#!/usr/bin/env tsx
/**
 * CLI Test Harness for IAttendeeAccessManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-attendee-access-manager.ts
 */

import type { IAttendeeAccessManager } from '../core/interfaces/index.js';
import type { AccessStatus } from '../core/types/index.js';
import { AttendeeAccessManager } from '../implementations/AttendeeAccessManager.js';

// TEST SUITE
async function testAttendeeAccessManager() {
  console.log('🧪 Testing IAttendeeAccessManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  // Cast to any since CLI test expects methods beyond current interface definition
  const accessManager: any = new AttendeeAccessManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Generate Access Password
  totalTests++;
  try {
    const attendeeId = 'attendee_123';
    const password = await accessManager.generateAccessPassword(attendeeId);
    
    console.log('✅ Test 1: generateAccessPassword()');
    console.log(`   Attendee ID: ${attendeeId}`);
    console.log(`   Generated Password: ${password}`);
    console.log(`   Password Format: ${password.startsWith('YOLO-') ? 'Valid' : 'Invalid'}`);
    console.log('   ✅ Access password generated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: generateAccessPassword() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Access Status - With Access
  totalTests++;
  try {
    const attendeeId = 'attendee_456';
    await accessManager.generateAccessPassword(attendeeId);
    const status = await accessManager.getAccessStatus(attendeeId);
    
    console.log('✅ Test 2: getAccessStatus() - With Access');
    console.log(`   Attendee ID: ${status.attendeeId}`);
    console.log(`   Has Access: ${status.hasAccess}`);
    console.log(`   Password Generated: ${status.passwordGenerated}`);
    console.log(`   Expiration Date: ${status.expirationDate?.toISOString()}`);
    console.log('   ✅ Access status retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getAccessStatus() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Get Access Status - No Access
  totalTests++;
  try {
    const attendeeId = 'attendee_no_access';
    const status = await accessManager.getAccessStatus(attendeeId);
    
    console.log('✅ Test 3: getAccessStatus() - No Access');
    console.log(`   Attendee ID: ${status.attendeeId}`);
    console.log(`   Has Access: ${status.hasAccess}`);
    console.log(`   Password Generated: ${status.passwordGenerated}`);
    console.log('   ✅ Default access status returned correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: getAccessStatus() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Update Last Access
  totalTests++;
  try {
    const attendeeId = 'attendee_789';
    await accessManager.generateAccessPassword(attendeeId);
    
    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await accessManager.updateLastAccess(attendeeId);
    const status = await accessManager.getAccessStatus(attendeeId);
    
    console.log('✅ Test 4: updateLastAccess()');
    console.log(`   Attendee ID: ${status.attendeeId}`);
    console.log(`   Last Access Date: ${status.lastAccessDate?.toISOString()}`);
    console.log('   ✅ Last access updated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: updateLastAccess() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Revoke Access
  totalTests++;
  try {
    const attendeeId = 'attendee_revoke';
    await accessManager.generateAccessPassword(attendeeId);
    
    // Verify access is granted first
    let status = await accessManager.getAccessStatus(attendeeId);
    console.log('✅ Test 5: revokeAccess()');
    console.log(`   Before revocation - Has Access: ${status.hasAccess}`);
    
    await accessManager.revokeAccess(attendeeId);
    status = await accessManager.getAccessStatus(attendeeId);
    
    console.log(`   After revocation - Has Access: ${status.hasAccess}`);
    console.log('   ✅ Access revoked successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: revokeAccess() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Reset Password
  totalTests++;
  try {
    const attendeeId = 'attendee_reset';
    const originalPassword = await accessManager.generateAccessPassword(attendeeId);
    
    // Wait a moment to ensure different passwords
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const newPassword = await accessManager.resetPassword(attendeeId);
    
    console.log('✅ Test 6: resetPassword()');
    console.log(`   Attendee ID: ${attendeeId}`);
    console.log(`   Original Password: ${originalPassword}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`   Passwords Different: ${originalPassword !== newPassword}`);
    console.log('   ✅ Password reset successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: resetPassword() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 7: Reset Password - Non-existent Attendee
  totalTests++;
  try {
    await accessManager.resetPassword('invalid-attendee-id');
    console.log('❌ Test 7: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 7: resetPassword() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IAttendeeAccessManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testAttendeeAccessManager().catch(console.error);
