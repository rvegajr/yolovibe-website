#!/usr/bin/env tsx

/**
 * Create Admin 100% Off Coupon
 * Creates a coupon with 100% discount and 5 uses for admin testing
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Coupon {
  code: string;
  description: string;
  discount_percentage: number;
  usage_limit: number;
  times_used: number;
  expires_at: string;
  is_active: boolean;
}

async function createAdminCoupon(): Promise<void> {
  console.log('🎫 Creating Admin 100% Off Coupon');
  console.log('='.repeat(50));

  try {
    // Connect to production database
    const db = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    // Generate coupon code
    const couponCode = 'ADMIN100OFF';
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months from now

    const coupon: Coupon = {
      code: couponCode,
      description: 'Admin 100% discount coupon - 5 uses available',
      discount_percentage: 100, // 100% off
      usage_limit: 5,
      times_used: 0,
      expires_at: expiryDate.toISOString(),
      is_active: true
    };

    console.log(`📝 Coupon Details:`);
    console.log(`   Code: ${coupon.code}`);
    console.log(`   Discount: ${coupon.discount_percentage}% off`);
    console.log(`   Max Uses: ${coupon.usage_limit}`);
    console.log(`   Expires: ${new Date(coupon.expires_at).toLocaleDateString()}`);

    // Check if coupon already exists
    const existingCoupon = await db.execute({
      sql: 'SELECT * FROM coupons WHERE code = ?',
      args: [coupon.code]
    });

    if (existingCoupon.rows.length > 0) {
      console.log(`⚠️  Coupon ${coupon.code} already exists. Updating...`);
      
      // Update existing coupon
      await db.execute({
        sql: `UPDATE coupons SET 
              description = ?, 
              discount_percentage = ?, 
              usage_limit = ?, 
              times_used = ?, 
              expires_at = ?, 
              is_active = ?, 
              updated_at = CURRENT_TIMESTAMP
              WHERE code = ?`,
        args: [
          coupon.description,
          coupon.discount_percentage,
          coupon.usage_limit,
          coupon.times_used,
          coupon.expires_at,
          coupon.is_active ? 1 : 0,
          coupon.code
        ]
      });

      console.log(`✅ Updated existing coupon: ${coupon.code}`);
    } else {
      // Insert new coupon
      await db.execute({
        sql: `INSERT INTO coupons (
                code, description, discount_percentage, usage_limit, times_used,
                expires_at, is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          coupon.code,
          coupon.description,
          coupon.discount_percentage,
          coupon.usage_limit,
          coupon.times_used,
          coupon.expires_at,
          coupon.is_active ? 1 : 0
        ]
      });

      console.log(`✅ Created new coupon: ${coupon.code}`);
    }

    // Verify coupon was created/updated
    const verifyResult = await db.execute({
      sql: 'SELECT * FROM coupons WHERE code = ?',
      args: [coupon.code]
    });

    if (verifyResult.rows.length > 0) {
      const savedCoupon = verifyResult.rows[0];
      console.log('\n🎉 Coupon Successfully Created/Updated!');
      console.log('='.repeat(50));
      console.log(`🎫 Coupon Code: ${savedCoupon.code}`);
      console.log(`💰 Discount: ${savedCoupon.discount_percentage}% off`);
      console.log(`📊 Uses Available: ${Number(savedCoupon.usage_limit) - Number(savedCoupon.times_used)}`);
      console.log(`📅 Expires: ${new Date(savedCoupon.expires_at as string).toLocaleDateString()}`);
      console.log(`✅ Status: ${savedCoupon.is_active ? 'Active' : 'Inactive'}`);
      
      console.log('\n🚀 Usage Instructions:');
      console.log('='.repeat(50));
      console.log(`1. Go to your production site`);
      console.log(`2. Select any workshop or consulting option`);
      console.log(`3. Enter coupon code: ${coupon.code}`);
      console.log(`4. Enjoy 100% off! (5 uses available)`);
      
      console.log('\n📋 Test Scenarios:');
      console.log(`• 3-Day Workshop ($3,000) → FREE with ${coupon.code}`);
      console.log(`• 5-Day Workshop ($4,500) → FREE with ${coupon.code}`);
      console.log(`• Consulting Hours ($150/hr) → FREE with ${coupon.code}`);
    } else {
      console.error('❌ Failed to verify coupon creation');
    }

  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    process.exit(1);
  }
}

// Run the script
createAdminCoupon().catch(console.error);