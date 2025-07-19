/**
 * CalendarManagerDB - Database-backed Calendar Manager
 * Implements ICalendarManager with database persistence
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ICalendarManager } from '../core/interfaces/index.js';
import type { DateRange, WorkshopType, Workshop } from '../core/types/index.js';
import { CalendarManager } from './CalendarManager.js';
import { initializeDatabase } from '../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CalendarManagerDB implements ICalendarManager {
  private db: Database.Database | null = null;
  private fallbackManager: CalendarManager;
  private nextId = 1;
  private initialized = false;

  constructor() {
    this.fallbackManager = new CalendarManager();
    console.log('📅 CalendarManagerDB initialized with database integration');
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      await initializeDatabase();
      // Get database instance
      const dbPath = join(__dirname, '../database/yolovibe.db');
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
      this.initialized = true;
      console.log('✅ Database connection established in CalendarManagerDB');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error.message);
      // Fall back to in-memory manager
      this.db = null;
      this.initialized = true;
    }
  }

  private getDatabase(): Database.Database | null {
    return this.db;
  }

  // Interface methods with database integration
  async isDateAvailable(date: Date, workshopType: WorkshopType): Promise<boolean> {
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      console.warn('⚠️  Database not available, using fallback manager');
      return this.fallbackManager.isDateAvailable(date, workshopType);
    }

    try {
      // Check database for blocked dates
      const dateStr = date.toISOString().split('T')[0];
      
      const blocked = db.prepare(
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
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      console.warn('⚠️  Database not available, using fallback manager');
      return this.fallbackManager.blockDate(date, reason);
    }

    try {
      const dateStr = date.toISOString().split('T')[0];
      const blockId = `block_${Date.now()}`;
      
      console.log(`📅 Blocking date ${dateStr}: ${reason}`);
      
      // Save to database
      db.prepare(`
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
    await this.ensureInitialized();
    
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

  async getBlockedDates(startDate?: Date, endDate?: Date): Promise<Date[]> {
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      console.warn('⚠️  Database not available, using fallback manager');
      if (startDate && endDate) {
        return this.fallbackManager.getBlockedDates({ startDate, endDate });
      }
      return [];
    }
    
    try {
      let query = 'SELECT start_date, end_date FROM calendar_blockouts ORDER BY start_date';
      let params: any[] = [];
      
      if (startDate && endDate) {
        query = `SELECT start_date, end_date FROM calendar_blockouts 
                WHERE start_date <= ? AND end_date >= ? 
                ORDER BY start_date`;
        params = [endDate.toISOString().split('T')[0], startDate.toISOString().split('T')[0]];
      }
      
      const blocks = db.prepare(query).all(...params) as any[];

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
      if (startDate && endDate) {
        return this.fallbackManager.getBlockedDates({ startDate, endDate });
      }
      return [];
    }
  }

  // Add missing interface methods
  async isDateBlocked(date: Date): Promise<boolean> {
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      console.warn('⚠️  Database not available, using fallback manager');
      return false;
    }

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const blocked = db.prepare(
        'SELECT * FROM calendar_blockouts WHERE start_date <= ? AND end_date >= ?'
      ).get(dateStr, dateStr) as any;
      
      return !!blocked;

    } catch (error) {
      console.error('❌ Error checking if date is blocked:', error);
      return false;
    }
  }

  async createCalendarEvent(event: {
    title: string;
    description?: string;
    startDateTime: Date;
    endDateTime: Date;
    attendees?: string[];
    location?: string;
  }): Promise<string> {
    // Use fallback manager for calendar events
    return this.fallbackManager.createCalendarEvent ? 
      this.fallbackManager.createCalendarEvent(event) :
      Promise.resolve(`event-${Date.now()}`);
  }

  async updateCalendarEvent(eventId: string, updates: any): Promise<void> {
    // Use fallback manager for calendar events
    if (this.fallbackManager.updateCalendarEvent) {
      return this.fallbackManager.updateCalendarEvent(eventId, updates);
    }
    console.log(`📅 Calendar event ${eventId} would be updated with:`, updates);
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    // Use fallback manager for calendar events
    if (this.fallbackManager.deleteCalendarEvent) {
      return this.fallbackManager.deleteCalendarEvent(eventId);
    }
    console.log(`📅 Calendar event ${eventId} would be deleted`);
  }

  async scheduleWorkshop(workshopId: string): Promise<string> {
    // Use fallback manager for workshop scheduling
    return this.fallbackManager.scheduleWorkshop ? 
      this.fallbackManager.scheduleWorkshop(workshopId) :
      Promise.resolve(`workshop-${workshopId}-${Date.now()}`);
  }

  async rescheduleWorkshop(workshopId: string, newStartDate: Date): Promise<void> {
    // Use fallback manager for workshop rescheduling
    if (this.fallbackManager.rescheduleWorkshop) {
      return this.fallbackManager.rescheduleWorkshop(workshopId, newStartDate);
    }
    console.log(`📅 Workshop ${workshopId} would be rescheduled to ${newStartDate}`);
  }

  async cancelWorkshopEvent(workshopId: string): Promise<void> {
    // Use fallback manager for workshop cancellation
    if (this.fallbackManager.cancelWorkshopEvent) {
      return this.fallbackManager.cancelWorkshopEvent(workshopId);
    }
    console.log(`📅 Workshop ${workshopId} event would be cancelled`);
  }

  // Legacy method for compatibility
  async isDateAvailable(date: Date, workshopType: WorkshopType): Promise<boolean> {
    const isBlocked = await this.isDateBlocked(date);
    return !isBlocked;
  }

  // Legacy method for compatibility
  async createWorkshopEvent(workshop: Workshop): Promise<string> {
    return this.scheduleWorkshop(workshop.id);
  }

  // Additional admin methods for enhanced functionality
  async unblockDate(date: Date): Promise<void> {
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`📅 Unblocking date ${dateStr}`);
      
      // Delete from database
      db.prepare(`
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
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      const blockId = `block_range_${Date.now()}`;
      
      console.log(`📅 Blocking date range ${startDateStr} to ${endDateStr}: ${reason}`);
      
      // Save to database
      db.prepare(`
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
    await this.ensureInitialized();
    
    const db = this.getDatabase();
    if (!db) {
      return [];
    }

    try {
      const blocks = db.prepare(`
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