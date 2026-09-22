# library-layered-drill-in

Session: 2026-09-18. Status: MVP implemented (ADR 031). Document VT deferred (Location desync). Proves the project-wide rule on library first.

## Product call (this session)

- **MVP:** Document opens as a **visual overlay layer** over the browse surface (landing/folder), not a hard swap that throws away ephemeral UI.
- **Geometry:** **Right pane only** — persistent file tree stays. Mobile: layer is full width of the content column (tree still available per existing library layout rules).
- **URL:** unchanged shape `/library/...` (doc path is still the shareable URL). Back = browser history.
- **Out of this MVP:** rich filter query params, `navigateDrill` helper suite, `RouteReuseStrategy`, search/browse drill-in, covering the tree with the reader.

## Context

BACKLOG items to merge/close when this ships:

- Layered drill-in navigation with retained ephemeral state
- Library layered drill-in navigation + state

Already present: persistent tree on `LibraryLayoutPage`, `withViewTransitions`, shell wide column, motion tokens, `?expand=` fan-out, document pending-without-wipe.

Gap: child `router-outlet` **replaces** folder with document, so browse UI is destroyed; tree expand/scroll are rebuilt or lost; motion is a cross-fade of the whole pane, not a forward stack layer.

Standing preference (memory / BACKLOG): shareable state in URL; ephemeral UI in a layout- or route-scoped store; drill-in is a layer with enter/leave motion; not Compose/Ionic.

## Architecture

### 1. Decision (ADR)

New decision: **Layered drill-in is the project navigation rule; library is the first proof.**

- Shareable: URL (path + query).
- Ephemeral (tree scroll, filter-box text, local toggles): layout-scoped store on the library layout route `providers`.
- Document: visual layer over browse underlay in the **right pane**.
- Back: `History.back` / browser chrome; breadcrumbs jump to ancestor URLs (may differ from Back after cross-links — document that).
- Explicitly defer: aux named outlets, global RouteReuseStrategy, app-wide helpers until second consumer (search).

### 2. Layout structure

`library-layout.page` right pane becomes:

```text
.library-body
  ├── .library-browse-underlay   (folder/landing for parent context; visible under / dimmed when reading)
  └── .library-reader-layer      (router-outlet host when URL is a document; positioned over underlay)
```

When URL is folder/landing: underlay hidden or unused; outlet fills the pane as today (folder page only).

When URL is document:

- Underlay shows **parent folder** browse (collection landing or folder intro) — presentational component fed by `libraryPath` parent, **not** a second router navigation.
- Outlet still loads `LibraryDocumentPage` inside `.library-reader-layer`.
- Layer uses `--duration-route` enter/leave (slide/fade per motion recipes). Prefer CSS + optional VT name `library-reader` so the tree/`library-tree` stay inert.

Detection: layout already knows `libraryPath` from URL; `findLibraryDoc(path)` ⇒ document mode.

### 3. Ephemeral store (first SignalStore)

`library-layout.store.ts` provided on the library layout route:

| State                             | Persist across doc drill-in               | Source of truth                 |
| --------------------------------- | ----------------------------------------- | ------------------------------- |
| Tree scrollTop                    | yes                                       | store                           |
| Tree filter string                | yes                                       | store (UI only; not URL in MVP) |
| Expanded keys override (optional) | yes if we stop full rebuild wiping scroll | store + sync with `?expand=`    |

Rules (engineering-guidelines): only the layout **page** injects the store; no `effect` for syncing; methods patch state. Tree component gets scroll/filter via inputs/outputs from the layout.

`?expand=` remains shareable fan-out from landing tiles (URL). Store does not replace it; it preserves scroll/filter while the child route flips.

### 4. Motion

- Enter doc: reader layer in (`--duration-route`); underlay stays, maybe opacity dim (`--duration-state`).
- Leave doc (Back to folder): layer out, underlay full strength.
- Respect `prefers-reduced-motion`.
- Do not invent new duration tokens.
- `ux:smoke`: add scenarios — open doc still has underlay/tree; Back restores filter text if set; no forbidden wipe; CLS budget.

### 5. Back vs breadcrumb

- **Back:** browser history (restores previous URL + store still holds ephemeral UI because layout route stayed alive).
- **Breadcrumb ancestor click:** `router.navigate` to that folder URL (forward entry); store keeps ephemeral UI.
- Cross-link from outside into a doc: no underlay history stack magic; underlay = parent folder of that doc.

### 6. Explicit non-goals (MVP)

- Named auxiliary outlets / different URL scheme
- Query-param filter chips + `replaceUrl` policy (rich filter panel BACKLOG)
- `navigateDrill` / `navigateSibling` / `navigateCross` helpers (add when search is second consumer)
- Selective `RouteReuseStrategy`
- Replacing view transitions entirely (can coexist; reader layer owns the stack feel)

## Build order

1. **ADR** `031` (or next free) — project-wide layered drill-in rule; library proof.
2. **Plan file** `_architecture/plans/2026-09-18-library-layered-drill-in.md` — this content.
3. **`LibraryLayoutStore`** on layout route providers; wire tree filter + scroll preserve.
4. **Underlay + reader layer** markup/CSS in `library-layout`; document page stays the routed child.
5. **Folder underlay component** (presentational) — parent path → title/intro/tiles as appropriate.
6. **Motion** for layer enter/leave; dim underlay.
7. **`ux:smoke`** scenarios for drill-in/Back/filter preserve.
8. **Paper trail** — TODO checkoff; merge/close the two BACKLOG drill-in entries; CONTEXT updates; AGENTS pointer if the rule belongs in engineering-guidelines (short paragraph + link to ADR).

## Success criteria

- Open a doc from landing/tile/tree: tree remains; right pane shows layered reader over browse underlay; URL is the doc path.
- Back to `/library` or parent folder: filter text and tree scroll restored; no full tree remount flash if avoidable.
- Breadcrumbs still work.
- `pnpm run ux:smoke` green with new scenarios.
- Search/browse unchanged; second consumer can adopt the ADR later.

## Risks

- Underlay duplicating folder page logic → keep underlay thin (inputs from `findLibraryFolder` / entry tiles only).
- Double scroll containers (underlay + overlay) → overlay owns scroll; underlay `overflow: hidden` when covered.
- VT + overlay CSS fighting → prefer one motion system for the reader layer; keep pane VT for folder↔folder if needed.
- Layout store vs tree rebuild on every URL change → stop rebuilding nodes when only ephemeral UI should change; expand from URL/`?expand=` as now, scroll from store after render.

## Implementation deviations

- Shell View Transitions re-enabled for Home ↔ Search ↔ Library (`app-main` / `app-chrome` / `app-dock`). VT still **skipped** for library-internal navigations (reader CSS). Earlier full disable was only to stop Location desync.
- Tree filter UI is layout `joo-console-input` bound to `LibraryLayoutStore`; PrimeNG filter field hidden, API still applied from `filterText`.
- Collection tiles use `Router.navigate` (button keycaps), not raw `href`, so drill-in does not remount the layout store.
