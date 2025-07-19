/**
 * API Endpoint: Delete Calendar Event
 * DELETE /api/calendar/events/[id]/delete
 * Uses GoogleCalendarService to delete events (same as CLI test)
 */

import type { APIRoute } from 'astro';
import { GoogleCalendarService } from '../../../../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../../../../infrastructure/config.js';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
  try {
    console.log('🗑️ API: Delete calendar event request received');
    
    const eventId = params.id;
    
    if (!eventId) {
      return new Response(JSON.stringify({
        error: 'Missing event ID in URL path'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load configuration and initialize Google Calendar service
    const config = loadConfig();
    const calendarService = new GoogleCalendarService(config);

    // First, try to get the event to verify it exists (same pattern as CLI test)
    try {
      const event = await calendarService.getEvent(eventId);
      console.log(`📅 API: Found event to delete: ${event.summary}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return new Response(JSON.stringify({
          error: 'Event not found',
          eventId
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error; // Re-throw if it's not a 404
    }

    // Delete the event using GoogleCalendarService (exact same method as CLI test)
    await calendarService.deleteEvent(eventId);
    
    // Verify deletion by trying to retrieve the event (same verification as CLI test)
    try {
      await calendarService.getEvent(eventId);
      // If we get here, deletion failed
      throw new Error('Event still exists after deletion');
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        // This is expected - event was successfully deleted
        console.log(`✅ API: Calendar event deleted successfully (ID: ${eventId})`);
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Calendar event deleted successfully',
      eventId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ API: Error deleting calendar event:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to delete calendar event',
      details: error instanceof Error ? error.message : 'Unknown error',
      eventId: params.id
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 