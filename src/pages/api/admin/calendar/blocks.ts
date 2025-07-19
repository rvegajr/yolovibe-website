/**
 * API Endpoint: Get All Blocked Dates
 * GET /api/admin/calendar/blocks
 * Uses CalendarManagerDB to retrieve all blocked dates from database
 */

import type { APIRoute } from 'astro';
import { CalendarManagerDB } from '../../../../registration/implementations/CalendarManagerDB.js';

export const GET: APIRoute = async () => {
  try {
    console.log('📅 API: Get blocked dates request received');
    
    // Initialize calendar manager
    const calendar = new CalendarManagerDB();
    
    // Get all blocks
    const blocks = await (calendar as any).getAllBlocks();
    
    console.log(`✅ API: Retrieved ${blocks.length} blocked dates`);
    
    return new Response(JSON.stringify(blocks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ API: Error retrieving blocked dates:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to retrieve blocked dates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 