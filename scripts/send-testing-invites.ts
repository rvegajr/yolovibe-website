#!/usr/bin/env tsx

/**
 * Send Beta Testing Invitations CLI
 * 
 * Usage:
 *   npm run send-testing-invites
 *   npm run send-testing-invites -- --email john@example.com --name John
 *   npm run send-testing-invites -- --bulk testers.json
 * 
 * This script sends professional beta testing invitations with:
 * - Personalized email templates
 * - Free testing coupon codes (BETATEST100, TESTFREE50)
 * - Comprehensive testing scenarios
 * - Clear feedback instructions
 */

import { EmailService } from '../src/infrastructure/email/EmailService.js';
import { testCouponManager } from '../src/registration/implementations/TestCouponManager.js';
import fs from 'fs/promises';
import path from 'path';

interface Tester {
  firstName: string;
  email: string;
  role?: string;
  notes?: string;
}

interface TestingConfig {
  websiteUrl: string;
  testingPeriodDays: number;
  feedbackDeadlineDays: number;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
}

class TestingInvitationCLI {
  private emailService: EmailService;
  private config: TestingConfig;

  constructor() {
    this.emailService = new EmailService();
    this.config = {
      websiteUrl: process.env.WEBSITE_URL || 'https://your-domain.com',
      testingPeriodDays: 14,
      feedbackDeadlineDays: 21,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@yolovibe.com',
      supportPhone: process.env.SUPPORT_PHONE || '(555) 123-4567',
      companyAddress: 'YOLOVibe, Inc. • Your City, State'
    };
  }

