// Builds the curated-websites dataset from the human-authored JSON under
// sources/ into committed, generated TypeScript:
//
//   - src/app/shared/curated-websites/sources.generated.ts
//       ALL_SOURCES, every record. Imported only by the /search route chunk.
//   - src/app/shared/curated-websites/source-stats.generated.ts
//       counts, top tags and the home highlight set. Imported by the shell and
//       home, so neither loads the full dataset.
//
// Files are read in file-name order and records in file order. That order is
// the dataset order, and relevance sort falls back to it on ties, so the
// numeric file prefixes (01-, 02-, ...) are meaningful.
//
// Validation fails the build and names file and record. Plan:
// _architecture/plans/2026-09-27-sources-data-pipeline.md.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'sources');
const outDir = join(root, 'src', 'app', 'shared', 'curated-websites');

/** Home's trusted-highlights panel and tag panel sizes. The script owns them
 *  so the generated stats and the page cannot disagree. */
const HIGHLIGHT_COUNT = 8;
const TAG_PANEL_COUNT = 8;

const CAPABILITIES = new Set(['rss-feed', 'site-search', 'public-api']);
const FEED_FORMATS = new Set(['rss', 'atom', 'json']);
const REQUIRED = [
  'id',
  'name',
  'url',
  'desc',
  'type',
  'category',
  'tags',
  'trustScore',
  'capabilities',
  'verified',
];
const KNOWN = new Set([...REQUIRED, 'feeds', 'searchUrl', 'sourceUrl', 'lang', 'region']);

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function validate(s, where) {
  for (const k of REQUIRED) if (s[k] === undefined) fail(where, `missing "${k}"`);
  for (const k of Object.keys(s)) if (!KNOWN.has(k)) fail(where, `unknown field "${k}"`);
  if (typeof s.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id))
    fail(where, `id must be a lowercase slug`);
  for (const k of ['name', 'desc', 'type', 'category'])
    if (typeof s[k] !== 'string' || !s[k].trim()) fail(where, `"${k}" must be a non-empty string`);
  if (!isHttpUrl(s.url)) fail(where, `url is not an http(s) URL`);
  if (s.sourceUrl !== undefined && s.sourceUrl !== '' && !isHttpUrl(s.sourceUrl))
    fail(where, `sourceUrl is not an http(s) URL`);
  if (s.searchUrl !== undefined) {
    if (!s.searchUrl.includes('{q}')) fail(where, `searchUrl has no {q}`);
    else if (!isHttpUrl(s.searchUrl.replace('{q}', 'q')))
      fail(where, `searchUrl is not an http(s) URL`);
  }
  if (!Array.isArray(s.tags) || s.tags.some((t) => typeof t !== 'string' || !t))
    fail(where, `tags must be non-empty strings`);
  if (!Number.isInteger(s.trustScore) || s.trustScore < 0 || s.trustScore > 100)
    fail(where, `trustScore must be an integer 0-100`);
  if (!Array.isArray(s.capabilities) || s.capabilities.some((c) => !CAPABILITIES.has(c)))
    fail(where, `capabilities must be from ${[...CAPABILITIES].join(', ')}`);
  if (
    typeof s.verified !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(s.verified) ||
    Number.isNaN(Date.parse(s.verified))
  )
    fail(where, `verified must be YYYY-MM-DD`);
  if (s.feeds !== undefined) {
    if (!Array.isArray(s.feeds)) fail(where, `feeds must be an array`);
    else
      s.feeds.forEach((f, i) => {
        if (!isHttpUrl(f.url)) fail(where, `feeds[${i}].url is not an http(s) URL`);
        if (typeof f.name !== 'string' || !f.name) fail(where, `feeds[${i}].name missing`);
        if (f.format !== undefined && !FEED_FORMATS.has(f.format))
          fail(where, `feeds[${i}].format must be rss, atom or json`);
      });
  }
}

const files = readdirSync(sourcesDir)
  .filter((f) => f.endsWith('.json') && f !== 'source.schema.json')
  .sort();
const sources = [];
const seen = new Map();
const seenUrl = new Map();
for (const file of files) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(join(sourcesDir, file), 'utf8'));
  } catch (e) {
    fail(file, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!Array.isArray(doc.sources)) {
    fail(file, `expected { "sources": [...] }`);
    continue;
  }
  doc.sources.forEach((s, i) => {
    const where = `${file} [${i}] ${s?.id ?? '(no id)'}`;
    validate(s, where);
    if (seen.has(s.id)) fail(where, `duplicate id, first defined in ${seen.get(s.id)}`);
    else seen.set(s.id, file);
    const urlKey =
      typeof s.url === 'string'
        ? s.url
            .replace(/^https?:\/\/(www\.)?/, '')
            .replace(/\/$/, '')
            .toLowerCase()
        : '';
    if (urlKey && seenUrl.has(urlKey)) fail(where, `same site as ${seenUrl.get(urlKey)}`);
    else if (urlKey) seenUrl.set(urlKey, `${file} ${s.id}`);
    sources.push(s);
  });
}

if (errors.length) {
  console.error(`build-sources: ${errors.length} problem(s) in sources/:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const countBy = (keyOf) => {
  const counts = {};
  for (const s of sources) for (const k of keyOf(s)) counts[k] = (counts[k] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
};
const categoryCounts = countBy((s) => [s.category]);
const tagCounts = countBy((s) => s.tags);
const topTags = Object.entries(tagCounts)
  .sort(([la, ca], [lb, cb]) => cb - ca || la.localeCompare(lb))
  .slice(0, TAG_PANEL_COUNT)
  .map(([label, count]) => ({ label, count }));
// Same order as sortByTrust in source-search.ts.
const highlights = [...sources]
  .sort((a, b) => b.trustScore - a.trustScore || a.name.localeCompare(b.name))
  .slice(0, HIGHLIGHT_COUNT);

const header = `// GENERATED by scripts/build-sources.mjs from sources/*.json. Do not edit.\n// Regenerate with \`pnpm run sources\`.\n`;
const json = (v) => JSON.stringify(v, null, 2);

function writeIfChanged(file, content) {
  const path = join(outDir, file);
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false;
  writeFileSync(path, content);
  return true;
}

const changed = [
  writeIfChanged(
    'sources.generated.ts',
    `${header}import type { Source } from './source.model';\n\nexport const ALL_SOURCES: readonly Source[] = ${json(sources)};\n`,
  ) && 'sources.generated.ts',
  writeIfChanged(
    'source-stats.generated.ts',
    `${header}import type { Source } from './source.model';\n\n` +
      `export const SOURCE_COUNT = ${sources.length};\n\n` +
      `export const HIGHLIGHT_COUNT = ${HIGHLIGHT_COUNT};\n\n` +
      `export const CATEGORY_COUNTS: Readonly<Record<string, number>> = ${json(categoryCounts)};\n\n` +
      `export const TAG_COUNTS: Readonly<Record<string, number>> = ${json(tagCounts)};\n\n` +
      `/** Most-used tags first, ties alphabetical, top ${TAG_PANEL_COUNT}. */\n` +
      `export const TOP_TAGS: readonly { readonly label: string; readonly count: number }[] = ${json(topTags)};\n\n` +
      `/** Top ${HIGHLIGHT_COUNT} by trust score, ties by name (sortByTrust order). */\n` +
      `export const HOME_HIGHLIGHTS: readonly Source[] = ${json(highlights)};\n`,
  ) && 'source-stats.generated.ts',
].filter(Boolean);

console.log(
  `build-sources: ${sources.length} records from ${files.length} files, ${changed.length ? `wrote ${changed.join(', ')}` : 'no changes'}`,
);
