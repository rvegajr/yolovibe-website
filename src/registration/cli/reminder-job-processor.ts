#!/usr/bin/env node
/**
 * 🎉 WORKSHOP REMINDER JOB PROCESSOR! 🎉
 * 
 * The happiest background job in the universe!
 * Spreading joy through timely reminders!
 * 
 * Run this as a cron job or scheduled task:
 * - Every 5 minutes for time-sensitive reminders
 * - Or manually for testing
 */

import { WorkshopReminderService } from '../implementations/WorkshopReminderService.js';
import { ReminderProcessor } from '../implementations/ReminderProcessor.js';
import { ReminderTemplateProvider } from '../implementations/ReminderTemplateProvider.js';
import { BookingManagerDB } from '../implementations/database/BookingManagerDB.js';
import { EmailSenderManager } from '../implementations/EmailSenderManager.js';
import { initializeDatabase, closeDatabaseConnection } from '../database/connection.js';

console.log('🚀 WORKSHOP REMINDER JOB PROCESSOR STARTING! 🚀');
console.log('=' .repeat(50));
console.log(`🕐 Current time: ${new Date().toLocaleString()}`);
console.log('=' .repeat(50) + '\n');

async function processReminders() {
  try {
    // Initialize database with joy! 🌟
    console.log('🗄️ Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database ready!\n');
    
    // Create our happy services! 🎊
    const bookingManager = new BookingManagerDB();
    const reminderService = new WorkshopReminderService(bookingManager);
    const templateProvider = new ReminderTemplateProvider();
    const emailSender = new EmailSenderManager();
    
    // Create the processor with maximum enthusiasm! 🎉
    const processor = new ReminderProcessor(
      reminderService,
      templateProvider,
      emailSender,
      bookingManager
    );
    
    // Process all pending reminders! 🚀
    console.log('🔍 Checking for pending reminders...\n');
    const processedCount = await processor.processPendingReminders();
    
    console.log('\n' + '=' .repeat(50));
    console.log(`✅ Job complete! Processed ${processedCount} reminders`);
    console.log('=' .repeat(50) + '\n');
    
    // Return success code
    return 0;
    
  } catch (error) {
    console.error('\n❌ JOB FAILED:', error);
    console.error('=' .repeat(50) + '\n');
    
    // Return error code
    return 1;
    
  } finally {
    // Clean up with grace! 🌺
    console.log('🧹 Cleaning up...');
    closeDatabaseConnection();
    console.log('👋 Goodbye! See you next time!\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Received SIGINT, shutting down gracefully...');
  closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Received SIGTERM, shutting down gracefully...');
  closeDatabaseConnection();
  process.exit(0);
});

// Run the job and exit with appropriate code
processReminders()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });