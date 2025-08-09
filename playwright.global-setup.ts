import type { FullConfig } from '@playwright/test';
import { spawn } from 'node:child_process';

function run(cmd: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { cwd, shell: true, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function globalSetup(config: FullConfig) {
  const cwd = process.cwd();
  // Prepare environment
  await run('npm run env:prepare:dev', cwd).catch(() => {});
  // Strict preflight: all prerequisite integrations must be healthy
  await run('npx tsx cli/validate-integrations.ts --env dev --ci --verbose', cwd);
  // Ensure schema and seed for deterministic tests
  await run('npm run db:migrate', cwd);
  await run('npm run db:seed:core', cwd);
}

export default globalSetup;


