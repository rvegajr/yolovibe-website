/**
 * Testing Email Service
 * 
 * Handles sending beta testing invitation emails to selected users
 * with personalized coupon codes and testing instructions.
 */

import type { IEmailSender } from '../core/interfaces/index.js';
import type { EmailRequest, EmailResult } from '../core/types/index.js';
import { testCouponManager } from './TestCouponManager.js';
import fs from 'fs/promises';
import path from 'path';

export interface TestingInvite {
  firstName: string;
  email: string;
  websiteUrl: string;
  expiryDate: string;
  testingStartDate: string;
  testingEndDate: string;
  feedbackDeadline: string;
  feedbackEmail: string;
  feedbackFormUrl?: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  companyAddress: string;
}

export class TestingEmailService {
  constructor(private emailSender: IEmailSender) {}

  async sendTestingInvitation(invite: TestingInvite): Promise<EmailResult> {
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
        '{{feedbackFormUrl}}': invite.feedbackFormUrl || '#',
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

      const emailRequest: EmailRequest = {
        to: invite.email,
        subject: '🎉 You\'re Invited to Beta Test YOLOVibe!',
        html: htmlTemplate,
        text: plainText,
        from: invite.supportEmail
      };

      const result = await this.emailSender.sendEmail(emailRequest);
      
      if (result.success) {
        console.log(`Testing invitation sent to ${invite.email}`);
      } else {
        console.error(`Failed to send testing invitation to ${invite.email}:`, result.error);
      }

      return result;

    } catch (error) {
      console.error('Error sending testing invitation:', error);
      return {
        success: false,
        messageId: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulkTestingInvitations(invites: TestingInvite[]): Promise<{
    sent: number;
    failed: number;
    results: { email: string; success: boolean; error?: string }[]
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const invite of invites) {
      try {
        const result = await this.sendTestingInvitation(invite);
        
        if (result.success) {
          sent++;
          results.push({ email: invite.email, success: true });
        } else {
          failed++;
          results.push({ 
            email: invite.email, 
            success: false, 
            error: result.error || 'Unknown error' 
          });
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        failed++;
        results.push({ 
          email: invite.email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`Bulk testing invitations complete: ${sent} sent, ${failed} failed`);
    
    return { sent, failed, results };
  }

  async sendTestingReminder(invite: TestingInvite): Promise<EmailResult> {
    const reminderHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🔔 YOLOVibe Testing Reminder</h1>
          
          <p>Hi ${invite.firstName},</p>
          
          <p>Just a friendly reminder that you're invited to test our YOLOVibe platform! We haven't seen you try it out yet, and we'd love to get your feedback.</p>
          
          <div style="background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">🎁 Your FREE Testing Coupons</h3>
            <div style="font-family: 'Monaco', 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #92400e; background: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 5px; border: 1px solid #f59e0b;">BETATEST100</div>
            <div style="font-family: 'Monaco', 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #92400e; background: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 5px; border: 1px solid #f59e0b;">TESTFREE50</div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invite.websiteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">🚀 Start Testing Now</a>
          </div>
          
          <p><strong>Testing deadline:</strong> ${invite.feedbackDeadline}</p>
          
          <p>It only takes 10-15 minutes to test the key features, and your feedback will help us create a better platform for everyone!</p>
          
          <p>Questions? Reply to this email or contact us at ${invite.supportEmail}</p>
          
          <p>Thanks!<br>The YOLOVibe Team</p>
        </div>
      </div>
    `;

    const plainText = `
YOLOVibe Testing Reminder

Hi ${invite.firstName},

Just a friendly reminder that you're invited to test our YOLOVibe platform! We haven't seen you try it out yet, and we'd love to get your feedback.

Your FREE testing coupons:
- BETATEST100 (100% off any workshop)
- TESTFREE50 (50% off + free materials)

Start testing: ${invite.websiteUrl}

Testing deadline: ${invite.feedbackDeadline}

It only takes 10-15 minutes to test the key features, and your feedback will help us create a better platform for everyone!

Questions? Reply to this email or contact us at ${invite.supportEmail}

Thanks!
The YOLOVibe Team
    `;

    const emailRequest: EmailRequest = {
      to: invite.email,
      subject: '🔔 Reminder: Your YOLOVibe Beta Testing Invitation',
      html: reminderHtml,
      text: plainText,
      from: invite.supportEmail
    };

    return await this.emailSender.sendEmail(emailRequest);
  }

  async sendTestingThankYou(email: string, firstName: string, supportEmail: string): Promise<EmailResult> {
    const thankYouHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h1 style="color: #10b981; text-align: center; margin-bottom: 20px;">🙏 Thank You for Testing YOLOVibe!</h1>
          
          <p>Hi ${firstName},</p>
          
          <p>Thank you so much for taking the time to test YOLOVibe! Your feedback is incredibly valuable and will help us build a better platform.</p>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #059669;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll review your feedback and incorporate improvements</li>
              <li>You'll be among the first to know when we officially launch</li>
              <li>Early testers get special launch pricing and bonuses</li>
            </ul>
          </div>
          
          <p>If you have any additional thoughts or run into any issues, please don't hesitate to reach out to us at ${supportEmail}</p>
          
          <p>We're excited to build something amazing together!</p>
          
          <p>Best regards,<br>The YOLOVibe Team</p>
        </div>
      </div>
    `;

    const plainText = `
Thank You for Testing YOLOVibe!

Hi ${firstName},

Thank you so much for taking the time to test YOLOVibe! Your feedback is incredibly valuable and will help us build a better platform.

What's Next?
- We'll review your feedback and incorporate improvements
- You'll be among the first to know when we officially launch
- Early testers get special launch pricing and bonuses

If you have any additional thoughts or run into any issues, please don't hesitate to reach out to us at ${supportEmail}

We're excited to build something amazing together!

Best regards,
The YOLOVibe Team
    `;

    const emailRequest: EmailRequest = {
      to: email,
      subject: '🙏 Thank You for Beta Testing YOLOVibe!',
      html: thankYouHtml,
      text: plainText,
      from: supportEmail
    };

    return await this.emailSender.sendEmail(emailRequest);
  }

  private htmlToPlainText(html: string): string {
    // Simple HTML to plain text conversion
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

  // Helper method to create default testing invite
  createDefaultInvite(firstName: string, email: string): TestingInvite {
    const now = new Date();
    const testingEnd = new Date();
    testingEnd.setDate(now.getDate() + 14); // 2 weeks of testing
    
    const feedbackDeadline = new Date();
    feedbackDeadline.setDate(now.getDate() + 21); // 3 weeks for feedback
    
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 30); // Coupons valid for 30 days

    return {
      firstName,
      email,
      websiteUrl: process.env.WEBSITE_URL || 'https://your-domain.com',
      expiryDate: expiryDate.toLocaleDateString(),
      testingStartDate: now.toLocaleDateString(),
      testingEndDate: testingEnd.toLocaleDateString(),
      feedbackDeadline: feedbackDeadline.toLocaleDateString(),
      feedbackEmail: process.env.FEEDBACK_EMAIL || 'feedback@yolovibe.com',
      feedbackFormUrl: process.env.FEEDBACK_FORM_URL,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@yolovibe.com',
      supportPhone: process.env.SUPPORT_PHONE || '(555) 123-4567',
      supportHours: 'Monday-Friday 9AM-6PM EST',
      companyAddress: 'YOLOVibe, Inc. • Your Address Here'
    };
  }

  // Generate coupon usage report for testing
  async generateCouponUsageReport(): Promise<string> {
    return testCouponManager.generateTestCouponReport();
  }
}

// Export singleton instance
export const testingEmailService = new TestingEmailService(
  // You'll need to inject your actual email sender implementation
  null as any // This will be replaced with actual email sender
); 