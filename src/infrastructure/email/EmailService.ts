import sgMail from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';
import type { AppConfig } from '../config';

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private readonly fromEmail: string;
  
  constructor(private readonly config: AppConfig) {
    sgMail.setApiKey(config.sendgrid.apiKey);
    this.fromEmail = config.sendgrid.fromEmail;
  }

  /**
   * Send an email using a template
   * @param to Recipient email address
   * @param template Email template containing subject, text and HTML content
   * @param templateData Data to be injected into the template
   * @returns Promise resolving to the SendGrid response
   */
  async sendTemplatedEmail(
    to: string,
    template: EmailTemplate,
    templateData: Record<string, string | number | boolean> = {}
  ): Promise<[sgMail.ClientResponse, {}]> {
    // Replace template variables with actual data
    const processedTemplate = this.processTemplate(template, templateData);
    
    const msg: MailDataRequired = {
      to,
      from: this.fromEmail,
      subject: processedTemplate.subject,
      text: processedTemplate.text,
      html: processedTemplate.html,
    };

    return sgMail.send(msg);
  }

  /**
   * Process a template by replacing variables with actual data
   * @param template Email template
   * @param data Data to inject into the template
   * @returns Processed template with variables replaced
   */
  private processTemplate(
    template: EmailTemplate,
    data: Record<string, string | number | boolean>
  ): EmailTemplate {
    let { subject, text, html } = template;

    // Replace all {{variable}} occurrences with the actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      text = text.replace(regex, String(value));
      html = html.replace(regex, String(value));
    });

    return { subject, text, html };
  }

  /**
   * Send a test email to verify SendGrid configuration
   * @param to Recipient email address
   * @returns Promise resolving to the SendGrid response
   */
  async sendTestEmail(to: string): Promise<[sgMail.ClientResponse, {}]> {
    const template = {
      subject: 'YOLOVibe Workshop System - Test Email',
      text: 'This is a test email from the YOLOVibe Workshop Registration System. If you received this email, the SendGrid integration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">YOLOVibe Workshop System</h2>
          <p>This is a test email from the YOLOVibe Workshop Registration System.</p>
          <p>If you received this email, the SendGrid integration is working correctly.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    };

    return this.sendTemplatedEmail(to, template);
  }

  /**
   * Send a workshop confirmation email
   * @param to Recipient email address
   * @param workshopData Workshop data
   * @returns Promise resolving to the SendGrid response
   */
  async sendWorkshopConfirmation(
    to: string,
    workshopData: {
      name: string;
      date: string;
      location: string;
      package: string;
      amount: string;
      confirmationCode: string;
    }
  ): Promise<[sgMail.ClientResponse, {}]> {
    const template = {
      subject: 'YOLOVibe Workshop Confirmation - {{confirmationCode}}',
      text: `
Hello {{name}},

Thank you for registering for the YOLOVibe Workshop!

Workshop Details:
- Date: {{date}}
- Location: {{location}}
- Package: {{package}}
- Amount Paid: {{amount}}
- Confirmation Code: {{confirmationCode}}

We look forward to seeing you at the workshop. If you have any questions, please don't hesitate to contact us.

Best regards,
The YOLOVibe Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">YOLOVibe Workshop Confirmation</h2>
          <p>Hello {{name}},</p>
          <p>Thank you for registering for the YOLOVibe Workshop!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Workshop Details</h3>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>Package:</strong> {{package}}</p>
            <p><strong>Amount Paid:</strong> {{amount}}</p>
            <p><strong>Confirmation Code:</strong> <span style="background-color: #eee; padding: 3px 6px; border-radius: 3px;">{{confirmationCode}}</span></p>
          </div>
          
          <p>We look forward to seeing you at the workshop. If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The YOLOVibe Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from the YOLOVibe Workshop Registration System.</p>
        </div>
      `,
    };

    return this.sendTemplatedEmail(to, template, workshopData);
  }
}
