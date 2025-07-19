import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { TEST_CONFIG } from '../utils/test-data';

/**
 * Admin Page Object Model
 * Handles all admin functionality testing
 */
export class AdminPage {
  readonly page: Page;
  
  // Navigation
  readonly adminNavigation: Locator;
  readonly calendarTab: Locator;
  readonly dashboardTab: Locator;
  readonly workshopsTab: Locator;
  readonly couponsTab: Locator;
  readonly reportsTab: Locator;
  
  // Calendar Management
  readonly calendarSection: Locator;
  readonly blockTodayButton: Locator;
  readonly blockTomorrowButton: Locator;
  readonly blockWeekendButton: Locator;
  readonly customDatePicker: Locator;
  readonly blockReasonInput: Locator;
  readonly blockDateButton: Locator;
  readonly blockedDatesList: Locator;
  readonly unblockButtons: Locator;
  
  // Workshop Management
  readonly workshopsList: Locator;
  readonly workshopCapacityInputs: Locator;
  readonly attendeesList: Locator;
  readonly addAttendeeButton: Locator;
  readonly removeAttendeeButtons: Locator;
  
  // Coupon Management
  readonly couponsList: Locator;
  readonly createCouponButton: Locator;
  readonly couponCodeInput: Locator;
  readonly couponDiscountInput: Locator;
  readonly couponUsageLimitInput: Locator;
  readonly couponExpiryInput: Locator;
  readonly saveCouponButton: Locator;
  readonly deleteCouponButtons: Locator;
  
  // Dashboard & Reports
  readonly dashboardMetrics: Locator;
  readonly totalRevenueMetric: Locator;
  readonly totalBookingsMetric: Locator;
  readonly upcomingWorkshopsMetric: Locator;
  readonly revenueChart: Locator;
  readonly bookingsChart: Locator;
  readonly exportReportButton: Locator;
  
  // User Management
  readonly usersList: Locator;
  readonly userSearchInput: Locator;
  readonly userDetailsModal: Locator;
  readonly editUserButton: Locator;
  readonly deleteUserButton: Locator;
  
  // Authentication
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;
  readonly loginErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.adminNavigation = page.locator('[data-testid="admin-navigation"], .admin-nav');
    this.calendarTab = page.locator('[data-testid="calendar-tab"], a[href*="calendar"]');
    this.dashboardTab = page.locator('[data-testid="dashboard-tab"], a[href*="dashboard"]');
    this.workshopsTab = page.locator('[data-testid="workshops-tab"], a[href*="workshops"]');
    this.couponsTab = page.locator('[data-testid="coupons-tab"], a[href*="coupons"]');
    this.reportsTab = page.locator('[data-testid="reports-tab"], a[href*="reports"]');
    
    // Calendar Management
    this.calendarSection = page.locator('[data-testid="calendar-section"], .calendar-management');
    this.blockTodayButton = page.locator('[data-testid="block-today"], button:has-text("Block Today")');
    this.blockTomorrowButton = page.locator('[data-testid="block-tomorrow"], button:has-text("Block Tomorrow")');
    this.blockWeekendButton = page.locator('[data-testid="block-weekend"], button:has-text("Block Weekend")');
    this.customDatePicker = page.locator('[data-testid="custom-date"], input[type="date"]');
    this.blockReasonInput = page.locator('[data-testid="block-reason"], input[name*="reason"], textarea[name*="reason"]');
    this.blockDateButton = page.locator('[data-testid="block-date"], button:has-text("Block Date")');
    this.blockedDatesList = page.locator('[data-testid="blocked-dates"], .blocked-dates-list');
    this.unblockButtons = page.locator('[data-testid="unblock"], button:has-text("Unblock")');
    
    // Workshop Management
    this.workshopsList = page.locator('[data-testid="workshops-list"], .workshops-list');
    this.workshopCapacityInputs = page.locator('[data-testid="capacity-input"], input[name*="capacity"]');
    this.attendeesList = page.locator('[data-testid="attendees-list"], .attendees-list');
    this.addAttendeeButton = page.locator('[data-testid="add-attendee"], button:has-text("Add Attendee")');
    this.removeAttendeeButtons = page.locator('[data-testid="remove-attendee"], button:has-text("Remove")');
    
