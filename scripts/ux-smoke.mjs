#!/usr/bin/env node
/**
 * App-wide local UX smoke (AGENTS.md Iteration loop — UI / layout / route change).
 * Against the already-running dev server. Does NOT start a second server.
 *
 *   pnpm start
 *   pnpm run ux:smoke
 *
 * Env:
 *   UX_SMOKE_BASE          default http://localhost:4200
 *   UX_SMOKE_CLS_MAX       override budgets.clsMax
 *   UX_SMOKE_LONG_TASK_MAX override budgets.longTaskMsMax
 *   UX_SMOKE_SKIP_HISTORY  set to 1 to skip JSONL / regression compare
 *
 * Ship a new page → add a scenario in SCENARIOS below.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.UX_SMOKE_BASE ?? 'http://localhost:4200').replace(/\/$/, '');
const HISTORY_DIR = join(root, '.local', 'ux-smoke');
const HISTORY_FILE = join(HISTORY_DIR, 'history.jsonl');
const BUDGETS_FILE = join(root, 'scripts', 'ux-smoke.budgets.json');

const COLLECTION = 'ai-tooling-crash-course-for-developers';
const FORBIDDEN = ['Loading document'];

const budgets = {
  ...JSON.parse(readFileSync(BUDGETS_FILE, 'utf8')),
  ...(process.env.UX_SMOKE_CLS_MAX ? { clsMax: Number(process.env.UX_SMOKE_CLS_MAX) } : {}),
  ...(process.env.UX_SMOKE_LONG_TASK_MAX
    ? { longTaskMsMax: Number(process.env.UX_SMOKE_LONG_TASK_MAX) }
    : {}),
};

const failures = [];
const scenarioMetrics = [];

function fail(scenario, message) {
  failures.push({ scenario, message });
  console.error(`FAIL  [${scenario}] ${message}`);
}

function ok(scenario, message) {
  console.log(`ok    [${scenario}] ${message}`);
}

function gitHead() {
  const out = spawnSync('git rev-parse --short HEAD', {
    cwd: root,
    shell: true,
    encoding: 'utf8',
  });
  return out.status === 0 ? out.stdout.trim() : 'unknown';
}

async function assertReachable() {
  let res;
  try {
    res = await fetch(BASE, { redirect: 'follow' });
  } catch (err) {
    console.error(
      `ux-smoke: cannot reach ${BASE} (${err instanceof Error ? err.message : err}).\n` +
        `Start the existing dev server with \`pnpm start\` — do not boot a second one.`,
    );
    process.exit(2);
  }
  if (!res.ok) {
    console.error(`ux-smoke: ${BASE} returned HTTP ${res.status}`);
    process.exit(2);
  }
}

function installProbes(page) {
  return page.addInitScript(() => {
    window.__uxSmoke = { cls: 0, longTaskMs: 0, shifts: [] };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__uxSmoke.cls += entry.value;
          window.__uxSmoke.shifts.push({ value: entry.value, time: entry.startTime });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      /* older engines */
    }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__uxSmoke.longTaskMs += entry.duration;
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {
      /* longtask not everywhere */
    }
  });
}

async function resetProbes(page) {
  await page.evaluate(() => {
    if (!window.__uxSmoke) window.__uxSmoke = { cls: 0, longTaskMs: 0, shifts: [] };
    window.__uxSmoke.cls = 0;
    window.__uxSmoke.longTaskMs = 0;
    window.__uxSmoke.shifts = [];
  });
}

async function readProbes(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(
      performance.getEntriesByType('paint').map((p) => [p.name, p.startTime]),
    );
    let lcp = null;
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length) lcp = lcpEntries[lcpEntries.length - 1].startTime;
    } catch {
      /* ignore */
    }
    return {
      cls: window.__uxSmoke?.cls ?? 0,
      longTaskMs: window.__uxSmoke?.longTaskMs ?? 0,
      fcp: paints['first-contentful-paint'] ?? null,
      lcp,
      ttfb: nav ? nav.responseStart : null,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
    };
  });
}

async function sampleBody(page, { samples = 10, intervalMs = 40 } = {}) {
  return page.evaluate(
    async ({ samples: n, intervalMs: ms, forbidden }) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const text = document.body?.innerText ?? '';
        const main = document.querySelector('#main-content');
        out.push({
          t: i * ms,
          textLen: text.length,
          forbidden: forbidden.filter((f) => text.includes(f)),
          h1: document.querySelector('joo-prose-content h1, main h1')?.textContent ?? null,
          hasMain: !!document.querySelector('main'),
          wide: main?.classList.contains('page--wide') ?? false,
          motion: main?.classList.contains('page--motion') ?? false,
          libraryPaneVt: document.querySelector('.library-body')
            ? getComputedStyle(document.querySelector('.library-body')).viewTransitionName
            : null,
          shellTransition: main ? getComputedStyle(main).transitionDuration : null,
        });
        await new Promise((r) => setTimeout(r, ms));
      }
      return out;
    },
    { samples, intervalMs, forbidden: FORBIDDEN },
  );
}