  async sendSingleInvite(firstName: string, email: string): Promise<void> {
    console.log(`📧 Sending testing invitation to ${firstName} (${email})...`);

    try {
      const invite = this.createInvite(firstName, email);
      const result = await this.sendTestingEmail(invite);

      if (result.success) {
        console.log(`✅ Successfully sent invitation to ${email}`);
        console.log(`   Message ID: ${result.messageId}`);
      } else {
        console.error(`❌ Failed to send invitation to ${email}`);
        console.error(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error sending invitation to ${email}:`, error);
    }
  }

  async sendBulkInvites(filePath: string): Promise<void> {
    try {
      console.log(`📂 Loading testers from ${filePath}...`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const testers: Tester[] = JSON.parse(fileContent);
      
      console.log(`👥 Found ${testers.length} testers to invite`);
      console.log('📧 Sending invitations...\n');

      let sent = 0;
      let failed = 0;

      for (const [index, tester] of testers.entries()) {
        console.log(`[${index + 1}/${testers.length}] ${tester.firstName} (${tester.email})`);
        
        try {
          const invite = this.createInvite(tester.firstName, tester.email);
          const result = await this.sendTestingEmail(invite);

          if (result.success) {
            sent++;
            console.log(`   ✅ Sent successfully`);
          } else {
            failed++;
            console.log(`   ❌ Failed: ${result.error}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          failed++;
          console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`\n📊 Bulk invitation summary:`);
      console.log(`   ✅ Sent: ${sent}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📈 Success rate: ${((sent / testers.length) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('❌ Error processing bulk invitations:', error);
    }
  }

  private createInvite(firstName: string, email: string) {
    const now = new Date();
    const testingEnd = new Date();
    testingEnd.setDate(now.getDate() + this.config.testingPeriodDays);
    
    const feedbackDeadline = new Date();
    feedbackDeadline.setDate(now.getDate() + this.config.feedbackDeadlineDays);
    
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 30);

    return {
      firstName,
      email,
      websiteUrl: this.config.websiteUrl,
      expiryDate: expiryDate.toLocaleDateString(),
      testingStartDate: now.toLocaleDateString(),
      testingEndDate: testingEnd.toLocaleDateString(),
      feedbackDeadline: feedbackDeadline.toLocaleDateString(),
      feedbackEmail: this.config.supportEmail,
      feedbackFormUrl: process.env.FEEDBACK_FORM_URL || '#',
      supportEmail: this.config.supportEmail,
      supportPhone: this.config.supportPhone,
      supportHours: 'Monday-Friday 9AM-6PM EST',
      companyAddress: this.config.companyAddress
    };
  }

  private async sendTestingEmail(invite: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Load the HTML template
      const templatePath = path.join(process.cwd(), 'src/infrastructure/email/templates/user-testing-invite.html');
      let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

      // Replace template variables
      const templateVars = {
        '{{firstName}}': invite.firstName,
        '{{websiteUrl}}': invite.websiteUrl,
        '{{expiryDate}}': invite.expiryDate,
        '{{testingStartDate}}': invite.testingStartDate,
        '{{testingEndDate}}': invite.testingEndDate,
        '{{feedbackDeadline}}': invite.feedbackDeadline,
        '{{feedbackEmail}}': invite.feedbackEmail,
        '{{feedbackFormUrl}}': invite.feedbackFormUrl,
        '{{supportEmail}}': invite.supportEmail,
        '{{supportPhone}}': invite.supportPhone,
        '{{supportHours}}': invite.supportHours,
        '{{companyAddress}}': invite.companyAddress
      };

      // Replace all template variables
      for (const [placeholder, value] of Object.entries(templateVars)) {
        htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), value);
      }

      // Create plain text version
      const plainText = this.htmlToPlainText(htmlTemplate);

      const emailRequest = {
        to: invite.email,
        subject: '🎉 You\'re Invited to Beta Test YOLOVibe!',
        htmlContent: htmlTemplate,
        textContent: plainText
      };

      const result = await this.emailService.sendEmail(emailRequest);
      
      return {
        success: result.status === 'sent',
        messageId: result.messageId,
        error: result.status === 'failed' ? 'Email failed to send' : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private htmlToPlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  async showCouponStatus(): Promise<void> {
    console.log('🎫 Current Test Coupon Status:\n');
    
    const stats = testCouponManager.getTestCouponStats();
    
    for (const stat of stats) {
      const percentage = (stat.used / stat.limit) * 100;
      const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
      
      console.log(`${stat.code}:`);
      console.log(`  Usage: ${stat.used}/${stat.limit} (${percentage.toFixed(1)}%)`);
      console.log(`  ${bar} ${stat.remaining} remaining\n`);
    }
  }

  async createSampleTestersFile(): Promise<void> {
    const sampleTesters: Tester[] = [
      {
        firstName: 'Alice',
        email: 'alice@example.com',
        role: 'Developer',
        notes: 'Experienced with booking systems'
      },
      {
        firstName: 'Bob',
        email: 'bob@example.com',
        role: 'Designer',
        notes: 'UX/UI feedback focus'
      },
      {
        firstName: 'Charlie',
        email: 'charlie@example.com',
        role: 'Manager',
        notes: 'Business process perspective'
      }
    ];

    const filePath = 'testers-sample.json';
    await fs.writeFile(filePath, JSON.stringify(sampleTesters, null, 2));
    
    console.log(`📝 Created sample testers file: ${filePath}`);
    console.log('Edit this file with your actual testers and run:');
    console.log(`npm run send-testing-invites -- --bulk ${filePath}`);
  }

  showHelp(): void {
    console.log(`
🧪 YOLOVibe Beta Testing Invitation CLI

Usage:
  npm run send-testing-invites                                    Show this help
  npm run send-testing-invites -- --email john@example.com --name John    Send single invite
  npm run send-testing-invites -- --bulk testers.json                     Send bulk invites
  npm run send-testing-invites -- --status                               Show coupon status
  npm run send-testing-invites -- --create-sample                        Create sample file

Options:
  --email EMAIL      Email address for single invitation
  --name NAME        First name for single invitation  
  --bulk FILE        JSON file with array of testers
  --status           Show current coupon usage statistics
  --create-sample    Create a sample testers.json file
  --help             Show this help message

Examples:
  npm run send-testing-invites -- --email alice@example.com --name Alice
  npm run send-testing-invites -- --bulk my-testers.json
  npm run send-testing-invites -- --status

Tester JSON format:
  [
    {
      "firstName": "Alice",
      "email": "alice@example.com", 
      "role": "Developer",
      "notes": "Focus on technical aspects"
    }
  ]

Environment Variables:
  WEBSITE_URL       Your website URL (default: https://your-domain.com)
  SUPPORT_EMAIL     Support email address
  SUPPORT_PHONE     Support phone number
  FEEDBACK_FORM_URL Optional feedback form URL
    `);
  }
}

// Main CLI execution
async function main() {
  const cli = new TestingInvitationCLI();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    cli.showHelp();
    return;
  }

  if (args.includes('--status')) {
    await cli.showCouponStatus();
    return;
  }

  if (args.includes('--create-sample')) {
    await cli.createSampleTestersFile();
    return;
  }

  const emailIndex = args.indexOf('--email');
  const nameIndex = args.indexOf('--name');
  const bulkIndex = args.indexOf('--bulk');

  if (emailIndex !== -1 && nameIndex !== -1) {
    const email = args[emailIndex + 1];
    const name = args[nameIndex + 1];
    
    if (!email || !name) {
      console.error('❌ Both --email and --name are required for single invites');
      return;
    }
    
    await cli.sendSingleInvite(name, email);
    
  } else if (bulkIndex !== -1) {
    const filePath = args[bulkIndex + 1];
    
    if (!filePath) {
      console.error('❌ File path is required for --bulk option');
      return;
    }
    
    await cli.sendBulkInvites(filePath);
    
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
  }
}

// Run the CLI
main().catch(console.error); 