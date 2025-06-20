/**
 * PurchaseManager Implementation
 * Coordinates booking creation and payment processing
 * Implements IPurchaseManager interface
 */

import type { 
  IPurchaseManager, 
  IBookingManager, 
  IPaymentProcessor,
  IEmailSender
} from '../core/interfaces/index.js';
import type { 
  PurchaseRequest, 
  PurchaseResult,
  PurchaseStatus,
  PaymentRequest,
  EmailRequest
} from '../core/types/index.js';
import { BookingManagerDB } from './database/BookingManagerDB.js';
import { PaymentProcessorManager } from './PaymentProcessorManager.js';
import { EmailSenderManager } from './EmailSenderManager.js';
import { FollowUpEmailManager } from './FollowUpEmailManager.js';

// Enhanced PurchaseStatus to include attendee info for email notifications
interface EnhancedPurchaseStatus extends PurchaseStatus {
  bookingId?: string;
  paymentId?: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

export class PurchaseManager implements IPurchaseManager {
  private bookingManager: IBookingManager;
  private paymentProcessor: IPaymentProcessor;
  private emailSender: IEmailSender;
  private followUpEmailManager: FollowUpEmailManager;
  private purchases = new Map<string, EnhancedPurchaseStatus>();
  private nextPurchaseId = 1;

  constructor(
    bookingManager?: IBookingManager,
    paymentProcessor?: IPaymentProcessor,
    emailSender?: IEmailSender
  ) {
    this.bookingManager = bookingManager || new BookingManagerDB();
    this.paymentProcessor = paymentProcessor || new PaymentProcessorManager();
    this.emailSender = emailSender || new EmailSenderManager();
    this.followUpEmailManager = new FollowUpEmailManager(this.emailSender, this.bookingManager);
  }