function checkSamples(scenario, samples, opts = {}) {
  const { requireH1 = false, requireMain = false } = opts;
  const forbiddenHits = samples.flatMap((s) => s.forbidden);
  if (forbiddenHits.length > 0) {
    fail(scenario, `forbidden copy appeared: ${[...new Set(forbiddenHits)].join(', ')}`);
  } else {
    ok(scenario, 'no forbidden loading copy');
  }
  if (requireMain) {
    if (samples.some((s) => !s.hasMain)) fail(scenario, 'main landmark missing in samples');
    else ok(scenario, 'main present');
  }
  if (requireH1) {
    const missing = samples.filter((s) => !s.h1);
    if (missing.length > 0)
      fail(scenario, `H1 missing in ${missing.length}/${samples.length} samples`);
    else ok(scenario, `H1 stable (${samples[0]?.h1 ?? ''})`);
  }
}

async function finishScenario(scenario, page, samples, extra = {}) {
  await page.waitForTimeout(200);
  const probes = await readProbes(page);
  const metrics = { scenario, ...probes, ok: true, ...extra };

  if (probes.cls > budgets.clsMax) {
    fail(scenario, `CLS ${probes.cls.toFixed(4)} > ${budgets.clsMax}`);
    metrics.ok = false;
  } else {
    ok(scenario, `CLS ${probes.cls.toFixed(4)} ≤ ${budgets.clsMax}`);
  }

  if (probes.longTaskMs > budgets.longTaskMsMax) {
    fail(scenario, `long tasks ${probes.longTaskMs.toFixed(0)}ms > ${budgets.longTaskMsMax}ms`);
    metrics.ok = false;
  } else {
    ok(scenario, `long tasks ${probes.longTaskMs.toFixed(0)}ms ≤ ${budgets.longTaskMsMax}ms`);
  }

  if (probes.fcp != null && probes.fcp > budgets.fcpMsMax) {
    fail(scenario, `FCP ${probes.fcp.toFixed(0)}ms > ${budgets.fcpMsMax}ms`);
    metrics.ok = false;
  } else if (probes.fcp != null) {
    ok(scenario, `FCP ${probes.fcp.toFixed(0)}ms`);
  }

  if (probes.lcp != null && probes.lcp > budgets.lcpMsMax) {
    fail(scenario, `LCP ${probes.lcp.toFixed(0)}ms > ${budgets.lcpMsMax}ms`);
    metrics.ok = false;
  } else if (probes.lcp != null) {
    ok(scenario, `LCP ${probes.lcp.toFixed(0)}ms`);
  }

  scenarioMetrics.push(metrics);
  return { probes, samples };
}

async function checkMotionLibrary(scenario, page) {
  const motion = await page.evaluate(() => {
    const body = document.querySelector('.library-body');
    const tree = document.querySelector('.library-tree');
    return {
      bodyVt: body ? getComputedStyle(body).viewTransitionName : null,
      treeVt: tree ? getComputedStyle(tree).viewTransitionName : null,
      supportsVt: typeof document.startViewTransition === 'function',
    };
  });
  if (!motion.supportsVt) {
    ok(scenario, 'motion soft-skip (View Transitions API absent)');
    return;
  }
  ok(scenario, 'library uses CSS reader motion; shell VT is app-main');
}

async function checkShellWide(scenario, page) {
  const state = await page.evaluate(() => {
    const main = document.querySelector('#main-content');
    return {
      wide: main?.classList.contains('page--wide') ?? false,
      motion: main?.classList.contains('page--motion') ?? false,
      transition: main ? getComputedStyle(main).transitionProperty : null,
    };
  });
  if (!state.wide) fail(scenario, 'page--wide missing');
  else ok(scenario, 'page--wide present');
  if (state.motion && state.transition && !state.transition.includes('max-width')) {
    fail(scenario, `page--motion without max-width transition (${state.transition})`);
  } else if (state.motion) {
    ok(scenario, 'page--motion max-width transition armed');
  }
}

