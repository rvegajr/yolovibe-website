#!/usr/bin/env node

/**
 * CLI Test Harness for Complete Email Workflow
 * Tests the entire email journey from purchase to post-workshop follow-up
 */

import type { 
  IPurchaseManager,
  IEmailSender,
  IBookingManager,
  IPaymentProcessor
} from '../core/interfaces/index.js';
import type { 
  PurchaseRequest,
  EmailRequest,
  EmailResult,
  BookingRequest,
  BookingResult,
  PaymentRequest,
  PaymentResult,
  PaymentMethod
} from '../core/types/index.js';
import { PurchaseManager } from '../implementations/PurchaseManager.js';
import { FollowUpEmailManager } from '../implementations/FollowUpEmailManager.js';

// Mock Email Sender that captures all sent emails
class MockEmailSender implements IEmailSender {
  public sentEmails: EmailRequest[] = [];

  async sendEmail(emailRequest: EmailRequest): Promise<EmailResult> {
    this.sentEmails.push(emailRequest);
    console.log(`📧 Email sent to: ${emailRequest.to}`);
    console.log(`   Subject: ${emailRequest.subject}`);
    console.log(`   Content preview: ${emailRequest.content.substring(0, 80)}...`);
    
    return {
      emailId: `email_${Date.now()}`,
      status: 'success'
    };
  }

  async sendTemplatedEmail(templateId: string, recipient: string, templateData: Record<string, any>): Promise<EmailResult> {
    return { emailId: `email_${Date.now()}`, status: 'success' };
  }

  async getEmailStatus(emailId: string): Promise<any> {
    return { emailId, status: 'delivered' };
  }

  async sendBulkEmails(emailRequests: EmailRequest[]): Promise<EmailResult[]> {
    return emailRequests.map(() => ({ emailId: `email_${Date.now()}`, status: 'success' }));
  }

  async sendConfirmation(booking: any): Promise<void> {}
  async sendReminder(workshop: any, daysBeforeWorkshop: number): Promise<void> {}
  async sendAttendeeInvitation(attendee: any, workshop: any): Promise<void> {}
  async sendPasswordReset(attendee: any): Promise<void> {}

  getEmailsBySubjectKeyword(keyword: string): EmailRequest[] {
    return this.sentEmails.filter(email => email.subject.toLowerCase().includes(keyword.toLowerCase()));
  }

  clearEmails(): void {
    this.sentEmails = [];
  }
}

// Mock Booking Manager
class MockBookingManager implements IBookingManager {
  async createBooking(request: BookingRequest): Promise<BookingResult> {
    return {
      bookingId: `booking_${Date.now()}`,
      workshopId: request.productId,
      confirmationNumber: `YOLO-${Date.now()}`,
      status: 'confirmed',
      totalAmount: 3000
    };
  }

  async getBooking(bookingId: string): Promise<any> {
    return { bookingId, status: 'confirmed' };
  }

  async cancelBooking(bookingId: string): Promise<void> {}
  async updateBooking(bookingId: string, updates: any): Promise<void> {}
  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<any[]> { return []; }
}

// Mock Payment Processor
class MockPaymentProcessor implements IPaymentProcessor {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      paymentId: `pay_${Date.now()}`,
      status: 'success',
      transactionId: `txn_${Date.now()}`,
      receiptUrl: `https://receipts.yolovibe.com/pay_${Date.now()}`
    };
  }

  async processRefund(bookingId: string, amount?: number): Promise<any> {
    return {
      refundId: `refund_${Date.now()}`,
      amount: amount || 0,
      status: 'success',
      transactionId: `txn_${Date.now()}`
    };
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    return { paymentId, status: 'completed' };
  }
}

