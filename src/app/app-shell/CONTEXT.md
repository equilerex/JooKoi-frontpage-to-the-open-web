# app-shell/

The frame rendered once around every page: layout, navigation chrome, backdrop, page title strategy, and the not-found page. Nothing here is specific to one feature.

Rules: `_architecture/plans/decision-history/005-workspace-location-folders-and-naming.md`. Full map: `_architecture/ARCHITECTURE.md`.

## What belongs here

Something goes in `app-shell/` when it is **rendered once around every page** — placement rule 2. If it's used by two or more features but isn't part of the frame, it belongs in `shared/` instead.

The not-found page lives here rather than in a feature folder because it's the wildcard route target and has no feature of its own.

## The chrome, and the test for it

Two parts are the chrome, and they are the reason this folder exists: `horizon-backdrop/` (the perspective grid floor and horizon glow, the mockup's `body::before`/`::after`, desktop only) and `heads-up-display-header/` (the HUD navigation, mockup `.hud`). Below 768px the header hides `.hud__nav` and a menu button opens a bottom sheet with the same items.

**The chrome test: if a page can exist without it, it is not chrome.** The two above wrap every page, so they qualify. A page template does not — a page uses exactly one — which is why the four templates live in `shared/design-system/page-templates/` instead (ADR 013).

## What exists now

- `home.page.*` — the `''` route target and the real landing page (hero logotype with the slogan "Browse your neighbourhood" (no eyebrow; "Front page to the" lives in the header), quick keys, Wire panel, highlights grid, tag browser, and a bottom "Why this exists" panel linking to `/about`). The Wire list has a max height and reveals 20 more articles each time it scrolls near its end (it only reveals what the build compiled). When the follow list matches no compiled article the Wire shows everything with a notice and a Clear my follow list button (the follow list is read from localStorage after first render, so without this the prerendered list vanished on load). There is no scope selector on the console. A lazy route (`loadComponent`, decision 032), so its `record-grid` and source data stay out of `main`. `app-shell-layout` fills its `N src online` status text after first render for the same reason.
- `search.page.*` — the `/search` route target (`DirectoryBrowseTemplate`, dual input (`kw` filters rows, `q` goes into each row's outbound link, Open 5 opens the first five), two-layer funnel (category chips in themed columns, multi-select; collapsible, bracketed type layer in themed columns via `type-groups.ts`, limited to the selected categories, opened with a `joo-hardware-key`), source record-grid). Holds filter state in writable signals initialized from query params, and updates URL memory via `Location.replaceState()` to prevent router navigation, scroll-to-top resets, and View Transition churn (ADR 035). Results table rows animate enter/leave via compositor-safe opacity transitions tracked by `rowKey="id"` and protected by keyword input debouncing (ADR 036). Below 1024px the Signals/Region/Language rack is a `joo-filter-drawer` opened from the shared `.edge-handle` (same handle the library uses), rendered from one `ng-template` with an id suffix so the two copies never share ids; on phones (<768px) a Categories key folds the category chips (`categoriesOpen`).
- `about.page.*` — the `/about` route target: static prose on how the site works and what it is not (the why lives in the home bottom panel), prerendered, linked from that panel and the footer.
- `not-found.page.*` — the `**` wildcard route target. Has a real `<h1>` and a `routerLink="/"` home link, which the reference spec (`src/app/app.component.spec.ts`) drives.

- `app-shell-layout/` — the frame itself: `<joo-horizon-backdrop />`, `<joo-heads-up-display-header />`, `<main id="main-content" class="page">` with the `router-outlet`, as siblings. The HUD carries Home, Search, Library and Tools, and the HUD brand has a tiny "Front page to the" eyebrow above the logotype (hidden below 768px with the wordmark). The footer links to the component playground (`/specimen`) in dev mode only, since that route is not registered in production.
- `heads-up-display-header/`, `horizon-backdrop/` — the chrome parts, described above.
- `tools/` — `/tools` index and `/tools/markdown`, a local split preview. Print PDF uses the browser print dialog. Both routes are lazy. `marked` and `mermaid` load only with the markdown page.
- `page-title.strategy.ts` — `PageTitleStrategy`, registered in `app.config.ts`, producing `"<page> · JooKoi"` and the bare site name on a route with no title. The router calls `updateTitle` on every navigation _and_ once during prerender, which is why the strategy exists: without it a prerendered page ships `index.html`'s placeholder as its real `<title>`.

## Elevation

One scale, two declarations of it, and they must not drift. `src/styles/design-tokens.css` holds `--z-*` as CSS custom properties; `shared/design-system/theme/elevation.ts` holds the same numbers as `ELEVATION`. PrimeNG's overlay manager is JavaScript-side and cannot read a custom property, so `app.config.ts` feeds it `ELEVATION`. **Change one, change the other.** Two parallel elevation models is the failure ADR 011 exists to prevent.

## Imports

- `app-shell` may import `shared/*`.
- `app-shell` never imports a feature folder (convention only — not lint-enforced).
- Only the three root files import from `app-shell`: `app.config.ts`, `app.routes.ts`, `app.component.ts`. `app.config.ts` is here because it registers the shell's app-wide provider, `PageTitleStrategy` (decision 015).

Enforced by the generated `no-restricted-imports` blocks in `eslint.config.js`.

## Conventions

- `home.page.*`, `search.page.*`, and `not-found.page.*` are page components: flat in this folder, `.page.ts` suffix, `XPage` class, `joo-x-page` selector, referenced only from a routes file. Every other component here gets its own subfolder with a `.component.ts` suffix.

- Generate with `ng g c app-shell/<name>` for a component, or `ng g c app-shell/<name> --type=page --flat --selector=joo-<name>-page` for a page.
- Shell components read semantic CSS tokens only (ADR 007). No raw colours.
