#!/usr/bin/env node
/**
 * Lab performance audit + committed baselines (decision 033).
 *
 * Runs the repo's own `lighthouse` (devDependency) against a static preview of
 * the production build, takes the median of UX_LAB_RUNS runs per URL, reads the
 * bundle sizes out of `dist/jookoi-frontpage/stats.json`, and can record or
 * compare against a per-commit baseline in `_architecture/perf-baselines/`.
 * It does not build or serve anything itself.
 *
 *   pnpm run build                      # writes dist + stats.json
 *   pnpm run serve:static-build         # separate terminal, :4321
 *   pnpm run ux:lab                     # audit, print, log to .local/ux-lab/
 *   pnpm run ux:lab -- --record         # also write _architecture/perf-baselines/<sha>.json
 *   pnpm run ux:lab -- --compare        # diff against the newest baseline
 *   pnpm run ux:lab -- --compare=<sha>  # diff against a specific baseline
 *   pnpm run ux:lab -- --strict         # exit 1 on a budget or regression breach (CI)
 *
 * Env: UX_LAB_BASE (default http://localhost:4321), UX_LAB_RUNS (default 3).
 * Limits live in `ux-lab.budgets.json`. Lab numbers are for comparing this repo
 * with itself: the preview server does no compression and Lighthouse throttles
 * to a mobile profile, so do not compare them with field data.
 */

import { spawnSync, execSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.UX_LAB_BASE ?? 'http://localhost:4321').replace(/\/$/, '');
const RUNS = Math.max(1, Number(process.env.UX_LAB_RUNS) || 3);
const COLLECTION = 'ai-tooling-crash-course-for-developers';
const HISTORY_DIR = join(root, '.local', 'ux-lab');
const BASELINE_DIR = join(root, '_architecture', 'perf-baselines');
const STATS_FILE = join(root, 'dist', 'jookoi-frontpage', 'stats.json');
const budgets = JSON.parse(readFileSync(join(root, 'scripts', 'ux-lab.budgets.json'), 'utf8'));

const args = process.argv.slice(2);
const RECORD = args.includes('--record');
const STRICT = args.includes('--strict');
const compareArg = args.find((a) => a === '--compare' || a.startsWith('--compare='));
const COMPARE = compareArg !== undefined;
const COMPARE_REF = compareArg?.split('=')[1];

const URLS = ['/', '/search', '/library', `/library/${COLLECTION}/README`];

const median = (values) => {
  const v = values.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
};

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function assertReachable() {
  try {
    const res = await fetch(BASE, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(
      `ux-lab: cannot reach ${BASE} (${err instanceof Error ? err.message : err}).\n` +
        'Run `pnpm run build`, then `pnpm run serve:static-build` in another terminal.',
    );
    process.exit(2);
  }
}

async function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    const { chromium } = await import('playwright');
    const path = chromium.executablePath();
    return existsSync(path) ? path : undefined;
  } catch {
    return undefined;
  }
}

