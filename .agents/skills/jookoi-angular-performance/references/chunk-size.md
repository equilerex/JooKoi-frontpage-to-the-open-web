# Chunk and bundle size

Reducing initial bundle size and lazy chunk size for the `@angular/build:application` (esbuild) builder, including the chunk a user waits for after clicking a lazy route. Build-tool facts are read from Angular CLI `main` (v22 line). Facts verified on 20/21 are marked as such, everything else on `main` may differ in older versions. Budget defaults, compression and cache headers live in `build-and-deploy.md`. Lazy routes and `@defer` mechanics live in `loading.md`. Preloading lives in `preloading.md`.

## Triage first

1. Build production with `statsJson` on. Ask which problem it is: big initial bundle, one big lazy chunk, or slow navigation to a lazy route.
2. Offer options at three sizes and say what can be done now versus logged for later. Users often cannot fix the big items immediately.
3. Automate detection only. Ask before any swap, threshold, locale removal or loading-strategy change.

| Tier | Effort | Examples |
|---|---|---|
| Quick | minutes to an hour | `statsJson`, direct imports instead of barrels, diagnostic `namedChunks`, a warning-level budget |
| Moderate | hours to days, a few files | `@defer` a heavy component, lazy `import()` of a library, lodash or moment replacement, flatten nested lazy routes |
| Project | days to weeks, needs testing | replace a chart/editor/PDF library, drop CommonJS dependencies, re-cut feature boundaries, locale strategy |

Safe to automate (read-only): generate the stats file, list the largest chunks and their inputs grouped by package, grep for `from 'lodash'`, `from 'moment'`, `import * as`, barrel `index.ts` re-exports and `registerLocaleData`, read build warnings for CommonJS, compare raw sizes between two builds.

Needs the user: swapping a library (API and behavior differences), budget thresholds (a product call), removing locales, anything that changes visible loading states, CDN and server config (outside the repo).

## How chunks form

- The builder always runs esbuild with `splitting: true` for the browser bundle. Lazy chunk names are `chunk-<hash>.js`, or `<name>-<hash>.js` with `namedChunks: true` (default `false`). Verified on `main`.
- esbuild treats each dynamic `import()` target as an extra entry point. Code reachable from two or more entries goes into one shared chunk and is never duplicated. Code reachable from one entry stays in that entry's chunk.
- A large lazy chunk is therefore one of: a feature that legitimately imports a heavy library, a shared chunk that accumulates everything two or more routes touch, or a barrel import pulling unrelated modules into one entry. Decide from the stats file, not by guessing.
- `@defer` compiles to a dynamic `import()` per component, directive or pipe in the block. Only standalone declarations defer. A dependency referenced outside the block in the same file, or in a `ViewChild` query, stays eager.
- Barrel pitfall: importing a component through an `index.ts` keeps it in the main bundle regardless of `@defer`, because the bundler sees the barrel as one module. Import from the component file.
- `vendorChunk` and `commonChunk` do not apply to this builder (migration guide).

## Measure

1. `ng build` with the `statsJson` option (schema default `false`). On `main` the file is `browser-stats.json` (plus `server-stats.json` with SSR) at the output base `dist/<project>/`, not in `browser/`. It is the esbuild metafile itself. Older versions may use another name.
2. Open it in https://esbuild.github.io/analyze/ (Treemap, Sunburst, Flame).
3. Sort outputs by size. For the target chunk, sort its inputs and group by `node_modules/<pkg>`. See which package dominates.
4. Check which chunks import the package. If it appears in the initial chunk when a lazy chunk should own it, something eager imports it (a barrel or a root service with a heavy import).
5. Turn on `namedChunks` in a diagnostic build only. It makes the file and Network tab legible. It changes file names and can break post-build scripts.
6. Compare raw bytes before and after each change. Use the same production configuration, so tree-shaking matches.

## What the user waits for on click

Model (reasoning, not from a fetched source): with the default `NoPreloading`, a click on a lazy route makes the router call `import()`. The wait is at least one round trip, then download, then parse and execute. Nested lazy routes add a round trip per level.

- Chunk size matters less on a warm connection. Shrinking 20 KB to 10 KB changes little because the round trip dominates. Shrinking 300 KB matters on slow links.
- Repeat visits with hashed, cached chunks skip the network for unchanged chunks. Parse cost stays.
- Lazy loading adds requests later, and nested lazy loading at several levels can hurt (Angular docs). Eager-load landing pages, lazy-load the rest.
- Preloading hides the wait but spends bandwidth for users who never visit. See `preloading.md`. Shrinking the chunk or removing a waterfall is often cheaper than adding preloading and helps users who arrive by direct link too.
- `@defer` accepts a `prefetch` trigger clause after the main trigger. Triggers are `idle`, `viewport`, `interaction`, `hover`, `immediate`, `timer`.

Measure with DevTools Network throttled to Fast 4G or Slow 4G and time from click to first render. Add a Performance trace for parse cost. Code splitting reduces payload and main-thread work, which helps INP (web.dev).

## Options by size

### Quick

