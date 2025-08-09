# Vercel Environment Configuration Guide

This document provides instructions for configuring environment variables in Vercel for the YOLOVibe workshop registration system. Following our branching strategy, we maintain separate environments for staging (`develop` branch) and production (`main` branch).

## Environment Variables Overview

Our application requires the following environment variables:

### Authentication Configuration
- Using custom database authentication (Auth0 removed)

### SendGrid Configuration
- `SENDGRID_API_KEY` - API key for SendGrid email service
- `SENDGRID_FROM_EMAIL` - Email address used as sender

### Square Configuration
- `SQUARE_ACCESS_TOKEN` - Access token for Square API
- `SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_ENVIRONMENT` - Either 'sandbox' or 'production'

### Google Calendar Configuration
- `GOOGLE_CALENDAR_ID` - ID of the Google Calendar for workshop scheduling
- `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` - Path to Google service account key file

### Application Configuration
- `NODE_ENV` - Application environment ('development', 'staging', or 'production')
- `PORT` - Port for local development server (not needed in Vercel)

## Configuring Vercel Environments

### Step 1: Access Vercel Project Settings

1. Log in to [Vercel Dashboard](https://vercel.com)
2. Select the YOLOVibe project
3. Navigate to "Settings" tab
4. Select "Environment Variables" from the left sidebar

### Step 2: Configure Production Environment Variables

These variables will be used when the `main` branch is deployed:

1. Click "Add New"
2. For each variable:
   - Enter the variable name (e.g., `SQUARE_ACCESS_TOKEN`)
   - Enter the production value
   - Under "Environment", select only "Production"
   - Click "Save"

Production values should include:
```
NODE_ENV=production
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=[live token]
SQUARE_LOCATION_ID=[production location ID]
SENDGRID_API_KEY=[live key]
SENDGRID_FROM_EMAIL=contact@yolovibe.com
# Auth0 removed - using custom authentication
GOOGLE_CALENDAR_ID=[production calendar ID]
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=[path to production service account key]
```

### Step 3: Configure Staging Environment Variables

These variables will be used when the `develop` branch is deployed:

1. Click "Add New"
2. For each variable:
   - Enter the variable name (e.g., `AUTH0_DOMAIN`)
   - Enter the staging/sandbox value
   - Under "Environment", select only "Preview" and "Development"
   - Click "Save"

Staging values should include:
```
NODE_ENV=staging
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=[sandbox token]
SQUARE_LOCATION_ID=[sandbox location ID]
SENDGRID_API_KEY=[test key]
SENDGRID_FROM_EMAIL=test@yolovibe.com
# Auth0 removed - using custom authentication
GOOGLE_CALENDAR_ID=[test calendar ID]
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=[path to test service account key]
```

### Step 4: Configure Preview Environment Variables (for feature branches)

By default, feature branch previews will use the same environment variables as the "Preview" environment. This ensures that feature branches use sandbox/test credentials.

## Handling Service Account Keys

For Google Calendar integration, we need to handle the service account key file:

1. For local development: Store the key file locally and reference it in `.env`
2. For Vercel deployment:
   - Option 1: Store the JSON content as an environment variable
   - Option 2: Use Vercel's integration with Google Cloud

### Option 1: JSON Content as Environment Variable

1. Convert the service account key JSON to a string
2. Add it as an environment variable `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`
3. Modify the application code to create a temporary file from this JSON when needed

### Option 2: Vercel's Google Cloud Integration

1. In Vercel project settings, go to "Integrations"
2. Add the Google Cloud integration
3. Configure access to the required Google APIs

## Verifying Environment Configuration

After setting up environment variables:

1. Deploy to staging by pushing to the `develop` branch
2. Verify that the application uses staging/sandbox credentials
3. Create a PR from `develop` to `main` and merge to deploy to production
4. Verify that the production deployment uses production credentials

## Troubleshooting

If environment variables aren't working as expected:

1. Check Vercel deployment logs for any errors
2. Verify that variables are correctly assigned to the right environments
3. Ensure that the application code is correctly loading the environment variables
4. Check for any typos in variable names

## Security Considerations

- Never commit sensitive environment variables to the repository
- Use Vercel's encryption for all sensitive values
- Regularly rotate API keys and secrets
- Limit access to the Vercel project settings
