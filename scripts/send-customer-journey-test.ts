#!/usr/bin/env tsx

/**
 * Send Customer Journey Test Emails CLI
 * 
 * Usage:
 *   npm run send-customer-journey -- --email john@example.com --name John
 *   npm run send-customer-journey -- --bulk customer-testers.json
 * 
 * This script sends focused customer journey testing emails with:
 * - Customer mindset and persona guidance
 * - Step-by-step purchase journey
 * - 100% off coupon code (BETATEST100)
 * - Customer-focused feedback questions
 */

import { EmailService } from '../src/infrastructure/email/EmailService.js';
import fs from 'fs/promises';
import path from 'path';

interface CustomerTester {
  firstName: string;
  email: string;
  role?: string;
  customerType?: string; // e.g., "developer", "manager", "entrepreneur"
  notes?: string;
}

interface CustomerTestConfig {
  websiteUrl: string;
  feedbackEmail: string;
  supportEmail: string;
  companyAddress: string;
  expiryDate: string;
  feedbackDeadline: string;
}

class CustomerJourneyTestCLI {
  private emailService: EmailService;
  private config: CustomerTestConfig;

  constructor() {
    this.emailService = new EmailService();
    
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 30);
    
    const feedbackDeadline = new Date();
    feedbackDeadline.setDate(now.getDate() + 14);

