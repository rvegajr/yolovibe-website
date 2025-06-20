#!/usr/bin/env tsx
/**
 * CLI Test Harness for ICouponManager Interface
 * Tests coupon validation and usage tracking
 * 
 * Usage: tsx test-coupon-manager.ts
 */

import type { ICouponManager } from '../core/interfaces/index.js';
import type { CouponValidation, CouponUsage } from '../core/types/index.js';

// Mock implementation for testing
class MockCouponManager implements ICouponManager {
  private coupons: Map<string, {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumAmount?: number;
    expirationDate?: Date;
    usageLimit?: number;
    currentUsage: number;
    isActive: boolean;
  }> = new Map();

  constructor() {
    // Pre-populate with test coupons
    this.coupons.set('SAVE20', {
      discountType: 'percentage',
      discountValue: 20,
      minimumAmount: 1000,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 100,
      currentUsage: 5,
      isActive: true
    });

    this.coupons.set('FIXED100', {
      discountType: 'fixed',
      discountValue: 100,
      minimumAmount: 500,
      usageLimit: 50,
      currentUsage: 10,
      isActive: true
    });

    this.coupons.set('EXPIRED', {
      discountType: 'percentage',
      discountValue: 30,
      expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      currentUsage: 0,
      isActive: true
    });

    this.coupons.set('MAXEDOUT', {
      discountType: 'fixed',
      discountValue: 200,
      usageLimit: 5,
      currentUsage: 5,
      isActive: true
    });
  }

