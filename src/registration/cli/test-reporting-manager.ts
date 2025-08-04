#!/usr/bin/env tsx
/**
 * CLI Test Harness for IReportingManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-reporting-manager.ts
 */

import type { IReportingManager } from '../core/interfaces/index.js';
import type { DateRange, PaymentSummary, WorkshopMetrics, ExportResult, RevenueAnalytics, ProductType } from '../core/types/index.js';
import { ReportingManager } from '../implementations/ReportingManager.js';

// TEST SUITE
async function testReportingManager() {
  console.log('🧪 Testing IReportingManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  const reportingManager = new ReportingManager();
  let passedTests = 0;
  let totalTests = 0;

  // Define test period
  const testPeriod: DateRange = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31')
  };

  // Test 1: Get Payment Summary
  totalTests++;
  try {
    const report: PaymentSummary = await reportingManager.getPaymentSummary(testPeriod);
    
    console.log('✅ Test 1: getPaymentSummary()');
    console.log(`   Period: ${report.dateRange.startDate.toISOString().split('T')[0]} to ${report.dateRange.endDate.toISOString().split('T')[0]}`);
    console.log(`   Total Revenue: $${report.totalRevenue.toLocaleString()}`);
    console.log(`   Total Transactions: ${report.totalTransactions}`);
    console.log(`   Average Transaction Amount: $${report.averageTransactionAmount.toLocaleString()}`);
    console.log(`   Refund Amount: $${report.refundAmount.toLocaleString()}`);
    console.log(`   Net Revenue: $${report.netRevenue.toLocaleString()}`);
    console.log('   ✅ Payment summary generated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: getPaymentSummary() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Workshop Metrics
  totalTests++;
  try {
    const metrics: WorkshopMetrics = await reportingManager.getWorkshopMetrics(testPeriod);
    
    console.log('✅ Test 2: getWorkshopMetrics()');
    console.log(`   Workshop ID: ${metrics.workshopId}`);
    console.log(`   Total Bookings: ${metrics.totalBookings}`);
    console.log(`   Current Capacity: ${metrics.currentCapacity}`);
    console.log(`   Max Capacity: ${metrics.maxCapacity}`);
    console.log(`   Revenue: $${metrics.revenue.toLocaleString()}`);
    console.log(`   Attendee Count: ${metrics.attendeeCount}`);
    console.log(`   Completion Rate: ${metrics.completionRate}%`);
    console.log('   ✅ Workshop metrics generated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getWorkshopMetrics() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Export Transaction Data
  totalTests++;
  try {
    const result: ExportResult = await reportingManager.exportTransactionData('csv');
    
    console.log('✅ Test 3: exportTransactionData()');
    console.log(`   Format: CSV`);
    console.log(`   File Name: ${result.fileName}`);
    console.log(`   Download URL: ${result.downloadUrl}`);
    console.log('   ✅ Transaction data exported successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: exportTransactionData() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Get Revenue Analytics
  totalTests++;
  try {
    const analytics: RevenueAnalytics = await reportingManager.getRevenueAnalytics(testPeriod);
    
    console.log('✅ Test 4: getRevenueAnalytics()');
    console.log(`   Monthly Revenue:`);
    analytics.monthlyRevenue.forEach(month => {
      console.log(`     ${month.month}: $${month.revenue.toLocaleString()} (${month.bookingCount} bookings)`);
    });
    console.log(`   Product Revenue:`);
    analytics.productRevenue.forEach(product => {
      console.log(`     ${product.productType}: $${product.revenue.toLocaleString()} (${product.bookingCount} bookings)`);
    });
    console.log(`   Refund Rate: ${analytics.refundRate}%`);
    console.log(`   Average Booking Value: $${analytics.averageBookingValue.toLocaleString()}`);
    console.log('   ✅ Revenue analytics generated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: getRevenueAnalytics() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IReportingManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testReportingManager().catch(console.error);
