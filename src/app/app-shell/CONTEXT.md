# app-shell/

The frame rendered once around every page: layout, navigation chrome, backdrop, page title strategy, and the not-found page. Nothing here is specific to one feature.

Rules: `_architecture/plans/decisions/005-workspace-location-folders-and-naming.md`. Full map: `_architecture/ARCHITECTURE.md`.

## What belongs here

Something goes in `app-shell/` when it is **rendered once around every page** — placement rule 2. If it's used by two or more features but isn't part of the frame, it belongs in `shared/` instead.

The not-found page lives here rather than in a feature folder because it's the wildcard route target and has no feature of its own.

## What exists now

- `home.page.*` — the `''` route target. A minimal placeholder; the real landing page is `launcher-home/` in Phase 3. It exists so static prerendering has a route to render (ADR 004).
- `not-found.page.*` — the `**` wildcard route target. Has a real `<h1>` and a `routerLink="/"` home link, which the reference spec (`src/app/app.component.spec.ts`) drives.
- `app-shell-layout/` — currently just a `<router-outlet>` wrapper.

## What is planned (Phase 2)

From the folder map, not built yet:

- `heads-up-display-header/` — desktop HUD navigation, the mockups' `.hud`.
- `mobile-bottom-dock/` — thumb-reach navigation below 768px, the mockups' `.dock`.
- `horizon-backdrop/` — perspective grid, desktop only.
- `page-title.strategy.ts` — a `TitleStrategy` producing `"<page> · JooKoi"`.

These wait for the design system (Phase 2) because they're the most heavily styled parts of the app and they consume `shared/design-system/` components.

## Imports

- `app-shell` may import `shared/*`.
- `app-shell` never imports a feature folder.
- Only `app.routes.ts` and `app.component.ts` import from `app-shell`.

Enforced by the generated `no-restricted-imports` blocks in `eslint.config.js`.

## Conventions

- `home.page.*` and `not-found.page.*` are page components: flat in this folder, `.page.ts` suffix, `XPage` class, `joo-x-page` selector, referenced only from a routes file. Every other component here gets its own subfolder with a `.component.ts` suffix.
- Generate with `ng g c app-shell/<name>` for a component, or `ng g c app-shell/<name> --type=page --flat --selector=joo-<name>-page` for a page.
- Shell components read semantic CSS tokens only (ADR 007). No raw colours.
