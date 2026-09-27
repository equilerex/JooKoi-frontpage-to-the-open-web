# Decision 005 — Workspace location, folder structure and naming

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

An agent adding a component needs one unambiguous answer to "where does this file go and what is it called", or every session re-invents a layout. The first proposal in the planning session was a generic starter layout with no stores, no domain services and no placement rules, and had to be redone from `sitemap.yaml` and the mockup component inventory. Separately, the product word for the things this app lists — "source" — collides with "source code" as soon as it becomes a folder or class name.

## Options considered

1. Angular's older layer layout: `core/`, `shared/`, `components/`, `services/`, `pages/`.
2. Steyer-style domains, each with `feature` / `ui` / `data` / `util` subfolders, plus a `shared` domain.
3. Feature folders named after the page they serve, with `app-shell/` and `shared/`, and no wrapper folders — grouping by feature, splitting only where the placement rules say to.

For boundary enforcement: Sheriff (`@softarc/sheriff-core`), `eslint-plugin-boundaries`, or ESLint's built-in `no-restricted-imports`.

## Decision

Option 3, with the workspace at the **repo root** next to `sources/`, `data/`, `scripts/`, `features/` and `.agents/`. One app, so no Nx and no monorepo.

- **Organising rule** (angular.dev style guide): group by feature or theme, never by code type. There are no `components/`, `pages/`, `services/` or `stores/` folders anywhere. A component's `.ts`, `.html`, `.css` and `.spec.ts` sit together.
- **Top level of `src/app/`:** `app-shell/` (the frame), `shared/` (used by more than one feature), one folder per feature named after its page. No `features/` wrapper.
- **Domain vocabulary:** the things this app lists and links to are **curated websites**. Code never uses the bare word "source" for them. Model `CuratedWebsite`, folder `curated-websites/`, components `website-*`.
- **Page components are their own file type.** `.page.ts` / `XPage` / `joo-x-page`, flat in the root of its feature folder, referenced only from `*.routes.ts`, and the only kind of component allowed to inject a store. Normal components are `.component.ts` / `XComponent` / `joo-x`, each in its own subfolder, taking `input()` and emitting `output()`. Seeing a `.page.ts` tells you it's a route target without opening it. This is a guidelines convention, not a lint rule.
- **Type suffixes are kept**, restored through a `schematics` block in `angular.json` so `ng generate` produces them (the suffixless style is a v20+ CLI default, not a style-guide rule). Full naming table in `_architecture/ARCHITECTURE.md`.
- **Names stay semantic and spelled out.** No acronyms, no `utils.ts`, `helpers.ts` or `common.ts`. `shared/` is the one folder with a general name, and everything inside it names what it is.
- **Placement rules**, first match wins: one feature uses it → that feature's folder; rendered once around every page → `app-shell/`; two or more consumers and it knows about curated websites → `shared/curated-websites/`; anyone could use it and it knows nothing about websites, routes or app state → `shared/design-system/`; app-wide behaviour rather than something you see → its own folder in `shared/`.
- **Promote on the second consumer.** Code moves up a level when a second user appears, not before, in the same change that adds that second user. No `<feature>-shared` folders.
- **Allowed import directions.** `shared/design-system` imports nothing from the app. Other `shared/*` folders may import `shared/design-system` but not each other unless this ADR is updated. A feature may import `shared/*`, never another feature — cross-links go through router paths. `app-shell` may import `shared/*`; only the root files `app.config.ts`, `app.routes.ts` and `app.component.ts` import `app-shell` (decision 015 added `app.config.ts` to the original two, so it can register the shell's app-wide providers).
- **Enforcement without a new dependency:** ESLint's built-in `no-restricted-imports`, configured in `eslint.config.js`, which reads the `src/app/` folder list with `node:fs` at lint time and generates one override block per feature. A new feature folder is covered automatically.

The full target folder map, the page-vs-component table and the naming table live in `_architecture/ARCHITECTURE.md`; this ADR is the rule, that file is the reference.

## Why not the alternatives

Option 1 groups by code type, which the current angular.dev style guide advises against, and it scatters one feature across four folders. Option 2's per-domain `feature`/`ui`/`data`/`util` split is the right idea at a scale this app doesn't have — one app, a handful of pages, one domain — and it would add three folder levels before any of them holds more than one file.

Sheriff and `eslint-plugin-boundaries` both do the boundary job well for bigger apps, but they're extra dependencies for rules that `no-restricted-imports` expresses in about thirty generated lines. Per decision 003's dependency rule, they're only worth adding if the generated rules stop being readable.

The mockup folder `features/design-theme/` stays at the repo root as reference until Phase 2. There is no `src/app/features/`, so there's no name collision.

## Next step

The vocabulary fix stops at the app boundary. `sitemap.yaml` still says `source_detail` and `/source/:id`, and the repo has a `sources/` data folder and a `source-ingest` skill. Renaming the route and the repo folders is a product call, logged in `_architecture/BACKLOG.md`. Whether `curated-websites/` should be a top-level folder rather than sitting under `shared/` is logged there too.
