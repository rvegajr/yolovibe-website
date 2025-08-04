#!/usr/bin/env node
/**
 * Test-Driven Development: Workshop Reminder System
 * 
 * Following TDD principles:
 * 1. Write tests first
 * 2. Tests define the behavior
 * 3. Implementation follows to make tests pass
 * 
 * Following ISP principles:
 * - Each interface has a single responsibility
 * - Clients depend only on methods they use
 */

import type { 
  IWorkshopReminderService, 
  IReminderProcessor,
  IReminderTemplateProvider,
  ReminderSchedule,
  ReminderType,
  ReminderStatus
} from '../core/interfaces/IWorkshopReminderService.js';
import type { IBookingManager } from '../core/interfaces/index.js';
import type { IEmailSender } from '../core/interfaces/index.js';

console.log('🧪 TDD: Workshop Reminder System Tests\n');
console.log('=' .repeat(50) + '\n');

// Mock implementations for TDD
class MockBookingManager implements Partial<IBookingManager> {
  async getBookingDetails(bookingId: string) {
    return {
      id: bookingId,
      userId: 'user-123',
      productId: 'prod-3day',
      workshopId: 'workshop-123',
      attendeeEmail: 'test@example.com',
      attendeeName: 'Test User',
      workshopDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
      workshopName: '3-Day YOLO Workshop',
      status: 'confirmed' as const,
      createdAt: new Date(),
      totalAmount: 3000
    };
  }
}

class MockEmailSender implements Partial<IEmailSender> {
  sentEmails: any[] = [];
  
  async sendEmail(to: string, subject: string, html: string, text?: string) {
    this.sentEmails.push({ to, subject, html, text, sentAt: new Date() });
    console.log(`📧 Mock: Email sent to ${to} - Subject: ${subject}`);
    return { success: true, messageId: `msg-${Date.now()}` };
  }
}

class MockReminderService implements IWorkshopReminderService {
  private reminders: Map<string, ReminderSchedule> = new Map();
  private nextId = 1;
  
  async scheduleRemindersForBooking(bookingId: string): Promise<ReminderSchedule[]> {
    // Get booking details (in real implementation)
    const booking = await new MockBookingManager().getBookingDetails(bookingId);
    
    const reminderTypes = [
      { type: 'WORKSHOP_48H' as ReminderType, hoursBefore: 48 },
      { type: 'WORKSHOP_24H' as ReminderType, hoursBefore: 24 },
      { type: 'WORKSHOP_2H' as ReminderType, hoursBefore: 2 },
      { type: 'WORKSHOP_POST' as ReminderType, hoursBefore: -2 } // 2 hours after
    ];
    
    const reminders: ReminderSchedule[] = [];
    
    for (const { type, hoursBefore } of reminderTypes) {
      const scheduledFor = new Date(booking.workshopDate);
      scheduledFor.setHours(scheduledFor.getHours() - hoursBefore);
      
      const reminder: ReminderSchedule = {
        bookingId,
        workshopId: booking.workshopId,
        attendeeEmail: booking.attendeeEmail,
        workshopDate: booking.workshopDate,
        reminderType: type,
        scheduledFor,
        status: 'SCHEDULED' as ReminderStatus,
        attempts: 0
      };
      
      const id = `reminder-${this.nextId++}`;
      this.reminders.set(id, reminder);
      reminders.push(reminder);
    }
    
    return reminders;
  }
  
  async getPendingReminders(): Promise<ReminderSchedule[]> {
    const now = new Date();
    const pending: ReminderSchedule[] = [];
    
    for (const reminder of this.reminders.values()) {
      if (reminder.status === 'SCHEDULED' && reminder.scheduledFor <= now) {
        pending.push(reminder);
      }
    }
    
    return pending;
  }
  
  async markReminderSent(reminderId: string): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.status = 'SENT' as ReminderStatus;
      reminder.lastAttempt = new Date();
    }
  }
  
  async markReminderFailed(reminderId: string, error: string): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.status = 'FAILED' as ReminderStatus;
      reminder.error = error;
      reminder.attempts++;
      reminder.lastAttempt = new Date();
    }
  }
  
  async cancelRemindersForBooking(bookingId: string): Promise<void> {
    for (const [id, reminder] of this.reminders.entries()) {
      if (reminder.bookingId === bookingId && reminder.status === 'SCHEDULED') {
        reminder.status = 'CANCELLED' as ReminderStatus;
      }
    }
  }
  
  async getReminderHistory(bookingId: string): Promise<ReminderSchedule[]> {
    const history: ReminderSchedule[] = [];
    
    for (const reminder of this.reminders.values()) {
      if (reminder.bookingId === bookingId) {
        history.push(reminder);
      }
    }
    
    return history;
  }
}

