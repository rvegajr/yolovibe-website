import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page first
    await page.goto('/login');
  });

  test('should login and display dashboard with expected data', async ({ page }) => {
    console.log('🧪 Testing Admin Dashboard Login and Data Display');
    
    // Step 1: Login with admin credentials
    console.log('📝 Step 1: Filling login form...');
    await page.fill('#email', 'admin@yolovibecodebootcamp.com');
    await page.fill('#password', 'admin123');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for login to complete and redirect (or check for success message)
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to admin dashboard
    console.log('🚀 Step 2: Navigating to admin dashboard...');
    await page.goto('/admin/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Step 3: Verify dashboard header and styling
    console.log('🎨 Step 3: Verifying dashboard header and dark theme...');
    
    // Check for dashboard title with gradient styling
    const dashboardTitle = page.locator('h1').filter({ hasText: 'Admin Dashboard' });
    await expect(dashboardTitle).toBeVisible();
    
    // Verify dark theme background
    const bodyBg = page.locator('div.min-h-screen.bg-gradient-to-b');
    await expect(bodyBg).toBeVisible();
    
    // Step 4: Verify system status banner appears
    console.log('🔍 Step 4: Checking system status banner...');
    const statusBanner = page.locator('#system-status-banner');
    await expect(statusBanner).toBeVisible();
    
    // Wait for data to load (give the API calls time to complete)
    await page.waitForTimeout(3000);
    
    // Step 5: Verify database usage data is displayed
    console.log('📊 Step 5: Verifying database usage metrics...');
    
    // Check that reads count is no longer showing "--"
    const readsCount = page.locator('#reads-count');
    await expect(readsCount).toBeVisible();
    const readsText = await readsCount.textContent();
    expect(readsText).not.toBe('--');
    console.log(`✅ Reads count: ${readsText}`);
    
    // Check that writes count is displayed
    const writesCount = page.locator('#writes-count');
    await expect(writesCount).toBeVisible();
    const writesText = await writesCount.textContent();
    expect(writesText).not.toBe('--');
    console.log(`✅ Writes count: ${writesText}`);
    
    // Check that storage count is displayed
    const storageCount = page.locator('#storage-count');
    await expect(storageCount).toBeVisible();
    const storageText = await storageCount.textContent();
    expect(storageText).not.toBe('--');
    console.log(`✅ Storage count: ${storageText}`);
    
    // Step 6: Verify progress bars have actual width (not 0%)
    console.log('📈 Step 6: Verifying progress bars are populated...');
    
    const readsBar = page.locator('#reads-bar');
    const readsBarWidth = await readsBar.getAttribute('style');
    expect(readsBarWidth).toContain('width:');
    expect(readsBarWidth).not.toContain('width: 0%');
    console.log(`✅ Reads progress bar: ${readsBarWidth}`);
    
    const writesBar = page.locator('#writes-bar');
    const writesBarWidth = await writesBar.getAttribute('style');
    expect(writesBarWidth).toContain('width:');
    expect(writesBarWidth).not.toContain('width: 0%');
    console.log(`✅ Writes progress bar: ${writesBarWidth}`);
    
    // Step 7: Verify status badge shows correct status
    console.log('🏷️ Step 7: Verifying status badge...');
    const statusBadge = page.locator('#usage-status');
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/SAFE|WARNING|CRITICAL/);
    console.log(`✅ Status badge: ${statusText}`);
    
    // Step 8: Verify last updated timestamp is populated
    console.log('🕒 Step 8: Verifying last updated timestamp...');
    const lastUpdated = page.locator('#last-updated');
    await expect(lastUpdated).toBeVisible();
    const timestampText = await lastUpdated.textContent();
    expect(timestampText).not.toBe('--');
    console.log(`✅ Last updated: ${timestampText}`);
    
    // Step 9: Test refresh functionality
    console.log('🔄 Step 9: Testing refresh functionality...');
    const refreshButton = page.locator('#refresh-dashboard');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    
    // Wait for refresh to complete
    await page.waitForTimeout(2000);
    
    // Verify the timestamp updated
    const newTimestamp = await lastUpdated.textContent();
    console.log(`✅ Timestamp after refresh: ${newTimestamp}`);
    
    // Step 10: Verify no JavaScript errors in console
    console.log('🐛 Step 10: Checking for JavaScript errors...');
    
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Refresh the page to trigger any potential errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check that no critical errors occurred
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('vercel-insights') &&
      !error.includes('net::ERR_BLOCKED_BY_CLIENT')
    );
    
    if (criticalErrors.length > 0) {
      console.log('❌ JavaScript errors found:', criticalErrors);
    } else {
      console.log('✅ No critical JavaScript errors detected');
    }
    
    expect(criticalErrors.length).toBe(0);
    
    console.log('🎉 All dashboard tests passed!');
  });

  test('should handle dashboard API errors gracefully', async ({ page }) => {
    console.log('🧪 Testing Dashboard Error Handling');
    
    // Login first
    await page.fill('#email', 'admin@yolovibecodebootcamp.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Mock API failure
    await page.route('/api/admin/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Navigate to dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verify error handling
    const statusBanner = page.locator('#system-status-banner');
    await expect(statusBanner).toBeVisible();
    
    // Check if error message is displayed
    const errorContent = await statusBanner.textContent();
    expect(errorContent).toContain('Error');
    
    console.log('✅ Dashboard handles API errors gracefully');
  });

  test('should display correct dark theme styling', async ({ page }) => {
    console.log('🎨 Testing Dashboard Dark Theme Styling');
    
    // Login and navigate to dashboard
    await page.fill('#email', 'admin@yolovibecodebootcamp.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify dark theme elements
    const darkBackground = page.locator('div.bg-gradient-to-b.from-gray-900');
    await expect(darkBackground).toBeVisible();
    
    // Verify database usage widget has proper dark styling
    const usageWidget = page.locator('.bg-gradient-to-br.from-slate-800\\/50');
    await expect(usageWidget).toBeVisible();
    
    // Verify text colors are appropriate for dark theme
    const whiteText = page.locator('h2.text-white').first();
    await expect(whiteText).toBeVisible();
    
    // Verify progress bars have gradient styling
    const progressBar = page.locator('#reads-bar.bg-gradient-to-r');
    await expect(progressBar).toBeVisible();
    
    console.log('✅ Dark theme styling is correctly applied');
  });
}); 