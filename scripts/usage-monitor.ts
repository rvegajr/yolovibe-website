#!/usr/bin/env tsx

/**
 * Turso Usage Monitor CLI
 * 
 * Usage:
 *   npm run usage:check           # Quick usage summary
 *   npm run usage:report          # Detailed usage report
 *   npm run usage:alerts          # Show current alerts
 *   npm run usage:projection      # Monthly usage projection
 */

import { usageMonitor } from '../src/registration/database/UsageMonitor.js';
import { initializeDatabase } from '../src/registration/database/connection.js';

async function main() {
  const command = process.argv[2] || 'check';
  
  console.log('📊 YOLOVibe Turso Usage Monitor');
  console.log('================================\n');

  try {
    // Initialize database connection for accurate metrics
    await initializeDatabase();

    switch (command) {
      case 'check':
        await showUsageSummary();
        break;
      case 'report':
        await showDetailedReport();
        break;
      case 'alerts':
        await showAlerts();
        break;
      case 'projection':
        await showProjection();
        break;
      case 'reset':
        await resetMetrics();
        break;
      default:
        showHelp();
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function showUsageSummary() {
  const summary = usageMonitor.getUsageSummary();
  const status = summary.status;
  
  const statusIcon = status === 'critical' ? '🚨' : 
                    status === 'warning' ? '⚠️' : '✅';
  
  console.log(`${statusIcon} USAGE SUMMARY (${status.toUpperCase()})`);
  console.log('─'.repeat(30));
  
  console.log(`📖 Reads:   ${formatBar(summary.readsUsedPercent)}   ${summary.readsUsedPercent.toFixed(1)}%`);
  console.log(`✍️  Writes:  ${formatBar(summary.writesUsedPercent)}   ${summary.writesUsedPercent.toFixed(1)}%`);
  console.log(`💾 Storage: ${formatBar(summary.storageUsedPercent)}   ${summary.storageUsedPercent.toFixed(1)}%`);
  
  console.log('\n💡 Quick Actions:');
  console.log('   npm run usage:report      # Detailed report');
  console.log('   npm run usage:alerts      # Current alerts');
  console.log('   npm run usage:projection  # Monthly projection');
  
  if (status !== 'safe') {
    console.log('\n🎯 Immediate Actions Needed:');
    if (summary.readsUsedPercent >= 75) {
      console.log('   - Implement query caching');
      console.log('   - Optimize SELECT queries');
    }
    if (summary.writesUsedPercent >= 75) {
      console.log('   - Batch write operations');
      console.log('   - Review unnecessary updates');
    }
    if (summary.storageUsedPercent >= 75) {
      console.log('   - Clean up old data');
      console.log('   - Optimize data types');
    }
  }
}

async function showDetailedReport() {
  console.log('Generating detailed usage report...\n');
  
  const report = usageMonitor.generateUsageReport();
  console.log(report);
  
  const usage = await usageMonitor.getCurrentUsage();
  
  if (usage.alerts.length > 0) {
    console.log('🚨 ACTIVE ALERTS:');
    console.log('─'.repeat(20));
    usage.alerts.forEach((alert, index) => {
      const icon = alert.type === 'critical' ? '🚨' : 
                   alert.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${index + 1}. ${icon} ${alert.message}`);
      console.log(`   Current: ${alert.currentUsage.toLocaleString()} / ${alert.limit.toLocaleString()}`);
      console.log(`   Recommendations:`);
      alert.recommendations.forEach(rec => {
        console.log(`     - ${rec}`);
      });
      console.log();
    });
  }
}

async function showAlerts() {
  const usage = await usageMonitor.getCurrentUsage();
  
  if (usage.alerts.length === 0) {
    console.log('✅ No current usage alerts');
    console.log('   Your usage is within safe limits');
    return;
  }
  
  console.log(`Found ${usage.alerts.length} alert(s):\n`);
  
  usage.alerts.forEach((alert, index) => {
    const icon = alert.type === 'critical' ? '🚨' : 
                 alert.type === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`${index + 1}. ${icon} ${alert.type.toUpperCase()}: ${alert.metric}`);
    console.log(`   ${alert.message}`);
    console.log(`   Usage: ${alert.currentUsage.toLocaleString()} / ${alert.limit.toLocaleString()} (${alert.percentage.toFixed(1)}%)`);
    console.log(`   Progress: ${formatBar(alert.percentage)}`);
    
    console.log(`   Recommendations:`);
    alert.recommendations.forEach(rec => {
      console.log(`     • ${rec}`);
    });
    console.log();
  });
  
  console.log('🎯 Next Steps:');
  console.log('   npm run usage:report      # Full detailed report');
  console.log('   npm run usage:projection  # See monthly projection');
}

async function showProjection() {
  const projection = usageMonitor.getMonthlyProjection();
  
  console.log('🔮 MONTHLY USAGE PROJECTION');
  console.log('─'.repeat(30));
  console.log(`📅 Progress: Day ${projection.daysElapsed} of ${projection.daysInMonth}`);
  console.log(`⏳ Remaining: ${projection.daysInMonth - projection.daysElapsed} days\n`);
  
  console.log('📊 Projected Month-End Usage:');
  console.log(`   📖 Reads: ${projection.projectedReads.toLocaleString()}`);
  console.log(`   ✍️  Writes: ${projection.projectedWrites.toLocaleString()}`);
  console.log(`   💾 Storage: ${(projection.projectedStorage / 1024).toFixed(2)} GB\n`);
  
  console.log('🎯 Free Tier Limits:');
  console.log(`   📖 Reads: 500,000,000`);
  console.log(`   ✍️  Writes: 10,000,000`);
  console.log(`   💾 Storage: 5.00 GB\n`);
  
  if (projection.willExceedLimits) {
    console.log('🚨 WARNING: Projected to exceed limits!');
    console.log(`   Exceeding: ${projection.exceedingMetrics.join(', ')}`);
    console.log('\n💰 Potential Overage Cost:');
    
    // Calculate potential cost
    const overageCost = calculateOverageCost(projection);
    console.log(`   Estimated: $${overageCost.toFixed(2)}`);
    
    console.log('\n🛠️  IMMEDIATE ACTIONS REQUIRED:');
    if (projection.exceedingMetrics.includes('reads')) {
      console.log('   📖 READS: Implement caching, optimize queries');
    }
    if (projection.exceedingMetrics.includes('writes')) {
      console.log('   ✍️  WRITES: Batch operations, reduce unnecessary updates');
    }
    if (projection.exceedingMetrics.includes('storage')) {
      console.log('   💾 STORAGE: Clean up data, optimize schema');
    }
  } else {
    console.log('✅ Staying within free tier limits');
    console.log('   No action required');
  }
  
  console.log('\n📈 Daily Rate Analysis:');
  const dailyReads = projection.projectedReads / projection.daysInMonth;
  const dailyWrites = projection.projectedWrites / projection.daysInMonth;
  console.log(`   📖 Daily reads: ${dailyReads.toLocaleString()} (${((dailyReads / 500_000_000) * 30 * 100).toFixed(1)}% of monthly limit)`);
  console.log(`   ✍️  Daily writes: ${dailyWrites.toLocaleString()} (${((dailyWrites / 10_000_000) * 30 * 100).toFixed(1)}% of monthly limit)`);
}

async function resetMetrics() {
  console.log('🔄 Resetting usage metrics...');
  
  const confirm = process.argv[3] === '--confirm';
  if (!confirm) {
    console.log('\n⚠️  This will reset all current usage metrics.');
    console.log('   Use --confirm to proceed: npm run usage:monitor reset --confirm');
    return;
  }
  
  usageMonitor.resetCurrentMonth();
  console.log('✅ Usage metrics reset successfully');
  console.log('   New tracking period started');
}

function showHelp() {
  console.log('USAGE MONITOR COMMANDS:');
  console.log('─'.repeat(25));
  console.log('npm run usage:check           Quick usage summary');
  console.log('npm run usage:report          Detailed usage report');
  console.log('npm run usage:alerts          Show current alerts');
  console.log('npm run usage:projection      Monthly usage projection');
  console.log('npm run usage:monitor reset   Reset metrics (requires --confirm)');
  console.log('\nEXAMPLES:');
  console.log('npm run usage:check                    # Quick status');
  console.log('npm run usage:report                   # Full report');
  console.log('npm run usage:monitor reset --confirm  # Reset metrics');
}

function formatBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  let color = '';
  if (percentage >= 90) color = '🟥'; // Critical
  else if (percentage >= 75) color = '🟨'; // Warning
  else color = '🟩'; // Safe
  
  return color.repeat(Math.max(1, Math.ceil(filled / 2))) + '⬜'.repeat(Math.max(0, Math.ceil(empty / 2)));
}

function calculateOverageCost(projection: any): number {
  let cost = 0;
  
  // Free tier overage pricing
  const pricing = {
    readsPerBillion: 1.00,
    writesPerMillion: 1.00,
    storagePerGB: 0.75
  };
  
  // Calculate read overages
  if (projection.projectedReads > 500_000_000) {
    const excess = projection.projectedReads - 500_000_000;
    cost += Math.ceil(excess / 1_000_000_000) * pricing.readsPerBillion;
  }
  
  // Calculate write overages
  if (projection.projectedWrites > 10_000_000) {
    const excess = projection.projectedWrites - 10_000_000;
    cost += Math.ceil(excess / 1_000_000) * pricing.writesPerMillion;
  }
  
  // Calculate storage overages
  const projectedGB = projection.projectedStorage / 1024;
  if (projectedGB > 5) {
    const excess = Math.ceil(projectedGB - 5);
    cost += excess * pricing.storagePerGB;
  }
  
  return cost;
}

// Run the monitor
main(); 