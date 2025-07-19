# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 📋 Environment Variables (CRITICAL)
- [ ] `DATABASE_URL` - Turso database connection string
- [ ] `TURSO_AUTH_TOKEN` - Turso authentication token
- [ ] `SENDGRID_API_KEY` - Email service API key
- [ ] `SQUARE_ACCESS_TOKEN` - Payment processing token
- [ ] `SQUARE_ENVIRONMENT` - Set to "production"
- [ ] `GOOGLE_CALENDAR_CREDENTIALS` - Calendar integration
- [ ] `WEBSITE_URL` - Your production domain
- [ ] `SUPPORT_EMAIL` - Customer support email
- [ ] `FEEDBACK_EMAIL` - Testing feedback email

### 🔧 Build & Dependencies
- [x] ✅ Build completes without errors (`npm run build`)
- [x] ✅ All dependencies installed and up to date
- [x] ✅ TypeScript compilation successful
- [x] ✅ No critical linting errors

### 🎫 Testing System Ready
- [x] ✅ Coupon system working (BETATEST100 = 100% off)
- [x] ✅ Test coupon validation and application
- [x] ✅ Customer journey email templates ready
- [x] ✅ CLI tools for sending test invitations

### 📊 Monitoring & Backup
- [x] ✅ Usage monitoring system configured
- [x] ✅ Backup system ready for Turso
- [x] ✅ Admin dashboard functional
- [x] ✅ Database connection handling

## 🌐 Production Environment Setup

### 1. Vercel Deployment Configuration
```bash
# Deploy to Vercel
vercel --prod

# Or if using GitHub integration:
# Push to main branch for automatic deployment
```

### 2. Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```env
DATABASE_URL=libsql://[your-turso-db-url]
TURSO_AUTH_TOKEN=[your-turso-token]
SENDGRID_API_KEY=[your-sendgrid-key]
SQUARE_ACCESS_TOKEN=[your-square-production-token]
SQUARE_ENVIRONMENT=production
WEBSITE_URL=https://your-domain.com
SUPPORT_EMAIL=support@your-domain.com
FEEDBACK_EMAIL=feedback@your-domain.com
```

### 3. Turso Database Setup
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create production database
turso db create yolovibe-prod

# Get connection details
turso db show yolovibe-prod

# Create auth token
turso db tokens create yolovibe-prod
```

## 🧪 Post-Deployment Testing

### Critical Path Testing
- [ ] **Homepage loads** - https://your-domain.com
- [ ] **Workshop pages load** - /product-a, /product-b
- [ ] **Pricing page works** - /pricing
- [ ] **Contact form functional** - /contact
- [ ] **Booking flow starts** - /book

### User Journey Testing (Use BETATEST100 coupon)
- [ ] **User registration** - Create account works
- [ ] **Workshop booking** - Complete booking process
- [ ] **Coupon application** - BETATEST100 gives 100% off
- [ ] **Payment processing** - $0.00 payment completes
- [ ] **Email confirmation** - Booking confirmation sent
- [ ] **User dashboard** - Login and view booking

### Admin Features
- [ ] **Admin dashboard** - /admin/dashboard loads
- [ ] **Usage monitoring** - Database usage displays
- [ ] **System health** - All services showing healthy
- [ ] **Backup system** - Manual backup creation works

### API Endpoints Testing
- [ ] `POST /api/bookings/create` - Booking creation
- [ ] `POST /api/purchase/create` - Purchase processing
- [ ] `GET /api/admin/dashboard` - Admin dashboard data
- [ ] `POST /api/admin/backup` - Manual backup

## 📧 Customer Testing Email Ready

### Template Location
- `customer-testing-note-template.md` - Ready-to-send email template

### Quick Send Options
```bash
# CLI method (requires email service configuration)
npm run send-customer-journey -- --email tester@example.com --name "Tester Name"

# Manual method
# 1. Open customer-testing-note-template.md
# 2. Replace [PLACEHOLDERS] with actual values
# 3. Copy and send via your email client
```

### Test Email Customization
Replace these placeholders:
- `[FIRST_NAME]` → Tester's first name
- `[YOUR_WEBSITE_URL]` → https://your-domain.com
- `[YOUR_EMAIL]` → Your feedback email
- `[YOUR_NAME]` → Your name

## 🔍 Production Monitoring

### Daily Checks
```bash
# Check database usage (stay within free tier)
npm run usage:check

# Generate usage report
npm run usage:report

# Check for alerts
npm run usage:alerts
```

### Weekly Maintenance
- [ ] Review usage trends and projections
- [ ] Check backup integrity
- [ ] Review customer feedback from testing
- [ ] Monitor system health metrics

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check Turso connection
turso db shell yolovibe-prod

# Verify environment variables
echo $DATABASE_URL
echo $TURSO_AUTH_TOKEN
```

#### Email Not Sending
- Verify SENDGRID_API_KEY is correct
- Check sender email is verified in SendGrid
- Review SendGrid activity logs

#### Payment Issues
- Ensure SQUARE_ENVIRONMENT="production"
- Verify Square production credentials
- Check Square developer dashboard

#### Coupon Not Working
```bash
# Test coupon validation
npm run test:coupons -- --validate BETATEST100 199

# Reset coupon usage if needed
npm run test:coupons -- --reset
```

## ✅ Production Deployment Steps

1. **Pre-flight Check**
   ```bash
   npm run build
   npm run test:coupons -- --test-flow
   npm run usage:check
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Test database connection

4. **Post-deployment Verification**
   - Test critical user journeys
   - Verify admin dashboard works
   - Send test customer journey email

5. **Go Live**
   - Send customer testing emails
   - Monitor usage and feedback
   - Be ready to support testers

## 📞 Support During Testing

### Be Ready For:
- Customer questions about the testing process
- Technical issues with bookings or payments
- Feedback collection and analysis
- Quick fixes for any discovered issues

### Quick Response Plan:
- Monitor feedback email closely
- Have admin dashboard open for real-time monitoring
- Keep backup and rollback procedures ready
- Document all feedback for improvements

---

## 🎯 Success Metrics

### Customer Testing Goals:
- [ ] 80%+ completion rate for customer journey
- [ ] Positive feedback on trust and professionalism
- [ ] Successful coupon usage (100% off)
- [ ] Mobile experience validation
- [ ] Clear identification of improvement areas

**Your production environment is ready for customer testing! 🚀** 