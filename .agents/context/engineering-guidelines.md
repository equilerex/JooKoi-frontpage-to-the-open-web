# Engineering guidelines — how to build in this repo

The how-to companion to `_architecture/ARCHITECTURE.md` (what the structure is) and `_architecture/plans/decisions/` (why). Read this before writing app code.

Applies to `src/` only. Repo-level conventions are in `AGENTS.md`.

## Commands

| Task                       | Command                                               |
| -------------------------- | ----------------------------------------------------- |
| Install                    | `pnpm install` (CI: `pnpm install --frozen-lockfile`) |
| Dev server                 | `pnpm start`                                          |
| **Correctness gate**       | watch dev server — see `AGENTS.md`, Iteration loop    |
| Tests (watch)              | `pnpm test`                                           |
| Tests (headless, one shot) | `pnpm run test:ci`                                    |
| Format                     | `pnpm run format` / `pnpm run format:check`           |
| Serve the production build | `pnpm run build` then `pnpm run serve:static-build`   |

The watch dev server is the correctness gate after every change — strict TypeScript plus `strictTemplates` is what catches mistakes here, not a test suite. Tests run when asked, not on every change. Production builds belong to CI; `AGENTS.md`'s Iteration loop table is the single source for the gate scheme.

UI verification: check at **390px** and **1440px** in the preview browser.

## Conventions

Angular 22, zoneless, standalone. Use:

- Signals: `signal`, `computed`, `linkedSignal`, `resource` / `httpResource`.
- `input()` and `output()` functions, not the decorators.
- `inject()`, not constructor parameter injection.
- Built-in control flow (`@if`, `@for`, `@switch`), `@defer`, lazy routes.
- **Signal Forms** for any form.
- `isDevMode()` instead of environment files — there's no API config to vary.
- `ng add` for Angular libraries, `ng generate` for new code, so the `angular.json` prefix and suffix defaults apply. Don't hand-write files the schematics can produce.

Strictness on top of the generated strict set: `noUncheckedIndexedAccess`, `noImplicitOverride`, `strictTemplates`, `strictInjectionParameters`. Don't relax any of them; fix the type.

## Where does this file go

Placement rules, first match wins (ADR 005 — full version in `ARCHITECTURE.md`):

1. One feature uses it → that feature's folder.
2. Rendered once around every page → `app-shell/`.
3. 2+ consumers and it knows about curated websites → `shared/curated-websites/`.
4. Anyone could use it, knows nothing about websites/routes/state → `shared/design-system/`.
5. App-wide behaviour, not something you see → its own folder in `shared/`.

**Promote on the second consumer**, in the same change that adds it. Never earlier. No `<feature>-shared/` folders.

**Group by feature, never by code type.** No `components/`, `pages/`, `services/` or `stores/` folders. A component's `.ts`, `.html`, `.css` and `.spec.ts` sit together.

Import directions are enforced by generated `no-restricted-imports` blocks in `eslint.config.js`. If lint blocks an import, the fix is to move the code or rethink the split — not to add an exception.

## Pages vs components

A **page** is a route target. It reads route params, injects stores, arranges children. `.page.ts`, `XPage`, `joo-x-page`, flat in the root of its feature folder, referenced only from a `*.routes.ts`. One page per feature folder.

A **normal component** is presentational. Data in through `input()`, events out through `output()`. `.component.ts`, `XComponent`, `joo-x`, its own subfolder, referenced only from templates. **Never injects a store.**

Seeing a `.page.ts` tells you it's a route target without opening it. This is a convention with no lint rule behind it — keep it honest.

## Naming

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

Names are semantic and spelled out. No acronyms. No `utils.ts`, `helpers.ts`, `common.ts`. `shared/` is the only generically named folder, and everything inside it names what it is.

**Domain vocabulary:** the things this app lists are **curated websites**, never bare "source" in app code.

### Generating

```bash
# normal component (own folder, .component.ts, joo- element selector)
ng g c website-search/search-filter-rack

# page component (flat in the feature folder, .page.ts, joo-*-page selector)
ng g c website-search/website-search --type=page --flat --selector=joo-website-search-page

ng g s shared/curated-websites/curated-websites-data
ng g d shared/design-system/surfaces/corner-brackets
```

Add `--dry-run` first if you're unsure what lands where.

## Writing a store

Two tiers (ADR 010). Plain `signal` / `computed` / `linkedSignal` for state that belongs to one component and dies with it. **NgRx SignalStore** (`@ngrx/signals`) for state that is shared, persists, or has real logic.

Rules:

- One store per file, `<thing>.store.ts`, exporting `<Thing>Store`.
- Built from `withState`, `withComputed`, `withMethods`, `withHooks` — same shape every time.
- **Only page components inject stores.**
- Stores don't inject other stores. The page coordinates two stores. If that grows, write an ADR.
- Stores don't fetch. They call a `.service.ts` in the same folder. The service's public API hides how data arrives.
- State changes only through store methods. `patchState` never leaves the store file.
- **No `effect` for syncing state.** Use `withComputed`, `computed` or `linkedSignal`. `effect` is for genuine side effects only.

Provision: root domain data `providedIn: 'root'`; route-scoped view state in the route's `providers` array, so it's created and destroyed with the route.

Shareable view state (search query, filters, sort, page) lives **in the URL**, with the store as a typed view over it — reads query params into state, writes back with `router.navigate`. Not a second source of truth.

No store exists yet. The first one is written in Phase 3.

## Writing a test

Vitest browser mode, Playwright/Chromium (ADR 008). Every test is a **hybrid interaction test**:

1. Render the real component with `TestBed.createComponent` (or the route with `RouterTestingHarness`).
2. Find elements **by role or label** — not by CSS selector, not by test id.
3. Fire real events with `userEvent` from `vitest/browser`.
4. `await fixture.whenStable()`.
5. Assert on what the DOM shows.

That's Act / Wait / Assert for a zoneless app.

- **Never** call `fixture.detectChanges()`.
- **Never** call component methods directly. If a behaviour isn't reachable through the DOM, the test is asserting the wrong thing.
- `page` and `userEvent` come from `vitest/browser` — no `@testing-library/*` dependency is needed.

**Reference spec: `src/app/app.component.spec.ts`.** It navigates to an unknown path, finds the not-found heading by role, clicks the home link with `userEvent`, waits, and asserts the route changed. Copy its shape.

Pages are tested through their route with `RouterTestingHarness`. Normal components with `TestBed.createComponent` and input values. Stores through the page that uses them, or directly when they hold real logic. Pure functions may get plain unit tests.

Component harnesses (`<name>.harness.ts`) are **optional** — only for markup complex enough that other tests would otherwise reach into internals (Aria-backed selects, listboxes, grids).

Per `AGENTS.md`: add a test only when it helps the agent iteration loop. Not for coverage, not as insurance.

## Styles

Cascade layers (ADR 007), declared once in `src/styles/cascade-layers.css`:

```css
@layer reset, tokens, base, components, utilities;
```

- Component styles use default `Emulated` encapsulation and read **semantic tokens only** — never a raw colour or size, never another component's class.
- No `::ng-deep`. No `ViewEncapsulation.None` without an ADR.
- Plain CSS. No Sass, no Tailwind.
- Theme tokens are custom properties under `[data-theme]` on `<html>`; `data-theme="retro"` is static in `index.html` so prerendered output has no flash.

## Lint and format

- `pnpm run lint` — `angular-eslint` plus the generated import-direction rules. Selector prefix `joo` is an error: element/kebab-case for components, attribute/camelCase for directives.
- `pnpm run format` — Prettier over the whole repo. `eslint-config-prettier` runs last in the ESLint config so the two don't fight.
- The `.prettierrc` Angular-template parser override is scoped to `src/**/*.html`. The static mockups in `features/design-theme/` use the normal HTML parser.

## Dependency rule

A new dependency needs a stated reason it earns its place over the web platform or a few lines of our own code, recorded in the ADR or commit that adds it (ADR 003). Check the no-dependency option first — twice in Phase 1 it won (import boundaries via built-in `no-restricted-imports`; role queries and `userEvent` from `vitest/browser`).

**Pin, and check peer ranges.** npm `latest` runs ahead of Angular's peers: on 2026-09-15 TypeScript `latest` was 7.0.2 against a `>=6.0 <6.1` peer, and Vitest `latest` was 5.0.0 against `^4`. Read `@angular/build`'s peer ranges before `pnpm add`.

Angular majors are upgraded on a branch named `upgrade/angular-<major>` with `ng update @angular/core @angular/cli @ngrx/signals`.

## Keeping this file true

This file is updated **in the same change** as the code it describes. If a convention here stops matching `src/`, the change isn't finished.

- A new rule with reasoning behind it → an ADR in `_architecture/plans/decisions/`, and a pointer from here.
- A structural change → `_architecture/ARCHITECTURE.md` too.
- A trap found the hard way → `.agents/context/gotchas.md`.
- Tooling or process friction → `_architecture/workflow-friction-log.md`.
