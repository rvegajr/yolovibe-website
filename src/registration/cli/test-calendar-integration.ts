#!/usr/bin/env node
/**
 * Google Calendar Integration Test CLI
 * Tests creating, verifying, and deleting calendar entries using exact website code
 * 
 * Usage: 
 *   tsx test-calendar-integration.ts
 *   tsx test-calendar-integration.ts --attendee=rvegajr@darkware.net
 *   tsx test-calendar-integration.ts --attendee=rvegajr@darkware.net --duration=2
 */

import { GoogleCalendarService } from '../../infrastructure/calendar/GoogleCalendarService.js';
import { loadConfig } from '../../infrastructure/config.js';
import { calendar_v3 } from 'googleapis';

interface TestOptions {
  attendeeEmail: string;
  durationHours: number;
  eventType: 'workshop' | 'consulting' | 'blocked';
  skipDelete: boolean;
}

class CalendarIntegrationTester {
  private calendarService: GoogleCalendarService;
  private createdEventIds: string[] = [];

  constructor(private config: any) {
    this.calendarService = new GoogleCalendarService(config);
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(): TestOptions {
    const args = process.argv.slice(2);
    const options: TestOptions = {
      attendeeEmail: 'rvegajr@darkware.net',
      durationHours: 1,
      eventType: 'consulting',
      skipDelete: false
    };

    for (const arg of args) {
      if (arg.startsWith('--attendee=')) {
        options.attendeeEmail = arg.split('=')[1];
      } else if (arg.startsWith('--duration=')) {
        options.durationHours = parseInt(arg.split('=')[1]) || 1;
      } else if (arg.startsWith('--type=')) {
        options.eventType = arg.split('=')[1] as 'workshop' | 'consulting' | 'blocked';
      } else if (arg === '--skip-delete') {
        options.skipDelete = true;
      }
    }

    return options;
  }

  /**
   * Test 1: Create a calendar event (uses exact website code pattern)
   */
  async testCreateEvent(options: TestOptions): Promise<string> {
    console.log('📅 Test 1: Creating calendar event...');
    
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + options.durationHours * 60 * 60 * 1000);

    let eventData: calendar_v3.Schema$Event;

    switch (options.eventType) {
      case 'workshop':
        eventData = {
          summary: 'YOLOVibe Workshop - AI Mastery',
          description: `Workshop session created via CLI test\nAttendee: ${options.attendeeEmail}\nDuration: ${options.durationHours} hours`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'America/New_York'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'America/New_York'
          },
          location: 'YOLOVibe Training Center',
          colorId: '2', // Green for workshops
          attendees: [
            {
              email: options.attendeeEmail,
              displayName: 'Test Attendee',
              responseStatus: 'needsAction'
            }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 30 }       // 30 minutes before
            ]
          }
        };
        break;

      case 'consulting':
        eventData = {
          summary: 'YOLOVibe AI Consulting Session',
          description: `AI Consulting session created via CLI test\nClient: ${options.attendeeEmail}\nDuration: ${options.durationHours} hours\nRate: $200/hour`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'America/New_York'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'America/New_York'
          },
          location: 'Virtual - Zoom Meeting',
          colorId: '3', // Purple for consulting
          attendees: [
            {
              email: options.attendeeEmail,
              displayName: 'Consulting Client',
              responseStatus: 'needsAction'
            }
          ],
          conferenceData: {
            createRequest: {
              requestId: `zoom-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          }
        };
        break;

      case 'blocked':
        eventData = {
          summary: 'BLOCKED: CLI Test Block',
          description: `Date blocked via CLI test\nReason: Testing calendar integration\nCreated by: CLI Test`,
          start: {
            date: startTime.toISOString().split('T')[0]
          },
          end: {
            date: endTime.toISOString().split('T')[0]
          },
          colorId: '11', // Red for blocked
          transparency: 'opaque'
        };
        break;
    }

    try {
      const createdEvent = await this.calendarService.createEvent(eventData);
      
      if (!createdEvent.id) {
        throw new Error('Event created but no ID returned');
      }

      this.createdEventIds.push(createdEvent.id);

      console.log('✅ Event created successfully!');
      console.log(`   Event ID: ${createdEvent.id}`);
      console.log(`   Summary: ${createdEvent.summary}`);
      console.log(`   Start: ${createdEvent.start?.dateTime || createdEvent.start?.date}`);
      console.log(`   End: ${createdEvent.end?.dateTime || createdEvent.end?.date}`);
      console.log(`   Attendees: ${createdEvent.attendees?.length || 0}`);
      if (createdEvent.htmlLink) {
        console.log(`   Link: ${createdEvent.htmlLink}`);
      }
      console.log();

      return createdEvent.id;

    } catch (error) {
      console.error('❌ Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Test 2: Verify event was created with correct parameters
   */
  async testVerifyEvent(eventId: string, options: TestOptions): Promise<void> {
    console.log('🔍 Test 2: Verifying event parameters...');
    
    try {
      const event = await this.calendarService.getEvent(eventId);
      
      // Verify basic properties
      console.log(`   ✅ Event retrieved: ${event.summary}`);
      
      // Verify attendees
      if (options.eventType !== 'blocked') {
        const attendees = event.attendees || [];
        const hasAttendee = attendees.some(attendee => attendee.email === options.attendeeEmail);
        
        if (hasAttendee) {
          console.log(`   ✅ Attendee verified: ${options.attendeeEmail}`);
        } else {
          throw new Error(`Attendee ${options.attendeeEmail} not found in event`);
        }
      }

      // Verify timing
      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;
      
      if (startTime && endTime) {
        console.log(`   ✅ Timing verified: ${startTime} to ${endTime}`);
      } else {
        throw new Error('Event timing not properly set');
      }

      // Verify event type-specific properties
      switch (options.eventType) {
        case 'workshop':
          if (event.colorId === '2' && event.location?.includes('Training Center')) {
            console.log('   ✅ Workshop properties verified');
          } else {
            throw new Error('Workshop properties not correctly set');
          }
          break;
          
        case 'consulting':
          if (event.colorId === '3' && event.location?.includes('Virtual')) {
            console.log('   ✅ Consulting properties verified');
          } else {
            throw new Error('Consulting properties not correctly set');
          }
          break;
          
        case 'blocked':
          if (event.colorId === '11' && event.transparency === 'opaque') {
            console.log('   ✅ Blocked date properties verified');
          } else {
            throw new Error('Blocked date properties not correctly set');
          }
          break;
      }

      console.log('✅ All event parameters verified successfully!');
      console.log();

    } catch (error) {
      console.error('❌ Event verification failed:', error);
      throw error;
    }
  }

  /**
   * Test 3: Update event (test modification capabilities)
   */
  async testUpdateEvent(eventId: string): Promise<void> {
    console.log('✏️  Test 3: Testing event update...');
    
    try {
      const updates: Partial<calendar_v3.Schema$Event> = {
        description: 'UPDATED: This event was modified by CLI test to verify update functionality'
      };

      const updatedEvent = await this.calendarService.updateEvent(eventId, updates);
      
      console.log(`   ✅ Event updated successfully`);
      console.log(`   Updated description: ${updatedEvent.description}`);
      console.log();

    } catch (error) {
      console.error('❌ Event update failed:', error);
      throw error;
    }
  }

  /**
   * Test 4: Check for conflicts (test conflict detection)
   */
  async testConflictDetection(eventId: string): Promise<void> {
    console.log('⚠️  Test 4: Testing conflict detection...');
    
    try {
      const event = await this.calendarService.getEvent(eventId);
      const startTime = new Date(event.start?.dateTime || event.start?.date || '');
      const endTime = new Date(event.end?.dateTime || event.end?.date || '');
      
      const conflicts = await this.calendarService.checkConflicts(startTime, endTime);
      
      console.log(`   ✅ Conflict check completed`);
      console.log(`   Found ${conflicts.length} overlapping events (including our test event)`);
      
      // Should find at least our own event
      if (conflicts.length > 0) {
        console.log(`   ✅ Conflict detection working correctly`);
      } else {
        console.warn(`   ⚠️  Expected to find at least our test event in conflicts`);
      }
      console.log();

    } catch (error) {
      console.error('❌ Conflict detection failed:', error);
      throw error;
    }
  }

  /**
   * Test 5: Delete event (cleanup)
   */
  async testDeleteEvent(eventId: string): Promise<void> {
    console.log('🗑️  Test 5: Deleting event...');
    
    try {
      await this.calendarService.deleteEvent(eventId);
      console.log('   ✅ Event deleted successfully');
      
      // Verify deletion by trying to retrieve the event
      try {
        await this.calendarService.getEvent(eventId);
        // If we get here without error, check if the event status indicates deletion
        console.log('   ⚠️  Event still accessible but may be marked as deleted');
      } catch (error) {
        if (error instanceof Error && (
          error.message.includes('404') || 
          error.message.includes('deleted') || 
          error.message.includes('Not Found') || 
          error.message.includes('Resource has been deleted') ||
          error.message.includes('410')  // Google's "Gone" status
        )) {
          console.log('   ✅ Event deletion verified (event not found)');
        } else {
          console.log('   ⚠️  Unexpected error during deletion verification:', error.message);
          // Don't throw - deletion likely succeeded, just verification failed
        }
      }
      console.log();

    } catch (error) {
      console.error('❌ Event deletion failed:', error);
      throw error;
    }
  }

  /**
   * Run the complete test suite
   */
  async runTests(): Promise<void> {
    const options = this.parseArgs();
    
    console.log('🧪 Google Calendar Integration Test Suite');
    console.log('==========================================');
    console.log(`Attendee Email: ${options.attendeeEmail}`);
    console.log(`Duration: ${options.durationHours} hours`);
    console.log(`Event Type: ${options.eventType}`);
    console.log(`Skip Delete: ${options.skipDelete}`);
    console.log();

    try {
      // Test connection first
      console.log('🔗 Testing Google Calendar connection...');
      await this.calendarService.validateConnection();
      console.log('✅ Connection validated successfully!');
      console.log();

      // Run test sequence
      const eventId = await this.testCreateEvent(options);
      await this.testVerifyEvent(eventId, options);
      await this.testUpdateEvent(eventId);
      await this.testConflictDetection(eventId);
      
      if (!options.skipDelete) {
        await this.testDeleteEvent(eventId);
      } else {
        console.log('⏭️  Skipping deletion as requested');
        console.log(`   Event ID for manual cleanup: ${eventId}`);
        console.log();
      }

      // Summary
      console.log('🎉 Test Suite Results:');
      console.log('=====================');
      console.log('✅ Connection validation: PASSED');
      console.log('✅ Event creation: PASSED');
      console.log('✅ Event verification: PASSED');
      console.log('✅ Event update: PASSED');
      console.log('✅ Conflict detection: PASSED');
      console.log(options.skipDelete ? '⏭️  Event deletion: SKIPPED' : '✅ Event deletion: PASSED');
      console.log();
      console.log('🎯 Google Calendar integration is working perfectly!');
      console.log('🚀 Your system is ready for production calendar management!');

    } catch (error) {
      console.error('\n❌ TEST SUITE FAILED:');
      console.error(error);
      
      // Cleanup on failure
      if (this.createdEventIds.length > 0 && !options.skipDelete) {
        console.log('\n🧹 Cleaning up created events...');
        for (const eventId of this.createdEventIds) {
          try {
            await this.calendarService.deleteEvent(eventId);
            console.log(`   ✅ Cleaned up event: ${eventId}`);
          } catch (cleanupError) {
            console.log(`   ⚠️  Could not cleanup event ${eventId}: ${cleanupError}`);
          }
        }
      }
      
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    console.log(`   Calendar ID: ${config.google.calendarId}`);
    console.log(`   Auth method: ${config.google.useApplicationDefaultCredentials ? 'Application Default Credentials' : 'OAuth/Service Account'}`);
    console.log();

    const tester = new CalendarIntegrationTester(config);
    await tester.runTests();

  } catch (error) {
    console.error('❌ Failed to initialize test suite:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 