#!/usr/bin/env node

/**
 * Simple Google OAuth URL Generator
 * Generates the authentication URL for you to open manually
 */

const fs = require('fs');
const path = require('path');

// Load the OAuth credentials
const credentialsPath = path.join(__dirname, '..', 'googlecloud.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.web;

// Use localhost redirect
const redirectUri = redirect_uris.find(uri => uri.includes('localhost:3000')) || redirect_uris[0];

// Generate OAuth URL
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const params = new URLSearchParams({
  client_id: client_id,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: scopes.join(' '),
  access_type: 'offline',
  prompt: 'consent'
});

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

console.log('🔐 Google OAuth Authentication URL');
console.log('=====================================');
console.log('');
console.log('1. Copy and open this URL in your browser:');
console.log('');
console.log(authUrl);
console.log('');
console.log('2. Sign in with your Google account');
console.log('3. Grant calendar permissions');
console.log('4. You will be redirected to localhost:3000 with a code parameter');
console.log('5. Copy the "code" value from the URL');
console.log('');
console.log('The URL will look like:');
console.log('http://localhost:3000/auth/callback?code=YOUR_CODE_HERE&scope=...');
console.log('');
console.log('Once you have the code, run:');
console.log('node scripts/exchange-google-code.cjs YOUR_CODE_HERE');