    this.config = {
      websiteUrl: process.env.WEBSITE_URL || 'https://your-domain.com',
      feedbackEmail: process.env.FEEDBACK_EMAIL || 'feedback@yolovibe.com',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@yolovibe.com',
      companyAddress: 'YOLOVibe, Inc. • Your City, State',
      expiryDate: expiryDate.toLocaleDateString(),
      feedbackDeadline: feedbackDeadline.toLocaleDateString()
    };
  }

  async sendSingleInvite(firstName: string, email: string): Promise<void> {
    console.log(`📧 Sending customer journey test to ${firstName} (${email})...`);

    try {
      const result = await this.sendCustomerJourneyEmail(firstName, email);

      if (result.success) {
        console.log(`✅ Successfully sent customer journey test to ${email}`);
        console.log(`   Message ID: ${result.messageId}`);
      } else {
        console.error(`❌ Failed to send test to ${email}`);
        console.error(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error sending test to ${email}:`, error);
    }
  }

  async sendBulkInvites(filePath: string): Promise<void> {
    try {
      console.log(`📂 Loading customer testers from ${filePath}...`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const testers: CustomerTester[] = JSON.parse(fileContent);
      
      console.log(`👥 Found ${testers.length} customer testers to invite`);
      console.log('📧 Sending customer journey tests...\n');

      let sent = 0;
      let failed = 0;

      for (const [index, tester] of testers.entries()) {
        console.log(`[${index + 1}/${testers.length}] ${tester.firstName} (${tester.email})`);
        
        try {
          const result = await this.sendCustomerJourneyEmail(tester.firstName, tester.email);

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

      console.log(`\n📊 Customer journey test summary:`);
      console.log(`   ✅ Sent: ${sent}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📈 Success rate: ${((sent / testers.length) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('❌ Error processing bulk customer journey tests:', error);
    }
  }

  private async sendCustomerJourneyEmail(firstName: string, email: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Load the HTML template
      const templatePath = path.join(process.cwd(), 'src/infrastructure/email/templates/customer-journey-test.html');
      let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

      // Replace template variables
      const templateVars = {
        '{{firstName}}': firstName,
        '{{websiteUrl}}': this.config.websiteUrl,
        '{{expiryDate}}': this.config.expiryDate,
        '{{feedbackDeadline}}': this.config.feedbackDeadline,
        '{{feedbackEmail}}': this.config.feedbackEmail,
        '{{supportEmail}}': this.config.supportEmail,
        '{{companyAddress}}': this.config.companyAddress
      };

      // Replace all template variables
      for (const [placeholder, value] of Object.entries(templateVars)) {
        htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), value);
      }

      // Create plain text version
      const plainText = this.htmlToPlainText(htmlTemplate);

      const emailRequest = {
        to: email,
        subject: '🛍️ Test YOLOVibe as a Real Customer (Free with Coupon)',
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

  async createSampleCustomerTestersFile(): Promise<void> {
    const sampleTesters: CustomerTester[] = [
      {
        firstName: 'Sarah',
        email: 'sarah.developer@example.com',
        role: 'Senior Developer',
        customerType: 'technical_professional',
        notes: 'Represents developers looking to upskill - focus on technical credibility'
      },
      {
        firstName: 'Mike',
        email: 'mike.manager@example.com',
        role: 'Engineering Manager',
        customerType: 'team_leader',
        notes: 'Represents managers investing in team development - focus on ROI and outcomes'
      },
      {
        firstName: 'Jessica',
        email: 'jessica.entrepreneur@example.com',
        role: 'Startup Founder',
        customerType: 'entrepreneur',
        notes: 'Represents entrepreneurs seeking practical skills - focus on immediate application'
      },
      {
        firstName: 'David',
        email: 'david.career@example.com',
        role: 'Career Changer',
        customerType: 'career_transition',
        notes: 'Represents career changers - focus on comprehensive learning and support'
      },
      {
        firstName: 'Lisa',
        email: 'lisa.consultant@example.com',
        role: 'Independent Consultant',
        customerType: 'freelancer',
        notes: 'Represents consultants expanding skills - focus on credibility and certification'
      }
    ];

    const filePath = 'customer-testers-sample.json';
    await fs.writeFile(filePath, JSON.stringify(sampleTesters, null, 2));
    
    console.log(`📝 Created sample customer testers file: ${filePath}`);
    console.log('Edit this file with your actual customer testers and run:');
    console.log(`npm run send-customer-journey -- --bulk ${filePath}`);
  }

  showHelp(): void {
    console.log(`
🛍️ YOLOVibe Customer Journey Test CLI

This tool sends focused emails asking testers to experience your platform as real customers
ready to purchase. They'll get a 100% off coupon code (BETATEST100) to complete the purchase.

Usage:
  npm run send-customer-journey                                          Show this help
  npm run send-customer-journey -- --email john@example.com --name John  Send single test
  npm run send-customer-journey -- --bulk customer-testers.json          Send bulk tests  
  npm run send-customer-journey -- --create-sample                       Create sample file

Options:
  --email EMAIL      Email address for single customer journey test
  --name NAME        First name for single test
  --bulk FILE        JSON file with array of customer testers
  --create-sample    Create a sample customer-testers.json file
  --help             Show this help message

Examples:
  npm run send-customer-journey -- --email sarah@example.com --name Sarah
  npm run send-customer-journey -- --bulk my-customer-testers.json

Customer Tester JSON format:
  [
    {
      "firstName": "Sarah",
      "email": "sarah@example.com",
      "role": "Senior Developer", 
      "customerType": "technical_professional",
      "notes": "Focus on technical credibility and learning outcomes"
    }
  ]

What This Email Does:
  ✅ Sets customer mindset - "You're ready to purchase"
  ✅ Provides 100% off coupon code (BETATEST100)
  ✅ Guides through 6-step customer journey
  ✅ Asks customer-focused feedback questions
  ✅ Tests trust, value perception, and purchase experience

Environment Variables:
  WEBSITE_URL       Your website URL (default: https://your-domain.com)
  FEEDBACK_EMAIL    Email for receiving feedback
  SUPPORT_EMAIL     Support email address
    `);
  }
}

// Main CLI execution
async function main() {
  const cli = new CustomerJourneyTestCLI();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    cli.showHelp();
    return;
  }

  if (args.includes('--create-sample')) {
    await cli.createSampleCustomerTestersFile();
    return;
  }

  const emailIndex = args.indexOf('--email');
  const nameIndex = args.indexOf('--name');
  const bulkIndex = args.indexOf('--bulk');

  if (emailIndex !== -1 && nameIndex !== -1) {
    const email = args[emailIndex + 1];
    const name = args[nameIndex + 1];
    
    if (!email || !name) {
      console.error('❌ Both --email and --name are required for single tests');
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