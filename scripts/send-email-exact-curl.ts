#!/usr/bin/env tsx
/**
 * Exact replica of the working curl command
 */

const sendEmail = async (toEmail: string) => {
  console.log(`📧 Sending email to: ${toEmail}`);
  console.log('Using exact curl format that worked...');
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: toEmail }],
        subject: 'YOLOVibe Email Test - SUCCESS!'
      }],
      from: {
        email: 'contact@yolovibecodebootcamp.com',
        name: 'YOLOVibeCoders'
      },
      mail_settings: {
        sandbox_mode: { enable: false }
      },
      content: [{
        type: 'text/html',
        value: `
          <h1>🎉 SUCCESS!</h1>
          <p>Email system is now working perfectly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p>✅ All integrations are operational!</p>
        `
      }]
    })
  });

  console.log(`Status: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    const messageId = response.headers.get('x-message-id');
    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${messageId}`);
    console.log('📬 Check your inbox!');
    return true;
  } else {
    const errorText = await response.text();
    console.log('❌ Email failed:');
    console.log(errorText);
    return false;
  }
};

const toEmail = process.argv[2] || 'rvegajr@yolovibecodebootcamp.com';
sendEmail(toEmail).then(success => {
  process.exit(success ? 0 : 1);
});