import type { APIRoute } from 'astro';
import { BookingManagerDB } from '../../../../registration/implementations/database/BookingManagerDB.js';

export const prerender = false;

/**
 * GET /api/bookings/user/[userId]
 * Retrieves all bookings for a specific user
 */
export const GET: APIRoute = async ({ params, url }) => {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 API: Getting bookings for user: ${userId}`);
    
    // Get query parameters for filtering
    const status = url.searchParams.get('status'); // active, cancelled, completed
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    
    const bookingManager = new BookingManagerDB();
    const bookings = await (bookingManager as any).getBookingsByUser(userId);
    
    // Apply status filter if provided
    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter((booking: any) => booking.status === status);
    }
    
    // Apply pagination if provided
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    if (limitNum) {
      filteredBookings = filteredBookings.slice(offsetNum, offsetNum + limitNum);
    }
    
    console.log(`✅ API: Found ${filteredBookings.length} bookings for user: ${userId}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: filteredBookings,
      count: filteredBookings.length,
      totalCount: bookings.length,
      filters: { status, limit: limitNum, offset: offsetNum }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`❌ API Error getting user bookings:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to retrieve user bookings',
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
 * GET /api/bookings/user/[userId]/stats
 * Retrieves booking statistics for a specific user
 */
export const GET_STATS: APIRoute = async ({ params }) => {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📊 API: Getting booking stats for user: ${userId}`);
    
    const bookingManager = new BookingManagerDB();
    const bookings = await (bookingManager as any).getBookingsByUser(userId);
    
    // Calculate statistics
    const stats = {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b: any) => b.status === 'active').length,
      completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
      cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
      totalSpent: bookings
        .filter((b: any) => b.paymentStatus === 'paid')
        .reduce((sum: number, b: any) => sum + b.totalAmount, 0),
      upcomingWorkshops: bookings.filter((b: any) => 
        b.status === 'active' && new Date(b.bookingDate) > new Date()
      ).length
    };
    
    console.log(`✅ API: Generated stats for user: ${userId}`, stats);
    
    return new Response(JSON.stringify({
      success: true,
      data: stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`❌ API Error getting user booking stats:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to retrieve user booking statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
