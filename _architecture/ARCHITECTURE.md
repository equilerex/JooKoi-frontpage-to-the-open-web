# Architecture

JooKoi: Front Page to the Open Web — an Angular 22 single-page app, prerendered to static files, that lists and links out to curated websites. This file is the structural reference: where code goes, what it's called, how it imports, and where state lives. The reasoning behind each rule is in `_architecture/plans/decisions/003-*` through `015-*`; the Phase 1 planning session is `_architecture/plans/2026-09-15-angular-foundation-phase-1.md` and the Phase 2 one is `_architecture/plans/2026-09-15-angular-design-system-phase-2.md`.

Phase 1 (foundation), Phase 2 (design system) and Phase 3 (content and features) are all built — see the last section for what Phase 3 added.

## Stack

| Piece                  | Choice                                                   | ADR      |
| ---------------------- | -------------------------------------------------------- | -------- |
| Framework              | Angular 22.1, zoneless, standalone, strict               | 003      |
| Node / package manager | Node 24 (`.nvmrc`, `engines`), pnpm (`packageManager`)   | 003      |
| TypeScript             | `~6.0.3`                                                 | 003      |
| Rendering              | Static prerendering, `outputMode: static`, no server     | 004      |
| Component behaviour    | Angular Aria + CDK; PrimeNG 22.1.1 styled, custom preset | 006, 011 |
| Styles                 | Plain CSS, explicit cascade layers, custom properties    | 007      |
| Tests                  | Vitest browser mode (Playwright/Chromium), `~4.1.11`     | 008      |
| State                  | Plain signals + `@ngrx/signals` `~22.0.1`                | 010      |
| Lint / format          | `angular-eslint` + Prettier + `eslint-config-prettier`   | —        |
| Import boundaries      | generated `no-restricted-imports` rules                  | 005      |
| CI                     | GitHub Actions `ci.yml` (Lighthouse step non-blocking)   | 009, 033 |
| Hosting                | GitHub Pages via GitHub Actions (`ci.yml` deploy job)    | 034      |
| Motion / Animation     | Native CSS transitions (no `@angular/animations`, ADR 035)| 035      |


The workspace sits at the **repo root**, next to `sources/`, `data/`, `scripts/`, `features/` and `.agents/`. It's a single app — no Nx, no monorepo (ADR 005).

## Domain vocabulary

The things this app lists and links out to are **curated websites**. Code never uses the bare word "source" for them, because in an engineering context it reads as source code — with one named exception.

- Folder: `curated-websites/`. Components (planned): `website-*`.
- **Data model is `Source`, not `CuratedWebsite`** (ADR 026): `source.model.ts`, `source-fixture.ts`, `source-search.ts`. A narrow, dated exception from the Phase 3 plan's data-model section, not a reversion of the rule — the store, service and components this folder eventually gets still follow `CuratedWebsite`/`website-*`.
- The word "source" is still correct for `sources/` (human-authored input data) and the `source-ingest` skill. Those are outside `src/app/` and keep their names for now.
- `sitemap.yaml` still says `source_detail` and `/source/:id`. Renaming the public route is a product call, logged in `BACKLOG.md`.

## Rendering

Static prerendering with no server (ADR 004). `ng build` emits prerendered HTML per route plus a client bundle, and no `server.mjs`.

- Render mode per route is declared in `src/app/app.routes.server.ts`.
- Parameterised routes (`website-detail`) will use `getPrerenderParams` fed from build-time data, with `PrerenderFallback.Client`.
- Search stays client-rendered.
- The theme attribute `data-theme="retro"` is written statically into `index.html` so prerendered HTML has no theme flash.
- `scripts/serve-static-build.mjs` (Node built-ins only) serves `dist/jookoi-frontpage/browser` locally via `pnpm run serve:static-build`. A prerendered route resolves to `<route>/index.html`, and text files are brotli-compressed when the client accepts it (as a static host does, decision 033). For an unmatched path it serves the CSR fallback page rather than a literal HTTP 404 — the `**` wildcard route needs the Angular app to mount before it can show the not-found page.

## Folder map

This is the **target** map for the app described in `_architecture/sitemap.yaml`. Parked areas are shown only to prove they have a home — they are not created.

