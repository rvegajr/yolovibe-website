#!/usr/bin/env tsx
import bcrypt from 'bcryptjs';
import { initializeDatabase, getDatabaseConnection } from '../../registration/database/connection.js';

async function main(){
  const email = process.env.ADMIN_EMAIL || 'admin@yolovibecodebootcamp.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  await initializeDatabase();
  const db = getDatabaseConnection();
  const rows = await db.query('SELECT COUNT(*) as c FROM users WHERE email = ?', [email.toLowerCase()]);
  const exists = (rows && rows[0] && (rows[0].c ?? rows[0].count ?? 0)) > 0;
  if (exists) {
    console.log(`ℹ️ Admin already exists: ${email}`);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await db.execute(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, is_admin, email_verified, created_at, updated_at)
     VALUES (?, ?, ?, 'Admin', 'User', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [email.toLowerCase(), email.toLowerCase(), hash]
  );
  console.log(`✅ Admin created: ${email}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });


