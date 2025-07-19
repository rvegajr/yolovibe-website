/**
 * API Endpoint: Update Calendar Event
 * PATCH /api/calendar/events/[id]/update
 * Uses GoogleCalendarService to update events (same as CLI test)
 */

import type { APIRoute } from 'astro';
import { GoogleCalendarService } from '../../../../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../../../../infrastructure/config.js';
import { calendar_v3 } from 'googleapis';

export const prerender = false;

interface UpdateEventRequest {
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  attendeeEmails?: string[];
  timeZone?: string;
}

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    console.log('✏️ API: Update calendar event request received');
    
    const eventId = params.id;
    
    if (!eventId) {
      return new Response(JSON.stringify({
        error: 'Missing event ID in URL path'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body: UpdateEventRequest = await request.json();
    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      attendeeEmails,
      timeZone = 'America/New_York'
    } = body;

    // Validate date order if both dates are provided
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      
      if (start >= end) {
        return new Response(JSON.stringify({
          error: 'Start time must be before end time'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Load configuration and initialize Google Calendar service
    const config = loadConfig();
    const calendarService = new GoogleCalendarService(config);

    // First, verify the event exists (same pattern as CLI test)
    try {
      const existingEvent = await calendarService.getEvent(eventId);
      console.log(`📅 API: Found event to update: ${existingEvent.summary}`);
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

    // Prepare updates object (same pattern as CLI test)
    const updates: Partial<calendar_v3.Schema$Event> = {};

    if (summary !== undefined) updates.summary = summary;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;

    // Handle date/time updates
    if (startDateTime) {
      updates.start = {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone
      };
    }
    
    if (endDateTime) {
      updates.end = {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone
      };
    }

    // Handle attendee updates
    if (attendeeEmails !== undefined) {
      updates.attendees = attendeeEmails.map(email => ({
        email,
        responseStatus: 'needsAction'
      }));
    }

    // Update the event using GoogleCalendarService (exact same method as CLI test)
    const updatedEvent = await calendarService.updateEvent(eventId, updates);
    
    console.log(`✅ API: Calendar event updated successfully (ID: ${eventId})`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Calendar event updated successfully',
      event: {
        id: updatedEvent.id,
        summary: updatedEvent.summary,
        description: updatedEvent.description,
        start: updatedEvent.start,
        end: updatedEvent.end,
        location: updatedEvent.location,
        attendees: updatedEvent.attendees?.map(a => ({
          email: a.email,
          displayName: a.displayName,
          responseStatus: a.responseStatus
        })) || [],
        htmlLink: updatedEvent.htmlLink
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ API: Error updating calendar event:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to update calendar event',
      details: error instanceof Error ? error.message : 'Unknown error',
      eventId: params.id
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 