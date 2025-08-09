#!/usr/bin/env tsx
import bcrypt from 'bcryptjs';
import { initializeDatabase, getDatabaseConnection, closeDatabaseConnection } from '../src/registration/database/connection.js';

async function main() {
  try {
    await initializeDatabase();
    const db = getDatabaseConnection();
    const email = process.env.EMAIL || 'admin@yolovibecodebootcamp.com';
    const password = process.env.PASSWORD || 'AdminPassword123!';
    const rows = await db.query('SELECT password_hash FROM users WHERE email = ?', [email.toLowerCase()]);
    console.log('Rows:', rows);
    if (!rows || rows.length === 0) {
      console.log('No user found');
      process.exit(2);
    }
    const hash = rows[0].password_hash as string;
    const ok = await bcrypt.compare(password, hash);
    console.log('Compare result:', ok);
  } catch (e) {
    console.error('auth-check error', e);
    process.exitCode = 1;
  } finally {
    closeDatabaseConnection();
  }
}

main();


