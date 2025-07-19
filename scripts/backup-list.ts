#!/usr/bin/env tsx

/**
 * List Database Backups
 * 
 * Usage:
 *   npm run backup:list
 *   npm run backup:list --detailed
 */

import { backupManager } from '../src/registration/database/BackupManager.js';

async function listBackups() {
  console.log('📋 YOLOVibe Database Backups');
  console.log('============================\n');

  try {
    const backups = await backupManager.listBackups();
    
    if (backups.length === 0) {
      console.log('📭 No backups found.');
      console.log('\n🎯 Create your first backup:');
      console.log('   npm run backup:create');
      return;
    }

    const detailed = process.argv.includes('--detailed');

    console.log(`Found ${backups.length} backup(s):\n`);

    for (let i = 0; i < backups.length; i++) {
      const backup = backups[i];
      const isLatest = i === 0;
      const age = getAgeString(backup.timestamp);
      const totalRecords = Object.values(backup.recordCounts).reduce((a, b) => a + b, 0);

      console.log(`${isLatest ? '🌟' : '📦'} ${backup.id}`);
      console.log(`   📅 Created: ${backup.timestamp.toLocaleString()} (${age})`);
      console.log(`   📊 Size: ${formatSize(backup.size)}`);
      console.log(`   📋 Tables: ${backup.tables.length}, Records: ${totalRecords}`);
      
      if (backup.description) {
        console.log(`   📝 Description: ${backup.description}`);
      }

      if (detailed) {
        console.log(`   🔐 Checksum: ${backup.checksum}`);
        console.log(`   📄 File: ${backup.filename}`);
        console.log(`   🏷️  Version: ${backup.version}`);
        
        // Show table breakdown
        console.log('   📊 Table breakdown:');
        for (const [table, count] of Object.entries(backup.recordCounts)) {
          const status = count === -1 ? '❌ Error' : `${count} records`;
          console.log(`      - ${table}: ${status}`);
        }
      }

      console.log(); // Empty line between backups
    }

    console.log('🎯 Available actions:');
    console.log(`   npm run backup:restore <backup-id> --dry-run  # Test restore`);
    console.log(`   npm run backup:restore <backup-id> --confirm   # Actual restore`);
    console.log(`   npm run backup:create "Description"           # Create new backup`);
    
    if (!detailed && backups.length > 0) {
      console.log(`   npm run backup:list --detailed               # Show detailed info`);
    }

  } catch (error) {
    console.error('❌ Failed to list backups:', error);
    process.exit(1);
  }
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getAgeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} minute(s) ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour(s) ago`;
  } else {
    return `${diffDays} day(s) ago`;
  }
}

// Run the listing
listBackups(); 