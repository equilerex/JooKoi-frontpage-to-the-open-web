// Builds the generated library-content modules from markdown under
// content/library/. The tree is the real folder tree (decision 028).
// Heading groups from index.md are not folders.
//
// Output (R2, committed — ADR 027):
//   - src/app/shared/library-content/library-index.generated.ts
//   - src/app/shared/library-content/docs/<flat-path>.generated.ts
// library-lookup.ts is hand-written and is not generated.
//
// Front matter (R5): `key: value` lines, plus inline `tags: [a, b]`.
// order/summary/tags optional. Tree and chrome labels are the file/folder
// name (dashes to spaces, leading underscores dropped, words capitalised),
// not front-matter title and not the document H1. The H1 still renders in
// the article body.
//
// Link rewriting (R3): a relative `*.md` link is resolved against the
// file's directory, then looked up in the full library path map.
// Unresolved links stay as-is and are logged with file and line.
//
// Mermaid (R4): a ```mermaid fence becomes `<div class="mermaid">`.
// Heading ids (R3): slug of the heading text, `-2`/`-3` on repeats.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content', 'library');
const outDir = join(root, 'src', 'app', 'shared', 'library-content');
const docsOutDir = join(outDir, 'docs');
const indexOutFile = join(outDir, 'library-index.generated.ts');

const warnings = [];

function posixRel(from, to) {
  return relative(from, to).split('\\').join('/');
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { attrs: {}, body: raw };
  }
  const attrs = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const rawValue = line.slice(sep + 1).trim();
    const arrayMatch = rawValue.match(/^\[(.*)\]$/);
    attrs[key] = arrayMatch
      ? arrayMatch[1]
          .split(',')
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
          .filter((v) => v.length > 0)
      : rawValue;
  }
  return { attrs, body: raw.slice(match[0].length) };
}

function slugifyHeading(text, seen) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Label for the tree and crumbs: the disk name, readable. Not the H1. */
function labelFromName(name) {
  const stripped = String(name)
    .replace(/\.md$/i, '')
    .replace(/^_+/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!stripped) return String(name);
  return stripped.replace(/\b[a-zA-Z]/g, (c) => c.toUpperCase());
}

/** Resolve a relative `.md` link from `fromFile` against the library path map. */
function resolveMdLink(target, fromFile, docsByRel) {
  const hashIndex = target.indexOf('#');
  const pathPart = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : target.slice(hashIndex);
  const abs = resolvePath(dirname(fromFile), pathPart);
  const rel = posixRel(contentDir, abs).replace(/\.md$/i, '');
  const candidates = [rel];
  // Decision 030: topic-index.md was renamed to README.md.
  if (basename(pathPart, '.md').toLowerCase() === 'topic-index') {
    candidates.push(posixRel(contentDir, join(dirname(abs), 'README.md')).replace(/\.md$/i, ''));
  }
  for (const candidate of candidates) {
    if (docsByRel.has(candidate)) return `/library/${candidate}${fragment}`;
    const lower = candidate.toLowerCase();
    for (const key of docsByRel.keys()) {
      if (key.toLowerCase() === lower) return `/library/${key}${fragment}`;
    }
  }
  const slug = basename(pathPart, '.md').toLowerCase();
  const slugAliases = slug === 'topic-index' ? ['topic-index', 'readme'] : [slug];
  for (const alias of slugAliases) {
    const matches = [...docsByRel.keys()].filter(
      (key) => key.split('/').pop()?.toLowerCase() === alias,
    );
    if (matches.length === 1) return `/library/${matches[0]}${fragment}`;
  }
  return null;
}

function rewriteLinks(body, file, docsByRel) {
  const lines = body.split(/\r?\n/);
  return lines
    .map((line, lineIndex) => {
      return line.replace(/\]\((\.?\.?\/?(?:[\w./-]+\.md)(#[\w-]*)?)\)/g, (full, target) => {
        const resolved = resolveMdLink(target, file, docsByRel);
        if (!resolved) {
          warnings.push(`${posixRel(root, file)}:${lineIndex + 1}: unresolved link -> ${target}`);
          return full;
        }
        return `](${resolved})`;
      });
    })
    .join('\n');
}

function renderMarkdown(body) {
  const seenHeadings = new Map();
  let hasDiagrams = false;
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = tokens.map((t) => ('text' in t ? t.text : '')).join('');
        const id = slugifyHeading(plain, seenHeadings);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      code({ text, lang }) {
        if (lang === 'mermaid') {
          hasDiagrams = true;
          return `<div class="mermaid">${escapeHtml(text)}</div>\n`;
        }
        return false;
      },
    },
  });
  const html = marked.parse(body);
  return { html, hasDiagrams };
}

