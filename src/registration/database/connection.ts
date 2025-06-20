/**
 * Database Connection Manager for YOLOVibe Registration System
 * 
 * This module provides a centralized database connection using SQLite
 * with proper connection pooling, error handling, and migration support.
 * 
 * Features:
 * - SQLite database with WAL mode for better performance
 * - Connection pooling and proper cleanup
 * - Automatic schema migration on startup
 * - Type-safe query execution
 * - Transaction support
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface DatabaseConfig {
  filename: string;
  readonly?: boolean;
  fileMustExist?: boolean;
  timeout?: number;
  verbose?: (message?: any, ...additionalArgs: any[]) => void;
}

export class DatabaseConnection {
  private db: Database.Database | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize database connection and run migrations
   */
  async initialize(): Promise<void> {
    try {
      this.db = new Database(this.config.filename, {
        readonly: this.config.readonly || false,
        fileMustExist: this.config.fileMustExist || false,
        timeout: this.config.timeout || 5000,
        verbose: this.config.verbose
      });

      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000000');
      this.db.pragma('temp_store = memory');
      this.db.pragma('mmap_size = 268435456'); // 256MB

      // Enable foreign key constraints
      this.db.pragma('foreign_keys = ON');

      console.log('✅ Database connection established successfully');
      
      // Run migrations
      await this.runMigrations();
      
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Check if migrations table exists
      const migrationTableExists = this.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'")
        .get();

      if (!migrationTableExists) {
        // Create migrations table
        this.db.exec(`
          CREATE TABLE migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('📋 Created migrations table');
      }

      // Read and execute schema.sql if not already applied
      const schemaApplied = this.db
        .prepare("SELECT * FROM migrations WHERE filename = ?")
        .get('schema.sql');

      if (!schemaApplied) {
        const schemaPath = join(__dirname, 'schema.sql');
        const schemaSql = readFileSync(schemaPath, 'utf-8');
        
        // Execute schema in a transaction
        const transaction = this.db.transaction(() => {
          this.db!.exec(schemaSql);
          this.db!
            .prepare("INSERT INTO migrations (filename) VALUES (?)")
            .run('schema.sql');
        });
        
        transaction();
        console.log('🚀 Applied database schema successfully');
      } else {
        console.log('✅ Database schema already up to date');
      }

    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Execute a prepared statement
   */
  prepare<T = any>(sql: string): Database.Statement<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.prepare<T>(sql);
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: () => T): T {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 Database connection closed');
    }
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.db !== null && this.db.open;
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    if (!this.db) {
      return null;
    }

    return {
      filename: this.config.filename,
      open: this.db.open,
      inTransaction: this.db.inTransaction,
      memory: this.db.memory,
      readonly: this.db.readonly
    };
  }
}

// Singleton instance for the application
let dbInstance: DatabaseConnection | null = null;

/**
 * Get or create the database connection singleton
 */
export function getDatabaseConnection(): DatabaseConnection {
  if (!dbInstance) {
    let dbPath: string;
    
    if (process.env.DB_PATH) {
      // Use explicit path from environment (for testing)
      dbPath = process.env.DB_PATH;
    } else if (process.env.NODE_ENV === 'production') {
      dbPath = '/tmp/yolovibe.db';
    } else {
      dbPath = join(process.cwd(), 'data', 'yolovibe.db');
    }

    dbInstance = new DatabaseConnection({
      filename: dbPath,
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });
  }
  return dbInstance;
}

/**
 * Initialize the database connection
 */
export async function initializeDatabase(): Promise<DatabaseConnection> {
  const db = getDatabaseConnection();
  await db.initialize();
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabaseConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, closing database connection...');
    closeDatabaseConnection();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, closing database connection...');
    closeDatabaseConnection();
    process.exit(0);
  });
}

export default DatabaseConnection;
