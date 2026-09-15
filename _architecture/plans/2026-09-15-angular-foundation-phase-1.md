# Phase 1 — Angular foundation: build system, tooling, guidelines (CI and hosting planned, not built)

Session: 2026-09-15. Status: revision 3 accepted, awaiting implementation go-ahead.

## Context

Decision 002 splits the work into three phases. You clarified the scope: the MVP rule in `AGENTS.md` applies to **pages, features and content**. It does not apply to the foundation. A proper build system, architecture and testing guidelines, and later a design system with base components are the minimum starting point.

This plan covers **Phase 1 only**: the workspace, tooling, rendering, local static build, and written guidelines.

- **CI and deployment:** designed now so the Angular config doesn't block them, but **not built**. That work comes when the app is closer to done.
- **Phase 2 design system:** tokens, fonts, and components extracted from `features/design-theme/` get their own plan. Phase 1 must leave a clear place for them.
- **Out of scope:** real pages and the website data schema.

Handoff brief: `_architecture/plans/2026-09-15-angular-project-setup-handoff.md`. The plan was reviewed against the `angular-developer` skill. Its adjustments are folded in below.

### Revision history

- **Revision 2** (Gemini review, 2025+ source research): type suffixes kept, selector prefix `joo`, `shared/` added, features top-level, page folders flattened, harnesses optional.
- **Revision 3** (your feedback):
  - The domain is renamed from "source" to **curated website**. In code, "source" reads as source code.
  - Page components get their own file type, `.page.ts`, so they can't be mistaken for normal components.
  - SignalStore confirmed for shared, persistent or complex state.
  - No boundaries plugin. Import rules use ESLint's built-in `no-restricted-imports`, with the rule blocks generated from the folder list inside `eslint.config.js`.

## Verified facts (npm and angular.dev on 2026-09-15)

| Item                                  | Value                                                                                   | Note                                                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Angular core / CLI / CDK / Aria / SSR | 22.1.6 / 22.1.8 / 22.1.6 / 22.1.6 / 22.1.8                                              | v22 stabilised Signal Forms, `resource`/`httpResource`, and **Angular Aria**                                                                                                                                       |
| Global `ng`                           | 22.1.7                                                                                  | The skill rule says an installed CLI means use `ng new` directly                                                                                                                                                   |
| TypeScript                            | **6.0.3**                                                                               | Angular 22 peer is `>=6.0 <6.1`. npm `latest` (7.0.2) is incompatible                                                                                                                                              |
| Vitest / @vitest/browser-playwright   | **4.1.11** / **4.1.11**                                                                 | `@angular/build` peer is `^4.0.8`. npm `latest` (5.0.0) is incompatible                                                                                                                                            |
| `@ngrx/signals`                       | 22.0.1                                                                                  | Peer `@angular/core ^22.0.0`                                                                                                                                                                                       |
| Node / pnpm                           | 24.19.0 / 11.22.0 local                                                                 | Angular engines `^22.22.3 \|\| ^24.15.0 \|\| >=26`                                                                                                                                                                 |
| `ng new` defaults                     | zoneless, standalone, strict, Vitest, suffixless file names                             | Suffixless is a CLI default only. The style guide takes no stance on suffixes. Schematics accept a `type` option, which sets both the file suffix and the class suffix (`--type=page` gives `x.page.ts` / `XPage`) |
| Selector prefix                       | `ng new --prefix joo`                                                                   | Style guide: use an app-specific prefix for components and directives                                                                                                                                              |
| Static output                         | `ng add @angular/ssr` + `"outputMode": "static"` gives prerendered HTML, no server file |                                                                                                                                                                                                                    |
| Angular CLI MCP                       | `npx -y @angular/cli mcp`                                                               |                                                                                                                                                                                                                    |

## Sources used for structure and state (2025 or newer only)