/**
 * Walk one directory. `index.md` is folder metadata, not a document.
 * A `foo.md` next to a `foo/` directory is a collision (R1).
 */
function listFolder(absDir, relPath) {
  const entries = readdirSync(absDir, { withFileTypes: true });
  const used = new Map();
  const files = [];
  const dirs = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      const slug = entry.name;
      if (used.has(slug)) {
        throw new Error(
          `build-library-content: ${relPath}/${slug} collides with a document of the same name`,
        );
      }
      used.set(slug, 'dir');
      dirs.push({
        abs: join(absDir, entry.name),
        rel: relPath ? `${relPath}/${slug}` : slug,
        name: entry.name,
      });
      continue;
    }
    if (!entry.isFile() || extname(entry.name) !== '.md' || entry.name === 'index.md') continue;
    const slug = basename(entry.name, '.md');
    if (used.has(slug)) {
      throw new Error(
        `build-library-content: ${relPath}/${slug} collides with a folder of the same name`,
      );
    }
    used.set(slug, 'file');
    files.push({
      abs: join(absDir, entry.name),
      rel: relPath ? `${relPath}/${slug}` : slug,
      slug,
    });
  }
  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.slug.localeCompare(b.slug));
  return { files, dirs };
}

function parseIndex(absDir) {
  const indexFile = join(absDir, 'index.md');
  if (!existsSync(indexFile)) return { attrs: {}, body: '', indexFile };
  const raw = readFileSync(indexFile, 'utf8');
  const parsed = parseFrontMatter(raw);
  return { ...parsed, indexFile };
}

function orderEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.rel.localeCompare(b.rel);
  });
}

if (!existsSync(contentDir)) {
  console.error(`build-library-content: ${contentDir} does not exist — nothing to build.`);
  process.exit(1);
}

