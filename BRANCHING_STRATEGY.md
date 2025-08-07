# YOLOVibe Branching Strategy & Deployment Workflow

## 🌿 Branch Structure

### Production Branch: `main`
- **Purpose**: Live production code
- **URL**: `https://yolovibe.com` (production domain)
- **Environment**: Production API keys
- **Protection**: Requires PR review + passing CI/CD
- **Deployment**: Automatic on merge

### Staging Branch: `develop` 
- **Purpose**: Integration testing and staging
- **URL**: `https://yolovibe-git-develop-rvegajr.vercel.app` (auto-generated)
- **Environment**: Sandbox/test API keys
- **Testing**: Full registration system testing
- **Deployment**: Automatic on push

### Feature Branches: `feature/*`
- **Purpose**: Individual feature development
- **Naming Convention**: 
  - `feature/registration-system`
  - `feature/square-integration`
  - `feature/auth0-setup`
- **URL**: Preview URLs for each PR
- **Environment**: Local development settings

## 🚀 Deployment Flow

```
feature/xyz → develop → main
     ↓           ↓        ↓
  Preview    Staging  Production
```

## 🛠️ Development Workflow

### 1. Starting New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Development & Testing
```bash
# Make changes
npm run validate  # TypeScript + ESLint check
npm run test      # Run unit tests
npm run health    # Health check CLI

# Commit changes
git add .
git commit -m "feat: add registration system"
git push origin feature/your-feature-name
```

### 3. Create Pull Request
- **Target**: `develop` branch
- **Review**: CI/CD must pass
- **Preview**: Vercel creates preview URL automatically

### 4. Staging Deployment
```bash
# After PR merge to develop
git checkout develop
git pull origin develop
# Auto-deploys to staging URL
```

### 5. Production Release
```bash
# Create PR from develop → main
# After review and approval, merge triggers production deployment
```

## 🔧 Environment Configuration

### Production (`main` branch)
```env
NODE_ENV=production
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=EAAAl... (live token)
SENDGRID_API_KEY=SG.live... (live key)
AUTH0_DOMAIN=yolovibe.auth0.com
```

### Staging (`develop` branch)
```env
NODE_ENV=staging
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=EAAAl... (sandbox token)
SENDGRID_API_KEY=SG.test... (test key)
AUTH0_DOMAIN=yolovibe-dev.auth0.com
```

### Development (local)
```env
NODE_ENV=development
# Use .env file with test/mock values
```

## 🔒 Branch Protection Rules

### `main` Branch
- Require PR reviews (1+ approvals)
- Require status checks (CI/CD pipeline)
- Require branches to be up to date
- Restrict pushes to admins only

### `develop` Branch
- Require status checks (CI/CD pipeline)
- Allow direct pushes for quick fixes
- Auto-delete feature branches after merge

## 📋 CI/CD Pipeline Behavior

### On Push to `develop`
- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Unit tests
- ✅ Health checks
- 🚀 Deploy to staging URL

### On Push to `main`
- ✅ All above checks
- ✅ Security audit
- ✅ Build verification
- 🚀 Deploy to production URL

## 🎯 Best Practices

1. **Feature Development**: Always branch from `develop`
2. **Testing**: Use staging environment for full integration tests
3. **Hotfixes**: Create from `main`, merge to both `main` and `develop`
4. **Releases**: Weekly merges from `develop` to `main`
5. **API Keys**: Never commit real keys, use Vercel environment variables

## 🔗 Useful Commands

```bash
# Switch to develop and pull latest
git checkout develop && git pull

# Create new feature branch
git checkout -b feature/new-feature

# Run full validation
npm run validate

# Deploy to staging manually
npm run deploy:staging

# Deploy to production manually  
npm run deploy:production
```

## 📊 Monitoring

- **Staging Health**: `https://staging-url/health`
- **Production Health**: `https://yolovibe.com/health`
- **CI/CD Status**: GitHub Actions tab
- **Deployment Logs**: Vercel dashboard
