#!/usr/bin/env tsx

/**
 * Test Coupons CLI
 * 
 * Usage:
 *   npm run test:coupons                    Show all test coupons
 *   npm run test:coupons -- --validate BETATEST100 100
 *   npm run test:coupons -- --reset
 *   npm run test:coupons -- --report
 */

import { testCouponManager } from '../src/registration/implementations/TestCouponManager.js';

class TestCouponsCLI {
  
  async showAllCoupons(): Promise<void> {
    console.log('🎫 Available Test Coupons:\n');
    
    const coupons = await testCouponManager.getAllCoupons();
    
    for (const coupon of coupons) {
      const discountText = coupon.discountType === 'percentage' 
        ? `${coupon.discountValue}% off`
        : `$${coupon.discountValue} off`;
      
      const statusIcon = coupon.isActive ? '✅' : '❌';
      const usagePercent = ((coupon.usedCount || 0) / (coupon.usageLimit || 1) * 100).toFixed(1);
      
      console.log(`${statusIcon} ${coupon.code}`);
      console.log(`   Discount: ${discountText}`);
      console.log(`   Usage: ${coupon.usedCount || 0}/${coupon.usageLimit || 0} (${usagePercent}%)`);
      console.log(`   Expires: ${coupon.expiryDate?.toLocaleDateString()}`);
      console.log(`   Description: ${coupon.description}`);
      console.log('');
    }
  }

  async validateCoupon(code: string, amount: number): Promise<void> {
    console.log(`🔍 Validating coupon: ${code} with amount: $${amount}\n`);
    
    try {
      const validation = await testCouponManager.validateCoupon(code, amount);
      
      if (validation.isValid) {
        console.log('✅ Coupon is VALID');
        console.log(`   Code: ${validation.couponCode}`);
        console.log(`   Type: ${validation.discountType}`);
        console.log(`   Value: ${validation.discountValue}${validation.discountType === 'percentage' ? '%' : '$'}`);
        console.log(`   Discount Amount: $${validation.discountAmount?.toFixed(2)}`);
        console.log(`   Usage: ${validation.usageCount}/${validation.usageLimit}`);
        console.log(`   Expires: ${validation.expiryDate?.toLocaleDateString()}`);
      } else {
        console.log('❌ Coupon is INVALID');
        console.log(`   Error: ${validation.errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error validating coupon:', error);
    }
  }

  async applyCoupon(code: string, bookingId: string = 'test-booking-123'): Promise<void> {
    console.log(`🎯 Applying coupon: ${code} to booking: ${bookingId}\n`);
    
    try {
      const usage = await testCouponManager.applyCoupon(code, bookingId);
      
      console.log('✅ Coupon applied successfully');
      console.log(`   Coupon: ${usage.couponCode}`);
      console.log(`   Booking: ${usage.bookingId}`);
      console.log(`   Discount: $${usage.discountAmount}`);
      console.log(`   Applied at: ${usage.usedAt.toLocaleString()}`);
      
    } catch (error) {
      console.error('❌ Error applying coupon:', error);
    }
  }

  async resetCoupons(specific?: string): Promise<void> {
    if (specific) {
      console.log(`🔄 Resetting usage for coupon: ${specific}`);
      testCouponManager.resetTestCouponUsage(specific);
    } else {
      console.log('🔄 Resetting usage for all test coupons');
      testCouponManager.resetTestCouponUsage();
    }
    
    console.log('✅ Reset complete');
  }

  async generateReport(): Promise<void> {
    console.log('📊 Generating test coupon report...\n');
    
    const report = testCouponManager.generateTestCouponReport();
    console.log(report);
  }

  async testCouponFlow(): Promise<void> {
    console.log('🧪 Running complete coupon test flow...\n');
    
    const testCases = [
      { code: 'BETATEST100', amount: 199 },
      { code: 'TESTFREE50', amount: 99 },
      { code: 'ADMINTEST25', amount: 50 },
      { code: 'INVALID', amount: 100 }
    ];
    
    for (const testCase of testCases) {
      console.log(`Testing ${testCase.code} with $${testCase.amount}:`);
      
      const validation = await testCouponManager.validateCoupon(testCase.code, testCase.amount);
      
      if (validation.isValid) {
        console.log(`   ✅ Valid - Discount: $${validation.discountAmount?.toFixed(2)}`);
        
        // Apply the coupon
        try {
          await testCouponManager.applyCoupon(testCase.code, `test-${Date.now()}`);
          console.log(`   ✅ Applied successfully`);
        } catch (error) {
          console.log(`   ❌ Failed to apply: ${error}`);
        }
      } else {
        console.log(`   ❌ Invalid - ${validation.errorMessage}`);
      }
      
      console.log('');
    }
  }

  showHelp(): void {
    console.log(`
🎫 YOLOVibe Test Coupons CLI

Usage:
  npm run test:coupons                                    Show all test coupons
  npm run test:coupons -- --validate CODE AMOUNT         Validate a coupon
  npm run test:coupons -- --apply CODE [BOOKING_ID]      Apply a coupon
  npm run test:coupons -- --reset [CODE]                 Reset coupon usage
  npm run test:coupons -- --report                       Generate usage report
  npm run test:coupons -- --test-flow                    Run complete test flow
  npm run test:coupons -- --help                         Show this help

Examples:
  npm run test:coupons -- --validate BETATEST100 199
  npm run test:coupons -- --apply TESTFREE50
  npm run test:coupons -- --reset BETATEST100
  npm run test:coupons -- --reset
  npm run test:coupons -- --report
  npm run test:coupons -- --test-flow

Available Test Coupons:
  BETATEST100  - 100% off any workshop (Primary testing coupon)
  TESTFREE50   - 50% off + free materials (Backup testing coupon)  
  ADMINTEST25  - $25 off (Admin testing coupon)
    `);
  }
}

// Main CLI execution
async function main() {
  const cli = new TestCouponsCLI();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await cli.showAllCoupons();
    return;
  }

  if (args.includes('--help')) {
    cli.showHelp();
    return;
  }

  if (args.includes('--report')) {
    await cli.generateReport();
    return;
  }

  if (args.includes('--test-flow')) {
    await cli.testCouponFlow();
    return;
  }

  const validateIndex = args.indexOf('--validate');
  if (validateIndex !== -1) {
    const code = args[validateIndex + 1];
    const amount = parseFloat(args[validateIndex + 2]);
    
    if (!code || isNaN(amount)) {
      console.error('❌ Both code and amount are required for --validate');
      return;
    }
    
    await cli.validateCoupon(code, amount);
    return;
  }

  const applyIndex = args.indexOf('--apply');
  if (applyIndex !== -1) {
    const code = args[applyIndex + 1];
    const bookingId = args[applyIndex + 2];
    
    if (!code) {
      console.error('❌ Coupon code is required for --apply');
      return;
    }
    
    await cli.applyCoupon(code, bookingId);
    return;
  }

  const resetIndex = args.indexOf('--reset');
  if (resetIndex !== -1) {
    const code = args[resetIndex + 1];
    await cli.resetCoupons(code);
    return;
  }

  console.error('❌ Invalid arguments. Use --help for usage information.');
}

// Run the CLI
main().catch(console.error); 