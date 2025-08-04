/**
 * ReportingManager - Concrete Implementation
 * Business reporting and analytics
 * Simple, focused implementation - no over-engineering!
 */

import type { IReportingManager } from '../core/interfaces/index.js';
import type { 
  DateRange, 
  PaymentSummary, 
  WorkshopMetrics, 
  ExportResult, 
  RevenueAnalytics,
  ProductType
} from '../core/types/index.js';

export class ReportingManager implements IReportingManager {
  private mockTransactions = [
    { id: 'txn_1', amount: 3000, date: new Date('2025-01-15'), productType: '3-day' as ProductType, workshopId: 'workshop_1', refunded: false },
    { id: 'txn_2', amount: 4500, date: new Date('2025-01-20'), productType: '5-day' as ProductType, workshopId: 'workshop_2', refunded: false },
    { id: 'txn_3', amount: 3000, date: new Date('2025-01-25'), productType: '3-day' as ProductType, workshopId: 'workshop_1', refunded: false },
    { id: 'txn_4', amount: 4500, date: new Date('2025-02-10'), productType: '5-day' as ProductType, workshopId: 'workshop_2', refunded: false },
    { id: 'txn_5', amount: 3000, date: new Date('2025-02-15'), productType: '3-day' as ProductType, workshopId: 'workshop_1', refunded: false },
    { id: 'txn_6', amount: 4500, date: new Date('2025-02-20'), productType: '5-day' as ProductType, workshopId: 'workshop_2', refunded: false },
    { id: 'txn_7', amount: 3000, date: new Date('2025-02-25'), productType: '3-day' as ProductType, workshopId: 'workshop_1', refunded: false },
    { id: 'txn_8', amount: 3000, date: new Date('2025-03-05'), productType: '3-day' as ProductType, workshopId: 'workshop_1', refunded: true }
  ];

  private mockWorkshops = [
    { id: 'workshop_1', bookings: 15, capacity: 20, revenue: 45000, attendees: 15, completionRate: 95 },
    { id: 'workshop_2', bookings: 12, capacity: 15, revenue: 36000, attendees: 12, completionRate: 88 }
  ];

  async getPaymentSummary(dateRange: DateRange): Promise<PaymentSummary> {
    const filteredTransactions = this.mockTransactions.filter(txn => 
      txn.date >= dateRange.startDate && txn.date <= dateRange.endDate
    );

    const totalRevenue = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const refundAmount = filteredTransactions
      .filter(txn => txn.refunded)
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      totalRevenue,
      totalTransactions: filteredTransactions.length,
      averageTransactionAmount: filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0,
      refundAmount,
      netRevenue: totalRevenue - refundAmount,
      dateRange
    };
  }

  async getWorkshopMetrics(dateRange: DateRange): Promise<WorkshopMetrics> {
    // For simplicity, return metrics for the first workshop
    // In a real implementation, this would filter by date range and aggregate multiple workshops
    const workshop = this.mockWorkshops[0];
    
    return {
      workshopId: 'workshop_1',
      totalBookings: workshop.bookings,
      currentCapacity: workshop.attendees,
      maxCapacity: workshop.capacity,
      revenue: workshop.revenue,
      attendeeCount: workshop.attendees,
      completionRate: workshop.completionRate
    };
  }

  async exportTransactionData(format: 'csv' | 'excel'): Promise<ExportResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = format === 'csv' ? 'csv' : 'xlsx';
    const fileName = `transaction_data_${timestamp}.${extension}`;
    
    // Mock export process
    console.log(`   📄 Mock export: ${fileName}`);
    console.log(`   📁 Mock file path: /tmp/exports/${fileName}`);
    console.log(`   📊 Format: ${format.toUpperCase()}`);

    return {
      success: true,
      downloadUrl: `https://example.com/exports/${fileName}`,
      fileName
    };
  }

  async getRevenueAnalytics(dateRange: DateRange): Promise<RevenueAnalytics> {
    const filteredTransactions = this.mockTransactions.filter(txn => 
      txn.date >= dateRange.startDate && txn.date <= dateRange.endDate
    );

    // Monthly breakdown
    const monthlyMap = new Map<string, { revenue: number; bookings: number }>();
    filteredTransactions.forEach(txn => {
      const monthKey = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(monthKey) || { revenue: 0, bookings: 0 };
      current.revenue += txn.amount;
      current.bookings += 1;
      monthlyMap.set(monthKey, current);
    });

    // Product type breakdown
    const productMap = new Map<ProductType, { revenue: number; bookings: number }>();
    filteredTransactions.forEach(txn => {
      const current = productMap.get(txn.productType) || { revenue: 0, bookings: 0 };
      current.revenue += txn.amount;
      current.bookings += 1;
      productMap.set(txn.productType, current);
    });

    const totalRevenue = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const refundedTransactions = filteredTransactions.filter(txn => txn.refunded);
    const refundRate = filteredTransactions.length > 0 ? 
      (refundedTransactions.length / filteredTransactions.length) * 100 : 0;

    // Convert maps to arrays matching the interface
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      bookingCount: data.bookings
    }));

    const productRevenue = Array.from(productMap.entries()).map(([productType, data]) => ({
      productType,
      revenue: data.revenue,
      bookingCount: data.bookings
    }));

    return {
      monthlyRevenue,
      productRevenue,
      refundRate,
      averageBookingValue: filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0
    };
  }
}
