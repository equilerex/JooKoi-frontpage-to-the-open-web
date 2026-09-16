# Architecture

JooKoi: Front Page to the Open Web — an Angular 22 single-page app, prerendered to static files, that lists and links out to curated websites. This file is the structural reference: where code goes, what it's called, how it imports, and where state lives. The reasoning behind each rule is in `_architecture/plans/decisions/003-*` through `015-*`; the Phase 1 planning session is `_architecture/plans/2026-09-15-angular-foundation-phase-1.md` and the Phase 2 one is `_architecture/plans/2026-09-15-angular-design-system-phase-2.md`.

Phase 1 (foundation) and Phase 2 (design system) are both built. Phase 3 is content and features — see the last section.

## Stack

| Piece                  | Choice                                                 | ADR |
| ---------------------- | ------------------------------------------------------ | --- |
| Framework              | Angular 22.1, zoneless, standalone, strict             | 003 |
| Node / package manager | Node 24 (`.nvmrc`, `engines`), pnpm (`packageManager`) | 003 |
| TypeScript             | `~6.0.3`                                               | 003 |
| Rendering              | Static prerendering, `outputMode: static`, no server   | 004 |
| Component behaviour    | Angular Aria + CDK; PrimeNG 22.1.1 styled, custom preset | 006, 011 |
| Styles                 | Plain CSS, explicit cascade layers, custom properties  | 007 |
| Tests                  | Vitest browser mode (Playwright/Chromium), `~4.1.11`   | 008 |
| State                  | Plain signals + `@ngrx/signals` `~22.0.1`              | 010 |
| Lint / format          | `angular-eslint` + Prettier + `eslint-config-prettier` | —   |
| Import boundaries      | generated `no-restricted-imports` rules                | 005 |
| CI / hosting           | Designed, not built                                    | 009 |

The workspace sits at the **repo root**, next to `sources/`, `data/`, `scripts/`, `features/` and `.agents/`. It's a single app — no Nx, no monorepo (ADR 005).

## Domain vocabulary

The things this app lists and links out to are **curated websites**. Code never uses the bare word "source" for them, because in an engineering context it reads as source code.

- Model: `CuratedWebsite`. Folder: `curated-websites/`. Components: `website-*`.
- The word "source" is still correct for `sources/` (human-authored input data) and the `source-ingest` skill. Those are outside `src/app/` and keep their names for now.
- `sitemap.yaml` still says `source_detail` and `/source/:id`. Renaming the public route is a product call, logged in `BACKLOG.md`.

## Rendering

Static prerendering with no server (ADR 004). `ng build` emits prerendered HTML per route plus a client bundle, and no `server.mjs`.

- Render mode per route is declared in `src/app/app.routes.server.ts`.
- Parameterised routes (`website-detail`) will use `getPrerenderParams` fed from build-time data, with `PrerenderFallback.Client`.
- Search stays client-rendered.
- The theme attribute `data-theme="retro"` is written statically into `index.html` so prerendered HTML has no theme flash.
- `scripts/serve-static-build.mjs` (Node built-ins only) serves `dist/jookoi-frontpage/browser` locally via `pnpm run serve:static-build`. For an unmatched path it serves the CSR fallback page rather than a literal HTTP 404 — the `**` wildcard route needs the Angular app to mount before it can show the not-found page.

## Folder map

This is the **target** map for the app described in `_architecture/sitemap.yaml`. Parked areas are shown only to prove they have a home — they are not created.

> **What actually exists after Phase 2:** `app.component.*`, `app.config.ts`, `app.config.server.ts`, `app.routes.ts` (three route entries: `''` → `HomePage`, `specimen` → the dev-only parts kit, `**` → `NotFoundPage`), `app.routes.server.ts`, and `app-shell/` holding the three chrome components, `app-shell-layout/`, the two pages and `page-title.strategy.ts`. `src/app/specimen/` holds the parts kit. `shared/design-system/` holds ten folders — nine component sub-groups and `theme/` — listed below. `src/styles/` holds `cascade-layers.css`, `design-tokens.css`, `base-element-styles.css` and `fonts.css`, and `public/fonts/` holds the eleven self-hosted woff2 files. `src/styles.css` holds the global rules that cannot be encapsulated. No feature folder exists yet — everything from `launcher-home/` down is still the plan.

