#!/usr/bin/env tsx
/**
 * Comprehensive Integration Test Script
 * Tests all critical services across different environments
 * 
 * Usage:
 *   npm run test:integrations              # Test current environment
 *   npm run test:integrations:dev          # Test development
 *   npm run test:integrations:preview      # Test preview  
 *   npm run test:integrations:prod         # Test production
 */

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { createClient } from '@libsql/client';

// Load environment variables
const envFile = process.env.ENV_FILE || '.env';
const envPath = resolve(process.cwd(), envFile);

if (existsSync(envPath)) {
  config({ path: envPath });
  console.log(chalk.gray(`Loaded environment from: ${envFile}`));
} else {
  console.log(chalk.yellow(`No ${envFile} file found, using existing environment variables`));
}

// Test result types
interface TestResult {
  service: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

class IntegrationTester {
  private results: TestResult[] = [];
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    console.log(chalk.blue.bold(`\n🧪 Testing ${this.environment.toUpperCase()} Environment\n`));
  }

  // Test SendGrid Email Service
  async testSendGrid(): Promise<TestResult> {
    const spinner = ora('Testing SendGrid...').start();
    const startTime = Date.now();

    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL;
      const fromName = process.env.SENDGRID_FROM_NAME;

      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY not configured');
      }

