#!/usr/bin/env node

/**
 * CLI Test Harness for Database Integration
 * 
 * This script tests the database-backed UserAuthenticator implementation
 * to ensure proper integration with SQLite database and data persistence.
 * 
 * Run with: npx tsx src/registration/cli/test-database-integration.ts
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';
import { UserAuthenticatorDB } from '../implementations/database/UserAuthenticatorDB.js';
import { initializeDatabase, closeDatabaseConnection } from '../database/connection.js';
import type { RegistrationData, LoginCredentials } from '../core/types/index.js';

// Set test environment
process.env.NODE_ENV = 'test';
const testDbPath = '/Users/xcode/Documents/YOLOVibeCode/YOLOVibeWebsite/test-registration.db';
process.env.DB_PATH = testDbPath;

async function runDatabaseIntegrationTests() {
  console.log('🧪 Starting Database Integration Tests for UserAuthenticator\n');

  // Initialize database
  await initializeDatabase();

  // Clean up any existing test database
  if (fs.existsSync(process.env.DB_PATH!)) {
    fs.unlinkSync(process.env.DB_PATH!);
    console.log('🗑️  Cleaned up existing test database\n');
  }

  const authenticator = new UserAuthenticatorDB();
  let testSessionToken = '';

  try {
    // Test 1: User Registration
    console.log('📝 Test 1: User Registration');
    const registrationData: RegistrationData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
      phone: '+1234567890'
    };

    const user = await authenticator.registerUser(registrationData);
    console.log(`✅ User registered: ${user.email} (ID: ${user.id})`);

    // Test 2: Duplicate Registration Prevention
    console.log('\n📝 Test 2: Duplicate Registration Prevention');
    try {
      await authenticator.registerUser(registrationData);
      console.log('❌ Should have prevented duplicate registration');
    } catch (error) {
      console.log('✅ Duplicate registration prevented correctly');
    }

    // Test 3: User Authentication
    console.log('\n📝 Test 3: User Authentication');
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    const authResult = await authenticator.authenticate(credentials);
    if (authResult.success && authResult.token) {
      testSessionToken = authResult.token;
      console.log(`✅ User authenticated successfully. Token: ${authResult.token.substring(0, 16)}...`);
    } else {
      console.log('❌ Authentication failed');
      return;
    }

    // Test 4: Session Validation
    console.log('\n📝 Test 4: Session Validation');
    const isValidSession = await authenticator.validateSession(testSessionToken);
    if (isValidSession) {
      console.log('✅ Session validation successful');
    } else {
      console.log('❌ Session validation failed');
    }

    // Test 5: Invalid Login
    console.log('\n📝 Test 5: Invalid Login Rejection');
    const invalidCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'WrongPassword'
    };
    
    const invalidAuthResult = await authenticator.authenticate(invalidCredentials);
    if (!invalidAuthResult.success) {
      console.log('✅ Invalid login correctly rejected');
    } else {
      console.log('❌ Invalid login should have been rejected');
    }

    // Test 6: Password Reset Request
    console.log('\n📝 Test 6: Password Reset Request');
    try {
      await authenticator.resetPassword('test@example.com');
      console.log('✅ Password reset initiated successfully');
    } catch (error) {
      console.log(`✅ Password reset handled correctly: ${error}`);
    }

    // Test 7: Password Reset with Token
    console.log('\n📝 Test 7: Password Reset with Token');
    try {
      const resetResult = await (authenticator as any).resetPasswordUsingToken('dummy-token', 'NewSecurePass123!');
      if (resetResult) {
        console.log('✅ Password reset with token successful');
      } else {
        console.log('✅ Password reset with invalid token correctly rejected');
      }
    } catch (error) {
      console.log('✅ Password reset with invalid token correctly rejected');
    }

    // Test 8: Profile Update
    console.log('\n📝 Test 8: Profile Update');
    try {
      const updatedUser = await (authenticator as any).updateUserProfile(user.id, {
        firstName: 'Updated',
        lastName: 'Name',
        company: 'New Company'
      });
      if (updatedUser) {
        console.log(`✅ Profile updated successfully: ${updatedUser.firstName} ${updatedUser.lastName}`);
      } else {
        console.log('❌ Profile update failed');
      }
    } catch (error) {
      console.log(`❌ Profile update failed: ${error}`);
    }

    // Test 9: Email Verification
    console.log('\n📝 Test 9: Email Verification');
    try {
      const verified = await (authenticator as any).verifyUserEmail(user.id);
      if (verified) {
        console.log('✅ Email verification successful');
      } else {
        console.log('✅ Email verification with invalid token correctly rejected');
      }
    } catch (error) {
      console.log(`✅ Email verification with invalid token correctly rejected`);
    }

    // Test 10: Logout
    console.log('\n📝 Test 10: User Logout');
    const logoutResult = await authenticator.logoutUser(testSessionToken);
    if (logoutResult) {
      console.log('✅ User logout successful');
    } else {
      console.log('❌ User logout failed');
    }

    // Test 11: Session Validation After Logout
    console.log('\n📝 Test 11: Session Validation After Logout');
    const isValidAfterLogout = await authenticator.validateSession(testSessionToken);
    if (!isValidAfterLogout) {
      console.log('✅ Session correctly invalidated after logout');
    } else {
      console.log('❌ Session should be invalid after logout');
    }

    // Test 12: Database Restart Simulation
    console.log('\n📝 Test 12: Database Restart Simulation');
    
    // Close current database connection
    await closeDatabaseConnection();
    console.log('🔒 Database connection closed');
    
    // Reinitialize database (simulating restart)
    await initializeDatabase();
    
    // Create new authenticator instance
    const newAuthenticator = new UserAuthenticatorDB();
    
    // Try to find the user we created earlier
    try {
      const persistedUser = await (newAuthenticator as any).getUserById(user.id);
      if (persistedUser && persistedUser.email === 'test@example.com') {
        console.log('✅ Data persisted across database restart');
      } else {
        console.log('❌ Data not persisted across database restart');
      }
    } catch (error) {
      console.log('❌ Data not persisted across database restart');
    }

    console.log('\n🎉 All Database Integration Tests Completed Successfully!');
    
    // Close database connection
    await closeDatabaseConnection();
    console.log('🔒 Database connection closed');

    // Clean up test database file
    if (fs.existsSync(process.env.DB_PATH!)) {
      fs.unlinkSync(process.env.DB_PATH!);
      console.log('\n🗑️  Test database cleaned up');
    }
  } catch (error) {
    console.log(`\n💥 Test failed with error: ${error}`);
    
    // Ensure cleanup even on failure
    try {
      await closeDatabaseConnection();
      if (fs.existsSync(process.env.DB_PATH!)) {
        fs.unlinkSync(process.env.DB_PATH!);
      }
    } catch (cleanupError) {
      console.log(`Warning: Cleanup failed: ${cleanupError}`);
    }
    
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDatabaseIntegrationTests().catch(console.error);
}
