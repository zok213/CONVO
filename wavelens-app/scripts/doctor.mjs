import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const checks = [];

function pass(name, detail = '') {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = '') {
  checks.push({ ok: false, name, detail });
}

function command(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function parseDotEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const scripts = packageJson.scripts ?? {};
for (const name of ['dev', 'build', 'start', 'lint', 'typecheck', 'doctor', 'verify:api', 'verify']) {
  if (scripts[name]) pass(`script:${name}`);
  else fail(`script:${name}`, 'missing package.json script');
}

try {
  const nodeVersion = command('node --version');
  const major = Number(nodeVersion.replace(/^v/, '').split('.')[0]);
  if (major >= 22) pass('node', nodeVersion);
  else fail('node', `${nodeVersion}; expected Node 22+`);
} catch (error) {
  fail('node', error instanceof Error ? error.message : String(error));
}

try {
  pass('npm', command('npm --version'));
} catch (error) {
  fail('npm', error instanceof Error ? error.message : String(error));
}

const envExamplePath = join(root, '.env.local.example');
const envExample = existsSync(envExamplePath) ? readFileSync(envExamplePath, 'utf8') : '';
for (const key of [
  'NEXT_PUBLIC_AGORA_APP_ID',
  'NEXT_AGORA_APP_CERTIFICATE',
  'AGORA_CUSTOMER_ID',
  'AGORA_CUSTOMER_SECRET',
  'SOLANA_PRIVATE_KEY',
  'SESSION_WEBHOOK_URL',
  'NEXT_LLM_API_KEY',
  'NEXT_LLM_URL',
]) {
  if (envExample.includes(`${key}=`)) pass(`env-example:${key}`);
  else fail(`env-example:${key}`, 'missing from .env.local.example');
}

if (/^AGORA_APP_CERTIFICATE=/m.test(envExample)) {
  fail('env-example:legacy-cert-name', 'use NEXT_AGORA_APP_CERTIFICATE instead');
} else {
  pass('env-example:legacy-cert-name');
}

const localEnv = { ...parseDotEnv(join(root, '.env.local')), ...process.env };
for (const key of ['NEXT_PUBLIC_AGORA_APP_ID', 'NEXT_AGORA_APP_CERTIFICATE']) {
  const value = localEnv[key];
  if (value && !String(value).startsWith('your_')) pass(`env:${key}`);
  else fail(`env:${key}`, 'missing or placeholder; live demo requires this secret');
}

for (const key of ['AGORA_CUSTOMER_ID', 'AGORA_CUSTOMER_SECRET']) {
  if (localEnv[key]) pass(`env-optional:${key}`);
  else pass(`env-optional:${key}`, 'not set; RTT route will return standby 501');
}

if (localEnv.SOLANA_PRIVATE_KEY) {
  try {
    const parsed = JSON.parse(localEnv.SOLANA_PRIVATE_KEY);
    if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
      pass('env-optional:SOLANA_PRIVATE_KEY');
    } else {
      fail('env-optional:SOLANA_PRIVATE_KEY', 'must be JSON array of byte values');
    }
  } catch {
    fail('env-optional:SOLANA_PRIVATE_KEY', 'must be valid JSON array');
  }
} else {
  pass('env-optional:SOLANA_PRIVATE_KEY', 'not set; local dev will create an ignored keypair file');
}

try {
  const tracked = command('git ls-files -- key_and_secret.txt wavelens-app/.solana-keypair.json');
  const status = command('git status --porcelain -- key_and_secret.txt wavelens-app/.solana-keypair.json');
  const stillTracked = tracked
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !status.split(/\r?\n/).some((line) => line.endsWith(file) && line.trim().startsWith('D')));
  if (stillTracked.length === 0) pass('secrets:tracked-files');
  else fail('secrets:tracked-files', `remove tracked secret-like files: ${stillTracked.join(', ')}`);
} catch (error) {
  fail('secrets:tracked-files', error instanceof Error ? error.message : String(error));
}

for (const result of checks) {
  const prefix = result.ok ? 'OK ' : 'ERR';
  console.log(`${prefix} ${result.name}${result.detail ? ` - ${result.detail}` : ''}`);
}

if (checks.some((result) => !result.ok)) {
  process.exit(1);
}
