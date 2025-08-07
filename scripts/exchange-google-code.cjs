#!/usr/bin/env node

/**
 * Exchange Google authorization code for refresh token
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Get code from command line
const code = process.argv[2];

if (!code) {
  console.error('❌ Error: Please provide the authorization code');
  console.error('Usage: node scripts/exchange-google-code.cjs YOUR_CODE_HERE');
  process.exit(1);
}

// Load credentials
const credentialsPath = path.join(__dirname, '..', 'googlecloud.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.web;

const redirectUri = redirect_uris.find(uri => uri.includes('localhost:3000')) || redirect_uris[0];

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirectUri
);

// Exchange code for tokens
async function getTokens() {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    console.log('');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Success! Here are your tokens:');
    console.log('=====================================');
    console.log('');
    
    if (tokens.refresh_token) {
      console.log('🔑 REFRESH TOKEN (add this to your .env file):');
      console.log('');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('');
      
      // Save to file
      const tokenFile = path.join(__dirname, 'google-refresh-token.txt');
      fs.writeFileSync(tokenFile, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log(`💾 Token saved to: ${tokenFile}`);
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. Add the GOOGLE_REFRESH_TOKEN line to your .env file');
      console.log('2. Run: npm run test:integrations');
      console.log('   to verify Google Calendar is now working');
    } else {
      console.log('⚠️  No refresh token received.');
      console.log('You may have already authorized this app.');
      console.log('To get a new refresh token:');
      console.log('1. Go to: https://myaccount.google.com/permissions');
      console.log('2. Revoke access for "YOLOVibe Calendar Integration"');
      console.log('3. Run the authorization process again');
    }
    
    if (tokens.access_token) {
      console.log('');
      console.log('Access token received (expires in ~1 hour)');
    }
    
  } catch (error) {
    console.error('❌ Error exchanging code:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('- Code already used (codes are single-use)');
    console.error('- Code expired (valid for only a few minutes)');
    console.error('- Wrong redirect URI');
    console.error('');
    console.error('Please run the authorization process again to get a fresh code.');
  }
}

getTokens();