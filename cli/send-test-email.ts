#!/usr/bin/env tsx

import { program } from 'commander';
import chalk from 'chalk';
import { configLoader } from '../src/infrastructure/config';
import { EmailService } from '../src/infrastructure/email/EmailService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure the CLI
program
  .name('send-test-email')
  .description('Send a test email using SendGrid to verify email configuration')
  .version('1.0.0')
  .requiredOption('-e, --email <email>', 'Recipient email address')
  .option('-t, --type <type>', 'Email type: test or workshop', 'test')
  .option('-v, --verbose', 'Show detailed output')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    // Load configuration
    const config = configLoader.loadAndValidate();
    
    // Initialize email service
    const emailService = new EmailService(config);
    
    console.log(chalk.blue('Sending test email...'));
    console.log(chalk.gray(`From: ${config.sendgrid.fromEmail}`));
    console.log(chalk.gray(`To: ${options.email}`));
    
    let response;
    
    // Send the appropriate email type
    if (options.type === 'workshop') {
      console.log(chalk.blue('Sending workshop confirmation test email'));
      
      // Sample workshop data
      const workshopData = {
        name: 'Test User',
        date: 'June 25-27, 2025',
        location: 'YOLOVibe Studio, Austin TX',
        package: '3-Day Workshop Package',
        amount: '$599.00',
        confirmationCode: 'WS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      };
      
      response = await emailService.sendWorkshopConfirmation(options.email, workshopData);
    } else {
      console.log(chalk.blue('Sending basic test email'));
      response = await emailService.sendTestEmail(options.email);
    }
    
    // Output results
    if (options.verbose) {
      console.log(chalk.gray('SendGrid Response:'), response[0]);
    }
    
    console.log(chalk.green('✓ Email sent successfully!'));
    console.log(chalk.gray('Check your inbox to verify receipt.'));
  } catch (error) {
    console.error(chalk.red('Error sending email:'));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
