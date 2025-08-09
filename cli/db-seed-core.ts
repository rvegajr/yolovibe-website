#!/usr/bin/env tsx
import { initializeDatabase, getDatabaseConnection, closeDatabaseConnection } from '../src/registration/database/connection.js';
import bcrypt from 'bcryptjs';

async function upsert(sql: string, params: any[]) {
  const db = getDatabaseConnection();
  await db.execute(sql, params);
}

async function seedCore() {
  const db = getDatabaseConnection();

  // Users
  const adminEmail = 'admin@yolovibecodebootcamp.com';
  const instructorEmail = 'instructor@yolovibecodebootcamp.com';
  const adminHash = await bcrypt.hash('Sup3rP4$$w0rd', 10);
  const instructorHash = await bcrypt.hash('instructor123', 10);

  await upsert(
    `INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, is_admin, email_verified)
     VALUES ('user-admin', ?, ?, 'YOLO', 'Admin', 1, 1)`,
    [adminEmail, adminHash]
  );
  // Force ensure password is expected for deterministic E2E
  await upsert(
    `UPDATE users SET password_hash = ? WHERE email = ?`,
    [adminHash, adminEmail]
  );
  await upsert(
    `INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, is_admin, email_verified)
     VALUES ('user-instructor', ?, ?, 'YOLO', 'Instructor', 0, 1)`,
    [instructorEmail, instructorHash]
  );
  await upsert(
    `UPDATE users SET password_hash = ? WHERE email = ?`,
    [instructorHash, instructorEmail]
  );

  // Products (align with schema defaults)
  await upsert(
    `INSERT OR IGNORE INTO products (id, name, description, product_type, price, duration_days, max_capacity)
     VALUES ('prod-3day', '3-Day YOLO Workshop', 'Intensive 3-day workshop', 'THREE_DAY', 3000.00, 3, 12)`,
    []
  );
  await upsert(
    `INSERT OR IGNORE INTO products (id, name, description, product_type, price, duration_days, max_capacity)
     VALUES ('prod-5day', '5-Day YOLO Intensive', 'Comprehensive 5-day workshop', 'FIVE_DAY', 4500.00, 5, 12)`,
    []
  );

  // Coupon
  await upsert(
    `INSERT OR IGNORE INTO coupons (code, description, discount_percentage, usage_limit, is_active)
     VALUES ('E2E_TEST_100', 'E2E Testing 100% Discount', 100.00, 1000, 1)`,
    []
  );

  // Minimal future workshop entries to satisfy listings (one per product)
  const today = new Date();
  const start3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  const end3 = new Date(start3.getFullYear(), start3.getMonth(), start3.getDate() + 2);
  const start5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const end5 = new Date(start5.getFullYear(), start5.getMonth(), start5.getDate() + 4);

  await upsert(
    `INSERT OR IGNORE INTO workshops (id, product_id, start_date, end_date, current_capacity, max_capacity, status)
     VALUES ('ws-3day-1', 'prod-3day', ?, ?, 0, 12, 'ACTIVE')`,
    [start3.toISOString().slice(0,10), end3.toISOString().slice(0,10)]
  );
  await upsert(
    `INSERT OR IGNORE INTO workshops (id, product_id, start_date, end_date, current_capacity, max_capacity, status)
     VALUES ('ws-5day-1', 'prod-5day', ?, ?, 0, 12, 'ACTIVE')`,
    [start5.toISOString().slice(0,10), end5.toISOString().slice(0,10)]
  );

  // Consulting availability window defaults (Mon–Fri 09:00–17:00)
  // Create table if not exists (in case older DBs)
  await upsert(
    `CREATE TABLE IF NOT EXISTS consulting_availability_windows (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      min_duration_minutes INTEGER NOT NULL DEFAULT 120,
      is_active BOOLEAN NOT NULL DEFAULT 1
    )`,
    []
  );

  for (let d = 1; d <= 5; d++) {
    await upsert(
      `INSERT OR IGNORE INTO consulting_availability_windows (id, day_of_week, start_time, end_time, min_duration_minutes, is_active)
       VALUES (?, ?, '09:00', '17:00', 120, 1)`,
      [`caw-${d}`, d]
    );
  }

  console.log('✅ Core seed complete (idempotent).');
}

async function main() {
  try {
    await initializeDatabase();
    await seedCore();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    closeDatabaseConnection();
  }
}

main();


