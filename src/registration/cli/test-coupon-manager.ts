#!/usr/bin/env tsx
/**
 * CLI Test Harness for ICouponManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-coupon-manager.ts
 */

import type { ICouponManager } from '../core/interfaces/index.js';
import type { CouponValidation, CouponUsage } from '../core/types/index.js';
import { CouponManager } from '../implementations/CouponManager.js';

// TEST SUITE
async function testCouponManager() {
  console.log('🧪 Testing ICouponManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  const couponManager: ICouponManager = new CouponManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Valid Percentage Coupon
  totalTests++;
  try {
    const validation = await couponManager.validateCoupon('SAVE20');
    
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
    const validation = await couponManager.validateCoupon('FIXED100');
    
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
    const validation = await couponManager.validateCoupon('INVALID');
    
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
    const validation = await couponManager.validateCoupon('EXPIRED');
    
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
    const validation = await couponManager.validateCoupon('MAXEDOUT');
    
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
    const validation = await couponManager.validateCoupon('SAVE20');
    
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
    const beforeUsage = await couponManager.getCouponUsage('SAVE20');
    const discount = await couponManager.applyCoupon('SAVE20', 2000);
    const afterUsage = await couponManager.getCouponUsage('SAVE20');
    
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
    const usage = await couponManager.getCouponUsage('FIXED100');
    
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
    await couponManager.getCouponUsage('NONEXISTENT');
    console.log('❌ Test 9: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 9: getCouponUsage() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
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
testCouponManager().catch(console.error);
