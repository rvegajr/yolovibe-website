#!/usr/bin/env node

/**
 * Google OAuth Refresh Token Generator
 * This script helps you generate a refresh token for Google Calendar API access
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open').default || require('open');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');

// Load the OAuth credentials from googlecloud.json
const credentialsPath = path.join(__dirname, '..', 'googlecloud.json');
if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Error: googlecloud.json not found!');
  console.error('Please ensure googlecloud.json exists in the project root.');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed || {};

if (!client_id || !client_secret) {
  console.error('❌ Error: Invalid credentials in googlecloud.json');
  process.exit(1);
}

// Use localhost redirect for the OAuth flow
const redirectUri = redirect_uris.find(uri => uri.includes('localhost')) || redirect_uris[0];

console.log('🔐 Google OAuth Refresh Token Generator');
console.log('========================================');
console.log(`Client ID: ${client_id.substring(0, 30)}...`);
console.log(`Redirect URI: ${redirectUri}`);
console.log('');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirectUri
);

// Generate the auth URL
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

async function getRefreshToken() {
  return new Promise((resolve, reject) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent screen to ensure refresh token is returned
    });

    console.log('📋 Steps to generate refresh token:');
    console.log('1. A browser will open with Google OAuth consent screen');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant calendar permissions to the application');
    console.log('4. You will be redirected back and receive your tokens');
    console.log('');
    console.log('Opening browser...');
    console.log('');

    // Create a temporary server to handle the OAuth callback
    const server = http.createServer(async (req, res) => {
      try {
        const queryObject = url.parse(req.url, true).query;
        
        if (queryObject.error) {
          res.end('Authentication failed: ' + queryObject.error);
          reject(new Error('Authentication failed: ' + queryObject.error));
          return;
        }

        if (queryObject.code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head>
                <title>Success!</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                  .success { color: green; font-size: 24px; }
                  .token-box { 
                    background: #f0f0f0; 
                    padding: 20px; 
                    margin: 20px auto; 
                    max-width: 600px;
                    border-radius: 5px;
                    word-break: break-all;
                  }
                  code { background: #333; color: #0f0; padding: 10px; display: block; }
                </style>
              </head>
              <body>
                <h1 class="success">✅ Authentication Successful!</h1>
                <p>You can close this window and return to your terminal.</p>
                <p>Your refresh token will be displayed there.</p>
              </body>
            </html>
          `);

          // Exchange authorization code for tokens
          const { tokens } = await oauth2Client.getToken(queryObject.code);
          
          console.log('');
          console.log('✅ Success! Here are your tokens:');
          console.log('=====================================');
          console.log('');
          
          if (tokens.refresh_token) {
            console.log('🔑 REFRESH TOKEN (add this to your .env file):');
            console.log('');
            console.log(`***REMOVED***=${tokens.refresh_token}`);
            console.log('');
            console.log('📝 Instructions:');
            console.log('1. Copy the line above');
            console.log('2. Add it to your .env file');
            console.log('3. Run the integration test again to verify');
            console.log('');
            
            // Also save to a file for convenience
            const tokenFile = path.join(__dirname, 'google-refresh-token.txt');
            fs.writeFileSync(tokenFile, `***REMOVED***=${tokens.refresh_token}\n`);
            console.log(`💾 Token also saved to: ${tokenFile}`);
          } else {
            console.log('⚠️  Warning: No refresh token received.');
            console.log('This might happen if you have previously authorized this app.');
            console.log('To force a new refresh token, revoke access at:');
            console.log('https://myaccount.google.com/permissions');
            console.log('Then run this script again.');
          }
          
          if (tokens.access_token) {
            console.log('');
            console.log('Access token (temporary, expires in ~1 hour):');
            console.log(tokens.access_token.substring(0, 50) + '...');
          }
          
          resolve(tokens);
          
          // Destroy the server
          setTimeout(() => {
            server.destroy();
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
        reject(error);
      }
    });

    // Enable server destroy
    destroyer(server);

    // Parse the redirect URI to get the port
    const parsedUrl = new URL(redirectUri);
    const port = parsedUrl.port || 3000;

    server.listen(port, () => {
      console.log(`🌐 Temporary server listening on port ${port}`);
      console.log('');
      
      // Open the auth URL in the default browser
      open(authUrl).catch(() => {
        console.log('Could not open browser automatically.');
        console.log('Please open this URL manually:');
        console.log('');
        console.log(authUrl);
      });
    });
  });
}

// Run the token generation
getRefreshToken()
  .then(() => {
    console.log('');
    console.log('✅ Process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Failed to get refresh token:', error.message);
    process.exit(1);
  });