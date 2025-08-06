# Integration Testing Guide

## Overview
This guide explains how to test all critical service integrations (SendGrid, Square, Google Calendar, Database) across different environments.

## Test Results from Development Environment

### ✅ Successful Services:
1. **SendGrid** - Email service connected and API key validated
2. **Square** - Sandbox environment working with valid merchant account
3. **Database** - Turso cloud database connected successfully

### ⚠️ Services Needing Configuration:
1. **Google Calendar** - Calendar ID is configured but OAuth credentials need to be set up

## Available Test Commands

```bash
# Test current environment (uses .env file)
npm run test:integrations

# Test development environment (sandbox Square)
npm run test:integrations:dev

# Test production environment (live Square - requires confirmation)
npm run test:integrations:prod
```

## What Each Test Validates

### SendGrid Email Service
- ✅ API key validity
- ✅ From email configured
- ✅ Account profile accessible

### Square Payment Processing
- ✅ Access token validity
- ✅ Merchant account accessible
- ✅ Location ID validation (if configured)
- ✅ Correct environment (sandbox/production)

### Google Calendar
- ⚠️ Calendar ID configured
- ❌ OAuth credentials not set up yet
- ❌ Service account not configured

### Database
- ✅ Turso connection successful
- ✅ Can execute queries
- ✅ User table accessible

## Environment Configuration Status

### Development/Sandbox
- **Square**: Using sandbox credentials ✅
- **SendGrid**: Using production API key ✅
- **Database**: Connected to Turso production ✅
- **Google Calendar**: Not configured ⚠️

### Production
- **Square**: Production credentials configured ✅
- **SendGrid**: Same API key as development ✅
- **Database**: Same Turso instance ✅
- **Google Calendar**: Not configured ⚠️

## Next Steps

1. **Google Calendar Setup** (Optional)
   - Set up OAuth credentials in Google Cloud Console
   - Add `***REMOVED***`, `***REMOVED***`, and `***REMOVED***` to environment

2. **Square Location ID**
   - Configure `SQUARE_LOCATION_ID` for both sandbox and production

3. **Verify Production**
   - Run `npm run test:integrations:prod` to verify production credentials
   - ⚠️ Be careful - this uses LIVE production credentials

## Troubleshooting

### SendGrid Issues
- Verify API key starts with "SG."
- Check that from email is verified in SendGrid
- Ensure API key has full access permissions

### Square Issues
- Sandbox tokens start with "EAAA" followed by sandbox-specific characters
- Production tokens also start with "EAAA" but are different
- Check Square dashboard for correct environment

### Database Issues
- Ensure `***REMOVED***` and `***REMOVED***` are set
- Check Turso dashboard for database status
- Verify database schema is deployed

### Google Calendar Issues
- Follow the Google Calendar setup guide in docs
- Ensure calendar ID is correct
- Set up OAuth or service account credentials