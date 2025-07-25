#!/usr/bin/env node
/**
 * CLI Test Harness for IEmailSender Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-email-sender.ts
 */

import type { IEmailSender } from '../core/interfaces/index.js';
import type { EmailRequest, EmailResult, EmailStatus } from '../core/types/index.js';
import { EmailSenderManager } from '../implementations/EmailSenderManager.js';

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IEmailSender Interface...\n');
  
  // Use concrete implementation instead of mock!
  const sender: IEmailSender = new EmailSenderManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Send basic email
  testsTotal++;
  try {
    const emailRequest: EmailRequest = {
      to: 'alice@example.com',
      subject: 'Welcome to YOLO Workshop!',
      content: 'Thank you for registering for our 3-Day YOLO Workshop.',
      from: 'workshops@yolovibe.com'
    };

    const result = await sender.sendEmail(emailRequest);
    
    console.log('✅ Test 1: sendEmail() - Basic Email');
    console.log(`   Email ID: ${result.emailId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${emailRequest.to}`);
    console.log(`   Subject: ${emailRequest.subject}`);
    
    if (result.status === 'success' && result.emailId && result.messageId) {
      testsPassed++;
      console.log('   ✅ Email sent successfully\n');
    } else {
      console.log('   ❌ Email sending failed\n');
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error, '\n');
  }

  // Test 2: Send templated email
  testsTotal++;
  try {
    const templateData = {
      firstName: 'Bob',
      lastName: 'Smith',
      workshopName: '3-Day YOLO Workshop',
      startDate: '2025-07-01',
      confirmationCode: 'YOLO-123456'
    };

    const result = await sender.sendTemplatedEmail('booking-confirmation', 'bob@example.com', templateData);
    
    console.log('✅ Test 2: sendTemplatedEmail() - Booking Confirmation');
    console.log(`   Email ID: ${result.emailId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Template: booking-confirmation`);
    console.log(`   Recipient: bob@example.com`);
    console.log(`   Data: ${JSON.stringify(templateData, null, 2)}`);
    
    if (result.status === 'success') {
      testsPassed++;
      console.log('   ✅ Templated email sent successfully\n');
    } else {
      console.log('   ❌ Templated email sending failed\n');
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error, '\n');
  }

  // Test 3: Get email status
  testsTotal++;
  try {
    const status = await sender.getEmailStatus('email_1');
    
    console.log('✅ Test 3: getEmailStatus()');
    console.log(`   Email ID: ${status.emailId}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Recipient: ${status.recipient}`);
    console.log(`   Sent At: ${status.sentAt.toISOString()}`);
    
    if (status.status === 'sent' && status.recipient) {
      testsPassed++;
      console.log('   ✅ Email status retrieved correctly\n');
    } else {
      console.log('   ❌ Email status incorrect\n');
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error, '\n');
  }

  // Test 4: Send bulk emails
  testsTotal++;
  try {
    const bulkEmails: EmailRequest[] = [
      {
        to: 'attendee1@example.com',
        subject: 'Workshop Reminder - Day 1',
        content: 'Your workshop starts tomorrow!',
        from: 'workshops@yolovibe.com'
      },
      {
        to: 'attendee2@example.com',
        subject: 'Workshop Reminder - Day 1',
        content: 'Your workshop starts tomorrow!',
        from: 'workshops@yolovibe.com'
      },
      {
        to: 'attendee3@example.com',
        subject: 'Workshop Reminder - Day 1',
        content: 'Your workshop starts tomorrow!',
        from: 'workshops@yolovibe.com'
      }
    ];

    const results = await sender.sendBulkEmails(bulkEmails);
    
    console.log('✅ Test 4: sendBulkEmails()');
    console.log(`   Sent ${results.length} emails:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.emailId} - ${result.status} (${bulkEmails[index].to})`);
    });
    
    const successCount = results.filter(r => r.status === 'success').length;
    if (successCount === bulkEmails.length) {
      testsPassed++;
      console.log('   ✅ All bulk emails sent successfully\n');
    } else {
      console.log(`   ❌ Only ${successCount}/${bulkEmails.length} emails sent successfully\n`);
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error, '\n');
  }

  // Test 5: Invalid email request
  testsTotal++;
  try {
    const invalidRequest: EmailRequest = {
      to: '', // Missing recipient
      subject: 'Test',
      content: 'Test content',
      from: 'test@example.com'
    };

    const result = await sender.sendEmail(invalidRequest);
    
    console.log('✅ Test 5: sendEmail() - Invalid Request');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.errorMessage}`);
    
    if (result.status === 'failed' && result.errorMessage) {
      testsPassed++;
      console.log('   ✅ Invalid email correctly rejected\n');
    } else {
      console.log('   ❌ Invalid email should have been rejected\n');
    }
  } catch (error) {
    console.log('❌ Test 5 FAILED:', error, '\n');
  }

  // Test 6: Invalid template
  testsTotal++;
  try {
    const result = await sender.sendTemplatedEmail('invalid-template', 'test@example.com', {});
    
    console.log('✅ Test 6: sendTemplatedEmail() - Invalid Template');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.errorMessage}`);
    
    if (result.status === 'failed' && result.errorMessage?.includes('Template not found')) {
      testsPassed++;
      console.log('   ✅ Invalid template correctly rejected\n');
    } else {
      console.log('   ❌ Invalid template should have been rejected\n');
    }
  } catch (error) {
    console.log('❌ Test 6 FAILED:', error, '\n');
  }

  // Test 7: Error handling for invalid email ID
  testsTotal++;
  try {
    await sender.getEmailStatus('invalid-email-id');
    console.log('❌ Test 7 FAILED: Should have thrown error for invalid email ID\n');
  } catch (error: unknown) {
    console.log('✅ Test 7: getEmailStatus() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    testsPassed++;
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! IEmailSender interface is ready for implementation!');
    process.exit(0);
  } else {
    console.log('   ❌ Some tests failed. Interface needs refinement.');
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests as testEmailSender };
