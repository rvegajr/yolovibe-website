/**
 * CouponManager - Concrete Implementation
 * Discount and coupon system management
 * Simple, focused implementation - no over-engineering!
 */

import type { ICouponManager } from '../core/interfaces/index.js';
import type { CouponValidation, CouponUsage } from '../core/types/index.js';

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  expirationDate?: Date;
  usageLimit?: number;
  currentUsage: number;
  isActive: boolean;
}

export class CouponManager implements ICouponManager {
  private coupons: Map<string, Coupon> = new Map();

  constructor() {
    // Pre-populate with test coupons for consistency with CLI tests
    this.coupons.set('SAVE20', {
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minimumAmount: 1000,
      expirationDate: new Date('2025-12-31'),
      usageLimit: 100,
      currentUsage: 5,
      isActive: true
    });

    this.coupons.set('FIXED100', {
      code: 'FIXED100',
      discountType: 'fixed',
      discountValue: 100,
      minimumAmount: 500,
      expirationDate: new Date('2025-12-31'),
      usageLimit: 50,
      currentUsage: 10,
      isActive: true
    });

    this.coupons.set('EXPIRED', {
      code: 'EXPIRED',
      discountType: 'percentage',
      discountValue: 15,
      minimumAmount: 500,
      expirationDate: new Date('2025-06-19'), // Expired
      usageLimit: 25,
      currentUsage: 3,
      isActive: true
    });

    this.coupons.set('MAXEDOUT', {
      code: 'MAXEDOUT',
      discountType: 'fixed',
      discountValue: 50,
      minimumAmount: 200,
      expirationDate: new Date('2025-12-31'),
      usageLimit: 5,
      currentUsage: 5, // At limit
      isActive: true
    });
  }

  async validateCoupon(code: string): Promise<CouponValidation> {
    const coupon = this.coupons.get(code.toUpperCase());
    
    if (!coupon) {
      return {
        isValid: false,
        couponCode: code,
        discountType: 'percentage',
        discountValue: 0,
        currentUsage: 0,
        errorMessage: 'Coupon code not found'
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        couponCode: code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon is inactive'
      };
    }

    // Check expiration
    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      return {
        isValid: false,
        couponCode: code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expirationDate: coupon.expirationDate,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon has expired'
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
      return {
        isValid: false,
        couponCode: code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon usage limit exceeded'
      };
    }

    // Valid coupon
    return {
      isValid: true,
      couponCode: code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumAmount: coupon.minimumAmount,
      expirationDate: coupon.expirationDate,
      usageLimit: coupon.usageLimit,
      currentUsage: coupon.currentUsage
    };
  }

  async applyCoupon(code: string, amount: number): Promise<number> {
    const validation = await this.validateCoupon(code);
    
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid coupon');
    }

    // Check minimum amount requirement
    if (validation.minimumAmount && amount < validation.minimumAmount) {
      throw new Error(`Minimum order amount of $${validation.minimumAmount} required`);
    }

    const coupon = this.coupons.get(code.toUpperCase())!;
    
    // Calculate discount
    let discount = 0;
    if (validation.discountType === 'percentage') {
      discount = Math.round((amount * validation.discountValue) / 100);
    } else {
      discount = validation.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, amount);

    // Increment usage count
    coupon.currentUsage++;
    this.coupons.set(code.toUpperCase(), coupon);

    return discount;
  }

  async getCouponUsage(code: string): Promise<CouponUsage> {
    const coupon = this.coupons.get(code.toUpperCase());
    
    if (!coupon) {
      throw new Error(`Coupon not found: ${code}`);
    }

    return {
      couponCode: code,
      totalUsage: coupon.currentUsage,
      usageLimit: coupon.usageLimit,
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.currentUsage : undefined
    };
  }
}
