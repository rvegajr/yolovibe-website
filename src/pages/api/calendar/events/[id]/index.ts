/**
 * API Endpoint: Get Calendar Event
 * GET /api/calendar/events/[id]
 * Uses GoogleCalendarService to retrieve events (same as CLI test)
 */

import type { APIRoute } from 'astro';
import { GoogleCalendarService } from '../../../../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../../../../infrastructure/config.js';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    console.log('🔍 API: Get calendar event request received');
    
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

    // Get the event using GoogleCalendarService (exact same method as CLI test)
    try {
      const event = await calendarService.getEvent(eventId);
      
      console.log(`✅ API: Calendar event retrieved successfully (ID: ${eventId})`);
      
      return new Response(JSON.stringify({
        success: true,
        event: {
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          location: event.location,
          attendees: event.attendees?.map(a => ({
            email: a.email,
            displayName: a.displayName,
            responseStatus: a.responseStatus,
            organizer: a.organizer || false
          })) || [],
          htmlLink: event.htmlLink,
          colorId: event.colorId,
          transparency: event.transparency,
          status: event.status,
          created: event.created,
          updated: event.updated,
          creator: event.creator ? {
            email: event.creator.email,
            displayName: event.creator.displayName
          } : undefined,
          organizer: event.organizer ? {
            email: event.organizer.email,
            displayName: event.organizer.displayName
          } : undefined
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

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

  } catch (error) {
    console.error('❌ API: Error retrieving calendar event:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to retrieve calendar event',
      details: error instanceof Error ? error.message : 'Unknown error',
      eventId: params.id
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 