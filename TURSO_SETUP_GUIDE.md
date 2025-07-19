# 🚀 Turso Database Setup Guide with Backup Strategy

**Complete guide to set up Turso database with automated backup system for YOLOVibe**

## 🎯 **Why Turso?**

- ✅ **SQLite-compatible** - No code changes needed
- ✅ **Free tier** - 500MB storage, 1B row reads/month
- ✅ **Global edge locations** - Fast worldwide access
- ✅ **Built-in replication** - Automatic data distribution
- ✅ **Simple setup** - 5-minute configuration
- ✅ **Backup-friendly** - Easy export/import capabilities

## 📋 **Prerequisites**

- Node.js 18+ installed
- YOLOVibe project cloned and set up
- Terminal/command line access
- Vercel account (for deployment)

## 🔧 **Step 1: Install Turso CLI**

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Verify installation
turso --version

# If command not found, add to PATH:
echo 'export PATH="$HOME/.turso:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 🏗️ **Step 2: Create Turso Account & Database**

```bash
# Login to Turso (opens browser for authentication)
turso auth login

# Create production database
turso db create yolovibe-prod

# Create development database (optional)
turso db create yolovibe-dev

# List your databases
turso db list
```

## 🔑 **Step 3: Get Connection Details**

```bash
# Get database URL
turso db show yolovibe-prod --url

# Create authentication token
turso db tokens create yolovibe-prod

# Example output:
# URL: libsql://yolovibe-prod-[username].turso.tech
# Token: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

## ⚙️ **Step 4: Configure Environment Variables**

### **Local Development (.env.local)**
```bash
# Database Configuration
***REMOVED***="libsql://yolovibe-prod-[username].turso.tech"
***REMOVED***="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."

# Backup Configuration
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="daily"  # hourly, daily, weekly
BACKUP_RETENTION_DAYS="30"
BACKUP_STORAGE_TYPE="local"  # local, s3, gcs

# Optional: S3 Backup Storage
BACKUP_S3_BUCKET="yolovibe-backups"
BACKUP_S3_REGION="us-east-1"
BACKUP_S3_ACCESS_KEY_ID="your-access-key"
BACKUP_S3_SECRET_ACCESS_KEY="your-secret-key"

# Other environment variables...
GOOGLE_CALENDAR_CLIENT_ID="..."
SENDGRID_API_KEY="..."
# ... (keep existing variables)
```

### **Production (Vercel)**
```bash
# Set environment variables in Vercel
vercel env add ***REMOVED***
# Enter: libsql://yolovibe-prod-[username].turso.tech

vercel env add ***REMOVED***
# Enter: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

vercel env add BACKUP_ENABLED
# Enter: true

vercel env add BACKUP_SCHEDULE
# Enter: daily

vercel env add BACKUP_RETENTION_DAYS
# Enter: 30
```

## 🗄️ **Step 5: Deploy Database Schema**

```bash
# Navigate to your project directory
cd YOLOVibeWebsite

# Deploy schema to Turso database
turso db shell yolovibe-prod < src/registration/database/schema.sql

# Verify tables were created
turso db shell yolovibe-prod "SELECT name FROM sqlite_master WHERE type='table';"

# Check data
turso db shell yolovibe-prod "SELECT COUNT(*) FROM products;"
turso db shell yolovibe-prod "SELECT * FROM coupons WHERE code='E2E_TEST_100';"
```

## 🧪 **Step 6: Test Database Connection**

```bash
# Test local connection
npm run dev
# Check console for: "✅ Turso connection established successfully"

# Test backup system
npm run backup:create "Initial setup backup"

# List backups
npm run backup:list

# Test restore (dry run)
npm run backup:restore <backup-id> --dry-run
```

## 📦 **Step 7: Set Up Automated Backups**

### **Local Backup System**
```bash
# Create initial backup
npm run backup:create "Production deployment backup"

# List all backups
npm run backup:list --detailed

# Schedule automatic backups (add to your deployment script)
npm run backup:schedule &
```

### **Backup Commands Reference**
```bash
# Manual backup with description
npm run backup:create "Before major update"

# List all backups
npm run backup:list

# Detailed backup information
npm run backup:list --detailed

# Test restore (safe)
npm run backup:restore yolovibe-2025-01-19T10-30-00 --dry-run

# Actual restore (destructive)
npm run backup:restore yolovibe-2025-01-19T10-30-00 --confirm

# Restore excluding specific tables
npm run backup:restore backup-id --confirm --skip-tables=sessions,logs
```

## ☁️ **Step 8: Configure Cloud Backup Storage (Optional)**

### **AWS S3 Setup**
```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Create S3 bucket for backups
aws s3 mb s3://yolovibe-backups

