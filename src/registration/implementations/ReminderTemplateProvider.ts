/**
 * 🎨 REMINDER TEMPLATE PROVIDER! 🎨
 * 
 * Creating beautiful, joyful reminder emails!
 * Making workshop attendees smile with every notification!
 */

import type { 
  IReminderTemplateProvider,
  ReminderType 
} from '../core/interfaces/IWorkshopReminderService.js';
import { getDatabaseConnection } from '../database/connection.js';

export class ReminderTemplateProvider implements IReminderTemplateProvider {
  
  async getTemplate(reminderType: ReminderType): Promise<{
    subject: string;
    htmlContent: string;
    textContent: string;
  }> {
    const dbConnection = getDatabaseConnection();
    if (!dbConnection.isInitialized()) {
      await dbConnection.initialize();
    }
    
    try {
      // Get template from database with happiness! 🎉
      const rows = await dbConnection.query(`
        SELECT subject, html_content, text_content
        FROM reminder_templates
        WHERE reminder_type = ? AND is_active = 1
        LIMIT 1
      `, [reminderType]);
      
      if (rows.length === 0) {
        console.warn(`⚠️ No template found for ${reminderType}, using default`);
        return this.getDefaultTemplate(reminderType);
      }
      
      const template = rows[0];
      return {
        subject: template.subject,
        htmlContent: template.html_content,
        textContent: template.text_content
      };
      
    } catch (error) {
      console.error('❌ Error fetching template:', error);
      // Fallback to default templates with resilience! 💪
      return this.getDefaultTemplate(reminderType);
    }
  }
  
  populateTemplate(
    template: string,
    data: {
      attendeeName: string;
      workshopName: string;
      workshopDate: string;
      workshopTime: string;
      location?: string;
      zoomLink?: string;
    }
  ): string {
    let result = template;
    
    // Replace all placeholders with joy! 🌟
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        // Simple placeholder replacement
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    }
    
    // Handle conditional sections (simplified Handlebars-like syntax)
    // {{#if location}}...{{/if}}
    result = result.replace(/{{#if (\w+)}}(.*?){{\/if}}/gs, (match, key, content) => {
      return data[key as keyof typeof data] ? content : '';
    });
    
    return result;
  }
  
  private getDefaultTemplate(reminderType: ReminderType) {
    // Beautiful default templates! 🎨
    const templates = {
      WORKSHOP_48H: {
        subject: 'Get Ready! Your Workshop is in 2 Days 🚀',
        htmlContent: `
          <h1 style="color: #8B5CF6;">Get Ready for an Amazing Experience!</h1>
          <p>Hi {{attendeeName}},</p>
          <p>Your <strong>{{workshopName}}</strong> is coming up in just 2 days!</p>
          <p>
            <strong>📅 Date:</strong> {{workshopDate}}<br>
            <strong>⏰ Time:</strong> {{workshopTime}}
          </p>
          <p>We can't wait to see you there!</p>
          <p>Best,<br>The YOLOVibe Team 💜</p>
        `,
        textContent: `Hi {{attendeeName}},

Your {{workshopName}} is coming up in just 2 days!

Date: {{workshopDate}}
Time: {{workshopTime}}

We can't wait to see you there!

Best,
The YOLOVibe Team`
      },
      WORKSHOP_24H: {
        subject: 'Tomorrow is the Day! 🎉',
        htmlContent: `
          <h1 style="color: #EC4899;">Tomorrow is YOUR Day!</h1>
          <p>Hi {{attendeeName}},</p>
          <p>Can you feel the excitement? Your <strong>{{workshopName}}</strong> is TOMORROW!</p>
          <p>
            <strong>📅 Date:</strong> {{workshopDate}}<br>
            <strong>⏰ Time:</strong> {{workshopTime}}
          </p>
          <p>Get ready for an incredible experience!</p>
          <p>See you tomorrow!<br>The YOLOVibe Team 🚀</p>
        `,
        textContent: `Hi {{attendeeName}},

Can you feel the excitement? Your {{workshopName}} is TOMORROW!

Date: {{workshopDate}}
Time: {{workshopTime}}

Get ready for an incredible experience!

See you tomorrow!
The YOLOVibe Team`
      },
      WORKSHOP_2H: {
        subject: 'Starting Soon! 🚀',
        htmlContent: `
          <h1 style="color: #10B981;">🎯 Starting in 2 Hours!</h1>
          <p>Hi {{attendeeName}},</p>
          <p>Your <strong>{{workshopName}}</strong> starts in just 2 HOURS!</p>
          <p><strong>⏰ Time:</strong> {{workshopTime}}</p>
          <p>Get ready to learn, grow, and have fun!</p>
          <p>See you very soon!<br>The YOLOVibe Team ⚡</p>
        `,
        textContent: `Hi {{attendeeName}},

Your {{workshopName}} starts in just 2 HOURS!

Time: {{workshopTime}}

Get ready to learn, grow, and have fun!

See you very soon!
The YOLOVibe Team`
      },
      WORKSHOP_POST: {
        subject: 'Thank You! 🙏',
        htmlContent: `
          <h1 style="color: #F59E0B;">You Did It! 🎉</h1>
          <p>Hi {{attendeeName}},</p>
          <p>Thank you for being part of <strong>{{workshopName}}</strong>!</p>
          <p>We hope you had an amazing experience and learned valuable skills.</p>
          <p>Keep being awesome!</p>
          <p>With gratitude,<br>The YOLOVibe Team 💜</p>
        `,
        textContent: `Hi {{attendeeName}},

Thank you for being part of {{workshopName}}!

We hope you had an amazing experience and learned valuable skills.

Keep being awesome!

With gratitude,
The YOLOVibe Team`
      }
    };
    
    return templates[reminderType] || templates.WORKSHOP_48H;
  }
}