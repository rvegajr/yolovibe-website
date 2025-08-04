import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { TEST_CONFIG } from '../utils/test-data';

/**
 * Home Page Object Model
 * Handles all interactions with the home page
 */
export class HomePage {
  readonly page: Page;
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButton: Locator;
  readonly navigationMenu: Locator;
  readonly knowledgeUnboundLink: Locator;
  readonly workshopsLink: Locator;
  readonly bookLink: Locator;
  readonly unprivacyLink: Locator;
  readonly featuresSection: Locator;
  readonly workshopOfferingsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Hero section elements - use specific test IDs
    this.heroSection = page.locator('[data-testid="hero-section"]');
    this.heroTitle = page.locator('[data-testid="hero-section"] h1').first();
    this.heroSubtitle = page.locator('[data-testid="hero-section"] p').first();
    this.ctaButton = page.locator('[data-testid="cta-button"]');
    
    // Navigation elements - be more specific
    this.navigationMenu = page.locator('nav').first();
    this.knowledgeUnboundLink = page.locator('nav a[href="/knowledge-unbound"]');
    this.workshopsLink = page.locator('nav button:has-text("Workshops")');
    this.bookLink = page.locator('nav a[href*="#book"]');
    this.unprivacyLink = page.locator('nav a[href="/unprivacy"]');
    
    // Content sections - use specific test IDs
    this.featuresSection = page.locator('[data-testid="features"]');
    this.workshopOfferingsSection = page.locator('[data-testid="workshop-offerings"]');
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.page.goto(TEST_CONFIG.URLS.HOME);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.heroTitle).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Verify the home page content is displayed correctly
   */
  async verifyPageContent(): Promise<void> {
    // Verify hero section
    await expect(this.heroSection).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroTitle).toContainText(/YOLOVibe|AI|Code|Workshop/i);
    
    // Verify navigation
    await expect(this.navigationMenu).toBeVisible();
    await expect(this.knowledgeUnboundLink).toBeVisible();
    await expect(this.workshopsLink).toBeVisible();
    await expect(this.bookLink).toBeVisible();
    
    // Verify main CTA button
    await expect(this.ctaButton).toBeVisible();
    await expect(this.ctaButton).toBeEnabled();
  }

  /**
   * Click the main CTA button to go to booking
   */
  async clickBookNow(): Promise<void> {
    await this.ctaButton.click();
    // CTA button scrolls to #book section on same page
    await this.page.waitForTimeout(1000);
    // Verify the booking section is visible
    await expect(this.page.locator('#book')).toBeVisible();
  }

  /**
   * Navigate to knowledge unbound page
   */
  async goToKnowledgeUnbound(): Promise<void> {
    await this.knowledgeUnboundLink.click();
    await this.page.waitForURL('**/knowledge-unbound**');
  }

  /**
   * Navigate to workshops section
   */
  async goToWorkshops(): Promise<void> {
    await this.workshopsLink.click();
    // Click on the first workshop option in the dropdown
    await this.page.locator('nav a[href="/product-a"]').click();
    await this.page.waitForURL('**/product-a**');
  }

  /**
   * Navigate to unprivacy page
   */
  async goToUnprivacy(): Promise<void> {
    await this.unprivacyLink.click();
    await this.page.waitForURL('**/unprivacy**');
  }

  /**
   * Navigate to booking page
   */
  async goToBooking(): Promise<void> {
    await this.bookLink.click();
    await this.page.waitForURL('**/book**');
  }

  /**
   * Verify workshop offerings are displayed
   */
  async verifyWorkshopOfferings(): Promise<void> {
    await expect(this.workshopOfferingsSection).toBeVisible();
    
    // Look for 3-day and 5-day workshop mentions
    const pageContent = await this.page.textContent('body');
    expect(pageContent).toMatch(/3.day|3 day/i);
    expect(pageContent).toMatch(/5.day|5 day/i);
  }

  /**
   * Verify features section is displayed
   */
  async verifyFeatures(): Promise<void> {
    if (await this.featuresSection.isVisible()) {
      await expect(this.featuresSection).toBeVisible();
      
      // Check for common feature keywords
      const featuresText = await this.featuresSection.textContent();
      expect(featuresText).toMatch(/AI|workshop|training|learn|code/i);
    }
  }

  /**
   * Check if the page is responsive on mobile
   */
  async verifyMobileResponsiveness(): Promise<void> {
    // Verify navigation is still accessible on mobile
    await expect(this.navigationMenu).toBeVisible();
    
    // Verify hero content is visible on mobile
    await expect(this.heroTitle).toBeVisible();
    await expect(this.ctaButton).toBeVisible();
    
    // Verify text is readable (not too small)
    const heroTitleBox = await this.heroTitle.boundingBox();
    expect(heroTitleBox?.height).toBeGreaterThan(20); // Minimum readable height
  }

  /**
   * Verify page performance basics
   */
  async verifyPerformance(): Promise<void> {
    // Check that images are loaded
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Verify at least the first image loads
      await expect(images.first()).toHaveAttribute('src', /.+/);
    }
    
    // Verify no console errors
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any console errors
    await this.page.waitForTimeout(2000);
    
    // We'll allow some errors but not critical ones
    const criticalErrors = errors.filter(error => 
      error.includes('404') || 
      error.includes('500') || 
      error.includes('network error')
    );
    
    expect(criticalErrors).toHaveLength(0);
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verify SEO basics
   */
  async verifySEOBasics(): Promise<void> {
    // Check title
    const title = await this.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70);
    
    // Check meta description
    const metaDescription = await this.page.getAttribute('meta[name="description"]', 'content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
      expect(metaDescription.length).toBeLessThan(160);
    }
    
    // Check H1 tag
    await expect(this.heroTitle).toBeVisible();
    
    // Verify structured content hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  }
} 