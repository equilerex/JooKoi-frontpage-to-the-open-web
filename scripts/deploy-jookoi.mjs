#!/usr/bin/env node
// Manual, on-demand deploy of the static site to a self-managed nginx host. Not wired into CI.
//
//   pnpm run deploy:jookoi                   build with base-href "/" and copy to the server
//   pnpm run deploy:jookoi -- --dry-run      build, list what would be copied, change nothing
//   pnpm run deploy:jookoi -- --check        read the config and test the ssh login, no build
//
// The Pages build bakes a subfolder base-href into every URL, so the domain root needs its own
// build with BASE_HREF=/. Files are extracted over the web root without deleting anything: the
// protected folders are never touched, and a build that would write into one of them is refused.
// Old hashed bundles are not pruned (small, harmless).

import { execSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distBrowser = join(root, 'dist', 'jookoi-frontpage', 'browser');
const dryRun = process.argv.includes('--dry-run');
const checkOnly = process.argv.includes('--check');

function fail(message) {
  console.error(`deploy-jookoi: ${message}`);
  process.exit(1);
}

// 0. Load and validate the local config.
const configPath = resolve(root, process.env.JOOKOI_CONFIG ?? '.local/deploy-jookoi.json');
if (!existsSync(configPath)) {
  fail(`no config at ${configPath}. Create it (see the header of this file for the fields).`);
}
let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  fail(`cannot parse ${configPath}: ${error.message}`);
}
const { target, key: rawKey, webRoot, protectedFolders = [], siteUrl } = config;
for (const [name, value] of Object.entries({ target, key: rawKey, webRoot })) {
  if (typeof value !== 'string' || value.length === 0) fail(`config field "${name}" is missing.`);
}
if (!Array.isArray(protectedFolders)) fail('config field "protectedFolders" must be an array.');
const key = rawKey.startsWith('~') ? join(homedir(), rawKey.slice(1)) : rawKey;
const sshArgs = ['-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-i', key, target];

if (checkOnly) {
  const probe = spawnSync(
    'ssh',
    [...sshArgs, 'echo ok; test -d ' + webRoot + ' && echo webroot-ok'],
    {
      encoding: 'utf8',
    },
  );
  console.log(probe.stdout.trim() || probe.stderr.trim());
  process.exit(probe.status === 0 ? 0 : 1);
}

// 1. Build with the site root as base-href. Reuses the Pages build script (also writes 404.html).
console.log('deploy-jookoi: building with base-href "/" (a production build, on purpose)...');
execSync('node scripts/build-gh-pages.mjs', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, BASE_HREF: '/' },
});

if (!existsSync(join(distBrowser, 'index.html'))) {
  fail('build output has no index.html, aborting.');
}

// 2. Refuse to overwrite the folders that belong to other apps.
const clash = readdirSync(distBrowser).filter((name) => protectedFolders.includes(name));
if (clash.length > 0) {
  fail(`build contains protected folder(s): ${clash.join(', ')}. Aborting.`);
}

// 3. Stream a tar of the build into the web root. sudo because the root's owners differ.
const tarCreate = ['-cf', '-', '--exclude=.nojekyll', '-C', distBrowser, '.'];
// The dry run lists the first 40 entries but must still drain stdin (awk, not head), or the pipe breaks.
const remote = dryRun
  ? `tar -tf - | awk 'NR<=40'`
  : // Windows tar stores 666/777 modes; --no-same-permissions applies the server umask (644/755) instead.
    `sudo tar -xf - --no-same-owner --no-same-permissions -C ${webRoot}`;

console.log(`deploy-jookoi: ${dryRun ? 'dry run, listing' : 'copying to'} ${target}:${webRoot}`);
const tar = spawn('tar', tarCreate, { stdio: ['ignore', 'pipe', 'inherit'] });
const ssh = spawn('ssh', [...sshArgs, remote], { stdio: ['pipe', 'inherit', 'inherit'] });
tar.stdout.pipe(ssh.stdin);

const [tarCode, sshCode] = await Promise.all([
  new Promise((res) => tar.on('close', res)),
  new Promise((res) => ssh.on('close', res)),
]);
if (tarCode !== 0 || sshCode !== 0) {
  fail(`failed (tar exit ${tarCode}, ssh exit ${sshCode}).`);
}

// 4. Quick smoke check.
if (!dryRun && siteUrl) {
  const status = execSync(`curl -s -o NUL -w "%{http_code}" ${siteUrl} || true`, {
    encoding: 'utf8',
    shell: true,
  }).trim();
  console.log(`deploy-jookoi: done. ${siteUrl} answered ${status || 'no status'}.`);
} else if (!dryRun) {
  console.log('deploy-jookoi: done.');
}