> **What actually exists after Phase 3 + the library-archive section:** `app.routes.ts` has: `''` → `HomePage`, `search` → `SearchPage`, `learn` and `learn/:topic` → redirects into `/library/...` (D8), `library` → `libraryRoutes` (`app-shell/library/`, one literal `Route` per known path, generated — no `:param`), `specimen` → the dev-only parts kit (dev mode only), `**` → `NotFoundPage`. Home and search live flat in `app-shell/` (`home.page.*`, `search.page.*`) alongside the three chrome components, `app-shell-layout/` and `page-title.strategy.ts`; the library pages live in `app-shell/library/` — Phase 3 did not create the `launcher-home/`, `website-search/` or `learning/` feature folders this map originally planned (deviation from this map, not from D2's page scope). `browse` and `source_detail` are still unbuilt (D2), so `category-browse/` and `website-detail/` below stay illustrative. `shared/curated-websites/` holds `source.model.ts`, `source-fixture.ts` and `source-search.ts` (+ spec) — a hand-written fixture and pure search functions (ADR 017, 026); the store, service and components under "Planned contents" are still unbuilt. `shared/library-content/` holds the generated content index plus one generated file per document, all committed (ADR 027), built by `scripts/build-library-content.mjs` from `content/library/` — run by `pnpm run build` and by hand via `pnpm run content`, not by `start`/`watch`. `shared/design-system/` holds ten folders — nine component sub-groups and `theme/` — listed below, including Phase 3's two additions, `data-display/chip/` and `data-display/topic-tree/`. `src/styles/` holds `cascade-layers.css`, `design-tokens.css`, `base-element-styles.css` and `fonts.css`, and `public/fonts/` holds the eleven self-hosted woff2 files. `src/styles.css` holds the global rules that cannot be encapsulated.

```
src/
  main.ts  main.server.ts  index.html
  app/
    app.component.ts  app.config.ts  app.config.server.ts
    app.routes.ts                       # one lazy entry per feature, nothing else
    app.routes.server.ts                # render mode per route (ADR 004)

    app-shell/                          # the frame rendered once around every page, plus the pages themselves
      not-found.page.*                  #   wildcard route target
      home.page.*                       #   '' route target — live search console, quick keys
      search.page.*                     #   /search?q= route target — filter rack, sort, results
      library/                          #   /library section (library-archive-section plan) — literal routes
        library-layout.page.*           #     breadcrumb + left file tree + outlet
        library-folder.page.*           #     landing tiles / folder intro+filters (right pane)
        library-document.page.*         #     document sheet + pager (right pane)
        library-tree.ts                 #     tree builders + entry-doc helper
        library.routes.ts               #     layout parent, one literal child Route per path
      app-shell-layout/                 #   backdrop + header + <router-outlet> + dock
      heads-up-display-header/          #   desktop HUD navigation (.hud)
      mobile-bottom-dock/               #   thumb-reach navigation below 768px (.dock)
      horizon-backdrop/                 #   perspective grid, desktop only
      page-title.strategy.ts            #   TitleStrategy: "<page> · JooKoi"

    specimen/                           # dev-only parts kit at /specimen (ADR 004)
      specimen.page.*                   #   the index: one section per component
      specimen-section/                 #   the labelled frame each section uses
      specimen.routes.ts                #   index + one sibling route per page template
      template-demos/                   #   a demo page per page template

    shared/                             # used by two or more features, or by shell + a feature
      design-system/                    #   domain-agnostic visual building blocks (ADR 005, 012)
        theme/                          #     elevation.ts (ELEVATION), jookoi-preset.ts (definePreset)
        typography/                     #     logotype/, eyebrow-label/, stripe-rule/
        indicators/                     #     status-light/ (.led), bezel-jewel/, segment-readout/ (.readout),
                                        #     classification-badge/ (.trust, .sig)
        actions/                        #     hardware-key/ (.key), keycap/ (.keycap), keycap-grid/ (.keygrid)
        form-controls/                  #     console-input/ (.console), stompbox-toggle/ (.toggle),
                                        #     segment-selector/ (.segment), chrome-select/ (PrimeNG), field-label/
        surfaces/                       #     readout-panel/ (.panel), paper-sheet/ (.sheet), corner-brackets/,
                                        #     filter-drawer/ (PrimeNG)
        navigation/                     #     breadcrumb-trail/, indicator-nav-list/ (.navlist), pager/ (.pager)
        data-display/                   #     record-grid/ (plain table, cell-template API), tag-set/ (.chips),
                                        #     capability-tag/, count-chip/, spec-list/ (.spec), prose-content/,
                                        #     chip/ (.chip), topic-tree/ (PrimeNG p-tree)
        page-layouts/                   #     toolbar-row/
        page-templates/                 #     console-landing-template/, directory-browse-template/,
                                        #     record-detail-template/, document-template/ (ADR 013)

      curated-websites/                 #   the domain: the websites this app lists and links out to
        source.model.ts                 #     Source type — exception to CuratedWebsite naming (ADR 026)
        source-fixture.ts               #     hand-written fixture, ~50-60 records (ADR 017)
        source-search.ts  source-search.spec.ts  #  pure ranked-search module, no Angular imports
        # store, service and components below are still unbuilt — see "Planned contents"
        # and src/app/shared/curated-websites/CONTEXT.md

      library-content/                  #   generated content data, committed (ADR 027)
        library-index.generated.ts      #     small: folder tree + per-doc metadata, no HTML
        library-lookup.ts               #     hand-written Map lookups over the generated data
        docs/*.generated.ts             #     one file per document, HTML only — lazy-loaded per route

      keyboard-shortcuts/               #   global hotkey registry (HUD keycaps), used by shell + features
      # parked: browser-storage/ (local-only persistence), local-preferences/ (personal homepage settings)

    # home (/) and search (/search?q=) are built, but as pages flat in app-shell/ above, not
    # as their own feature folders — this map's launcher-home/ and website-search/ folders
    # were never created (see the callout above). /learn now redirects into app-shell/library/.

    category-browse/                    # /browse/:category?  — still parked (D2)
      category-browse.routes.ts
      category-browse.page.*
      category-tree-navigation/  related-category-links/

    website-detail/                     # /source/:id in the current sitemap — still parked (D2)
      website-detail.routes.ts
      website-detail.page.*
      website-detail-prerender-parameters.ts
      website-specification-sheet/  related-website-list/

    # parked features, same level: collection-view/, graph-explore/, federated-search/,
    #   local-utilities/ (/tools), directory-stewardship/ (/health, /contribute, /export),
    #   personal-homepage/

  styles/
    cascade-layers.css  design-tokens.css  base-element-styles.css  fonts.css
  styles.css                            # global rules that cannot be encapsulated (ADR 014)
public/fonts/                           # eleven self-hosted woff2 files
content/library/<collection>/           # markdown per collection; crash course is vendored as ai-tooling-crash-course-for-developers (ADR 021/028/029)
scripts/build-library-content.mjs       # reads content/library/, emits the committed generated modules (ADR 027)
```

`.page.*` means `.page.ts`, `.page.html`, `.page.css` and `.page.spec.ts`. Every normal component has its own folder, so a feature folder's root holds only the page, its routes file, and feature-local stores or functions.

**Organising rule** (angular.dev style guide, ADR 005): group by feature or theme, never by code type. There are no `components/`, `pages/`, `services/` or `stores/` folders anywhere. A component's `.ts`, `.html`, `.css` and `.spec.ts` sit together.

## Page components vs normal components

|                   | Page component                                                                                      | Normal component                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Purpose           | Rendered by a route. Reads route params, injects stores, arranges child components                  | Presentational. Gets data through `input()`, reports through `output()` |
| File              | `website-search.page.ts` (+ `.html`, `.css`, `.spec.ts`)                                            | `search-filter-rack.component.ts`                                       |
| Class             | `WebsiteSearchPage`                                                                                 | `SearchFilterRackComponent`                                             |
| Selector          | `joo-website-search-page`                                                                           | `joo-search-filter-rack`                                                |
| Where             | Flat in the root of its feature folder (or `app-shell/` for not-found). One page per feature folder | In its own subfolder                                                    |
| Referenced from   | `*.routes.ts` only                                                                                  | Templates only                                                          |
| May inject stores | Yes                                                                                                 | No                                                                      |
| Generate          | `ng g c website-search/website-search --type=page --flat --selector=joo-website-search-page`        | `ng g c website-search/search-filter-rack`                              |

Seeing a `.page.ts` file tells you it's a route target without opening it. Pages injecting stores is the expected pattern. This is a convention in the guidelines with no lint guard rail.

## Naming

Type suffixes are kept. `angular.json` carries schematic defaults so `ng generate` produces them:

```json
{
  "schematics": {
    "@schematics/angular:component": { "type": "component", "style": "css" },
    "@schematics/angular:directive": { "type": "directive" },
    "@schematics/angular:service": { "type": "service" },
    "@schematics/angular:guard": { "typeSeparator": "." },
    "@schematics/angular:interceptor": { "typeSeparator": "." },
    "@schematics/angular:pipe": { "typeSeparator": "." },
    "@schematics/angular:resolver": { "typeSeparator": "." }
  }
}
```

| Kind                         | File                               | Class / export                                             |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| Page component               | `website-search.page.ts`           | `WebsiteSearchPage`                                        |
| Component                    | `trust-tier-badge.component.ts`    | `TrustTierBadgeComponent`                                  |
| Directive                    | `corner-brackets.directive.ts`     | `CornerBracketsDirective` (selector `[jooCornerBrackets]`) |
| Service                      | `curated-websites-data.service.ts` | `CuratedWebsitesDataService`                               |
| Signal store                 | `curated-websites.store.ts`        | `CuratedWebsitesStore`                                     |
| Model                        | `curated-website.model.ts`         | `CuratedWebsite` type                                      |
| Routes                       | `website-search.routes.ts`         | `websiteSearchRoutes`                                      |
| Pure functions               | `website-filtering.ts`             | named functions                                            |
| Component harness (optional) | `hardware-key-button.harness.ts`   | `HardwareKeyButtonHarness`                                 |
| Test                         | `<file>.spec.ts`                   |                                                            |

Selector prefix is `joo` — element and kebab-case for components, attribute and camelCase for directives, both enforced as ESLint errors.

Names stay semantic and spelled out: no acronyms, no `utils.ts`, `helpers.ts` or `common.ts`. `shared/` is the one folder with a general name, and every folder inside it names what it is.

## Placement rules

Put code in the first place on this list that fits.

1. **One feature uses it:** it lives in that feature's folder (`search-filter-rack/` sits in `website-search/`). This includes feature-local stores and pure functions.
2. **It's rendered once around every page:** it goes in `app-shell/`.
3. **Two or more features (or the shell and a feature) use it, and it knows about curated websites** (model, trust tiers, website URLs, the store): `shared/curated-websites/`.
4. **Anyone could use it and it knows nothing about websites, routes or app state:** `shared/design-system/`.
5. **App-wide behaviour rather than something you see** (hotkeys, storage): its own folder in `shared/`, named after what it does.

**Promote on the second consumer.** Code moves up a level when a second user appears, not before, and the move happens in the change that adds that second user. No `<feature>-shared` folders.

## Allowed import directions

- `shared/design-system` imports nothing from the app.
- Other `shared/*` folders may import `shared/design-system`. They don't import each other unless ADR 005 is updated.
- A feature may import `shared/*`. It never imports another feature. Cross-links go through router paths only.
- `app-shell` may import `shared/*`. Only the three root files import `app-shell` — `app.config.ts`, `app.routes.ts`, `app.component.ts` (ADR 015).

**Enforcement without a new dependency.** ESLint's built-in `no-restricted-imports`, configured in `eslint.config.js`, which reads the `src/app/` folder list with `node:fs` at lint time and generates one override block per feature, forbidding imports matching any other feature folder. A new feature folder is covered automatically. Sheriff and `eslint-plugin-boundaries` were rejected as extra dependencies for the same job (ADR 005).

The patterns are **folder names under `src/app/`**, not package names — so the rule catches a relative import (`../../../../app-shell/…`) and does not catch `@angular/router`. The spec for Phase 2 proposed proving the boundary with a `RouterLink` import, which would never have fired for that reason; the check uses an `app-shell` import instead, and the rule was verified firing under Task 18.

## State

Two tiers (ADR 010):

- **Plain `signal`s** (`signal`, `computed`, `linkedSignal`) for state that belongs to one component and dies with it.
- **NgRx SignalStore** (`@ngrx/signals` 22.x) for state that is shared between components, persists (URL, browser storage), or has real logic.

**Store rules:**

- One store per file, `<thing>.store.ts`, exporting `<Thing>Store`.
- Only page components inject stores. Normal components get data through `input()` and report through `output()`.
- Stores don't inject other stores. When two stores need coordinating, the page does it. If that grows, it's a new ADR.
- Stores don't fetch data themselves. They call a `.service.ts` in the same area.
- State changes only through store methods; `patchState` stays inside the store.
- No `effect` for syncing state. Use `withComputed`, `computed` or `linkedSignal`.

**Where each kind of state lives:**

| State kind                     | Example                             | Where                                                                                                                                           | Provided                                                 |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Domain data, read-only         | the curated websites and categories | `shared/curated-websites/curated-websites.store.ts`                                                                                             | `providedIn: 'root'`                                     |
| Shareable view state           | search query, filters, sort, page   | the URL, mirrored by `website-search/website-search-query.store.ts` or page signals (`Location.replaceState` for filter updates, ADR 035)        | route `providers` (created and destroyed with the route) |
| Local UI state                 | panel open, focused row             | component `signal`s; `linkedSignal` for editable values derived from inputs                                                                     | component                                                |
| Persistent user state (parked) | bookmarks, personal homepage        | `shared/local-preferences/` store over `shared/browser-storage/`                                                                                | `providedIn: 'root'`                                     |

The URL holds shareable view state so a filtered search can be bookmarked, shared, prerendered or restored. The store or component signal set is a typed view of the URL, not a second source of truth.

No `SignalStore` code exists for search yet. Phase 3's `/search` page holds query, filters and sort as plain writable signals synced to the URL. Crucially (ADR 035), in-page filter state and keyword updates sync silently via `Location.replaceState()` instead of `router.navigate()`: because `scrollPositionRestoration: 'enabled'` is active, router navigation events scroll the window to `(0, 0)` on every filter click or keystroke, and trigger unneeded View Transitions.


## Styles

Global CSS in explicit cascade layers (ADR 007), declared in `src/styles/cascade-layers.css`:

```css
@layer reset, tokens, base, components, utilities;
```

- Tokens are CSS custom properties under `[data-theme]` on `<html>`; `data-theme="retro"` is set statically in `index.html`. Two layers of them: `--p-*` primitives (the raw ramp) and semantic tokens that reference them. A component reads semantic tokens only. PrimeNG's own variables are `--png-*` — a `prefix: 'png'` override, because its default `p` collides with our primitives (ADR 011).
- Component styles use default `Emulated` encapsulation and read semantic tokens only.
- No `::ng-deep`, and no `ViewEncapsulation.None` without an ADR.
- Plain CSS. No Sass, no Tailwind.

Four files, in the order they are imported: `cascade-layers.css` (declares `@layer reset, tokens, base, primeng, components, utilities`), `design-tokens.css`, `base-element-styles.css`, `fonts.css`.

**Motion** is four duration tokens in `design-tokens.css`: `--duration-press` (70ms), `--duration-state` (160ms), `--duration-route` (240ms), `--duration-shell` (240ms). Recipes (route pane view-transitions, shell width ease, pending-without-wipe, font preload/`optional`) live in `src/app/shared/design-system/CONTEXT.md`. Plan: `_architecture/plans/2026-09-18-local-ux-quality-and-motion-system.md`. Do not invent a fifth duration for a one-off animation. **No `@angular/animations`** (deprecated); native CSS transitions or `@starting-style` only. Table/collection rows in `@for` may animate enter/leave *only* via compositor-safe opacity transitions with stable unique-ID tracking (`rowKey`) and debounced typing inputs to prevent reflow freezes and DOM memory leaks (ADR 035, ADR 036).


One exception to per-component styling: a rule that has to reach an element the component does not itself render — projected content, or an element a library's template created — cannot be encapsulated, and lives in `src/styles.css` inside `@layer components`, scoped by custom-element name (ADR 014). `src/styles.css` is also the only home for a global `joo-*` rule; `base-element-styles.css` holds the reset and nothing else.

## Conventions (framework defaults, not ADRs)

- Zoneless. Signals (`signal`, `computed`, `linkedSignal`, `resource`), `input()` / `output()`, `inject()`, standalone components, built-in control flow (`@if`, `@for`, `@switch`), `@defer`, lazy routes.
- Signal Forms for any form.
- `isDevMode()` instead of environment files — there's no API config to vary.
- `ng add` for Angular libraries, `ng generate` for new code, so the `angular.json` suffix and prefix defaults apply.
- Correctness gates are defined once, in `AGENTS.md`'s Iteration loop table. That table is the single source; do not restate it here.
- Strictness beyond the generated strict set: `noUncheckedIndexedAccess`, `noImplicitOverride`, plus `strictTemplates` and `strictInjectionParameters`.

Day-to-day commands and the how-to version of all of this live in `.agents/context/engineering-guidelines.md`.

## Testing

Vitest browser mode (Playwright/Chromium). Tests are hybrid interaction tests: render with `TestBed.createComponent`, query by role or label, fire real events with `userEvent` from `vitest/browser`, `await fixture.whenStable()`, assert on the DOM. Never `fixture.detectChanges()`, never call component methods directly. Reference spec: `src/app/app.component.spec.ts`. Full rules in ADR 008.

Tests are added only where they help the agent iteration loop. No e2e suite in Phase 1.

**Local UX smoke** (`pnpm run ux:smoke` → `scripts/ux-smoke.mjs`) is a separate gate from Vitest: app-wide route matrix, forbidden loading flashes, CLS/FCP/long-task budgets (`scripts/ux-smoke.budgets.json`), soft motion checks, and a gitignored metrics log under `.local/ux-smoke/`. Trigger and rules live only in `AGENTS.md`'s Iteration loop table. Ship a new page → add a scenario row. Occasional cold-load lab: `pnpm run ux:lab` against `serve:static-build` (:4321). Plan: `plans/2026-09-18-app-quality-harness.md`.

## Build budgets

**Budget values**:

- Initial: warning 600 kB, error 750 kB (raw bytes; Angular budgets are not compressed sizes)
- anyScript (any single script): warning 700 kB, error 1 MB
- anyComponentStyle: warning 4 kB, error 8 kB

Re-set on 2026-09-21 from a measured build (536 kB initial raw, 130 kB transferred) after the first Phase 3 build failed the old 320/500 kB budget at 1.31 MB. The cause and the fixes are in decision 032. They are enforced by `ng build` in CI (`.github/workflows/ci.yml`, decision 033). The agent loop runs no production build (`AGENTS.md`, Iteration loop). No current bundle size is recorded here: read it from the newest file in `_architecture/perf-baselines/`.

**Performance baselines** (decision 033): `pnpm run ux:lab:record` writes one JSON per commit into `_architecture/perf-baselines/` (Lighthouse median of 3 runs per page plus bundle sizes from `dist/jookoi-frontpage/stats.json`, which `pnpm run build` now writes). `pnpm run ux:lab -- --compare` diffs against the newest one, and CI runs `ux:lab:ci`, which fails only on regression beyond `scripts/ux-lab.budgets.json`. Absolute limits there are targets. The lab measures a static preview (`serve:static-build`) that serves each route's prerendered `index.html` with brotli; without both, the numbers are about 2x too slow.

**Landing-page weight rule** (decision 032): a route in `app.routes.ts` is lazy unless it is a few kB. `record-grid` is a plain table, so nothing in `main` may import PrimeNG's table code. The shell must not import data-sized modules: the source count is read from the fixture after first render.

## Where Phase 3 plugs in

Phase order and reasoning: `_architecture/plans/decisions/002-*`. **Phase 1 (foundation), Phase 2 (design system) and Phase 3 (content and features) are all complete.**

**The design system, as built.** `shared/design-system/` holds nine component sub-groups plus `theme/` — see the folder map. Two rules shape everything in it:

- **Identity comes from visual role, not from the mockup's markup** (ADR 012). The mockup CSS is a paint source read after a boundary is settled, never a source of structure. The Phase 1 class map (`.led` → `status-light/`) is superseded.
- **PrimeNG is the component base, styled, skinned by a custom preset** (ADR 011). Two components wrap it — `chrome-select`, `filter-drawer` (`record-grid` stopped wrapping `p-table` in decision 032) — and consumers never import a PrimeNG symbol. `theme/jookoi-preset.ts` maps PrimeNG's design tokens onto ours; `options.cssLayer` orders PrimeNG before our `components` layer, so our overrides win by layer rather than by specificity, with no `!important` and no `::ng-deep`. PrimeNG's variables are `--png-*` (its default `p` prefix collides with our primitives).

**Elevation is one scale in two places.** `--z-*` tokens in `design-tokens.css` and `ELEVATION` in `theme/elevation.ts` carry the same numbers, because PrimeNG's overlay manager is JavaScript-side and cannot read a custom property. Change one, change the other.

**Page templates are the ninth sub-group** (ADR 013): `page-layouts/` holds pieces composed inside a page, `page-templates/` holds the outermost grid a page _is_. Four templates, each a component with named projection slots and no routing or state of its own.

**`/specimen` is the dev-only parts kit.** It renders every component in every state, and it is the only route in the app that is not part of the site.

**Phase 3 — content and features, as built.** Home (`/`) and search (`/search?q=`) are real routes (D2, ADR 018) — pages flat in `app-shell/` rather than in per-feature folders (see the folder map callout above). `browse` and `source_detail` stay parked. `/learn` and `/learn/:topic` were built this phase, then superseded the same day by the library-archive section below.

- `shared/curated-websites/` holds a hand-written `Source` fixture and a pure, framework-free ranked-search module (ADR 017, 026) — no data service, root store or components yet. The originally planned data pipeline (`sources/` → `scripts/` → `src/generated/`) was not built this phase; `BACKLOG.md`'s "Data pipeline: `sources/` to `src/generated/`" item stays open.
- Two new `shared/design-system/data-display/` components: `chip/` (flat tag pill) and `topic-tree/` (PrimeNG `p-tree` wrapper, first built for the learn index, now reused as the library sidebar) — the fourth and fifth sanctioned PrimeNG adoptions after `chrome-select`, `filter-drawer` and `record-grid`. `record-grid` gained a cell-template API to render the source table's trust chips, capability pills and outbound-open keys.
- No `getPrerenderParams`, `website-detail` page, or per-feature `CONTEXT.md` — those stay with `browse`/`source_detail`, still parked.

**Library-archive section, same day (`_architecture/plans/2026-09-16-library-archive-section.md`).** `/learn` (`LearnPage`/`LearnTopicPage`, `shared/learn-content/`) is replaced by `/library` (`app-shell/library/`, `shared/library-content/`) — the section generalizes one collection to any number of them, all the user's own writing rather than sourced from elsewhere (`.agents/context/principles.md`'s "send to sources" line now says so explicitly). Crash-course content lives at `content/library/ai-tooling-crash-course-for-developers/` (decision 029; earlier mistaken `learn/` slug redirects). `topics/` is kept (decision 028, which undid the flatten from the first pass). Section entry document is `README.md` (decision 030; was `topic-index.md`). `index.md` is folder title/summary/intro only.