- angular.dev style guide (live): group by feature or theme, not by code type. Avoid generic file names (`utils.ts`, `helpers.ts`). Use an app-specific selector prefix.
- Manfred Steyer, "The Perfect Project Setup for Angular" (angulararchitects.io, 26 May 2025): domains, each with `feature` / `ui` / `data` / `util`, plus a `shared` domain. Access only downwards.
- Manfred Steyer, "Architecture as an Executable Contract" (1 Jun 2026): feature slicing. A feature's local UI, stores and utilities stay in the feature folder until something else needs them. Only smart components (pages) access stores. Stores delegate data access to services.
- Manfred Steyer, "Architecture Beyond Layers: tsarch for AI Coding Agents" (8 Jun 2026): building blocks identified by file suffix (`-page`, `-store.ts`). Stores must not access other stores.
- Tomas Trajan, `ax-skills` repo (May 2026): lazy features that never import each other. Share by extracting one level up, never a `feature-shared` folder.
- Juri Strumpflohner, Nx blog (18 Mar 2025): domain folders plus a `shared` scope that depends only on shared.
- Manfred Steyer interview (31 Mar 2026) and ABP article (30 Jun 2026, Angular 22): SignalStore for feature-shared state, plain signals for component-local state.

What they agree on: lazy features that never import each other, a shell area, reusable UI kept apart from domain data and stores, code promoted one level up when a second consumer appears, and dependency rules enforced by lint. Steyer's Sheriff and Trajan's `eslint-plugin-boundaries` are two ways to enforce those rules. Both are extra dependencies, and this plan doesn't need either (ADR 005).

## Decisions (one ADR each, numbers 003 to 010)

1. **003 Version and update policy.** Start on Angular 22.1.
   - Pin Node 24 (`.nvmrc`, `engines`), pnpm via `packageManager`, TypeScript `~6.0.3`, and Vitest plus its browser provider at `~4.1.11`.
   - Each new Angular major is tried with `ng update @angular/core @angular/cli` (plus `@ngrx/signals`) on a branch named `upgrade/angular-<major>`.
   - Automated dependency PRs (Dependabot) are part of the deferred CI work.
   - **Dependency rule:** a new dependency needs a reason it earns its place over the platform or a few lines of our own code. The reason is recorded in the ADR or PR that adds it.
2. **004 Rendering.** Static prerendering (`outputMode: static`) with no server.
   - Route render modes live in `app.routes.server.ts`.
   - Parameterised routes later use `getPrerenderParams` from build-time data, with `PrerenderFallback.Client`.
   - Search stays client-rendered.
   - Rejected: SSR (no server allowed) and pure CSR (slower first paint, no crawlable HTML).
   - Service worker deferred to the backlog.