    // Coupon Management
    this.couponsList = page.locator('[data-testid="coupons-list"], .coupons-list');
    this.createCouponButton = page.locator('[data-testid="create-coupon"], button:has-text("Create Coupon")');
    this.couponCodeInput = page.locator('[data-testid="coupon-code"], input[name*="code"]');
    this.couponDiscountInput = page.locator('[data-testid="coupon-discount"], input[name*="discount"]');
    this.couponUsageLimitInput = page.locator('[data-testid="coupon-usage"], input[name*="usage"]');
    this.couponExpiryInput = page.locator('[data-testid="coupon-expiry"], input[name*="expiry"]');
    this.saveCouponButton = page.locator('[data-testid="save-coupon"], button:has-text("Save")');
    this.deleteCouponButtons = page.locator('[data-testid="delete-coupon"], button:has-text("Delete")');
    
    // Dashboard & Reports
    this.dashboardMetrics = page.locator('[data-testid="dashboard-metrics"], .dashboard-metrics');
    this.totalRevenueMetric = page.locator('[data-testid="total-revenue"], .metric-revenue');
    this.totalBookingsMetric = page.locator('[data-testid="total-bookings"], .metric-bookings');
    this.upcomingWorkshopsMetric = page.locator('[data-testid="upcoming-workshops"], .metric-workshops');
    this.revenueChart = page.locator('[data-testid="revenue-chart"], .revenue-chart');
    this.bookingsChart = page.locator('[data-testid="bookings-chart"], .bookings-chart');
    this.exportReportButton = page.locator('[data-testid="export-report"], button:has-text("Export")');
    
    // User Management
    this.usersList = page.locator('[data-testid="users-list"], .users-list');
    this.userSearchInput = page.locator('[data-testid="user-search"], input[name*="search"]');
    this.userDetailsModal = page.locator('[data-testid="user-details"], .user-details-modal');
    this.editUserButton = page.locator('[data-testid="edit-user"], button:has-text("Edit")');
    this.deleteUserButton = page.locator('[data-testid="delete-user"], button:has-text("Delete")');
    