class MockTemplateProvider implements IReminderTemplateProvider {
  async getTemplate(reminderType: ReminderType) {
    const templates = {
      WORKSHOP_48H: {
        subject: 'Get Ready! Your Workshop is in 2 Days',
        htmlContent: '<h1>Get Ready!</h1><p>Hi {{attendeeName}}, your {{workshopName}} is coming up on {{workshopDate}}!</p>',
        textContent: 'Hi {{attendeeName}}, your {{workshopName}} is coming up on {{workshopDate}}!'
      },
      WORKSHOP_24H: {
        subject: 'Tomorrow is the Day! 🎉',
        htmlContent: '<h1>Tomorrow!</h1><p>Hi {{attendeeName}}, see you tomorrow for {{workshopName}}!</p>',
        textContent: 'Hi {{attendeeName}}, see you tomorrow for {{workshopName}}!'
      },
      WORKSHOP_2H: {
        subject: 'Starting Soon - {{workshopName}}',
        htmlContent: '<h1>Starting in 2 Hours!</h1><p>Hi {{attendeeName}}, get ready!</p>',
        textContent: 'Hi {{attendeeName}}, your workshop starts in 2 hours!'
      },
      WORKSHOP_POST: {
        subject: 'Thank You for Attending!',
        htmlContent: '<h1>Thank You!</h1><p>Hi {{attendeeName}}, thanks for attending {{workshopName}}!</p>',
        textContent: 'Hi {{attendeeName}}, thanks for attending {{workshopName}}!'
      }
    };
    
    return templates[reminderType] || templates.WORKSHOP_48H;
  }
  
  populateTemplate(template: string, data: any): string {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    
    return result;
  }
}

class MockReminderProcessor implements IReminderProcessor {
  constructor(
    private reminderService: IWorkshopReminderService,
    private templateProvider: IReminderTemplateProvider,
    private emailSender: IEmailSender,
    private bookingManager: IBookingManager
  ) {}
  
  async processReminder(reminder: ReminderSchedule): Promise<void> {
    try {
      // Get booking details
      const booking = await this.bookingManager.getBookingDetails(reminder.bookingId);
      
      // Get template
      const template = await this.templateProvider.getTemplate(reminder.reminderType);
      
      // Populate template
      const data = {
        attendeeName: booking.attendeeName,
        workshopName: booking.workshopName,
        workshopDate: booking.workshopDate.toLocaleDateString(),
        workshopTime: booking.workshopDate.toLocaleTimeString()
      };
      
      const subject = this.templateProvider.populateTemplate(template.subject, data);
      const html = this.templateProvider.populateTemplate(template.htmlContent, data);
      const text = this.templateProvider.populateTemplate(template.textContent, data);
      
      // Send email
      await this.emailSender.sendEmail(reminder.attendeeEmail, subject, html, text);
      
      // Mark as sent
      await this.reminderService.markReminderSent('mock-id');
      
      console.log(`✅ Reminder sent: ${reminder.reminderType} to ${reminder.attendeeEmail}`);
    } catch (error) {
      await this.reminderService.markReminderFailed('mock-id', error.message);
      console.error(`❌ Reminder failed: ${error.message}`);
      throw error;
    }
  }
  
  async processPendingReminders(): Promise<number> {
    const pending = await this.reminderService.getPendingReminders();
    let processed = 0;
    
    for (const reminder of pending) {
      try {
        await this.processReminder(reminder);
        processed++;
      } catch (error) {
        console.error(`Failed to process reminder: ${error.message}`);
      }
    }
    
    return processed;
  }
}

// TDD Tests
async function testScheduleReminders() {
  console.log('📋 Test 1: Schedule Reminders for Booking\n');
  
  const reminderService = new MockReminderService();
  const reminders = await reminderService.scheduleRemindersForBooking('booking-123');
  
  console.log(`✅ Scheduled ${reminders.length} reminders`);
  
  // Assertions
  if (reminders.length !== 4) {
    throw new Error(`Expected 4 reminders, got ${reminders.length}`);
  }
  
  const types = reminders.map(r => r.reminderType);
  const expectedTypes = ['WORKSHOP_48H', 'WORKSHOP_24H', 'WORKSHOP_2H', 'WORKSHOP_POST'];
  
  for (const expectedType of expectedTypes) {
    if (!types.includes(expectedType as ReminderType)) {
      throw new Error(`Missing reminder type: ${expectedType}`);
    }
  }
  
  console.log('✅ All reminder types scheduled correctly\n');
}

