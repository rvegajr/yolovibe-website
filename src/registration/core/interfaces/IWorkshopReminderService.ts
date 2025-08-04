/**
 * Workshop Reminder Service Interface
 * 
 * Following Interface Segregation Principle (ISP):
 * - Focused solely on reminder scheduling and management
 * - No email sending logic (that's IEmailSender's job)
 * - No workshop data management (that's IBookingManager's job)
 */

export interface ReminderSchedule {
  bookingId: string;
  workshopId: string;
  attendeeEmail: string;
  workshopDate: Date;
  reminderType: ReminderType;
  scheduledFor: Date;
  status: ReminderStatus;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export enum ReminderType {
  WORKSHOP_48H = 'WORKSHOP_48H',      // 48 hours before
  WORKSHOP_24H = 'WORKSHOP_24H',      // 24 hours before
  WORKSHOP_2H = 'WORKSHOP_2H',        // 2 hours before
  WORKSHOP_POST = 'WORKSHOP_POST'     // After workshop
}

export enum ReminderStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface IWorkshopReminderService {
  /**
   * Schedule all reminders for a booking
   */
  scheduleRemindersForBooking(bookingId: string): Promise<ReminderSchedule[]>;
  
  /**
   * Get pending reminders that need to be sent
   */
  getPendingReminders(): Promise<ReminderSchedule[]>;
  
  /**
   * Mark a reminder as sent
   */
  markReminderSent(reminderId: string): Promise<void>;
  
  /**
   * Mark a reminder as failed with error
   */
  markReminderFailed(reminderId: string, error: string): Promise<void>;
  
  /**
   * Cancel all reminders for a booking
   */
  cancelRemindersForBooking(bookingId: string): Promise<void>;
  
  /**
   * Get reminder history for a booking
   */
  getReminderHistory(bookingId: string): Promise<ReminderSchedule[]>;
}

/**
 * Reminder Processor - Separate interface for processing logic
 * Following ISP: Scheduling and processing are separate concerns
 */
export interface IReminderProcessor {
  /**
   * Process a single reminder
   */
  processReminder(reminder: ReminderSchedule): Promise<void>;
  
  /**
   * Process all pending reminders
   */
  processPendingReminders(): Promise<number>; // Returns count of processed
}

/**
 * Reminder Template Provider - Separate interface for content
 * Following ISP: Template management is a separate concern
 */
export interface IReminderTemplateProvider {
  /**
   * Get email template for a reminder type
   */
  getTemplate(reminderType: ReminderType): Promise<{
    subject: string;
    htmlContent: string;
    textContent: string;
  }>;
  
  /**
   * Populate template with booking data
   */
  populateTemplate(
    template: string,
    data: {
      attendeeName: string;
      workshopName: string;
      workshopDate: string;
      workshopTime: string;
      location?: string;
      zoomLink?: string;
    }
  ): string;
}