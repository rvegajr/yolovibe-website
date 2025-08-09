import { test, expect } from '@playwright/test';

// Verifies that the Admin dashboard usage counts align with the backend API payload
// and that values are non-null, numeric and consistent.

test.describe('Counts Alignment', () => {
  test('dashboard usage counts align with API', async ({ page }) => {
    // Login (dev stub creds)
    await page.goto('/login');
    await page.fill('#email', 'admin@yolovibecodebootcamp.com');
    await page.fill('#password', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(800);

    // Intercept API to capture payload
    let apiPayload: any = null;
    await page.route('**/api/admin/dashboard', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      apiPayload = body;
      await route.fulfill({ response, body: JSON.stringify(body) });
    });

    // Open dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Read UI counts
    const readsText = await page.locator('#reads-count').textContent();
    const writesText = await page.locator('#writes-count').textContent();
    const storageText = await page.locator('#storage-count').textContent();

    const readsNum = Number((readsText || '').replace(/[^0-9.]/g, ''));
    const writesNum = Number((writesText || '').replace(/[^0-9.]/g, ''));
    const storageNum = Number((storageText || '').replace(/[^0-9.]/g, ''));

    expect(Number.isFinite(readsNum)).toBeTruthy();
    expect(Number.isFinite(writesNum)).toBeTruthy();
    expect(Number.isFinite(storageNum)).toBeTruthy();

    // Validate API payload captured
    expect(apiPayload).toBeTruthy();
    const apiReads = Number(apiPayload?.usage?.reads ?? NaN);
    const apiWrites = Number(apiPayload?.usage?.writes ?? NaN);
    const apiStorage = Number(apiPayload?.usage?.storage ?? NaN);

    // Allow small formatting/rounding differences, but ensure alignment
    const within = (a: number, b: number, delta = 1) => Math.abs(a - b) <= delta;
    if (Number.isFinite(apiReads)) expect(within(readsNum, apiReads)).toBeTruthy();
    if (Number.isFinite(apiWrites)) expect(within(writesNum, apiWrites)).toBeTruthy();
    if (Number.isFinite(apiStorage)) expect(within(storageNum, apiStorage)).toBeTruthy();
  });
});