- **Routing is one literal `Route` per known path**, generated from the content index, not a `UrlMatcher` — the plan's first choice, tried and confirmed not to work with `RenderMode.Prerender` (ADR 027 has the detail). Both `library.routes.ts` (client) and `app.routes.server.ts` (prerender) read the same `LIBRARY_FOLDER_PATHS`/`LIBRARY_DOC_PATHS`. The client wraps those literal entries as children of `library-layout.page` so the file tree survives document navigation.
- **Generated content is committed**, split into a small index and one file per document for lazy loading (ADR 027, amends 022) — `pnpm run build` runs the generator; `start`/`watch` do not.
- **Mermaid** ships as a lazy runtime dependency, gated on a per-document `hasDiagrams` flag; no vendored document has a diagram yet, so this path is unexercised beyond a manual read (ADR 027).
- **The reader theme the plan asked for already existed** — `--sheet-*` tokens (`design-tokens.css`, "Paper (from JooKoi-md-archive markdown rendering)") plus `joo-prose-content`'s descendant styles in `styles.css` already matched the plan's target values exactly. No new theme work was needed.

`category-browse/` and `website-detail/` in the folder map are still the plan, not the build. The import rules and generated lint boundary blocks already cover folders that don't exist yet, so either one is enforced automatically the moment it appears.
