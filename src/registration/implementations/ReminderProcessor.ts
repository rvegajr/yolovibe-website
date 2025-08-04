/**
 * 🚀 REMINDER PROCESSOR - THE HEART OF JOY! 🚀
 * 
 * Processing reminders with enthusiasm and reliability!
 * Bringing smiles to workshop attendees everywhere!
 */

import type { 
  IReminderProcessor,
  IWorkshopReminderService,
  IReminderTemplateProvider,
  ReminderSchedule 
} from '../core/interfaces/IWorkshopReminderService.js';
import type { IEmailSender, IBookingManager } from '../core/interfaces/index.js';
// For Node.js compatibility, we'll emit events only if available
import { LocalEventTypes } from '../../events/EventTypes.js';

// Helper to safely emit events
function emitEvent(eventType: string, data: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).globalEventBus) {
      (window as any).globalEventBus.emit(eventType, data);
    }
  } catch (error) {
    // Ignore in Node.js environment
  }
}

export class ReminderProcessor implements IReminderProcessor {
  constructor(
    private reminderService: IWorkshopReminderService,
    private templateProvider: IReminderTemplateProvider,
    private emailSender: IEmailSender,
    private bookingManager: IBookingManager
  ) {
    console.log('🎉 Reminder Processor initialized with JOY!');
  }
  
  async processReminder(reminder: ReminderSchedule): Promise<void> {
    console.log(`🎯 Processing ${reminder.reminderType} reminder for ${reminder.attendeeEmail}`);
    
    try {
      // Get booking details with excitement! 🌟
      const booking = await this.bookingManager.getBookingDetails(reminder.bookingId);
      if (!booking) {
        throw new Error(`Booking not found: ${reminder.bookingId}`);
      }
      
      // Get the beautiful template! 🎨
      const template = await this.templateProvider.getTemplate(reminder.reminderType);
      
      // Prepare data for template population
      const workshopDate = new Date(booking.workshopDate);
      const templateData = {
        attendeeName: booking.attendeeName || 'Awesome Attendee',
        workshopName: booking.workshopName || 'Amazing Workshop',
        workshopDate: workshopDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        workshopTime: workshopDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        location: booking.location,
        zoomLink: booking.zoomLink
      };
      
      // Populate templates with joy! 🌈
      const subject = this.templateProvider.populateTemplate(template.subject, templateData);
      const htmlContent = this.templateProvider.populateTemplate(template.htmlContent, templateData);
      const textContent = this.templateProvider.populateTemplate(template.textContent, templateData);
      
      // Send the email with love! 💌
      const result = await this.emailSender.sendEmail(
        reminder.attendeeEmail,
        subject,
        htmlContent,
        textContent
      );
      
      if (result.success) {
        // Mark as sent with celebration! 🎊
        await this.reminderService.markReminderSent(reminder.bookingId);
        
        // Emit success event
        emitEvent(LocalEventTypes.EMAIL_SENT, {
          type: 'workshop_reminder',
          reminderType: reminder.reminderType,
          to: reminder.attendeeEmail,
          subject,
          messageId: result.messageId
        });
        
        console.log(`✅ Successfully sent ${reminder.reminderType} reminder to ${reminder.attendeeEmail}!`);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to process reminder: ${errorMessage}`);
      
      // Mark as failed but with hope for retry! 💪
      await this.reminderService.markReminderFailed(reminder.bookingId, errorMessage);
      
      // Emit error event
      emitEvent(LocalEventTypes.ERROR_OCCURRED, {
        error: errorMessage,
        context: 'ReminderProcessor',
        reminderType: reminder.reminderType,
        attendeeEmail: reminder.attendeeEmail
      });
      
      throw error;
    }
  }
  
  async processPendingReminders(): Promise<number> {
    console.log('🚀 Starting to process pending reminders with MAXIMUM JOY!');
    
    try {
      // Get all pending reminders
      const pendingReminders = await this.reminderService.getPendingReminders();
      console.log(`📬 Found ${pendingReminders.length} pending reminders to process!`);
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process each reminder with care and enthusiasm! 🌟
      for (const reminder of pendingReminders) {
        try {
          await this.processReminder(reminder);
          successCount++;
          
          // Small delay to avoid overwhelming email service
          await this.delay(1000); // 1 second between emails
          
        } catch (error) {
          failureCount++;
          console.error(`Failed to process reminder for ${reminder.attendeeEmail}:`, error);
          // Continue processing other reminders
        }
      }
      
      // Emit summary event
      emitEvent(LocalEventTypes.BATCH_PROCESS_COMPLETED, {
        type: 'reminder_processing',
        total: pendingReminders.length,
        success: successCount,
        failed: failureCount
      });
      
      console.log(`🎉 Reminder processing complete!`);
      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Failed: ${failureCount} (will retry later)`);
      
      return successCount;
      
    } catch (error) {
      console.error('❌ Critical error in reminder processing:', error);
      throw error;
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}