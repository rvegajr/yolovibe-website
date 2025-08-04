# 🚀 YOLOVibe Development & Deployment Workflow

## 📋 Quick Start Guide

### 🏃‍♂️ **Daily Development Workflow**

```bash
# 1. Start your day - ensure you're on develop
git checkout develop
git pull origin develop

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Start local development
npm run dev

# 4. Make changes, test locally
# Edit files, test at http://localhost:4321

# 5. Commit your changes
git add .
git commit -m "feat: describe your changes"

# 6. Push to GitHub
git push -u origin feature/your-feature-name

# 7. Create Pull Request to develop
# Go to GitHub and create PR: feature/your-feature-name → develop
```

### 🚀 **Deploy to Production**

```bash
# 1. Ensure develop is up to date
git checkout develop
git pull origin develop

# 2. Create PR from develop to main
# Go to GitHub: Create PR develop → main

# 3. Merge PR (this triggers auto-deployment)
# Production deploys automatically via GitHub Actions
```

## 🏗️ **Branch Strategy**

```
main (protected)
  ↑ (Production deployments)
develop (default)
  ↑ (Feature integration)
feature/xxx (your work)
```

### **Branch Rules:**
- **main**: Protected, production-ready code only
- **develop**: Default branch, integration branch
- **feature/**: Individual features, bug fixes

## 🛠️ **Local Development Setup**

### **1. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit with your local values
# For local dev, you can use:
***REMOVED***=./local.db
NODE_ENV=development
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Database Setup**
```bash
# Local database will auto-create on first run
# Or manually initialize:
npm run db:migrate
```

### **4. Start Development Server**
```bash
# Standard development
npm run dev

# With verbose logging
DEBUG=* npm run dev

# Specific port
npm run dev -- --port 3000
```

### **5. Testing Your Changes**

#### **Run Interface Tests (TDD)**
```bash
# Test all interfaces
npm run test:interfaces

# Test specific interface
npx tsx src/registration/cli/test-booking-manager.ts
```

#### **Run E2E Tests**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:headed

# Run specific test
npx playwright test tests/e2e/01-homepage.spec.ts
```

## 🚢 **Deployment Process**

### **Automatic Deployment (Recommended)**

1. **Development Preview** (Automatic on PR)
   - Create PR to `develop` → Get preview URL
   - Test your changes in preview environment

2. **Production Deployment** (Automatic on merge to main)
   - Merge PR to `main` → Auto-deploys to production
   - Monitor deployment at: https://vercel.com/rvegajrs-projects/yolovibe-website

### **Manual Deployment** (If needed)

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 📝 **Development Guidelines**

### **Commit Message Convention**
```bash
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### **Pull Request Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Interface tests pass
- [ ] E2E tests pass
- [ ] Tested locally

## Checklist
- [ ] Code follows TDD principles
- [ ] Interfaces follow ISP
- [ ] Documentation updated
```

## 🔧 **Common Development Tasks**

### **Add New Workshop Type**
```bash
# 1. Update interface
# Edit: src/registration/core/interfaces/IProductCatalog.ts

# 2. Update implementation
# Edit: src/registration/implementations/ProductCatalog.ts

# 3. Test interface
npx tsx src/registration/cli/test-product-catalog.ts

# 4. Update UI
# Edit: src/components/workshop-offerings.astro
```

### **Update Email Templates**
```bash
# 1. Edit template
# src/registration/implementations/EmailTemplates.ts

# 2. Test email workflow
npx tsx src/registration/cli/test-complete-email-workflow.ts
```

### **Modify Booking Logic**
```bash
# 1. Update interface if needed
# src/registration/core/interfaces/IBookingManager.ts

# 2. Update implementation
# src/registration/implementations/BookingManager.ts

# 3. Test changes
npx tsx src/registration/cli/test-booking-manager.ts
```

## 🐛 **Debugging**

### **Check Logs**
```bash
# Vercel logs (production)
vercel logs

# Local development logs
# Check terminal where npm run dev is running
```

### **Database Issues**
```bash
# Reset local database
rm local.db
npm run dev  # Will recreate

# Check database content
sqlite3 local.db ".tables"
sqlite3 local.db "SELECT * FROM workshops;"
```

### **Build Issues**
```bash
# Clean build
rm -rf .vercel dist node_modules
npm install
npm run build
```

## 📊 **Monitoring**

### **Production Health**
- Dashboard: https://vercel.com/rvegajrs-projects/yolovibe-website
- Live Site: https://yolovibe-website.vercel.app
- Admin Panel: https://yolovibe-website.vercel.app/admin/dashboard

### **Performance Monitoring**
```bash
# Check build size
npm run build

# Analyze bundle
npm run analyze  # If configured
```

## 🚨 **Emergency Procedures**

### **Rollback Production**
```bash
# Option 1: Via Vercel Dashboard
# Go to deployments, click "..." → "Promote to Production" on previous version

# Option 2: Git revert
git checkout main
git revert HEAD
git push origin main  # This triggers new deployment
```

### **Hotfix Process**
```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Make fix, test thoroughly
# Make changes
npm run test:interfaces
npm run test:e2e

# 3. Push and create PR directly to main
git push -u origin hotfix/critical-fix
# Create PR: hotfix/critical-fix → main
```

## 📚 **Resources**

- **Project Dashboard**: https://vercel.com/rvegajrs-projects/yolovibe-website
- **GitHub Repo**: https://github.com/rvegajr/yolovibe-website
- **Documentation**: `/docs` folder
- **Interface Docs**: `src/registration/README.md`

## 🎯 **Best Practices**

1. **Always work on feature branches**
2. **Test locally before pushing**
3. **Run interface tests for any business logic changes**
4. **Keep commits small and focused**
5. **Write descriptive commit messages**
6. **Update documentation with code changes**
7. **Review preview deployments before merging**

---

**Happy Coding! 🚀 Remember: TDD and ISP are your friends!**