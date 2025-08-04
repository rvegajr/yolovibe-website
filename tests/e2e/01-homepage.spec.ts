import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TestDataFactory } from './utils/test-data';

/**
 * Homepage End-to-End Tests
 * Tests the anonymous user experience on the homepage
 */

test.describe('Homepage - Anonymous User Experience', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    TestDataFactory.resetCounter(); // Ensure consistent test data
  });

  test('should load homepage successfully', async () => {
    console.log('✅ Test: Homepage loads successfully');
    
    // Navigate to homepage
    await homePage.goto();
    
    // Verify page content is displayed
    await homePage.verifyPageContent();
    
    // Verify page title
    const title = await homePage.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
    
    console.log(`✅ Homepage loaded with title: ${title}`);
  });

  test('should display workshop offerings', async () => {
    console.log('✅ Test: Workshop offerings are displayed');
    
    await homePage.goto();
    
    // Verify workshop offerings section
    await homePage.verifyWorkshopOfferings();
    
    console.log('✅ Workshop offerings verified');
  });

  test('should have working navigation links', async () => {
    console.log('✅ Test: Navigation links work correctly');
    
    await homePage.goto();
    
    // Test navigation to different pages
    await homePage.goToKnowledgeUnbound();
    expect(homePage.page.url()).toContain('/knowledge-unbound');
    
    await homePage.goto(); // Back to home
    
    await homePage.goToWorkshops();
    // Workshops dropdown goes to product page
    expect(homePage.page.url()).toContain('/product-a');
    
    await homePage.goto(); // Back to home
    
    await homePage.goToUnprivacy();
    expect(homePage.page.url()).toContain('/unprivacy');
    
    console.log('✅ All navigation links working');
  });

  test('should navigate to booking page via CTA', async () => {
    console.log('✅ Test: CTA button navigates to booking');
    
    await homePage.goto();
    
    // Click main CTA button
    await homePage.clickBookNow();
    
    // Verify we're on the booking section
    expect(homePage.page.url()).toContain('#book');
    
    console.log('✅ CTA navigation successful');
  });

  test('should display features section', async () => {
    console.log('✅ Test: Features section is displayed');
    
    await homePage.goto();
    
    // Verify features section (if it exists)
    await homePage.verifyFeatures();
    
    console.log('✅ Features section verified');
  });

  test('should pass basic SEO checks', async () => {
    console.log('✅ Test: Basic SEO elements are present');
    
    await homePage.goto();
    
    // Verify SEO basics
    await homePage.verifySEOBasics();
    
    console.log('✅ SEO basics verified');
  });

  test('should perform well (basic performance check)', async () => {
    console.log('✅ Test: Basic performance requirements');
    
    await homePage.goto();
    
    // Verify basic performance
    await homePage.verifyPerformance();
    
    console.log('✅ Performance check passed');
  });
});

test.describe('Homepage - Mobile Responsiveness', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    TestDataFactory.resetCounter();
  });

  test('should be responsive on mobile devices', async () => {
    console.log('✅ Test: Mobile responsiveness');
    
    await homePage.goto();
    
    // Verify mobile responsiveness
    await homePage.verifyMobileResponsiveness();
    
    console.log('✅ Mobile responsiveness verified');
  });

  test('should have accessible navigation on mobile', async () => {
    console.log('✅ Test: Mobile navigation accessibility');
    
    await homePage.goto();
    
    // Verify navigation is accessible on mobile
    await homePage.verifyPageContent();
    
    // Test that CTA button is still clickable on mobile
    await homePage.clickBookNow();
    expect(homePage.page.url()).toContain('/book');
    
    console.log('✅ Mobile navigation verified');
  });
});

test.describe('Homepage - Cross-Browser Compatibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    TestDataFactory.resetCounter();
  });

  test('should work consistently across browsers', async () => {
    console.log('✅ Test: Cross-browser compatibility');
    
    await homePage.goto();
    
    // Verify core functionality works
    await homePage.verifyPageContent();
    await homePage.verifyWorkshopOfferings();
    
    // Test navigation
    await homePage.clickBookNow();
    expect(homePage.page.url()).toContain('/book');
    
    console.log('✅ Cross-browser compatibility verified');
  });
}); 