/**
 * Health Dashboard Integration
 * Provides real-time health status for admin dashboard
 */

import { HealthChecker } from './HealthChecker.js';
import type { HealthCheckResult } from './HealthChecker.js';
import type { AppConfig } from '../config.js';
import { SquareService } from '../payment/SquareService.js';

export interface DashboardHealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  services: ServiceStatus[];
  uptime: number;
  startTime: string;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime?: number;
  lastCheck: string;
  details?: Record<string, unknown>;
  uptime: number; // percentage over last 24h
}

export class HealthDashboard {
  private healthChecker: HealthChecker;
  private squareService: SquareService;
  private startTime: Date;
  private healthHistory: Map<string, HealthCheckResult[]> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: AppConfig) {
    this.squareService = new SquareService(config);
    this.healthChecker = new HealthChecker(config, this.squareService);
    this.startTime = new Date();
    this.initializeHealthHistory();
  }

  /**
   * Start periodic health checks for dashboard
   */
  startPeriodicChecks(intervalMinutes: number = 5): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.performHealthCheck();

    // Set up periodic checks
    this.checkInterval = setInterval(
      () => {
        this.performHealthCheck();
      },
      intervalMinutes * 60 * 1000
    );

    console.log(`🔄 Health monitoring started (checking every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️  Health monitoring stopped');
    }
  }

  /**
   * Get current health status for dashboard display
   */
  async getCurrentStatus(): Promise<DashboardHealthStatus> {
    const results = await this.healthChecker.checkAllServices();
    this.updateHealthHistory(results);

    const serviceStatuses = results.map(result => this.mapToServiceStatus(result));
    const overall = this.calculateOverallStatus(serviceStatuses);

    return {
      overall,
      lastCheck: new Date().toISOString(),
      services: serviceStatuses,
      uptime: this.calculateUptime(),
      startTime: this.startTime.toISOString(),
    };
  }

  /**
   * Get health status without performing new checks (uses cached data)
   */
  getCachedStatus(): DashboardHealthStatus | null {
    const cachedResults = this.getLatestHealthResults();
    if (!cachedResults || cachedResults.length === 0) {
      return null;
    }

    const serviceStatuses = cachedResults.map(result => this.mapToServiceStatus(result));
    const overall = this.calculateOverallStatus(serviceStatuses);

    return {
      overall,
      lastCheck: new Date().toISOString(),
      services: serviceStatuses,
      uptime: this.calculateUptime(),
      startTime: this.startTime.toISOString(),
    };
  }

  /**
   * Get health trends for dashboard charts
   */
  getHealthTrends(hours: number = 24): {
    service: string;
    dataPoints: { timestamp: string; healthy: boolean; responseTime?: number }[];
  }[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return Array.from(this.healthHistory.entries()).map(([service, results]) => ({
      service,
      dataPoints: results
        .filter(result => new Date(result.responseTime || 0) > cutoffTime)
        .map(result => ({
          timestamp: new Date().toISOString(), // Would need to store actual timestamps
          healthy: result.status === 'healthy',
          responseTime: result.responseTime,
        })),
    }));
  }

  /**
   * Express middleware for health endpoint
   */
  createHealthEndpoint() {
    return async (req: { query: Record<string, string | undefined> }, res: { json: (data: unknown) => void; status: (code: number) => { json: (data: unknown) => void } }) => {
      try {
        const includeDetails = req.query.details === 'true';
        const cached = req.query.cached === 'true';

        let status: DashboardHealthStatus;

        if (cached) {
          const cachedStatus = this.getCachedStatus();
          if (!cachedStatus) {
            status = await this.getCurrentStatus();
          } else {
            status = cachedStatus;
          }
        } else {
          status = await this.getCurrentStatus();
        }

        // Remove sensitive details if not requested
        if (!includeDetails) {
          status.services.forEach(service => {
            delete service.details;
          });
        }

        const httpStatus =
          status.overall === 'healthy' ? 200 : status.overall === 'degraded' ? 200 : 503;

        res.status(httpStatus).json(status);
      } catch (error) {
        console.error('❌ Failed to run health check:', {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        });
        res.status(503).json({
          overall: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          services: [],
          uptime: 0,
          startTime: this.startTime.toISOString(),
        });
      }
    };
  }

  /**
   * Get formatted status for logging
   */
  async logCurrentStatus(): Promise<void> {
    try {
      const status = await this.getCurrentStatus();

      console.log(`\n🏥 Health Status (${new Date().toLocaleTimeString()}):`);
      console.log(
        `Overall: ${this.getStatusEmoji(status.overall)} ${status.overall.toUpperCase()}`
      );

      status.services.forEach(service => {
        const emoji = service.status === 'healthy' ? '✅' : '❌';
        const responseTime = service.responseTime ? ` (${service.responseTime}ms)` : '';
        console.log(`  ${emoji} ${service.name}: ${service.message}${responseTime}`);
      });

      console.log(`Uptime: ${status.uptime.toFixed(1)}%\n`);
    } catch (error) {
      console.error('❌ Failed to log health status:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const results = await this.healthChecker.checkAllServices();
      this.updateHealthHistory(results);
    } catch (error) {
      console.error('Health check failed:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private initializeHealthHistory(): void {
    const services = ['Auth0', 'SendGrid', 'Square', 'Google Calendar'];
    services.forEach(service => {
      this.healthHistory.set(service, []);
    });
  }

  private updateHealthHistory(results: HealthCheckResult[]): void {
    results.forEach(result => {
      const history = this.healthHistory.get(result.service) || [];
      history.push(result);

      // Keep only last 100 results per service
      if (history.length > 100) {
        history.shift();
      }

      this.healthHistory.set(result.service, history);
    });
  }

  private mapToServiceStatus(result: HealthCheckResult): ServiceStatus {
    const history = this.healthHistory.get(result.service) || [];
    const uptime = this.calculateServiceUptime(history);

    return {
      name: result.service,
      status: result.status,
      message: result.message,
      responseTime: result.responseTime,
      lastCheck: new Date().toISOString(),
      details: result.details,
      uptime,
    };
  }

  private calculateOverallStatus(services: ServiceStatus[]): 'healthy' | 'unhealthy' | 'degraded' {
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;

    if (unhealthyCount === 0) return 'healthy';
    if (unhealthyCount < services.length) return 'degraded';
    return 'unhealthy';
  }

  private calculateUptime(): number {
    const uptimeMs = Date.now() - this.startTime.getTime();
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    return Math.min(100, (uptimeHours / 24) * 100); // Percentage of 24 hours
  }

  private calculateServiceUptime(history: HealthCheckResult[]): number {
    if (history.length === 0) return 0;

    let healthyCount = 0;
    history.forEach(result => {
      if (result.status === 'healthy') {
        healthyCount++;
      }
    });
    return (healthyCount / history.length) * 100;
  }

  private getLatestHealthResults(): HealthCheckResult[] | null {
    const results: HealthCheckResult[] = [];

    for (const history of this.healthHistory.values()) {
      if (history.length > 0) {
        results.push(history[history.length - 1]);
      }
    }

    return results.length > 0 ? results : null;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  }
}
