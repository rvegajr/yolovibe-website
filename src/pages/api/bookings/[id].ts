import type { APIRoute } from 'astro';
import { BookingManagerDB } from '../../../registration/implementations/database/BookingManagerDB.js';

export const prerender = false;

/**
 * GET /api/bookings/[id]
 * Retrieves a specific booking by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const bookingId = params.id;
    
    if (!bookingId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Booking ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 API: Getting booking: ${bookingId}`);
    
    const bookingManager = new BookingManagerDB();
    const booking = await bookingManager.getBooking(bookingId);
    
    console.log(`✅ API: Booking retrieved: ${booking.id}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: booking
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`❌ API Error getting booking:`, error);
    
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to retrieve booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * PUT /api/bookings/[id]
 * Updates a booking (e.g., payment status, attendee info)
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const bookingId = params.id;
    const body = await request.json();
    
    if (!bookingId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Booking ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📝 API: Updating booking: ${bookingId}`);
    
    const bookingManager = new BookingManagerDB();
    
    // Handle different update types
    if (body.action === 'updatePaymentStatus' && body.paymentStatus) {
      await (bookingManager as any).updatePaymentStatus(bookingId, body.paymentStatus);
    } else if (body.action === 'updateBookingStatus' && body.status) {
      await (bookingManager as any).updateBookingStatus(bookingId, body.status);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid update action or missing parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get updated booking
    const updatedBooking = await bookingManager.getBooking(bookingId);
    
    console.log(`✅ API: Booking updated: ${bookingId}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`❌ API Error updating booking:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update booking',
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
 * DELETE /api/bookings/[id]
 * Cancels a booking
 */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const bookingId = params.id;
    
    if (!bookingId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Booking ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🚫 API: Cancelling booking: ${bookingId}`);
    
    const bookingManager = new BookingManagerDB();
    const cancelledBooking = await bookingManager.cancelBooking(bookingId);
    
    console.log(`✅ API: Booking cancelled: ${bookingId}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`❌ API Error cancelling booking:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to cancel booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
