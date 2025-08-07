import type { APIRoute } from 'astro';

/**
 * GET /api/calendar/availability
 * Returns availability data for a date range
 * Query parameters:
 * - startDate: YYYY-MM-DD format
 * - endDate: YYYY-MM-DD format
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: startDate and endDate'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🔍 API: Getting calendar availability', { startDate, endDate });
    
    // Initialize database connection
    const { getDatabaseConnection } = await import('../../../registration/database/connection.js');
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }

    // Get blocked dates from database
    const { CalendarManagerDB } = await import('../../../registration/implementations/CalendarManagerDB.js');
    const calendarManager = new CalendarManagerDB();
    
    const availability: { [date: string]: boolean } = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate availability for each date in range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        // Check if date is available (not blocked)
        const isAvailable = await calendarManager.isDateAvailable(date, 'THREE_DAY'); // Default workshop type
        availability[dateStr] = isAvailable;
      } catch (error) {
        console.warn(`⚠️ Error checking availability for ${dateStr}:`, error);
        availability[dateStr] = true; // Default to available if check fails
      }
    }

    console.log(`✅ API: Generated availability for ${Object.keys(availability).length} dates`);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        availability,
        startDate,
        endDate,
        totalDates: Object.keys(availability).length,
        availableDates: Object.keys(availability).filter(date => availability[date]).length,
        blockedDates: Object.keys(availability).filter(date => !availability[date]).length
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
    
  } catch (error) {
    console.error('❌ API Error getting calendar availability:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch calendar availability',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 