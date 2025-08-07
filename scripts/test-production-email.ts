import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME;

interface EmailTestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

async function testProductionEmail(recipientEmail: string): Promise<EmailTestResult> {
  const timestamp = new Date().toLocaleString();
  
  console.log(`📧 Testing Production Email Service`);
  console.log(`Recipient: ${recipientEmail}`);
  console.log(`From: ${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('─'.repeat(60));

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }],
          subject: '🎉 YOLOVibe Production Email Test - SUCCESS!',
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        mail_settings: {
          sandbox_mode: { enable: false } // PRODUCTION MODE
        },
        content: [{
          type: 'text/html',
          value: `
            <html>
              <body style="font-family: Arial, sans-serif; padding: 30px; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">
                    🎉 YOLOVibe Production Email Test
                  </h1>
                  
                  <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #155724; margin-top: 0;">✅ Email Service Operational!</h2>
                    <p style="color: #155724; line-height: 1.6; margin-bottom: 0;">
                      This email confirms that the YOLOVibe production email service is working correctly.
                    </p>
                  </div>

                  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">📊 Test Details</h3>
                    <ul style="color: #6c757d; line-height: 1.8;">
                      <li><strong>Environment:</strong> PRODUCTION</li>
                      <li><strong>Service:</strong> SendGrid API</li>
                      <li><strong>From:</strong> ${SENDGRID_FROM_NAME} &lt;${SENDGRID_FROM_EMAIL}&gt;</li>
                      <li><strong>Timestamp:</strong> ${timestamp}</li>
                      <li><strong>Status:</strong> Live Email Sending Active</li>
                    </ul>
                  </div>

                  <div style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #004085; margin-top: 0;">🚀 Ready for Business</h3>
                    <p style="color: #004085; line-height: 1.6;">
                      Your YOLOVibe application is now ready to send:
                    </p>
                    <ul style="color: #004085; line-height: 1.6;">
                      <li>Workshop booking confirmations</li>
                      <li>Payment receipts</li>
                      <li>Consultation reminders</li>
                      <li>Course materials access</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; line-height: 1.6;">
                      Best regards,<br>
                      <strong style="color: #495057;">The YOLOVibe Team</strong>
                    </p>
                    <p style="color: #adb5bd; font-size: 12px; margin-top: 20px;">
                      This is an automated test email from the YOLOVibe production system.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }],
      }),
    });

    if (response.ok) {
      const messageId = response.headers.get('x-message-id');
      console.log(`✅ Email sent successfully!`);
      console.log(`📧 Message ID: ${messageId}`);
      console.log(`📬 Check your inbox at: ${recipientEmail}`);
      
      return {
        success: true,
        messageId: messageId || 'N/A',
        timestamp
      };
    } else {
      const errorBody = await response.json();
      console.error(`❌ Email failed:`, errorBody);
      
      return {
        success: false,
        error: JSON.stringify(errorBody),
        timestamp
      };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

// Main execution
async function main() {
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    console.error('Usage: npx tsx scripts/test-production-email.ts <recipient_email>');
    process.exit(1);
  }

  console.log('🔥 YOLOVibe Production Email Test');
  console.log('='.repeat(60));

  const result = await testProductionEmail(recipientEmail);
  
  console.log('\n📊 Test Results:');
  console.log('─'.repeat(60));
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Timestamp: ${result.timestamp}`);
  
  if (result.success) {
    console.log(`Message ID: ${result.messageId}`);
    console.log('\n🎉 Production email service is fully operational!');
  } else {
    console.log(`Error: ${result.error}`);
    console.log('\n❌ Production email service needs attention.');
  }
}

main().catch(console.error);