3. **005 Workspace location, folders and naming.** The workspace sits at the **repo root**, next to `sources/`, `data/`, `scripts/`, `features/` and `.agents/`. It's a single app, so no Nx or monorepo.
   - **Organising rule** (angular.dev style guide): group by feature or theme, never by code type. So there are no `components/`, `pages/`, `services/` or `stores/` folders anywhere. A component's `.ts`, `.html`, `.css` and `.spec.ts` sit together.
   - **Top level of `src/app/`:** `app-shell/` (the frame), `shared/` (anything used by more than one feature), and one folder per feature, named after the page it serves. No `features/` wrapper folder.
   - **Domain vocabulary.** The things this app lists and links to are **curated websites**. Code never uses the bare word "source" for them, because in an engineering context it reads as source code. Model `CuratedWebsite`, folder `curated-websites/`, components `website-*`.
   - **Page components vs normal components.** Two separate file types, so the difference shows in the file name, class name, selector and folder position:

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

     Seeing a `.page.ts` file tells you it's a route target without opening it. Pages injecting stores is the expected pattern. It's a convention in the guidelines with no lint guard rail.

   - **File naming.** Type suffixes are kept. Schematic defaults in `angular.json` so `ng generate` produces them:
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
   - Names stay semantic and spelled out: no acronyms, no `utils.ts`, `helpers.ts` or `common.ts`. `shared/` is the one folder with a general name, and every folder inside it names what it is.
   - **Target map for the app in `sitemap.yaml`.** This goes in full into `ARCHITECTURE.md`. Design-system component names are candidates taken from the mockup CSS classes, and Phase 2 settles the final list. Parked areas are shown only to prove they have a home, and they aren't created.
     ```
     src/
       main.ts  main.server.ts  index.html
       app/
         app.component.ts  app.config.ts  app.config.server.ts
         app.routes.ts                       # one lazy entry per feature, nothing else
         app.routes.server.ts                # render mode per route (ADR 004)

         app-shell/                          # the frame rendered once around every page
           not-found.page.*                  #   wildcard route target
           app-shell-layout/                 #   header + <router-outlet> + dock arrangement
           heads-up-display-header/          #   desktop HUD navigation (.hud)
           mobile-bottom-dock/               #   thumb-reach navigation below 768px (.dock)
           horizon-backdrop/                 #   perspective grid, desktop only
           page-title.strategy.ts            #   TitleStrategy: "<page> · JooKoi"

         shared/                             # used by two or more features, or by shell + a feature
           design-system/                    #   domain-agnostic visual building blocks (Phase 2)
             typography/                     #     logotype/, section-heading/, eyebrow-label/, stripe-rule/
             indicators/                     #     status-light/ (.led), seven-segment-readout/ (.readout)
             actions/                        #     hardware-key-button/ (.key), keycap-shortcut/ (.keycap), keycap-grid/
             form-controls/                  #     command-console-input/ (.console), stompbox-toggle/ (.toggle),
                                             #     rotary-segment-selector/ (.segment), chrome-select/, field-label/
             surfaces/                       #     readout-panel/ (.panel), paper-sheet/ (.sheet), corner-brackets.directive.ts
             navigation/                     #     breadcrumb-trail/, indicator-navigation-list/ (.navlist), pagination-control/ (.pager)
             data-display/                   #     data-table/, tag-chip-list/ (.chips), specification-list/ (.spec), prose-content/
             page-layouts/                   #     filter-rack-layout/ (.with-rack), two-column-split/, toolbar-row/

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
         cascade-layers.css  design-tokens.css (Phase 2)  base-element-styles.css
       generated/                            # Phase 3: build-time data from scripts/, gitignored
     public/fonts/                           # Phase 2: self-hosted woff2
     ```
     `.page.*` means `.page.ts`, `.page.html`, `.page.css` and `.page.spec.ts`. Every normal component has its own folder, so a feature folder's root holds only the page, its routes file, and feature-local stores or functions.
   - **Placement rules.** Put code in the first place on this list that fits.
     1. **One feature uses it:** it lives in that feature's folder (`search-filter-rack/` sits in `website-search/`). This includes feature-local stores and pure functions.
     2. **It's rendered once around every page:** it goes in `app-shell/`.
     3. **Two or more features (or the shell and a feature) use it, and it knows about curated websites** (model, trust tiers, website URLs, the store): `shared/curated-websites/`.
     4. **Anyone could use it and it knows nothing about websites, routes or app state:** `shared/design-system/`.
     5. **App-wide behaviour rather than something you see** (hotkeys, storage): its own folder in `shared/`, named after what it does.
   - **Promote on the second consumer.** Code moves up a level when a second user appears, not before, and the move happens in the change that adds that second user. No `<feature>-shared` folders.
   - **Allowed import directions.**
     - `shared/design-system` imports nothing from the app.
     - Other `shared/*` folders may import `shared/design-system`. They don't import each other unless the ADR is updated.
     - A feature may import `shared/*`. It never imports another feature. Cross-links go through router paths only.
     - `app-shell` may import `shared/*`. Only `app.routes.ts` and `app.component.ts` import `app-shell`.
   - **Enforcement without a new dependency.** ESLint's built-in `no-restricted-imports` rule, configured in `eslint.config.js`. The config reads the `src/app/` folder list with `node:fs` at lint time and generates one override block per feature, forbidding imports that match any other feature folder (`**/website-detail/**` and so on). A new feature folder is covered automatically. Rejected: Sheriff (`@softarc/sheriff-core`, a module-boundary linter) and `eslint-plugin-boundaries`. Both are extra dependencies that do the same job for bigger apps. They're only worth adding if the generated rules stop being readable.
   - **Folder names.** The mockup folder `features/design-theme/` stays at the repo root as reference until Phase 2. There's no `src/app/features/`, so there's no name collision.
4. **006 Component behaviour library.** **Angular Aria plus CDK**, not Angular Material. This updates the handoff's CDK-only recommendation.
   - Aria has been stable since v22. Its directives are headless and unstyled and handle keyboard, focus and ARIA state. You style them through ARIA attributes, which suits the HUD look.
   - CDK provides the overlay that Aria popups need, plus component harnesses for tests.
   - Phase 1 records the decision only. Phase 2 installs the packages with `ng add` or pnpm.
