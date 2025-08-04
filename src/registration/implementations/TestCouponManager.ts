/**
 * Test Coupon Manager
 * 
 * Manages special coupon codes for beta testing, allowing testers to 
 * complete the full booking process without actual charges.
 */

import type { ICouponManager } from '../core/interfaces/index.js';
import type { CouponValidation, CouponUsage } from '../core/types/index.js';

export interface TestCoupon {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  minimumAmount: number;
  isActive: boolean;
  description: string;
}

export class TestCouponManager implements ICouponManager {
  private testCoupons: Map<string, TestCoupon> = new Map();

  constructor() {
    this.initializeTestCoupons();
  }

  private initializeTestCoupons(): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days

    // Primary beta testing coupon - 100% off
    this.testCoupons.set('BETATEST100', {
      code: 'BETATEST100',
      discountType: 'percentage',
      discountValue: 100,
      expiryDate,
      usageLimit: 100,
      usedCount: 0,
      minimumAmount: 0,
      isActive: true,
      description: '100% off any workshop - Beta testing coupon'
    });

    // Backup testing coupon - 50% off
    this.testCoupons.set('TESTFREE50', {
      code: 'TESTFREE50',
      discountType: 'percentage',
      discountValue: 50,
      expiryDate,
      usageLimit: 100,
      usedCount: 0,
      minimumAmount: 0,
      isActive: true,
      description: '50% off + free materials - Backup testing coupon'
    });

    // Admin testing coupon - Fixed amount off
    this.testCoupons.set('ADMINTEST25', {
      code: 'ADMINTEST25',
      discountType: 'fixed_amount',
      discountValue: 25,
      expiryDate,
      usageLimit: 50,
      usedCount: 0,
      minimumAmount: 0,
      isActive: true,
      description: '$25 off - Admin testing coupon'
    });
  }

  async validateCoupon(couponCode: string, bookingAmount: number): Promise<CouponValidation> {
    const coupon = this.testCoupons.get(couponCode.toUpperCase());
    
    if (!coupon) {
      return {
        isValid: false,
        errorMessage: 'Coupon code not found'
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        errorMessage: 'This coupon is no longer active'
      };
    }

    if (new Date() > coupon.expiryDate) {
      return {
        isValid: false,
        errorMessage: 'This coupon has expired'
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        errorMessage: 'This coupon has reached its usage limit'
      };
    }

    if (bookingAmount < coupon.minimumAmount) {
      return {
        isValid: false,
        errorMessage: `Minimum order amount of $${coupon.minimumAmount} required`
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (bookingAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, bookingAmount);
    }

    return {
      isValid: true,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usedCount
    };
  }

  async applyCoupon(couponCode: string, bookingId: string): Promise<CouponUsage> {
    const coupon = this.testCoupons.get(couponCode.toUpperCase());
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Increment usage count
    coupon.usedCount += 1;
    
    // Calculate discount amount (simplified for test)
    const discountAmount = coupon.discountType === 'percentage' 
      ? 100 // Assume $100 base for percentage calculation
      : coupon.discountValue;

    const usage: CouponUsage = {
      couponCode: coupon.code,
      bookingId,
      discountAmount,
      usedAt: new Date()
    };
    
    console.log(`Test coupon ${couponCode} applied to booking ${bookingId}`);
    
    return usage;
  }

  async createCoupon(coupon: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    expiryDate?: Date;
    usageLimit?: number;
    minimumAmount?: number;
  }): Promise<void> {
    const newCoupon: TestCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: coupon.usageLimit || 100,
      usedCount: 0,
      minimumAmount: coupon.minimumAmount || 0,
      isActive: true,
      description: `Test coupon: ${coupon.code}`
    };

    this.testCoupons.set(coupon.code.toUpperCase(), newCoupon);
    console.log(`Test coupon created: ${coupon.code}`);
  }

  async deactivateCoupon(couponCode: string): Promise<void> {
    const coupon = this.testCoupons.get(couponCode.toUpperCase());
    if (coupon) {
      coupon.isActive = false;
      console.log(`Test coupon deactivated: ${couponCode}`);
    }
  }

  async getCouponUsage(couponCode: string): Promise<CouponUsage[]> {
    const coupon = this.testCoupons.get(couponCode.toUpperCase());
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Return mock usage data for testing
    const usage: CouponUsage = {
      couponCode: coupon.code,
      bookingId: 'test-booking-123',
      discountAmount: coupon.discountValue,
      usedAt: new Date()
    };

    return [usage];
  }

  async getAllCoupons(): Promise<any[]> {
    return Array.from(this.testCoupons.values()).map(coupon => ({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      description: coupon.description
    }));
  }

  // Test-specific utility methods
  getTestCouponStats(): { code: string; used: number; limit: number; remaining: number }[] {
    return Array.from(this.testCoupons.entries()).map(([code, coupon]) => ({
      code,
      used: coupon.usedCount,
      limit: coupon.usageLimit,
      remaining: coupon.usageLimit - coupon.usedCount
    }));
  }

  resetTestCouponUsage(code?: string): void {
    if (code) {
      const coupon = this.testCoupons.get(code.toUpperCase());
      if (coupon) {
        coupon.usedCount = 0;
        console.log(`Reset usage count for test coupon: ${code}`);
      }
    } else {
      for (const coupon of this.testCoupons.values()) {
        coupon.usedCount = 0;
      }
      console.log('Reset usage count for all test coupons');
    }
  }

  generateTestCouponReport(): string {
    const stats = this.getTestCouponStats();
    const report = [
      '=== TEST COUPON USAGE REPORT ===',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Coupon Usage Statistics:',
      ...stats.map(stat => 
        `${stat.code}: ${stat.used}/${stat.limit} used (${stat.remaining} remaining)`
      ),
      '',
      'Active Test Coupons:',
      ...Array.from(this.testCoupons.values()).map(coupon => 
        `${coupon.code}: ${coupon.description} (${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue} off)`
      )
    ];
    
    return report.join('\n');
  }
}

// Export singleton instance for use throughout the application
export const testCouponManager = new TestCouponManager(); 