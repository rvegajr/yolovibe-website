# YOLOVibe Production End-to-End Testing Guide

This guide explains how to run comprehensive end-to-end tests against your live production site using Playwright.

## 🎯 Test Coverage

### Test Suites

1. **Production Purchase Flows** (`06-production-purchase-flows.spec.ts`)
   - 3-Day Workshop purchase flow
   - 5-Day Workshop purchase flow  
   - Consulting hours booking flow
   - Complete user journey testing

2. **Square Payment Integration** (`07-square-payment-integration.spec.ts`)
   - Payment form loading and validation
   - Square iframe integration
   - Test card processing
   - Payment error handling

3. **Calendar Integration** (`08-calendar-integration.spec.ts`)
   - Google Calendar integration for consulting
   - Workshop scheduling
   - Date/time selection
   - Timezone handling

4. **Email Confirmation** (`09-email-confirmation.spec.ts`)
   - Email confirmation messaging
   - Form validation
   - Email preferences
   - Delivery confirmation flow

## 🚀 Running Tests

### Quick Commands

```bash
# Run all production tests with comprehensive reporting
npm run test:production

# Run all production tests with Playwright's built-in reporting
npm run test:production:all

# Run individual test suites
npm run test:production:quick      # Purchase flows only
npm run test:production:payment    # Square payment tests
npm run test:production:calendar   # Calendar integration tests
npm run test:production:email      # Email confirmation tests
```

### Advanced Usage

```bash
# Run with UI mode for debugging
npx playwright test --config=playwright.production.config.ts --ui

# Run specific test with headed browser (visible)
npx playwright test tests/e2e/06-production-purchase-flows.spec.ts --config=playwright.production.config.ts --headed

# Run on specific browser
npx playwright test --config=playwright.production.config.ts --project=chromium-desktop

# Generate and view HTML report
npx playwright test --config=playwright.production.config.ts
npx playwright show-report test-results/production-report
```

## 📊 Test Results

### Locations

- **Screenshots**: `test-results/` (PNG files for each test scenario)
- **Videos**: `test-results/` (WebM files for failed tests)
- **HTML Report**: `test-results/production-report/index.html`
- **JSON Results**: `test-results/production-results.json`
- **Custom Report**: `test-results/production-test-report.html`

### Understanding Results

**✅ Successful Tests**: Tests that found expected elements and completed flows
**❌ Failed Tests**: Tests that encountered errors or missing elements
**⚠️ Warnings**: Tests that completed but with unexpected behavior

## 🧪 Test Scenarios

### 3-Day Workshop ($3,000)
- Navigate to workshop selection
- Fill user information
- Verify pricing display
- Test payment form integration
- Verify email confirmation setup

### 5-Day Workshop ($4,500)  
- Navigate to intensive workshop
- Complete booking form
- Verify pricing accuracy
- Test Square payment integration
- Check confirmation messaging

### Consulting Hours ($150/hour)
- Select consulting option
- Choose date/time slots
- Test calendar integration
- Verify hourly pricing calculation
- Test appointment confirmation

## 🔧 Configuration

### Production Test Config

```typescript
// playwright.production.config.ts
export default defineConfig({
  baseURL: 'https://yolov-ibe-website-gpt1sqq5i-rvegajrs-projects.vercel.app',
  timeout: 60000,
  retries: 2,
  workers: 2,
  projects: ['chromium-desktop', 'firefox-desktop', 'mobile-chrome', 'mobile-safari']
});
```

### Test Data

Tests use realistic test data:
- Unique email addresses per test run
- Valid phone numbers and names
- Square sandbox test cards
- Future dates for scheduling

## 🎯 Use Cases Tested

### Primary User Flows
1. **Homepage → Workshop Selection → Booking Form → Payment**
2. **Homepage → Consulting → Calendar Selection → Payment**
3. **Homepage → Pricing → Product Selection → Checkout**

### Edge Cases
- Invalid email format validation
- Payment form validation
- Calendar availability checking
- Mobile responsiveness
- Error handling

## 🛠️ Troubleshooting

### Common Issues

**Tests timing out**: Increase timeouts in `playwright.production.config.ts`
```typescript
timeout: 90 * 1000, // 90 seconds
```

**Elements not found**: Check if the production site structure changed
```typescript
// Use multiple selectors as fallbacks
const button = page.locator('button:has-text("Book"), .cta-button, a[href*="book"]');
```

**Payment tests failing**: Verify Square sandbox is properly configured
```typescript
// Check for Square iframe loading
const squareFrame = page.locator('iframe[src*="square"]');
await expect(squareFrame).toBeVisible({ timeout: 10000 });
```

### Debug Mode

Run tests in debug mode to step through interactions:
```bash
npx playwright test --config=playwright.production.config.ts --debug
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshot at failure point
- Video recording of the entire test
- Network logs and console errors

## 📈 Continuous Integration

### GitHub Actions Integration

Add to `.github/workflows/production-tests.yml`:
```yaml
name: Production E2E Tests
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:

jobs:
  production-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:production:all
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: production-test-results
          path: test-results/
```

## 🎯 Success Criteria

Tests verify:
- ✅ All product pricing displays correctly
- ✅ Payment forms load and validate input
- ✅ Calendar integration functions
- ✅ Email confirmation messaging is present
- ✅ Mobile responsiveness works
- ✅ Error handling is graceful
- ✅ User flows complete successfully

## 📞 Support

If tests fail consistently:
1. Check if production site is accessible
2. Verify Square sandbox configuration
3. Confirm Google Calendar integration
4. Review SendGrid email setup
5. Check for recent code deployments

The tests are designed to be robust and handle various scenarios, but they depend on the production site being functional and properly configured.