#!/usr/bin/env node
/**
 * CLI Test Harness for IProductCatalog Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-product-catalog.ts
 */

import type { IProductCatalog } from '../core/interfaces/index.js';
import type { Product } from '../core/types/index.js';
import { ProductType } from '../core/types/index.js';
import { ProductCatalogManager } from '../implementations/ProductCatalogManager.js';

// TEST SUITE - This is what drives our interface design!
async function runTests() {
  console.log('🧪 Testing IProductCatalog Interface...\n');
  
  // Use concrete implementation instead of mock!
  const catalog: IProductCatalog = new ProductCatalogManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Get all available products
  testsTotal++;
  try {
    const products = await catalog.getAvailableProducts();
    console.log('✅ Test 1: getAvailableProducts()');
    console.log(`   Found ${products.length} products:`);
    products.forEach(p => console.log(`   - ${p.name} ($${p.price})`));
    
    if (products.length === 2) {
      testsPassed++;
      console.log('   ✅ Expected 2 products found\n');
    } else {
      console.log('   ❌ Expected 2 products, got', products.length, '\n');
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error, '\n');
  }

  // Test 2: Get specific product details
  testsTotal++;
  try {
    const product = await catalog.getProductDetails('prod-3day');
    console.log('✅ Test 2: getProductDetails("prod-3day")');
    console.log(`   Product: ${product.name}`);
    console.log(`   Price: $${product.price}`);
    console.log(`   Duration: ${product.duration} days`);
    console.log(`   Max Capacity: ${product.maxCapacity}`);
    
    if (product.type === ProductType.THREE_DAY && product.price === 3000) {
      testsPassed++;
      console.log('   ✅ Product details correct\n');
    } else {
      console.log('   ❌ Product details incorrect\n');
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error, '\n');
  }

  // Test 3: Get available start dates for 3-day workshop
  testsTotal++;
  try {
    const dates = await catalog.getAvailableStartDates(ProductType.THREE_DAY);
    console.log('✅ Test 3: getAvailableStartDates(THREE_DAY)');
    console.log(`   Found ${dates.length} available dates:`);
    dates.slice(0, 6).forEach(d => console.log(`   - ${d.toDateString()}`));
    
    if (dates.length >= 12) { // 4 weeks × 3 days
      testsPassed++;
      console.log('   ✅ Expected multiple start dates found\n');
    } else {
      console.log('   ❌ Expected at least 12 dates, got', dates.length, '\n');
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error, '\n');
  }

  // Test 4: Get available start dates for 5-day workshop
  testsTotal++;
  try {
    const dates = await catalog.getAvailableStartDates(ProductType.FIVE_DAY);
    console.log('✅ Test 4: getAvailableStartDates(FIVE_DAY)');
    console.log(`   Found ${dates.length} available dates:`);
    dates.slice(0, 4).forEach(d => console.log(`   - ${d.toDateString()}`));
    
    if (dates.length >= 4) { // 4 weeks × 1 day (Monday only)
      testsPassed++;
      console.log('   ✅ Expected Monday-only dates found\n');
    } else {
      console.log('   ❌ Expected at least 4 dates, got', dates.length, '\n');
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error, '\n');
  }

  // Test 5: Error handling for invalid product ID
  testsTotal++;
  try {
    await catalog.getProductDetails('invalid-id');
    console.log('❌ Test 5 FAILED: Should have thrown error for invalid ID\n');
  } catch (error) {
    console.log('✅ Test 5: getProductDetails() error handling');
    console.log(`   Correctly threw error: ${error.message}\n`);
    testsPassed++;
  }

  // Results
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('   🎉 ALL TESTS PASSED! IProductCatalog interface is ready for implementation!');
    process.exit(0);
  } else {
    console.log('   ❌ Some tests failed. Interface needs refinement.');
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests as testProductCatalog };