5. **007 Styles architecture.** Global CSS in explicit cascade layers (`@layer reset, tokens, base, components, utilities`).
   - Tokens are CSS custom properties under `[data-theme]` on `<html>`. `data-theme="retro"` is set statically in `index.html`, so prerendered HTML has no theme flash.
   - Component styles use the default `Emulated` encapsulation and read semantic tokens only.
   - No `::ng-deep`, and no `ViewEncapsulation.None` without an ADR.
   - Plain CSS (`--style=css`), no Sass or Tailwind.
6. **008 Testing approach.** Vitest **browser mode** (Playwright, Chromium). Tests are **hybrid interaction tests**:
   - Render the real component with `TestBed.createComponent`.
   - Find elements by role or label.
   - Fire real events with `userEvent` from `vitest/browser`.
   - `await fixture.whenStable()`, then assert on what the DOM shows. This is the skill's Act, Wait, Assert pattern for zoneless apps. Never call `fixture.detectChanges()` and never call component methods directly.
   - Page components are tested through their route with `RouterTestingHarness`. Normal components are tested with `TestBed.createComponent` and input values.
   - **Component harnesses are optional.** A design-system component gets a `<name>.harness.ts` only when its markup is complex enough that other tests would otherwise reach into its internals (Aria-backed selects, listboxes, grids).
   - Stores are tested through the page that uses them, or directly when they hold real logic (filtering, URL mapping). Pure data-transform functions may get plain unit tests.
   - Tests are added only where they help the agent iteration loop. No e2e suite in Phase 1 (backlog).
7. **009 Delivery: CI and hosting (status DEFERRED).** Records the intended shape so Phase 1 config doesn't block it. Nothing gets built.
   - **CI:** a GitHub Actions workflow running `format:check`, `lint`, `build`, `test:ci`, with the budgets enforced by `build`. Plus Dependabot.
   - **Hosting candidates:** Cloudflare Pages (free, branch previews), Vercel, or nginx on your Linode.
   - **Constraints Phase 1 honours now:** build output is plain static files, base href `/`, no host-specific code or config in the app, every CI step exists as a pnpm script, and headless test mode works when `CI=true`.
