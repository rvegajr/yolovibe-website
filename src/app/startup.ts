/**
 * Application Startup Module
 * Handles configuration loading, health checks, and graceful startup
 */

import { loadConfig } from '../infrastructure/config.js';
import { HealthChecker } from '../infrastructure/health/HealthChecker.js';
import { HealthDashboard } from '../infrastructure/health/HealthDashboard.js';
import { SquareService } from '../infrastructure/payment/SquareService.js';
import { initializeDatabase } from '../registration/database/connection.js';

export class ApplicationStartup {
  private config!: ReturnType<typeof loadConfig>;
  private healthChecker!: HealthChecker;
  private healthDashboard!: HealthDashboard;
  private squareService!: SquareService;

  constructor() {
    // Properties will be initialized in the initialize method
  }

  /**
   * Performs complete application startup sequence
   * 1. Load and validate configuration
   * 2. Test all external service connections
   * 3. Initialize application components
   * 4. Start health monitoring
   */
  async initialize(): Promise<{
    config: ReturnType<typeof loadConfig>;
    healthChecker: HealthChecker;
    healthDashboard: HealthDashboard;
  }> {
    try {
      // Step 1: Load configuration
      console.log(' Loading configuration...');
      this.config = loadConfig();
      console.log(' Configuration loaded successfully\n');

      // Step 1a: Ensure database is initialized and schema applied
      console.log(' Initializing database and applying migrations (if needed)...');
      await initializeDatabase();
      console.log(' Database initialized successfully\n');

      // Step 2: Initialize Square service
      this.squareService = new SquareService(this.config);

      // Step 3: Initialize health checker and dashboard
      this.healthChecker = new HealthChecker(this.config, this.squareService);
      this.healthDashboard = new HealthDashboard(this.config);

      // Step 4: Validate all external services
      console.log(' Checking external service connections...');
      await this.healthChecker.validateCriticalServices();
      console.log('');

      // Step 5: Start health monitoring for dashboard
      console.log(' Starting health monitoring...');
      this.healthDashboard.startPeriodicChecks(5); // Check every 5 minutes
      console.log(' Health monitoring started\n');

      // Step 6: Application ready
      console.log(' Application startup completed successfully!');
      console.log(` Server ready to start on port ${this.config.port}`);
      console.log(' Health dashboard available at /health');
      console.log('');

      return {
        config: this.config,
        healthChecker: this.healthChecker,
        healthDashboard: this.healthDashboard,
      };
    } catch (error) {
      console.error('❌ Application startup failed');
      console.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Sets up graceful shutdown handlers
   */
  setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      console.log(`\n Received ${signal}, shutting down gracefully...`);

      // Stop health monitoring
      if (this.healthDashboard) {
        this.healthDashboard.stopPeriodicChecks();
      }

      // Add other cleanup logic here (close DB connections, etc.)
      console.log(' Cleanup completed');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Creates a health check endpoint handler for Express
   */
  createHealthEndpoint() {
    return this.healthDashboard.createHealthEndpoint();
  }

  /**
   * Log current health status (useful for debugging)
   */
  async logHealthStatus(): Promise<void> {
    if (this.healthDashboard) {
      await this.healthDashboard.logCurrentStatus();
    }
  }
}

/**
 * Quick startup function for simple applications
 */
export async function startupApplication() {
  const startup = new ApplicationStartup();
  startup.setupGracefulShutdown();
  return await startup.initialize();
}
