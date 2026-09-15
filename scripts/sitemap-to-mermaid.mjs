#!/usr/bin/env node
// Converts _architecture/sitemap.yaml into a mermaid graph. No deps: the parser below
// only handles this file's own flat, controlled schema — it is not a general YAML parser.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = join(__dirname, '..', '_architecture', 'sitemap.yaml');

function parseSitemap(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const entryStart = line.match(/^- id:\s*(.+)$/);
    if (entryStart) {
      current = { id: entryStart[1].trim(), links_to: [], external: false };
      entries.push(current);
      continue;
    }

    const field = line.match(/^\s+(\w+):\s*(.*)$/);
    if (field && current) {
      const [, key, value] = field;
      if (key === 'links_to') {
        current.links_to = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (key === 'external') {
        current.external = value.trim() === 'true';
      } else {
        current[key] = value.trim();
      }
    }
  }
  return entries;
}

function toMermaid(entries) {
  const out = ['graph TD'];
  for (const e of entries) {
    const label = e.status === 'parked' ? `${e.title} (parked)` : e.title;
    const nodeShape = e.external
      ? `((${label}))`
      : e.type === 'script'
        ? `[[${label}]]`
        : `[${label}]`;
    out.push(`  ${e.id}${nodeShape}`);
  }
  for (const e of entries) {
    for (const target of e.links_to) {
      out.push(`  ${e.id} --> ${target}`);
    }
  }
  for (const e of entries.filter((e) => e.status === 'parked')) {
    out.push(`  style ${e.id} stroke-dasharray: 5 5`);
  }
  return out.join('\n');
}

const entries = parseSitemap(readFileSync(sitemapPath, 'utf8'));
console.log(toMermaid(entries));
