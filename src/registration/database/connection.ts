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
import { readFileSync, existsSync, mkdirSync } from 'fs';
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
      // Handle Vercel serverless environment
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // Use in-memory database for Vercel serverless functions
        console.log('🔧 Vercel environment detected, using in-memory database');
        this.db = new Database(':memory:', {
          readonly: false,
          fileMustExist: false,
          timeout: this.config.timeout || 5000,
          verbose: this.config.verbose
        });
      } else {
        // Use file-based database for local development
        console.log(`📁 Local environment, using database: ${this.config.filename}`);
        
        // Ensure directory exists
        const dataDir = dirname(this.config.filename);
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
          console.log(`📁 Created data directory: ${dataDir}`);
        }
        
        this.db = new Database(this.config.filename, {
          readonly: this.config.readonly || false,
          fileMustExist: this.config.fileMustExist || false,
          timeout: this.config.timeout || 5000,
          verbose: this.config.verbose
        });
      }

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
        // Try multiple possible paths for schema.sql
        const possiblePaths = [
          join(__dirname, 'schema.sql'),
          join(process.cwd(), 'src', 'registration', 'database', 'schema.sql'),
          join(process.cwd(), 'dist', 'registration', 'database', 'schema.sql'),
          join(process.cwd(), 'schema.sql')
        ];
        
        let schemaSql = '';
        let schemaPath = '';
        
        for (const path of possiblePaths) {
          try {
            if (existsSync(path)) {
              schemaSql = readFileSync(path, 'utf-8');
              schemaPath = path;
              break;
            }
          } catch (error) {
            // Continue to next path
            continue;
          }
        }
        
        if (!schemaSql) {
          console.warn('⚠️ Schema file not found, creating basic tables manually');
          // Create basic tables manually if schema.sql is not found
          schemaSql = `
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              company TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bookings (
              id TEXT PRIMARY KEY,
              product_id TEXT NOT NULL,
              start_date TEXT NOT NULL,
              attendee_count INTEGER NOT NULL,
              status TEXT DEFAULT 'confirmed',
              total_amount REAL NOT NULL,
              coupon_code TEXT,
              point_of_contact TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS attendees (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              booking_id TEXT NOT NULL,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              email TEXT NOT NULL,
              company TEXT,
              dietary_restrictions TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (booking_id) REFERENCES bookings(id)
            );

            CREATE TABLE IF NOT EXISTS calendar_blocks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL UNIQUE,
              reason TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS coupons (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              code TEXT UNIQUE NOT NULL,
              discount_percentage INTEGER NOT NULL,
              usage_limit INTEGER,
              usage_count INTEGER DEFAULT 0,
              active BOOLEAN DEFAULT 1,
              expires_at DATETIME,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `;
        }
        
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
  prepare<T extends {} | unknown[] = any>(sql: string): Database.Statement<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.prepare<T>(sql);
  }

  /**
   * Execute a transaction
   */
  transaction<T extends {} | unknown[] = any>(fn: () => T): T {
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
