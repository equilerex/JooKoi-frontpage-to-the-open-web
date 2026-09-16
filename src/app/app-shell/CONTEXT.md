# app-shell/

The frame rendered once around every page: layout, navigation chrome, backdrop, page title strategy, and the not-found page. Nothing here is specific to one feature.

Rules: `_architecture/plans/decisions/005-workspace-location-folders-and-naming.md`. Full map: `_architecture/ARCHITECTURE.md`.

## What belongs here

Something goes in `app-shell/` when it is **rendered once around every page** — placement rule 2. If it's used by two or more features but isn't part of the frame, it belongs in `shared/` instead.

The not-found page lives here rather than in a feature folder because it's the wildcard route target and has no feature of its own.

## The chrome, and the test for it

Three parts are the chrome, and they are the reason this folder exists: `horizon-backdrop/` (the perspective grid floor and horizon glow, the mockup's `body::before`/`::after`, desktop only), `heads-up-display-header/` (the desktop HUD navigation, mockup `.hud`, hidden below 768px) and `mobile-bottom-dock/` (thumb-reach navigation, mockup `.dock`, hidden at 768px and up).

**The chrome test: if a page can exist without it, it is not chrome.** The three above wrap every page, so they qualify. A page template does not — a page uses exactly one — which is why the four templates live in `shared/design-system/page-templates/` instead (ADR 013).

## What exists now

- `home.page.*` — the `''` route target. A minimal placeholder; the real landing page is `launcher-home/` in Phase 3. It exists so static prerendering has a route to render (ADR 004).
- `not-found.page.*` — the `**` wildcard route target. Has a real `<h1>` and a `routerLink="/"` home link, which the reference spec (`src/app/app.component.spec.ts`) drives.
- `app-shell-layout/` — the frame itself: `<joo-horizon-backdrop />`, `<joo-heads-up-display-header />`, `<main id="main-content" class="page">` with the `router-outlet`, then `<joo-mobile-bottom-dock />`, as siblings. The HUD and the dock share one `navItems` array.
- `heads-up-display-header/`, `mobile-bottom-dock/`, `horizon-backdrop/` — the three chrome parts, described above.
- `page-title.strategy.ts` — `PageTitleStrategy`, registered in `app.config.ts`, producing `"<page> · JooKoi"` and the bare site name on a route with no title. The router calls `updateTitle` on every navigation *and* once during prerender, which is why the strategy exists: without it a prerendered page ships `index.html`'s placeholder as its real `<title>`.

## Elevation

One scale, two declarations of it, and they must not drift. `src/styles/design-tokens.css` holds `--z-*` as CSS custom properties; `shared/design-system/theme/elevation.ts` holds the same numbers as `ELEVATION`. PrimeNG's overlay manager is JavaScript-side and cannot read a custom property, so `app.config.ts` feeds it `ELEVATION`. **Change one, change the other.** Two parallel elevation models is the failure ADR 011 exists to prevent.

## Imports

- `app-shell` may import `shared/*`.
- `app-shell` never imports a feature folder (convention only — not lint-enforced).
- Only the three root files import from `app-shell`: `app.config.ts`, `app.routes.ts`, `app.component.ts`. `app.config.ts` is here because it registers the shell's app-wide provider, `PageTitleStrategy` (decision 015).

Enforced by the generated `no-restricted-imports` blocks in `eslint.config.js`.

## Conventions

- `home.page.*` and `not-found.page.*` are page components: flat in this folder, `.page.ts` suffix, `XPage` class, `joo-x-page` selector, referenced only from a routes file. Every other component here gets its own subfolder with a `.component.ts` suffix.
- Generate with `ng g c app-shell/<name>` for a component, or `ng g c app-shell/<name> --type=page --flat --selector=joo-<name>-page` for a page.
- Shell components read semantic CSS tokens only (ADR 007). No raw colours.
