/**
 * CalendarManagerEnhanced - Database Integration
 * Connects existing CalendarManager to database for time blocking enforcement
 * Phase 1: Database integration (Google Calendar integration in Phase 2)
 */

import type { ICalendarManager } from '../core/interfaces/index.js';
import type { CalendarEvent, WorkshopType, Workshop, DateRange } from '../core/types/index.js';
import { initializeDatabase } from '../database/connection.js';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CalendarManagerEnhanced implements ICalendarManager {
  private db: Database.Database | null = null;
  private events: Map<string, CalendarEvent> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeDatabase();
    console.log('📅 CalendarManagerEnhanced initialized with database integration');
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initializeDatabase();
      // Get database instance
      const dbPath = join(__dirname, '../database/yolovibe.db');
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }

  // Interface methods (original interface)
  async isDateAvailable(date: Date, _workshopType: WorkshopType): Promise<boolean> {
    try {
      if (!this.db) {
        console.warn('⚠️  Database not initialized, allowing date');
        return true;
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
      // Fall back to allowing the date if database check fails
      return true;
    }
  }

  async blockDate(date: Date, reason: string): Promise<void> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const blockId = `block_${Date.now()}`;
      
      console.log(`📅 Blocking date ${dateStr}: ${reason}`);
      
      // 1. Save to database
      await this.database.prepare(`
        INSERT INTO calendar_blockouts (id, start_date, end_date, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(blockId, dateStr, dateStr, reason, 'admin');
      
      // 2. Create BLOCKED event in Google Calendar
      try {
        const googleEvent = await this.googleCalendarService.createEvent({
          summary: `BLOCKED: ${reason}`,
          start: { date: dateStr },
          end: { date: dateStr },
          description: `Admin blocked this date - no bookings allowed. Reason: ${reason}`,
          colorId: '11' // Red color for blocked events
        });
        
        // 3. Store Google Calendar event ID for later deletion
        if (googleEvent.id) {
          await this.database.prepare(`
            UPDATE calendar_blockouts 
            SET google_calendar_event_id = ?
            WHERE id = ?
          `).run(googleEvent.id, blockId);
          
          console.log(`✅ Date blocked successfully in database and Google Calendar (Event ID: ${googleEvent.id})`);
        }
      } catch (googleError) {
        console.warn('⚠️  Database block created but Google Calendar sync failed:', googleError);
        // Continue - database block is more important than Google Calendar sync
      }
      
    } catch (error) {
      console.error('❌ Error blocking date:', error);
      throw new Error(`Failed to block date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createWorkshopEvent(workshop: Workshop): Promise<string> {
    try {
      console.log(`📅 Creating workshop event for ${workshop.id}`);
      
      // Create event in Google Calendar
      const googleEvent = await this.googleCalendarService.createEvent({
        summary: `YOLOVibe Workshop - ${workshop.productId}`,
        description: `Workshop ID: ${workshop.id}\nStart: ${workshop.startDate}\nEnd: ${workshop.endDate}`,
        start: {
          dateTime: workshop.startDate.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: workshop.endDate.toISOString(),
          timeZone: 'America/New_York'
        },
        location: 'YOLOVibe Training Center',
        colorId: '2' // Green color for workshops
      });
      
      const eventId = googleEvent.id || `cal_event_${this.nextId++}`;
      
      // Also store in local events map for CLI test compatibility
      const event: CalendarEvent = {
        id: eventId,
        title: `YOLOVibe Workshop - ${workshop.productId}`,
        description: `Workshop from ${workshop.startDate} to ${workshop.endDate}`,
        startDateTime: new Date(workshop.startDate),
        endDateTime: new Date(workshop.endDate),
        location: 'YOLOVibe Training Center',
        attendees: [],
        isAllDay: false,
        status: 'confirmed',
        workshopId: workshop.id
      };
      
      this.events.set(eventId, event);
      
      console.log(`✅ Workshop event created successfully (Event ID: ${eventId})`);
      return eventId;
      
    } catch (error) {
      console.error('❌ Error creating workshop event:', error);
      throw new Error(`Failed to create workshop event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBlockedDates(dateRange: DateRange): Promise<Date[]> {
    try {
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      const blocks = await this.database.prepare(`
        SELECT start_date, end_date FROM calendar_blockouts 
        WHERE start_date <= ? AND end_date >= ?
        ORDER BY start_date
      `).all(endDate, startDate);
      
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
      return []; // Return empty array if database query fails
    }
  }

  // Additional admin methods for enhanced functionality
  async unblockDate(date: Date): Promise<void> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`📅 Unblocking date ${dateStr}`);
      
      // Get the Google Calendar event ID before deleting
      const block = await this.database.prepare(`
        SELECT google_calendar_event_id FROM calendar_blockouts 
        WHERE start_date <= ? AND end_date >= ?
      `).get(dateStr, dateStr);
      
      if (block && block.google_calendar_event_id) {
        try {
          // Delete from Google Calendar
          await this.googleCalendarService.deleteEvent(block.google_calendar_event_id);
          console.log(`✅ Deleted Google Calendar event: ${block.google_calendar_event_id}`);
        } catch (googleError) {
          console.warn('⚠️  Google Calendar deletion failed:', googleError);
        }
      }
      
      // Delete from database
      await this.database.prepare(`
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
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      const blockId = `block_range_${Date.now()}`;
      
      console.log(`📅 Blocking date range ${startDateStr} to ${endDateStr}: ${reason}`);
      
      // 1. Save to database
      await this.database.prepare(`
        INSERT INTO calendar_blockouts (id, start_date, end_date, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(blockId, startDateStr, endDateStr, reason, 'admin');
      
      // 2. Create BLOCKED event in Google Calendar for the range
      try {
        const googleEvent = await this.googleCalendarService.createEvent({
          summary: `BLOCKED: ${reason}`,
          start: { date: startDateStr },
          end: { date: endDateStr },
          description: `Admin blocked date range - no bookings allowed. Reason: ${reason}`,
          colorId: '11' // Red color for blocked events
        });
        
        // 3. Store Google Calendar event ID
        if (googleEvent.id) {
          await this.database.prepare(`
            UPDATE calendar_blockouts 
            SET google_calendar_event_id = ?
            WHERE id = ?
          `).run(googleEvent.id, blockId);
          
          console.log(`✅ Date range blocked successfully (Event ID: ${googleEvent.id})`);
        }
      } catch (googleError) {
        console.warn('⚠️  Database block created but Google Calendar sync failed:', googleError);
      }
      
    } catch (error) {
      console.error('❌ Error blocking date range:', error);
      throw new Error(`Failed to block date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 