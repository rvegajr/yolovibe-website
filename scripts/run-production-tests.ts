#!/usr/bin/env tsx

/**
 * Production End-to-End Test Runner
 * Runs comprehensive tests against the live production site
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface TestSuite {
  name: string;
  file: string;
  description: string;
  timeout?: number;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Production Purchase Flows',
    file: '06-production-purchase-flows.spec.ts',
    description: 'Tests all purchase scenarios (3-day, 5-day, consulting)',
    timeout: 120000
  },
  {
    name: 'Square Payment Integration',
    file: '07-square-payment-integration.spec.ts', 
    description: 'Tests Square payment forms and validation',
    timeout: 90000
  },
  {
    name: 'Calendar Integration',
    file: '08-calendar-integration.spec.ts',
    description: 'Tests Google Calendar integration for bookings',
    timeout: 90000
  },
  {
    name: 'Email Confirmation',
    file: '09-email-confirmation.spec.ts',
    description: 'Tests email confirmation functionality',
    timeout: 60000
  }
];

interface TestResults {
  suite: string;
  passed: boolean;
  duration: number;
  error?: string;
  screenshots: string[];
}

class ProductionTestRunner {
  private results: TestResults[] = [];
  private startTime = Date.now();

  async run(): Promise<void> {
    console.log('🚀 Starting YOLOVibe Production End-to-End Tests');
    console.log('='.repeat(60));
    console.log(`Target: https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app`);
    console.log(`Started: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    // Ensure test-results directory exists
    await this.ensureDirectories();

    // Run each test suite
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }

    // Generate summary report
    await this.generateReport();
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = ['test-results', 'test-results/screenshots', 'test-results/videos'];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\n🧪 Running: ${suite.name}`);
    console.log(`📝 ${suite.description}`);
    console.log('-'.repeat(40));

    const suiteStartTime = Date.now();
    
    try {
      // Run Playwright test for this suite
      const command = `npx playwright test tests/e2e/${suite.file} --reporter=json --output-dir=test-results`;
      const { stdout, stderr } = await execAsync(command, {
        timeout: suite.timeout || 60000,
        env: {
          ...process.env,
          NODE_ENV: 'test'
        }
      });

      const duration = Date.now() - suiteStartTime;
      
      // Parse results
      let testResults;
      try {
        testResults = JSON.parse(stdout);
      } catch (e) {
        // If JSON parsing fails, check if tests passed based on exit code
        testResults = { stats: { passed: true } };
      }

      const passed = !stderr.includes('failed') && !stderr.includes('error');
      
      this.results.push({
        suite: suite.name,
        passed,
        duration,
        error: passed ? undefined : stderr,
        screenshots: await this.findScreenshots(suite.file)
      });

      if (passed) {
        console.log(`✅ ${suite.name} - PASSED (${duration}ms)`);
      } else {
        console.log(`❌ ${suite.name} - FAILED (${duration}ms)`);
        console.log(`   Error: ${stderr.substring(0, 200)}...`);
      }

    } catch (error) {
      const duration = Date.now() - suiteStartTime;
      
      this.results.push({
        suite: suite.name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
        screenshots: []
      });

      console.log(`❌ ${suite.name} - ERROR (${duration}ms)`);
      console.log(`   Error: ${error}`);
    }
  }

  private async findScreenshots(testFile: string): Promise<string[]> {
    try {
      const screenshotDir = 'test-results';
      const files = await fs.readdir(screenshotDir);
      return files.filter(file => 
        file.endsWith('.png') && 
        file.includes(testFile.replace('.spec.ts', ''))
      );
    } catch (error) {
      return [];
    }
  }

  private async generateReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);
    console.log(`🕐 Completed: ${new Date().toLocaleString()}`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(60));
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.suite} (${result.duration}ms)`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error.substring(0, 100)}...`);
      }
      
      if (result.screenshots.length > 0) {
        console.log(`   Screenshots: ${result.screenshots.length} files`);
      }
    });

    // Generate HTML report
    await this.generateHTMLReport();

    // Final status
    if (failed === 0) {
      console.log('\n🎉 ALL PRODUCTION TESTS PASSED!');
      console.log('Your YOLOVibe application is ready for customers!');
    } else {
      console.log(`\n⚠️  ${failed} test suite(s) failed.`);
      console.log('Review the detailed results above and check screenshots.');
    }
  }

  private async generateHTMLReport(): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>YOLOVibe Production Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .metric { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; }
        .metric.passed { border-left: 4px solid #28a745; }
        .metric.failed { border-left: 4px solid #dc3545; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; }
        .test-result.passed { background: #d4edda; border-color: #c3e6cb; }
        .test-result.failed { background: #f8d7da; border-color: #f5c6cb; }
        .error { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 10px; }
        .screenshots { margin-top: 10px; }
        .screenshot { display: inline-block; margin: 5px; padding: 5px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 YOLOVibe Production Test Results</h1>
        <p>Target: <strong>https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app</strong></p>
        <p>Generated: <strong>${new Date().toLocaleString()}</strong></p>
    </div>

    <div class="summary">
        <div class="metric passed">
            <h3>${this.results.filter(r => r.passed).length}</h3>
            <p>Passed</p>
        </div>
        <div class="metric failed">
            <h3>${this.results.filter(r => !r.passed).length}</h3>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h3>${this.results.length}</h3>
            <p>Total Suites</p>
        </div>
        <div class="metric">
            <h3>${Math.round((Date.now() - this.startTime) / 1000)}s</h3>
            <p>Duration</p>
        </div>
    </div>

    <h2>Test Results</h2>
    ${this.results.map(result => `
        <div class="test-result ${result.passed ? 'passed' : 'failed'}">
            <h3>${result.passed ? '✅' : '❌'} ${result.suite}</h3>
            <p><strong>Duration:</strong> ${result.duration}ms</p>
            ${result.error ? `<div class="error">${result.error}</div>` : ''}
            ${result.screenshots.length > 0 ? `
                <div class="screenshots">
                    <strong>Screenshots:</strong>
                    ${result.screenshots.map(s => `<span class="screenshot">${s}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    await fs.writeFile('test-results/production-test-report.html', html);
    console.log('\n📄 HTML report generated: test-results/production-test-report.html');
  }
}

// Run the tests
async function main() {
  const runner = new ProductionTestRunner();
  await runner.run();
}

main().catch(console.error);