#!/usr/bin/env tsx
/**
 * CLI Test Harness for IReportingManager Interface
 * Tests reporting and analytics functionality
 * 
 * Usage: tsx test-reporting-manager.ts
 */

import type { IReportingManager } from '../core/interfaces/index.js';
import type { PaymentSummary, WorkshopMetrics, ExportResult, RevenueAnalytics, DateRange } from '../core/types/index.js';
import { ProductType } from '../core/types/index.js';

// Mock implementation for testing
class MockReportingManager implements IReportingManager {
  private mockData = {
    payments: [
      { id: 'payment_1', amount: 3000, date: new Date('2025-01-15'), status: 'completed' },
      { id: 'payment_2', amount: 6000, date: new Date('2025-01-20'), status: 'completed' },
      { id: 'payment_3', amount: 4500, date: new Date('2025-02-10'), status: 'completed' },
      { id: 'payment_4', amount: 9000, date: new Date('2025-02-15'), status: 'completed' },
      { id: 'payment_5', amount: 3000, date: new Date('2025-03-05'), status: 'refunded' }
    ],
    workshops: [
      { id: 'workshop_1', totalBookings: 15, currentCapacity: 15, maxCapacity: 20, revenue: 45000, attendeeCount: 15, completionRate: 95 },
      { id: 'workshop_2', totalBookings: 8, currentCapacity: 8, maxCapacity: 15, revenue: 36000, attendeeCount: 8, completionRate: 100 }
    ]
  };

  async getPaymentSummary(dateRange: DateRange): Promise<PaymentSummary> {
    const relevantPayments = this.mockData.payments.filter(payment => 
      payment.date >= dateRange.startDate && 
      payment.date <= dateRange.endDate
    );

    const completedPayments = relevantPayments.filter(p => p.status === 'completed');
    const refundedPayments = relevantPayments.filter(p => p.status === 'refunded');

    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const refundAmount = refundedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalTransactions = completedPayments.length;
    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const netRevenue = totalRevenue - refundAmount;

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionAmount,
      refundAmount,
      netRevenue,
      dateRange
    };
  }

  async getWorkshopMetrics(dateRange: DateRange): Promise<WorkshopMetrics> {
    // For simplicity, return metrics for the first workshop
    const workshop = this.mockData.workshops[0];
    return {
      workshopId: workshop.id,
      totalBookings: workshop.totalBookings,
      currentCapacity: workshop.currentCapacity,
      maxCapacity: workshop.maxCapacity,
      revenue: workshop.revenue,
      attendeeCount: workshop.attendeeCount,
      completionRate: workshop.completionRate
    };
  }

  async exportTransactionData(format: 'csv' | 'excel'): Promise<ExportResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `transaction_data_${timestamp}.${format}`;
    const mockFilePath = `/tmp/exports/${fileName}`;
    
    console.log(`   📄 Mock export: ${fileName}`);
    console.log(`   📁 Mock file path: ${mockFilePath}`);
    console.log(`   📊 Format: ${format.toUpperCase()}`);
    
    return {
      success: true,
      downloadUrl: `https://example.com/exports/${fileName}`,
      fileName
    };
  }

  async getRevenueAnalytics(dateRange: DateRange): Promise<RevenueAnalytics> {
    const monthlyRevenue = [
      { month: '2025-01', revenue: 9000, bookingCount: 3 },
      { month: '2025-02', revenue: 13500, bookingCount: 3 },
      { month: '2025-03', revenue: 3000, bookingCount: 1 }
    ];

    const productRevenue = [
      { productType: ProductType.THREE_DAY as const, revenue: 15000, bookingCount: 5 },
      { productType: ProductType.FIVE_DAY as const, revenue: 13500, bookingCount: 3 }
    ];

    return {
      monthlyRevenue,
      productRevenue,
      refundRate: 10.5, // 10.5%
      averageBookingValue: 4500
    };
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IReportingManager Interface...\n');
  
  const manager = new MockReportingManager();
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
    const report = await manager.getPaymentSummary(testPeriod);
    
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
    const metrics = await manager.getWorkshopMetrics(testPeriod);
    
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
    const result = await manager.exportTransactionData('csv');
    
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
    const analytics = await manager.getRevenueAnalytics(testPeriod);
    
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
runTests().catch(console.error);
