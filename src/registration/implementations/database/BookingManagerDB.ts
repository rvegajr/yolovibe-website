/**
 * BookingManagerDB - Database Implementation
 * 
 * Database-backed implementation of IBookingManager interface.
 * Handles workshop booking operations with SQLite persistence,
 * including booking creation, retrieval, and cancellation.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { IBookingManager } from '../../core/interfaces/index.js';
import type { BookingRequest, BookingResult, Booking, Attendee } from '../../core/types/index.js';
import { BookingRepository } from '../../database/repositories/BookingRepository.js';
import { initializeDatabase, closeDatabaseConnection } from '../../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class BookingManagerDB implements IBookingManager {
  private bookingRepository: BookingRepository;
  private nextBookingId = 1;

  constructor() {
    // Initialize database connection
    initializeDatabase();
    this.bookingRepository = new BookingRepository();
    
    // Create test data if in test environment
    if (process.env.NODE_ENV === 'test') {
      this.createTestData();
    }
    
    console.log('📚 BookingManagerDB initialized with database persistence');
  }

  /**
   * Create test data for foreign key constraints
   */
  private createTestData(): void {
    try {
      // Use the public method from BookingRepository
      this.bookingRepository.createTestData();
      console.log('🧪 Test data created successfully');
    } catch (error) {
      console.error('⚠️  Failed to create test data:', error);
    }
  }

  /**
   * Create a new workshop booking
   */
  async createBooking(request: BookingRequest): Promise<BookingResult> {
    try {
      console.log(`🎯 Creating booking for product: ${request.productId}`);

      // Generate unique booking ID
      const bookingId = `booking-${this.nextBookingId++}`;
      
      // Generate workshop ID based on product and date
      const workshopId = `workshop-${request.productId}-${request.startDate.toISOString().split('T')[0]}`;
      
      // Generate confirmation number
      const confirmationNumber = `YOLO-${Date.now()}`;

      // Calculate pricing (simplified - would integrate with ProductCatalog)
      const basePrice = this.calculateBasePrice(request.productId);
      const totalAmount = basePrice * request.attendeeCount;
      const finalAmount = totalAmount; // No discounts applied yet

      // Create booking in database
      const bookingData = {
        id: bookingId,
        userId: 'user-1', // Simplified - would come from authentication context
        workshopId,
        totalAmount,
        finalAmount,
        status: 'CONFIRMED' as const,
        paymentStatus: 'PENDING' as const
      };

      const booking = await this.bookingRepository.createBooking(bookingData);

      // Add point of contact
      const firstAttendee = request.attendees[0];
      await this.bookingRepository.addPointOfContact(bookingId, {
        id: `poc-${bookingId}`,
        firstName: firstAttendee.firstName,
        lastName: firstAttendee.lastName,
        email: firstAttendee.email,
        phone: firstAttendee.phone,
        company: firstAttendee.company,
        isAttendee: true
      });

      // Add all attendees
      for (let i = 0; i < request.attendees.length; i++) {
        const attendeeInfo = request.attendees[i];
        await this.bookingRepository.addAttendee(bookingId, {
          id: `attendee-${bookingId}-${i + 1}`,
          firstName: attendeeInfo.firstName,
          lastName: attendeeInfo.lastName,
          email: attendeeInfo.email,
          company: attendeeInfo.company,
          dietaryRestrictions: attendeeInfo.dietaryRestrictions
        });
      }

      console.log(`✅ Booking created successfully: ${bookingId}`);

      return {
        bookingId,
        workshopId,
        status: 'confirmed',
        totalAmount,
        confirmationNumber
      };

    } catch (error) {
      console.error('❌ Booking creation failed:', error);
      throw new Error(`Booking creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve booking by ID
   */
  async getBooking(bookingId: string): Promise<Booking> {
    try {
      console.log(`🔍 Retrieving booking: ${bookingId}`);

      const booking = await this.bookingRepository.findById(bookingId);
      
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      console.log(`✅ Booking retrieved: ${bookingId}`);
      return booking;

    } catch (error) {
      console.error(`❌ Failed to retrieve booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      console.log(`🚫 Cancelling booking: ${bookingId}`);

      // Check if booking exists
      const existingBooking = await this.bookingRepository.findById(bookingId);
      if (!existingBooking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      // Update booking status to cancelled
      const cancelled = await this.bookingRepository.cancelBooking(bookingId);
      
      if (!cancelled) {
        throw new Error(`Failed to cancel booking: ${bookingId}`);
      }

      console.log(`✅ Booking cancelled successfully: ${bookingId}`);

    } catch (error) {
      console.error(`❌ Failed to cancel booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get bookings by user ID (additional helper method)
   */
  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    try {
      console.log(`🔍 Retrieving bookings for user: ${userId}`);
      
      const bookings = await this.bookingRepository.findByUserId(userId);
      
      console.log(`✅ Found ${bookings.length} bookings for user: ${userId}`);
      return bookings;

    } catch (error) {
      console.error(`❌ Failed to retrieve bookings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get bookings by workshop ID (additional helper method)
   */
  async getBookingsByWorkshopId(workshopId: string): Promise<Booking[]> {
    try {
      console.log(`🔍 Retrieving bookings for workshop: ${workshopId}`);
      
      const bookings = await this.bookingRepository.findByWorkshopId(workshopId);
      
      console.log(`✅ Found ${bookings.length} bookings for workshop: ${workshopId}`);
      return bookings;

    } catch (error) {
      console.error(`❌ Failed to retrieve bookings for workshop ${workshopId}:`, error);
      throw error;
    }
  }

  /**
   * Update booking status (additional helper method)
   */
  async updateBookingStatus(bookingId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'): Promise<Booking> {
    try {
      console.log(`🔄 Updating booking status: ${bookingId} -> ${status}`);

      const updatedBooking = await this.bookingRepository.updateBooking(bookingId, { status });
      
      if (!updatedBooking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      console.log(`✅ Booking status updated: ${bookingId}`);
      return updatedBooking;

    } catch (error) {
      console.error(`❌ Failed to update booking status ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Update payment status (additional helper method)
   */
  async updatePaymentStatus(bookingId: string, paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED', paymentIntentId?: string): Promise<Booking> {
    try {
      console.log(`💳 Updating payment status: ${bookingId} -> ${paymentStatus}`);

      const updateData: any = { paymentStatus };
      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      const updatedBooking = await this.bookingRepository.updateBooking(bookingId, updateData);
      
      if (!updatedBooking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      console.log(`✅ Payment status updated: ${bookingId}`);
      return updatedBooking;

    } catch (error) {
      console.error(`❌ Failed to update payment status ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get booking statistics (additional helper method)
   */
  async getBookingStatistics(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    totalRevenue: number;
  }> {
    try {
      console.log('📊 Retrieving booking statistics');
      
      const stats = await this.bookingRepository.getBookingStats();
      
      console.log('✅ Booking statistics retrieved');
      return stats;

    } catch (error) {
      console.error('❌ Failed to retrieve booking statistics:', error);
      throw error;
    }
  }

  /**
   * Calculate base price for a product (simplified pricing logic)
   */
  private calculateBasePrice(productId: string): number {
    // Simplified pricing - in production this would integrate with ProductCatalog
    if (productId.includes('3day')) {
      return 3000; // $3000 for 3-day workshops
    } else if (productId.includes('5day')) {
      return 4500; // $4500 for 5-day workshops
    } else if (productId.includes('intro')) {
      return 1500; // $1500 for intro workshops
    } else {
      return 2000; // Default price
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      console.log('🔌 Closing BookingManagerDB database connection');
      await closeDatabaseConnection();
      console.log('✅ BookingManagerDB database connection closed');
    } catch (error) {
      console.error('❌ Error closing BookingManagerDB database connection:', error);
      throw error;
    }
  }
}