function readLastHistory() {
  if (!existsSync(HISTORY_FILE)) return null;
  const lines = readFileSync(HISTORY_FILE, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

function compareRegression(prev, current) {
  if (!prev?.scenarios || process.env.UX_SMOKE_SKIP_HISTORY === '1') return;
  const ratio = budgets.regressionRatio ?? 1.5;
  for (const cur of current.scenarios) {
    const old = prev.scenarios.find((s) => s.scenario === cur.scenario);
    if (!old) continue;
    for (const key of ['cls', 'lcp', 'longTaskMs']) {
      const a = old[key];
      const b = cur[key];
      if (a == null || b == null || a <= 0) continue;
      const cap =
        key === 'cls' ? budgets.clsMax : key === 'lcp' ? budgets.lcpMsMax : budgets.longTaskMsMax;
      if (b <= cap && b > a * ratio && a > cap * 0.25) {
        fail(
          cur.scenario,
          `regression ${key}: ${a.toFixed?.(2) ?? a} → ${b.toFixed?.(2) ?? b} (> ${ratio}x prior while under absolute cap)`,
        );
      }
    }
  }
}

function writeHistory(run) {
  if (process.env.UX_SMOKE_SKIP_HISTORY === '1') return;
  mkdirSync(HISTORY_DIR, { recursive: true });
  appendFileSync(HISTORY_FILE, `${JSON.stringify(run)}\n`, 'utf8');
  writeFileSync(join(HISTORY_DIR, 'last.json'), `${JSON.stringify(run, null, 2)}\n`, 'utf8');
  ok('history', `appended ${HISTORY_FILE}`);
}

/** @type {readonly { id: string, run: (ctx: { page: import('playwright').Page }) => Promise<void> }[]} */
const SCENARIOS = [
  {
    id: 'cold-home',
    run: async ({ page }) => {
      await resetProbes(page);
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      const samples = await sampleBody(page, { samples: 8 });
      checkSamples('cold-home', samples, { requireMain: true });
      const hasHero = await page.locator('joo-logotype, .home-lede').count();
      if (hasHero === 0) fail('cold-home', 'home hero missing');
      else ok('cold-home', 'home hero present');
      await finishScenario('cold-home', page, samples);
    },
  },
  {
    id: 'cold-search',
    run: async ({ page }) => {
      await resetProbes(page);
      await page.goto(`${BASE}/search`, { waitUntil: 'domcontentloaded' });
      const samples = await sampleBody(page, { samples: 8 });
      checkSamples('cold-search', samples, { requireMain: true, requireH1: true });
      await finishScenario('cold-search', page, samples);
    },
  },
  {
    id: 'cold-not-found',
    run: async ({ page }) => {
      await resetProbes(page);
      await page.goto(`${BASE}/this-route-does-not-exist`, { waitUntil: 'domcontentloaded' });
      const samples = await sampleBody(page, { samples: 6 });
      checkSamples('cold-not-found', samples, { requireH1: true });
      const text = await page.locator('h1').first().textContent();
      if (!text?.includes('not found') && !text?.includes('Not found')) {
        fail('cold-not-found', `unexpected H1: ${text}`);
      } else {
        ok('cold-not-found', 'not-found H1');
      }
      await finishScenario('cold-not-found', page, samples);
    },
  },
  {
    id: 'cold-library',
    run: async ({ page }) => {
      await resetProbes(page);
      await page.goto(`${BASE}/library`, { waitUntil: 'domcontentloaded' });
      await checkShellWide('cold-library', page);
      await checkMotionLibrary('cold-library', page);
      const samples = await sampleBody(page, { samples: 8 });
      checkSamples('cold-library', samples, { requireMain: true });
      const tree = await page.locator('joo-topic-tree, [role="tree"]').count();
      if (tree === 0) fail('cold-library', 'library tree missing');
      else ok('cold-library', 'library tree present');
      await finishScenario('cold-library', page, samples);
    },
  },
  {
    id: 'cold-library-doc',
    run: async ({ page }) => {
      await resetProbes(page);
      await page.goto(`${BASE}/library/${COLLECTION}/README`, { waitUntil: 'domcontentloaded' });
      await checkMotionLibrary('cold-library-doc', page);
      const layered = await page.evaluate(() => ({
        reading: !!document.querySelector('.library-body.is-reading'),
        underlay: !!document.querySelector('joo-library-browse-underlay'),
        reader: !!document.querySelector('.library-reader-layer.is-active'),
        tree: !!document.querySelector('joo-topic-tree'),
      }));
      if (!layered.reading || !layered.underlay || !layered.reader) {
        fail(
          'cold-library-doc',
          `expected layered reader (reading=${layered.reading} underlay=${layered.underlay} reader=${layered.reader})`,
        );
      } else {
        ok('cold-library-doc', 'browse underlay + reader layer');
      }
      if (!layered.tree) fail('cold-library-doc', 'tree missing while reading');
      else ok('cold-library-doc', 'tree still present');
      const samples = await sampleBody(page, { samples: 12, intervalMs: 40 });
      checkSamples('cold-library-doc', samples, { requireH1: true });
      await finishScenario('cold-library-doc', page, samples);
    },
  },
  {
    id: 'drill-in-filter-survives',
    run: async ({ page }) => {
      await page.goto(`${BASE}/library`, { waitUntil: 'domcontentloaded' });
      const filterSel = '.library-tree-filter input.console__input';
      await page.locator(filterSel).waitFor({ state: 'visible', timeout: 10000 });
      await page.locator(filterSel).click();
      await page.locator(filterSel).pressSequentially('prompt', { delay: 15 });
      await page.waitForTimeout(300);
      const before = await page.locator(filterSel).inputValue();
      if (before !== 'prompt') {
        fail('drill-in-filter-survives', `could not type filter (got "${before}")`);
        scenarioMetrics.push({ scenario: 'drill-in-filter-survives', ok: false });
        return;
      }
      await page.locator('.library-tiles joo-keycap button, .library-tiles button').first().click();
      await page.waitForSelector('.library-body.is-reading', { timeout: 15000 });
      await page.waitForTimeout(300);
      const value = await page.locator(filterSel).inputValue();
      if (value !== 'prompt') {
        fail('drill-in-filter-survives', `filter reset to "${value}" after drill-in`);
      } else {
        ok('drill-in-filter-survives', 'tree filter kept after drill-in');
      }
      if ((await page.locator('joo-library-browse-underlay').count()) === 0) {
        fail('drill-in-filter-survives', 'underlay missing');
      } else {
        ok('drill-in-filter-survives', 'underlay present');
      }
      scenarioMetrics.push({
        scenario: 'drill-in-filter-survives',
        ok: !failures.some((f) => f.scenario === 'drill-in-filter-survives'),
      });
    },
  },
  {
    id: 'home-to-library',
    run: async ({ page }) => {
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(100);
      await resetProbes(page);
      await page.locator('a[href="/library"]').first().click();
      await page.waitForURL(/\/library\/?(\?|$)/);
      const samples = await sampleBody(page, { samples: 10 });
      checkSamples('home-to-library', samples);
      await checkShellWide('home-to-library', page);
      await finishScenario('home-to-library', page, samples);
    },
  },
  {
    id: 'tile-to-readme',
    run: async ({ page }) => {
      await page.goto(`${BASE}/library`, { waitUntil: 'domcontentloaded' });
      await resetProbes(page);
      await page.locator('.library-tiles joo-keycap button, .library-tiles button').first().click();
      await page.waitForSelector('.library-body.is-reading', { timeout: 15000 });
      const samples = await sampleBody(page, { samples: 12, intervalMs: 40 });
      checkSamples('tile-to-readme', samples, { requireH1: true });
      await checkMotionLibrary('tile-to-readme', page);
      await finishScenario('tile-to-readme', page, samples);
    },
  },
  {
    id: 'doc-to-doc',
    run: async ({ page }) => {
      await page.goto(`${BASE}/library/${COLLECTION}/README`, { waitUntil: 'networkidle' });
      const next = page.locator('a[href*="/library/"][href*="topics/"]').first();
      if ((await next.count()) === 0) {
        ok('doc-to-doc', 'skip — no in-doc topic link');
        scenarioMetrics.push({ scenario: 'doc-to-doc', skipped: true, ok: true });
        return;
      }
      await resetProbes(page);
      await next.click();
      await page.waitForURL(/\/library\/.+/);
      const samples = await sampleBody(page, { samples: 12, intervalMs: 40 });
      checkSamples('doc-to-doc', samples, { requireH1: true });
      await finishScenario('doc-to-doc', page, samples);
    },
  },
];

async function main() {
  await assertReachable();
  console.log(`ux-smoke: base ${BASE}`);
  console.log(
    `ux-smoke: budgets cls≤${budgets.clsMax} longTask≤${budgets.longTaskMsMax}ms fcp≤${budgets.fcpMsMax}ms lcp≤${budgets.lcpMsMax}ms`,
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await installProbes(page);

  for (const scenario of SCENARIOS) {
    console.log(`\n-- ${scenario.id}`);
    try {
      await scenario.run({ page });
    } catch (err) {
      fail(scenario.id, err instanceof Error ? err.message : String(err));
      scenarioMetrics.push({ scenario: scenario.id, ok: false, error: String(err) });
    }
  }

  await browser.close();

  const run = {
    ts: new Date().toISOString(),
    gitHead: gitHead(),
    baseUrl: BASE,
    budgets: {
      clsMax: budgets.clsMax,
      longTaskMsMax: budgets.longTaskMsMax,
      fcpMsMax: budgets.fcpMsMax,
      lcpMsMax: budgets.lcpMsMax,
    },
    scenarios: scenarioMetrics,
    failed: failures.length,
  };

  const prev = readLastHistory();
  compareRegression(prev, run);
  writeHistory(run);

  if (failures.length > 0) {
    console.error(`\nux-smoke: ${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log('\nux-smoke: all scenarios passed');
}

await main();
