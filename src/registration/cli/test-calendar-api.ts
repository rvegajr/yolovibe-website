#!/usr/bin/env node
/**
 * Calendar API Test Script
 * Tests the calendar API endpoints using the same code as the website
 * 
 * Usage: tsx test-calendar-api.ts --attendee=rvegajr@darkware.net
 */

interface TestOptions {
  attendeeEmail: string;
  baseUrl: string;
  skipDelete: boolean;
}

class CalendarApiTester {
  private createdEventIds: string[] = [];

  constructor(private options: TestOptions) {}

  /**
   * Parse command line arguments
   */
  public static parseArgs(): TestOptions {
    const args = process.argv.slice(2);
    const options: TestOptions = {
      attendeeEmail: 'rvegajr@darkware.net',
      baseUrl: 'http://localhost:4321',
      skipDelete: false
    };

    for (const arg of args) {
      if (arg.startsWith('--attendee=')) {
        options.attendeeEmail = arg.split('=')[1];
      } else if (arg.startsWith('--base-url=')) {
        options.baseUrl = arg.split('=')[1];
      } else if (arg === '--skip-delete') {
        options.skipDelete = true;
      }
    }

    return options;
  }

  /**
   * Test 1: Create event via API
   */
  async testCreateEvent(): Promise<string> {
    console.log('📅 Test 1: Creating event via API...');
    
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    const requestBody = {
      summary: 'API Test - YOLOVibe Consulting Session',
      description: `API test event created via REST API\nClient: ${this.options.attendeeEmail}\nDuration: 2 hours`,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      location: 'Virtual - API Test',
      attendeeEmails: [this.options.attendeeEmail],
      eventType: 'consulting'
    };

    try {
      const response = await fetch(`${this.options.baseUrl}/api/calendar/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.event.id) {
        throw new Error('Event created but no ID returned');
      }

      this.createdEventIds.push(result.event.id);

      console.log('✅ Event created successfully via API!');
      console.log(`   Event ID: ${result.event.id}`);
      console.log(`   Summary: ${result.event.summary}`);
      console.log(`   Start: ${result.event.start.dateTime}`);
      console.log(`   End: ${result.event.end.dateTime}`);
      console.log(`   Attendees: ${result.event.attendees.length}`);
      console.log(`   Link: ${result.event.htmlLink}`);
      console.log();

      return result.event.id;

    } catch (error) {
      console.error('❌ Failed to create event via API:', error);
      throw error;
    }
  }

  /**
   * Test 2: Get event via API
   */
  async testGetEvent(eventId: string): Promise<void> {
    console.log('🔍 Test 2: Getting event via API...');
    
    try {
      const response = await fetch(`${this.options.baseUrl}/api/calendar/events/${eventId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error}`);
      }

      const result = await response.json();
      
      console.log('✅ Event retrieved successfully via API!');
      console.log(`   Event ID: ${result.event.id}`);
      console.log(`   Summary: ${result.event.summary}`);
      console.log(`   Attendees: ${result.event.attendees.length}`);
      
      // Verify attendee
      const hasAttendee = result.event.attendees.some((a: any) => a.email === this.options.attendeeEmail);
      if (hasAttendee) {
        console.log(`   ✅ Attendee verified: ${this.options.attendeeEmail}`);
      } else {
        throw new Error(`Attendee ${this.options.attendeeEmail} not found in event`);
      }
      console.log();

    } catch (error) {
      console.error('❌ Failed to get event via API:', error);
      throw error;
    }
  }

  /**
   * Test 3: Update event via API
   */
  async testUpdateEvent(eventId: string): Promise<void> {
    console.log('✏️  Test 3: Updating event via API...');
    
    const updateBody = {
      description: 'UPDATED via API: This event was modified by API test to verify update functionality'
    };

    try {
      const response = await fetch(`${this.options.baseUrl}/api/calendar/events/${eventId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error}`);
      }

      const result = await response.json();
      
      console.log('✅ Event updated successfully via API!');
      console.log(`   Updated description: ${result.event.description}`);
      console.log();

    } catch (error) {
      console.error('❌ Failed to update event via API:', error);
      throw error;
    }
  }

  /**
   * Test 4: Delete event via API
   */
  async testDeleteEvent(eventId: string): Promise<void> {
    console.log('🗑️  Test 4: Deleting event via API...');
    
    try {
      const response = await fetch(`${this.options.baseUrl}/api/calendar/events/${eventId}/delete`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error}`);
      }

      const result = await response.json();
      
      console.log('✅ Event deleted successfully via API!');
      console.log(`   Message: ${result.message}`);
      console.log();

    } catch (error) {
      console.error('❌ Failed to delete event via API:', error);
      throw error;
    }
  }

  /**
   * Run the complete API test suite
   */
  async runTests(): Promise<void> {
    console.log('🧪 Calendar API Test Suite');
    console.log('==========================');
    console.log(`Attendee Email: ${this.options.attendeeEmail}`);
    console.log(`Base URL: ${this.options.baseUrl}`);
    console.log(`Skip Delete: ${this.options.skipDelete}`);
    console.log();

    try {
      // Test the API endpoints
      const eventId = await this.testCreateEvent();
      await this.testGetEvent(eventId);
      await this.testUpdateEvent(eventId);
      
      if (!this.options.skipDelete) {
        await this.testDeleteEvent(eventId);
      } else {
        console.log('⏭️  Skipping deletion as requested');
        console.log(`   Event ID for manual cleanup: ${eventId}`);
        console.log();
      }

      // Summary
      console.log('🎉 API Test Suite Results:');
      console.log('==========================');
      console.log('✅ Event creation via API: PASSED');
      console.log('✅ Event retrieval via API: PASSED');
      console.log('✅ Event update via API: PASSED');
      console.log(this.options.skipDelete ? '⏭️  Event deletion via API: SKIPPED' : '✅ Event deletion via API: PASSED');
      console.log();
      console.log('🎯 Calendar API integration is working perfectly!');
      console.log('🚀 Your API endpoints are ready for production use!');

    } catch (error) {
      console.error('\n❌ API TEST SUITE FAILED:');
      console.error(error);
      
      // Cleanup on failure (if API supports it)
      if (this.createdEventIds.length > 0 && !this.options.skipDelete) {
        console.log('\n🧹 Attempting to clean up created events via API...');
        for (const eventId of this.createdEventIds) {
          try {
            await this.testDeleteEvent(eventId);
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
    const options = CalendarApiTester.parseArgs();
    const tester = new CalendarApiTester(options);
    await tester.runTests();

  } catch (error) {
    console.error('❌ Failed to initialize API test suite:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 