```
src/
  main.ts  main.server.ts  index.html
  app/
    app.component.ts  app.config.ts  app.config.server.ts
    app.routes.ts                       # one lazy entry per feature, nothing else
    app.routes.server.ts                # render mode per route (ADR 004)

    app-shell/                          # the frame rendered once around every page
      not-found.page.*                  #   wildcard route target
      home.page.*                       #   '' route target (placeholder until Phase 3)
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
        data-display/                   #     record-grid/ (PrimeNG), tag-set/ (.chips), capability-tag/,
                                        #     count-chip/, spec-list/ (.spec), prose-content/
        page-layouts/                   #     toolbar-row/
        page-templates/                 #     console-landing-template/, directory-browse-template/,
                                        #     record-detail-template/, document-template/ (ADR 013)

      curated-websites/                 #   the domain: the websites this app lists and links out to
        curated-website.model.ts  website-category.model.ts  trust-tier.model.ts  capability-signal.model.ts
        curated-websites-data.service.ts  #   data access: how build-time data arrives (Phase 3 decides the mechanism)
        curated-websites.store.ts       #     root SignalStore: websites and categories as signals, uses the service
        website-filtering.ts            #     pure filter + sort functions (trust, language, region, type, RSS, site search)
        site-search-url.ts              #     sitemap site_search_launch: query → the website's own search URL
        website-result-card/  trust-tier-badge/  capability-signal-list/
        outbound-website-link/  direct-site-search-form/

      keyboard-shortcuts/               #   global hotkey registry (HUD keycaps), used by shell + features
      # parked: browser-storage/ (local-only persistence), local-preferences/ (personal homepage settings)

    launcher-home/                      # /
      launcher-home.routes.ts
      launcher-home.page.*
      trusted-website-highlights/  quick-category-keys/

    website-search/                     # /search?q=
      website-search.routes.ts
      website-search.page.*
      website-search-query.store.ts     #   route-scoped SignalStore, URL-backed
      search-filter-rack/  search-sort-selector/

    category-browse/                    # /browse/:category?
      category-browse.routes.ts
      category-browse.page.*
      category-tree-navigation/  related-category-links/

    website-detail/                     # /source/:id in the current sitemap (see open points)
      website-detail.routes.ts
      website-detail.page.*
      website-detail-prerender-parameters.ts
      website-specification-sheet/  related-website-list/

    # parked features, same level: collection-view/, graph-explore/, federated-search/,
    #   learning/ (/learn, /learn/:topic), local-utilities/ (/tools),
    #   directory-stewardship/ (/health, /contribute, /export), personal-homepage/

  styles/
    cascade-layers.css  design-tokens.css  base-element-styles.css  fonts.css
  styles.css                            # global rules that cannot be encapsulated (ADR 014)
  generated/                            # Phase 3: build-time data from scripts/, gitignored
public/fonts/                           # eleven self-hosted woff2 files
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
"schematics": {
  "@schematics/angular:component": { "type": "component", "style": "css" },
  "@schematics/angular:directive": { "type": "directive" },
  "@schematics/angular:service": { "type": "service" },
  "@schematics/angular:guard": { "typeSeparator": "." },
  "@schematics/angular:interceptor": { "typeSeparator": "." },
  "@schematics/angular:pipe": { "typeSeparator": "." },
  "@schematics/angular:resolver": { "typeSeparator": "." }
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
| Shareable view state           | search query, filters, sort, page   | the URL, mirrored by `website-search/website-search-query.store.ts`, which reads query params into state and writes back with `router.navigate` | route `providers` (created and destroyed with the route) |
| Local UI state                 | panel open, focused row             | component `signal`s; `linkedSignal` for editable values derived from inputs                                                                     | component                                                |
| Persistent user state (parked) | bookmarks, personal homepage        | `shared/local-preferences/` store over `shared/browser-storage/`                                                                                | `providedIn: 'root'`                                     |

The URL holds shareable view state so a filtered search can be bookmarked, shared, prerendered or restored. The store is a typed view of the URL, not a second source of truth.

No store code exists yet. The first real store is written in Phase 3.

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

## Build budgets

**Budget values**:

- Initial: warning 320 kB, error 500 kB
- anyComponentStyle: warning 2 kB, error 4 kB

Set from the first production build's measured baseline (244.34 kB initial) plus ~30% headroom. They are enforced by `ng build`, which is what makes them the CI gate once ADR 009's workflow exists — and **CI is the only thing that measures them**; the agent loop runs no production build (`AGENTS.md`, Iteration loop).

**Both warns are currently exceeded, and that is a decision, not a defect to fix here.** The initial bundle crossed the 320 kB warn when PrimeNG landed, and two component stylesheets sit over the 2 kB warn. Resolving it means either raising a budget or trimming ported CSS, and that call belongs to the user — logged in `_architecture/BACKLOG.md`. No current bundle size is recorded here: the 244.34 kB above is the baseline the budgets were set from, and a stale measurement reads as a live one.

## Where Phase 3 plugs in

Phase order and reasoning: `_architecture/plans/decisions/002-*`. **Phase 1 (foundation) and Phase 2 (design system) are complete.**

**The design system, as built.** `shared/design-system/` holds nine component sub-groups plus `theme/` — see the folder map. Two rules shape everything in it:

- **Identity comes from visual role, not from the mockup's markup** (ADR 012). The mockup CSS is a paint source read after a boundary is settled, never a source of structure. The Phase 1 class map (`.led` → `status-light/`) is superseded.
- **PrimeNG is the component base, styled, skinned by a custom preset** (ADR 011). Three components wrap it — `chrome-select`, `filter-drawer`, `record-grid` — and consumers never import a PrimeNG symbol. `theme/jookoi-preset.ts` maps PrimeNG's design tokens onto ours; `options.cssLayer` orders PrimeNG before our `components` layer, so our overrides win by layer rather than by specificity, with no `!important` and no `::ng-deep`. PrimeNG's variables are `--png-*` (its default `p` prefix collides with our primitives).

**Elevation is one scale in two places.** `--z-*` tokens in `design-tokens.css` and `ELEVATION` in `theme/elevation.ts` carry the same numbers, because PrimeNG's overlay manager is JavaScript-side and cannot read a custom property. Change one, change the other.

**Page templates are the ninth sub-group** (ADR 013): `page-layouts/` holds pieces composed inside a page, `page-templates/` holds the outermost grid a page *is*. Four templates, each a component with named projection slots and no routing or state of its own.

**`/specimen` is the dev-only parts kit.** It renders every component in every state, and it is the only route in the app that is not part of the site.

**Phase 3 — content and features.** Adds the feature folders (`launcher-home/`, `website-search/`, `category-browse/`, `website-detail/`), one lazy entry each in `app.routes.ts`, plus:

- `shared/curated-websites/` — models, data service, root store, pure filtering functions.
- The data pipeline: `sources/` → `scripts/` → `src/generated/` (gitignored), and the decision on how data reaches the service (bundled import vs `httpResource`).
- `getPrerenderParams` for `website-detail`, fed from that generated data.
- A `CONTEXT.md` per feature folder as it's built.
- A page is a feature component that imports one template from `shared/design-system/page-templates/`, fills its slots, and owns the routing and state itself.

Nothing built so far needs to change for it. The folder map already names the slots, the import rules already cover folders that don't exist yet, and the lint boundary blocks are generated from the folder listing, so a new feature folder is enforced the moment it appears.
