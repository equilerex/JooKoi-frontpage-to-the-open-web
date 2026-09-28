# library-archive-section

Session: 2026-09-16. Status: approved for implementation. Two naming calls stay open (see Open questions) and block build step 2.

## Why this section exists

The rest of the site points outward: it sends people to other sites and does not reproduce them (`principles.md`). The library is the only part that faces inward. It hosts the user's own writing: notes, crash courses and explorations that currently sit across separate repos (BACKLOG "Personal knowledge-notes index") with nowhere to read them as a whole.

Three reasons it belongs in this repo and not somewhere else:

1. **One reading surface for the user's own material.** `/learn` proved the pattern with one collection. The library generalizes it to several.
2. **Mostly for the user, public by accident.** It is not a publication with an audience strategy. It ships because the site ships. Everything is committed, content and generated output alike.
3. **Reference value.** A build-time content pipeline, lazy per-document chunks, prerendered routes of any depth and a scoped light theme inside a dark app are all patterns worth having in the user's modern-Angular reference app.

Principles check: "send to sources, don't reproduce them" is about other people's content. The library publishes the user's own writing, so the user is the source. This needs one line in `principles.md` so a later reader does not read the library as a breach of that rule (build step 9).

## Where it is going

This is a direction, not a commitment. It exists so today's structure does not block any of it:

- **More collections, written straight into this repo.** New writing is authored in `content/library/`, which is the canonical copy. Only the existing `/learn` collection stays a vendored copy of `JooKoi-developer-stack` (decisions 021, 024).
- **Real filtering** by tags, then by other front matter fields, once enough documents carry them.
- **Full-text search** over the library, decided together with the existing BACKLOG "Client-side search library pick", not separately.
- **Editing without a server.** "Admin edit" means a git-backed flow: GitHub's web editor on `content/library/` today, possibly a git-backed CMS later. A commit triggers a CI rebuild. This keeps decision 004 (static, no server) intact, so no backend or upload path is ever needed.
- **Notes that link to curated websites.** A note that cites a site could link to its record in the directory. This connects the inward half of the site to the outward half. Nothing is built for it now.

`JooKoi-md-archive` stays a separate app. Its light reader styling is a visual reference for the reader theme, nothing more. Its conventions (gitignored content, URL rules, storage) are not carried over. Every choice here is justified by this repo's needs.

## Decisions this session

- **D1 — No backend, no upload.** Content is Markdown in `content/library/`, built into generated modules at build time. Future editing goes through git (see Where it is going), so decision 004 never has to be reopened for this section.
- **D2 — Authored in this repo.** `content/library/` is the canonical copy for every collection except the vendored `/learn` one. This makes front matter the section's data model (R5), because the user writes it by hand and nothing else produces it.
- **D3 — Rendering stays on this repo's `marked` build step.** The light reader look uses `JooKoi-md-archive`'s `markdown-rendering.scss` as a visual reference only.
- **D4 — Mermaid is built now, loaded lazily.** The user wants it in this build. No current document has a diagram (0 `mermaid` fences in `content/learn/`), so its cost must fall only on documents that use it (R4). Syntax highlighting stays out (decision 025).
- **D5 — Filters are visual only in v1.** Folder pages show a row of chunky filter buttons with no handler. Labels come from data, not the template, so wiring them later means adding a handler, not rebuilding the row (R6).
- **D6 — Pixel mockup first.** `features/design-theme/library-*.html` is build step 1, reviewed before any component work.
- **D7 — URLs mirror the folder tree, at any depth.** `content/library/notes/angular/signals.md` is served at `/library/notes/angular/signals`. It is the only scheme that survives nested folders, which authoring in the repo will produce (R1).
- **D8 — `/learn` URLs redirect.** `/learn` and `/learn/:topic` become `redirectTo` routes into the migrated collection. Two lines, and old links keep working.

## Future-proofing requirements

These cost little now and a rewrite later. Everything else is deferred on purpose.

### R1 — Routes of any depth

- One lazy `library` route (`loadChildren`) with a `UrlMatcher` that consumes every remaining segment into a single `path` parameter. The page decides from the generated index whether that path is a folder or a document.
- Build fails if a folder and a document share a name in the same parent (`foo/` next to `foo.md`), because they would claim the same URL.
- Prerendering: the generator emits the full list of paths. **Verify before building** whether a `library/**` server route can take multi-segment values from `getPrerenderParams`. The Angular docs pulled this session did not settle it. Fallback that is known to work: the generator emits one literal `ServerRoute` per path.

### R2 — Content kept out of the main bundle

Today `learn-content.generated.ts` is 305 kB of source, almost all of it HTML strings, and `app.routes.ts` imports the learn pages directly, so every page downloads every document. Each new collection makes this worse. The 320 kB warn was already exceeded by PrimeNG before learn landed (`ARCHITECTURE.md`, Build budgets), and learn adds to it. The generator therefore emits two kinds of output:

- **`library-index.generated.ts`**, small: the tree, and per document its path, title, order, tags, summary, `hasDiagrams`, prev/next paths. The library route chunk imports it. The main bundle never does.
- **One module per document**, holding only its HTML, loaded through a generated `path → () => import(...)` map. esbuild gives each its own chunk. This works during prerendering because it is plain JS, not a fetch.

Per-document chunks cost the generator the same effort as per-collection ones and never need splitting again.

When the generator runs:

- Generated outputs are committed, like everything else in this repo. A fresh clone compiles without running anything.
- `pnpm run content` runs the generator by hand after content changes. The outputs live under `src/`, so a running dev server picks them up with no restart.
- `start` and `watch` do not run it.
- `build` still runs it first. It takes about 0.3s, and it means production always matches the markdown even if a regeneration was forgotten, so no separate staleness check is needed.

Hydration risk: `app.config.ts` has `provideClientHydration()`. The prerendered page contains the article, but on the client the document chunk loads asynchronously, so the first client render has no HTML. Expect a hydration mismatch or a blank flash. Load the chunk in a route `resolve` so the page component is created with the HTML already present, and check the first load of a prerendered document page in the browser for hydration errors in the console.

### R3 — Links between documents resolve

The vendored content has 90 relative `.md` links, and the current script passes them through untouched, so they 404 today. The generator rewrites any relative link that resolves to a file inside `content/library/` into its route, keeping `#fragment`. Links that do not resolve (for example to dev-stack files that were never vendored) are listed as build warnings with file and line, not silently kept.

Headings get stable `id`s (slug of the heading text, suffixed `-2`, `-3` on duplicates) so `doc#section` links and future tables of contents have targets.

Sanitizer: the article renders through `[innerHTML]`, and Angular's sanitizer likely strips `id` attributes. Verify on the running page first. If they are stripped, the reader page marks the generated HTML trusted with `bypassSecurityTrustHtml`. That is safe only because the HTML comes from this repo at build time, and that reason goes in a comment at the call site.

### R4 — Mermaid only where it is used

- Build time: a `marked` renderer override turns ` ```mermaid ` fences into `<div class="mermaid">` with escaped source. The generator sets `hasDiagrams` on that document.
- Runtime: the reader page runs `await import('mermaid')` only when `hasDiagrams` is true, after the HTML is in the DOM. Moving between documents reuses the same page component, so a one-shot `afterNextRender` would miss every document after the first. The render pass has to re-run whenever the document changes, for example with `afterRenderEffect` keyed on the current path. Then it initializes with `theme: 'neutral'` and calls `mermaid.run()` on unprocessed `.mermaid` nodes. Diagrams render in the browser, not during prerendering, so prerendered HTML shows the source until hydration. That is acceptable for a personal site.
- Check the package's current API and chunk size with ctx7 when installing. Record the size in the build step report.

### R5 — Front matter is the schema

The fields are defined now, because the user will write them by hand from the first new document. The generator validates them and fails the build on a wrong type:

| Field     | Type     | Used by                                                          |
| --------- | -------- | ---------------------------------------------------------------- |
| `title`   | string   | tree, reader, `<title>`. Falls back to the H1, then the filename |
| `order`   | number   | sort within a folder. Falls back to the filename                 |
| `summary` | string   | tiles, folder listing, future search results                     |
| `tags`    | string[] | future filters (R6)                                              |
| `slug`    | string   | overrides the filename for the URL. Already supported today      |

The current parser only reads `key: value` lines. `tags` needs list values, so the parser either handles inline `[a, b]` arrays or moves to a YAML parser. Prefer the inline-array rule, per the minimal-dependency default.

### R6 — Folder metadata and the inert filter row

- A folder may contain an `index.md`. Its front matter gives the folder's `title`, `order` and `summary`. Its body renders as the folder page's intro. Its `##` sections with links group the children, which is today's `topic-index.md` rule. Without an `index.md`, children are listed by `order`, then by name.
- Filter button labels come from the index: the union of `tags` in that folder, or the `##` group labels while no tags exist. No handler is attached.

## Content layout after migration

```
content/library/
  <collection-slug>/            # was content/learn/, flattened
    index.md                    # was topic-index.md
    0-how-llms-actually-work-under-the-hood.md
    agent-sandboxing.md
    ...
  <next-collection>/
    index.md
    some-note.md
    sub-folder/
      index.md
      deeper-note.md
```

The `topics/` subfolder is flattened during migration so URLs read `/library/<collection>/agent-sandboxing`, not `/library/<collection>/topics/agent-sandboxing`. The 90 relative links are fixed by R3's rewrite, which resolves against the new layout.

