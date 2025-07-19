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
  readonly aboutLink: Locator;
  readonly pricingLink: Locator;
  readonly bookLink: Locator;
  readonly contactLink: Locator;
  readonly featuresSection: Locator;
  readonly workshopOfferingsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Hero section elements
    this.heroSection = page.locator('[data-testid="hero-section"], .hero, section:first-child');
    this.heroTitle = page.locator('h1').first();
    this.heroSubtitle = page.locator('[data-testid="hero-subtitle"], .hero p, h1 + p').first();
    this.ctaButton = page.locator('[data-testid="cta-button"], .cta-button, a[href*="book"]').first();
    
    // Navigation elements
    this.navigationMenu = page.locator('nav, [data-testid="navigation"]');
    this.aboutLink = page.locator('a[href="/about"], nav a:has-text("About")');
    this.pricingLink = page.locator('a[href="/pricing"], nav a:has-text("Pricing")');
    this.bookLink = page.locator('a[href="/book"], nav a:has-text("Book")');
    this.contactLink = page.locator('a[href="/contact"], nav a:has-text("Contact")');
    
    // Content sections
    this.featuresSection = page.locator('[data-testid="features"], .features, section:has-text("Features")');
    this.workshopOfferingsSection = page.locator('[data-testid="workshop-offerings"], .workshop-offerings, section:has-text("Workshop")');
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
    await expect(this.aboutLink).toBeVisible();
    await expect(this.pricingLink).toBeVisible();
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
    await this.page.waitForURL('**/book**');
  }

  /**
   * Navigate to pricing page
   */
  async goToPricing(): Promise<void> {
    await this.pricingLink.click();
    await this.page.waitForURL('**/pricing**');
  }

  /**
   * Navigate to about page
   */
  async goToAbout(): Promise<void> {
    await this.aboutLink.click();
    await this.page.waitForURL('**/about**');
  }

  /**
   * Navigate to contact page
   */
  async goToContact(): Promise<void> {
    await this.contactLink.click();
    await this.page.waitForURL('**/contact**');
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