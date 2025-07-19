/**
 * Turso Usage Monitor for YOLOVibe Registration System
 * 
 * Monitors database usage to ensure staying within Turso free tier limits:
 * - Storage: 5GB total
 * - Rows Read: 500M per month
 * - Rows Written: 10M per month
 * - Syncs: 3GB per month
 * - Databases: 500 total
 * - Active Databases: 500 total
 * 
 * Features:
 * - Real-time usage tracking
 * - Alerts when approaching limits
 * - Optimization recommendations
 * - Usage history and trends
 * - Cost projection if limits exceeded
 */

import { getDatabaseConnection } from './connection.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface UsageMetrics {
  timestamp: Date;
  rowsRead: number;
  rowsWritten: number;
  storageUsedMB: number;
  queryCount: number;
  connectionCount: number;
  averageQueryTime: number;
}

export interface UsageLimits {
  storageGB: number;
  rowsReadPerMonth: number;
  rowsWrittenPerMonth: number;
  syncsGBPerMonth: number;
  maxDatabases: number;
  maxActiveDatabases: number;
}

export interface UsageAlert {
  type: 'warning' | 'critical' | 'info';
  metric: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  message: string;
  recommendations: string[];
}

export class UsageMonitor {
  private metricsFile: string;
  private limits: UsageLimits;
  private currentMetrics: UsageMetrics;
  private monthlyMetrics: { [month: string]: UsageMetrics };

  constructor() {
    this.metricsFile = join(process.cwd(), 'turso-usage.json');
    
    // Turso Free Tier Limits (2025)
    this.limits = {
      storageGB: 5,
      rowsReadPerMonth: 500_000_000,   // 500 Million
      rowsWrittenPerMonth: 10_000_000, // 10 Million
      syncsGBPerMonth: 3,
      maxDatabases: 500,
      maxActiveDatabases: 500
    };

    this.currentMetrics = {
      timestamp: new Date(),
      rowsRead: 0,
      rowsWritten: 0,
      storageUsedMB: 0,
      queryCount: 0,
      connectionCount: 0,
      averageQueryTime: 0
    };

    this.monthlyMetrics = {};
    this.loadMetrics();
  }

  /**
   * Track a database read operation
   */
  trackRead(rowCount: number = 1): void {
    this.currentMetrics.rowsRead += rowCount;
    this.currentMetrics.queryCount += 1;
    this.updateMonthlyMetrics();
    
    // Check for alerts
    this.checkUsageAlerts();
  }

  /**
   * Track a database write operation
   */
  trackWrite(rowCount: number = 1): void {
    this.currentMetrics.rowsWritten += rowCount;
    this.currentMetrics.queryCount += 1;
    this.updateMonthlyMetrics();
    
    // Check for alerts
    this.checkUsageAlerts();
  }

  /**
   * Track query execution time
   */
  trackQueryTime(milliseconds: number): void {
    const totalTime = this.currentMetrics.averageQueryTime * (this.currentMetrics.queryCount - 1) + milliseconds;
    this.currentMetrics.averageQueryTime = totalTime / this.currentMetrics.queryCount;
  }

  /**
   * Get current usage statistics
   */
  async getCurrentUsage(): Promise<{
    daily: UsageMetrics;
    monthly: UsageMetrics;
    alerts: UsageAlert[];
    recommendations: string[];
  }> {
    await this.updateStorageUsage();
    
    const monthKey = this.getMonthKey(new Date());
    const monthlyUsage = this.monthlyMetrics[monthKey] || this.getEmptyMetrics();
    
    const alerts = this.generateAlerts(monthlyUsage);
    const recommendations = this.generateRecommendations(monthlyUsage, alerts);

    return {
      daily: this.currentMetrics,
      monthly: monthlyUsage,
      alerts,
      recommendations
    };
  }

