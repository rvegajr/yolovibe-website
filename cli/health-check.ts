#!/usr/bin/env node

/**
 * YOLOVibe Health Check CLI
 * Standalone command-line tool to test all API connections
 */

import { program } from 'commander';
import chalk from 'chalk';
import { startupApplication } from '../src/app/startup.js';
import type { HealthCheckResult } from '../src/infrastructure/health/HealthChecker.js';

interface CliOptions {
  verbose: boolean;
  json: boolean;
  timeout: number;
  services?: string[];
}

class HealthCheckCli {
  private isSpinning = false;

  async run(options: CliOptions): Promise<void> {
    try {
      this.printHeader();

      // Initialize application
      this.startSpinner('Loading configuration...');
      const { healthChecker } = await startupApplication();
      this.stopSpinner('Configuration loaded');

      // Run health checks
      this.startSpinner('Checking services...');
      const results = await healthChecker.checkAllServices();
      this.stopSpinner('Service connections tested');

      // Check for any failures
      const hasFailures = results.some(r => r.status === 'unhealthy');

      if (hasFailures) {
        process.exit(1);
      }

      // Display results
      if (options.json) {
        this.printJsonResults(results);
      } else {
        this.printFormattedResults(results, options.verbose);
      }

      // Exit with appropriate code
      process.exit(0);
    } catch (error) {
      this.stopSpinner('Health check failed', true);
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  private printHeader(): void {
    console.log(chalk.cyan.bold('\n🏥 YOLOVibe Health Check CLI'));
    console.log(chalk.gray('Testing all external service connections...\n'));
  }

  private startSpinner(message: string): void {
    this.isSpinning = true;
    process.stdout.write(`⏳ ${message}...`);
  }

  private stopSpinner(message: string, failed = false): void {
    if (this.isSpinning) {
      process.stdout.write('\r');
      const icon = failed ? '❌' : '✅';
      console.log(`${icon} ${message}`);
      this.isSpinning = false;
    }
  }

  private printFormattedResults(results: HealthCheckResult[], verbose: boolean): void {
    console.log(chalk.bold('\n📊 Health Check Results:'));
    console.log(chalk.gray('========================\n'));

    let passCount = 0;
    let failCount = 0;

    results.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' : '❌';
      const status = result.status === 'healthy' ? chalk.green('HEALTHY') : chalk.red('UNHEALTHY');
      const responseTime = result.responseTime ? chalk.gray(`(${result.responseTime}ms)`) : '';

      console.log(`${icon} ${chalk.bold(result.service)}: ${status} ${responseTime}`);
      console.log(`   ${result.message}`);

      if (verbose && result.details) {
        console.log(chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2)}`));
      }

      console.log('');

      if (result.status === 'healthy') passCount++;
      else failCount++;
    });

    // Summary
    const summaryColor = failCount === 0 ? chalk.green : chalk.red;
    console.log(summaryColor.bold(`🎯 Summary: ${passCount} passed, ${failCount} failed`));

    if (failCount === 0) {
      console.log(chalk.green('🎉 All services are healthy! Your application is ready to run.'));
    } else {
      console.log(chalk.red('⚠️  Some services are unhealthy. Please check your configuration.'));
    }
    console.log('');
  }

  private printJsonResults(results: HealthCheckResult[]): void {
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length,
      },
      services: results,
    };

    console.log(JSON.stringify(output, null, 2));
  }
}

// CLI Program Setup
program
  .name('health-check')
  .description('Test all external service connections for YOLOVibe Workshop Registration')
  .version('1.0.0')
  .option('-v, --verbose', 'Show detailed service information', false)
  .option('-j, --json', 'Output results in JSON format', false)
  .option('-t, --timeout <seconds>', 'Connection timeout in seconds', '10')
  .option(
    '-s, --services <services>',
    'Comma-separated list of services to test (auth0,sendgrid,square,google)'
  )
  .action(async (options: CliOptions) => {
    const cli = new HealthCheckCli();
    await cli.run(options);
  });

// Handle CLI execution
const isMainModule = import.meta.url.endsWith(process.argv[1].replace(/^file:\/\//, ''));
if (isMainModule) {
  program.parse();
}

export { HealthCheckCli };
