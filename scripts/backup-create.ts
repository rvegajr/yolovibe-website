#!/usr/bin/env tsx

/**
 * Create Manual Database Backup
 * 
 * Usage:
 *   npm run backup:create
 *   npm run backup:create "Description of backup"
 */

import { backupManager } from '../src/registration/database/BackupManager.js';
import { initializeDatabase } from '../src/registration/database/connection.js';

async function createBackup() {
  console.log('🚀 YOLOVibe Database Backup Tool');
  console.log('=====================================\n');

  try {
    // Initialize database connection
    console.log('📡 Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connected successfully\n');

    // Get description from command line arguments
    const description = process.argv[2] || `Manual backup - ${new Date().toLocaleString()}`;

    // Create backup
    console.log(`📋 Creating backup: "${description}"`);
    const backup = await backupManager.createBackup(description);

    console.log('\n✅ Backup completed successfully!');
    console.log('=====================================');
    console.log(`📦 Backup ID: ${backup.id}`);
    console.log(`📄 Filename: ${backup.filename}`);
    console.log(`📊 Size: ${formatSize(backup.size)}`);
    console.log(`📋 Tables: ${backup.tables.length}`);
    console.log(`📈 Total Records: ${Object.values(backup.recordCounts).reduce((a, b) => a + b, 0)}`);
    console.log(`🔐 Checksum: ${backup.checksum.substring(0, 16)}...`);
    console.log(`📅 Created: ${backup.timestamp.toLocaleString()}`);
    
    if (backup.description) {
      console.log(`📝 Description: ${backup.description}`);
    }

    console.log('\n🎯 Next steps:');
    console.log('- View all backups: npm run backup:list');
    console.log('- Test restore: npm run backup:restore <backup-id> --dry-run');
    console.log('- Start auto backups: npm run backup:schedule');

  } catch (error) {
    console.error('\n❌ Backup failed:', error);
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

// Run the backup
createBackup(); 