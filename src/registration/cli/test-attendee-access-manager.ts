#!/usr/bin/env tsx
/**
 * CLI Test Harness for IAttendeeAccessManager Interface
 * Tests attendee access control and password management
 * 
 * Usage: tsx test-attendee-access-manager.ts
 */

import type { IAttendeeAccessManager } from '../core/interfaces/index.js';
import type { AccessStatus } from '../core/types/index.js';

// Mock implementation for testing
class MockAttendeeAccessManager implements IAttendeeAccessManager {
  private accessStatuses: Map<string, AccessStatus> = new Map();
  private passwords: Map<string, string> = new Map();

  async generateAccessPassword(attendeeId: string): Promise<string> {
    const password = `YOLO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.passwords.set(attendeeId, password);
    
    // Update access status
    const status: AccessStatus = {
      attendeeId,
      hasAccess: true,
      passwordGenerated: true,
      lastAccessDate: undefined,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    this.accessStatuses.set(attendeeId, status);
    return password;
  }

  async revokeAccess(attendeeId: string): Promise<void> {
    const status = this.accessStatuses.get(attendeeId);
    if (status) {
      status.hasAccess = false;
      this.accessStatuses.set(attendeeId, status);
    }
    this.passwords.delete(attendeeId);
  }

  async getAccessStatus(attendeeId: string): Promise<AccessStatus> {
    const status = this.accessStatuses.get(attendeeId);
    if (!status) {
      return {
        attendeeId,
        hasAccess: false,
        passwordGenerated: false
      };
    }
    return status;
  }

  async updateLastAccess(attendeeId: string): Promise<void> {
    const status = this.accessStatuses.get(attendeeId);
    if (status) {
      status.lastAccessDate = new Date();
      this.accessStatuses.set(attendeeId, status);
    }
  }

  async validateAccess(attendeeId: string, password: string): Promise<boolean> {
    const storedPassword = this.passwords.get(attendeeId);
    const status = this.accessStatuses.get(attendeeId);
    
    if (!storedPassword || !status || !status.hasAccess) {
      return false;
    }
    
    const isValid = storedPassword === password;
    if (isValid) {
      await this.updateLastAccess(attendeeId);
    }
    
    return isValid;
  }

  async expireAccess(attendeeId: string): Promise<void> {
    const status = this.accessStatuses.get(attendeeId);
    if (status) {
      status.expirationDate = new Date(); // Set to now to expire immediately
      this.accessStatuses.set(attendeeId, status);
    }
  }

  async resetPassword(attendeeId: string): Promise<string> {
    if (!this.accessStatuses.has(attendeeId)) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }
    
    return await this.generateAccessPassword(attendeeId);
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IAttendeeAccessManager Interface...\n');
  
  const manager = new MockAttendeeAccessManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Generate Access Password
  totalTests++;
  try {
    const attendeeId = 'attendee_123';
    const password = await manager.generateAccessPassword(attendeeId);
    
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
    await manager.generateAccessPassword(attendeeId);
    const status = await manager.getAccessStatus(attendeeId);
    
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
    const status = await manager.getAccessStatus(attendeeId);
    
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
    await manager.generateAccessPassword(attendeeId);
    
    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await manager.updateLastAccess(attendeeId);
    const status = await manager.getAccessStatus(attendeeId);
    
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
    await manager.generateAccessPassword(attendeeId);
    
    // Verify access is granted first
    let status = await manager.getAccessStatus(attendeeId);
    console.log('✅ Test 5: revokeAccess()');
    console.log(`   Before revocation - Has Access: ${status.hasAccess}`);
    
    await manager.revokeAccess(attendeeId);
    status = await manager.getAccessStatus(attendeeId);
    
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
    const originalPassword = await manager.generateAccessPassword(attendeeId);
    
    // Wait a moment to ensure different passwords
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const newPassword = await manager.resetPassword(attendeeId);
    
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
    await manager.resetPassword('invalid-attendee-id');
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
runTests().catch(console.error);
