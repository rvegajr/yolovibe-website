/**
 * BookingRepository - Database operations for bookings
 * 
 * Handles all database operations related to workshop bookings,
 * including creation, retrieval, updates, and cancellation.
 * Works with the bookings table and related attendee/contact tables.
 */

import { BaseRepository } from './BaseRepository.js';
import type { Booking, BookingRequest, Attendee } from '../../core/types/index.js';

export interface CreateBookingData {
  id: string;
  userId: string;
  workshopId: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  couponCode?: string;
  paymentIntentId?: string;
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
}

export interface UpdateBookingData {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentIntentId?: string;
  discountAmount?: number;
  finalAmount?: number;
  couponCode?: string;
}

export interface BookingRow {
  id: string;
  user_id: string;
  workshop_id: string;
  booking_date: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  coupon_code: string | null;
  payment_intent_id: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface AttendeeRow {
  id: string;
  booking_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  dietary_restrictions: string | null;
  access_password_hash: string | null;
  password_expires_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PointOfContactRow {
  id: string;
  booking_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  is_attendee: number;
  created_at: string;
  updated_at: string;
}

export class BookingRepository extends BaseRepository {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const query = `
      INSERT INTO bookings (
        id, user_id, workshop_id, total_amount, discount_amount, 
        final_amount, coupon_code, payment_intent_id, payment_status, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const params = [
      bookingData.id,
      bookingData.userId,
      bookingData.workshopId,
      bookingData.totalAmount,
      bookingData.discountAmount || 0,
      bookingData.finalAmount,
      bookingData.couponCode || null,
      bookingData.paymentIntentId || null,
      bookingData.paymentStatus || 'PENDING',
      bookingData.status || 'PENDING'
    ];

    this.execute(query, params);

    this.logOperation('CREATE', 'bookings', { id: bookingData.id });

    // Return the created booking
    const booking = await this.findById(bookingData.id);
    if (!booking) {
      throw new Error('Failed to create booking');
    }

    return booking;
  }

  /**
   * Find booking by ID with all related data
   */
  async findById(id: string): Promise<Booking | null> {
    const sql = 'SELECT * FROM bookings WHERE id = ?';
    const row = this.findOne<BookingRow>(sql, [id]);
    
    if (!row) {
      return null;
    }

    // Get attendees for this booking
    const attendees = await this.getAttendeesByBookingId(id);

    // Get point of contact
    const pointOfContactId = await this.getPointOfContactIdByBookingId(id);

    return this.mapRowToBooking(row, attendees, pointOfContactId);
  }

  /**
   * Update booking
   */
  async updateBooking(id: string, updateData: UpdateBookingData): Promise<Booking | null> {
    const dataToUpdate = {
      ...updateData,
      updated_at: this.getCurrentTimestamp()
    };

    const { set, params } = this.buildUpdateClause(this.toSnakeCase(dataToUpdate));
    const sql = `UPDATE bookings SET ${set} WHERE id = ?`;
    
    const result = this.execute(sql, [...params, id]);
    
    if (result.changes === 0) {
      return null;
    }

    this.logOperation('UPDATE', 'bookings', { id });
    
    return this.findById(id);
  }

  /**
   * Cancel booking (soft delete by updating status)
   */
  async cancelBooking(id: string): Promise<boolean> {
    const sql = `
      UPDATE bookings 
      SET status = 'CANCELLED', updated_at = ?
      WHERE id = ?
    `;
    
    const result = this.execute(sql, [this.getCurrentTimestamp(), id]);
    
    this.logOperation('CANCEL', 'bookings', { id });
    
    return result.changes > 0;
  }

  /**
   * Add attendee to booking
   */
  async addAttendee(bookingId: string, attendeeData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    dietaryRestrictions?: string;
  }): Promise<void> {
    const query = `
      INSERT INTO attendees (
        id, booking_id, first_name, last_name, email, company, 
        dietary_restrictions, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const params = [
      attendeeData.id,
      bookingId,
      attendeeData.firstName,
      attendeeData.lastName,
      attendeeData.email,
      attendeeData.company || null,
      attendeeData.dietaryRestrictions || null
    ];

    this.execute(query, params);

    this.logOperation('CREATE', 'attendees', { id: attendeeData.id, bookingId });
  }

  /**
   * Add point of contact for booking
   */
  async addPointOfContact(bookingId: string, contactData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    isAttendee?: boolean;
  }): Promise<void> {
    const query = `
      INSERT INTO points_of_contact (
        id, booking_id, first_name, last_name, email, phone, 
        company, is_attendee, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const params = [
      contactData.id,
      bookingId,
      contactData.firstName,
      contactData.lastName,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.isAttendee ? 1 : 0
    ];

    this.execute(query, params);

    this.logOperation('CREATE', 'points_of_contact', { id: contactData.id, bookingId });
  }

  /**
   * Get attendees for a booking
   */
  private async getAttendeesByBookingId(bookingId: string): Promise<Attendee[]> {
    const sql = 'SELECT * FROM attendees WHERE booking_id = ? ORDER BY created_at';
    const rows = this.findMany<AttendeeRow>(sql, [bookingId]);
    
    return rows.map(row => this.mapRowToAttendee(row));
  }

  /**
   * Get point of contact ID for a booking
   */
  private async getPointOfContactIdByBookingId(bookingId: string): Promise<string> {
    const sql = 'SELECT id FROM points_of_contact WHERE booking_id = ? LIMIT 1';
    const row = this.findOne<{ id: string }>(sql, [bookingId]);
    
    return row?.id || `poc-${bookingId}`;
  }

  /**
   * Get bookings by user ID
   */
  async findByUserId(userId: string): Promise<Booking[]> {
    const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC';
    const rows = this.findMany<BookingRow>(sql, [userId]);
    
    const bookings: Booking[] = [];
    for (const row of rows) {
      const attendees = await this.getAttendeesByBookingId(row.id);
      const pointOfContactId = await this.getPointOfContactIdByBookingId(row.id);
      bookings.push(this.mapRowToBooking(row, attendees, pointOfContactId));
    }
    
    return bookings;
  }

  /**
   * Get bookings by workshop ID
   */
  async findByWorkshopId(workshopId: string): Promise<Booking[]> {
    const sql = 'SELECT * FROM bookings WHERE workshop_id = ? ORDER BY created_at DESC';
    const rows = this.findMany<BookingRow>(sql, [workshopId]);
    
    const bookings: Booking[] = [];
    for (const row of rows) {
      const attendees = await this.getAttendeesByBookingId(row.id);
      const pointOfContactId = await this.getPointOfContactIdByBookingId(row.id);
      bookings.push(this.mapRowToBooking(row, attendees, pointOfContactId));
    }
    
    return bookings;
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    totalRevenue: number;
  }> {
    const totalBookings = this.findOne<{ count: number }>('SELECT COUNT(*) as count FROM bookings')?.count || 0;
    
    const confirmedBookings = this.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['CONFIRMED']
    )?.count || 0;
    
    const cancelledBookings = this.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['CANCELLED']
    )?.count || 0;
    
    const pendingBookings = this.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['PENDING']
    )?.count || 0;
    
    const totalRevenue = this.findOne<{ total: number }>(
      'SELECT SUM(final_amount) as total FROM bookings WHERE status = ?', ['CONFIRMED']
    )?.total || 0;
    
    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue
    };
  }

  /**
   * Create test data for foreign key constraints (public method for testing)
   */
  public createTestData(): void {
    try {
      // Create test user
      const userQuery = `
        INSERT OR IGNORE INTO users (
          id, email, password_hash, first_name, last_name, 
          is_admin, email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      this.execute(userQuery, [
        'user-1',
        'test@example.com',
        'hashed_password',
        'Test',
        'User',
        0, // false as integer
        1, // true as integer
      ]);

      // Create test products
      const productQuery = `
        INSERT OR IGNORE INTO products (
          id, name, description, product_type, price, duration_days, 
          max_capacity, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      this.execute(productQuery, [
        'prod-3day-2025-07-01',
        '3-Day Workshop',
        'Intensive 3-day workshop',
        'THREE_DAY',
        3000.00,
        3,
        12,
        1 // true as integer
      ]);

      this.execute(productQuery, [
        'prod-5day-2025-08-01',
        '5-Day Workshop',
        'Comprehensive 5-day workshop',
        'FIVE_DAY',
        4500.00,
        5,
        12,
        1 // true as integer
      ]);

      // Create test workshops
      const workshopQuery = `
        INSERT OR IGNORE INTO workshops (
          id, product_id, start_date, end_date, current_capacity, 
          max_capacity, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      this.execute(workshopQuery, [
        'workshop-prod-3day-2025-07-01-2025-07-01',
        'prod-3day-2025-07-01',
        '2025-07-01',
        '2025-07-03',
        0,
        12,
        'ACTIVE'
      ]);

      this.execute(workshopQuery, [
        'workshop-prod-5day-2025-08-01-2025-08-01',
        'prod-5day-2025-08-01',
        '2025-08-01',
        '2025-08-05',
        0,
        12,
        'ACTIVE'
      ]);

      this.logOperation('CREATE', 'test_data', { message: 'Test data created successfully' });
    } catch (error) {
      console.error('⚠️  Failed to create test data:', error);
    }
  }

  /**
   * Map database row to Booking object
   */
  private mapRowToBooking(row: BookingRow, attendees: Attendee[], pointOfContactId: string): Booking {
    return {
      id: row.id,
      workshopId: row.workshop_id,
      pointOfContactId,
      attendees,
      totalAmount: row.total_amount,
      paymentStatus: this.mapPaymentStatus(row.payment_status),
      bookingDate: new Date(row.booking_date),
      status: this.mapBookingStatus(row.status),
      confirmationNumber: `YOLO-${row.id.split('-').pop()}`
    };
  }

  /**
   * Map database payment status to core type
   */
  private mapPaymentStatus(dbStatus: string): 'pending' | 'paid' | 'refunded' | 'failed' {
    switch (dbStatus.toLowerCase()) {
      case 'completed': return 'paid';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      case 'refunded': return 'refunded';
      default: return 'pending';
    }
  }

  /**
   * Map database booking status to core type
   */
  private mapBookingStatus(dbStatus: string): 'active' | 'cancelled' | 'completed' {
    switch (dbStatus.toLowerCase()) {
      case 'confirmed': return 'active';
      case 'pending': return 'active';
      case 'cancelled': return 'cancelled';
      case 'refunded': return 'cancelled';
      default: return 'active';
    }
  }

  /**
   * Map database row to Attendee object
   */
  private mapRowToAttendee(row: AttendeeRow): Attendee {
    return {
      id: row.id,
      bookingId: row.booking_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: '', // Not stored in attendees table
      company: row.company || '',
      dietaryRestrictions: row.dietary_restrictions || '',
      accessibilityNeeds: '', // Not stored in current schema
      accessStatus: {
        attendeeId: row.id,
        hasAccess: !!row.access_password_hash,
        passwordGenerated: !!row.access_password_hash
      },
      registrationDate: new Date(row.created_at)
    };
  }
}
