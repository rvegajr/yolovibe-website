# 🚨 DATABASE DEPLOYMENT GUIDE - CRITICAL DATA PERSISTENCE

**⚠️ IMPORTANT: The current setup WILL DELETE ALL DATA on deployment unless you follow this guide!**

## 🔥 **PROBLEM: Data Loss on Deployment**

The current configuration uses **in-memory SQLite** for production, which means:
- ❌ **ALL DATA IS LOST** on every deployment
- ❌ **ALL USER REGISTRATIONS** are deleted
- ❌ **ALL BOOKINGS** are lost
- ❌ **ALL ADMIN SETTINGS** are reset

## ✅ **SOLUTION: Persistent Database Options**

### **Option 1: Turso (SQLite-compatible Cloud Database) - RECOMMENDED**

**Best for:** Small to medium applications, SQLite compatibility, easy setup

1. **Create Turso Account**
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Create database
   turso db create yolovibe-prod
   
   # Get connection URL
   turso db show yolovibe-prod
   ```

2. **Install Turso Client**
   ```bash
   npm install @libsql/client
   ```

3. **Set Environment Variables**
   ```bash
   # In Vercel dashboard or .env
   DATABASE_URL="libsql://your-database-url.turso.tech"
   TURSO_AUTH_TOKEN="your-auth-token"
   ```

4. **Migration Script**
   ```bash
   # Run once to migrate existing data
   turso db shell yolovibe-prod < src/registration/database/schema.sql
   ```

### **Option 2: PostgreSQL (Neon, Supabase, Railway) - ENTERPRISE**

**Best for:** Large applications, complex queries, enterprise features

1. **Create PostgreSQL Database**
   - **Neon**: https://neon.tech (Free tier available)
   - **Supabase**: https://supabase.com (Free tier available)  
   - **Railway**: https://railway.app (Pay-as-you-go)
   - **Vercel Postgres**: https://vercel.com/storage/postgres

2. **Install PostgreSQL Client**
   ```bash
   npm install pg @types/pg
   ```

3. **Set Environment Variables**
   ```bash
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   ```

4. **Update Connection Code** (implement PostgreSQL adapter)

### **Option 3: PlanetScale (MySQL-compatible)**

**Best for:** Scalable MySQL applications

1. **Create PlanetScale Database**
   ```bash
   # Install PlanetScale CLI
   npm install -g @planetscale/cli
   
   # Login and create database
   pscale auth login
   pscale database create yolovibe-prod
   ```

2. **Install MySQL Client**
   ```bash
   npm install mysql2
   ```

3. **Set Environment Variables**
   ```bash
   DATABASE_URL="mysql://username:password@hostname:port/database"
   ```

## 🚀 **IMMEDIATE ACTION REQUIRED**

### **Quick Setup with Turso (5 minutes)**

```bash
# 1. Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Create account and database
turso auth login
turso db create yolovibe-prod

# 3. Get connection details
turso db show yolovibe-prod --url
turso db tokens create yolovibe-prod

# 4. Set in Vercel
vercel env add DATABASE_URL
# Enter: libsql://your-database-url.turso.tech

vercel env add TURSO_AUTH_TOKEN  
# Enter: your-auth-token

# 5. Deploy database schema
turso db shell yolovibe-prod < src/registration/database/schema.sql

# 6. Deploy application
vercel --prod
```

## 📋 **DATA MIGRATION CHECKLIST**

### **Before First Production Deployment**

- [ ] Choose persistent database provider (Turso recommended)
- [ ] Create production database instance
- [ ] Set `DATABASE_URL` environment variable
- [ ] Run database schema migration
- [ ] Test connection with staging deployment
- [ ] Backup existing local data (if any)
- [ ] Update monitoring and alerting

### **For Existing Deployments with Data**

If you already have data in production that you need to preserve:

1. **Export Existing Data**
   ```bash
   # If you have access to the current database
   sqlite3 /tmp/yolovibe.db .dump > backup.sql
   ```

2. **Import to New Database**
   ```bash
   # For Turso
   turso db shell yolovibe-prod < backup.sql
   
   # For PostgreSQL
   psql $DATABASE_URL < backup.sql
   ```

3. **Verify Data Migration**
   ```bash
   # Test critical queries
   turso db shell yolovibe-prod "SELECT COUNT(*) FROM users;"
   turso db shell yolovibe-prod "SELECT COUNT(*) FROM bookings;"
   ```

## ⚙️ **ENVIRONMENT CONFIGURATION**

### **Required Environment Variables**

```bash
# Production Database (REQUIRED)
DATABASE_URL="libsql://your-db.turso.tech" # or PostgreSQL/MySQL URL

