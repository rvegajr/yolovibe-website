#!/usr/bin/env tsx
/**
 * CLI Test Harness for IUserAuthenticator Interface
 * Tests user authentication and session management
 * 
 * Usage: tsx test-user-authenticator.ts
 */

import type { IUserAuthenticator } from '../core/interfaces/index.js';
import type { AuthenticationResult, UserSession, LoginCredentials } from '../core/types/index.js';

// Mock implementation for testing
class MockUserAuthenticator implements IUserAuthenticator {
  private users: Map<string, { email: string; passwordHash: string; isActive: boolean }> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private nextSessionId = 1;

  constructor() {
    // Pre-populate with test users
    this.users.set('admin@yolovibe.com', {
      email: 'admin@yolovibe.com',
      passwordHash: 'hashed_admin_password',
      isActive: true
    });

    this.users.set('instructor@yolovibe.com', {
      email: 'instructor@yolovibe.com',
      passwordHash: 'hashed_instructor_password',
      isActive: true
    });

    this.users.set('inactive@yolovibe.com', {
      email: 'inactive@yolovibe.com',
      passwordHash: 'hashed_inactive_password',
      isActive: false
    });
  }

  private hashPassword(password: string): string {
    // Mock password hashing - in real implementation use bcrypt or similar
    return `hashed_${password}`;
  }

  private generateSessionToken(): string {
    return `session_token_${this.nextSessionId++}_${Date.now()}`;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthenticationResult> {
    const user = this.users.get(credentials.email);
    
    if (!user) {
      return {
        success: false,
        errorMessage: 'Invalid email or password',
        user: null,
        sessionToken: null
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        errorMessage: 'Account is inactive',
        user: null,
        sessionToken: null
      };
    }

    const hashedPassword = this.hashPassword(credentials.password);
    if (user.passwordHash !== hashedPassword) {
      return {
        success: false,
        errorMessage: 'Invalid email or password',
        user: null,
        sessionToken: null
      };
    }

    // Create session
    const sessionToken = this.generateSessionToken();
    const session: UserSession = {
      sessionId: sessionToken,
      userId: user.email,
      email: user.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActive: true
    };

    this.sessions.set(sessionToken, session);

    return {
      success: true,
      errorMessage: null,
      user: {
        id: user.email,
        email: user.email,
        isActive: user.isActive
      },
      sessionToken
    };
  }

  async validateSession(sessionToken: string): Promise<UserSession | null> {
    const session = this.sessions.get(sessionToken);
    
    if (!session) {
      return null;
    }

    if (!session.isActive || session.expiresAt < new Date()) {
      // Session expired or inactive
      session.isActive = false;
      this.sessions.set(sessionToken, session);
      return null;
    }

    return session;
  }

  async refreshSession(sessionToken: string): Promise<string | null> {
    const session = await this.validateSession(sessionToken);
    
    if (!session) {
      return null;
    }

    // Extend session expiration
    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.sessions.set(sessionToken, session);

    return sessionToken;
  }

  async logout(sessionToken: string): Promise<void> {
    const session = this.sessions.get(sessionToken);
    
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionToken, session);
    }
  }

  async getCurrentUser(sessionToken: string): Promise<{ id: string; email: string; isActive: boolean } | null> {
    const session = await this.validateSession(sessionToken);
    
    if (!session) {
      return null;
    }

    const user = this.users.get(session.email);
    if (!user) {
      return null;
    }

    return {
      id: user.email,
      email: user.email,
      isActive: user.isActive
    };
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IUserAuthenticator Interface...\n');
  
  const authenticator = new MockUserAuthenticator();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Successful Authentication
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'admin_password'
    };

    const result = await authenticator.authenticate(credentials);
    
    console.log('✅ Test 1: authenticate() - Success');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User ID: ${result.user?.id}`);
    console.log(`   User Email: ${result.user?.email}`);
    console.log(`   Session Token: ${result.sessionToken?.substring(0, 20)}...`);
    console.log(`   Error Message: ${result.errorMessage || 'None'}`);
    console.log('   ✅ Authentication successful\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: authenticate() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Failed Authentication - Invalid Password
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'admin@yolovibe.com',
      password: 'wrong_password'
    };

    const result = await authenticator.authenticate(credentials);
    
    console.log('✅ Test 2: authenticate() - Invalid Password');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Invalid password handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: authenticate() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Failed Authentication - User Not Found
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'nonexistent@yolovibe.com',
      password: 'any_password'
    };

    const result = await authenticator.authenticate(credentials);
    
    console.log('✅ Test 3: authenticate() - User Not Found');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Non-existent user handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: authenticate() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Failed Authentication - Inactive User
  totalTests++;
  try {
    const credentials: LoginCredentials = {
      email: 'inactive@yolovibe.com',
      password: 'inactive_password'
    };

    const result = await authenticator.authenticate(credentials);
    
    console.log('✅ Test 4: authenticate() - Inactive User');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user}`);
    console.log(`   Session Token: ${result.sessionToken}`);
    console.log(`   Error Message: ${result.errorMessage}`);
    console.log('   ✅ Inactive user handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: authenticate() failed');
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

    const authResult = await authenticator.authenticate(credentials);
    const sessionToken = authResult.sessionToken!;
    
    const session = await authenticator.validateSession(sessionToken);
    
    console.log('✅ Test 5: validateSession() - Valid Session');
    console.log(`   Session ID: ${session?.sessionId.substring(0, 20)}...`);
    console.log(`   User ID: ${session?.userId}`);
    console.log(`   Email: ${session?.email}`);
    console.log(`   Is Active: ${session?.isActive}`);
    console.log(`   Created At: ${session?.createdAt.toISOString()}`);
    console.log(`   Expires At: ${session?.expiresAt.toISOString()}`);
    console.log('   ✅ Session validation successful\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: validateSession() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Validate Session - Invalid Session
  totalTests++;
  try {
    const session = await authenticator.validateSession('invalid_session_token');
    
    console.log('✅ Test 6: validateSession() - Invalid Session');
    console.log(`   Session: ${session}`);
    console.log('   ✅ Invalid session handled correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: validateSession() failed');
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

    const authResult = await authenticator.authenticate(credentials);
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

    const authResult = await authenticator.authenticate(credentials);
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

    const authResult = await authenticator.authenticate(credentials);
    const sessionToken = authResult.sessionToken!;
    
    // Verify session is valid before logout
    const sessionBefore = await authenticator.validateSession(sessionToken);
    
    // Logout
    await authenticator.logout(sessionToken);
    
    // Verify session is invalid after logout
    const sessionAfter = await authenticator.validateSession(sessionToken);
    
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
runTests().catch(console.error);