function runLighthouseOnce(url, chrome) {
  const dir = mkdtempSync(join(tmpdir(), 'ux-lab-'));
  const outPath = join(dir, 'report.json');
  const cli = join(root, 'node_modules', 'lighthouse', 'cli', 'index.js');
  const result = spawnSync(
    process.execPath,
    [
      cli,
      url,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox',
      '--only-categories=performance',
      '--output=json',
      `--output-path=${outPath}`,
    ],
    { cwd: root, encoding: 'utf8', env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) } },
  );
  try {
    // On Windows chrome-launcher often fails to delete its temp profile
    // (EPERM) after the report is already written and exits non-zero. The
    // report file is the success signal, not the exit code.
    if (!existsSync(outPath)) {
      throw new Error((result.stderr || result.stdout || `exit ${result.status}`).slice(0, 400));
    }
    const report = JSON.parse(readFileSync(outPath, 'utf8'));
    const a = report.audits ?? {};
    return {
      score: report.categories?.performance?.score ?? null,
      lcp: a['largest-contentful-paint']?.numericValue ?? null,
      cls: a['cumulative-layout-shift']?.numericValue ?? null,
      tbt: a['total-blocking-time']?.numericValue ?? null,
      fcp: a['first-contentful-paint']?.numericValue ?? null,
      transferBytes: a['total-byte-weight']?.numericValue ?? null,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function auditUrl(path, chrome) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(runLighthouseOnce(`${BASE}${path}`, chrome));
  const pick = (k) => median(runs.map((r) => r[k]));
  return {
    path,
    runs: RUNS,
    score: pick('score'),
    lcp: pick('lcp'),
    cls: pick('cls'),
    tbt: pick('tbt'),
    fcp: pick('fcp'),
    transferBytes: pick('transferBytes'),
  };
}

/** Initial JS+CSS (raw bytes) and the biggest lazy chunk, from esbuild's metafile. */
function readBundle() {
  if (!existsSync(STATS_FILE)) return null;
  const outputs = JSON.parse(readFileSync(STATS_FILE, 'utf8')).outputs;
  const files = Object.entries(outputs).filter(([k]) => /\.(js|css)$/.test(k));
  const main = files.find(([k]) => /(^|\/)main-[^/]+\.js$/.test(k));
  if (!main) return null;
  const initial = new Set();
  const walk = (k) => {
    if (initial.has(k) || !outputs[k]) return;
    initial.add(k);
    for (const i of outputs[k].imports ?? []) if (i.kind === 'import-statement') walk(i.path);
  };
  walk(main[0]);
  const styles = files.filter(([k]) => /(^|\/)styles-[^/]+\.css$/.test(k)).map(([k]) => k);
  styles.forEach((k) => initial.add(k));
  const lazy = files.filter(([k]) => k.endsWith('.js') && !initial.has(k));
  return {
    initialRawBytes: [...initial].reduce((sum, k) => sum + outputs[k].bytes, 0),
    mainRawBytes: main[1].bytes,
    lazyChunks: lazy.length,
    largestLazyRawBytes: Math.max(0, ...lazy.map(([, v]) => v.bytes)),
  };
}

const fmt = (n, digits = 0) => (typeof n === 'number' ? n.toFixed(digits) : 'n/a');
const kb = (n) => (typeof n === 'number' ? `${(n / 1024).toFixed(0)} kB` : 'n/a');

function loadBaseline(ref) {
  if (!existsSync(BASELINE_DIR)) return null;
  const files = readdirSync(BASELINE_DIR).filter((f) => f.endsWith('.json'));
  const chosen = ref
    ? files.find((f) => f.startsWith(ref))
    : files
        .map((f) => ({ f, ts: JSON.parse(readFileSync(join(BASELINE_DIR, f), 'utf8')).ts }))
        .sort((a, b) => (a.ts < b.ts ? 1 : -1))[0]?.f;
  return chosen ? JSON.parse(readFileSync(join(BASELINE_DIR, chosen), 'utf8')) : null;
}

/** Absolute limits are targets (reported, never fail the run); regressions against the baseline fail `--strict`. */
function evaluate(run, baseline) {
  const breaches = [];
  const targets = [];
  const abs = budgets.absolute;
  for (const r of run.pages) {
    if (r.cls > abs.cls) targets.push(`${r.path}: CLS ${fmt(r.cls, 3)} > ${abs.cls}`);
    if (r.tbt > abs.tbtMs) targets.push(`${r.path}: TBT ${fmt(r.tbt)}ms > ${abs.tbtMs}ms`);
    if (r.lcp > abs.lcpMs) targets.push(`${r.path}: LCP ${fmt(r.lcp)}ms > ${abs.lcpMs}ms`);
  }
  if (baseline) {
    const tol = budgets.regression;
    for (const r of run.pages) {
      const b = baseline.pages.find((p) => p.path === r.path);
      if (!b) continue;
      if (r.lcp > b.lcp * (1 + tol.lcpPct / 100))
        breaches.push(`${r.path}: LCP ${fmt(b.lcp)} -> ${fmt(r.lcp)}ms (> +${tol.lcpPct}%)`);
      if (r.tbt > b.tbt + tol.tbtMs)
        breaches.push(`${r.path}: TBT ${fmt(b.tbt)} -> ${fmt(r.tbt)}ms (> +${tol.tbtMs}ms)`);
      if (r.cls > b.cls + tol.cls)
        breaches.push(`${r.path}: CLS ${fmt(b.cls, 3)} -> ${fmt(r.cls, 3)} (> +${tol.cls})`);
    }
    if (run.bundle && baseline.bundle) {
      const grow = run.bundle.initialRawBytes / baseline.bundle.initialRawBytes - 1;
      if (grow * 100 > tol.initialBundlePct)
        breaches.push(
          `initial bundle ${kb(baseline.bundle.initialRawBytes)} -> ${kb(run.bundle.initialRawBytes)} (> +${tol.initialBundlePct}%)`,
        );
    }
  }
  return { breaches, targets };
}

function printTable(run, baseline) {
  console.log('\npath'.padEnd(46) + 'score  LCP ms  FCP ms  TBT ms  CLS    transfer');
  for (const r of run.pages) {
    const b = baseline?.pages.find((p) => p.path === r.path);
    const d = (key, digits = 0) =>
      b && typeof b[key] === 'number' && typeof r[key] === 'number'
        ? ` (${r[key] - b[key] >= 0 ? '+' : ''}${(r[key] - b[key]).toFixed(digits)})`
        : '';
    console.log(
      `${r.path.padEnd(45)} ${fmt(r.score, 2)}   ${fmt(r.lcp)}${d('lcp')}  ${fmt(r.fcp)}  ${fmt(r.tbt)}${d('tbt')}  ${fmt(r.cls, 3)}${d('cls', 3)}  ${kb(r.transferBytes)}`,
    );
  }
  if (run.bundle) {
    const b = baseline?.bundle;
    const delta = b ? ` (was ${kb(b.initialRawBytes)})` : '';
    console.log(
      `\nbundle: initial ${kb(run.bundle.initialRawBytes)}${delta}, main ${kb(run.bundle.mainRawBytes)}, ` +
        `${run.bundle.lazyChunks} lazy chunks, largest ${kb(run.bundle.largestLazyRawBytes)}`,
    );
  } else {
    console.log('\nbundle: no dist/jookoi-frontpage/stats.json (run `pnpm run build`)');
  }
}

await assertReachable();
const chrome = await chromePath();
const sha = git('rev-parse --short HEAD') || 'nogit';
const dirty = git('status --porcelain') !== '';
console.log(`ux-lab: ${BASE}, ${RUNS} run(s) per URL, commit ${sha}${dirty ? ' (dirty)' : ''}`);

const pages = [];
for (const path of URLS) {
  process.stdout.write(`  ${path} ... `);
  try {
    const row = auditUrl(path, chrome);
    pages.push(row);
    console.log(`score ${fmt(row.score, 2)}`);
  } catch (err) {
    console.error(`FAIL ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

const run = {
  ts: new Date().toISOString(),
  commit: sha,
  dirty,
  angular: JSON.parse(readFileSync(join(root, 'node_modules', '@angular', 'core', 'package.json'), 'utf8')).version,
  lighthouse: JSON.parse(readFileSync(join(root, 'node_modules', 'lighthouse', 'package.json'), 'utf8')).version,
  runsPerUrl: RUNS,
  pages,
  bundle: readBundle(),
};

const baseline = COMPARE || STRICT ? loadBaseline(COMPARE_REF) : null;
if ((COMPARE || STRICT) && !baseline) console.log('\nux-lab: no baseline found, comparing against absolute limits only');
printTable(run, baseline);
if (baseline) console.log(`compared with baseline ${baseline.commit}${baseline.dirty ? ' (dirty)' : ''} from ${baseline.ts}`);

mkdirSync(HISTORY_DIR, { recursive: true });
appendFileSync(join(HISTORY_DIR, 'history.jsonl'), `${JSON.stringify(run)}\n`, 'utf8');

if (RECORD) {
  mkdirSync(BASELINE_DIR, { recursive: true });
  const file = join(BASELINE_DIR, `${sha}${dirty ? '-dirty' : ''}.json`);
  writeFileSync(file, `${JSON.stringify(run, null, 2)}\n`, 'utf8');
  console.log(`\nux-lab: recorded ${file}`);
}

const { breaches, targets } = evaluate(run, baseline);
if (targets.length > 0) {
  console.log(`\nabove target (${targets.length}), not a failure:`);
  for (const t of targets) console.log(`  - ${t}`);
}
if (breaches.length > 0) {
  console.log(`\n${STRICT ? 'FAIL' : 'warn'}: ${breaches.length} regression(s) against the baseline`);
  for (const b of breaches) console.log(`  - ${b}`);
  if (STRICT) process.exit(1);
} else {
  console.log('\nux-lab: no regression against the baseline');
}
