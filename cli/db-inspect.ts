#!/usr/bin/env tsx
import { initializeDatabase, getDatabaseConnection, closeDatabaseConnection } from '../src/registration/database/connection.js';

async function main() {
  try {
    await initializeDatabase();
    const db = getDatabaseConnection();
    const users = await db.query('SELECT email, is_admin, length(password_hash) AS ph_len FROM users ORDER BY email LIMIT 10');
    const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('Tables:', tables.map((r:any)=>r.name));
    console.log('Users:', users);
  } catch (e) {
    console.error('inspect error', e);
    process.exitCode = 1;
  } finally {
    closeDatabaseConnection();
  }
}

main();