# Set environment variables
export BACKUP_STORAGE_TYPE="s3"
export BACKUP_S3_BUCKET="yolovibe-backups"
export BACKUP_S3_REGION="us-east-1"
export BACKUP_S3_ACCESS_KEY_ID="your-access-key"
export BACKUP_S3_SECRET_ACCESS_KEY="your-secret-key"
```

## 🚀 **Step 9: Deploy to Production**

```bash
# Build and test locally first
npm run build
npm run test:e2e:check

# Deploy to Vercel
vercel --prod

# Verify database connection in production
# Check Vercel function logs for: "✅ Turso connection established successfully"

# Create first production backup
npm run backup:create "Production launch backup"
```

## 📊 **Step 10: Monitor and Maintain**

### **Daily Monitoring**
```bash
# Check database usage
turso db show yolovibe-prod --usage

# List recent backups
npm run backup:list

# Check backup health
ls -la backups/
```

### **Weekly Maintenance**
```bash
# Create manual backup before updates
npm run backup:create "Pre-update backup $(date)"

# Clean up old local backups (automatic)
# Retention policy configured in environment variables

# Monitor Turso dashboard
# Visit: https://turso.tech/dashboard
```

## 🛡️ **Backup Strategy Overview**

### **Automated Backups**
- **Schedule**: Daily at 2 AM UTC (configurable)
- **Retention**: 30 days (configurable)
- **Storage**: Local + Cloud (S3/GCS)
- **Integrity**: SHA256 checksum verification
- **Compression**: Automatic SQL compression

### **Manual Backups**
- **Pre-deployment**: Before major updates
- **Pre-restore**: Automatic before any restore operation
- **Ad-hoc**: Any time via CLI commands
- **Testing**: Dry-run capability for safe testing

### **Restore Capabilities**
- **Point-in-time**: Restore to any backup timestamp
- **Selective**: Skip specific tables during restore
- **Safe testing**: Dry-run mode for validation
- **Pre-restore backup**: Automatic current state backup

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Connection Failed**
```bash
# Check token validity
turso auth token

# Regenerate token if expired
turso db tokens create yolovibe-prod

# Test connection manually
turso db shell yolovibe-prod "SELECT 1;"
```

#### **Schema Deployment Failed**
```bash
# Check file exists
ls -la src/registration/database/schema.sql

# Deploy manually line by line
turso db shell yolovibe-prod
# Then paste SQL commands one by one
```

#### **Backup Failed**
```bash
# Check backup directory permissions
ls -la backups/

# Create directory if missing
mkdir -p backups

# Check disk space
df -h
```

#### **Environment Variables Not Set**
```bash
# Verify local variables
echo $***REMOVED***
echo $***REMOVED***

# Verify Vercel variables
vercel env ls
```

## 📈 **Performance Optimization**

### **Query Optimization**
```sql
-- Enable query analysis
EXPLAIN QUERY PLAN SELECT * FROM bookings WHERE user_id = ?;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, created_at);
```

### **Connection Optimization**
```javascript
// Connection pooling is automatic with Turso
// Monitor connection usage in Turso dashboard
```

## 🎯 **Production Checklist**

### **Pre-Launch**
- [ ] Turso database created and configured
- [ ] Environment variables set in Vercel
- [ ] Database schema deployed successfully
- [ ] Test data populated (products, coupons)
- [ ] Backup system tested and working
- [ ] Connection tested from production environment

### **Post-Launch**
- [ ] Monitor database performance in Turso dashboard
- [ ] Verify automated backups are running
- [ ] Set up monitoring alerts for backup failures
- [ ] Document recovery procedures for team
- [ ] Schedule regular backup testing

### **Ongoing Maintenance**
- [ ] Weekly backup verification
- [ ] Monthly restore testing
- [ ] Quarterly database optimization review
- [ ] Annual backup strategy review

## 🔗 **Useful Resources**

- **Turso Documentation**: https://docs.turso.tech/
- **Turso Dashboard**: https://turso.tech/dashboard
- **LibSQL Client Docs**: https://docs.turso.tech/libsql/client-access
- **SQLite Documentation**: https://www.sqlite.org/docs.html

## 🆘 **Support**

### **Turso Support**
- Discord: https://discord.gg/turso
- GitHub: https://github.com/turso-extended/libsql

### **YOLOVibe Backup System**
- Check backup logs in `backups/` directory
- Review console output for detailed error messages
- Test with dry-run before actual operations

---

**🎉 Congratulations! Your YOLOVibe database is now running on Turso with a comprehensive backup strategy!**

**Next Steps:**
1. Test the complete booking flow
2. Verify admin functionality
3. Run end-to-end tests
4. Monitor production performance
5. Set up alerting for backup failures 