# Database Authentication (for Turso)
TURSO_AUTH_TOKEN="your-auth-token"

# Backup Configuration (Optional but recommended)
DATABASE_BACKUP_URL="s3://your-backup-bucket/db-backups/"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# Existing environment variables
GOOGLE_CALENDAR_CLIENT_ID="..."
SENDGRID_API_KEY="..."
# ... other variables
```

### **Local Development vs Production**

```bash
# .env.local (development)
DATABASE_URL="./data/yolovibe.db"  # Local SQLite file

# .env.production (Vercel)
DATABASE_URL="libsql://prod.turso.tech"  # Cloud database
```

## 🔄 **BACKUP STRATEGY**

### **Automated Backups**

1. **Daily Database Backups**
   ```bash
   # Add to your deployment pipeline
   turso db dump yolovibe-prod > backup-$(date +%Y%m%d).sql
   aws s3 cp backup-$(date +%Y%m%d).sql s3://your-backup-bucket/
   ```

2. **Pre-Deployment Backups**
   ```bash
   # Run before each deployment
   npm run backup:create
   ```

3. **Monitoring and Alerts**
   ```bash
   # Monitor database health
   turso db show yolovibe-prod --usage
   ```

## 🚨 **CRITICAL WARNINGS**

### **⚠️ DO NOT DEPLOY WITHOUT PERSISTENT DATABASE**

```bash
# ❌ DANGER: This will delete all data
vercel --prod  # Without DATABASE_URL set

# ✅ SAFE: This preserves data
vercel env add DATABASE_URL
vercel --prod  # With persistent database configured
```

### **⚠️ Test Database Connection First**

```bash
# Test connection before going live
npm run test:database-connection
```

### **⚠️ Monitor Database Usage**

```bash
# Set up monitoring for:
# - Connection count
# - Storage usage  
# - Query performance
# - Backup success/failure
```

## 📊 **DATABASE PROVIDERS COMPARISON**

| **Provider** | **Type** | **Free Tier** | **Setup Time** | **Compatibility** | **Recommended For** |
|--------------|----------|---------------|----------------|-------------------|---------------------|
| **Turso** | SQLite | 500MB, 1B rows | 5 minutes | Perfect | Small-Medium apps |
| **Neon** | PostgreSQL | 512MB, 3GB transfer | 10 minutes | Requires adapter | Enterprise apps |
| **Supabase** | PostgreSQL | 500MB, 2GB transfer | 10 minutes | Requires adapter | Full-stack apps |
| **PlanetScale** | MySQL | 1GB, 1B reads | 15 minutes | Requires adapter | Scalable apps |
| **Vercel Postgres** | PostgreSQL | Pay per use | 5 minutes | Requires adapter | Vercel-native |

## 🎯 **RECOMMENDED SETUP FOR YOLOVIBE**

**For immediate deployment: Use Turso**
- ✅ SQLite-compatible (no code changes)
- ✅ 5-minute setup
- ✅ Free tier sufficient for launch
- ✅ Easy migration path to PostgreSQL later

**For enterprise scale: Use Neon PostgreSQL**
- ✅ More powerful queries
- ✅ Better concurrent access
- ✅ Advanced features (full-text search, etc.)
- ❌ Requires code changes for PostgreSQL adapter

## 🔧 **IMPLEMENTATION STATUS**

### **✅ Completed**
- [x] Database connection abstraction
- [x] Environment detection (local vs production)
- [x] Fallback schema creation
- [x] Migration system
- [x] Connection pooling

### **🚧 TODO (Choose One)**
- [ ] Implement Turso/LibSQL adapter
- [ ] Implement PostgreSQL adapter  
- [ ] Implement MySQL adapter
- [ ] Add backup/restore functionality
- [ ] Add monitoring and health checks

## 🚀 **NEXT STEPS**

1. **IMMEDIATE (Required for production)**
   - Choose database provider (Turso recommended)
   - Set up production database
   - Configure environment variables
   - Test connection

2. **SHORT TERM (Within 1 week)**
   - Implement chosen database adapter
   - Set up automated backups
   - Add monitoring and alerts
   - Document recovery procedures

3. **LONG TERM (Within 1 month)**
   - Optimize database performance
   - Implement read replicas (if needed)
   - Add database analytics
   - Plan scaling strategy

---

**🎯 CRITICAL ACTION: Do not deploy to production until you have configured a persistent database. Current setup WILL DELETE ALL DATA on deployment!** 