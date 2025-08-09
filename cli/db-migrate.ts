#!/usr/bin/env tsx
import { initializeDatabase, closeDatabaseConnection } from '../src/registration/database/connection.js';

async function main() {
  try {
    console.log('🛠️ Running database migrations...');
    await initializeDatabase();
    console.log('✅ Migrations complete or already up to date.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    closeDatabaseConnection();
  }
}

main();


