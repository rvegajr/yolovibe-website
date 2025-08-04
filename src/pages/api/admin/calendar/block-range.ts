/**
 * API Endpoint: Block Date Range
 * POST /api/admin/calendar/block-range
 * Uses CalendarManagerDB to block date ranges in database
 */

import type { APIRoute } from 'astro';
import { CalendarManagerDB } from '../../../../registration/implementations/CalendarManagerDB.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 API: Block date range request received');
    
    const body = await request.json();
    const { startDate, endDate, reason } = body;
    
    if (!startDate || !endDate || !reason) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: startDate, endDate, and reason'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Validate date order
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return new Response(JSON.stringify({
        error: 'Start date must be before or equal to end date'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize calendar manager
    const calendar = new CalendarManagerDB();
    
    // Block the date range
    await calendar.blockDateRange(start, end, reason);
    
    console.log(`✅ API: Date range ${startDate} to ${endDate} blocked successfully with reason: ${reason}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Date range ${startDate} to ${endDate} blocked successfully`,
      startDate: startDate,
      endDate: endDate,
      reason: reason
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API: Error blocking date range:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to block date range',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 