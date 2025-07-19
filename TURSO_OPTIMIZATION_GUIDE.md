# 📊 Turso Free Tier Optimization Guide

**Complete guide to optimize your YOLOVibe application to stay within Turso's generous free tier limits**

## 🎯 **Free Tier Limits Overview**

| **Metric** | **Free Tier Limit** | **Overage Cost** | **YOLOVibe Target** |
|------------|---------------------|------------------|---------------------|
| **Storage** | 5 GB | $0.75/GB | < 2 GB (40%) |
| **Rows Read** | 500 Million/month | $1/Billion | < 200M/month (40%) |
| **Rows Written** | 10 Million/month | $1/Million | < 4M/month (40%) |
| **Syncs** | 3 GB/month | $0.35/GB | < 1.5 GB/month (50%) |
| **Databases** | 500 total | $0.20/Active DB | 1-3 databases |

## 📈 **Usage Monitoring Commands**

```bash
# Quick usage check (run daily)
npm run usage:check

# Detailed monthly report
npm run usage:report

# Check for alerts
npm run usage:alerts

# Monthly usage projection
npm run usage:projection

# Official Turso usage (requires Turso CLI)
npm run turso:usage
```

## 🔍 **Query Optimization Strategies**

### **1. Optimize SELECT Queries**

#### ❌ **Avoid These Patterns**
```sql
-- Don't use SELECT * (reads unnecessary columns)
SELECT * FROM bookings WHERE user_id = ?;

-- Don't fetch large result sets without pagination
SELECT * FROM attendees ORDER BY created_at;

-- Don't use LIKE with leading wildcards
SELECT * FROM users WHERE email LIKE '%@gmail.com';
```

#### ✅ **Use These Patterns**
```sql
-- Select only needed columns
SELECT id, user_id, total_amount, status FROM bookings WHERE user_id = ?;

-- Use pagination for large results
SELECT id, first_name, last_name FROM attendees 
ORDER BY created_at DESC 
LIMIT 20 OFFSET ?;

-- Use indexed columns for filtering
SELECT * FROM users WHERE id = ? OR email = ?;

-- Use EXISTS instead of COUNT when checking existence
SELECT EXISTS(SELECT 1 FROM bookings WHERE user_id = ? AND status = 'active');
```

### **2. Implement Query Result Caching**

```typescript
// Simple in-memory cache for frequently accessed data
class QueryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  
  set(key: string, data: any, ttlMs: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }
}

// Usage example
const cache = new QueryCache();

async function getCachedProducts() {
  const cacheKey = 'products:active';
  let products = cache.get(cacheKey);
  
  if (!products) {
    products = await db.query('SELECT * FROM products WHERE is_active = 1');
    cache.set(cacheKey, products, 600000); // Cache for 10 minutes
  }
  
  return products;
}
```

### **3. Batch Operations**

#### ❌ **Avoid Individual Operations**
```typescript
// Don't do this (10 separate write operations)
for (const attendee of attendees) {
  await db.execute(
    'INSERT INTO attendees (booking_id, name, email) VALUES (?, ?, ?)',
    [booking.id, attendee.name, attendee.email]
  );
}
```

#### ✅ **Use Batch Operations**
```typescript
// Do this (1 batch operation)
const values = attendees.map(a => `('${booking.id}', '${a.name}', '${a.email}')`).join(',');
await db.execute(`
  INSERT INTO attendees (booking_id, name, email) 
  VALUES ${values}
`);

// Or use transactions for multiple operations
await db.transaction(() => {
  attendees.forEach(attendee => {
    db.execute(
      'INSERT INTO attendees (booking_id, name, email) VALUES (?, ?, ?)',
      [booking.id, attendee.name, attendee.email]
    );
  });
});
```

## 💾 **Storage Optimization**

### **1. Optimize Data Types**

