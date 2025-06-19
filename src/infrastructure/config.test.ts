import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from './config.js';

describe('Configuration Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should load valid configuration successfully', () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_CLIENT_ID = 'test_client_id';
    process.env.AUTH0_CLIENT_SECRET = 'test_client_secret';
    process.env.SENDGRID_API_KEY = 'SG.test_key';
    process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
    process.env.SQUARE_ACCESS_TOKEN = 'test_square_token';
    process.env.SQUARE_LOCATION_ID = 'test_location_id';
    process.env.SQUARE_ENVIRONMENT = 'sandbox';
    process.env.GOOGLE_CALENDAR_ID = 'test@calendar.google.com';

    // Act & Assert
    expect(() => loadConfig()).not.toThrow();

    const config = loadConfig();
    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe(3000);
    expect(config.auth0.domain).toBe('test.auth0.com');
    expect(config.sendgrid.fromEmail).toBe('test@example.com');
  });

  it('should throw error for missing required environment variables', () => {
    // Arrange
    process.env = {}; // Clear all environment variables

    // Act & Assert
    expect(() => loadConfig()).toThrow('Missing required environment variables');
  });

  it('should validate email format', () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_CLIENT_ID = 'test_client_id';
    process.env.AUTH0_CLIENT_SECRET = 'test_client_secret';
    process.env.SENDGRID_API_KEY = 'SG.test_key';
    process.env.SENDGRID_FROM_EMAIL = 'invalid-email'; // Invalid email
    process.env.SQUARE_ACCESS_TOKEN = 'test_square_token';
    process.env.SQUARE_LOCATION_ID = 'test_location_id';
    process.env.SQUARE_ENVIRONMENT = 'sandbox';
    process.env.GOOGLE_CALENDAR_ID = 'test@calendar.google.com';

    // Act & Assert
    expect(() => loadConfig()).toThrow('Invalid email format');
  });

  it('should set correct environment flags', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_CLIENT_ID = 'test_client_id';
    process.env.AUTH0_CLIENT_SECRET = 'test_client_secret';
    process.env.SENDGRID_API_KEY = 'SG.test_key';
    process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
    process.env.SQUARE_ACCESS_TOKEN = 'test_square_token';
    process.env.SQUARE_LOCATION_ID = 'test_location_id';
    process.env.SQUARE_ENVIRONMENT = 'sandbox';
    process.env.GOOGLE_CALENDAR_ID = 'test@calendar.google.com';

    // Act
    const config = loadConfig();

    // Assert
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
  });
});