## Pages

- **`/library`**: one chunky tile per top-level folder (label, summary, document count), matching the `joo-keycap-grid` look scaled up to card size. Dark retro theme.
- **Folder, any depth**: breadcrumb, `index.md` intro, inert filter row, `joo-topic-tree` scoped to this folder's children. Dark retro theme.
- **Document**: `joo-document-template` + `joo-breadcrumb-trail` + `joo-paper-sheet`/`joo-prose-content` + `joo-pager`, as `learn-topic.page` does today. The breadcrumb and pager stay in the dark chrome. Only the article body switches to `[data-theme='reader']`.

Wireframes from the first draft still hold for layout. The mockup (build step 1) replaces them.

## Reader theme

A scoped token block, `[data-theme='reader']`, following the existing `[data-theme='retro']` pattern in `src/styles/design-tokens.css`. Starting values, taken from `JooKoi-md-archive`'s `markdown-rendering.scss` as a visual reference and adjusted in the mockup (build step 1):

- Light background, dark foreground in the `#111827` range.
- Headings at weight 500, inheriting the foreground color, stepping 1.4rem (h1) down to 1rem (h5, h6).
- Inline code as a dark pill (`#282c34` background, white text). This contrast is deliberate in the source.
- Code block background mapped onto this repo's gray token scale, not copied as raw hex.

## Open questions

- **Section name.** "library" is a placeholder, and it is in every URL. Settle before build step 2.
- **Name of the first collection** (today's `/learn` content). Also in URLs. Settle before build step 2.
- Filter facet model beyond "tags exist". Decided once real tags exist.
- Full-text search. Decided with BACKLOG "Client-side search library pick".
- Git-backed editing tool, if GitHub's web editor stops being enough.

## Build order

Sequencing only. `writing-plans` produces the task-level plan once this doc is approved.

1. Mockup: `features/design-theme/library-*.html` for the landing, folder and reader views, including the reader theme. Reviewed before step 2.
2. Settle the two names.
3. Remove the `learn-content.generated.ts` line from `.gitignore`. Migrate `content/learn/` to `content/library/<collection>/`, flattening `topics/` and renaming `topic-index.md` to `index.md`, in the same change as the new generator. `pnpm start` runs `build-learn-content.mjs` first, so moving the content alone breaks the dev server. Generator: `scripts/build-learn-content.mjs` becomes `build-library-content.mjs`. Recursive walk, front matter schema and validation (R5), collision check (R1), link rewriting and heading ids (R3), Mermaid fence override (R4), split output (R2).
4. Routes: lazy `library` route with the matcher (R1), `/learn` redirects (D8, and check what static output emits for a redirect route, since there is no server to send a 301), prerender path list (verify `**` first, literal fallback).
5. Pages: landing tiles, folder page with the inert filter row (R6), document page.
6. Reader theme token block and its wiring on the article slot.
7. Mermaid: install, lazy import on documents with `hasDiagrams`. Add one test document with a diagram so the path is exercised.
8. Remove `learn.page.*`, `learn-topic.page.*`, `shared/learn-content/` and the old script.
9. Paper trail: ADRs for D2, D4 (amends 022, which ruled out a runtime Mermaid dependency), D7 and R2 (also amends 022: generated output is committed, not gitignored). Update the `principles.md` line (Why this section exists), `sitemap.yaml` (replace `education_home`/`education_topic`), `ARCHITECTURE.md`, and `app-shell/CONTEXT.md`. BACKLOG: resolve "Personal knowledge-notes index", "Markdown rendering" and "Richer drill-in UI for the learn section".

## Implementation deviations

- **Interim tree-everywhere layout (not a product rejection of Pages).** Mid-build, the folder page dumped a full `index.md` body on top of the tree and lost the tree on documents. The fix that shipped was a persistent split (`library-layout.page` + tree + reader) and it also dropped the planned `/library` chunky tiles and the folder inert filter row (R6). Those Pages pieces are still required. Rebuild per `plans/2026-09-17-library-pages-ui.md` (locks this plan’s ## Pages wording).
- **The tree is the real folder tree (decision 028).** Build step 3 flattened `topics/` and the generator grouped documents by `##` headings in `index.md`. That invented folders that do not exist on disk and dropped `_inspiration-and-staying-current.md` and `_ai-tooling-recommendations.md`. `content/library/learn/` now mirrors `JooKoi-developer-stack/ai-tooling-crash-course-for-developers` (`topics/` kept, `topic-index.md` a document). `pnpm run content:sync` re-vendors it. D5/R6 filter buttons are not emitted until a document carries tags.
- **Chrome labels are the file name, not the H1.** R5 said title falls back to the H1. That put long editorial headings into the tree. Labels are now the disk name with dashes turned into spaces and words capitalised. The H1 still renders inside the article.
