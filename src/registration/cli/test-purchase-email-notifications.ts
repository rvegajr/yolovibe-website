#!/usr/bin/env node

/**
 * CLI Test Harness for Purchase Email Notifications
 * Tests that purchase workflow sends appropriate emails for all scenarios
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

// Mock Email Sender that captures sent emails
class MockEmailSender implements IEmailSender {
  public sentEmails: EmailRequest[] = [];

  async sendEmail(emailRequest: EmailRequest): Promise<EmailResult> {
    this.sentEmails.push(emailRequest);
    console.log(`📧 Email sent to: ${emailRequest.to}`);
    console.log(`   Subject: ${emailRequest.subject}`);
    console.log(`   Content preview: ${emailRequest.content.substring(0, 100)}...`);
    
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

  // Helper method to get last sent email
  getLastEmail(): EmailRequest | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  // Helper method to clear sent emails
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
  private shouldFail = false;

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (this.shouldFail) {
      return {
        paymentId: `pay_${Date.now()}`,
        status: 'failed',
        errorMessage: 'Payment declined by bank'
      };
    }

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

async function runEmailNotificationTests(): Promise<void> {
  console.log('🧪 Testing Purchase Email Notifications...\n');

  const mockEmailSender = new MockEmailSender();
  const mockBookingManager = new MockBookingManager();
  const mockPaymentProcessor = new MockPaymentProcessor();
  
  const purchaseManager = new PurchaseManager(
    mockBookingManager,
    mockPaymentProcessor,
    mockEmailSender
  );

  let testsPassed = 0;
  let totalTests = 0;

  // Test data
  const paymentMethod: PaymentMethod = {
    type: 'card'
  };

  const purchaseRequest: PurchaseRequest = {
    bookingRequest: {
      productId: 'prod-3day',
      startDate: new Date('2024-07-15'),
      attendeeCount: 2,
      pointOfContact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123'
      },
      attendees: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0124'
        }
      ],
      paymentMethod
    },
    paymentMethod
  };

  // Test 1: Successful Purchase Email
  try {
    totalTests++;
    console.log('✅ Test 1: Successful Purchase Email Notification');
    
    mockEmailSender.clearEmails();
    mockPaymentProcessor.setShouldFail(false);
    
    const result = await purchaseManager.processPurchase(purchaseRequest);
    
    if (result.status === 'completed' && mockEmailSender.sentEmails.length === 1) {
      const email = mockEmailSender.getLastEmail()!;
      
      if (email.to === 'john.doe@example.com' &&
          email.subject.includes('Purchase Confirmation') &&
          email.content.includes('Dear John Doe') &&
          email.content.includes('successfully processed') &&
          email.from === 'noreply@yolovibe.com') {
        console.log('   ✅ Confirmation email sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Confirmation email content incorrect');
      }
    } else {
      console.log('   ❌ Expected 1 email for successful purchase');
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 2: Failed Payment Email
  try {
    totalTests++;
    console.log('\n✅ Test 2: Failed Payment Email Notification');
    
    mockEmailSender.clearEmails();
    mockPaymentProcessor.setShouldFail(true);
    
    const result = await purchaseManager.processPurchase(purchaseRequest);
    
    if (result.status === 'failed' && mockEmailSender.sentEmails.length === 1) {
      const email = mockEmailSender.getLastEmail()!;
      
      if (email.to === 'john.doe@example.com' &&
          email.subject.includes('Purchase Failed') &&
          email.content.includes('Dear John Doe') &&
          email.content.includes('purchase has failed') &&
          email.content.includes('Payment declined by bank') &&
          email.from === 'noreply@yolovibe.com') {
        console.log('   ✅ Failure email sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Failure email content incorrect');
      }
    } else {
      console.log('   ❌ Expected 1 email for failed purchase');
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 3: Purchase Cancellation Email
  try {
    totalTests++;
    console.log('\n✅ Test 3: Purchase Cancellation Email Notification');
    
    mockEmailSender.clearEmails();
    mockPaymentProcessor.setShouldFail(false);
    
    // First create a successful purchase
    const result = await purchaseManager.processPurchase(purchaseRequest);
    mockEmailSender.clearEmails(); // Clear the confirmation email
    
    // Then cancel it
    await purchaseManager.cancelPurchase(result.purchaseId);
    
    if (mockEmailSender.sentEmails.length === 1) {
      const email = mockEmailSender.getLastEmail()!;
      
      if (email.to === 'john.doe@example.com' &&
          email.subject.includes('Purchase Cancelled') &&
          email.content.includes('Dear John Doe') &&
          email.content.includes('purchase has been cancelled') &&
          email.content.includes('Refund Amount') &&
          email.from === 'noreply@yolovibe.com') {
        console.log('   ✅ Cancellation email sent correctly');
        testsPassed++;
      } else {
        console.log('   ❌ Cancellation email content incorrect');
      }
    } else {
      console.log('   ❌ Expected 1 email for purchase cancellation');
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 4: Email Content Validation
  try {
    totalTests++;
    console.log('\n✅ Test 4: Email Content Validation');
    
    mockEmailSender.clearEmails();
    mockPaymentProcessor.setShouldFail(false);
    
    const result = await purchaseManager.processPurchase(purchaseRequest);
    const email = mockEmailSender.getLastEmail()!;
    
    // Check that email contains all required information
    const hasBookingId = email.content.includes('Booking ID:');
    const hasPaymentId = email.content.includes('Payment ID:');
    const hasTotalAmount = email.content.includes('Total Amount:');
    const hasPersonalization = email.content.includes('Dear John Doe');
    const hasProperFormat = email.from === 'noreply@yolovibe.com';
    
    if (hasBookingId && hasPaymentId && hasTotalAmount && hasPersonalization && hasProperFormat) {
      console.log('   ✅ Email contains all required information');
      testsPassed++;
    } else {
      console.log('   ❌ Email missing required information');
      console.log(`     Booking ID: ${hasBookingId}, Payment ID: ${hasPaymentId}`);
      console.log(`     Total Amount: ${hasTotalAmount}, Personalization: ${hasPersonalization}`);
      console.log(`     Proper Format: ${hasProperFormat}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Test 5: Multiple Email Scenarios
  try {
    totalTests++;
    console.log('\n✅ Test 5: Email Tracking Across Multiple Purchases');
    
    mockEmailSender.clearEmails();
    mockPaymentProcessor.setShouldFail(false);
    
    // Process multiple purchases
    await purchaseManager.processPurchase(purchaseRequest);
    await purchaseManager.processPurchase(purchaseRequest);
    
    if (mockEmailSender.sentEmails.length === 2) {
      console.log('   ✅ Multiple emails tracked correctly');
      testsPassed++;
    } else {
      console.log(`   ❌ Expected 2 emails, got ${mockEmailSender.sentEmails.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error}`);
  }

  // Results
  console.log('\n🎯 EMAIL NOTIFICATION TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${totalTests}`);
  console.log(`   Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('   🎉 ALL EMAIL NOTIFICATION TESTS PASSED!');
    console.log('   📧 Purchase workflow properly sends emails for all scenarios!');
  } else {
    console.log('   ⚠️  Some email notification tests failed');
  }
}

// Run the tests
runEmailNotificationTests().catch(console.error);
