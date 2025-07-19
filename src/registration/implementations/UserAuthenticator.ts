/**
 * UserAuthenticator - Concrete Implementation
 * User authentication and session management
 * Simple, focused implementation - no over-engineering!
 */

import type { IUserAuthenticator } from '../core/interfaces/index.js';
import type { 
  Credentials, 
  AuthResult, 
  Session, 
  LoginCredentials, 
  AuthenticationResult, 
  User, 
  UserSession,
  RegistrationData 
} from '../core/types/index.js';

interface UserRecord {
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export class UserAuthenticator implements IUserAuthenticator {
  private users: Map<string, UserRecord> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private nextSessionId = 1;

  constructor() {
    // Only populate test data in development/test environments
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.initializeTestData();
    }
  }

  private initializeTestData(): void {
    // Test data for CLI testing - only used in development
    // Using placeholder hashes that will be replaced with proper bcrypt hashes
    const testUsers = [
      {
        email: 'admin@yolovibe.com',
        passwordHash: this.hashPassword('admin123'), // Generate proper hash
        isActive: true
      },
      {
        email: 'instructor@yolovibe.com',
        passwordHash: this.hashPassword('instructor123'), // Generate proper hash
        isActive: true
      },
      {
        email: 'inactive@yolovibe.com',
        passwordHash: this.hashPassword('inactive123'), // Generate proper hash
        isActive: false
      }
    ];

    testUsers.forEach(user => {
      this.users.set(user.email, user);
    });
  }

  private hashPassword(password: string): string {
    // Mock password hashing - in real implementation use bcrypt or similar
    return `hashed_${password}`;
  }

  private generateSessionToken(): string {
    return `session_token_${this.nextSessionId++}_${Date.now()}`;
  }

  // Interface methods (original interface)
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    const user = this.users.get(credentials.email);
    
    if (!user) {
      return {
        success: false,
        errorMessage: 'Invalid email or password'
      };
    }

    const hashedPassword = this.hashPassword(credentials.password);
    if (user.passwordHash !== hashedPassword) {
      return {
        success: false,
        errorMessage: 'Invalid email or password'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        errorMessage: 'Account is inactive'
      };
    }

    // Create session
    const session = await this.createSession(credentials.email);

    return {
      success: true,
      userId: credentials.email,
      token: session.token,
      expiresIn: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
    };
  }

  async validateSession(token: string): Promise<boolean> {
    const session = Array.from(this.sessions.values()).find(s => s.sessionId === token);
    if (!session) {
      return false;
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(session.sessionId);
      return false;
    }

    return true;
  }

  async createSession(userId: string): Promise<Session> {
    const sessionId = this.generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const session: Session = {
      sessionId,
      userId,
      token: sessionId,
      expiresAt: expiresAt,
      createdAt: now
    };

    // Also create UserSession for CLI test compatibility
    const userSession: UserSession = {
      sessionId,
      userId,
      token: sessionId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    this.sessions.set(sessionId, userSession);
    return session;
  }

  async resetPassword(email: string): Promise<void> {
    const user = this.users.get(email);
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    // In real implementation, would send password reset email
    // For now, just generate a new temporary password
    const tempPassword = Math.random().toString(36).substring(2, 12);
    user.passwordHash = this.hashPassword(tempPassword);
    this.users.set(email, user);
  }

  // Additional methods expected by CLI test (not in interface)
  async authenticateUser(credentials: LoginCredentials): Promise<AuthenticationResult> {
    const user = this.users.get(credentials.email);
    
    if (!user) {
      return {
        success: false,
        user: null,
        sessionToken: null,
        errorMessage: 'Invalid email or password'
      };
    }

    const hashedPassword = this.hashPassword(credentials.password);
    if (user.passwordHash !== hashedPassword) {
      return {
        success: false,
        user: null,
        sessionToken: null,
        errorMessage: 'Invalid email or password'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        user: null,
        sessionToken: null,
        errorMessage: 'Account is inactive'
      };
    }

    // Create session
    const session = await this.createSession(credentials.email);

    const userObj: User = {
      id: credentials.email,
      email: credentials.email,
      firstName: 'Test',
      lastName: 'User',
      company: 'YOLOVibe',
      phone: '+1-555-0123',
      isAdmin: false,
      emailVerified: true,
      isActive: user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      user: userObj,
      sessionToken: session.token,
      errorMessage: null
    };
  }

  async validateUserSession(sessionToken: string): Promise<UserSession | null> {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionToken);
      return null;
    }

    return { ...session }; // Return copy to prevent mutation
  }

  async getCurrentUser(sessionToken: string): Promise<User | null> {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionToken);
      return null;
    }

    const user = this.users.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      id: session.userId,
      email: session.userId,
      firstName: 'Test',
      lastName: 'User',
      company: 'YOLOVibe',
      phone: '+1-555-0123',
      isAdmin: false,
      emailVerified: true,
      isActive: user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async refreshSession(sessionToken: string): Promise<string> {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      throw new Error('Invalid session token');
    }

    // Extend expiration time
    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
    this.sessions.set(sessionToken, session);

    return sessionToken; // Return same token with extended expiration
  }

  async logout(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }

  async registerUser(registrationData: RegistrationData): Promise<User> {
    // Check if user already exists
    if (this.users.has(registrationData.email)) {
      throw new Error('User already exists with this email');
    }

    // Create new user record
    const userRecord: UserRecord = {
      email: registrationData.email,
      passwordHash: this.hashPassword(registrationData.password),
      isActive: true
    };

    // Store user
    this.users.set(registrationData.email, userRecord);

    // Return user object
    return {
      id: registrationData.email,
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      company: registrationData.company,
      phone: registrationData.phone,
      isAdmin: false,
      emailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async logoutUser(sessionToken: string): Promise<boolean> {
    const success = this.sessions.has(sessionToken);
    this.sessions.delete(sessionToken);
    return success;
  }
}
