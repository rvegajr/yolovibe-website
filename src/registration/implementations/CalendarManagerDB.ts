/**
 * CalendarManagerDB - Database-backed Calendar Manager
 * Extends the original CalendarManager with database persistence
 * Implements time blocking enforcement using the calendar_blockouts table
 */

import type { ICalendarManager } from '../core/interfaces/index.js';
import type { WorkshopType, Workshop, DateRange } from '../core/types/index.js';
import { CalendarManager } from './CalendarManager.js';
import { initializeDatabase } from '../database/connection.js';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CalendarManagerDB implements ICalendarManager {
  private db: Database.Database | null = null;
  private fallbackManager: CalendarManager;
  private nextId = 1;

  constructor() {
    this.fallbackManager = new CalendarManager();
    this.initializeDatabase();
    console.log('📅 CalendarManagerDB initialized with database integration');
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initializeDatabase();
      // Get database instance
      const dbPath = join(__dirname, '../database/yolovibe.db');
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
      console.log('✅ Database connection established in CalendarManagerDB');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }

  // Interface methods with database integration
  async isDateAvailable(date: Date, workshopType: WorkshopType): Promise<boolean> {
    try {
      if (!this.db) {
        console.warn('⚠️  Database not available, using fallback manager');
        return this.fallbackManager.isDateAvailable(date, workshopType);
      }
      
      // Check database for blocked dates
      const dateStr = date.toISOString().split('T')[0];
      
      const blocked = this.db.prepare(
        'SELECT * FROM calendar_blockouts WHERE start_date <= ? AND end_date >= ?'
      ).get(dateStr, dateStr) as any;
      
      if (blocked) {
        console.log(`📅 Date ${dateStr} is blocked: ${blocked.reason}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error checking date availability:', error);
      // Fall back to original manager
      return this.fallbackManager.isDateAvailable(date, workshopType);
    }
  }

  async blockDate(date: Date, reason: string): Promise<void> {
    try {
      if (!this.db) {
        console.warn('⚠️  Database not available, using fallback manager');
        return this.fallbackManager.blockDate(date, reason);
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const blockId = `block_${Date.now()}`;
      
      console.log(`📅 Blocking date ${dateStr}: ${reason}`);
      
      // Save to database
      this.db.prepare(`
        INSERT INTO calendar_blockouts (id, start_date, end_date, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(blockId, dateStr, dateStr, reason, 'admin');
      
      console.log(`✅ Date blocked successfully in database`);
      
      // Also block in fallback manager for consistency
      await this.fallbackManager.blockDate(date, reason);
      
    } catch (error) {
      console.error('❌ Error blocking date:', error);
      throw new Error(`Failed to block date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createWorkshopEvent(workshop: Workshop): Promise<string> {
    try {
      // Use fallback manager for event creation (keeps existing logic)
      const eventId = await this.fallbackManager.createWorkshopEvent(workshop);
      
      console.log(`✅ Workshop event created successfully (Event ID: ${eventId})`);
      return eventId;
      
    } catch (error) {
      console.error('❌ Error creating workshop event:', error);
      throw new Error(`Failed to create workshop event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBlockedDates(dateRange: DateRange): Promise<Date[]> {
    try {
      if (!this.db) {
        console.warn('⚠️  Database not available, using fallback manager');
        return this.fallbackManager.getBlockedDates(dateRange);
      }
      
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      const blocks = this.db.prepare(`
        SELECT start_date, end_date FROM calendar_blockouts 
        WHERE start_date <= ? AND end_date >= ?
        ORDER BY start_date
      `).all(endDate, startDate) as any[];
      
      const blockedDates: Date[] = [];
      
      for (const block of blocks) {
        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        
        // Add all dates in the blocked range
        for (let d = new Date(blockStart); d <= blockEnd; d.setDate(d.getDate() + 1)) {
          blockedDates.push(new Date(d));
        }
      }
      
      return blockedDates;
      
    } catch (error) {
      console.error('❌ Error getting blocked dates:', error);
      return this.fallbackManager.getBlockedDates(dateRange);
    }
  }

  // Additional admin methods for enhanced functionality
  async unblockDate(date: Date): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not available');
      }
      
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`📅 Unblocking date ${dateStr}`);
      
      // Delete from database
      this.db.prepare(`
        DELETE FROM calendar_blockouts 
        WHERE start_date <= ? AND end_date >= ?
      `).run(dateStr, dateStr);
      
      console.log(`✅ Date ${dateStr} unblocked successfully`);
      
    } catch (error) {
      console.error('❌ Error unblocking date:', error);
      throw new Error(`Failed to unblock date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async blockDateRange(startDate: Date, endDate: Date, reason: string): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not available');
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      const blockId = `block_range_${Date.now()}`;
      
      console.log(`📅 Blocking date range ${startDateStr} to ${endDateStr}: ${reason}`);
      
      // Save to database
      this.db.prepare(`
        INSERT INTO calendar_blockouts (id, start_date, end_date, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(blockId, startDateStr, endDateStr, reason, 'admin');
      
      console.log(`✅ Date range blocked successfully`);
      
    } catch (error) {
      console.error('❌ Error blocking date range:', error);
      throw new Error(`Failed to block date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all blocks for admin UI
  async getAllBlocks(): Promise<any[]> {
    try {
      if (!this.db) {
        return [];
      }
      
      const blocks = this.db.prepare(`
        SELECT id, start_date, end_date, reason, created_by, created_at
        FROM calendar_blockouts 
        ORDER BY start_date
      `).all() as any[];
      
      return blocks;
      
    } catch (error) {
      console.error('❌ Error getting all blocks:', error);
      return [];
    }
  }
} 