const collectionDirs = readdirSync(contentDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .sort((a, b) => a.name.localeCompare(b.name));

const discovered = [];
function discover(absDir, relPath) {
  const listing = listFolder(absDir, relPath);
  discovered.push({ absDir, relPath, ...listing });
  for (const dir of listing.dirs) discover(dir.abs, dir.rel);
}

for (const entry of collectionDirs) {
  discover(join(contentDir, entry.name), entry.name);
}

const parsedDocs = [];
for (const folder of discovered) {
  for (const file of folder.files) {
    const raw = readFileSync(file.abs, 'utf8');
    const { attrs, body } = parseFrontMatter(raw);
    const slug = file.slug;
    const title = labelFromName(slug);
    const order = attrs.order !== undefined ? Number(attrs.order) : 0;
    const summary = attrs.summary ?? '';
    const tags = Array.isArray(attrs.tags) ? attrs.tags : [];
    parsedDocs.push({
      abs: file.abs,
      rel: file.rel,
      slug,
      title,
      order,
      summary,
      tags,
      body,
      parent: folder.relPath,
    });
  }
}

const docsByRel = new Map(parsedDocs.map((d) => [d.rel, d]));

const docsByParent = new Map();
for (const doc of parsedDocs) {
  const list = docsByParent.get(doc.parent) ?? [];
  list.push(doc);
  docsByParent.set(doc.parent, list);
}

const allDocs = [];
for (const [, group] of docsByParent) {
  const ordered = orderEntries(group);
  ordered.forEach((d, i) => {
    const rewritten = rewriteLinks(d.body, d.abs, docsByRel);
    const { html, hasDiagrams } = renderMarkdown(rewritten);
    allDocs.push({
      path: d.rel,
      title: d.title,
      order: d.order,
      summary: d.summary,
      tags: d.tags,
      hasDiagrams,
      prev: ordered[i - 1] ? ordered[i - 1].rel : null,
      next: ordered[i + 1] ? ordered[i + 1].rel : null,
      html,
      parent: d.parent,
    });
  });
}

allDocs.sort((a, b) => a.path.localeCompare(b.path));

const folders = discovered.map((folder) => {
  const name = folder.relPath.split('/').pop() ?? folder.relPath;
  const { attrs, body, indexFile } = parseIndex(folder.absDir);
  const introBody = body.trim() ? rewriteLinks(body, indexFile, docsByRel) : '';
  const childDocs = orderEntries(docsByParent.get(folder.relPath) ?? []).map((d) => d.rel);
  const childFolders = folder.dirs.map((d) => d.rel);
  const nestedDocCount = allDocs.filter((d) => d.path.startsWith(`${folder.relPath}/`)).length;
  return {
    path: folder.relPath,
    title: typeof attrs.title === 'string' && attrs.title ? attrs.title : labelFromName(name),
    order: attrs.order !== undefined ? Number(attrs.order) : 0,
    summary: typeof attrs.summary === 'string' ? attrs.summary : '',
    introHtml: introBody ? renderMarkdown(introBody).html : '',
    childFolders,
    docs: childDocs,
    docCount: nestedDocCount,
  };
});

folders.sort((a, b) => a.order - b.order || a.path.localeCompare(b.path));

const collections = folders.filter((f) => !f.path.includes('/'));

const rootFolder = {
  path: '',
  title: 'Library',
  order: 0,
  summary: '',
  introHtml: '',
  childFolders: collections.map((f) => f.path),
  docs: [],
  docCount: allDocs.length,
  collections: collections.map((f) => ({
    path: f.path,
    title: f.title,
    summary: f.summary,
    docCount: f.docCount,
  })),
};

const slugPaths = {};
for (const doc of allDocs) {
  const slug = doc.path.split('/').pop();
  if (!slug) continue;
  if (slugPaths[slug] && slugPaths[slug] !== doc.path) {
    warnings.push(
      `slug ${slug} maps to both ${slugPaths[slug]} and ${doc.path}; keeping the first`,
    );
    continue;
  }
  if (!slugPaths[slug]) slugPaths[slug] = doc.path;
}

const redirects = [];
const taken = new Set([...allDocs.map((d) => d.path), ...folders.map((f) => f.path)]);
for (const doc of allDocs) {
  const parts = doc.path.split('/');
  if (parts.length < 3) continue;
  const alias = `${parts[0]}/${parts[parts.length - 1]}`;
  if (taken.has(alias)) continue;
  redirects.push({ from: alias, to: doc.path });
  taken.add(alias);
}

// Decision 029: the mistaken short slug `learn` kept as redirects only.
const legacyCollectionAliases = {
  learn: 'ai-tooling-crash-course-for-developers',
};
for (const [legacy, current] of Object.entries(legacyCollectionAliases)) {
  if (!taken.has(legacy) && folders.some((f) => f.path === current)) {
    redirects.push({ from: legacy, to: current });
    taken.add(legacy);
  }
  for (const folder of folders) {
    if (folder.path !== current && !folder.path.startsWith(`${current}/`)) continue;
    const legacyPath = `${legacy}${folder.path.slice(current.length)}`;
    if (taken.has(legacyPath)) continue;
    redirects.push({ from: legacyPath, to: folder.path });
    taken.add(legacyPath);
  }
  for (const doc of allDocs) {
    if (doc.path !== current && !doc.path.startsWith(`${current}/`)) continue;
    const legacyPath = `${legacy}${doc.path.slice(current.length)}`;
    if (taken.has(legacyPath)) continue;
    redirects.push({ from: legacyPath, to: doc.path });
    taken.add(legacyPath);
  }
}

// Decision 030: topic-index → README entry doc (including under the learn alias).
for (const doc of allDocs) {
  const parts = doc.path.split('/');
  const slug = parts[parts.length - 1] ?? '';
  if (slug.toLowerCase() !== 'readme') continue;
  const legacyParts = [...parts];
  legacyParts[legacyParts.length - 1] = 'topic-index';
  const legacyPaths = [legacyParts.join('/')];
  if (doc.path.startsWith('ai-tooling-crash-course-for-developers')) {
    legacyPaths.push(
      `learn${doc.path.slice('ai-tooling-crash-course-for-developers'.length)}`.replace(
        /\/README$/i,
        '/topic-index',
      ),
    );
    legacyPaths.push(
      `learn${legacyParts.join('/').slice('ai-tooling-crash-course-for-developers'.length)}`,
    );
  }
  for (const legacyPath of new Set(legacyPaths)) {
    if (taken.has(legacyPath)) continue;
    redirects.push({ from: legacyPath, to: doc.path });
    taken.add(legacyPath);
  }
}

if (warnings.length > 0) {
  console.warn(`build-library-content: ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ${w}`);
}

if (existsSync(docsOutDir)) {
  for (const entry of readdirSync(docsOutDir)) {
    if (entry.endsWith('.generated.ts')) rmSync(join(docsOutDir, entry));
  }
}
mkdirSync(docsOutDir, { recursive: true });

function flatName(path) {
  return path.replace(/\//g, '__');
}

const loaderLines = allDocs
  .map((d) => `  '${d.path}': () => import('./docs/${flatName(d.path)}.generated'),`)
  .join('\n');

for (const doc of allDocs) {
  const file = join(docsOutDir, `${flatName(doc.path)}.generated.ts`);
  writeFileSync(
    file,
    `// Generated by scripts/build-library-content.mjs. Source: content/library/${doc.path}.md\nexport const HTML = ${JSON.stringify(doc.html)};\n`,
  );
}

const indexHeader = [
  '// Generated by scripts/build-library-content.mjs. Committed (R2 amends',
  '// decision 022) — a fresh clone builds without running the generator.',
  '// Regenerate by hand after content changes: `pnpm run content`.',
  '',
].join('\n');

const publicDocs = allDocs.map(({ html: _html, parent: _parent, ...meta }) => meta);

const indexBody = [
  'export interface LibraryDocMeta {',
  '  readonly path: string;',
  '  readonly title: string;',
  '  readonly order: number;',
  '  readonly summary: string;',
  '  readonly tags: readonly string[];',
  '  readonly hasDiagrams: boolean;',
  '  readonly prev: string | null;',
  '  readonly next: string | null;',
  '}',
  '',
  'export interface LibraryCollectionSummary {',
  '  readonly path: string;',
  '  readonly title: string;',
  '  readonly summary: string;',
  '  readonly docCount: number;',
  '}',
  '',
  'export interface LibraryDocRedirect {',
  '  readonly from: string;',
  '  readonly to: string;',
  '}',
  '',
  'export interface LibraryFolderMeta {',
  '  readonly path: string;',
  '  readonly title: string;',
  '  readonly order: number;',
  '  readonly summary: string;',
  '  readonly introHtml: string;',
  '  readonly childFolders: readonly string[];',
  '  readonly docs: readonly string[];',
  '  readonly docCount: number;',
  '  readonly collections?: readonly LibraryCollectionSummary[];',
  '}',
  '',
  `export const LIBRARY_ROOT: LibraryFolderMeta = ${JSON.stringify(rootFolder, null, 2)};`,
  '',
  `export const LIBRARY_FOLDERS: readonly LibraryFolderMeta[] = ${JSON.stringify(folders, null, 2)};`,
  '',
  `export const LIBRARY_DOCS: readonly LibraryDocMeta[] = ${JSON.stringify(publicDocs, null, 2)};`,
  '',
  `export const LIBRARY_DOC_PATHS: readonly string[] = ${JSON.stringify(allDocs.map((d) => d.path))};`,
  '',
  `export const LIBRARY_FOLDER_PATHS: readonly string[] = ${JSON.stringify(folders.map((f) => f.path))};`,
  '',
  `export const LIBRARY_DOC_REDIRECTS: readonly LibraryDocRedirect[] = ${JSON.stringify(redirects, null, 2)};`,
  '',
  `export const LIBRARY_SLUG_PATHS: Readonly<Record<string, string>> = ${JSON.stringify(slugPaths, null, 2)};`,
  '',
  'export const LIBRARY_DOC_LOADERS: Record<string, () => Promise<{ HTML: string }>> = {',
  loaderLines,
  '};',
  '',
].join('\n');

writeFileSync(indexOutFile, indexHeader + indexBody);

console.log(
  `build-library-content: wrote ${allDocs.length} docs across ${folders.length} folder(s) to ${outDir}`,
);
