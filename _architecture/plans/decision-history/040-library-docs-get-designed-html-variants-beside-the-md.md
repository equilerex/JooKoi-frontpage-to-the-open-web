# Decision 040 — Library docs get designed HTML variants beside the md

Date: 02-10-2026 03:24

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer. A decision already stated in ARCHITECTURE.md or
     AGENTS.md is folded in and the file deleted instead.
     All five sections below are required. -->

## Problem

The crash course is synced from the developer-stack repo as markdown, and `content:sync` overwrites every `.md`. The user wants the pages to be more fun to read (layouts, diagrams, illustrations) without changing the text, and wants design to survive future text updates.

## Options considered

1. Edit the synced `.md` in place with mermaid fences and wrapper HTML. Simple, but sanitized `innerHTML` strips `style`, `<svg>` and `<style>`, and resync clobbers it.
2. Per-doc overlay files that say where to insert blocks. New machinery.
3. A hand-built `.html` beside each `.md`, rendered instead of it.

## Decision

Option 3. `foo.html` next to `foo.md` replaces the rendered body (`scripts/build-library-content.mjs`, `custom: true` in the doc meta). The `.md` stays the sync-managed text source. Each html pins `<!-- md-sha: xxxxxxxx -->` (first 8 hex of the sha1 of the md); the build warns `STALE designed html` on mismatch, which is the cue for a manual AI re-merge of text, then updating the pin. Designed docs render via `bypassSecurityTrustHtml` in `library-document.page.ts` so each page carries its own scoped `<style>` (prefix every rule with a per-doc root class) and inline SVG. Safe only because the files are repo-authored. Illustrations live in `public/library-art/` and are referenced base-relative (`library-art/x.svg`, no leading slash, for GitHub Pages subpath).

## Why not the alternatives

Option 1 loses the design on resync and cannot use SVG or custom CSS. Option 2 adds a mapping layer the repo's build gate argues against. Global `doc-*` CSS classes in `styles.css` were tried and removed: free-form per-page HTML made them redundant.

## Next step

Cost call (user, 02-10-2026): do not hand-build html for every page. Plain md docs get a cheap generic facelift instead: `.is-plain` rules in `src/styles.css` (numbered h2 badges, dot lists, callout blockquotes, zebra tables, squiggle hr) plus a generated decorative banner per doc (`bannerHtml` in `scripts/build-library-content.mjs`, data-URI svg seeded by slug). Hand-built html stays for showpiece pages only (pilot done).

Pilot done: `0-how-llms-actually-work-under-the-hood.html`.

## Addendum 02-10-2026: sidecars, reading order, tree state

User asked for fun makeovers on every page (reversing the earlier cost-light call for the topic docs), so the md stays the text source and design lives in sidecars next to it in `content/library/`:

- `foo.top.html` is prepended to the rendered md (README hero and reading path).
- `foo.figs.html` holds illustrations: `<!-- after: heading-id -->` then markup, inserted after the first block element following that heading (`injectFigures` in the build script; warns when the anchor is missing). 22 figures across the 19 topics were generated from a throwaway script, then edited by hand where needed. Re-run the build and check `figure anchor` warnings after a resync renames headings.
- Doc meta `trusted` (custom, top or figs) switches the page to `bypassSecurityTrustHtml`. `custom` (full `foo.html`) turns off the plain facelift.
- Folder `index.md` front matter `reading-order: [slug, ...]` sets doc order (unlisted after). The library tree and pager follow it. Topics order: vocabulary, tokens, prompting, instruction files, planning, skills, subagents, MCP, memory, review, security, scanning, sandboxing, loops, RAG, local models, protocols, graph engineering, personal harness.
- Tree: folder open/closed state toggled by hand is kept in `LibraryLayoutStore.folderOpen`; inside a collection the whole collection opens by default. This fixed Topics collapsing when clicking root docs.

### Second figure pass, 02-10-2026

User found quality uneven: long pages had few or no illustrations after the first quarter. Sidecars now carry 93 figures across 21 docs, roughly one per 300-600 words on the long pages (memory ledgers 11, planning 8, session economics 8, base instruction files 6, skills 6, skill scanning 6, personal harness 6). Figures were generated from a throwaway Python script (not kept) after reading each section, so the `*.figs.html` files are now the source and are edited by hand. Content in them (stats, names, dates) comes from the docs; recheck after a resync changes a number. Figures on phones keep a 640px minimum width and scroll sideways inside the figure (`src/styles.css`) so text stays legible. Left light: `_ai-tooling-recommendations` (mostly tables, 3 figures) and `_inspiration-and-staying-current` (1).