      if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL not configured');
      }

      // Test API key validity by fetching account details
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid SendGrid API key');
        }
        throw new Error(`SendGrid API error: ${response.status} ${response.statusText}`);
      }

      const profile = await response.json();
      
      spinner.succeed(chalk.green('✓ SendGrid connected successfully'));
      
      return {
        service: 'SendGrid',
        status: 'success',
        message: 'SendGrid API key is valid and working',
        details: {
          fromEmail,
          fromName: fromName || 'Not configured',
          accountEmail: profile.email,
          verified: true
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      spinner.fail(chalk.red('✗ SendGrid test failed'));
      
      return {
        service: 'SendGrid',
        status: 'failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test Square Payment Processing
  async testSquare(): Promise<TestResult> {
    const spinner = ora('Testing Square...').start();
    const startTime = Date.now();

    try {
      const accessToken = process.env.***REMOVED***;
      const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
      const locationId = process.env.SQUARE_LOCATION_ID;

      if (!accessToken) {
        throw new Error('***REMOVED*** not configured');
      }

      // Determine the correct API endpoint based on environment
      const baseUrl = environment === 'production' 
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';

      // Test by fetching merchant info
      const response = await fetch(`${baseUrl}/v2/merchants/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Square-Version': '2024-01-18',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Square access token');
        }
        const errorData = await response.json();
        throw new Error(`Square API error: ${errorData.errors?.[0]?.detail || response.statusText}`);
      }

      const data = await response.json();
      
      // Also test locations endpoint if we have a location ID
      let locationValid = false;
      if (locationId) {
        const locResponse = await fetch(`${baseUrl}/v2/locations/${locationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Square-Version': '2024-01-18'
          }
        });
        locationValid = locResponse.ok;
      }

      spinner.succeed(chalk.green('✓ Square connected successfully'));
      
      return {
        service: 'Square',
        status: 'success',
        message: `Square ${environment} environment is working`,
        details: {
          environment,
          merchantId: data.merchant?.id,
          businessName: data.merchant?.business_name,
          locationId: locationId || 'Not configured',
          locationValid
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      spinner.fail(chalk.red('✗ Square test failed'));
      
      return {
        service: 'Square',
        status: 'failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test Google Calendar
  async testGoogleCalendar(): Promise<TestResult> {
    const spinner = ora('Testing Google Calendar...').start();
    const startTime = Date.now();

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      const clientId = process.env.***REMOVED***;
      const clientSecret = process.env.***REMOVED***;
      const refreshToken = process.env.***REMOVED***;

      if (!calendarId) {
        throw new Error('GOOGLE_CALENDAR_ID not configured');
      }

      // Check which auth method is configured
      const hasOAuth = clientId && clientSecret && refreshToken;
      const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
      const hasServiceAccount = serviceAccountPath && existsSync(serviceAccountPath);

      if (!hasOAuth && !hasServiceAccount) {
        spinner.warn(chalk.yellow('⚠ Google Calendar credentials not fully configured'));
        return {
          service: 'Google Calendar',
          status: 'warning',
          message: 'Google Calendar ID configured but authentication not set up',
          details: {
            calendarId,
            authMethod: 'None configured'
          },
          duration: Date.now() - startTime
        };
      }

      // If we have OAuth credentials, try to get an access token
      if (hasOAuth) {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: refreshToken!,
            grant_type: 'refresh_token'
          })
        });

        if (tokenResponse.ok) {
          const { access_token } = await tokenResponse.json();
          
          // Test calendar access
          const calendarResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}`,
            {
              headers: {
                'Authorization': `Bearer ${access_token}`
              }
            }
          );

          if (calendarResponse.ok) {
            const calendarData = await calendarResponse.json();
            spinner.succeed(chalk.green('✓ Google Calendar connected successfully'));
            
            return {
              service: 'Google Calendar',
              status: 'success',
              message: 'Google Calendar OAuth is working',
              details: {
                calendarId,
                calendarName: calendarData.summary,
                authMethod: 'OAuth',
                timeZone: calendarData.timeZone
              },
              duration: Date.now() - startTime
            };
          }
        }
      }

      spinner.warn(chalk.yellow('⚠ Google Calendar partially configured'));
      return {
        service: 'Google Calendar',
        status: 'warning',
        message: 'Google Calendar credentials present but could not verify access',
        details: {
          calendarId,
          authMethod: hasOAuth ? 'OAuth' : 'Service Account'
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      spinner.fail(chalk.red('✗ Google Calendar test failed'));
      
      return {
        service: 'Google Calendar',
        status: 'failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test Database Connection
  async testDatabase(): Promise<TestResult> {
    const spinner = ora('Testing Database...').start();
    const startTime = Date.now();

    try {
      const databaseUrl = process.env.***REMOVED***;
      const authToken = process.env.***REMOVED***;

      if (!databaseUrl) {
        // Check for local database
        if (existsSync('local.db')) {
          spinner.succeed(chalk.green('✓ Local SQLite database found'));
          return {
            service: 'Database',
            status: 'success',
            message: 'Using local SQLite database',
            details: {
              type: 'SQLite',
              location: 'local.db'
            },
            duration: Date.now() - startTime
          };
        }
        throw new Error('No database configured');
      }

      // Test Turso connection
      const client = createClient({
        url: databaseUrl,
        authToken: authToken
      });

      const result = await client.execute('SELECT COUNT(*) as count FROM users');
      const userCount = result.rows[0]?.count || 0;

      spinner.succeed(chalk.green('✓ Database connected successfully'));
      
      return {
        service: 'Database',
        status: 'success',
        message: 'Turso database connection successful',
        details: {
          type: 'Turso',
          url: databaseUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials
          userCount
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      spinner.fail(chalk.red('✗ Database test failed'));
      
      return {
        service: 'Database',
        status: 'failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Run all tests
  async runAllTests() {
    console.log(chalk.cyan('Starting integration tests...\n'));

    // Run tests in parallel for speed
    const tests = await Promise.all([
      this.testSendGrid(),
      this.testSquare(),
      this.testGoogleCalendar(),
      this.testDatabase()
    ]);

    this.results = tests;
    this.printResults();
  }

  // Print test results
  private printResults() {
    console.log(chalk.cyan.bold('\n📊 Test Results Summary\n'));
    console.log('─'.repeat(60));

    let successCount = 0;
    let warningCount = 0;
    let failureCount = 0;

    for (const result of this.results) {
      const statusIcon = result.status === 'success' ? '✅' : 
                         result.status === 'warning' ? '⚠️' : '❌';
      const statusColor = result.status === 'success' ? chalk.green :
                          result.status === 'warning' ? chalk.yellow : chalk.red;
      
      console.log(`${statusIcon} ${chalk.bold(result.service)}`);
      console.log(`   Status: ${statusColor(result.status.toUpperCase())}`);
      console.log(`   ${result.message}`);
      
      if (result.details) {
        console.log(chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   ')}`));
      }
      
      if (result.duration) {
        console.log(chalk.gray(`   Duration: ${result.duration}ms`));
      }
      
      console.log('─'.repeat(60));

      if (result.status === 'success') successCount++;
      else if (result.status === 'warning') warningCount++;
      else failureCount++;
    }

    // Overall summary
    console.log(chalk.bold('\n📈 Overall Status:'));
    console.log(chalk.green(`   ✅ Successful: ${successCount}`));
    if (warningCount > 0) console.log(chalk.yellow(`   ⚠️  Warnings: ${warningCount}`));
    if (failureCount > 0) console.log(chalk.red(`   ❌ Failed: ${failureCount}`));

    // Environment info
    console.log(chalk.bold('\n🌍 Environment:'));
    console.log(`   NODE_ENV: ${this.environment}`);
    console.log(`   Square Mode: ${process.env.SQUARE_ENVIRONMENT || 'sandbox'}`);
    
    // Exit code based on failures
    if (failureCount > 0) {
      console.log(chalk.red.bold('\n❌ Some tests failed. Please check the configuration.'));
      process.exit(1);
    } else if (warningCount > 0) {
      console.log(chalk.yellow.bold('\n⚠️  Tests passed with warnings. Some services may need configuration.'));
    } else {
      console.log(chalk.green.bold('\n✅ All tests passed successfully!'));
    }
  }
}

// Main execution
async function main() {
  const tester = new IntegrationTester();
  await tester.runAllTests();
}

// Run if executed directly
main().catch(error => {
  console.error(chalk.red.bold('Fatal error:'), error);
  process.exit(1);
});

export { IntegrationTester, TestResult };