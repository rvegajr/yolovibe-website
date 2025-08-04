# 🚀 Quick GitHub Secrets Setup for YOLOVibe

## Your Specific Vercel Values:

```bash
VERCEL_ORG_ID = team_CXtiPAIj022FycrTCz0TAltC
VERCEL_PROJECT_ID = prj_AI6KFCZetcXi58MMsGnuH4KDaCag
```

## 🔐 Essential Secrets You Need to Add:

### 1. **VERCEL_TOKEN** (Get this first!)
```bash
# Option 1: Via Vercel Dashboard
# Go to: https://vercel.com/account/tokens
# Click "Create Token"
# Name it: "github-actions"
# Copy the token immediately (you can't see it again!)

# Option 2: Via CLI
vercel tokens create github-actions
```

### 2. **Add All Secrets via GitHub CLI**
```bash
# First, create your Vercel token, then run these commands:

# Core Vercel secrets (REQUIRED)
gh secret set VERCEL_TOKEN --repo rvegajr/yolovibe-website
gh secret set VERCEL_ORG_ID --repo rvegajr/yolovibe-website --body "team_CXtiPAIj022FycrTCz0TAltC"
gh secret set VERCEL_PROJECT_ID --repo rvegajr/yolovibe-website --body "prj_AI6KFCZetcXi58MMsGnuH4KDaCag"

# Database secrets (REQUIRED)
gh secret set ***REMOVED*** --repo rvegajr/yolovibe-website --body "libsql://yolovibe-prod-rvegajr.aws-us-east-2.turso.io"
gh secret set ***REMOVED*** --repo rvegajr/yolovibe-website

# Environment setting
gh secret set NODE_ENV --repo rvegajr/yolovibe-website --body "production"

# Optional but recommended
gh secret set SENDGRID_API_KEY --repo rvegajr/yolovibe-website
gh secret set SENDGRID_FROM_EMAIL --repo rvegajr/yolovibe-website
gh secret set ***REMOVED*** --repo rvegajr/yolovibe-website
gh secret set ***REMOVED*** --repo rvegajr/yolovibe-website
```

### 3. **Or Add via GitHub Web UI**
1. Go to: https://github.com/rvegajr/yolovibe-website/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:

| Secret Name | Value |
|------------|-------|
| VERCEL_TOKEN | (your token from step 1) |
| VERCEL_ORG_ID | team_CXtiPAIj022FycrTCz0TAltC |
| VERCEL_PROJECT_ID | prj_AI6KFCZetcXi58MMsGnuH4KDaCag |
| ***REMOVED*** | libsql://yolovibe-prod-rvegajr.aws-us-east-2.turso.io |
| ***REMOVED*** | (your token from .env) |
| NODE_ENV | production |

## 📝 Basic GitHub Action Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Vercel Production Deployment
on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          ***REMOVED***: ${{ secrets.***REMOVED*** }}
          ***REMOVED***: ${{ secrets.***REMOVED*** }}
          NODE_ENV: ${{ secrets.NODE_ENV }}
      
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## ✅ Quick Checklist

- [ ] Get VERCEL_TOKEN from https://vercel.com/account/tokens
- [ ] Add VERCEL_TOKEN to GitHub secrets
- [ ] Add VERCEL_ORG_ID (team_CXtiPAIj022FycrTCz0TAltC)
- [ ] Add VERCEL_PROJECT_ID (prj_AI6KFCZetcXi58MMsGnuH4KDaCag)
- [ ] Add ***REMOVED***
- [ ] Add ***REMOVED***
- [ ] Create workflow file in `.github/workflows/deploy.yml`
- [ ] Test deployment by pushing to main branch

That's it! These are the minimum secrets needed for automated Vercel deployment from GitHub Actions. 🚀