async function runCompleteEmailWorkflowTest(): Promise<void> {
  console.log('🧪 Testing Complete Email Workflow...\n');

  const mockEmailSender = new MockEmailSender();
  const mockBookingManager = new MockBookingManager();
  const mockPaymentProcessor = new MockPaymentProcessor();
  
  const purchaseManager = new PurchaseManager(
    mockBookingManager,
    mockPaymentProcessor,
    mockEmailSender
  );

  const followUpManager = new FollowUpEmailManager(mockEmailSender, mockBookingManager);

  let testsPassed = 0;
  let totalTests = 0;

  // Test data
  const paymentMethod: PaymentMethod = {
    type: 'card'
  };

  const workshopDate = new Date('2024-07-15T09:00:00');
  
  const purchaseRequest: PurchaseRequest = {
    bookingRequest: {
      productId: 'prod-3day',
      startDate: workshopDate,
      attendeeCount: 1,
      pointOfContact: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0123'
      },
      attendees: [
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0123'
        }
      ],
      paymentMethod
    },
    paymentMethod
  };

  // Test 1: Complete Purchase Email Sequence
  try {
    totalTests++;
    console.log('✅ Test 1: Complete Purchase Email Sequence');
    
    mockEmailSender.clearEmails();
    
    // Process purchase (should trigger confirmation + welcome emails)
    const result = await purchaseManager.processPurchase(purchaseRequest);
    
    // Check that we got both confirmation and welcome emails
    const confirmationEmails = mockEmailSender.getEmailsBySubjectKeyword('confirmation');
    const welcomeEmails = mockEmailSender.getEmailsBySubjectKeyword('welcome');
    
    if (confirmationEmails.length === 1 && welcomeEmails.length === 1) {
      console.log('   ✅ Purchase confirmation and welcome emails sent');
      testsPassed++;
    } else {
      console.log(`   ❌ Expected 1 confirmation + 1 welcome email, got ${confirmationEmails.length} + ${welcomeEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 2: Follow-up Email Scheduling
  try {
    totalTests++;
    console.log('\n✅ Test 2: Follow-up Email Scheduling');
    
    mockEmailSender.clearEmails();
    
    // Schedule follow-up emails manually
    await followUpManager.scheduleFollowUpEmails(
      'test-purchase-123',
      'test-booking-123',
      'sarah.johnson@example.com',
      'Sarah Johnson',
      workshopDate
    );
    
    // Should have sent welcome email immediately
    const welcomeEmails = mockEmailSender.getEmailsBySubjectKeyword('welcome');
    
    if (welcomeEmails.length === 1) {
      const email = welcomeEmails[0];
      if (email.content.includes('Sarah Johnson') && 
          email.content.includes('Workshop Portal') &&
          email.content.includes('test-booking-123')) {
        console.log('   ✅ Welcome email properly scheduled and sent');
        testsPassed++;
      } else {
        console.log('   ❌ Welcome email content incorrect');
      }
    } else {
      console.log(`   ❌ Expected 1 welcome email, got ${welcomeEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 3: Preparation Guide Email
  try {
    totalTests++;
    console.log('\n✅ Test 3: Preparation Guide Email');
    
    mockEmailSender.clearEmails();
    
    // Send preparation guide
    await followUpManager.sendPreparationGuide('test-purchase-123');
    
    const prepEmails = mockEmailSender.getEmailsBySubjectKeyword('preparation');
    
    if (prepEmails.length === 1) {
      const email = prepEmails[0];
      if (email.content.includes('TECHNICAL SETUP') && 
          email.content.includes('REQUIRED READING') &&
          email.content.includes('Node.js 18+') &&
          email.content.includes('Slack channel')) {
        console.log('   ✅ Preparation guide email sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Preparation guide content incorrect');
      }
    } else {
      console.log(`   ❌ Expected 1 preparation email, got ${prepEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 4: Final Reminder Email
  try {
    totalTests++;
    console.log('\n✅ Test 4: Final Reminder Email');
    
    mockEmailSender.clearEmails();
    
    // Send final reminder
    await followUpManager.sendFinalReminder('test-purchase-123');
    
    console.log(`   Debug: Sent ${mockEmailSender.sentEmails.length} emails total`);
    mockEmailSender.sentEmails.forEach((email, i) => {
      console.log(`   Email ${i+1}: "${email.subject}"`);
    });
    
    const reminderEmails = mockEmailSender.getEmailsBySubjectKeyword('48 hours');
    
    if (reminderEmails.length === 1) {
      const email = reminderEmails[0];
      if (email.content.includes('FINAL CHECKLIST') && 
          email.content.includes('Laptop charged') &&
          email.content.includes('emergency hotline') &&
          email.content.includes('🎁 SPECIAL SURPRISE')) {
        console.log('   ✅ Final reminder email sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Final reminder content incorrect');
        console.log(`   Content check: FINAL CHECKLIST=${email.content.includes('FINAL CHECKLIST')}, Laptop=${email.content.includes('Laptop charged')}, Emergency=${email.content.includes('emergency hotline')}, Surprise=${email.content.includes('🎁 SPECIAL SURPRISE')}`);
      }
    } else {
      console.log(`   ❌ Expected 1 reminder email, got ${reminderEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 5: Post-Workshop Follow-up
  try {
    totalTests++;
    console.log('\n✅ Test 5: Post-Workshop Follow-up Email');
    
    mockEmailSender.clearEmails();
    
    // Send post-workshop follow-up
    await followUpManager.sendPostWorkshopFollowUp('test-purchase-123');
    
    console.log(`   Debug: Sent ${mockEmailSender.sentEmails.length} emails total`);
    mockEmailSender.sentEmails.forEach((email, i) => {
      console.log(`   Email ${i+1}: "${email.subject}"`);
    });
    
    const followUpEmails = mockEmailSender.getEmailsBySubjectKeyword('thank you');
    
    if (followUpEmails.length === 1) {
      const email = followUpEmails[0];
      if (email.content.includes('completion certificate') && 
          email.content.includes('Alumni Slack') &&
          email.content.includes('20% off') &&
          email.content.includes('feedback survey')) {
        console.log('   ✅ Post-workshop follow-up sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Post-workshop follow-up content incorrect');
        console.log(`   Content check: certificate=${email.content.includes('completion certificate')}, Alumni=${email.content.includes('Alumni Slack')}, discount=${email.content.includes('20% off')}, survey=${email.content.includes('feedback survey')}`);
      }
    } else {
      console.log(`   ❌ Expected 1 follow-up email, got ${followUpEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 6: Email Schedule Management
  try {
    totalTests++;
    console.log('\n✅ Test 6: Email Schedule Management');
    
    // Get email schedule
    const schedule = followUpManager.getEmailSchedule('test-purchase-123');
    
    if (schedule && 
        schedule.purchaseId === 'test-purchase-123' &&
        schedule.attendeeEmail === 'sarah.johnson@example.com' &&
        schedule.emailsSent.includes('welcome') &&
        schedule.emailsSent.includes('preparation') &&
        schedule.emailsSent.includes('final_reminder') &&
        schedule.emailsSent.includes('post_workshop')) {
      console.log('   ✅ Email schedule properly tracked');
      testsPassed++;
    } else {
      console.log('   ❌ Email schedule tracking failed');
      console.log(`   Schedule: ${JSON.stringify(schedule, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 7: Email Content Quality Check
  try {
    totalTests++;
    console.log('\n✅ Test 7: Email Content Quality Check');
    
    // Check all emails for quality indicators
    const allEmails = mockEmailSender.sentEmails;
    let qualityScore = 0;
    
    for (const email of allEmails) {
      // Check personalization
      if (email.content.includes('Sarah Johnson')) qualityScore++;
      
      // Check professional formatting
      if (email.from === 'noreply@yolovibe.com') qualityScore++;
      
      // Check call-to-action presence
      if (email.content.includes('http') || email.content.includes('support@')) qualityScore++;
      
      // Check branding
      if (email.content.includes('YOLOVibe')) qualityScore++;
    }
    
    const expectedQualityScore = allEmails.length * 4; // 4 quality checks per email
    const qualityPercentage = (qualityScore / expectedQualityScore) * 100;
    
    if (qualityPercentage >= 90) {
      console.log(`   ✅ Email quality excellent (${qualityPercentage.toFixed(1)}%)`);
      testsPassed++;
    } else {
      console.log(`   ❌ Email quality needs improvement (${qualityPercentage.toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Results
  console.log('\n🎯 COMPLETE EMAIL WORKFLOW TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${totalTests}`);
  console.log(`   Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  console.log(`   Total Emails Sent: ${mockEmailSender.sentEmails.length}`);
  
  if (testsPassed === totalTests) {
    console.log('   🎉 ALL EMAIL WORKFLOW TESTS PASSED!');
    console.log('   📧 Complete email journey is working perfectly!');
    console.log('\n📋 EMAIL SEQUENCE SUMMARY:');
    console.log('   1. ✅ Purchase Confirmation (immediate)');
    console.log('   2. ✅ Welcome Email (immediate)');
    console.log('   3. ✅ Preparation Guide (24 hours later)');
    console.log('   4. ✅ Final Reminder (48 hours before workshop)');
    console.log('   5. ✅ Post-Workshop Follow-up (after completion)');
  } else {
    console.log('   ⚠️  Some email workflow tests failed');
  }
}

// Run the tests
runCompleteEmailWorkflowTest().catch(console.error);
