/**
 * API Endpoint: Create Calendar Event
 * POST /api/calendar/events/create
 * Uses GoogleCalendarService to create events with attendee management
 */

import type { APIRoute } from 'astro';
import { GoogleCalendarService } from '../../../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../../../infrastructure/config.js';
import { calendar_v3 } from 'googleapis';

interface CreateEventRequest {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendeeEmails?: string[];
  eventType?: 'workshop' | 'consulting' | 'blocked' | 'meeting';
  timeZone?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 API: Create calendar event request received');
    
    const body: CreateEventRequest = await request.json();
    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      attendeeEmails = [],
      eventType = 'meeting',
      timeZone = 'America/New_York'
    } = body;
    
    // Validate required fields
    if (!summary || !startDateTime || !endDateTime) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: summary, startDateTime, and endDateTime'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate date order
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

    // Load configuration and initialize Google Calendar service
    const config = loadConfig();
    const calendarService = new GoogleCalendarService(config);

    // Prepare event data based on event type (same patterns as CLI test)
    const eventData: calendar_v3.Schema$Event = {
      summary,
      description,
      start: {
        dateTime: start.toISOString(),
        timeZone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone
      },
      location
    };

    // Add attendees if provided
    if (attendeeEmails.length > 0) {
      eventData.attendees = attendeeEmails.map(email => ({
        email,
        responseStatus: 'needsAction'
      }));
    }

    // Set event-specific properties (same as CLI test)
    switch (eventType) {
      case 'workshop':
        eventData.colorId = '2'; // Green
        eventData.reminders = {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }       // 30 minutes before
          ]
        };
        break;
        
      case 'consulting':
        eventData.colorId = '3'; // Purple
        eventData.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
        break;
        
      case 'blocked':
        eventData.colorId = '11'; // Red
        eventData.transparency = 'opaque';
        // For blocked events, use date instead of dateTime
        eventData.start = { date: start.toISOString().split('T')[0] };
        eventData.end = { date: end.toISOString().split('T')[0] };
        break;
        
      case 'meeting':
      default:
        eventData.colorId = '1'; // Blue
        break;
    }

    // Create the event using GoogleCalendarService
    const createdEvent = await calendarService.createEvent(eventData);
    
    console.log(`✅ API: Calendar event created successfully (ID: ${createdEvent.id})`);
    
    return new Response(JSON.stringify({
      success: true,
      event: {
        id: createdEvent.id,
        summary: createdEvent.summary,
        description: createdEvent.description,
        start: createdEvent.start,
        end: createdEvent.end,
        location: createdEvent.location,
        attendees: createdEvent.attendees?.map(a => ({
          email: a.email,
          displayName: a.displayName,
          responseStatus: a.responseStatus
        })) || [],
        htmlLink: createdEvent.htmlLink,
        eventType
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ API: Error creating calendar event:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to create calendar event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 