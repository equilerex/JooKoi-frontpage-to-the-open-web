# app-shell/

The frame rendered once around every page: layout, navigation chrome, backdrop, page title strategy, and the not-found page. Nothing here is specific to one feature.

Rules: `_architecture/plans/decisions/005-workspace-location-folders-and-naming.md`. Full map: `_architecture/ARCHITECTURE.md`.

## What belongs here

Something goes in `app-shell/` when it is **rendered once around every page** — placement rule 2. If it's used by two or more features but isn't part of the frame, it belongs in `shared/` instead.

The not-found page lives here rather than in a feature folder because it's the wildcard route target and has no feature of its own.

## What exists now

- `home.page.*` — the `''` route target. A minimal placeholder; the real landing page is `launcher-home/` in Phase 3. It exists so static prerendering has a route to render (ADR 004).
- `not-found.page.*` — the `**` wildcard route target. Has a real `<h1>` and a `routerLink="/"` home link, which the reference spec (`src/app/app.component.spec.ts`) drives.
- `app-shell-layout/` — the frame itself: `<joo-horizon-backdrop />`, `<joo-heads-up-display-header />`, `<main id="main-content" class="page">` with the `router-outlet`, then `<joo-mobile-bottom-dock />`, as siblings.
- `heads-up-display-header/` — desktop HUD navigation, the mockup's `.hud`. Hidden below 768px.
- `mobile-bottom-dock/` — thumb-reach navigation below 768px, the mockup's `.dock`. Hidden at 768px and up.
- `horizon-backdrop/` — the perspective grid floor and horizon glow, desktop only.
- `page-title.strategy.ts` — `PageTitleStrategy`, registered in `app.config.ts`, producing `"<page> · JooKoi"`.

## Imports

- `app-shell` may import `shared/*`.
- `app-shell` never imports a feature folder (convention only — not lint-enforced).
- Only the three root files import from `app-shell`: `app.config.ts`, `app.routes.ts`, `app.component.ts`. `app.config.ts` is here because it registers the shell's app-wide provider, `PageTitleStrategy` (decision 015).

Enforced by the generated `no-restricted-imports` blocks in `eslint.config.js`.

## Conventions

- `home.page.*` and `not-found.page.*` are page components: flat in this folder, `.page.ts` suffix, `XPage` class, `joo-x-page` selector, referenced only from a routes file. Every other component here gets its own subfolder with a `.component.ts` suffix.
- Generate with `ng g c app-shell/<name>` for a component, or `ng g c app-shell/<name> --type=page --flat --selector=joo-<name>-page` for a page.
- Shell components read semantic CSS tokens only (ADR 007). No raw colours.