- Replace barrel imports at the eager/lazy boundary with direct file imports. Low risk.
- Add a warning-level `initial` budget plus an `anyScript` cap slightly above the current largest chunk, then ratchet down. Propose warnings only, never errors, without the owner's agreement.
- Fix whole-library imports that have a named form: `import throttle from 'lodash/throttle'` instead of the root package. `lodash-es` declares `"type": "module"` and `"sideEffects": false`. Per-method packages (`lodash.pick`) are discouraged upstream and grow the bundle through duplicated shared code.
- Audit `@angular/common/locales/*` imports. Only `en-US` ships by default.
- Inspect the `polyfills` array (default `[]`) for entries no longer needed.
- Icons: the Material Symbols font is 295 KB by default and about 1.7 KB with `icon_names` subsetting. `@primeicons/angular` and `lucide-angular` icons are standalone components, importable individually.

### Moderate

- `@defer` heavy below-the-fold or interaction-gated components (charts, editors, modals) with a `@placeholder`. Watch layout shift and cascading loads, both warned about in the docs.
- Lazy `import()` inside a service for libraries with no template surface (PDF export, editor).
- Flatten nested lazy routes to one level to remove chunk waterfalls.
- Move a heavy module that two routes share behind its own `import()` so it stops inflating the shared chunk, or accept it because it downloads once.
- Replace moment for formatting with `Intl.DateTimeFormat` or `Intl.RelativeTimeFormat`, or with date-fns or luxon for arithmetic. Needs a decision.

### Project

- Re-cut feature routes so each heavy library belongs to exactly one lazy route.
- Replace the largest single dependency (chart, editor, PDF) after measuring its `bytesInOutput` share.
- Drop CommonJS dependencies. The CLI warns about them because they hinder optimization. `allowedCommonJsDependencies` silences the warning and does not fix it.
- `externalDependencies` excludes packages from the bundle and expects them at runtime (import map or CDN). High risk (versions, CSP), so a user decision.
- Removing zone.js means a zoneless migration. That is a project, not a size fix.

## Budgets and size

- Budgets compare raw output bytes. The build table's estimated transfer size uses Brotli and is display-only, never used for budgets.
- `initial` sums JS and CSS of initial chunks. A `bundle` budget matches by chunk `name`, and names under esbuild come from the metafile `entryPoint`. Do not rely on a `bundle` budget for a lazy chunk before testing it.
- `anyScript` ("any script, individually") is a budget type that needs no chunk name. It is the suggested cap for "no lazy chunk above N kb". Test that it fires on your build.
- Read thresholds from the project's `angular.json`. angular.dev and the generated template disagree on `anyComponentStyle` defaults. Defaults and compression are in `build-and-deploy.md`.
- Wire size and parse cost differ. Compression cuts transfer, and parse cost follows raw size (see the unverified list).

## Pitfalls

- Barrels defeat both `@defer` and lazy routes.
- A `providedIn: 'root'` service that imports a heavy library pulls it into every consumer's chunk.
- `import * as` of a large library keeps unused exports when the library is CommonJS or lacks `sideEffects: false`.
- Moving code to `@defer` without a stable placeholder causes layout shift.
- Turning on `namedChunks` in production changes file names.
- Setting budget errors before the team agrees breaks CI on unrelated work.
- The tree-shaking claims for lodash-es and moment under esbuild are expectations until checked in the stats file.

## Read more

- https://angular.dev/tools/cli/build (budgets, CommonJS)
- https://angular.dev/guide/templates/defer
- https://angular.dev/best-practices/performance/lazy-loaded-routes
- https://angular.dev/tools/cli/build-system-migration
- https://raw.githubusercontent.com/angular/angular-cli/main/packages/angular/build/src/builders/application/schema.json (option defaults)
- https://esbuild.github.io/analyze/ and https://esbuild.github.io/api/#splitting
- https://raw.githubusercontent.com/evanw/esbuild/main/docs/architecture.md (code splitting)
- https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
- https://lodash.com/per-method-packages and https://momentjs.com/docs/#/-project-status/

## Unverified, check before relying

- Whether lazy `import()` chunks carry a metafile `entryPoint` (so `bundle` budgets can match them) and what `[name]` is for a pure shared chunk with `namedChunks`. Test on a real build.
- Exact metafile field names (`outputs`, `inputs`, `bytesInOutput`, `imports` with `kind`). They follow the esbuild metafile format but were not read from the real file.
- Whether code shared by the initial entry and a lazy entry stays in the initial bundle. It follows from the entry-combination rule but no doc states it.
- The click-wait model above, the round-trip-floor claim, and that parse cost follows raw size. These are reasoning, not sourced.
- Whether 20.x and 21.x use `browser-stats.json` and the same defaults. CLI source was read from `main` only.
- Whether `lodash-es` fully tree-shakes and how esbuild treats moment's dynamic locale lookup. The documented moment fixes are webpack-only.
- Per-locale bundling of `@angular/common/locales/*`, and `sideEffects` semantics for third-party packages.
- Sizes of date-fns, luxon and chart/editor/PDF libraries. None were fetched, so measure with the stats file.
- The `--stats-json` flag spelling. The option `statsJson` is confirmed and the kebab-case flag follows CLI convention.