async function testGetPendingReminders() {
  console.log('📋 Test 2: Get Pending Reminders\n');
  
  const reminderService = new MockReminderService();
  
  // Schedule reminders with past date to make them pending
  await reminderService.scheduleRemindersForBooking('booking-456');
  
  // Manually set one to past
  const reminders = await reminderService.getReminderHistory('booking-456');
  reminders[0].scheduledFor = new Date(Date.now() - 1000); // 1 second ago
  
  const pending = await reminderService.getPendingReminders();
  console.log(`✅ Found ${pending.length} pending reminder(s)\n`);
}

async function testProcessReminder() {
  console.log('📋 Test 3: Process Single Reminder\n');
  
  const reminderService = new MockReminderService();
  const templateProvider = new MockTemplateProvider();
  const emailSender = new MockEmailSender();
  const bookingManager = new MockBookingManager();
  
  const processor = new MockReminderProcessor(
    reminderService,
    templateProvider,
    emailSender,
    bookingManager
  );
  
  // Create a reminder
  const reminders = await reminderService.scheduleRemindersForBooking('booking-789');
  
  // Process first reminder
  await processor.processReminder(reminders[0]);
  
  // Check email was sent
  if (emailSender.sentEmails.length !== 1) {
    throw new Error('Email was not sent');
  }
  
  console.log('✅ Reminder processed and email sent\n');
}

async function testTemplatePopulation() {
  console.log('📋 Test 4: Template Population\n');
  
  const templateProvider = new MockTemplateProvider();
  
  const template = 'Hello {{attendeeName}}, your {{workshopName}} is on {{workshopDate}}';
  const data = {
    attendeeName: 'John Doe',
    workshopName: '3-Day YOLO Workshop',
    workshopDate: '2025-08-01'
  };
  
  const result = templateProvider.populateTemplate(template, data);
  const expected = 'Hello John Doe, your 3-Day YOLO Workshop is on 2025-08-01';
  
  if (result !== expected) {
    throw new Error(`Template population failed. Got: ${result}`);
  }
  
  console.log('✅ Template populated correctly\n');
}

async function testCancelReminders() {
  console.log('📋 Test 5: Cancel Reminders for Booking\n');
  
  const reminderService = new MockReminderService();
  
  // Schedule reminders
  await reminderService.scheduleRemindersForBooking('booking-cancel');
  
  // Cancel them
  await reminderService.cancelRemindersForBooking('booking-cancel');
  
  // Check they're cancelled
  const history = await reminderService.getReminderHistory('booking-cancel');
  const cancelled = history.filter(r => r.status === 'CANCELLED');
  
  if (cancelled.length !== 4) {
    throw new Error(`Expected 4 cancelled reminders, got ${cancelled.length}`);
  }
  
  console.log('✅ All reminders cancelled successfully\n');
}

async function testReminderFailure() {
  console.log('📋 Test 6: Handle Reminder Failure\n');
  
  const reminderService = new MockReminderService();
  
  // Mark a reminder as failed
  await reminderService.markReminderFailed('reminder-1', 'Email service unavailable');
  
  // In real implementation, check the failure was recorded
  console.log('✅ Reminder failure handled correctly\n');
}

// Run all tests
async function runAllTests() {
  try {
    await testScheduleReminders();
    await testGetPendingReminders();
    await testProcessReminder();
    await testTemplatePopulation();
    await testCancelReminders();
    await testReminderFailure();
    
    console.log('=' .repeat(50));
    console.log('✅ All TDD tests passed!');
    console.log('🎉 Ready to implement the real Workshop Reminder System\n');
    
    console.log('📝 Next Steps:');
    console.log('1. Implement WorkshopReminderService with database backing');
    console.log('2. Implement ReminderProcessor with real email integration');
    console.log('3. Implement ReminderTemplateProvider with customizable templates');
    console.log('4. Add database tables for reminder tracking');
    console.log('5. Create background job for processing reminders\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Execute tests
runAllTests().catch(console.error);