#### ❌ **Inefficient Data Types**
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,           -- Good for UUIDs
  user_email TEXT,               -- Could be normalized
  description TEXT,              -- Could be VARCHAR with limit
  price REAL,                    -- Use DECIMAL for money
  created_at TEXT,               -- Use proper datetime
  metadata TEXT                  -- Could be JSON or normalized
);
```

#### ✅ **Optimized Data Types**
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,                    -- UUIDs are fine
  user_id INTEGER REFERENCES users(id),  -- Foreign key instead of email
  description VARCHAR(500),               -- Limit text size
  price DECIMAL(10,2),                   -- Proper money type
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status INTEGER DEFAULT 1               -- Enum as integer
);

-- Separate table for metadata if needed
CREATE TABLE booking_metadata (
  booking_id TEXT REFERENCES bookings(id),
  key VARCHAR(50),
  value TEXT
);
```

### **2. Data Cleanup Strategies**

```typescript
// Clean up old data regularly
class DataCleanup {
  // Remove old sessions (run daily)
  async cleanupSessions() {
    await db.execute(`
      DELETE FROM user_sessions 
      WHERE expires_at < datetime('now', '-7 days')
    `);
  }
  
  // Archive old bookings (run monthly)
  async archiveOldBookings() {
    // Move to archive table instead of delete
    await db.execute(`
      INSERT INTO bookings_archive 
      SELECT * FROM bookings 
      WHERE created_at < datetime('now', '-1 year')
    `);
    
    await db.execute(`
      DELETE FROM bookings 
      WHERE created_at < datetime('now', '-1 year')
    `);
  }
  
  // Compress large text fields
  async compressDescriptions() {
    // For very long descriptions, consider compression
    const longDescriptions = await db.query(`
      SELECT id, description FROM bookings 
      WHERE LENGTH(description) > 1000
    `);
    
    // Process and compress if needed
  }
}
```

