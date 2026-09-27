#!/usr/bin/env node
// Checks every link in sources/*.json and writes data/link-status.json.
// Run by hand (`pnpm run sources:verify`), monthly or after adding a batch.
// Never scheduled, never in CI: a site being down must not fail a build.
// Plan: _architecture/plans/2026-09-27-source-link-verification.md.
//
// Per record: `url`, `searchUrl` (with a probe term), each `feeds[].url`,
// `sourceUrl`. Always GET, never HEAD: many servers answer HEAD with 403/405
// while GET works. Bodies are cancelled after the headers except for feeds,
// where the first bytes are read to check it is XML or JSON.
//
// Politeness: one request at a time per host, CONCURRENCY hosts in parallel,
// honest User-Agent, one retry on network error only.
//
// Output keeps `lastOk` per target across runs, so a site that times out
// today reads as "unreachable since <date>", not as dead.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'sources');
const outFile = join(root, 'data', 'link-status.json');

const CONCURRENCY = 6;
const TIMEOUT_MS = 10_000;
const PROBE_TERM = 'test';
const USER_AGENT =
  'Mozilla/5.0 (compatible; JooKoi-link-check/1.0; +https://github.com/equilerex/JooKoi-frontpage-to-the-open-web)';

const sources = readdirSync(sourcesDir)
  .filter((f) => f.endsWith('.json') && f !== 'source.schema.json')
  .sort()
  .flatMap((f) =>
    JSON.parse(readFileSync(join(sourcesDir, f), 'utf8')).sources.map((s) => ({ ...s, file: f })),
  );

const previous = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : { results: {} };
const today = new Date().toISOString().slice(0, 10);

const norm = (u) =>
  u
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/+$/, '')
    .toLowerCase();

function classify(res, err, requested, kind) {
  if (err) {
    const code = err.cause?.code ?? err.name;
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return { class: 'dead', detail: code };
    return { class: 'error', detail: code === 'TimeoutError' ? 'timeout' : String(code) };
  }
  const s = res.status;
  const cf = res.headers.has('cf-ray') || /cloudflare/i.test(res.headers.get('server') ?? '');
  if (s === 401 || s === 403 || s === 429 || (s === 503 && cf))
    return { class: 'blocked', detail: String(s) };
  if (s === 404 || s === 410) return { class: 'dead', detail: String(s) };
  if (s >= 500) return { class: 'error', detail: String(s) };
  if (s < 200 || s >= 300) return { class: 'error', detail: String(s) };
  if (kind === 'searchUrl') {
    return res.url.includes(PROBE_TERM)
      ? { class: 'ok' }
      : { class: 'lost-query', detail: 'search redirected without the query' };
  }
  if (kind !== 'searchUrl' && norm(res.url) !== norm(requested)) return { class: 'redirected' };
  return { class: 'ok' };
}

async function check(url, kind) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: {
          'user-agent': USER_AGENT,
          accept:
            kind === 'feed'
              ? 'application/rss+xml, application/atom+xml, application/json, */*'
              : 'text/html,*/*',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      let result = classify(res, null, url, kind);
      if (kind === 'feed' && result.class === 'ok') {
        const head = (await res.text()).slice(0, 512).trimStart();
        if (!head.startsWith('<') && !head.startsWith('{'))
          result = { class: 'error', detail: 'not a feed' };
      } else {
        await res.body?.cancel().catch(() => {});
      }
      return { status: res.status, finalUrl: res.url, ...result };
    } catch (err) {
      lastErr = err;
      if (err.name === 'TimeoutError') break;
    }
  }
  return { status: null, finalUrl: null, ...classify(null, lastErr, url, kind) };
}

// Build the target list, grouped by host so each host is hit serially.
const targets = [];
for (const s of sources) {
  targets.push({ id: s.id, key: 'url', url: s.url, kind: 'url' });
  if (s.searchUrl)
    targets.push({
      id: s.id,
      key: 'searchUrl',
      url: s.searchUrl.replace('{q}', encodeURIComponent(PROBE_TERM)),
      kind: 'searchUrl',
    });
  (s.feeds ?? []).forEach((f, i) =>
    targets.push({ id: s.id, key: `feeds.${i}`, url: f.url, kind: 'feed' }),
  );
  if (s.sourceUrl) targets.push({ id: s.id, key: 'sourceUrl', url: s.sourceUrl, kind: 'url' });
}
const byHost = new Map();
for (const t of targets) {
  const host = new URL(t.url).host;
  if (!byHost.has(host)) byHost.set(host, []);
  byHost.get(host).push(t);
}

const started = Date.now();
const queue = [...byHost.values()];
let done = 0;
async function worker() {
  for (let group = queue.shift(); group; group = queue.shift()) {
    for (const t of group) {
      t.result = await check(t.url, t.kind);
      done++;
      if (done % 50 === 0) process.stderr.write(`  ${done}/${targets.length}\n`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const results = {};
for (const t of targets) {
  const prev = previous.results?.[t.id]?.[t.key];
  const r = t.result;
  const entry = { class: r.class, status: r.status };
  if (r.detail) entry.detail = r.detail;
  if (r.finalUrl && norm(r.finalUrl) !== norm(t.url)) entry.finalUrl = r.finalUrl;
  entry.lastOk = r.class === 'ok' || r.class === 'redirected' ? today : (prev?.lastOk ?? null);
  (results[t.id] ??= {})[t.key] = entry;
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    { checkedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), results },
    null,
    2,
  ) + '\n',
);

// Report: counts per class, then everything that needs the author's attention.
const counts = {};
for (const t of targets) counts[t.result.class] = (counts[t.result.class] ?? 0) + 1;
const seconds = Math.round((Date.now() - started) / 1000);
console.log(`verify-sources: ${targets.length} links, ${sources.length} records, ${seconds}s`);
console.log(
  '  ' +
    Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(', '),
);
const severity = { dead: 0, 'lost-query': 1, error: 2, redirected: 3, blocked: 4 };
const fileOf = new Map(sources.map((s) => [s.id, s.file]));
const attention = targets
  .filter((t) => t.result.class !== 'ok')
  .sort((a, b) => severity[a.result.class] - severity[b.result.class]);
for (const t of attention) {
  const r = t.result;
  const to = r.class === 'redirected' ? ` -> ${r.finalUrl}` : '';
  console.log(
    `  ${r.class.padEnd(10)} ${fileOf.get(t.id)} ${t.id} ${t.key} ${r.detail ?? r.status ?? ''} ${t.url}${to}`,
  );
}
