# 🔐 GitHub Actions Secrets for Vercel Deployment

## Required GitHub Secrets for Automated Deployment

### 🚀 **Vercel Authentication Secrets** (CRITICAL)

1. **`VERCEL_TOKEN`** ⭐ **MOST IMPORTANT**
   - **Purpose**: Authenticates GitHub Actions with Vercel
   - **How to get it**: 
     ```bash
     # Go to: https://vercel.com/account/tokens
     # Or use CLI:
     vercel tokens create github-actions
     ```
   - **Scope**: Full access to deploy and manage projects

2. **`VERCEL_ORG_ID`** ⭐ **REQUIRED**
   - **Purpose**: Identifies your Vercel organization/account
   - **How to get it**:
     ```bash
     cat .vercel/project.json | grep orgId
     # Or from Vercel dashboard: Settings → General → Team ID
     ```
   - **Value**: Usually starts with `team_` or is your username

3. **`VERCEL_PROJECT_ID`** ⭐ **REQUIRED**
   - **Purpose**: Identifies the specific project to deploy
   - **How to get it**:
     ```bash
     cat .vercel/project.json | grep projectId
     ```
   - **Value**: Unique project identifier

### 🗄️ **Database Secrets** (REQUIRED FOR PRODUCTION)

4. **`DATABASE_URL`**
   - **Purpose**: Production database connection string
   - **Current Value**: `libsql://yolovibe-prod-rvegajr.aws-us-east-2.turso.io`
   - **Note**: Use `DATABASE_URL_FIXED` if the other has issues

5. **`TURSO_AUTH_TOKEN`**
   - **Purpose**: Authentication for Turso database
   - **Security**: Keep this extremely secure - it provides database access

### 📧 **Email Service Secrets** (REQUIRED FOR NOTIFICATIONS)

6. **`SENDGRID_API_KEY`**
   - **Purpose**: SendGrid email service authentication
   - **How to get it**: SendGrid Dashboard → Settings → API Keys
   - **Permissions**: Full Access or Mail Send only

7. **`SENDGRID_FROM_EMAIL`**
   - **Purpose**: Verified sender email address
   - **Example**: `noreply@yourdomain.com`

### 💳 **Payment Processing Secrets** (REQUIRED FOR PAYMENTS)

8. **`SQUARE_ACCESS_TOKEN`**
   - **Purpose**: Square API authentication
   - **Environment**: Use production token for live payments
   - **Security**: Extremely sensitive - provides payment access

9. **`SQUARE_APPLICATION_ID`**
   - **Purpose**: Square application identifier
   - **How to get it**: Square Dashboard → Applications

10. **`SQUARE_LOCATION_ID`**
    - **Purpose**: Square business location
    - **How to get it**: Square Dashboard → Locations

### 📅 **Google Calendar Secrets** (OPTIONAL)

11. **`GOOGLE_CALENDAR_ID`**
    - **Purpose**: Calendar for workshop scheduling
    - **Format**: Usually ends with `@group.calendar.google.com`

### 🔧 **Application Configuration**

12. **`NODE_ENV`**
    - **Value**: `production`
    - **Purpose**: Sets production environment

13. **`JWT_SECRET`** (IF USING AUTHENTICATION)
    - **Purpose**: JWT token signing
    - **Generate**: Use a secure random string generator

14. **`SESSION_SECRET`** (IF USING SESSIONS)
    - **Purpose**: Session encryption
    - **Generate**: Use a secure random string generator

## 📝 How to Add Secrets to GitHub

### Via GitHub Web Interface:
1. Go to your repository: `https://github.com/rvegajr/yolovibe-website`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value

### Via GitHub CLI:
```bash
# Add Vercel token
gh secret set VERCEL_TOKEN --repo rvegajr/yolovibe-website

# Add database URL
gh secret set DATABASE_URL --repo rvegajr/yolovibe-website

# Add all secrets from .env file (be careful!)
gh secret set SENDGRID_API_KEY < <(grep SENDGRID_API_KEY .env | cut -d'=' -f2-)
```

## 🎯 Minimum Required Secrets for Basic Deployment

If you want to start with just the essentials:

1. **`VERCEL_TOKEN`** - Must have
2. **`VERCEL_ORG_ID`** - Must have
3. **`VERCEL_PROJECT_ID`** - Must have
4. **`DATABASE_URL`** - Must have for data persistence
5. **`TURSO_AUTH_TOKEN`** - Must have for database access

## 🔒 Security Best Practices

1. **Never commit secrets to git**
2. **Rotate tokens regularly**
3. **Use least-privilege access where possible**
4. **Set secret expiration dates when available**
5. **Audit secret usage in GitHub Actions logs**

## 📋 Quick Setup Checklist

- [ ] Create Vercel token at https://vercel.com/account/tokens
- [ ] Get org ID and project ID from `.vercel/project.json`
- [ ] Add VERCEL_TOKEN to GitHub secrets
- [ ] Add VERCEL_ORG_ID to GitHub secrets
- [ ] Add VERCEL_PROJECT_ID to GitHub secrets
- [ ] Add DATABASE_URL to GitHub secrets
- [ ] Add TURSO_AUTH_TOKEN to GitHub secrets
- [ ] Add other secrets as needed for your features

## 🚀 Example GitHub Action for Vercel Deployment

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

**Remember**: The most critical secrets are the Vercel authentication tokens. Without these, GitHub Actions cannot deploy to Vercel!