### **3. Index Optimization**

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_attendees_booking_id ON attendees(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(created_at, status);

-- Remove unused indexes (check with EXPLAIN QUERY PLAN)
-- DROP INDEX IF EXISTS idx_rarely_used;
```

## 🚀 **Application-Level Optimizations**

### **1. Implement Smart Caching**

```typescript
// Cache frequently accessed data
class SmartCache {
  private productCache = new Map();
  private userCache = new Map();
  
  async getProducts() {
    if (!this.productCache.has('all')) {
      const products = await db.query('SELECT * FROM products WHERE is_active = 1');
      this.productCache.set('all', products);
      
      // Expire after 1 hour
      setTimeout(() => this.productCache.delete('all'), 3600000);
    }
    
    return this.productCache.get('all');
  }
  
  async getUser(userId: string) {
    if (!this.userCache.has(userId)) {
      const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      this.userCache.set(userId, user[0]);
      
      // Expire after 15 minutes
      setTimeout(() => this.userCache.delete(userId), 900000);
    }
    
    return this.userCache.get(userId);
  }
}
```

### **2. Reduce Unnecessary Queries**

```typescript
// ❌ Don't do this (multiple queries)
async function getBookingDetails(bookingId: string) {
  const booking = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  const user = await db.query('SELECT * FROM users WHERE id = ?', [booking[0].user_id]);
  const attendees = await db.query('SELECT * FROM attendees WHERE booking_id = ?', [bookingId]);
  
  return { booking: booking[0], user: user[0], attendees };
}

// ✅ Do this (single query with JOIN)
async function getBookingDetails(bookingId: string) {
  const result = await db.query(`
    SELECT 
      b.*, 
      u.first_name, u.last_name, u.email,
      GROUP_CONCAT(a.first_name || ' ' || a.last_name) as attendee_names
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    LEFT JOIN attendees a ON b.id = a.booking_id
    WHERE b.id = ?
    GROUP BY b.id
  `, [bookingId]);
  
  return result[0];
}
```

### **3. Optimize API Endpoints**

```typescript
// Implement pagination for all list endpoints
export async function GET({ url }) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  const bookings = await db.query(`
    SELECT id, user_id, total_amount, status, created_at
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  return new Response(JSON.stringify({
    data: bookings,
    page,
    limit,
    hasMore: bookings.length === limit
  }));
}
```

## 📊 **Monitoring and Alerts**

### **1. Set Up Daily Monitoring**

```bash
# Add to your deployment script or cron job
#!/bin/bash

# Check usage daily
npm run usage:check

# Alert if usage > 75%
USAGE_OUTPUT=$(npm run usage:check 2>&1)
if echo "$USAGE_OUTPUT" | grep -q "WARNING\|CRITICAL"; then
  # Send alert (email, Slack, etc.)
  echo "High Turso usage detected!"
  npm run usage:alerts
fi
```

### **2. Weekly Optimization Review**

```bash
# Weekly optimization script
#!/bin/bash

echo "📊 Weekly Turso Usage Review"
echo "============================"

# Show detailed report
npm run usage:report

# Show monthly projection
npm run usage:projection

# Check official Turso usage
npm run turso:usage

echo ""
echo "🎯 Action Items:"
echo "1. Review high-usage queries"
echo "2. Clean up old data if needed"
echo "3. Optimize slow queries"
echo "4. Update caching strategies"
```

## 🚨 **Emergency Optimization (If Approaching Limits)**

### **If You're at 90% of Any Limit:**

#### **For High Read Usage:**
```bash
# 1. Implement aggressive caching
# 2. Add more indexes
# 3. Optimize SELECT queries
# 4. Use pagination everywhere

# Quick fixes:
npm run usage:alerts  # See specific recommendations
```

#### **For High Write Usage:**
```bash
# 1. Batch all insert/update operations
# 2. Reduce unnecessary updates
# 3. Use upsert instead of insert+update
# 4. Implement write buffering

# Quick fixes:
# - Review all UPDATE queries
# - Batch attendee insertions
# - Reduce backup frequency temporarily
```

#### **For High Storage Usage:**
```bash
# 1. Clean up old data immediately
npm run backup:create "Before cleanup"

# 2. Remove old backups
ls -la backups/
rm backups/yolovibe-2024-*  # Remove old backups

# 3. Optimize data types
# 4. Archive old records
```

## 💰 **Cost Estimation**

### **Current YOLOVibe Usage Estimates:**

Based on typical workshop booking site:

| **Activity** | **Monthly Estimate** | **% of Limit** |
|--------------|---------------------|----------------|
| **Page Views** | 10,000 visits | ~2M reads (0.4%) |
| **Bookings** | 50 bookings | ~500 writes (0.005%) |
| **Admin Usage** | Daily management | ~100K reads (0.02%) |
| **Backups** | Daily backups | ~10K writes (0.1%) |
| **Storage** | All data + backups | ~100MB (2%) |

**Total Usage: Well within free tier limits! 🎉**

### **Scale Projections:**

| **Scale** | **Monthly Visits** | **Read %** | **Write %** | **Storage** | **Status** |
|-----------|-------------------|------------|-------------|-------------|------------|
| **Small** | 1,000 | 0.1% | 0.01% | 50MB | ✅ Free |
| **Medium** | 10,000 | 1% | 0.1% | 200MB | ✅ Free |
| **Large** | 100,000 | 10% | 1% | 1GB | ✅ Free |
| **Very Large** | 500,000 | 50% | 5% | 3GB | ✅ Free |
| **Enterprise** | 1,000,000+ | 100%+ | 10%+ | 5GB+ | 💰 Paid |

## 🎯 **Best Practices Summary**

### **Daily Operations:**
- ✅ Monitor usage with `npm run usage:check`
- ✅ Use specific SELECT columns, not SELECT *
- ✅ Implement result caching for frequent queries
- ✅ Batch write operations
- ✅ Use pagination for large result sets

### **Weekly Maintenance:**
- ✅ Review `npm run usage:report`
- ✅ Clean up old sessions and temporary data
- ✅ Optimize slow queries identified in logs
- ✅ Update cache TTL based on usage patterns

### **Monthly Planning:**
- ✅ Analyze `npm run usage:projection`
- ✅ Archive old data if approaching storage limits
- ✅ Review and optimize database schema
- ✅ Plan for growth and scaling needs

### **Emergency Procedures:**
- 🚨 If usage > 90%: Implement emergency optimizations
- 🚨 If projected to exceed: Enable Turso overages temporarily
- 🚨 If consistent high usage: Consider upgrading to Scaler plan

---

**🎉 With these optimizations, YOLOVibe should comfortably stay within Turso's free tier while supporting hundreds of workshop bookings per month!**

**Key Takeaway:** The free tier is very generous - most workshop booking sites will never need to pay anything with proper optimization. 