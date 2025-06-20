/**
 * BookingManager - Concrete Implementation
 * Core workshop booking functionality
 * Simple, focused implementation - no over-engineering!
 */

import type { IBookingManager } from '../core/interfaces/index.js';
import type { BookingRequest, BookingResult, Booking, Attendee } from '../core/types/index.js';

export class BookingManager implements IBookingManager {
  private bookings: Map<string, Booking> = new Map();
  private nextBookingId = 1;

  async createBooking(request: BookingRequest): Promise<BookingResult> {
    try {
      // Generate booking and workshop IDs
      const bookingId = `booking-${this.nextBookingId++}`;
      const workshopId = `workshop-${request.productId}-${request.startDate.toISOString().split('T')[0]}`;
      const confirmationNumber = `YOLO-${Date.now()}`;

      // Calculate total amount (simplified - would integrate with product catalog)
      const basePrice = request.productId.includes('3day') ? 3000 : 4500;
      const totalAmount = basePrice * request.attendeeCount;

      // Convert attendee info to attendee objects
      const attendees: Attendee[] = request.attendees.map((info, index) => ({
        // AttendeeInfo properties
        firstName: info.firstName,
        lastName: info.lastName,
        email: info.email,
        phone: info.phone || '',
        company: info.company || '',
        dietaryRestrictions: info.dietaryRestrictions || '',
        accessibilityNeeds: info.accessibilityNeeds || '',
        // Additional Attendee properties
        id: `attendee-${bookingId}-${index + 1}`,
        bookingId,
        accessStatus: {
          attendeeId: `attendee-${bookingId}-${index + 1}`,
          hasAccess: false,
          passwordGenerated: false
        },
        registrationDate: new Date()
      }));

      // Create booking object
      const booking: Booking = {
        id: bookingId,
        workshopId,
        pointOfContactId: `poc-${bookingId}`, // Simplified
        attendees,
        totalAmount,
        paymentStatus: 'pending',
        bookingDate: new Date(),
        status: 'active',
        confirmationNumber
      };

      // Store booking
      this.bookings.set(bookingId, booking);

      return {
        bookingId,
        workshopId,
        status: 'confirmed',
        totalAmount,
        confirmationNumber
      };

    } catch (error) {
      throw new Error(`Booking creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    return { ...booking }; // Return copy to prevent mutation
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    this.bookings.set(bookingId, booking);
  }
}
