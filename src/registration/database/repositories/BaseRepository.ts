/**
 * Base Repository Class for YOLOVibe Registration System
 * 
 * Provides common database operations and utilities that all
 * repositories can inherit from. Follows the Repository pattern
 * to abstract database operations from business logic.
 * 
 * Features:
 * - Type-safe CRUD operations
 * - Transaction support
 * - Error handling and logging
 * - Query building utilities
 * - Pagination support
 */

import Database from 'better-sqlite3';
import { getDatabaseConnection } from '../connection.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository {
  protected db: Database.Database;

  constructor() {
    this.db = getDatabaseConnection().getDatabase();
  }

  /**
   * Generate a unique ID for database records
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute a query and return a single result
   */
  protected findOne<T>(sql: string, params: any[] = []): T | null {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params) as T | undefined;
      return result || null;
    } catch (error) {
      console.error('Database query error (findOne):', error);
      throw error;
    }
  }

  /**
   * Execute a query and return multiple results
   */
  protected findMany<T>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (error) {
      console.error('Database query error (findMany):', error);
      throw error;
    }
  }

  /**
   * Execute an insert/update/delete query
   */
  protected execute(sql: string, params: any[] = []): Database.RunResult {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('Database execution error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  protected transaction<T>(fn: () => T): T {
    try {
      const transaction = this.db.transaction(fn);
      return transaction();
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  /**
   * Build a paginated query with sorting
   */
  protected buildPaginatedQuery(
    baseQuery: string,
    options: PaginationOptions = {}
  ): { sql: string; countSql: string; offset: number; limit: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let sql = baseQuery;
    
    // Add sorting if specified
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'ASC';
      sql += ` ORDER BY ${options.sortBy} ${sortOrder}`;
    }

    // Add pagination
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    // Build count query
    const countSql = baseQuery.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as count FROM');

    return { sql, countSql, offset, limit };
  }

  /**
   * Execute a paginated query
   */
  protected findPaginated<T>(
    baseQuery: string,
    params: any[] = [],
    options: PaginationOptions = {}
  ): PaginatedResult<T> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));

    const { sql, countSql } = this.buildPaginatedQuery(baseQuery, options);

    // Get total count
    const countResult = this.findOne<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    const data = this.findMany<T>(sql, params);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Check if a record exists
   */
  protected exists(table: string, field: string, value: any): boolean {
    const sql = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = this.findOne(sql, [value]);
    return result !== null;
  }

  /**
   * Get the current timestamp in ISO format
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Sanitize input for SQL queries (basic protection)
   */
  protected sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }
    // Remove potentially dangerous characters
    return input.replace(/['"\\;]/g, '');
  }

  /**
   * Build WHERE clause from conditions object
   */
  protected buildWhereClause(conditions: Record<string, any>): { where: string; params: any[] } {
    const keys = Object.keys(conditions).filter(key => conditions[key] !== undefined);
    
    if (keys.length === 0) {
      return { where: '', params: [] };
    }

    const whereParts = keys.map(key => `${key} = ?`);
    const params = keys.map(key => conditions[key]);

    return {
      where: `WHERE ${whereParts.join(' AND ')}`,
      params
    };
  }

  /**
   * Build UPDATE SET clause from data object
   */
  protected buildUpdateClause(data: Record<string, any>): { set: string; params: any[] } {
    const keys = Object.keys(data).filter(key => data[key] !== undefined);
    
    if (keys.length === 0) {
      throw new Error('No data provided for update');
    }

    const setParts = keys.map(key => `${key} = ?`);
    const params = keys.map(key => data[key]);

    return {
      set: setParts.join(', '),
      params
    };
  }

  /**
   * Build INSERT clause from data object
   */
  protected buildInsertClause(data: Record<string, any>): { columns: string; values: string; params: any[] } {
    const keys = Object.keys(data).filter(key => data[key] !== undefined);
    
    if (keys.length === 0) {
      throw new Error('No data provided for insert');
    }

    const columns = keys.join(', ');
    const values = keys.map(() => '?').join(', ');
    const params = keys.map(key => data[key]);

    return {
      columns,
      values,
      params
    };
  }

  /**
   * Log database operation for debugging
   */
  protected logOperation(operation: string, table: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 DB ${operation} on ${table}:`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, any>, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Convert database row to camelCase object
   */
  protected toCamelCase(row: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    
    return result;
  }

  /**
   * Convert camelCase object to snake_case for database
   */
  protected toSnakeCase(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    
    return result;
  }
}
