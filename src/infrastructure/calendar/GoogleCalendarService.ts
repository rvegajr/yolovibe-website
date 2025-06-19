/**
 * Google Calendar Service
 * Handles all interactions with the Google Calendar API
 */

import { google, calendar_v3 } from 'googleapis';
import type { AppConfig } from '../config.js';

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  constructor(private config: AppConfig) {
    this.calendarId = config.google.calendarId;
    
    // Initialize with Application Default Credentials if available
    // Falls back to service account key file if specified
    let auth;
    
    if (config.google.useApplicationDefaultCredentials) {
      // Use Application Default Credentials (from gcloud auth application-default login)
      auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    } else if (config.google.serviceAccountKeyPath) {
      // Use service account key file if specified
      auth = new google.auth.GoogleAuth({
        keyFile: config.google.serviceAccountKeyPath,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    } else {
      // Use OAuth2 client credentials as fallback
      const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret
      );
      
      // Set credentials if refresh token is available
      if (config.google.refreshToken) {
        oauth2Client.setCredentials({
          refresh_token: config.google.refreshToken
        });
      }
      
      auth = oauth2Client;
    }
    
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Validates the connection to Google Calendar
   * @returns Promise that resolves when connection is valid
   * @throws Error if connection fails
   */
  async validateConnection(): Promise<void> {
    try {
      const response = await this.calendar.calendars.get({
        calendarId: this.calendarId,
      });
      
      if (!response.data) {
        throw new Error('Calendar not accessible');
      }
      
      // Connection is valid
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Google Calendar validation failed: ${error.message}`);
      }
      throw new Error(`Google Calendar validation failed: ${String(error)}`);
    }
  }

  /**
   * Lists upcoming events on the calendar
   * @param maxResults Maximum number of events to return
   * @returns List of calendar events
   */
  async listUpcomingEvents(maxResults = 10): Promise<calendar_v3.Schema$Event[]> {
    const now = new Date();
    
    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: now.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  }

  /**
   * Creates a new event on the calendar
   * @param event Event details
   * @returns Created event
   */
  async createEvent(event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    const response = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: event,
    });
    
    return response.data;
  }
}
