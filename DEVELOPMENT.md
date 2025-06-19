# YOLOVibe Development Pipeline

## 🚀 **Development Workflow**

This project uses a modern TypeScript-first development pipeline with automated testing, linting, and deployment.

### **Quick Start**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run health checks
npm run health-check

# Validate code quality
npm run validate

# Run tests
npm run test
```

## 📋 **Available Scripts**

### **Development**
- `npm run dev` - Start Astro development server
- `npm run build` - Build production site
- `npm run preview` - Preview production build locally

### **Health Monitoring**
- `npm run health-check` - Run health checks on all APIs
- `npm run health-check:json` - Output health check results as JSON
- `npm run health-check:verbose` - Detailed health check output

### **Testing**
- `npm run test` - Run tests in watch mode
- `npm run test:unit` - Run all unit tests once
- `npm run test:coverage` - Generate test coverage report
- `npm run test:watch` - Run tests in watch mode

### **Code Quality**
- `npm run lint` - Check TypeScript code for issues
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run all validation checks
- `npm run validate:fix` - Run validation and fix issues

### **Deployment**
- `npm run deploy:staging` - Deploy to Vercel preview
- `npm run deploy:production` - Deploy to production

## 🔧 **Development Pipeline**

### **1. Local Development**
1. Make changes to TypeScript files
2. Run `npm run validate` to check code quality
3. Run `npm run test:unit` to ensure tests pass
4. Run `npm run health-check` to verify API connections

### **2. Pre-Push Validation**
Before pushing code, always run:
```bash
npm run validate && npm run test:unit
```

### **3. CI/CD Pipeline**
The GitHub Actions pipeline automatically:
- ✅ Validates TypeScript compilation
- ✅ Runs ESLint checks
- ✅ Verifies Prettier formatting
- ✅ Executes unit tests with coverage
- ✅ Tests health check system
- ✅ Builds Astro site
- ✅ Runs security audit
- ✅ Deploys to Vercel (on main/develop branches)

## 🏗️ **Architecture**

### **TypeScript-Only Mandate**
- All business logic must be in pure TypeScript
- No mixing of JavaScript and TypeScript
- ES modules with `.js` extensions in imports
- Strict type checking enabled

### **Module Structure**
```
src/
├── infrastructure/
│   ├── config.ts          # Environment configuration
│   └── health/
│       ├── HealthChecker.ts    # API health checks
│       └── HealthDashboard.ts  # Health monitoring
├── app/
│   └── startup.ts         # Application initialization
└── **/*.test.ts          # Unit tests alongside source

cli/
└── health-check.ts       # CLI health check tool
```

### **Testing Strategy**
- Unit tests for all TypeScript modules
- Mocked external API calls
- Coverage reporting with Vitest
- Test-driven development (TDD) approach

## 🔍 **Health Monitoring**

The health check system validates:
- **Auth0**: Domain accessibility and configuration
- **SendGrid**: API key validity and account status
- **Square**: Payment API connectivity
- **Google Calendar**: Service account credentials

### **Health Check Usage**
```bash
# Basic health check
npm run health-check

# JSON output for automation
npm run health-check:json

# Verbose details for debugging
npm run health-check:verbose
```

## 🚦 **Branch Strategy**

- `main` - Production branch (auto-deploys to production)
- `develop` - Development branch (auto-deploys to staging)
- `feature/*` - Feature branches (create PR to develop)

## 📊 **Code Quality Standards**

### **ESLint Rules**
- TypeScript strict mode enabled
- Explicit return types required
- No unused variables
- Prefer nullish coalescing and optional chaining

### **Prettier Configuration**
- Single quotes
- Semicolons required
- 100 character line width
- 2-space indentation

### **TypeScript Configuration**
- ES2022 target
- Strict type checking
- No implicit any
- Module resolution: Node

## 🔐 **Environment Variables**

Required environment variables (see `.env.example`):
- `AUTH0_*` - Auth0 configuration
- `SENDGRID_*` - SendGrid email service
- `SQUARE_*` - Square payment processing
- `GOOGLE_*` - Google Calendar integration

## 📈 **Monitoring & Observability**

- Health checks run on application startup
- Periodic health monitoring every 5 minutes
- Health dashboard available at `/health` endpoint
- Coverage reports generated for all tests
- Security audits on every CI run

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Health Check Failures**
   - Verify environment variables in `.env`
   - Check API key validity
   - Ensure service account credentials are correct

2. **TypeScript Errors**
   - Run `npm run type-check` for detailed errors
   - Ensure all imports use `.js` extensions
   - Check tsconfig.cli.json configuration

3. **Test Failures**
   - Run `npm run test:watch` for interactive debugging
   - Check mock configurations in test files
   - Verify test environment setup

### **Getting Help**
- Check GitHub Actions logs for CI failures
- Review health check output for API issues
- Run `npm run validate` for comprehensive checks
