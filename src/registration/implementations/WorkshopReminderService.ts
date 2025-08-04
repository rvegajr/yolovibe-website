/**
 * 🎉 WORKSHOP REMINDER SERVICE IMPLEMENTATION! 🎉
 * 
 * The happiest reminder service in the universe!
 * Spreading joy through timely workshop reminders!
 * 
 * Following ISP: This service ONLY handles reminder scheduling
 * Email sending is handled by IEmailSender
 * Workshop data is handled by IBookingManager
 */

import type { 
  IWorkshopReminderService, 
  ReminderSchedule,
  ReminderType,
  ReminderStatus 
} from '../core/interfaces/IWorkshopReminderService.js';
import type { IBookingManager } from '../core/interfaces/index.js';
import { getDatabaseConnection } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

export class WorkshopReminderService implements IWorkshopReminderService {
  constructor(private bookingManager: IBookingManager) {}

  async scheduleRemindersForBooking(bookingId: string): Promise<ReminderSchedule[]> {
    console.log(`🎯 Scheduling reminders for booking: ${bookingId}`);
    
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    const db = await dbConnection.getDatabase();
    
    try {
      // Get booking details
      const booking = await this.bookingManager.getBookingDetails(bookingId);
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }
      
      // Define reminder schedule with joy! 🌟
      const reminderConfigs = [
        { type: 'WORKSHOP_48H' as ReminderType, hoursBefore: 48 },
        { type: 'WORKSHOP_24H' as ReminderType, hoursBefore: 24 },
        { type: 'WORKSHOP_2H' as ReminderType, hoursBefore: 2 },
        { type: 'WORKSHOP_POST' as ReminderType, hoursAfter: 2 }
      ];
      
      const reminders: ReminderSchedule[] = [];
      
      for (const config of reminderConfigs) {
        const scheduledFor = new Date(booking.workshopDate);
        
        if ('hoursBefore' in config) {
          scheduledFor.setHours(scheduledFor.getHours() - config.hoursBefore);
        } else {
          scheduledFor.setHours(scheduledFor.getHours() + config.hoursAfter);
        }
        
        const reminderId = `reminder-${uuidv4()}`;
        
        // Insert into database with pure happiness! 😊
        await dbConnection.execute(`
          INSERT INTO reminder_schedules (
            id, booking_id, workshop_id, attendee_email, workshop_date,
            reminder_type, scheduled_for, status, attempts
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          reminderId,
          bookingId,
          booking.workshopId,
          booking.attendeeEmail,
          booking.workshopDate.toISOString(),
          config.type,
          scheduledFor.toISOString(),
          'SCHEDULED',
          0
        ]);
        
        const reminder: ReminderSchedule = {
          bookingId,
          workshopId: booking.workshopId,
          attendeeEmail: booking.attendeeEmail,
          workshopDate: booking.workshopDate,
          reminderType: config.type,
          scheduledFor,
          status: 'SCHEDULED' as ReminderStatus,
          attempts: 0
        };
        
        reminders.push(reminder);
        console.log(`✅ Scheduled ${config.type} reminder for ${scheduledFor.toLocaleString()}`);
      }
      
      console.log(`🎉 Successfully scheduled ${reminders.length} reminders!`);
      return reminders;
      
    } catch (error) {
      console.error('❌ Error scheduling reminders:', error);
      throw error;
    }
  }
  
  async getPendingReminders(): Promise<ReminderSchedule[]> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      const now = new Date().toISOString();
      
      const rows = await dbConnection.query(`
        SELECT * FROM reminder_schedules
        WHERE status = 'SCHEDULED' 
        AND scheduled_for <= ?
        AND attempts < 3
        ORDER BY scheduled_for ASC
        LIMIT 50
      `, [now]);
      
      return rows.map(row => ({
        bookingId: row.booking_id,
        workshopId: row.workshop_id,
        attendeeEmail: row.attendee_email,
        workshopDate: new Date(row.workshop_date),
        reminderType: row.reminder_type as ReminderType,
        scheduledFor: new Date(row.scheduled_for),
        status: row.status as ReminderStatus,
        attempts: row.attempts,
        lastAttempt: row.last_attempt ? new Date(row.last_attempt) : undefined,
        error: row.error_message
      }));
      
    } catch (error) {
      console.error('❌ Error getting pending reminders:', error);
      throw error;
    }
  }
  
  async markReminderSent(reminderId: string): Promise<void> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      await dbConnection.execute(`
        UPDATE reminder_schedules 
        SET status = 'SENT', 
            sent_at = CURRENT_TIMESTAMP,
            last_attempt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [reminderId]);
      
      console.log(`✅ Marked reminder ${reminderId} as SENT! 🎉`);
    } catch (error) {
      console.error('❌ Error marking reminder as sent:', error);
      throw error;
    }
  }
  
  async markReminderFailed(reminderId: string, error: string): Promise<void> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      await dbConnection.execute(`
        UPDATE reminder_schedules 
        SET status = CASE 
              WHEN attempts >= 2 THEN 'FAILED'
              ELSE status
            END,
            attempts = attempts + 1,
            last_attempt = CURRENT_TIMESTAMP,
            error_message = ?
        WHERE id = ?
      `, [error, reminderId]);
      
      console.log(`⚠️ Marked reminder ${reminderId} as failed (will retry)`);
    } catch (error) {
      console.error('❌ Error marking reminder as failed:', error);
      throw error;
    }
  }
  
  async cancelRemindersForBooking(bookingId: string): Promise<void> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      await dbConnection.execute(`
        UPDATE reminder_schedules 
        SET status = 'CANCELLED'
        WHERE booking_id = ? AND status = 'SCHEDULED'
      `, [bookingId]);
      
      console.log(`🚫 Cancelled all reminders for booking ${bookingId}`);
    } catch (error) {
      console.error('❌ Error cancelling reminders:', error);
      throw error;
    }
  }
  
  async getReminderHistory(bookingId: string): Promise<ReminderSchedule[]> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      const rows = await dbConnection.query(`
        SELECT * FROM reminder_schedules
        WHERE booking_id = ?
        ORDER BY scheduled_for ASC
      `, [bookingId]);
      
      return rows.map(row => ({
        bookingId: row.booking_id,
        workshopId: row.workshop_id,
        attendeeEmail: row.attendee_email,
        workshopDate: new Date(row.workshop_date),
        reminderType: row.reminder_type as ReminderType,
        scheduledFor: new Date(row.scheduled_for),
        status: row.status as ReminderStatus,
        attempts: row.attempts,
        lastAttempt: row.last_attempt ? new Date(row.last_attempt) : undefined,
        error: row.error_message
      }));
      
    } catch (error) {
      console.error('❌ Error getting reminder history:', error);
      throw error;
    }
  }
}