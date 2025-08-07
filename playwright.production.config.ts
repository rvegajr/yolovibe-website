import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Production Testing
 * Tests against the live production site
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Only run production-specific tests */
  testMatch: /0[6-9]-.*\.spec\.ts|10-.*\.spec\.ts/,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry failed tests in production */
  retries: 2,
  
  /* Use fewer workers for production testing */
  workers: 2,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'test-results/production-report' }],
    ['json', { outputFile: 'test-results/production-results.json' }],
    ['line']
  ],
  
  /* Global test timeout for production tests */
  timeout: 60 * 1000, // 60 seconds
  
  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  
  /* Shared settings for production testing */
  use: {
    /* Base URL - Production site */
    baseURL: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app',

    /* Collect trace when retrying failed tests */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Ignore HTTPS errors in production */
    ignoreHTTPSErrors: false,
    
    /* Set viewport */
    viewport: { width: 1280, height: 720 },
    
    /* User agent */
    userAgent: 'YOLOVibe-E2E-Tests/1.0',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'X-Test-Environment': 'production-e2e'
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Increase timeouts for production
        actionTimeout: 15 * 1000,
        navigationTimeout: 30 * 1000,
      },
    },

    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        actionTimeout: 15 * 1000,
        navigationTimeout: 30 * 1000,
      },
    },

    /* Test against mobile viewports */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        actionTimeout: 20 * 1000,
        navigationTimeout: 30 * 1000,
      },
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        actionTimeout: 20 * 1000,
        navigationTimeout: 30 * 1000,
      },
    },
  ],

  /* Output directory for test results */
  outputDir: 'test-results/production-artifacts',

  /* Do NOT run local dev server - we're testing production */
  // webServer: undefined,
});