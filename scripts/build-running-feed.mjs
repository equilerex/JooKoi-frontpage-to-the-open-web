#!/usr/bin/env node
// Fetches RSS/Atom feeds for curated sources at build time and compiles
// latest articles into static data for the landing page running feed.
// Plan: _architecture/plans/2026-09-29-landing-page-rss-feed.md

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'sources');
const outDataJson = join(root, 'data', 'running-feed.json');
const outTsFile = join(
  root,
  'src',
  'app',
  'shared',
  'curated-websites',
  'running-feed.generated.ts',
);

const CONCURRENCY = 6;
const TIMEOUT_MS = 8000;
const MAX_ARTICLES_PER_FEED = 5;
const MAX_TOTAL_ARTICLES = 50;
const USER_AGENT =
  'Mozilla/5.0 (compatible; JooKoi-FeedBot/1.0; +https://github.com/equilerex/JooKoi-frontpage-to-the-open-web)';

// 1. Gather sources with active feeds
const allSources = readdirSync(sourcesDir)
  .filter((f) => f.endsWith('.json') && f !== 'source.schema.json')
  .sort()
  .flatMap((f) => {
    try {
      const data = JSON.parse(readFileSync(join(sourcesDir, f), 'utf8'));
      return (data.sources || []).map((s) => ({ ...s, file: f }));
    } catch {
      return [];
    }
  });

// Filter to sources with feeds. Prioritize inRunningFeed or high trustScore
const candidateSources = allSources.filter((s) => s.feeds && s.feeds.length > 0 && s.feeds[0].url);
candidateSources.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));

// Select top 25 candidate feeds for fast, polite build-time compilation
const targetSources = candidateSources.slice(0, 25);

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
}

function cleanText(raw) {
  if (!raw) return '';
  const noCdata = raw.replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1');
  // Atom `type="html"` feeds escape their markup (&lt;p&gt;), so decode before stripping tags.
  const noTags = decodeHtmlEntities(noCdata).replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(noTags).replace(/\s+/g, ' ').trim();
}

// Inner text of the first matching element. Skips attributes (e.g. <content type="html">)
// and self-closing tags (<link href="..." />).
function tagText(block, names) {
  const m = block.match(new RegExp(String.raw`<(${names})\b[^>]*?(?<!/)>(.*?)</\1>`, 'is'));
  return m ? m[2] : '';
}

function parseFeedXml(xml, source) {
  const articles = [];

  // Match RSS 2.0 items (<item>...</item>)
  const itemMatches = xml.matchAll(/<item[\s>](.*?)<\/item>/gis);
  for (const match of itemMatches) {
    const itemBlock = match[1];
    const rawDate = tagText(itemBlock, 'pubDate|dc:date|published|updated');

    const title = cleanText(tagText(itemBlock, 'title'));
    const link = cleanText(
      tagText(itemBlock, 'link') || itemBlock.match(/<link[^>]+href=["'](.*?)["']/is)?.[1] || '',
    );
    const desc = cleanText(tagText(itemBlock, 'description|content:encoded|summary'));

    let publishedAt = new Date().toISOString();
    if (rawDate) {
      const parsedDate = new Date(rawDate.trim());
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    if (title && link && link.startsWith('http')) {
      articles.push({
        sourceId: source.id,
        sourceName: source.name,
        category: source.category || '',
        title,
        link,
        publishedAt,
        snippet: desc.slice(0, 140),
      });
      if (articles.length >= MAX_ARTICLES_PER_FEED) break;
    }
  }

  if (articles.length > 0) return articles;

  // Match Atom 1.0 entries (<entry>...</entry>)
  const entryMatches = xml.matchAll(/<entry[\s>](.*?)<\/entry>/gis);
  for (const match of entryMatches) {
    const entryBlock = match[1];
    const rawDate = tagText(entryBlock, 'published|updated');

    const title = cleanText(tagText(entryBlock, 'title'));
    const link = cleanText(
      entryBlock.match(/<link[^>]+href=["'](.*?)["']/is)?.[1] || tagText(entryBlock, 'link'),
    );
    const desc = cleanText(tagText(entryBlock, 'summary|content'));

    let publishedAt = new Date().toISOString();
    if (rawDate) {
      const parsedDate = new Date(rawDate.trim());
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    if (title && link && link.startsWith('http')) {
      articles.push({
        sourceId: source.id,
        sourceName: source.name,
        category: source.category || '',
        title,
        link,
        publishedAt,
        snippet: desc.slice(0, 140),
      });
      if (articles.length >= MAX_ARTICLES_PER_FEED) break;
    }
  }

  return articles;
}

async function fetchSourceFeed(source) {
  const feedUrl = source.feeds[0].url;
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeedXml(xml, source);
  } catch {
    return [];
  }
}

async function main() {
  console.log(`[feed] Polling ${targetSources.length} feeds at build-time...`);
  const collected = [];

  for (let i = 0; i < targetSources.length; i += CONCURRENCY) {
    const batch = targetSources.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map((s) => fetchSourceFeed(s)));
    batchResults.forEach((items) => collected.push(...items));
  }

  // Deduplicate articles by normalized link
  const seenLinks = new Set();
  const deduped = [];
  for (const item of collected) {
    const normLink = item.link.replace(/\/+$/, '').toLowerCase();
    if (!seenLinks.has(normLink)) {
      seenLinks.add(normLink);
      deduped.push(item);
    }
  }

  // Sort descending by publication date
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const finalArticles = deduped.slice(0, MAX_TOTAL_ARTICLES);

  console.log(`[feed] Parsed ${finalArticles.length} unique articles across sources.`);

  // Write data/running-feed.json
  if (!existsSync(dirname(outDataJson))) mkdirSync(dirname(outDataJson), { recursive: true });
  writeFileSync(
    outDataJson,
    JSON.stringify(
      {
        compiledAt: new Date().toISOString(),
        articleCount: finalArticles.length,
        articles: finalArticles,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`[feed] Wrote ${outDataJson}`);

  // Write src/app/shared/curated-websites/running-feed.generated.ts
  const tsContent = `// Generated by scripts/build-running-feed.mjs. Do not edit directly.
// Compile time: ${new Date().toISOString()}

export interface RunningFeedArticle {
  readonly sourceId: string;
  readonly sourceName: string;
  readonly category: string;
  readonly title: string;
  readonly link: string;
  readonly publishedAt: string;
  readonly snippet: string;
}

export const RUNNING_FEED_COMPILED_AT = ${JSON.stringify(new Date().toISOString())};

export const RUNNING_FEED_ARTICLES: readonly RunningFeedArticle[] = ${JSON.stringify(finalArticles, null, 2)} as const;
`;

  writeFileSync(outTsFile, tsContent, 'utf8');
  console.log(`[feed] Wrote ${outTsFile}`);
}

main().catch((err) => {
  console.error('[feed] Compilation failed:', err);
  process.exit(1);
});
