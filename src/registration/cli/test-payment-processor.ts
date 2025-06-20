#!/usr/bin/env node
/**
 * CLI Test Harness for IPaymentProcessor Interface
 * This test DRIVES the interface design - written BEFORE implementation!
 * 
 * Usage: tsx test-payment-processor.ts
 */

import type { IPaymentProcessor } from '../core/interfaces/index.js';
import type { PaymentRequest, PaymentResult, RefundResult, PaymentStatus, PaymentMethod } from '../core/types/index.js';

// Mock implementation for testing (drives our interface design!)
class MockPaymentProcessor implements IPaymentProcessor {
  private payments: Map<string, PaymentStatus> = new Map();
  private nextPaymentId = 1;

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const paymentId = `pay_${this.nextPaymentId++}`;
    
    // Simulate payment processing logic
    const isValidAmount = paymentRequest.amount > 0 && paymentRequest.amount <= 50000; // Max $500
    const isValidCurrency = paymentRequest.currency === 'USD';
    
    if (!isValidAmount || !isValidCurrency) {
      return {
        paymentId,
        status: 'failed',
        errorMessage: 'Invalid payment amount or currency'
      };
    }

    // Simulate successful payment
    const paymentStatus: PaymentStatus = {
      paymentId,
      status: 'completed',
      amount: paymentRequest.amount,
      transactionDate: new Date()
    };
    
    this.payments.set(paymentId, paymentStatus);

    return {
      paymentId,
      status: 'success',
      transactionId: `txn_${Date.now()}`,
      receiptUrl: `https://receipts.yolovibe.com/${paymentId}`
    };
  }

  async processRefund(bookingId: string, amount?: number): Promise<RefundResult> {
    // Find payment by booking ID (simplified for mock)
    const refundId = `ref_${Date.now()}`;
    const refundAmount = amount || 3000; // Default refund amount
    
    // Simulate refund processing
    return {
      refundId,
      status: 'success',
      amount: refundAmount
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }
    return payment;
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IPaymentProcessor Interface...\n');
  
  const processor: IPaymentProcessor = new MockPaymentProcessor();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Process successful payment
  testsTotal++;
  try {
    const paymentMethod: PaymentMethod = {
      type: 'card',
      cardToken: 'tok_visa_4242'
    };

    const paymentRequest: PaymentRequest = {
      amount: 3000, // $30.00
      currency: 'USD',
      bookingId: 'booking-123',
      paymentMethod,
      description: '3-Day YOLO Workshop'
    };

    const result = await processor.processPayment(paymentRequest);
    
    console.log('✅ Test 1: processPayment() - Success Case');
    console.log(`   Payment ID: ${result.paymentId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    console.log(`   Receipt URL: ${result.receiptUrl}`);
    
    if (result.status === 'success' && result.paymentId && result.transactionId) {
      testsPassed++;
      console.log('   ✅ Payment processed successfully\n');
    } else {
      console.log('   ❌ Payment processing failed\n');
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error, '\n');
  }

  // Test 2: Process payment with invalid amount
  testsTotal++;
  try {
    const paymentMethod: PaymentMethod = {
      type: 'card',
      cardToken: 'tok_visa_4242'
    };

    const invalidRequest: PaymentRequest = {
      amount: -100, // Invalid negative amount
      currency: 'USD',
      bookingId: 'booking-456',
      paymentMethod,
      description: 'Invalid payment test'
    };

    const result = await processor.processPayment(invalidRequest);
    
    console.log('✅ Test 2: processPayment() - Invalid Amount');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.errorMessage}`);
    
    if (result.status === 'failed' && result.errorMessage) {
      testsPassed++;
      console.log('   ✅ Invalid payment correctly rejected\n');
    } else {
      console.log('   ❌ Invalid payment should have been rejected\n');
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error, '\n');
  }

  // Test 3: Get payment status
  testsTotal++;
  try {
    const status = await processor.getPaymentStatus('pay_1');
    
    console.log('✅ Test 3: getPaymentStatus()');
    console.log(`   Payment ID: ${status.paymentId}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Amount: $${(status.amount / 100).toFixed(2)}`);
    console.log(`   Date: ${status.transactionDate.toISOString()}`);
    
    if (status.status === 'completed' && status.amount > 0) {
      testsPassed++;
      console.log('   ✅ Payment status retrieved correctly\n');
    } else {
      console.log('   ❌ Payment status incorrect\n');
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error, '\n');
  }

  // Test 4: Process refund
  testsTotal++;
  try {
    const refund = await processor.processRefund('booking-123', 1500); // Partial refund
    
    console.log('✅ Test 4: processRefund()');
    console.log(`   Refund ID: ${refund.refundId}`);
    console.log(`   Status: ${refund.status}`);
    console.log(`   Amount: $${(refund.amount / 100).toFixed(2)}`);
    
    if (refund.status === 'success' && refund.amount === 1500) {
      testsPassed++;
      console.log('   ✅ Refund processed successfully\n');
    } else {
      console.log('   ❌ Refund processing failed\n');
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error, '\n');
  }

  // Test 5: Error handling for invalid payment ID
  testsTotal++;
  try {
    await processor.getPaymentStatus('invalid-payment-id');
    console.log('❌ Test 5 FAILED: Should have thrown error for invalid payment ID\n');
  } catch (error) {
    console.log('✅ Test 5: getPaymentStatus() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    testsPassed++;
  }

  // Test 6: Large payment amount (business rule validation)
  testsTotal++;
  try {
    const paymentMethod: PaymentMethod = {
      type: 'card',
      cardToken: 'tok_visa_4242'
    };

    const largePaymentRequest: PaymentRequest = {
      amount: 100000, // $1000.00 - exceeds max
      currency: 'USD',
      bookingId: 'booking-large',
      paymentMethod,
      description: 'Large payment test'
    };

    const result = await processor.processPayment(largePaymentRequest);
    
    console.log('✅ Test 6: processPayment() - Large Amount Validation');
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 'failed') {
      testsPassed++;
      console.log('   ✅ Large payment correctly rejected\n');
    } else {
      console.log('   ❌ Large payment should have been rejected\n');
    }
  } catch (error) {
    console.log('❌ Test 6 FAILED:', error, '\n');
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! IPaymentProcessor interface is ready for implementation!');
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

export { runTests as testPaymentProcessor };
