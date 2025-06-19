/**
 * Application Health Checker
 * Validates all external service connections on startup
 */

import { google } from 'googleapis';
import sgMail from '@sendgrid/mail';
import type { AppConfig } from '../config.js';
import { SquareService } from '../payment/SquareService.js';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime: number;
  details?: Record<string, unknown>;
}

export interface HealthCheckSummary {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  timestamp: string;
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
}

export class HealthChecker {
  constructor(
    private config: AppConfig,
    private squareService: SquareService
  ) {}

  async checkAllServices(): Promise<HealthCheckResult[]> {
    const checks = [
      this.checkAuth0(),
      this.checkSendGrid(),
      this.checkSquare(),
      this.checkGoogleCalendar(),
    ];

    return Promise.all(checks);
  }

  private async checkAuth0(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Use Auth0's tenant info endpoint which is more likely to be accessible
      // This URL pattern works for both standard and custom domains
      const response = await fetch(
        `https://${this.config.auth0.domain}/api/v2/tenants/settings`,
        { 
          signal: AbortSignal.timeout(5000),
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      // For the health check, we don't actually need to authenticate
      // We just want to confirm the domain exists and is accessible
      // A 401 means the domain is valid but we're not authenticated
      // A 404 means the domain is invalid
      if (response.status === 404) {
        throw new Error(`Auth0 domain not found (HTTP 404)`);
      }
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'Auth0',
        status: 'healthy',
        message: 'Auth0 domain accessible',
        responseTime,
        details: { domain: this.config.auth0.domain },
      };
    } catch (error) {
      return {
        service: 'Auth0',
        status: 'unhealthy',
        message: `Auth0 connection failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkSendGrid(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      sgMail.setApiKey(this.config.sendgrid.apiKey);

      const response = await fetch('https://api.sendgrid.com/v3/user/account', {
        headers: {
          Authorization: `Bearer ${this.config.sendgrid.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const account = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        service: 'SendGrid',
        status: 'healthy',
        message: 'SendGrid API accessible',
        responseTime,
        details: { account_type: account.type },
      };
    } catch (error) {
      return {
        service: 'SendGrid',
        status: 'unhealthy',
        message: `SendGrid connection failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkSquare(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // First try to validate the connection directly
      const validationResult = await this.squareService.validateConnection();
      
      if (!validationResult.valid) {
        throw new Error(validationResult.error || 'Connection validation failed');
      }
      
      const location = validationResult.location;
      const responseTime = Date.now() - startTime;

      return {
        service: 'Square',
        status: 'healthy',
        message: 'Square API accessible',
        responseTime,
        details: {
          locationName: location?.name,
          locationId: location?.id,
          environment: this.config.square.environment,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        service: 'Square',
        status: 'unhealthy',
        message: `Square connection failed: ${errorMessage}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkGoogleCalendar(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Check if we should skip Google Calendar validation
      const skipCheck = (this.config.google.skipCheck === true);
      if (skipCheck) {
        return {
          service: 'Google Calendar',
          status: 'healthy',
          message: 'Google Calendar check skipped (development mode)',
          responseTime: 0,
          details: { skipped: true },
        };
      }

      // Initialize auth based on configuration
      let auth;
      
      if (this.config.google.useApplicationDefaultCredentials) {
        // Use Application Default Credentials
        auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });
      } else if (this.config.google.serviceAccountKeyPath) {
        // Use service account key file
        auth = new google.auth.GoogleAuth({
          keyFile: this.config.google.serviceAccountKeyPath,
          scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });
      } else {
        throw new Error('No Google authentication method configured');
      }

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.calendars.get({
        calendarId: this.config.google.calendarId,
      });

      if (!response.data) {
        throw new Error('Calendar not accessible');
      }

      const responseTime = Date.now() - startTime;

      return {
        service: 'Google Calendar',
        status: 'healthy',
        message: 'Google Calendar API accessible',
        responseTime,
        details: {
          calendarName: response.data.summary,
          timezone: response.data.timeZone,
          authMethod: this.config.google.useApplicationDefaultCredentials ? 'ADC' : 'ServiceAccount',
        },
      };
    } catch (error) {
      return {
        service: 'Google Calendar',
        status: 'unhealthy',
        message: `Google Calendar connection failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validates that all critical services are healthy
   * Throws an error if any critical service is down
   */
  async validateCriticalServices(): Promise<void> {
    const results = await this.checkAllServices();
    const unhealthyServices = results.filter(r => r.status === 'unhealthy');

    if (unhealthyServices.length > 0) {
      const serviceNames = unhealthyServices.map(s => s.service).join(', ');
      throw new Error(
        `Critical services are unhealthy: ${serviceNames}. ` + `Application cannot start safely.`
      );
    }

    console.log('✅ All external services are healthy and ready');
    results.forEach(result => {
      console.log(`   ${result.service}: ${result.message} (${result.responseTime}ms)`);
    });
  }

  /**
   * Returns a health check endpoint response
   * Useful for load balancers and monitoring systems
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: HealthCheckResult[];
  }> {
    const results = await this.checkAllServices();
    const allHealthy = results.every(r => r.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: results,
    };
  }
}
