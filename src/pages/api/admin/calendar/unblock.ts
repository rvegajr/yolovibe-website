/**
 * API Endpoint: Unblock Date
 * POST /api/admin/calendar/unblock
 * Uses CalendarManagerDB to unblock dates in database
 */

import type { APIRoute } from 'astro';
import { CalendarManagerDB } from '../../../../registration/implementations/CalendarManagerDB.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 API: Unblock date request received');
    
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return new Response(JSON.stringify({
        error: 'Missing required field: date'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize calendar manager
    const calendar = new CalendarManagerDB();
    
    // Unblock the date
    const unblockDate = new Date(date);
    await calendar.unblockDate(unblockDate);
    
    console.log(`✅ API: Date ${date} unblocked successfully`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Date ${date} unblocked successfully`,
      date: date
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API: Error unblocking date:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to unblock date',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 