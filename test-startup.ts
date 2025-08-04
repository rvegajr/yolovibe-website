#!/usr/bin/env node

/**
 * Test Application Startup
 * Demonstrates the health check and configuration system
 */

import { startupApplication } from './src/app/startup';

async function main() {
  try {
    // This will:
    // 1. Load and validate all environment variables
    // 2. Test connections to Auth0, SendGrid, Square, and Google Calendar
    // 3. Print detailed status information
    // 4. Exit with error if any critical service is unavailable
    
    const { config, healthChecker } = await startupApplication();
    
    console.log('🎯 Startup test completed successfully!');
    console.log('Your application is ready to handle workshop registrations.');
    console.log('');
    console.log('Next steps:');
    console.log('- Start your Express server');
    console.log('- Add the health check endpoint: GET /health');
    console.log('- Begin implementing your registration workflow');
    
  } catch (error) {
    // Error handling is done in the startup module
    // This catch block should never be reached in normal operation
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the test
main();