  /**
   * Process a complete purchase (booking + payment)
   */
  async processPurchase(purchaseRequest: PurchaseRequest): Promise<PurchaseResult> {
    const purchaseId = `purchase-${this.nextPurchaseId++}`;
    
    try {
      console.log(`💳 Processing purchase: ${purchaseId}`);

      // Step 1: Create booking
      console.log('📅 Creating booking...');
      const bookingResult = await this.bookingManager.createBooking(purchaseRequest.bookingRequest);
      
      // Step 2: Calculate payment amount
      const totalAmount = this.calculateTotalAmount(
        purchaseRequest.bookingRequest.productId,
        purchaseRequest.bookingRequest.attendeeCount
      );

      // Step 3: Process payment
      console.log('💰 Processing payment...');
      const paymentRequest: PaymentRequest = {
        amount: totalAmount,
        currency: 'USD',
        bookingId: bookingResult.bookingId,
        paymentMethod: purchaseRequest.paymentMethod,
        description: `YOLOVibe Workshop - Booking ${bookingResult.bookingId}`
      };

      const paymentResult = await this.paymentProcessor.processPayment(paymentRequest);

      if (paymentResult.status === 'success') {
        // Store successful purchase status
        this.purchases.set(purchaseId, {
          purchaseId,
          bookingId: bookingResult.bookingId,
          paymentId: paymentResult.paymentId,
          bookingStatus: 'confirmed',
          paymentStatus: 'completed',
          totalAmount,
          paidAmount: totalAmount,
          attendeeEmail: purchaseRequest.bookingRequest.pointOfContact.email,
          attendeeName: `${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`✅ Purchase completed successfully: ${purchaseId}`);

        // Send email notification
        const emailRequest: EmailRequest = {
          to: purchaseRequest.bookingRequest.pointOfContact.email,
          from: 'noreply@yolovibe.com',
          subject: 'Purchase Confirmation - YOLOVibe Workshop',
          content: `Dear ${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName},\n\nYour purchase has been successfully processed.\n\nBooking ID: ${bookingResult.bookingId}\nPayment ID: ${paymentResult.paymentId}\nTotal Amount: $${totalAmount}\n\nThank you for your purchase!`
        };
        await this.emailSender.sendEmail(emailRequest);

        // Schedule follow-up emails
        await this.followUpEmailManager.scheduleFollowUpEmails(
          purchaseId,
          bookingResult.bookingId,
          purchaseRequest.bookingRequest.pointOfContact.email,
          `${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName}`,
          purchaseRequest.bookingRequest.startDate
        );

        return {
          purchaseId,
          bookingId: bookingResult.bookingId,
          paymentId: paymentResult.paymentId,
          status: 'completed',
          totalAmount,
          confirmationNumber: bookingResult.confirmationNumber,
          receiptUrl: paymentResult.receiptUrl
        };
      } else {
        // Payment failed - cancel booking
        console.log('❌ Payment failed, cancelling booking...');
        await this.bookingManager.cancelBooking(bookingResult.bookingId);

        // Store failed purchase status
        this.purchases.set(purchaseId, {
          purchaseId,
          bookingId: bookingResult.bookingId,
          paymentId: paymentResult.paymentId,
          bookingStatus: 'cancelled',
          paymentStatus: 'failed',
          totalAmount,
          paidAmount: 0,
          attendeeEmail: purchaseRequest.bookingRequest.pointOfContact.email,
          attendeeName: `${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Send email notification
        const emailRequest: EmailRequest = {
          to: purchaseRequest.bookingRequest.pointOfContact.email,
          from: 'noreply@yolovibe.com',
          subject: 'Purchase Failed - YOLOVibe Workshop',
          content: `Dear ${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName},\n\nYour purchase has failed.\n\nBooking ID: ${bookingResult.bookingId}\nPayment ID: ${paymentResult.paymentId}\nError Message: ${paymentResult.errorMessage}\n\nPlease try again or contact our support team.`
        };
        await this.emailSender.sendEmail(emailRequest);

        return {
          purchaseId,
          bookingId: bookingResult.bookingId,
          paymentId: paymentResult.paymentId,
          status: 'failed',
          totalAmount,
          confirmationNumber: bookingResult.confirmationNumber,
          errorMessage: paymentResult.errorMessage || 'Payment processing failed'
        };
      }

    } catch (error) {
      console.error(`❌ Purchase failed: ${error}`);

      // Store failed purchase status
      this.purchases.set(purchaseId, {
        purchaseId,
        bookingId: '',
        paymentId: '',
        bookingStatus: 'cancelled',
        paymentStatus: 'failed',
        totalAmount: 0,
        paidAmount: 0,
        attendeeEmail: purchaseRequest.bookingRequest.pointOfContact.email,
        attendeeName: `${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Send email notification
      const emailRequest: EmailRequest = {
        to: purchaseRequest.bookingRequest.pointOfContact.email,
        from: 'noreply@yolovibe.com',
        subject: 'Purchase Failed - YOLOVibe Workshop',
        content: `Dear ${purchaseRequest.bookingRequest.pointOfContact.firstName} ${purchaseRequest.bookingRequest.pointOfContact.lastName},\n\nYour purchase has failed.\n\nError Message: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact our support team.`
      };
      await this.emailSender.sendEmail(emailRequest);

      return {
        purchaseId,
        bookingId: '',
        paymentId: '',
        status: 'failed',
        totalAmount: 0,
        confirmationNumber: '',
        errorMessage: error instanceof Error ? error.message : 'Purchase processing failed'
      };
    }
  }

  /**
   * Get purchase status
   */
  async getPurchaseStatus(purchaseId: string): Promise<PurchaseStatus> {
    const status = this.purchases.get(purchaseId);
    if (!status) {
      throw new Error(`Purchase not found: ${purchaseId}`);
    }
    return status;
  }

  /**
   * Cancel purchase (refund payment and cancel booking)
   */
  async cancelPurchase(purchaseId: string): Promise<void> {
    const status = this.purchases.get(purchaseId);
    if (!status) {
      throw new Error(`Purchase not found: ${purchaseId}`);
    }

    try {
      console.log(`🔄 Cancelling purchase: ${purchaseId}`);

      // Process refund if payment was completed
      if (status.paymentStatus === 'completed' && status.paidAmount > 0) {
        console.log('💸 Processing refund...');
        await this.paymentProcessor.processRefund(purchaseId, status.paidAmount);
        status.refundAmount = status.paidAmount;
        status.paymentStatus = 'refunded';
      }

      // Update status
      status.bookingStatus = 'cancelled';
      status.updatedAt = new Date();
      
      this.purchases.set(purchaseId, status);

      console.log(`✅ Purchase cancelled successfully: ${purchaseId}`);

      // Send email notification
      const emailRequest: EmailRequest = {
        to: status.attendeeEmail || '',
        from: 'noreply@yolovibe.com',
        subject: 'Purchase Cancelled - YOLOVibe Workshop',
        content: `Dear ${status.attendeeName || 'Customer'},\n\nYour purchase has been cancelled.\n\nPurchase ID: ${purchaseId}\nRefund Amount: $${status.refundAmount || 0}\n\nThank you for your understanding.`
      };
      await this.emailSender.sendEmail(emailRequest);

    } catch (error) {
      console.error(`❌ Purchase cancellation failed: ${error}`);
      throw new Error(`Purchase cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate total amount based on product and attendee count
   */
  private calculateTotalAmount(productId: string, attendeeCount: number): number {
    // Base prices (would normally come from ProductCatalog)
    const basePrices: Record<string, number> = {
      'prod-3day': 3000,
      'prod-5day': 4500
    };

    const basePrice = basePrices[productId] || 3000;
    return basePrice * attendeeCount;
  }

  /**
   * Generate payment source ID from payment method
   */
  private generatePaymentSourceId(paymentMethod: any): string {
    // In a real implementation, this would integrate with Square Web Payments SDK
    // to tokenize the payment method and return a secure source ID
    return `card-${Date.now()}`;
  }
}
