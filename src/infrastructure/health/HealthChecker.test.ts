/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthChecker } from './HealthChecker';
import type { AppConfig } from '../config';
import { SquareService } from '../payment/SquareService';

// Mock external dependencies
vi.mock('googleapis');
vi.mock('@sendgrid/mail');
vi.mock('../payment/SquareService');

// Mock fetch globally
global.fetch = vi.fn();

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;
  let mockConfig: AppConfig;
  let mockSquareService: SquareService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
        // Auth0 removed - using custom authentication
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
      },
      sendgrid: {
        apiKey: 'SG.test_key',
        fromEmail: 'test@example.com',
      },
      square: {
        accessToken: 'test_square_token',
        locationId: 'test_location_id',
        environment: 'sandbox',
      },
      google: {
        calendarId: 'test-calendar',
        serviceAccountKeyPath: './test-key.json',
        useApplicationDefaultCredentials: false,
      },
      app: {
        nodeEnv: 'test',
        port: 3000,
      },
    };

    // Create mock SquareService
    mockSquareService = {
      getLocation: vi.fn().mockResolvedValue({
        id: 'test_location_id',
        name: 'Test Location',
      }),
    } as any;

    healthChecker = new HealthChecker(mockConfig, mockSquareService);
  });

  describe('checkAllServices', () => {
    it('should check all services and return results', async () => {
      // Arrange
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ issuer: 'auth0' }) } as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ type: 'free' }) } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ location: { name: 'Test' } }),
        } as any);

      // Act
      const results = await healthChecker.checkAllServices();

      // Assert
      expect(results).toHaveLength(3); // SendGrid, Square, Google Calendar (Auth0 removed)
      expect(results.every(r => r.service)).toBe(true);
      expect(results.every(r => r.status)).toBe(true);
    });
  });

  describe('validateCriticalServices', () => {
    it('should not throw when all services are healthy', async () => {
      // Arrange
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ issuer: 'auth0' }) } as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ type: 'free' }) } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ location: { name: 'Test' } }),
        } as any);

      // Act & Assert
      await expect(healthChecker.validateCriticalServices()).resolves.not.toThrow();
    });

    it('should throw when critical services are unhealthy', async () => {
      // Arrange
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false, status: 404 } as any)
        .mockResolvedValueOnce({ ok: false, status: 401 } as any)
        .mockResolvedValueOnce({ ok: false, status: 403 } as any);

      // Act & Assert
      await expect(healthChecker.validateCriticalServices()).rejects.toThrow(
        'Critical services are unhealthy'
      );
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status with all service results', async () => {
      // Arrange
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ issuer: 'auth0' }) } as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ type: 'free' }) } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ location: { name: 'Test' } }),
        } as any);

      // Act
      const status = await healthChecker.getHealthStatus();

      // Assert
      expect(status.status).toBe('healthy');
      expect(status.services).toHaveLength(4);
      expect(status.timestamp).toBeDefined();
    });
  });
});
