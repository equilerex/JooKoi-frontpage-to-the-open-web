# library-pages-ui

Session: 2026-09-17. Status: approved for mockup then build. Baseline is ## Pages in `2026-09-16-library-archive-section.md`, with the landing clarifications below.

## Context

The library **content pipeline** (vendored markdown, generator, literal routes, sync script) is in place. The **UI** drifted into tree-everywhere without landing tiles or a filter row. This plan puts the Pages surfaces back, with one product clarification: `/library` is a **transitional entryway** for the user's own material (collections and, later, richer ways to expose and filter it). It must still reach **every** sub-page. Layered drill-in / fancy expose UIs stay out of scope until designed.

## Pages (baseline + clarification)

From `2026-09-16-library-archive-section.md` ## Pages:

- **`/library`**: one chunky tile per top-level folder (label, summary, document count), matching the `joo-keycap-grid` look scaled up to card size. Dark retro theme.
- **Folder, any depth**: breadcrumb, `index.md` intro, inert filter row, `joo-topic-tree` scoped to this folder's children. Dark retro theme.
- **Document**: `joo-document-template` + `joo-breadcrumb-trail` + `joo-paper-sheet`/`joo-prose-content` + `joo-pager`. Breadcrumb and pager stay in the dark chrome. Article body uses `[data-theme='reader']` (or the existing `--sheet-*` reader tokens if that already matches).

**Landing clarification (this session):** `/library` is presentation and jump-in, not the whole library UX. The **full file tree is always available** on library surfaces that browse folders (landing and folder pages). Clicking a tile focuses that section: expand that branch, collapse the others by default. Nested files are still reachable by expanding the tree. Tiles do not hide or replace the tree. Richer expose/filter UI on the landing can grow later; v1 is tiles + full tree with focus-on-click.

**Document:** sheet + pager on the right. The **file tree stays on the left** on every library URL (landing, folder, document). User correction 2026-09-17: removing the tree from the document view was wrong.

Mockup (build step 1) settles layout before code.

## What this means against current code

| Surface | Target | Interim now | Action |
|---|---|---|---|
| `/library` | Chunky tiles **and** full file tree (tile click expands that branch, others collapsed) | Tree + empty prompt, no tiles | Add tiles. Keep tree. Wire tile → expand/focus that collection. |
| Folder | Intro + inert filters + tree of that folder's children | Tree only (empty prompt) | Restore intro + inert filter row. |
| Document | Sheet + pager, **tree still on the left** | Tree + reader (good) then briefly tree removed (bad) | Keep tree beside the reader. |

## Kept from later decisions (do not reopen here)

- **Disk tree (028).** `topics/` stays. Tree nodes are real folders/files. Labels are filename-derived (dashes to spaces, capitalised). No `##`-as-folders.
- **Sync.** `pnpm run content:sync` remains the re-vendor path. Build does not read a sibling repo.
- **Routes.** Literal per-path routes / prerender list (no `UrlMatcher`).
- **R5 fields.** `summary` feeds tiles. `tags` feed the inert filter row (R6). Tree label is not the H1.
- **R6 filter row.** Inert. Chip labels = union of `tags` in that folder, or `##` group labels from that folder's `index.md` while no tags exist. No handler until facets are designed (Open questions on the archive-section plan).
- **index.md.** Folder title/order/summary + optional intro body. Not a rename of `topic-index.md` (that file is a normal document under `learn/`).

## Out of scope

- Layered drill-in / ephemeral-state navigation rule (BACKLOG). Separate plan before any overlay stack.
- Live filtering, full-text file search, hand-curated featured tiles that are not 1:1 with top-level folders (allowed later; v1 tiles = top-level folders).
- Changing collection slug `learn` or section name `library`.

## Build order

1. **Mockup** — `features/design-theme/library-landing.html`, `library-folder.html`, `library-document.html` (or one file with three sections). Landing: tiles + full tree with one branch expanded from the focused collection. Folder: intro + inert filter row + scoped tree. Document: reader theme on the article only. Review before code.
2. **Landing** — `/library`: one tile per `content/library/*` collection (`title`, `summary`, `docCount`) **and** the full library file tree. Tile click navigates to that collection and expands that branch (other top-level branches collapsed by default).
3. **Folder** — breadcrumb, intro from `index.md` when present, inert filter row (R6), tree of that folder’s children only. No document reader on this route.
4. **Document** — back to document-template composition (breadcrumb, sheet, pager). Reader theme on the article slot if not already satisfied by existing `--sheet-*` tokens (archive-section step 6 noted those already matched). Drop layout-owned reader + doc-slot pattern for the document URL.
5. **Cleanup** — remove or narrow interim layout behavior that forced tree+reader on every library URL. Keep shared bits that still serve folder or document. Update `library/CONTEXT.md`, sitemap Pages blurbs, TODO.
6. **Paper trail** — check off TODO planning/build items; leave layered-nav BACKLOG untouched.

## Implementation deviations

- Mockup is one file (`features/design-theme/library.html`) with three switchable surfaces instead of three HTML files.
- File tree is always on the left of the layout (including document URLs). Original Pages “document alone” wording is overridden by product direction: tree stays.
- Landing: tree left, tiles right. Tile opens that collection’s entry document (`topic-index` if present, else first doc), not a bare folder URL.
- Inert filter chips use document `tags` only in v1; empty tag sets hide the row.
- Document breadcrumb is on the layout.
