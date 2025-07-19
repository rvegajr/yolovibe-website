#!/usr/bin/env tsx

/**
 * Restore Database from Backup
 * 
 * Usage:
 *   npm run backup:restore <backup-id> --dry-run     # Test restore (safe)
 *   npm run backup:restore <backup-id> --confirm     # Actual restore (destructive)
 *   npm run backup:restore <backup-id> --skip-tables users,bookings
 */

import { backupManager } from '../src/registration/database/BackupManager.js';
import { initializeDatabase } from '../src/registration/database/connection.js';

async function restoreBackup() {
  console.log('🔄 YOLOVibe Database Restore Tool');
  console.log('==================================\n');

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const backupId = args[0];
    
    if (!backupId) {
      console.error('❌ Error: Backup ID is required');
      console.log('\nUsage:');
      console.log('  npm run backup:restore <backup-id> --dry-run     # Test restore');
      console.log('  npm run backup:restore <backup-id> --confirm     # Actual restore');
      console.log('  npm run backup:restore <backup-id> --skip-tables users,sessions');
      console.log('\nList available backups:');
      console.log('  npm run backup:list');
      process.exit(1);
    }

    const isDryRun = args.includes('--dry-run');
    const isConfirmed = args.includes('--confirm');
    const skipTablesArg = args.find(arg => arg.startsWith('--skip-tables'));
    const skipTables = skipTablesArg ? skipTablesArg.split('=')[1]?.split(',') || [] : [];

    if (!isDryRun && !isConfirmed) {
      console.error('❌ Error: Restore requires either --dry-run or --confirm flag');
      console.log('\n⚠️  DANGER: Database restore is destructive and will replace all current data!');
      console.log('\n🎯 Safe options:');
      console.log(`  npm run backup:restore ${backupId} --dry-run     # Test restore first`);
      console.log(`  npm run backup:restore ${backupId} --confirm     # Proceed with actual restore`);
      process.exit(1);
    }

    // Initialize database connection
    console.log('📡 Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connected successfully\n');

    // Show warning for actual restore
    if (!isDryRun) {
      console.log('⚠️  WARNING: DESTRUCTIVE OPERATION!');
      console.log('=====================================');
      console.log('This will REPLACE ALL CURRENT DATA with backup data.');
      console.log('A pre-restore backup will be created automatically.');
      
      if (skipTables.length > 0) {
        console.log(`\n📋 Skipping tables: ${skipTables.join(', ')}`);
      }
      
      console.log('\nContinuing in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Perform restore
    await backupManager.restoreFromBackup(backupId, {
      skipTables,
      dryRun: isDryRun,
      confirmRestore: isConfirmed
    });

    if (isDryRun) {
      console.log('\n✅ Dry run completed successfully!');
      console.log('=====================================');
      console.log('The backup file is valid and ready for restore.');
      console.log('\n🎯 To perform actual restore:');
      console.log(`  npm run backup:restore ${backupId} --confirm`);
    } else {
      console.log('\n✅ Database restore completed!');
      console.log('=====================================');
      console.log('Your database has been restored from the backup.');
      console.log('\n🎯 Next steps:');
      console.log('- Verify data integrity');
      console.log('- Test critical functionality');
      console.log('- Check application logs');
      console.log('- Create a new backup: npm run backup:create');
    }

  } catch (error) {
    console.error('\n❌ Restore failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verify backup ID exists: npm run backup:list');
    console.log('- Check database connection');
    console.log('- Review error message above');
    process.exit(1);
  }
}

// Run the restore
restoreBackup(); 