  /**
   * Get usage projection for the month
   */
  getMonthlyProjection(): {
    projectedReads: number;
    projectedWrites: number;
    projectedStorage: number;
    daysInMonth: number;
    daysElapsed: number;
    willExceedLimits: boolean;
    exceedingMetrics: string[];
  } {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const daysInMonth = monthEnd.getDate();
    const daysElapsed = now.getDate();
    const remainingDays = daysInMonth - daysElapsed;
    
    const monthKey = this.getMonthKey(now);
    const monthlyUsage = this.monthlyMetrics[monthKey] || this.getEmptyMetrics();
    
    // Project based on current usage rate
    const dailyReadRate = monthlyUsage.rowsRead / daysElapsed;
    const dailyWriteRate = monthlyUsage.rowsWritten / daysElapsed;
    const dailyStorageRate = monthlyUsage.storageUsedMB / daysElapsed;
    
    const projectedReads = monthlyUsage.rowsRead + (dailyReadRate * remainingDays);
    const projectedWrites = monthlyUsage.rowsWritten + (dailyWriteRate * remainingDays);
    const projectedStorage = monthlyUsage.storageUsedMB + (dailyStorageRate * remainingDays);
    
    const exceedingMetrics: string[] = [];
    
    if (projectedReads > this.limits.rowsReadPerMonth) {
      exceedingMetrics.push('reads');
    }
    if (projectedWrites > this.limits.rowsWrittenPerMonth) {
      exceedingMetrics.push('writes');
    }
    if (projectedStorage > this.limits.storageGB * 1024) {
      exceedingMetrics.push('storage');
    }
    
    return {
      projectedReads,
      projectedWrites,
      projectedStorage,
      daysInMonth,
      daysElapsed,
      willExceedLimits: exceedingMetrics.length > 0,
      exceedingMetrics
    };
  }

  /**
   * Generate usage report
   */
  generateUsageReport(): string {
    const monthKey = this.getMonthKey(new Date());
    const monthlyUsage = this.monthlyMetrics[monthKey] || this.getEmptyMetrics();
    const projection = this.getMonthlyProjection();
    
    let report = '📊 TURSO USAGE REPORT\n';
    report += '=====================\n\n';
    
    // Current Month Usage
    report += '📅 CURRENT MONTH USAGE:\n';
    report += `   📖 Rows Read: ${monthlyUsage.rowsRead.toLocaleString()} / ${this.limits.rowsReadPerMonth.toLocaleString()} (${((monthlyUsage.rowsRead / this.limits.rowsReadPerMonth) * 100).toFixed(1)}%)\n`;
    report += `   ✍️  Rows Written: ${monthlyUsage.rowsWritten.toLocaleString()} / ${this.limits.rowsWrittenPerMonth.toLocaleString()} (${((monthlyUsage.rowsWritten / this.limits.rowsWrittenPerMonth) * 100).toFixed(1)}%)\n`;
    report += `   💾 Storage: ${(monthlyUsage.storageUsedMB / 1024).toFixed(2)} GB / ${this.limits.storageGB} GB (${((monthlyUsage.storageUsedMB / 1024 / this.limits.storageGB) * 100).toFixed(1)}%)\n`;
    report += `   🔄 Queries: ${monthlyUsage.queryCount.toLocaleString()}\n`;
    report += `   ⏱️  Avg Query Time: ${monthlyUsage.averageQueryTime.toFixed(2)}ms\n\n`;
    
    // Projections
    report += '🔮 MONTHLY PROJECTION:\n';
    report += `   📖 Projected Reads: ${projection.projectedReads.toLocaleString()}\n`;
    report += `   ✍️  Projected Writes: ${projection.projectedWrites.toLocaleString()}\n`;
    report += `   💾 Projected Storage: ${(projection.projectedStorage / 1024).toFixed(2)} GB\n`;
    
    if (projection.willExceedLimits) {
      report += `   ⚠️  WARNING: May exceed limits in: ${projection.exceedingMetrics.join(', ')}\n`;
    } else {
      report += `   ✅ Staying within free tier limits\n`;
    }
    
    report += `\n📈 Progress: Day ${projection.daysElapsed} of ${projection.daysInMonth}\n\n`;
    
    // Recommendations
    const recommendations = this.generateRecommendations(monthlyUsage, []);
    if (recommendations.length > 0) {
      report += '💡 OPTIMIZATION RECOMMENDATIONS:\n';
      recommendations.forEach((rec, index) => {
        report += `   ${index + 1}. ${rec}\n`;
      });
      report += '\n';
    }
    
    // Cost if exceeded
    const potentialCost = this.calculatePotentialOverageCost(projection);
    if (potentialCost > 0) {
      report += `💰 POTENTIAL OVERAGE COST: $${potentialCost.toFixed(2)}\n`;
    } else {
      report += `💰 OVERAGE COST: $0.00 (staying within free tier)\n`;
    }
    
    return report;
  }