8. **010 State management.** Two tiers:
   - **Plain `signal`s** (`signal`, `computed`, `linkedSignal`) for state that belongs to one component and dies with it.
   - **NgRx SignalStore** (`@ngrx/signals` 22.x) for state that is shared between components, persists (URL, browser storage), or has real logic (loading, filtering, derived views). Confirmed by you. It earns the dependency because every store gets the same shape (`withState`, `withComputed`, `withMethods`, `withHooks`) instead of a hand-written pattern each agent re-invents, and 2026 guidance (Steyer, ABP on Angular 22) puts it at exactly this level.
   - **Store rules** (after Steyer 2026):
     - One store per file, `<thing>.store.ts`, exporting `<Thing>Store`.
     - Only page components inject stores. Normal components get data through `input()` and report through `output()`.
     - Stores don't inject other stores. When two stores need coordinating, the page does it. If that grows, it's an ADR.
     - Stores don't fetch data themselves. They call a `.service.ts` in the same area.
     - State changes only through store methods (`patchState` stays inside the store).
     - No `effect` for syncing state. Use `withComputed`, `computed` or `linkedSignal`.
   - **Where each kind of state lives:**

     | State kind                     | Example                             | Where                                                                                                                                           | Provided                                                 |
     | ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
     | Domain data, read-only         | the curated websites and categories | `shared/curated-websites/curated-websites.store.ts`                                                                                             | `providedIn: 'root'`                                     |
     | Shareable view state           | search query, filters, sort, page   | the URL, mirrored by `website-search/website-search-query.store.ts`, which reads query params into state and writes back with `router.navigate` | route `providers` (created and destroyed with the route) |
     | Local UI state                 | panel open, focused row             | component `signal`s, `linkedSignal` for editable values derived from inputs                                                                     | component                                                |
     | Persistent user state (parked) | bookmarks, personal homepage        | `shared/local-preferences/` store over `shared/browser-storage/`                                                                                | `providedIn: 'root'`                                     |

   - **Why the URL holds view state:** a filtered search can be bookmarked and shared, and it can be prerendered or restored. That's principle 2, persistence. The store is a typed view of the URL, not a second source of truth.
   - **Data loading:** the service's public API doesn't depend on how the data arrives. The mechanism (bundled JSON import, or per-category JSON fetched with `httpResource`, which works with prerendering) is a Phase 3 data-pipeline decision.
   - **Rejected:** classic NgRx Store (event-driven global state this app doesn't have). Hand-written signal services as the shared-state pattern.
   - Phase 1 installs `@ngrx/signals` and documents the pattern. The first real store is written in Phase 3.

**Conventions for `ARCHITECTURE.md` and the guidelines doc** (framework defaults, not ADRs):

- Zoneless, signals (`signal`, `computed`, `linkedSignal`, `resource`), `input()`/`output()`, `inject()`, standalone components, built-in control flow, `@defer`, lazy routes.
- Signal Forms for any form.
- `isDevMode()` instead of environment files, since there's no API config.
- `ng add` for Angular libraries and `ng generate` for new code, so the `angular.json` suffix and prefix defaults apply.
- `ng build` is the correctness gate after every change.

## Implementation steps

Each step produces one checkable result, and each can be retried on its own. Nothing starts until you give the go-ahead after review.

0. **Workflow friction log.** `_architecture/workflow-friction-log.md` already exists. Keep adding entries during implementation.
1. **Generate the workspace in the scratchpad, then merge it into the repo.** `ng new` in the non-empty repo would conflict with `README.md` and `.gitignore`. Run `ng new jookoi-frontpage --directory <scratchpad>/jookoi-frontpage --prefix=joo --package-manager=pnpm --style=css --routing --ssr --test-runner=vitest --ai-config=none --skip-git --interactive=false` with the global CLI (22.1.7). Copy the result to the repo root, keep the existing `README.md`, and merge `.gitignore`. Result: `pnpm install` works.
2. **Naming defaults.** Add the ADR 005 `schematics` block to `angular.json`. Rename the generated `app.ts` / `App` to `app.component.ts` / `AppComponent` (and its `.html`, `.css`, `.spec.ts`). Result: `ng g c naming-check --dry-run` reports `naming-check.component.ts` with selector `joo-naming-check`, and `ng g c naming-check --type=page --flat --selector=joo-naming-check-page --dry-run` reports `naming-check.page.ts` with class `NamingCheckPage`.
3. **Pin the toolchain.** `.nvmrc` (24), `engines`, `packageManager`, TypeScript `~6.0.3`. Fix `.gitignore` so `pnpm-lock.yaml` is committed (lockfiles are ignored today). Result: `pnpm install --frozen-lockfile` passes.
4. **Strictness.** Add `noUncheckedIndexedAccess` and `noImplicitOverride` on top of the generated strict set. Keep `strictTemplates` and `strictInjectionParameters`. Result: `ng build` passes.
5. **Static prerender.** `outputMode: static`. `app.routes.server.ts` prerenders `''`. Generate `ng g c app-shell/not-found --type=page --flat --selector=joo-not-found-page` and `ng g c app-shell/app-shell-layout` (router outlet only). `app.routes.ts` gets the wildcard route. Feature routes are added when their features are built. Result: the built `index.html` contains rendered markup and no server bundle is emitted.
6. **Styles pipeline skeleton.** `src/styles/cascade-layers.css` and `base-element-styles.css` wired through `angular.json` `styles`. `data-theme="retro"` on `<html>`. No tokens yet. Result: layer order is visible in DevTools.
7. **Lint, format and import rules.**
   - `ng add angular-eslint`. Confirm `@angular-eslint/component-selector` (prefix `joo`, element, kebab-case) and `@angular-eslint/directive-selector` (prefix `joo`, attribute, camelCase) are set as errors.
   - Prettier plus `eslint-config-prettier`. Scripts `lint`, `format`, `format:check`.
   - ADR 005 import directions as generated `no-restricted-imports` blocks in `eslint.config.js`. No extra plugin.
   - Result: all scripts pass on the generated code. A deliberately bad import in a scratch file (feature → feature, design-system → curated-websites) fails lint, then gets reverted.
8. **State library.** `pnpm add @ngrx/signals@~22.0.1`. No store is written yet. Result: `ng build` passes.
9. **Test runner.** `pnpm add -D @vitest/browser-playwright@~4.1.11 playwright`. `browsers: ["chromium"]` in the test target. Scripts `test` (watch) and `test:ci` (`ng test --watch=false --browsers=chromiumHeadless`). Rewrite the generated `app.component.spec.ts` as the reference hybrid test: navigate to an unknown path with `RouterTestingHarness`, assert on the not-found heading found by role, click its home link with `userEvent`, wait, and assert the route changed. Result: `pnpm run test:ci` passes.
10. **Budgets.** Measure the first production build. Set `initial` and `anyComponentStyle` budgets to the baseline plus about 30%. Result: numbers recorded in `ARCHITECTURE.md`.
11. **Local static bundle.** `scripts/serve-static-build.mjs` uses Node built-ins only. It serves `dist/jookoi-frontpage/browser` and returns the not-found or CSR fallback page for unknown paths. Script `serve:static-build`. Add `angular-dev-server` and `static-build` entries to `.claude/launch.json`. Result: the built site runs on localhost with no extra dependencies.
12. **Agent tooling.** `.mcp.json` with `angular-cli` (`npx -y @angular/cli mcp`), for `get_best_practices`, `search_documentation` and `run_target`. Document UI verification: check at 390px and 1440px in the preview browser, `ng build` and `lint` as the gate, tests only when asked.
13. **Paper trail** (invoke `jookoi-paper-trail`):
    - This plan (`_architecture/plans/2026-09-15-angular-foundation-phase-1.md`): add an `## Implementation deviations` section wherever the build differs.
    - ADRs 003 to 010.
    - First `_architecture/ARCHITECTURE.md`: the full target folder map, domain vocabulary, page vs component table, naming table, placement rules, import directions, store rules and state table, conventions, rendering, budgets, and where Phases 2 and 3 plug in.
    - Area `CONTEXT.md` files carrying each area's rules, so agents find them where they work. Folder guidance, not empty placeholders:
      - `src/app/app-shell/CONTEXT.md`
      - `src/app/shared/CONTEXT.md`: what qualifies for `shared/`, promote-on-second-consumer, no cross-imports between shared folders
      - `src/app/shared/design-system/CONTEXT.md`: agnostic rule, sub-group list, optional harness rule, mockup class map
      - `src/app/shared/curated-websites/CONTEXT.md`: domain vocabulary ("curated website", never bare "source"), service vs store split
      - Feature folders get a `CONTEXT.md` when they're built (Phase 3), not now.
    - `.agents/context/engineering-guidelines.md`: how to build (conventions, page vs component, naming table, CLI commands), how to write a store, how to test (the hybrid pattern pointing at the reference spec), lint and format, dependency rule, update procedure.
    - `AGENTS.md`: reword the gate so the MVP rule applies to pages, features and content, while foundation phases are set up deliberately. Update the stage line. Add table rows for the guidelines doc and the friction log.
    - `principles.md`: align the "no production-readiness pipeline" line with the same distinction.
    - `TODO.md`: check off planning, add the step checklist.
    - `BACKLOG.md`: CI workflow and Dependabot, hosting and deploy (ADR 009), service worker, Playwright e2e smoke, Lighthouse check, lint as an agent stop hook (per Steyer 2026), data pipeline (`sources/` to `src/generated/`), client-side search library pick, the vocabulary follow-ups in "Open points".
    - Log in `llm-progress-complete.jsonl`.

## Your manual actions

- Review, commit and push. No accounts or secrets are needed in Phase 1.
- Decide whether the `.agents/context/*.md` lines in `.gitignore` are intentional (see friction log).

## Open points for the reviewer

- **Vocabulary outside `src/app/`.** `sitemap.yaml` still says `source_detail` and `/source/:id`. The repo has a `sources/` data folder and a `source-ingest` skill. Phase 1 only fixes the name inside the app. Renaming the route URL (for example `/website/:id`) and the repo folders is a product call, logged to the backlog, not done here.
- **`shared/curated-websites/` vs a top-level `curated-websites/`.** Steyer would make the domain its own top-level folder. It's under `shared/` because every feature uses it and you wanted `shared/` to hold stores and services.

## Verification

- `pnpm install --frozen-lockfile && pnpm run format:check && pnpm run lint && pnpm run build && pnpm run test:ci`: all pass (you run them, or approve an agent running them).
- `ng g c` dry runs produce `.component.ts` and `.page.ts` files with `joo-` selectors.
- The built `index.html` contains prerendered markup. No `server.mjs` in the output.
- `pnpm run serve:static-build`: the preview browser loads `/`, and an unknown path shows the not-found page. Screenshots at 390px and 1440px.
- The reference hybrid spec fails when the asserted heading text changes (quick flip, then revert).
- Lint fails on a feature-to-feature import and on a design-system-to-domain import.
- Paper-trail validation script passes on all new docs.
