#!/usr/bin/env node
// Builds the application with a subfolder base-href for GitHub Pages,
// creates the SPA fallback (404.html from index.csr.html), and writes .nojekyll.

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distBrowser = join(root, 'dist', 'jookoi-frontpage', 'browser');
const baseHref = process.env.BASE_HREF ?? '/JooKoi-frontpage-to-the-open-web/';

console.log(`build-gh-pages: building with base-href "${baseHref}"...`);

// 1. Prerequisites
execSync('node scripts/primeui-license.mjs', { cwd: root, stdio: 'inherit' });
execSync('node scripts/build-library-content.mjs', { cwd: root, stdio: 'inherit' });

// 2. Angular production build with base-href
const pnpmExec = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
execSync(`${pnpmExec} exec ng build --base-href ${baseHref}`, {
  cwd: root,
  stdio: 'inherit',
});

// 3. GitHub Pages 404 SPA fallback
// Angular 22 emits index.csr.html as the un-prerendered client-side fallback.
const csrFallback = join(distBrowser, 'index.csr.html');
const indexHtml = join(distBrowser, 'index.html');
const notFoundHtml = join(distBrowser, '404.html');

if (existsSync(csrFallback)) {
  copyFileSync(csrFallback, notFoundHtml);
  console.log('build-gh-pages: created 404.html from index.csr.html (CSR fallback)');
} else if (existsSync(indexHtml)) {
  copyFileSync(indexHtml, notFoundHtml);
  console.log('build-gh-pages: created 404.html from index.html (fallback)');
} else {
  console.warn('build-gh-pages: warning: neither index.csr.html nor index.html found');
}

// 4. Bypass Jekyll processing on GitHub Pages
writeFileSync(join(distBrowser, '.nojekyll'), '');
console.log('build-gh-pages: created .nojekyll');
