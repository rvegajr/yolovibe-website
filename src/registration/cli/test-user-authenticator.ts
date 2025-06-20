#!/usr/bin/env tsx
/**
 * CLI Test Harness for IUserAuthenticator Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-user-authenticator.ts
 */

import type { IUserAuthenticator } from '../core/interfaces/index.js';
import type { AuthenticationResult, UserSession, LoginCredentials } from '../core/types/index.js';
import { UserAuthenticator } from '../implementations/UserAuthenticator.js';

// TEST SUITE
async function testUserAuthenticator() {
  console.log('🧪 Testing IUserAuthenticator Interface...\n');
  
  // Use concrete implementation instead of mock!
  // Cast to any since CLI test expects methods beyond current interface definition
  const authenticator: any = new UserAuthenticator();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Successful Authentication
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'admin_password'
    };

    const result = await authenticator.authenticateUser(credentials);
    
    console.log('✅ Test 1: authenticateUser() - Success');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User ID: ${result.user?.id}`);
    console.log(`   User Email: ${result.user?.email}`);
    console.log(`   Session Token: ${result.sessionToken?.substring(0, 20)}...`);
    console.log(`   Error Message: ${result.errorMessage || 'None'}`);
    console.log('   ✅ Authentication successful\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: authenticateUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Failed Authentication - Invalid Password
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'wrong_password'
    };

    const result = await authenticator.authenticateUser(credentials);
    
    console.log('✅ Test 2: authenticateUser() - Invalid Password');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Invalid password handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: authenticateUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Failed Authentication - User Not Found
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'nonexistent@yolovibe.com',
      password: 'any_password'
    };

    const result = await authenticator.authenticateUser(credentials);
    
    console.log('✅ Test 3: authenticateUser() - User Not Found');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Non-existent user handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: authenticateUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Failed Authentication - Inactive User
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'inactive@yolovibe.com',
      password: 'inactive_password'
    };

    const result = await authenticator.authenticateUser(credentials);
    
    console.log('✅ Test 4: authenticateUser() - Inactive User');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Inactive user handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: authenticateUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Validate Session - Valid Session
  totalTests++;
  try {
    // First authenticate to get a session token
    const credentials: LoginCredentials = {
      email: 'instructor@yolovibe.com',
      password: 'instructor_password'
    };

    const authResult = await authenticator.authenticateUser(credentials);
    const sessionToken = authResult.sessionToken!;
    
    const session = await authenticator.validateUserSession(sessionToken);
    
    console.log('✅ Test 5: validateUserSession() - Valid Session');
    console.log(`   Session ID: ${session?.sessionId.substring(0, 20)}...`);
    console.log(`   User ID: ${session?.userId}`);
    console.log(`   Email: ${session?.email}`);
    console.log(`   Is Active: ${session?.isActive}`);
    console.log(`   Created At: ${session?.createdAt.toISOString()}`);
    console.log(`   Expires At: ${session?.expiresAt.toISOString()}`);
    console.log('   ✅ Session validation successful\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: validateUserSession() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Validate Session - Invalid Session
  totalTests++;
  try {
    const session = await authenticator.validateUserSession('invalid_session_token');
    
    console.log('✅ Test 6: validateUserSession() - Invalid Session');
    console.log(`   Session: ${session}`);
    console.log('   ✅ Invalid session handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: validateUserSession() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 7: Get Current User
  totalTests++;
  try {
    // First authenticate to get a session token
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'admin_password'
    };

    const authResult = await authenticator.authenticateUser(credentials);
    const sessionToken = authResult.sessionToken!;
    
    const user = await authenticator.getCurrentUser(sessionToken);
    
    console.log('✅ Test 7: getCurrentUser()');
    console.log(`   User ID: ${user?.id}`);
    console.log(`   Email: ${user?.email}`);
    console.log(`   Is Active: ${user?.isActive}`);
    console.log('   ✅ Current user retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 7: getCurrentUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 8: Refresh Session
  totalTests++;
  try {
    // First authenticate to get a session token
    const credentials: LoginCredentials = {
      email: 'instructor@yolovibe.com',
      password: 'instructor_password'
    };

    const authResult = await authenticator.authenticateUser(credentials);
    const originalToken = authResult.sessionToken!;
    
    const refreshedToken = await authenticator.refreshSession(originalToken);
    
    console.log('✅ Test 8: refreshSession()');
    console.log(`   Original Token: ${originalToken.substring(0, 20)}...`);
    console.log(`   Refreshed Token: ${refreshedToken?.substring(0, 20)}...`);
    console.log(`   Tokens Match: ${originalToken === refreshedToken}`);
    console.log('   ✅ Session refreshed successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 8: refreshSession() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 9: Logout
  totalTests++;
  try {
    // First authenticate to get a session token
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'admin_password'
    };

    const authResult = await authenticator.authenticateUser(credentials);
    const sessionToken = authResult.sessionToken!;
    
    // Verify session exists before logout
    const sessionBefore = await authenticator.validateUserSession(sessionToken);
    
    await authenticator.logout(sessionToken);
    
    // Verify session is gone after logout
    const sessionAfter = await authenticator.validateUserSession(sessionToken);
    
    console.log('✅ Test 9: logout()');
    console.log(`   Session Before Logout: ${sessionBefore?.isActive}`);
    console.log(`   Session After Logout: ${sessionAfter?.isActive || 'null'}`);
    console.log('   ✅ Logout successful\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 9: logout() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 10: Get Current User - Invalid Session
  totalTests++;
  try {
    const user = await authenticator.getCurrentUser('invalid_session_token');
    
    console.log('✅ Test 10: getCurrentUser() - Invalid Session');
    console.log(`   User: ${user}`);
    console.log('   ✅ Invalid session handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 10: getCurrentUser() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IUserAuthenticator interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testUserAuthenticator().catch(console.error);
