#!/usr/bin/env node
import { existsSync, readFileSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const viteJs = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const netlifyToml = join(root, 'netlify.toml');
const disabledToml = join(root, 'netlify.toml.local-disabled');
const appEnvPath = join(root, '.grok', 'app-env.json');

if (!existsSync(viteJs)) {
  console.error('[NEXBIT] Vite is not installed. Run npm install first.');
  process.exit(1);
}

const env = { ...process.env, NEXBIT_LOCAL: '1' };
try {
  const parsed = JSON.parse(readFileSync(appEnvPath, 'utf8'));
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    for (const [key, value] of Object.entries(parsed)) {
      if (key.startsWith('VITE_') && typeof value === 'string' && env[key] === undefined) {
        env[key] = value;
      }
    }
  }
} catch {}

let movedNetlifyConfig = false;
function disableNetlifyAutoDev() {
  try {
    if (existsSync(netlifyToml) && !existsSync(disabledToml)) {
      renameSync(netlifyToml, disabledToml);
      movedNetlifyConfig = true;
      console.log('[NEXBIT] Netlify local emulation disabled for this dev session.');
    }
  } catch (err) {
    console.warn('[NEXBIT] Could not temporarily disable netlify.toml:', err?.message || err);
  }
}
function restoreNetlifyConfig() {
  try {
    if (movedNetlifyConfig && existsSync(disabledToml) && !existsSync(netlifyToml)) {
      renameSync(disabledToml, netlifyToml);
      movedNetlifyConfig = false;
    }
  } catch (err) {
    console.warn('[NEXBIT] Could not restore netlify.toml:', err?.message || err);
  }
}

disableNetlifyAutoDev();

const child = spawn(process.execPath, [viteJs, 'dev', '--host', '0.0.0.0', '--port', '8080'], {
  cwd: root,
  env,
  stdio: 'inherit',
});

let exiting = false;
function finish(code = 0) {
  if (exiting) return;
  exiting = true;
  restoreNetlifyConfig();
  process.exit(code);
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    try { child.kill(signal); } catch {}
    setTimeout(() => finish(0), 100);
  });
}

child.on('error', (err) => {
  console.error('[NEXBIT] Failed to start Vite:', err?.message || err);
  finish(1);
});
child.on('exit', (code) => finish(code ?? 0));
process.on('exit', restoreNetlifyConfig);
