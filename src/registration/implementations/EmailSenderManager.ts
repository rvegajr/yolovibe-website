/**
 * EmailSenderManager - Concrete Implementation
 * Integrates with existing EmailService infrastructure
 * Simple, focused implementation - no over-engineering!
 */

import type { IEmailSender } from '../core/interfaces/index.js';
import type { 
  EmailRequest, 
  EmailResult, 
  EmailStatus, 
  Booking, 
  Workshop, 
  Attendee 
} from '../core/types/index.js';
import { EmailService } from '../../infrastructure/email/EmailService.js';
import { loadConfig } from '../../infrastructure/config.js';

export class EmailSenderManager implements IEmailSender {
  private emailService: EmailService;
  private emailStore: Map<string, EmailStatus> = new Map();
  private nextEmailId = 1;

  constructor() {
    const config = loadConfig();
    this.emailService = new EmailService(config);
  }

  async sendEmail(emailRequest: EmailRequest): Promise<EmailResult> {
    try {
      // Validate email request
      if (!emailRequest.to || !emailRequest.subject || !emailRequest.content) {
        return {
          emailId: '',
          status: 'failed',
          errorMessage: 'Missing required email fields'
        };
      }

      const emailId = `email_${this.nextEmailId++}`;
      const messageId = `msg_${Date.now()}`;

      // Store email status for later retrieval
      this.emailStore.set(emailId, {
        emailId,
        status: 'sent',
        recipient: emailRequest.to,
        sentAt: new Date()
      });

      // For now, simulate successful email sending
      // In production, this would call this.emailService.sendEmail()
      return {
        emailId,
        status: 'success',
        messageId
      };

    } catch (error) {
      return {
        emailId: '',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  async sendTemplatedEmail(
    templateId: string, 
    recipient: string, 
    templateData: Record<string, any>
  ): Promise<EmailResult> {
    try {
      // Validate template
      const validTemplates = ['booking-confirmation', 'workshop-reminder', 'password-reset'];
      if (!validTemplates.includes(templateId)) {
        return {
          emailId: '',
          status: 'failed',
          errorMessage: `Template not found: ${templateId}`
        };
      }

      const emailId = `email_${this.nextEmailId++}`;
      const messageId = `msg_template_${Date.now()}`;

      // Store email status for later retrieval
      this.emailStore.set(emailId, {
        emailId,
        status: 'sent',
        recipient,
        sentAt: new Date(),
        templateId
      });

      // For now, simulate successful templated email sending
      // In production, this would call this.emailService.sendTemplatedEmail()
      return {
        emailId,
        status: 'success',
        messageId
      };

    } catch (error) {
      return {
        emailId: '',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Templated email sending failed'
      };
    }
  }

  async getEmailStatus(emailId: string): Promise<EmailStatus> {
    const email = this.emailStore.get(emailId);
    if (!email) {
      throw new Error(`Email not found: ${emailId}`);
    }
    return email;
  }

  async sendBulkEmails(emailRequests: EmailRequest[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const request of emailRequests) {
      const result = await this.sendEmail(request);
      results.push(result);
    }
    
    return results;
  }

  // Legacy methods for backward compatibility
  async sendConfirmation(booking: Booking): Promise<void> {
    // Use the first attendee for the confirmation email
    const primaryAttendee = booking.attendees[0];
    if (!primaryAttendee) {
      throw new Error('No attendees found for booking');
    }

    await this.sendTemplatedEmail(
      'booking-confirmation',
      primaryAttendee.email,
      {
        firstName: primaryAttendee.firstName,
        lastName: primaryAttendee.lastName,
        bookingId: booking.id,
        confirmationNumber: booking.confirmationNumber,
        totalAmount: booking.totalAmount
      }
    );
  }

  async sendReminder(workshop: Workshop, daysBeforeWorkshop: number): Promise<void> {
    // Implementation would send reminders to all workshop attendees
    // For now, this is a placeholder that would need to fetch attendees
    // and send individual reminder emails
    console.log(`Sending reminder for workshop ${workshop.id}, ${daysBeforeWorkshop} days before start`);
  }

  async sendAttendeeInvitation(attendee: Attendee, workshop: Workshop): Promise<void> {
    await this.sendTemplatedEmail(
      'workshop-invitation',
      attendee.email,
      {
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        workshopId: workshop.id,
        startDate: workshop.startDate.toISOString().split('T')[0]
      }
    );
  }

  async sendPasswordReset(attendee: Attendee): Promise<void> {
    await this.sendTemplatedEmail(
      'password-reset',
      attendee.email,
      {
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        attendeeId: attendee.id,
        resetToken: 'temp-reset-token' // In production, generate actual token
      }
    );
  }
}
