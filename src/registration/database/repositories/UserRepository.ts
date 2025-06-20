/**
 * User Repository for YOLOVibe Registration System
 * 
 * Handles all database operations related to users, authentication,
 * and session management. Supports the IUserAuthenticator interface
 * with persistent storage.
 * 
 * Features:
 * - User CRUD operations
 * - Password hashing and verification
 * - Session token management
 * - Password reset functionality
 * - Email verification
 * - Admin user management
 */

import { BaseRepository } from './BaseRepository.js';
import type { User, UserSession, PasswordResetRequest } from '../../core/types/index.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  company: string | null;
  phone: string | null;
  is_admin: number;
  email_verified: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  password_reset_token: string | null;
  password_reset_expires: string | null;
  session_token: string | null;
  session_expires: string | null;
}

export class UserRepository extends BaseRepository {

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const userId = this.generateId();
    const query = `
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, company, phone, 
        is_admin, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const params = [
      userId,
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.company || null,
      userData.phone || null,
      userData.isAdmin ? 1 : 0, // Convert boolean to integer
      userData.emailVerified ? 1 : 0, // Convert boolean to integer
    ];

    this.execute(query, params);

    this.logOperation('CREATE', 'users', { email: userData.email });

    // Return the created user
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const row = this.findOne<UserRow>(sql, [email.toLowerCase()]);
    
    return row ? this.mapRowToUser(row) : null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const row = this.findOne<UserRow>(sql, [id]);
    
    return row ? this.mapRowToUser(row) : null;
  }

  /**
   * Find user by session token
   */
  async findBySessionToken(token: string): Promise<User | null> {
    const sql = `
      SELECT * FROM users 
      WHERE session_token = ? 
      AND session_expires > datetime('now')
    `;
    const row = this.findOne<UserRow>(sql, [token]);
    
    return row ? this.mapRowToUser(row) : null;
  }

  /**
   * Update user information
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<User | null> {
    const dataToUpdate = {
      ...updateData,
      updated_at: this.getCurrentTimestamp()
    };

    this.logOperation('UPDATE', 'users', { id, ...updateData });

    const { set, params } = this.buildUpdateClause(this.toSnakeCase(dataToUpdate));
    const sql = `UPDATE users SET ${set} WHERE id = ?`;
    
    const result = this.execute(sql, [...params, id]);
    
    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET password_hash = ?, updated_at = ? 
      WHERE id = ?
    `;
    
    const result = this.execute(sql, [passwordHash, this.getCurrentTimestamp(), id]);
    return result.changes > 0;
  }

  /**
   * Create or update user session
   */
  async createSession(userId: string, sessionToken: string, expiresAt: Date): Promise<UserSession> {
    const sql = `
      UPDATE users 
      SET session_token = ?, session_expires = ?, last_login_at = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const now = this.getCurrentTimestamp();
    const result = this.execute(sql, [
      sessionToken,
      expiresAt.toISOString(),
      now,
      now,
      userId
    ]);

    if (result.changes === 0) {
      throw new Error('User not found');
    }

    this.logOperation('CREATE_SESSION', 'users', { userId });

    return {
      sessionId: sessionToken,
      userId,
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: now
    };
  }

  /**
   * Invalidate user session
   */
  async invalidateSession(userId: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET session_token = NULL, session_expires = NULL, updated_at = ?
      WHERE id = ?
    `;
    
    const result = this.execute(sql, [this.getCurrentTimestamp(), userId]);
    
    this.logOperation('INVALIDATE_SESSION', 'users', { userId });
    
    return result.changes > 0;
  }

  /**
   * Create password reset request
   */
  async createPasswordResetRequest(userId: string, resetToken: string, expiresAt: Date): Promise<PasswordResetRequest> {
    const sql = `
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const now = this.getCurrentTimestamp();
    const result = this.execute(sql, [
      resetToken,
      expiresAt.toISOString(),
      now,
      userId
    ]);

    if (result.changes === 0) {
      throw new Error('User not found');
    }

    this.logOperation('CREATE_PASSWORD_RESET', 'users', { userId });

    return {
      userId,
      token: resetToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: now
    };
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    const sql = `
      SELECT * FROM users 
      WHERE password_reset_token = ? 
      AND password_reset_expires > datetime('now')
    `;
    const row = this.findOne<UserRow>(sql, [token]);
    
    return row ? this.mapRowToUser(row) : null;
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(userId: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL, updated_at = ?
      WHERE id = ?
    `;
    
    const result = this.execute(sql, [this.getCurrentTimestamp(), userId]);
    return result.changes > 0;
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET email_verified = 1, updated_at = ?
      WHERE id = ?
    `;
    
    const result = this.execute(sql, [this.getCurrentTimestamp(), userId]);
    return result.changes > 0;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists('users', 'email', email.toLowerCase());
  }

  /**
   * Get all admin users
   */
  async findAdminUsers(): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE is_admin = 1 ORDER BY created_at DESC';
    const rows = this.findMany<UserRow>(sql);
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    recentUsers: number;
  }> {
    const stats = this.transaction(() => {
      const totalUsers = this.findOne<{ count: number }>('SELECT COUNT(*) as count FROM users')?.count || 0;
      
      const verifiedUsers = this.findOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE email_verified = 1'
      )?.count || 0;
      
      const adminUsers = this.findOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE is_admin = 1'
      )?.count || 0;
      
      const recentUsers = this.findOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM users WHERE created_at > datetime('now', '-30 days')"
      )?.count || 0;

      return { totalUsers, verifiedUsers, adminUsers, recentUsers };
    });

    return stats;
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(id: string): Promise<boolean> {
    // For now, we'll actually delete the user
    // In production, you might want to implement soft delete
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = this.execute(sql, [id]);
    
    this.logOperation('DELETE', 'users', { id });
    
    return result.changes > 0;
  }

  /**
   * Map database row to User object
   */
  private mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      company: row.company || undefined,
      phone: row.phone || undefined,
      isAdmin: row.is_admin === 1,
      emailVerified: row.email_verified === 1,
      isActive: true, // All users in database are active
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at || undefined
    };
  }
}
