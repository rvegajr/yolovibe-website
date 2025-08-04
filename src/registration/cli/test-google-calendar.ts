#!/usr/bin/env node
/**
 * Google Calendar Test Script
 * Tests creating calendar entries directly with GoogleCalendarService
 * 
 * Usage: tsx test-google-calendar.ts
 */

import { GoogleCalendarService } from '../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../infrastructure/config.js';

async function testGoogleCalendar() {
  console.log('🗓️ Testing Google Calendar Integration...\n');
  
  try {
    // Load configuration
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    console.log(`   Calendar ID: ${config.google.calendarId}`);
    console.log(`   Auth method: ${config.google.useApplicationDefaultCredentials ? 'Application Default Credentials' : 'OAuth/Service Account'}`);
    console.log();

    // Initialize Google Calendar service
    console.log('🔧 Initializing Google Calendar service...');
    const calendarService = new GoogleCalendarService(config);
    console.log('✅ Google Calendar service initialized');
    console.log();

    // Test 1: Create a simple test event
    console.log('📅 Test 1: Creating a test calendar event...');
    const testEvent = {
      summary: 'YOLOVibe Test Event - AI Consulting',
      description: 'This is a test event created by the YOLOVibe AI Consulting system to verify Google Calendar integration is working.',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow at this time
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
        timeZone: 'America/New_York'
      },
      location: 'Virtual - Zoom Meeting',
      colorId: '2', // Green color
      attendees: [
        {
          email: 'test@example.com',
          displayName: 'Test Client'
        }
      ]
    };

    const createdEvent = await calendarService.createEvent(testEvent);
    console.log('✅ Test event created successfully!');
    console.log(`   Event ID: ${createdEvent.id}`);
    console.log(`   Event Link: ${createdEvent.htmlLink}`);
    console.log(`   Summary: ${createdEvent.summary}`);
    console.log(`   Start: ${createdEvent.start?.dateTime || createdEvent.start?.date}`);
    console.log(`   End: ${createdEvent.end?.dateTime || createdEvent.end?.date}`);
    console.log();

    // Test 2: Create a consulting session event
    console.log('📅 Test 2: Creating an AI consulting session event...');
    const consultingEvent = {
      summary: 'AI Business Development Session - John Entrepreneur',
      description: `AI Business Development Consulting Session

Client: John Entrepreneur
Duration: 2 hours
Rate: $200/hour
Total: $400

Session Focus:
• AI-powered business development strategies
• Idea validation and implementation planning
• Technology recommendations
• Actionable next steps

Zoom Link: https://zoom.us/j/123456789
Meeting ID: 123-456-789

Questions? Reply to this email or call support.`,
      start: {
        dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
        timeZone: 'America/New_York'
      },
      location: 'Virtual - Zoom Meeting',
      colorId: '11', // Red color for consulting
      attendees: [
        {
          email: 'john@startup.com',
          displayName: 'John Entrepreneur'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'email', minutes: 60 },      // 1 hour before
          { method: 'popup', minutes: 15 }       // 15 minutes before
        ]
      }
    };

    const consultingCreated = await calendarService.createEvent(consultingEvent);
    console.log('✅ Consulting session event created successfully!');
    console.log(`   Event ID: ${consultingCreated.id}`);
    console.log(`   Event Link: ${consultingCreated.htmlLink}`);
    console.log(`   Client: John Entrepreneur`);
    console.log(`   Duration: 2 hours ($400)`);
    console.log();

    // Test 3: Create a blocked date event
    console.log('📅 Test 3: Creating a blocked date event...');
    const blockedEvent = {
      summary: 'BLOCKED: Personal Day',
      description: 'Admin blocked this date - no bookings allowed.\nReason: Personal Day\nCreated by: Admin',
      start: {
        date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
      },
      end: {
        date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0] // Same day (all-day event)
      },
      colorId: '11', // Red color for blocked events
      transparency: 'opaque' // Show as busy
    };

    const blockedCreated = await calendarService.createEvent(blockedEvent);
    console.log('✅ Blocked date event created successfully!');
    console.log(`   Event ID: ${blockedCreated.id}`);
    console.log(`   Date: ${blockedCreated.start?.date}`);
    console.log(`   Reason: Personal Day`);
    console.log();

    // Summary
    console.log('🎉 Google Calendar Integration Test Results:');
    console.log('========================================');
    console.log('✅ Google Calendar service initialized successfully');
    console.log('✅ Test event created and scheduled');
    console.log('✅ AI consulting session created with details');
    console.log('✅ Admin blocked date created');
    console.log();
    console.log('🎯 Next Steps:');
    console.log('1. Check your Google Calendar to see the created events');
    console.log('2. The calendar integration is working perfectly!');
    console.log('3. Your AI consulting booking system is ready to go live');
    console.log();
    console.log('📅 Calendar Link: https://calendar.google.com');

  } catch (error) {
    console.error('❌ Google Calendar test failed:');
    console.error(error);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your Google Calendar ID in .env file');
    console.log('2. Verify authentication (try: gcloud auth application-default login)');
    console.log('3. Ensure calendar permissions are set correctly');
    console.log('4. Check if SKIP_GOOGLE_CALENDAR_CHECK=false in .env');
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGoogleCalendar().catch(console.error);
}

export { testGoogleCalendar }; 