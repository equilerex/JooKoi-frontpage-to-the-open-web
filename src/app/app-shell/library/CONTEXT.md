# CONTEXT — library

updated: 2026-09-18

## What this is

`/library`: persistent **file tree on the left**, layered content on the right (decision 031). Landing/folder fill the pane; a **document** opens as a reader layer over a browse underlay (parent folder), tree stays. `LibraryLayoutStore` (layout route providers) keeps tree scroll + filter text across drill-in. Opening a tile goes to that collection’s entry doc with `?expand=<collectionPath>`. Default child order: files A–Z, then subfolders A–Z. Document prose base is `0.8rem`. Crash-course path is `ai-tooling-crash-course-for-developers` (029). Entry doc is `README.md` (030). Shell `page--wide` for `/library`.

## Why it's built this way

Tree on the layout so every library URL keeps folder navigation. The right pane (`.library-body`) directly houses `<router-outlet />`. Document-to-document and folder-to-folder navigations are preserved in-place by `LibraryRouteReuseStrategy` (registered in `app.config.ts`), which checks `data.kind`. This allows `LibraryDocumentPage` to stay mounted and smoothly update its content via reactive signals and `linkedSignal` stale-while-revalidate without host remounts or DOM teardown. The ghost browse-underlay and CSS grid 1/1 hacks (formerly ADR 031) were dismantled. Filter text and tree scroll live in `LibraryLayoutStore`. Visible filter is `joo-console-input` on the layout. Shell VT is for Home/Search/Library only; library-internal skips VT.

## Gotchas

`index.md` is folder meta (survives sync). `README.md` is the entry document the crash-course tile opens (source still has `topic-index.md`; sync maps it to `README.md` and skips the source repo README). After crash-course edits: `pnpm run content:sync`. While a filter is active the tree renders node copies — folder expand toggles must use `Tree.getRootNode()`, not the raw `nodes` input. `?expand=` is kept on in-tree navigations that stay under that folder; dropped when you leave it. Old `/library/learn/...`, `/learn`, and `…/topic-index` URLs redirect into the real paths. Document `resource` uses TransferState `id: 'library-doc-html'` and keeps last HTML while loading — never swap painted content for a slower "Loading document" label. Sheet keeps `min-height` / empty slot so an empty load does not collapse `joo-paper-sheet`.

## Don't

Don't remove the tree from document views. Don't invent `##` folders. Don't read a sibling path from `pnpm build`.

**Designed docs (decision 040).** A `foo.html` beside `foo.md` in `content/library/` replaces the rendered body; doc meta carries `custom: true` and the page renders it through `bypassSecurityTrustHtml` (own `<style>`, inline SVG allowed; repo-authored only). `content:sync` only copies `.md`, so html survives. Pin `<!-- md-sha: xxxxxxxx -->` = first 8 hex of sha1 of the md; `pnpm run content` warns `STALE designed html` when it differs. Art goes in `public/library-art/`, referenced without a leading slash.

Plain md docs get `.is-plain` styling (src/styles.css) and a generated banner img from `bannerHtml()` in the build script. Designed html docs skip both.

Sidecars next to a doc: `foo.top.html` (prepended), `foo.figs.html` (figures after named headings). Folder `index.md` `reading-order` drives tree and pager order. Hand-toggled folder state lives in `LibraryLayoutStore.folderOpen`. See decision 040 addendum.
