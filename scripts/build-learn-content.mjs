// Builds the generated learn-content module from the vendored markdown in
// content/learn/. Mirrors scripts/primeui-license.mjs: a small, idempotent
// pre-build step whose output is a gitignored module the app imports
// directly, chained into the build ahead of `ng build`/`ng serve`.
//
// The plan's four steps (`_architecture/plans/2026-09-16-phase-3-content-and-features.md`,
// "Content pipeline"):
//   1. Read vendored markdown from content/learn/.
//   2. Parse front matter and the H1 for title and ordering.
//   3. Render to HTML with `marked` (devDependency, build-time only — decision
//      D6). No syntax highlighting: `marked`'s default fenced-code renderer is
//      plain `<pre><code>`, and no highlighter is wired in (decision D9).
//   4. Emit a generated, gitignored TS module: typed topic records with
//      `slug`, `title`, `order`, `html`, plus the route list for
//      prerendering.
//
// One addition beyond those four: this script also emits `LEARN_TREE`, the
// grouped tree data `/learn`'s `joo-topic-tree` renders. The brief names
// `topic-index.md` as that tree's source of truth, and this is the one place
// that already parses the vendored markdown, so building the tree here (once,
// at build time) keeps the app importing plain data instead of re-parsing
// markdown at runtime. See `parseTopicIndexTree` below for the exact rule and
// its one documented gap (the intro doc isn't reachable as a markdown link
// from topic-index.md, so it lands in a fallback group).
//
// D8: no sync script, hash or provenance check against the sibling repo —
// re-vendoring is by hand. This script only ever reads content/learn/.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content', 'learn');
const topicsDir = join(contentDir, 'topics');
const indexFile = join(contentDir, 'topic-index.md');
const outFile = join(root, 'src', 'app', 'shared', 'learn-content', 'learn-content.generated.ts');

marked.setOptions({ gfm: true });

/**
 * Minimal `key: value` front matter block delimited by `---` lines at the
 * top of the file. None of the 20 vendored docs carry one today — every
 * title/order below falls back to the H1 and filename order (see
 * `orderFiles`) — but parsing it means a future doc that adds front matter
 * is picked up with no script change.
 */
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { attrs: {}, body: raw };
  }
  const attrs = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    attrs[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return { attrs, body: raw.slice(match[0].length) };
}

function firstH1(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function slugify(filename) {
  return basename(filename, '.md');
}

function readMarkdownFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(dir, entry.name));
}

/**
 * Deterministic fallback order: the intro doc (`0-how-llms-actually-work...`)
 * always leads, everything else follows alphabetically by filename. No
 * vendored doc supplies an explicit `order` via front matter today, so this
 * is what decides pager prev/next when front matter is absent.
 */
function orderFiles(files) {
  return [...files].sort((a, b) => {
    const an = basename(a);
    const bn = basename(b);
    const aFirst = an.startsWith('0-');
    const bFirst = bn.startsWith('0-');
    if (aFirst !== bFirst) return aFirst ? -1 : 1;
    return an.localeCompare(bn);
  });
}

/**
 * Groups topics the way `topic-index.md` does: one group per `## ` section,
 * its children the topics that section links to (`](./topics/slug.md)` or
 * `](topics/slug.md)`), in link order. A topic no section links to — in
 * practice just the intro doc, which `topic-index.md` names in prose
 * ("Topics to add: 0 how do llm's actually function...") without a markdown
 * link — falls into a trailing "More topics" group instead of being dropped,
 * so every vendored topic is reachable from the tree.
 */
function parseTopicIndexTree(indexRaw, topicsBySlug) {
  const linkRe = /\]\(\.?\/?topics\/([a-z0-9-]+)\.md\)/gi;
  const groups = [];
  let current = null;

  for (const line of indexRaw.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = { label: heading[1].trim(), children: [] };
      groups.push(current);
      continue;
    }
    if (!current) continue;

    linkRe.lastIndex = 0;
    let match;
    while ((match = linkRe.exec(line))) {
      const slug = match[1];
      const topic = topicsBySlug.get(slug);
      if (topic && !current.children.some((child) => child.key === slug)) {
        current.children.push({ key: slug, label: topic.title, leaf: true });
      }
    }
  }

  const nonEmpty = groups.filter((group) => group.children.length > 0);

  const linked = new Set(nonEmpty.flatMap((group) => group.children.map((child) => child.key)));
  const leftover = [...topicsBySlug.values()]
    .filter((topic) => !linked.has(topic.slug))
    .sort((a, b) => a.order - b.order);
  if (leftover.length > 0) {
    nonEmpty.push({
      label: 'More topics',
      children: leftover.map((topic) => ({ key: topic.slug, label: topic.title, leaf: true })),
    });
  }

  return nonEmpty.map((group, index) => ({
    key: `group-${index}`,
    label: group.label,
    children: group.children,
  }));
}

if (!existsSync(contentDir)) {
  console.error(`build-learn-content: ${contentDir} does not exist — nothing to build.`);
  process.exit(1);
}

const files = orderFiles([
  ...readMarkdownFiles(contentDir).filter((file) => basename(file) !== 'topic-index.md'),
  ...readMarkdownFiles(topicsDir),
]);

const topics = files.map((file, index) => {
  const raw = readFileSync(file, 'utf8');
  const { attrs, body } = parseFrontMatter(raw);
  const title = attrs.title ?? firstH1(body) ?? basename(file, '.md');
  const order = attrs.order !== undefined ? Number(attrs.order) : index;
  const slug = attrs.slug ?? slugify(file);
  const html = marked.parse(body);
  return { slug, title, order, html };
});
topics.sort((a, b) => a.order - b.order);

const topicsBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
const tree = existsSync(indexFile)
  ? parseTopicIndexTree(readFileSync(indexFile, 'utf8'), topicsBySlug)
  : [];

mkdirSync(dirname(outFile), { recursive: true });

const header = [
  '// Generated by scripts/build-learn-content.mjs. Do not edit, do not commit.',
  '// Source markdown is vendored in content/learn/ (decision D5 — this repo',
  '// never reads the sibling JooKoi-developer-stack repo at build or runtime).',
  '',
].join('\n');

const body = [
  'export interface LearnTopic {',
  '  readonly slug: string;',
  '  readonly title: string;',
  '  readonly order: number;',
  '  readonly html: string;',
  '}',
  '',
  "/** Plain tree data shaped for PrimeNG's `TreeNode` (`joo-topic-tree`),",
  ' *  without importing the type here — this module has no Angular/PrimeNG',
  ' *  dependency, just data. */',
  'export interface LearnTreeGroup {',
  '  readonly key: string;',
  '  readonly label: string;',
  '  readonly children: readonly { readonly key: string; readonly label: string; readonly leaf: true }[];',
  '}',
  '',
  `export const LEARN_TOPICS: readonly LearnTopic[] = ${JSON.stringify(topics, null, 2)};`,
  '',
  'export const LEARN_TOPIC_ROUTES: readonly string[] = LEARN_TOPICS.map((topic) => topic.slug);',
  '',
  `export const LEARN_TREE: readonly LearnTreeGroup[] = ${JSON.stringify(tree, null, 2)};`,
  '',
].join('\n');

writeFileSync(outFile, header + body);

console.log(
  `build-learn-content: wrote ${topics.length} topics and ${tree.length} tree groups to ${outFile}`,
);
