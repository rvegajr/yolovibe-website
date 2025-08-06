#!/usr/bin/env tsx
/**
 * Simple Email Test - Send actual test email
 */

import { config } from 'dotenv';
config();

const sendTestEmail = async (toEmail: string) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME;

  console.log(`📧 Sending test email...`);
  console.log(`From: ${fromName} <${fromEmail}>`);
  console.log(`To: ${toEmail}`);
  console.log('');

  const emailData = {
    personalizations: [{
      to: [{ email: toEmail }],
      subject: `YOLOVibe Test Email - ${new Date().toLocaleString()}`
    }],
    from: {
      email: fromEmail,
      name: fromName
    },
    content: [{
      type: 'text/html',
      value: `
        <h1>🎯 YOLOVibe Test Email</h1>
        <p>This is a test email from YOLOVibe system.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <p>✅ Email service is working correctly!</p>
      `
    }]
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const messageId = response.headers.get('x-message-id');
      console.log('✅ Email sent successfully!');
      console.log(`Message ID: ${messageId}`);
      console.log('📬 Check your inbox!');
    } else {
      const errorText = await response.text();
      console.log('❌ Email failed:');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Error: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Error sending email:', error);
  }
};

const toEmail = process.argv[2] || 'rvegajr@yolovibecodebootcamp.com';
sendTestEmail(toEmail);