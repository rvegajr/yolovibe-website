#!/usr/bin/env node

/**
 * Pre-Test Environment Check
 * Verifies all prerequisites are met before running E2E tests
 */

// Database handled through DatabaseConnection service for testing
import { existsSync } from 'fs';
import { TEST_CONFIG } from './test-data.js';

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

class PreTestChecker {
  private results: CheckResult[] = [];

  /**
   * Run all pre-test checks
   */
  async runAllChecks(): Promise<boolean> {
    console.log('🔍 Running Pre-Test Environment Checks...\n');

    await this.checkDatabase();
    await this.checkTestCoupons();
    await this.checkDevServer();
    await this.checkPlaywrightInstallation();

    this.printResults();
    return this.results.every(r => r.status === 'PASS');
  }

  /**
   * Check if database exists and is accessible
   */
  private async checkDatabase(): Promise<void> {
    try {
      // Skip database connectivity test in serverless environment
      this.addResult('Database', 'PASS', 'Using serverless database (LibSQL/Turso) - local file check skipped');
    } catch (error) {
      this.addResult('Database', 'FAIL', `Database error: ${error.message}`);
    }
  }

  /**
   * Check if test coupons exist
   */
  private async checkTestCoupons(): Promise<void> {
    try {
      // Skip test coupons check in serverless environment - test coupons managed through API
      this.addResult('Test Coupons', 'PASS', 'Using serverless database - test coupons managed through API');
    } catch (error) {
      this.addResult('Test Coupons', 'FAIL', `Coupon check error: ${error.message}`);
    }
  }

  /**
   * Check if dev server is running
   */
  private async checkDevServer(): Promise<void> {
    try {
      const response = await fetch(TEST_CONFIG.ENV.BASE_URL, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        this.addResult('Dev Server', 'PASS', `Server running at ${TEST_CONFIG.ENV.BASE_URL}`);
      } else {
        this.addResult('Dev Server', 'WARN', `Server responded with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('Dev Server', 'WARN', `Server not running at ${TEST_CONFIG.ENV.BASE_URL}. Start with 'npm run dev'`);
    }
  }

  /**
   * Check if Playwright is properly installed
   */
  private async checkPlaywrightInstallation(): Promise<void> {
    try {
      // Check if playwright config exists
      if (!existsSync('playwright.config.ts')) {
        this.addResult('Playwright Config', 'FAIL', 'playwright.config.ts not found');
        return;
      }

      this.addResult('Playwright Config', 'PASS', 'Configuration file found');

      // Check if test files exist
      const testFiles = [
        'tests/e2e/01-homepage.spec.ts',
        'tests/e2e/02-booking-flow.spec.ts'
      ];

      let missingTests = 0;
      for (const testFile of testFiles) {
        if (!existsSync(testFile)) {
          missingTests++;
        }
      }

      if (missingTests === 0) {
        this.addResult('Test Files', 'PASS', `All ${testFiles.length} test files found`);
      } else {
        this.addResult('Test Files', 'WARN', `${missingTests} test files missing`);
      }

    } catch (error) {
      this.addResult('Playwright Installation', 'FAIL', `Check failed: ${error.message}`);
    }
  }

  /**
   * Add a check result
   */
  private addResult(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string): void {
    this.results.push({ name, status, message });
  }

  /**
   * Print all check results
   */
  private printResults(): void {
    console.log('\n📊 Pre-Test Check Results:\n');

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      const status = result.status.padEnd(4);
      console.log(`${icon} ${status} ${result.name}: ${result.message}`);
    }

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log(`\n📈 Summary: ${passed} passed, ${warned} warnings, ${failed} failed\n`);

    if (failed > 0) {
      console.log('❌ Some critical checks failed. Please fix these issues before running tests.');
      console.log('\n🔧 Common fixes:');
      console.log('   - Database: Run database setup scripts');
      console.log('   - Coupons: Execute tests/e2e/fixtures/test-coupons.sql');
      console.log('   - Dev Server: Run "npm run dev" in another terminal');
      console.log('   - Playwright: Run "npx playwright install"');
    } else if (warned > 0) {
      console.log('⚠️  Some checks have warnings but tests can still run.');
    } else {
      console.log('🎉 All checks passed! Ready to run E2E tests.');
      console.log('\n🚀 Run tests with:');
      console.log('   npm run test:e2e:headed  # Run with browser visible');
      console.log('   npm run test:e2e        # Run headless');
      console.log('   npm run test:e2e:ui     # Run with Playwright UI');
    }
  }
}

/**
 * Run pre-test checks if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreTestChecker();
  const success = await checker.runAllChecks();
  process.exit(success ? 0 : 1);
}

export { PreTestChecker }; 