    // Authentication
    this.loginForm = page.locator('[data-testid="admin-login"], .admin-login-form');
    this.usernameInput = page.locator('[data-testid="username"], input[name="username"], input[name="email"]');
    this.passwordInput = page.locator('[data-testid="password"], input[name="password"]');
    this.loginButton = page.locator('[data-testid="login-submit"], button[type="submit"]');
    this.logoutButton = page.locator('[data-testid="logout"], button:has-text("Logout")');
    this.loginErrorMessage = page.locator('[data-testid="login-error"], .error-message');
  }

  /**
   * Navigate to admin login page
   */
  async gotoLogin(): Promise<void> {
    await this.page.goto('/admin/login');
    await this.page.waitForLoadState('networkidle');
    await expect(this.loginForm).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Navigate to admin dashboard
   */
  async gotoDashboard(): Promise<void> {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to admin calendar
   */
  async gotoCalendar(): Promise<void> {
    await this.page.goto('/admin/calendar');
    await this.page.waitForLoadState('networkidle');
    await expect(this.calendarSection).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(username: string = 'admin@yolovibe.test', password: string = 'AdminPassword123!'): Promise<void> {
    await this.gotoLogin();
    
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/admin**');
    await expect(this.logoutButton).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.MEDIUM });
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL('**/admin/login**');
  }

  /**
   * Block today's date
   */
  async blockToday(reason: string = 'E2E Test Block'): Promise<void> {
    await this.gotoCalendar();
    await this.blockTodayButton.click();
    
    // Fill reason if modal appears
    if (await this.blockReasonInput.isVisible()) {
      await this.blockReasonInput.fill(reason);
      await this.blockDateButton.click();
    }
    
    // Wait for confirmation
    await this.page.waitForTimeout(1000);
  }

  /**
   * Block a custom date
   */
  async blockCustomDate(date: Date, reason: string = 'E2E Test Block'): Promise<void> {
    await this.gotoCalendar();
    
    const dateString = date.toISOString().split('T')[0];
    await this.customDatePicker.fill(dateString);
    await this.blockReasonInput.fill(reason);
    await this.blockDateButton.click();
    
    // Wait for confirmation
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify a date is blocked
   */
  async verifyDateBlocked(date: Date): Promise<void> {
    await this.gotoCalendar();
    
    const dateString = date.toDateString();
    await expect(this.blockedDatesList).toContainText(dateString);
  }

  /**
   * Unblock a date
   */
  async unblockDate(date: Date): Promise<void> {
    await this.gotoCalendar();
    
    const dateString = date.toDateString();
    const unblockButton = this.page.locator(`[data-testid="unblock-${dateString}"], button:near(:text("${dateString}")):has-text("Unblock")`);
    
    if (await unblockButton.isVisible()) {
      await unblockButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Create a new coupon
   */
  async createCoupon(code: string, discount: number, usageLimit: number = 100): Promise<void> {
    await this.page.goto('/admin/coupons');
    await this.page.waitForLoadState('networkidle');
    
    await this.createCouponButton.click();
    await this.couponCodeInput.fill(code);
    await this.couponDiscountInput.fill(discount.toString());
    await this.couponUsageLimitInput.fill(usageLimit.toString());
    
    // Set expiry to 1 year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    await this.couponExpiryInput.fill(expiryDate.toISOString().split('T')[0]);
    
    await this.saveCouponButton.click();
    
    // Wait for confirmation
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify coupon exists in admin list
   */
  async verifyCouponExists(code: string): Promise<void> {
    await this.page.goto('/admin/coupons');
    await this.page.waitForLoadState('networkidle');
    
    await expect(this.couponsList).toContainText(code);
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(code: string): Promise<void> {
    await this.page.goto('/admin/coupons');
    await this.page.waitForLoadState('networkidle');
    
    const deleteCouponButton = this.page.locator(`[data-testid="delete-${code}"], button:near(:text("${code}")):has-text("Delete")`);
    
    if (await deleteCouponButton.isVisible()) {
      await deleteCouponButton.click();
      
      // Confirm deletion if modal appears
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * View dashboard metrics
   */
  async verifyDashboardMetrics(): Promise<void> {
    await this.gotoDashboard();
    
    await expect(this.dashboardMetrics).toBeVisible();
    await expect(this.totalRevenueMetric).toBeVisible();
    await expect(this.totalBookingsMetric).toBeVisible();
    await expect(this.upcomingWorkshopsMetric).toBeVisible();
  }

  /**
   * Export reports
   */
  async exportReport(): Promise<void> {
    await this.page.goto('/admin/reports');
    await this.page.waitForLoadState('networkidle');
    
    // Set up download handler
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportReportButton.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/report.*\.(csv|xlsx|pdf)$/);
  }

  /**
   * Search for a user
   */
  async searchUser(email: string): Promise<void> {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
    
    await this.userSearchInput.fill(email);
    await this.page.waitForTimeout(1000); // Allow search to complete
    
    await expect(this.usersList).toContainText(email);
  }

  /**
   * Edit workshop capacity
   */
  async editWorkshopCapacity(workshopId: string, newCapacity: number): Promise<void> {
    await this.page.goto('/admin/workshops');
    await this.page.waitForLoadState('networkidle');
    
    const capacityInput = this.page.locator(`[data-testid="capacity-${workshopId}"], input[data-workshop="${workshopId}"]`);
    await capacityInput.fill(newCapacity.toString());
    
    // Save changes
    const saveButton = this.page.locator(`button:near(input[data-workshop="${workshopId}"]):has-text("Save")`);
    await saveButton.click();
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify admin is logged in
   */
  async verifyAdminLoggedIn(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await expect(this.adminNavigation).toBeVisible();
  }

  /**
   * Verify admin access is denied for non-admin users
   */
  async verifyAccessDenied(): Promise<void> {
    // Should be redirected to login or show access denied
    await expect(
      this.loginForm.or(this.page.locator(':has-text("Access Denied")'))
    ).toBeVisible();
  }
} 