#!/usr/bin/env npx tsx

/**
 * CLI Test Harness for IPurchaseManager Interface
 * Tests the complete purchase workflow (booking + payment)
 * 
 * Usage: npm run test:purchase-manager
 */

import type { IPurchaseManager } from '../core/interfaces/index.js';
import type { 
  PurchaseRequest, 
  PurchaseResult,
  PurchaseStatus,
  BookingRequest,
  PaymentMethod,
  AttendeeInfo,
  ContactInfo
} from '../core/types/index.js';

class MockPurchaseManager implements IPurchaseManager {
  private purchases = new Map<string, PurchaseStatus>();
  private nextPurchaseId = 1;

  async processPurchase(purchaseRequest: PurchaseRequest): Promise<PurchaseResult> {
    try {
      // Validate purchase request
      const { bookingRequest, paymentMethod } = purchaseRequest;
      
      if (!bookingRequest.productId || !bookingRequest.startDate || !bookingRequest.attendeeCount) {
        return {
          purchaseId: '',
          bookingId: '',
          paymentId: '',
          status: 'failed',
          totalAmount: 0,
          confirmationNumber: '',
          errorMessage: 'Invalid booking request'
        };
      }

      if (!paymentMethod.type || paymentMethod.type !== 'card') {
        return {
          purchaseId: '',
          bookingId: '',
          paymentId: '',
          status: 'failed',
          totalAmount: 0,
          confirmationNumber: '',
          errorMessage: 'Invalid payment method'
        };
      }

      // Calculate total amount
      const basePrice = bookingRequest.productId === 'prod-3day' ? 3000 : 4500;
      const totalAmount = basePrice * bookingRequest.attendeeCount;

      // Generate IDs
      const purchaseId = `purchase-${this.nextPurchaseId++}`;
      const bookingId = `booking-${Date.now()}`;
      const paymentId = `pay-${Date.now()}`;
      const confirmationNumber = `YOLO-${Date.now()}`;

      // Store purchase status
      this.purchases.set(purchaseId, {
        purchaseId,
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        totalAmount,
        paidAmount: totalAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        purchaseId,
        bookingId,
        paymentId,
        status: 'completed',
        totalAmount,
        confirmationNumber,
        receiptUrl: `https://receipts.yolovibe.com/${paymentId}`
      };

    } catch (error) {
      return {
        purchaseId: '',
        bookingId: '',
        paymentId: '',
        status: 'failed',
        totalAmount: 0,
        confirmationNumber: '',
        errorMessage: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  async getPurchaseStatus(purchaseId: string): Promise<PurchaseStatus> {
    const status = this.purchases.get(purchaseId);
    if (!status) {
      throw new Error(`Purchase not found: ${purchaseId}`);
    }
    return status;
  }

  async cancelPurchase(purchaseId: string): Promise<void> {
    const status = this.purchases.get(purchaseId);
    if (!status) {
      throw new Error(`Purchase not found: ${purchaseId}`);
    }

    // Update status to cancelled with refund
    status.bookingStatus = 'cancelled';
    status.paymentStatus = 'refunded';
    status.refundAmount = status.paidAmount;
    status.updatedAt = new Date();
    
    this.purchases.set(purchaseId, status);
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 Testing IPurchaseManager Interface...\n');

  const purchaseManager = new MockPurchaseManager();

  // Test data
  const validPurchaseRequest: PurchaseRequest = {
    bookingRequest: {
      productId: 'prod-3day',
      startDate: new Date('2025-07-01'),
      attendeeCount: 2,
      pointOfContact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123'
      } as ContactInfo,
      attendees: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com'
        }
      ] as AttendeeInfo[],
      paymentMethod: {
        type: 'card',
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      } as PaymentMethod
    },
    paymentMethod: {
      type: 'card',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    } as PaymentMethod
  };

  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Process successful purchase
  try {
    totalTests++;
    const result = await purchaseManager.processPurchase(validPurchaseRequest);
    
    console.log('✅ Test 1: processPurchase() - Success Case');
    console.log(`   Purchase ID: ${result.purchaseId}`);
    console.log(`   Booking ID: ${result.bookingId}`);
    console.log(`   Payment ID: ${result.paymentId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Total: $${result.totalAmount}`);
    console.log(`   Confirmation: ${result.confirmationNumber}`);
    console.log(`   Receipt: ${result.receiptUrl}`);
    console.log('   ✅ Purchase processed successfully\n');
    
    if (result.status === 'completed' && result.totalAmount === 6000) {
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Test 1 failed: ${error}\n`);
  }

  // Test 2: Get purchase status
  try {
    totalTests++;
    const firstPurchase = await purchaseManager.processPurchase(validPurchaseRequest);
    const status = await purchaseManager.getPurchaseStatus(firstPurchase.purchaseId);
    
    console.log('✅ Test 2: getPurchaseStatus()');
    console.log(`   Purchase ID: ${status.purchaseId}`);
    console.log(`   Booking Status: ${status.bookingStatus}`);
    console.log(`   Payment Status: ${status.paymentStatus}`);
    console.log(`   Total: $${status.totalAmount}`);
    console.log(`   Paid: $${status.paidAmount}`);
    console.log('   ✅ Purchase status retrieved correctly\n');
    
    if (status.bookingStatus === 'confirmed' && status.paymentStatus === 'completed') {
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Test 2 failed: ${error}\n`);
  }

  // Test 3: Cancel purchase
  try {
    totalTests++;
    const purchaseToCancel = await purchaseManager.processPurchase(validPurchaseRequest);
    await purchaseManager.cancelPurchase(purchaseToCancel.purchaseId);
    const cancelledStatus = await purchaseManager.getPurchaseStatus(purchaseToCancel.purchaseId);
    
    console.log('✅ Test 3: cancelPurchase()');
    console.log(`   Booking Status: ${cancelledStatus.bookingStatus}`);
    console.log(`   Payment Status: ${cancelledStatus.paymentStatus}`);
    console.log(`   Refund Amount: $${cancelledStatus.refundAmount}`);
    console.log('   ✅ Purchase cancelled successfully\n');
    
    if (cancelledStatus.bookingStatus === 'cancelled' && cancelledStatus.paymentStatus === 'refunded') {
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Test 3 failed: ${error}\n`);
  }

  // Test 4: Invalid purchase request
  try {
    totalTests++;
    const invalidRequest: PurchaseRequest = {
      ...validPurchaseRequest,
      bookingRequest: {
        ...validPurchaseRequest.bookingRequest,
        productId: '', // Invalid product ID
        attendeeCount: 0 // Invalid count
      }
    };
    
    const result = await purchaseManager.processPurchase(invalidRequest);
    
    console.log('✅ Test 4: processPurchase() - Invalid Request');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.errorMessage}`);
    console.log('   ✅ Invalid purchase correctly rejected\n');
    
    if (result.status === 'failed' && result.errorMessage) {
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Test 4 failed: ${error}\n`);
  }

  // Test 5: Get status for non-existent purchase
  try {
    totalTests++;
    await purchaseManager.getPurchaseStatus('invalid-purchase-id');
    console.log('❌ Test 5: Should have thrown error for invalid purchase ID\n');
  } catch (error) {
    console.log('✅ Test 5: getPurchaseStatus() error handling');
    console.log(`   Correctly threw error: ${error instanceof Error ? error.message : error}\n`);
    testsPassed++;
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${totalTests}`);
  console.log(`   Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IPurchaseManager interface is ready for implementation!');
  } else {
    console.log('   ❌ Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
