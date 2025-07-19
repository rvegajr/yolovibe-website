/**
 * Follow-up Email Manager for YOLOVibe Workshop Registration
 * Handles automated email sequences after purchase completion
 */

import type { 
  IEmailSender,
  IBookingManager
} from '../core/interfaces/index.js';
import type { 
  EmailRequest
} from '../core/types/index.js';
import { EmailSenderManager } from './EmailSenderManager.js';
import { BookingManagerDB } from './database/BookingManagerDB.js';

export interface FollowUpEmailSchedule {
  purchaseId: string;
  bookingId: string;
  attendeeEmail: string;
  attendeeName: string;
  workshopStartDate: Date;
  emailsSent: string[];
  nextEmailDue?: Date;
}

export class FollowUpEmailManager {
  private emailSender: IEmailSender;
  private bookingManager: IBookingManager;
  private schedules = new Map<string, FollowUpEmailSchedule>();

  constructor(
    emailSender?: IEmailSender,
    bookingManager?: IBookingManager
  ) {
    this.emailSender = emailSender || new EmailSenderManager();
    this.bookingManager = bookingManager || new BookingManagerDB();
  }

  /**
   * Schedule follow-up emails for a completed purchase
   */
  async scheduleFollowUpEmails(
    purchaseId: string,
    bookingId: string,
    attendeeEmail: string,
    attendeeName: string,
    workshopStartDate: Date
  ): Promise<void> {
    console.log(`📅 Scheduling follow-up emails for purchase: ${purchaseId}`);

    const schedule: FollowUpEmailSchedule = {
      purchaseId,
      bookingId,
      attendeeEmail,
      attendeeName,
      workshopStartDate,
      emailsSent: [],
      nextEmailDue: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    this.schedules.set(purchaseId, schedule);

    // Send immediate welcome email
    await this.sendWelcomeEmail(schedule);
  }

  /**
   * Send welcome email immediately after purchase
   */
  private async sendWelcomeEmail(schedule: FollowUpEmailSchedule): Promise<void> {
    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: 'Welcome to YOLOVibe Workshop - Important Next Steps',
      content: `Dear ${schedule.attendeeName},

Welcome to YOLOVibe! We're excited to have you join our upcoming workshop.

🎯 WHAT'S NEXT:

1. Workshop Preparation Guide (arriving in 24 hours)
2. Pre-workshop materials and reading list
3. Technical setup instructions
4. Workshop location and logistics
5. Final reminder 48 hours before workshop

📅 Your Workshop Details:
   • Start Date: ${schedule.workshopStartDate.toLocaleDateString()}
   • Booking ID: ${schedule.bookingId}
   • Purchase ID: ${schedule.purchaseId}

🔗 IMPORTANT LINKS:
   • Workshop Portal: https://portal.yolovibe.com/workshop/${schedule.bookingId}
   • Support: support@yolovibe.com
   • Emergency Contact: +1-555-YOLO-911

We'll be sending you additional information over the next few days to ensure you're fully prepared for an amazing workshop experience.

Best regards,
The YOLOVibe Team

P.S. Add our email address to your contacts to ensure you receive all important updates!`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('welcome');
    
    console.log(`📧 Welcome email sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Send preparation guide email (24 hours after purchase)
   */
  async sendPreparationGuide(purchaseId: string): Promise<void> {
    const schedule = this.schedules.get(purchaseId);
    if (!schedule || schedule.emailsSent.includes('preparation')) {
      return;
    }

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: 'YOLOVibe Workshop Preparation Guide - Get Ready!',
      content: `Dear ${schedule.attendeeName},

Your YOLOVibe workshop is approaching! Here's everything you need to know to prepare:

📚 PRE-WORKSHOP PREPARATION:

1. TECHNICAL SETUP:
   • Laptop with reliable internet connection
   • Latest version of your preferred code editor
   • Git installed and configured
   • Node.js 18+ installed

2. REQUIRED READING:
   • Workshop syllabus (attached)
   • Industry best practices guide
   • Case study materials

3. WHAT TO BRING:
   • Notebook and pen for notes
   • Comfortable clothes (we'll be coding for hours!)
   • Positive attitude and curiosity

🎯 WORKSHOP LOGISTICS:
   • Date: ${schedule.workshopStartDate.toLocaleDateString()}
   • Check-in: 8:30 AM
   • Start: 9:00 AM Sharp
   • Lunch: Provided
   • End: 5:00 PM

📍 LOCATION & PARKING:
   • Address: 123 Innovation Drive, Tech City
   • Parking: Free in building garage
   • Public transit: Metro Blue Line to Tech Station

🤝 NETWORKING OPPORTUNITY:
Join our pre-workshop Slack channel to connect with fellow attendees:
https://yolovibe.slack.com/join/${schedule.bookingId}

Questions? Reply to this email or call our support line.

Looking forward to seeing you soon!

The YOLOVibe Team`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('preparation');
    schedule.nextEmailDue = new Date(schedule.workshopStartDate.getTime() - 48 * 60 * 60 * 1000); // 48 hours before
    
    console.log(`📧 Preparation guide sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Send final reminder email (48 hours before workshop)
   */
  async sendFinalReminder(purchaseId: string): Promise<void> {
    const schedule = this.schedules.get(purchaseId);
    if (!schedule || schedule.emailsSent.includes('final_reminder')) {
      return;
    }

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: '🚀 YOLOVibe Workshop Starts in 48 Hours - Final Checklist',
      content: `Dear ${schedule.attendeeName},

Your YOLOVibe workshop starts in just 48 hours! Here's your final checklist:

✅ FINAL CHECKLIST:

□ Laptop charged and ready
□ Development environment set up
□ Pre-reading completed
□ Slack channel joined
□ Transportation planned
□ Comfortable clothes picked out
□ Excitement level: Maximum! 🎉

⏰ IMPORTANT REMINDERS:
   • Workshop Date: ${schedule.workshopStartDate.toLocaleDateString()}
   • Check-in: 8:30 AM (coffee and pastries provided!)
   • Location: 123 Innovation Drive, Tech City
   • Parking: Building garage (free)

📱 EMERGENCY CONTACTS:
   • Workshop emergency hotline: +1-555-YOLO-911
   • Text updates: +1-555-YOLO-SMS
   • Email: support@yolovibe.com

🎁 SPECIAL SURPRISE:
We have some exciting surprises planned for all attendees. You won't want to miss this!

🌟 WHAT TO EXPECT:
   • Hands-on coding sessions
   • Industry expert presentations
   • Networking with like-minded professionals
   • Practical skills you can use immediately
   • Certificate of completion
   • Exclusive YOLOVibe swag

Can't wait to see you there!

The YOLOVibe Team

P.S. Follow us on social media for live updates during the workshop:
Twitter: @YOLOVibe | LinkedIn: YOLOVibe Workshop`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('final_reminder');
    
    console.log(`📧 Final reminder sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Send post-workshop follow-up email
   */
  async sendPostWorkshopFollowUp(purchaseId: string): Promise<void> {
    const schedule = this.schedules.get(purchaseId);
    if (!schedule || schedule.emailsSent.includes('post_workshop')) {
      return;
    }

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: 'Thank You for Attending YOLOVibe Workshop! 🎉',
      content: `Dear ${schedule.attendeeName},

Thank you for being part of our amazing YOLOVibe workshop! We hope you had an incredible learning experience.

🎯 WHAT'S NEXT:

1. RESOURCES & MATERIALS:
   • All workshop slides and code samples
   • Bonus video tutorials
   • Extended reading list
   • Access to private alumni community

2. CERTIFICATE & VERIFICATION:
   • Your completion certificate is attached
   • LinkedIn skill verification available
   • Add YOLOVibe to your professional profile

3. CONTINUED LEARNING:
   • 30-day free access to our online platform
   • Monthly alumni meetups
   • Advanced workshop discounts (20% off)

🤝 STAY CONNECTED:
   • Alumni Slack: https://yolovibe.slack.com/alumni
   • LinkedIn Group: YOLOVibe Workshop Alumni
   • Newsletter: Monthly tips and industry insights

📝 FEEDBACK REQUEST:
Your feedback helps us improve. Please take 2 minutes to complete our feedback survey:
https://survey.yolovibe.com/workshop-feedback/${schedule.bookingId}

🎁 SPECIAL OFFERS:
   • 20% off your next workshop
   • Free 1-on-1 career coaching session
   • Priority access to new workshop announcements

Thank you again for choosing YOLOVibe. We're excited to see where your new skills take you!

Best regards,
The YOLOVibe Team

P.S. Don't forget to share your workshop experience on social media and tag us @YOLOVibe!`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('post_workshop');
    
    console.log(`📧 Post-workshop follow-up sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Schedule consulting session reminders
   */
  async scheduleConsultingReminders(
    consultingSessionId: string,
    clientEmail: string,
    clientName: string,
    sessionDate: Date,
    zoomLink: string
  ): Promise<void> {
    console.log(`📅 Scheduling consulting reminders for session: ${consultingSessionId}`);

    const schedule: FollowUpEmailSchedule = {
      purchaseId: consultingSessionId,
      bookingId: consultingSessionId,
      attendeeEmail: clientEmail,
      attendeeName: clientName,
      workshopStartDate: sessionDate,
      emailsSent: [],
      nextEmailDue: new Date(sessionDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    };

    this.schedules.set(consultingSessionId, schedule);

    // Send immediate confirmation email
    await this.sendConsultingConfirmation(consultingSessionId, zoomLink);
  }

  /**
   * Send consulting session confirmation
   */
  private async sendConsultingConfirmation(sessionId: string, zoomLink: string): Promise<void> {
    const schedule = this.schedules.get(sessionId);
    if (!schedule) return;

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: 'AI Consulting Session Confirmed - Important Details',
      content: `Dear ${schedule.attendeeName},

Your AI Business Development consulting session is confirmed!

🎯 SESSION DETAILS:
   • Date: ${schedule.workshopStartDate.toLocaleDateString()}
   • Time: ${schedule.workshopStartDate.toLocaleTimeString()}
   • Duration: 2 hours minimum ($400)
   • Format: Virtual via Zoom

🔗 ZOOM MEETING LINK:
${zoomLink}

📋 WHAT TO PREPARE:
   • Your business ideas or concepts
   • Any specific questions or challenges
   • Notebook for taking notes
   • Quiet, private space for the call

💡 WHAT WE'LL COVER:
   • AI-powered business development strategies
   • Idea validation and implementation planning
   • Technology recommendations for your concepts
   • Actionable next steps for your projects

📧 REMINDERS:
   • 24-hour reminder email
   • 1-hour reminder email with Zoom link

Questions? Reply to this email or call our support line.

Looking forward to our session!

The YOLOVibe Team`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('consulting_confirmation');
    
    console.log(`📧 Consulting confirmation sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Send 24-hour consulting reminder
   */
  async sendConsulting24HourReminder(sessionId: string, zoomLink: string): Promise<void> {
    const schedule = this.schedules.get(sessionId);
    if (!schedule || schedule.emailsSent.includes('consulting_24h')) {
      return;
    }

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: '🚀 AI Consulting Session Tomorrow - Final Preparation',
      content: `Dear ${schedule.attendeeName},

Your AI Business Development consulting session is tomorrow!

⏰ SESSION REMINDER:
   • Date: ${schedule.workshopStartDate.toLocaleDateString()}
   • Time: ${schedule.workshopStartDate.toLocaleTimeString()}
   • Duration: 2 hours minimum
   • Zoom Link: ${zoomLink}

✅ FINAL CHECKLIST:
   □ Review your business ideas and questions
   □ Test your Zoom connection
   □ Prepare a quiet, private space
   □ Have notebook and pen ready
   □ Charge your devices

🎯 MAXIMIZE YOUR SESSION:
   • Be specific about your goals
   • Ask about AI tools for your industry
   • Discuss implementation timelines
   • Take detailed notes
   • Don't hesitate to ask questions

💡 EMERGENCY CONTACT:
   If you have any last-minute issues, call: +1-555-YOLO-911

See you tomorrow!

The YOLOVibe Team`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('consulting_24h');
    schedule.nextEmailDue = new Date(schedule.workshopStartDate.getTime() - 60 * 60 * 1000); // 1 hour before
    
    console.log(`📧 24-hour consulting reminder sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Send 1-hour consulting reminder
   */
  async sendConsulting1HourReminder(sessionId: string, zoomLink: string): Promise<void> {
    const schedule = this.schedules.get(sessionId);
    if (!schedule || schedule.emailsSent.includes('consulting_1h')) {
      return;
    }

    const emailRequest: EmailRequest = {
      to: schedule.attendeeEmail,
      from: 'noreply@yolovibe.com',
      subject: '⏰ AI Consulting Session in 1 Hour - Join Link Inside',
      content: `Dear ${schedule.attendeeName},

Your AI consulting session starts in 1 hour!

🔗 JOIN NOW (or bookmark this link):
${zoomLink}

⏰ SESSION DETAILS:
   • Time: ${schedule.workshopStartDate.toLocaleTimeString()}
   • Duration: 2 hours minimum
   • Format: Virtual via Zoom

🚀 QUICK PREP (5 minutes):
   • Join the Zoom meeting 5 minutes early
   • Test your audio and video
   • Have your questions ready
   • Grab water and snacks

💡 REMEMBER:
This is YOUR time to get AI-powered insights for your business ideas. Come with specific questions and goals!

See you very soon!

The YOLOVibe Team

---
Zoom Link: ${zoomLink}
Session ID: ${sessionId}`
    };

    const result = await this.emailSender.sendEmail(emailRequest);
    schedule.emailsSent.push('consulting_1h');
    
    console.log(`📧 1-hour consulting reminder sent to ${schedule.attendeeEmail} (${result.emailId})`);
  }

  /**
   * Process all due emails (to be called by a scheduler/cron job)
   */
  async processDueEmails(): Promise<void> {
    const now = new Date();
    
    for (const [purchaseId, schedule] of this.schedules) {
      if (!schedule.nextEmailDue || schedule.nextEmailDue > now) {
        continue;
      }

      // Handle workshop emails
      if (schedule.bookingId.startsWith('booking-')) {
        // Send preparation guide if due
        if (!schedule.emailsSent.includes('preparation')) {
          await this.sendPreparationGuide(purchaseId);
        }
        // Send final reminder if due
        else if (!schedule.emailsSent.includes('final_reminder')) {
          await this.sendFinalReminder(purchaseId);
        }
      }
      
      // Handle consulting emails
      else if (schedule.bookingId.startsWith('consulting-')) {
        // Send 24-hour reminder if due
        if (!schedule.emailsSent.includes('consulting_24h')) {
          await this.sendConsulting24HourReminder(purchaseId, 'https://zoom.us/j/placeholder');
        }
        // Send 1-hour reminder if due
        else if (!schedule.emailsSent.includes('consulting_1h')) {
          await this.sendConsulting1HourReminder(purchaseId, 'https://zoom.us/j/placeholder');
        }
      }
    }
  }

  /**
   * Get email schedule for a purchase
   */
  getEmailSchedule(purchaseId: string): FollowUpEmailSchedule | undefined {
    return this.schedules.get(purchaseId);
  }

  /**
   * Get all scheduled emails (for admin/debugging)
   */
  getAllSchedules(): FollowUpEmailSchedule[] {
    return Array.from(this.schedules.values());
  }
}
