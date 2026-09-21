# CONTEXT — library
updated: 2026-09-18

## What this is

`/library`: persistent **file tree on the left**, layered content on the right (decision 031). Landing/folder fill the pane; a **document** opens as a reader layer over a browse underlay (parent folder), tree stays. `LibraryLayoutStore` (layout route providers) keeps tree scroll + filter text across drill-in. Opening a tile goes to that collection’s entry doc with `?expand=<collectionPath>`. Default child order: files A–Z, then subfolders A–Z. Document prose base is `0.8rem`. Crash-course path is `ai-tooling-crash-course-for-developers` (029). Entry doc is `README.md` (030). Shell `page--wide` for `/library`.

## Why it's built this way

Tree on the layout so every library URL keeps folder navigation. Document drill-in stacks a reader layer in a CSS grid cell (ADR 031); the browse underlay is invisible sizing-only so folder intro copy does not show through. Filter text and tree scroll live in `LibraryLayoutStore`. Visible filter is `joo-console-input` on the layout. Sheet uses width 100% + min-height and stays opaque while loading (pending dims prose only) so doc↔doc does not flash the dark panel through white paper. Reader layer background is sheet-tone. Shell VT is for Home/Search/Library only; library-internal skips VT.

## Gotchas

`index.md` is folder meta (survives sync). `README.md` is the entry document the crash-course tile opens (source still has `topic-index.md`; sync maps it to `README.md` and skips the source repo README). After crash-course edits: `pnpm run content:sync`. While a filter is active the tree renders node copies — folder expand toggles must use `Tree.getRootNode()`, not the raw `nodes` input. `?expand=` is kept on in-tree navigations that stay under that folder; dropped when you leave it. Old `/library/learn/...`, `/learn`, and `…/topic-index` URLs redirect into the real paths. Document `resource` uses TransferState `id: 'library-doc-html'` and keeps last HTML while loading — never swap painted content for a slower "Loading document" label. Sheet keeps `min-height` / empty slot so an empty load does not collapse `joo-paper-sheet`.

## Don't

Don't remove the tree from document views. Don't invent `##` folders. Don't read a sibling path from `pnpm build`.
