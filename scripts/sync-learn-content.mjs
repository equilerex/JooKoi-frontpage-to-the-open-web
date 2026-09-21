// Copies the AI tooling crash course from its canonical repo into
// content/library/ai-tooling-crash-course-for-developers/, keeping the real
// folder tree (decisions 028 + 029). Does not run at start/build — CI never
// needs the sibling repo.
//
// Source, first match:
//   1. JOOKOI_DEV_STACK (the JooKoi-developer-stack root)
//   2. ../JooKoi-developer-stack next to this repo
//   3. GitHub tarball of equilerex/JooKoi-developer-stack (main)
//
// Source README.md and TODO.md stay in the source repo (skip). Source
// topic-index.md is copied as README.md (decision 030 — section entry doc).
// Hand-authored dest index.md is folder meta and is not overwritten. Then
// runs the library generator.

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceFolder = 'ai-tooling-crash-course-for-developers';
const destRoot = join(root, 'content', 'library', sourceFolder);
const githubTarball =
  'https://codeload.github.com/equilerex/JooKoi-developer-stack/tar.gz/refs/heads/main';
const skipNames = new Set(['readme.md', 'todo.md']);

function posixRel(from, to) {
  return relative(from, to).split('\\').join('/');
}

function resolveLocalSource() {
  const fromEnv = process.env.JOOKOI_DEV_STACK;
  if (fromEnv) {
    const candidate = join(fromEnv, sourceFolder);
    if (existsSync(candidate)) return candidate;
  }
  const sibling = join(root, '..', 'JooKoi-developer-stack', sourceFolder);
  if (existsSync(sibling)) return sibling;
  return null;
}

async function fetchGithubSource() {
  const scratch = mkdtempSync(join(tmpdir(), 'jookoi-dev-stack-'));
  const tarball = join(scratch, 'stack.tar.gz');
  const response = await fetch(githubTarball);
  if (!response.ok) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error(`sync-learn-content: GitHub fetch failed (${response.status})`);
  }
  writeFileSync(tarball, Buffer.from(await response.arrayBuffer()));
  const extract = spawnSync('tar', ['-xzf', tarball, '-C', scratch], { encoding: 'utf8' });
  if (extract.status !== 0) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error(`sync-learn-content: tar extract failed: ${extract.stderr || extract.stdout}`);
  }
  const extracted = readdirSync(scratch, { withFileTypes: true }).find(
    (e) => e.isDirectory() && e.name.startsWith('JooKoi-developer-stack'),
  );
  if (!extracted) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error('sync-learn-content: tarball did not contain JooKoi-developer-stack-*');
  }
  const dir = join(scratch, extracted.name, sourceFolder);
  if (!existsSync(dir)) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error(`sync-learn-content: ${sourceFolder} missing from GitHub snapshot`);
  }
  return { dir, cleanup: () => rmSync(scratch, { recursive: true, force: true }) };
}

function destFileName(sourceName) {
  // Crash-course survey file → library section entry doc (decision 030).
  if (sourceName.toLowerCase() === 'topic-index.md') return 'README.md';
  return sourceName;
}

function copyMarkdownTree(src, dest, destRootAbs, written) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const from = join(src, entry.name);
    if (entry.isDirectory()) {
      copyMarkdownTree(from, join(dest, entry.name), destRootAbs, written);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (skipNames.has(entry.name.toLowerCase())) continue;
    const to = join(dest, destFileName(entry.name));
    copyFileSync(from, to);
    written.add(posixRel(destRootAbs, to));
  }
}

function pruneStale(dest, destRootAbs, written) {
  if (!existsSync(dest)) return;
  for (const entry of readdirSync(dest, { withFileTypes: true })) {
    const abs = join(dest, entry.name);
    if (entry.isDirectory()) {
      pruneStale(abs, destRootAbs, written);
      if (readdirSync(abs).length === 0) rmSync(abs, { recursive: true });
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    // Hand-authored folder meta (title/summary/intro) survives re-sync.
    if (entry.name === 'index.md') continue;
    const rel = posixRel(destRootAbs, abs);
    if (!written.has(rel)) rmSync(abs);
  }
}

async function main() {
  let cleanup = null;
  let source = resolveLocalSource();
  let origin;
  if (source) {
    origin = source;
  } else {
    console.log('sync-learn-content: no local JooKoi-developer-stack, fetching GitHub tarball');
    const fetched = await fetchGithubSource();
    source = fetched.dir;
    cleanup = fetched.cleanup;
    origin = githubTarball;
  }

  try {
    mkdirSync(destRoot, { recursive: true });
    const written = new Set();
    copyMarkdownTree(source, destRoot, destRoot, written);
    pruneStale(destRoot, destRoot, written);
    console.log(`sync-learn-content: copied ${written.size} files from ${origin}`);
  } finally {
    if (cleanup) cleanup();
  }

  const generate = spawnSync(
    process.execPath,
    [join(root, 'scripts', 'build-library-content.mjs')],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
  if (generate.status !== 0) process.exit(generate.status ?? 1);
}

await main();
