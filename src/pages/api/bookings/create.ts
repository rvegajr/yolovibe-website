import type { APIRoute } from 'astro';
import { BookingManagerDB } from '../../../registration/implementations/database/BookingManagerDB.js';
import { initializeDatabase } from '../../../registration/database/connection.js';
import type { BookingRequest } from '../../../registration/core/types/index.js';

export const prerender = false;

/**
 * POST /api/bookings/create
 * Creates a new workshop booking
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 API: Booking creation request');
    
    // Initialize database if not already done
    await initializeDatabase();
    
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('📝 API: Booking request received:', {
      productId: body.productId,
      attendeeCount: body.attendeeCount,
      startDate: body.startDate
    });
    
    // Validate required fields
    if (!body.productId || !body.startDate || !body.attendeeCount || !body.attendees || !body.pointOfContact || !body.paymentMethod) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields',
        required: ['productId', 'startDate', 'attendeeCount', 'attendees', 'pointOfContact', 'paymentMethod']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create booking request
    const bookingRequest: BookingRequest = {
      productId: body.productId,
      startDate: new Date(body.startDate),
      attendeeCount: body.attendeeCount,
      attendees: body.attendees,
      pointOfContact: body.pointOfContact,
      paymentMethod: body.paymentMethod,
      couponCode: body.couponCode
    };
    
    // Initialize BookingManager and create booking
    const bookingManager = new BookingManagerDB();
    const booking = await bookingManager.createBooking(bookingRequest);
    
    console.log(`✅ API: Booking created successfully: ${booking.bookingId}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API Error creating booking:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * OPTIONS /api/bookings/create
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
};
