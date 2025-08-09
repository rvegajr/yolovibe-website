#!/usr/bin/env tsx

import { existsSync, writeFileSync } from 'fs';
import path from 'path';

type EnvName = 'dev' | 'test' | 'prod';

function envPath(name: EnvName) {
  return path.join(process.cwd(), name === 'prod' ? '.env.prod' : '.env');
}

function writeIfMissing(file: string, content: string) {
  if (!existsSync(file)) {
    writeFileSync(file, content, { encoding: 'utf8', mode: 0o600 });
    console.log(`Created ${file}`);
  } else {
    console.log(`${file} already exists (skipped)`);
  }
}

function main() {
  const env = (process.argv[2] as EnvName) || 'dev';
  if (!['dev', 'test', 'prod'].includes(env)) {
    console.error('Usage: prepare-env <dev|test|prod>');
    process.exit(1);
  }

  // Turso
  if (env === 'dev' || env === 'test') {
    writeIfMissing(envPath('dev'), `DATABASE_URL=libsql://yolovibe-dev-rvegajr.aws-us-east-2.turso.io\nTURSO_AUTH_TOKEN=\n`);
  } else if (env === 'prod') {
    writeIfMissing(envPath('prod'), `DATABASE_URL=libsql://yolovibe-prod-rvegajr.aws-us-east-2.turso.io\nTURSO_AUTH_TOKEN=\n`);
  }

  // SendGrid and Square placeholders
  console.log('Ensure the following env vars are set appropriately:');
  console.log('- SENDGRID_API_KEY, SENDGRID_FROM_EMAIL');
  console.log('- SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT (sandbox|production)');
  console.log('- GOOGLE_CALENDAR_ID, GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN (or ADC)');
  console.log('- For email subjects: non-prod should prefix [DEV] or [TEST]');
}

main();



