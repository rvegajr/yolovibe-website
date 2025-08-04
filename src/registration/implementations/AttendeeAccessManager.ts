/**
 * AttendeeAccessManager - Concrete Implementation
 * Attendee access control system
 * Simple, focused implementation - no over-engineering!
 */

import type { IAttendeeAccessManager } from '../core/interfaces/index.js';
import type { AccessStatus } from '../core/types/index.js';

interface AttendeeAccess {
  attendeeId: string;
  password: string;
  hasAccess: boolean;
  passwordGenerated: boolean;
  lastAccessDate?: Date;
  expirationDate?: Date;
}

export class AttendeeAccessManager implements IAttendeeAccessManager {
  private accessRecords: Map<string, AttendeeAccess> = new Map();

  constructor() {
    // Only populate test data in development/test environments
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.initializeTestData();
    }
  }

  private initializeTestData(): void {
    // Test data for CLI testing - only used in development
    const testRecords = [
      {
        attendeeId: 'attendee_456',
        password: this.generateTestPassword(),
        hasAccess: true,
        passwordGenerated: true,
        lastAccessDate: new Date('2025-06-15'),
        expirationDate: new Date('2025-07-20')
      },
      {
        attendeeId: 'attendee_789',
        password: this.generateTestPassword(),
        hasAccess: true,
        passwordGenerated: true,
        lastAccessDate: new Date('2025-06-10'),
        expirationDate: new Date('2025-08-01')
      },
      {
        attendeeId: 'attendee_revoke',
        password: this.generateTestPassword(),
        hasAccess: true,
        passwordGenerated: true,
        lastAccessDate: new Date('2025-06-01'),
        expirationDate: new Date('2025-07-15')
      },
      {
        attendeeId: 'attendee_reset',
        password: this.generateTestPassword(),
        hasAccess: true,
        passwordGenerated: true,
        lastAccessDate: new Date('2025-06-05'),
        expirationDate: new Date('2025-07-25')
      }
    ];

    testRecords.forEach(record => {
      this.accessRecords.set(record.attendeeId, record);
    });
  }

  private generateTestPassword(): string {
    // Generate a test password dynamically (not hardcoded)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = 'YOLO-';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async generateAccessPassword(attendeeId: string): Promise<string> {
    // Generate a YOLO-style password (YOLO-XXXXXX format)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = 'YOLO-';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create or update access record
    const existingRecord = this.accessRecords.get(attendeeId);
    const accessRecord: AttendeeAccess = {
      attendeeId,
      password,
      hasAccess: true,
      passwordGenerated: true,
      lastAccessDate: existingRecord?.lastAccessDate,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    this.accessRecords.set(attendeeId, accessRecord);
    return password;
  }

  async validateAccess(attendeeId: string, password: string): Promise<boolean> {
    const record = this.accessRecords.get(attendeeId);
    if (!record) {
      return false;
    }

    if (!record.hasAccess) {
      return false;
    }

    if (record.expirationDate && record.expirationDate < new Date()) {
      return false;
    }

    return record.password === password;
  }

  async expireAccess(attendeeId: string): Promise<void> {
    const record = this.accessRecords.get(attendeeId);
    if (record) {
      record.expirationDate = new Date(); // Set to current time (expired)
      this.accessRecords.set(attendeeId, record);
    }
  }

  async getAccessStatus(attendeeId: string): Promise<AccessStatus> {
    const record = this.accessRecords.get(attendeeId);
    
    if (!record) {
      // Return default status for attendees without access records
      return {
        attendeeId,
        hasAccess: false,
        passwordGenerated: false
      };
    }

    return {
      attendeeId: record.attendeeId,
      hasAccess: record.hasAccess,
      passwordGenerated: record.passwordGenerated,
      lastAccessDate: record.lastAccessDate,
      expirationDate: record.expirationDate
    };
  }

  // Additional methods expected by CLI test (not in interface)
  async updateLastAccess(attendeeId: string): Promise<void> {
    const record = this.accessRecords.get(attendeeId);
    if (record) {
      record.lastAccessDate = new Date();
      this.accessRecords.set(attendeeId, record);
    } else {
      // Create new record if doesn't exist
      const newRecord: AttendeeAccess = {
        attendeeId,
        password: '',
        hasAccess: false,
        passwordGenerated: false,
        lastAccessDate: new Date()
      };
      this.accessRecords.set(attendeeId, newRecord);
    }
  }

  async revokeAccess(attendeeId: string): Promise<void> {
    const record = this.accessRecords.get(attendeeId);
    if (record) {
      record.hasAccess = false;
      this.accessRecords.set(attendeeId, record);
    }
  }

  async resetPassword(attendeeId: string): Promise<string> {
    const record = this.accessRecords.get(attendeeId);
    if (!record) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }

    // Generate new password
    const newPassword = await this.generateAccessPassword(attendeeId);
    return newPassword;
  }
}
