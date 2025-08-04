# Google Calendar API Setup Guide

This document provides step-by-step instructions for setting up Google Calendar API integration for the YOLOVibe workshop registration system.

## Prerequisites

1. A Google account with administrative access
2. [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed (optional, you can also use the web console)

## Step 1: Create a Google Cloud Project

### Using Google Cloud Console (Web UI)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter "YOLOVibe Workshop System" as the project name
5. Click "Create"

### Using Google Cloud CLI

```bash
# Create a new project
gcloud projects create yolovibe-workshop-system --name="YOLOVibe Workshop System"

# Set the new project as the current project
gcloud config set project yolovibe-workshop-system
```

## Step 2: Enable the Google Calendar API

### Using Google Cloud Console

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "Enable"

### Using Google Cloud CLI

```bash
# Enable the Google Calendar API
gcloud services enable calendar-json.googleapis.com
```

## Step 3: Create OAuth 2.0 Client ID (for user authentication)

### Using Google Cloud Console

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" and select "OAuth client ID"
3. Configure the OAuth consent screen:
   - User Type: External
   - App name: "YOLOVibe Workshop System"
   - User support email: Your email
   - Developer contact information: Your email
   - Authorized domains: Add your domain (e.g., yolovibe.com)
4. For application type, select "Web application"
5. Name: "YOLOVibe Workshop System"
6. Authorized JavaScript origins: Add your domain (e.g., https://yolovibe.com)
7. Authorized redirect URIs: Add your callback URL (e.g., https://yolovibe.com/auth/callback)
8. Click "Create"
9. Note down the Client ID and Client Secret

## Step 4: Create a Service Account (for server-side access)

### Using Google Cloud Console

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Service account name: "yolovibe-calendar-service"
4. Service account ID: "yolovibe-calendar-service"
5. Click "Create and Continue"
6. For role, select "Calendar > Calendar Admin"
7. Click "Continue" and then "Done"
8. Click on the newly created service account
9. Go to the "Keys" tab
10. Click "Add Key" > "Create new key"
11. Select JSON as the key type
12. Click "Create"
13. The key file will be automatically downloaded to your computer

### Using Google Cloud CLI

```bash
# Create service account
gcloud iam service-accounts create yolovibe-calendar-service \
  --display-name="YOLOVibe Calendar Service Account"

# Grant Calendar Admin role to the service account
gcloud projects add-iam-policy-binding yolovibe-workshop-system \
  --member="serviceAccount:yolovibe-calendar-service@yolovibe-workshop-system.iam.gserviceaccount.com" \
  --role="roles/calendar.admin"

# Create and download a key file
gcloud iam service-accounts keys create googlecloud.json \
  --iam-account=yolovibe-calendar-service@yolovibe-workshop-system.iam.gserviceaccount.com
```

## Step 5: Create a Calendar for Workshops

1. Go to [Google Calendar](https://calendar.google.com/)
2. Click the "+" next to "Other calendars"
3. Select "Create new calendar"
4. Name: "YOLOVibe Workshops"
5. Description: "Calendar for YOLOVibe workshop scheduling"
6. Click "Create calendar"
7. Click on the three dots next to the calendar and select "Settings and sharing"
8. Scroll down to "Share with specific people"
9. Click "Add people" and add the service account email (yolovibe-calendar-service@yolovibe-workshop-system.iam.gserviceaccount.com)
10. Set permissions to "Make changes to events"
11. Note down the Calendar ID from the "Integrate calendar" section

## Step 6: Configure Environment Variables

Add the following to your `.env` file:

```
***REMOVED***=your-client-id
***REMOVED***=your-client-secret
GOOGLE_CALENDAR_ID=your-calendar-id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./googlecloud.json
```

## Step 7: Secure the Service Account Key

1. Move the downloaded JSON key file to your project root and rename it to `googlecloud.json`
2. Ensure that `googlecloud.json` is listed in your `.gitignore` file to prevent accidental commits
3. For production deployment, set up secure environment variables in Vercel as described in the Vercel Environment Configuration Guide

## Troubleshooting

### API Quota Issues

If you encounter quota issues:
1. Go to [Quotas](https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/quotas)
2. Request additional quota if needed

### Authentication Errors

If you encounter authentication errors:
1. Verify that the service account has the correct permissions
2. Ensure the key file is correctly referenced in your environment variables
3. Check that the calendar has been shared with the service account

### Domain Verification

For production use, you may need to verify domain ownership:
1. Go to [Domain verification](https://console.cloud.google.com/apis/credentials/domainverification)
2. Follow the steps to verify your domain
