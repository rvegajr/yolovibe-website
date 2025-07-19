/**
 * API Endpoint: Block Single Date
 * POST /api/admin/calendar/block
 * Uses CalendarManagerDB to block dates in database
 */

import type { APIRoute } from 'astro';
import { CalendarManagerDB } from '../../../../registration/implementations/CalendarManagerDB.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 API: Block date request received');
    
    const body = await request.json();
    const { date, reason } = body;
    
    if (!date || !reason) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: date and reason'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize calendar manager
    const calendar = new CalendarManagerDB();
    
    // Block the date
    const blockDate = new Date(date);
    await calendar.blockDate(blockDate, reason);
    
    console.log(`✅ API: Date ${date} blocked successfully with reason: ${reason}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Date ${date} blocked successfully`,
      date: date,
      reason: reason
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API: Error blocking date:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to block date',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 