  /**
   * Check for usage alerts
   */
  private checkUsageAlerts(): void {
    const monthKey = this.getMonthKey(new Date());
    const monthlyUsage = this.monthlyMetrics[monthKey] || this.getEmptyMetrics();
    const alerts = this.generateAlerts(monthlyUsage);
    
    // Log critical alerts
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    if (criticalAlerts.length > 0) {
      console.warn('🚨 CRITICAL USAGE ALERTS:');
      criticalAlerts.forEach(alert => {
        console.warn(`   ${alert.message}`);
      });
    }
    
    // Save metrics after checking alerts
    this.saveMetrics();
  }

  /**
   * Generate usage alerts
   */
  private generateAlerts(monthlyUsage: UsageMetrics): UsageAlert[] {
    const alerts: UsageAlert[] = [];
    
    // Check reads
    const readPercentage = (monthlyUsage.rowsRead / this.limits.rowsReadPerMonth) * 100;
    if (readPercentage >= 90) {
      alerts.push({
        type: 'critical',
        metric: 'reads',
        currentUsage: monthlyUsage.rowsRead,
        limit: this.limits.rowsReadPerMonth,
        percentage: readPercentage,
        message: `Critical: ${readPercentage.toFixed(1)}% of monthly read limit used`,
        recommendations: [
          'Implement query result caching',
          'Optimize SELECT queries to fetch only needed columns',
          'Use pagination for large result sets',
          'Consider read replicas for heavy read workloads'
        ]
      });
    } else if (readPercentage >= 75) {
      alerts.push({
        type: 'warning',
        metric: 'reads',
        currentUsage: monthlyUsage.rowsRead,
        limit: this.limits.rowsReadPerMonth,
        percentage: readPercentage,
        message: `Warning: ${readPercentage.toFixed(1)}% of monthly read limit used`,
        recommendations: [
          'Monitor query patterns',
          'Implement basic caching for frequent queries'
        ]
      });
    }
    
    // Check writes
    const writePercentage = (monthlyUsage.rowsWritten / this.limits.rowsWrittenPerMonth) * 100;
    if (writePercentage >= 90) {
      alerts.push({
        type: 'critical',
        metric: 'writes',
        currentUsage: monthlyUsage.rowsWritten,
        limit: this.limits.rowsWrittenPerMonth,
        percentage: writePercentage,
        message: `Critical: ${writePercentage.toFixed(1)}% of monthly write limit used`,
        recommendations: [
          'Batch INSERT/UPDATE operations',
          'Use bulk operations instead of individual writes',
          'Implement write buffering',
          'Review unnecessary duplicate writes'
        ]
      });
    } else if (writePercentage >= 75) {
      alerts.push({
        type: 'warning',
        metric: 'writes',
        currentUsage: monthlyUsage.rowsWritten,
        limit: this.limits.rowsWrittenPerMonth,
        percentage: writePercentage,
        message: `Warning: ${writePercentage.toFixed(1)}% of monthly write limit used`,
        recommendations: [
          'Monitor write patterns',
          'Consider batching smaller operations'
        ]
      });
    }
    
    // Check storage
    const storageGB = monthlyUsage.storageUsedMB / 1024;
    const storagePercentage = (storageGB / this.limits.storageGB) * 100;
    if (storagePercentage >= 90) {
      alerts.push({
        type: 'critical',
        metric: 'storage',
        currentUsage: storageGB,
        limit: this.limits.storageGB,
        percentage: storagePercentage,
        message: `Critical: ${storagePercentage.toFixed(1)}% of storage limit used`,
        recommendations: [
          'Clean up old backup files',
          'Archive historical data',
          'Optimize data types (use appropriate column sizes)',
          'Remove unused indexes',
          'Compress large text fields'
        ]
      });
    } else if (storagePercentage >= 75) {
      alerts.push({
        type: 'warning',
        metric: 'storage',
        currentUsage: storageGB,
        limit: this.limits.storageGB,
        percentage: storagePercentage,
        message: `Warning: ${storagePercentage.toFixed(1)}% of storage limit used`,
        recommendations: [
          'Monitor storage growth',
          'Plan for data archival strategy'
        ]
      });
    }
    
    return alerts;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(monthlyUsage: UsageMetrics, alerts: UsageAlert[]): string[] {
    const recommendations: string[] = [];
    
    // High query count recommendations
    if (monthlyUsage.queryCount > 100000) {
      recommendations.push('Consider implementing query result caching to reduce database hits');
      recommendations.push('Optimize frequently executed queries with proper indexing');
    }
    
    // Slow query recommendations
    if (monthlyUsage.averageQueryTime > 100) {
      recommendations.push('Analyze and optimize slow queries (current avg: ' + monthlyUsage.averageQueryTime.toFixed(2) + 'ms)');
      recommendations.push('Add database indexes for frequently queried columns');
    }
    
    // General optimization
    recommendations.push('Use SELECT with specific columns instead of SELECT *');
    recommendations.push('Implement pagination for large result sets');
    recommendations.push('Batch INSERT/UPDATE operations when possible');
    recommendations.push('Monitor usage daily to catch trends early');
    
    // Add alert-specific recommendations
    alerts.forEach(alert => {
      recommendations.push(...alert.recommendations);
    });
    
    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Calculate potential overage cost
   */
  private calculatePotentialOverageCost(projection: any): number {
    let cost = 0;
    
    // Overage pricing for free tier (if overages enabled)
    const overagePricing = {
      readsPerBillion: 1.00,    // $1 per billion extra reads
      writesPerMillion: 1.00,   // $1 per million extra writes
      storagePerGB: 0.75        // $0.75 per extra GB storage
    };
    
    // Calculate read overages
    if (projection.projectedReads > this.limits.rowsReadPerMonth) {
      const excessReads = projection.projectedReads - this.limits.rowsReadPerMonth;
      const excessBillions = Math.ceil(excessReads / 1_000_000_000);
      cost += excessBillions * overagePricing.readsPerBillion;
    }
    
    // Calculate write overages
    if (projection.projectedWrites > this.limits.rowsWrittenPerMonth) {
      const excessWrites = projection.projectedWrites - this.limits.rowsWrittenPerMonth;
      const excessMillions = Math.ceil(excessWrites / 1_000_000);
      cost += excessMillions * overagePricing.writesPerMillion;
    }
    
    // Calculate storage overages
    const projectedStorageGB = projection.projectedStorage / 1024;
    if (projectedStorageGB > this.limits.storageGB) {
      const excessStorage = Math.ceil(projectedStorageGB - this.limits.storageGB);
      cost += excessStorage * overagePricing.storagePerGB;
    }
    
    return cost;
  }

  /**
   * Update monthly metrics
   */
  private updateMonthlyMetrics(): void {
    const monthKey = this.getMonthKey(new Date());
    
    if (!this.monthlyMetrics[monthKey]) {
      this.monthlyMetrics[monthKey] = this.getEmptyMetrics();
    }
    
    // Add current metrics to monthly totals
    this.monthlyMetrics[monthKey].rowsRead = this.currentMetrics.rowsRead;
    this.monthlyMetrics[monthKey].rowsWritten = this.currentMetrics.rowsWritten;
    this.monthlyMetrics[monthKey].queryCount = this.currentMetrics.queryCount;
    this.monthlyMetrics[monthKey].averageQueryTime = this.currentMetrics.averageQueryTime;
    this.monthlyMetrics[monthKey].timestamp = new Date();
  }

  /**
   * Update storage usage from database
   */
  private async updateStorageUsage(): Promise<void> {
    try {
      const db = getDatabaseConnection();
      
      // Get database size (works for SQLite, approximation for Turso)
      if (!db.isTursoDatabase()) {
        // For local SQLite, we can get actual file size
        const fs = require('fs');
        const dbPath = process.env.***REMOVED*** || './data/yolovibe.db';
        
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          this.currentMetrics.storageUsedMB = stats.size / (1024 * 1024);
        }
      } else {
        // For Turso, estimate based on row counts and average row size
        const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
        let totalRows = 0;
        
        for (const table of tables) {
          try {
            const result = await db.query(`SELECT COUNT(*) as count FROM ${table.name}`);
            totalRows += result[0]?.count || 0;
          } catch (error) {
            // Skip tables we can't access
          }
        }
        
        // Estimate ~1KB per row on average (very rough estimate)
        this.currentMetrics.storageUsedMB = (totalRows * 1024) / (1024 * 1024);
      }
      
      // Update monthly metrics
      const monthKey = this.getMonthKey(new Date());
      if (this.monthlyMetrics[monthKey]) {
        this.monthlyMetrics[monthKey].storageUsedMB = this.currentMetrics.storageUsedMB;
      }
      
    } catch (error) {
      console.warn('Could not update storage usage:', error);
    }
  }

  /**
   * Load metrics from file
   */
  private loadMetrics(): void {
    try {
      if (existsSync(this.metricsFile)) {
        const data = JSON.parse(readFileSync(this.metricsFile, 'utf-8'));
        this.monthlyMetrics = data.monthlyMetrics || {};
        
        // Convert date strings back to Date objects
        Object.keys(this.monthlyMetrics).forEach(key => {
          this.monthlyMetrics[key].timestamp = new Date(this.monthlyMetrics[key].timestamp);
        });
      }
    } catch (error) {
      console.warn('Could not load usage metrics:', error);
      this.monthlyMetrics = {};
    }
  }

  /**
   * Save metrics to file
   */
  private saveMetrics(): void {
    try {
      const data = {
        monthlyMetrics: this.monthlyMetrics,
        lastUpdated: new Date().toISOString()
      };
      
      writeFileSync(this.metricsFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.warn('Could not save usage metrics:', error);
    }
  }

  /**
   * Get month key for metrics storage
   */
  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  /**
   * Get empty metrics object
   */
  private getEmptyMetrics(): UsageMetrics {
    return {
      timestamp: new Date(),
      rowsRead: 0,
      rowsWritten: 0,
      storageUsedMB: 0,
      queryCount: 0,
      connectionCount: 0,
      averageQueryTime: 0
    };
  }

  /**
   * Reset monthly metrics (call at start of new month)
   */
  resetCurrentMonth(): void {
    this.currentMetrics = this.getEmptyMetrics();
    const monthKey = this.getMonthKey(new Date());
    this.monthlyMetrics[monthKey] = this.getEmptyMetrics();
    this.saveMetrics();
  }

  /**
   * Get usage summary for dashboard
   */
  getUsageSummary(): {
    readsUsedPercent: number;
    writesUsedPercent: number;
    storageUsedPercent: number;
    status: 'safe' | 'warning' | 'critical';
  } {
    const monthKey = this.getMonthKey(new Date());
    const monthlyUsage = this.monthlyMetrics[monthKey] || this.getEmptyMetrics();
    
    const readsUsedPercent = (monthlyUsage.rowsRead / this.limits.rowsReadPerMonth) * 100;
    const writesUsedPercent = (monthlyUsage.rowsWritten / this.limits.rowsWrittenPerMonth) * 100;
    const storageUsedPercent = ((monthlyUsage.storageUsedMB / 1024) / this.limits.storageGB) * 100;
    
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    
    if (readsUsedPercent >= 90 || writesUsedPercent >= 90 || storageUsedPercent >= 90) {
      status = 'critical';
    } else if (readsUsedPercent >= 75 || writesUsedPercent >= 75 || storageUsedPercent >= 75) {
      status = 'warning';
    }
    
    return {
      readsUsedPercent,
      writesUsedPercent,
      storageUsedPercent,
      status
    };
  }
}

// Export singleton instance
export const usageMonitor = new UsageMonitor();

export default UsageMonitor; 