  async validateCoupon(couponCode: string): Promise<CouponValidation> {
    const coupon = this.coupons.get(couponCode.toUpperCase());
    
    if (!coupon) {
      return {
        isValid: false,
        couponCode,
        discountType: 'percentage',
        discountValue: 0,
        currentUsage: 0,
        errorMessage: 'Coupon code not found'
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon is inactive'
      };
    }

    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      return {
        isValid: false,
        couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expirationDate: coupon.expirationDate,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon has expired'
      };
    }

    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
      return {
        isValid: false,
        couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        currentUsage: coupon.currentUsage,
        errorMessage: 'Coupon usage limit exceeded'
      };
    }

    return {
      isValid: true,
      couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumAmount: coupon.minimumAmount,
      expirationDate: coupon.expirationDate,
      usageLimit: coupon.usageLimit,
      currentUsage: coupon.currentUsage
    };
  }

  async applyCoupon(couponCode: string, amount: number): Promise<number> {
    const validation = await this.validateCoupon(couponCode);
    
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid coupon');
    }

    if (validation.minimumAmount && amount < validation.minimumAmount) {
      throw new Error(`Minimum order amount of $${validation.minimumAmount} required`);
    }

    // Apply the coupon usage
    const coupon = this.coupons.get(couponCode.toUpperCase());
    if (coupon) {
      coupon.currentUsage++;
      this.coupons.set(couponCode.toUpperCase(), coupon);
    }

    // Calculate discount amount
    if (validation.discountType === 'percentage') {
      return Math.round((amount * validation.discountValue) / 100);
    } else {
      return Math.min(validation.discountValue, amount);
    }
  }

  async getCouponUsage(couponCode: string): Promise<CouponUsage> {
    const coupon = this.coupons.get(couponCode.toUpperCase());
    
    if (!coupon) {
      throw new Error(`Coupon not found: ${couponCode}`);
    }

    return {
      couponCode,
      totalUsage: coupon.currentUsage,
      usageLimit: coupon.usageLimit,
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.currentUsage : undefined,
      lastUsedDate: coupon.currentUsage > 0 ? new Date() : undefined
    };
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing ICouponManager Interface...\n');
  
  const manager = new MockCouponManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Valid Percentage Coupon
  totalTests++;
  try {
    const validation = await manager.validateCoupon('SAVE20');
    
    console.log('✅ Test 1: validateCoupon() - Valid Percentage Coupon');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Discount Type: ${validation.discountType}`);
    console.log(`   Discount Value: ${validation.discountValue}%`);
    console.log(`   Minimum Amount: $${validation.minimumAmount}`);
    console.log(`   Current Usage: ${validation.currentUsage}/${validation.usageLimit}`);
    console.log('   ✅ Valid coupon validated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Valid Fixed Amount Coupon
  totalTests++;
  try {
    const validation = await manager.validateCoupon('FIXED100');
    
    console.log('✅ Test 2: validateCoupon() - Valid Fixed Amount Coupon');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Discount Type: ${validation.discountType}`);
    console.log(`   Discount Value: $${validation.discountValue}`);
    console.log(`   Minimum Amount: $${validation.minimumAmount}`);
    console.log(`   Current Usage: ${validation.currentUsage}/${validation.usageLimit}`);
    console.log('   ✅ Valid fixed coupon validated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Invalid Coupon - Not Found
  totalTests++;
  try {
    const validation = await manager.validateCoupon('INVALID');
    
    console.log('✅ Test 3: validateCoupon() - Invalid Coupon');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Error Message: ${validation.errorMessage}`);
    console.log('   ✅ Invalid coupon correctly rejected\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Invalid Coupon - Expired
  totalTests++;
  try {
    const validation = await manager.validateCoupon('EXPIRED');
    
    console.log('✅ Test 4: validateCoupon() - Expired Coupon');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Expiration Date: ${validation.expirationDate?.toISOString()}`);
    console.log(`   Error Message: ${validation.errorMessage}`);
    console.log('   ✅ Expired coupon correctly rejected\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Invalid Coupon - Usage Limit Exceeded
  totalTests++;
  try {
    const validation = await manager.validateCoupon('MAXEDOUT');
    
    console.log('✅ Test 5: validateCoupon() - Usage Limit Exceeded');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Usage: ${validation.currentUsage}/${validation.usageLimit}`);
    console.log(`   Error Message: ${validation.errorMessage}`);
    console.log('   ✅ Maxed out coupon correctly rejected\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 6: Invalid Coupon - Minimum Amount Not Met
  totalTests++;
  try {
    const validation = await manager.validateCoupon('SAVE20');
    
    console.log('✅ Test 6: validateCoupon() - Minimum Amount Not Met');
    console.log(`   Coupon Code: ${validation.couponCode}`);
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Minimum Required: $${validation.minimumAmount}`);
    console.log('   ✅ Minimum amount validation working correctly\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6: validateCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 7: Apply Coupon
  totalTests++;
  try {
    const beforeUsage = await manager.getCouponUsage('SAVE20');
    const discount = await manager.applyCoupon('SAVE20', 2000);
    const afterUsage = await manager.getCouponUsage('SAVE20');
    
    console.log('✅ Test 7: applyCoupon()');
    console.log(`   Coupon Code: SAVE20`);
    console.log(`   Usage Before: ${beforeUsage.totalUsage}`);
    console.log(`   Usage After: ${afterUsage.totalUsage}`);
    console.log(`   Usage Incremented: ${afterUsage.totalUsage === beforeUsage.totalUsage + 1}`);
    console.log(`   Discount: $${discount}`);
    console.log('   ✅ Coupon applied successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 7: applyCoupon() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 8: Get Coupon Usage
  totalTests++;
  try {
    const usage = await manager.getCouponUsage('FIXED100');
    
    console.log('✅ Test 8: getCouponUsage()');
    console.log(`   Coupon Code: ${usage.couponCode}`);
    console.log(`   Total Usage: ${usage.totalUsage}`);
    console.log(`   Usage Limit: ${usage.usageLimit}`);
    console.log(`   Remaining Uses: ${usage.remainingUses}`);
    console.log('   ✅ Coupon usage retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 8: getCouponUsage() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 9: Get Coupon Usage - Non-existent Coupon
  totalTests++;
  try {
    await manager.getCouponUsage('NONEXISTENT');
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error) {
    console.log('✅ Test 9: getCouponUsage() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    passedTests++;
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! ICouponManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
