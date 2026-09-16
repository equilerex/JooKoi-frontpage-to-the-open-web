# Backlog — logged, not yet scoped

<!-- Deliberately unordered. Pull an item into TODO.md's checklist when it gets a real slot. See AGENTS.md. -->

## AI basics 101 onboarding doc

Status: OPEN

Daily concepts, model routing, session hygiene — currently scattered across `AGENTS.md` and the dev-stack blueprint. Offered in the original research pass, never written.

## Execution-phase discipline doc

Status: OPEN

Session boundaries, state handoff, review economics, recovery from a bad step. Offered in the original research pass, never written.

## Code navigation

Status: OPEN

Flagged as genuinely wanted in every research pass, skipped every time. Nothing currently answers it.

## Personal knowledge-notes index

Status: OPEN

Knowledge files accumulate across separate repos (research notes, decisions, explorations). Want a sub-section of this site exposing them as personal notes/education/ideas instead of leaving them buried in scattered repos. Likely shape: a deterministic pull script (list of source repo paths, glob for notes, copy into `sources/`) rather than live fetch-on-request — same "curated, not crawled" pattern as the main source list, same Stage 1 ingestion-spike mechanics. Rendering ties to the "Markdown rendering" item below (`JooKoi-md-archive`).

## Markdown rendering

Status: OPEN

If this project ever needs to render Markdown content, inherit from `JooKoi-md-archive` rather than building it fresh.

## CI workflow and Dependabot

Status: OPEN

Shape recorded in `plans/decisions/009-ci-and-hosting-deferred.md`: a GitHub Actions workflow running `format:check`, `lint`, `build`, `test:ci`, with the build budgets enforced by `build`. Every step already exists as a pnpm script, so the workflow is a list of script names. Dependabot alongside it, which automates decision 003's Angular-major upgrade branches. Deliberately not built in Phase 1 — pull this in when the app is close to done.

## Hosting and deploy

Status: OPEN

Also decision 009. Candidates, unranked: Cloudflare Pages (free, branch previews), Vercel, nginx on the existing Linode. Phase 1 keeps the door open — static output, base href `/`, no host-specific code or config in the app. Picking a host turns decision 009 from DEFERRED to DECIDED, or supersedes it.

## Service worker

Status: OPEN

Parked in `plans/decisions/004-static-prerendering-no-server.md`. The build is fully static, so `@angular/pwa` would work, but offline support and cache invalidation are their own problem and nothing needs them yet.

## Playwright e2e smoke test

Status: OPEN

Decision 008 explicitly keeps e2e out of Phase 1. A thin smoke suite over the built static output — home page loads, an unknown path reaches the not-found page, one outbound link resolves — would be worth it once there are real pages. Playwright is already installed as the Vitest browser provider, so this needs no new dependency.

## Lighthouse check

Status: OPEN

A performance and accessibility pass on the built output, once there are real pages to measure. Pairs with the build budgets already in `ARCHITECTURE.md`. Manual first; only automate it into CI if the numbers actually move.

## Lint as an agent stop hook

Status: OPEN

Per Steyer 2026 (`tsarch for AI Coding Agents`): run the architecture lint rules as a hook when an agent finishes a turn, so a boundary violation is caught before the change is reported as done rather than at the next manual lint. The generated `no-restricted-imports` blocks in `eslint.config.js` are already the rule set this would run. Harness-specific, so it may belong in `.claude/settings.json` rather than the repo.

## Data pipeline: `sources/` to `src/generated/`

Status: OPEN

Phase 3 work, flagged by decision 010. A deterministic script in `scripts/` turns the human-authored `sources/` data into typed build-time data under `src/generated/` (gitignored). Open inside it: whether the app gets a bundled JSON import or per-category JSON fetched with `httpResource`, and how `getPrerenderParams` for `website-detail` reads it. The schema stays open until the Stage 1 ingestion spike produces real data.

## Client-side search library pick

Status: OPEN

`principles.md` scopes search to client-side filtering over a small curated set. Once the real data exists, decide whether the pure functions in `shared/curated-websites/website-filtering.ts` are enough or whether an index library (MiniSearch, Fuse, FlexSearch) earns its place under decision 003's dependency rule. Don't pick before there's data to measure against.

## Vocabulary: `source` outside `src/app/`

Status: OPEN

Decision 005 renamed the domain to **curated website** inside the app only. Still using the old word: `_architecture/sitemap.yaml` (`source_detail`, route `/source/:id`), the `sources/` data folder, and the `source-ingest` skill. Renaming the public route (for example `/website/:id`) is a product call, not a refactor — it changes URLs. The `sources/` folder and the skill may legitimately keep the word, since outside app code "source" isn't ambiguous.

## `shared/curated-websites/` vs a top-level `curated-websites/`

Status: OPEN

Steyer's layout would make the domain its own top-level folder. Decision 005 put it under `shared/` because every feature uses it and `shared/` was wanted as the home for stores and services. Revisit once two or three real features exist and it's clear whether `shared/` is carrying too much. If it moves, decision 005 gets superseded rather than edited.

## Final review — deferred minors

Status: OPEN

Flagged by the final whole-branch review as non-blocking and parked rather than fixed in the same pass:

- `engines.node` in `package.json` never narrowed to `24` though ADR 003 says it was.
- `src/styles.css` (global reset/base file) sits outside the `@layer` cascade declared elsewhere.
- `angular.json`'s prerender config has a `{ path: '**', renderMode: Prerender }` entry that is a silent no-op (no non-`''` routes exist to prerender).
- `pnpm-workspace.yaml` has placeholder `allowBuilds` values from pnpm's non-interactive scaffold (needs a `pnpm approve-builds` pass later).
- `jsdom` dependency appears unused.

## Dock item styling: the per-item LED bar was dropped

Status: OPEN

The mobile dock renders each item as `joo-hardware-key`, not the mockup's `.dock__item`. Decision 012 makes the key one component in five placements and nav link is one of them, so the dock matches the HUD nav and `indicator-nav-list` — but the mockup's `.dock__item` carried a hand-drawn 22x4px LED bar that went cyan and glowing on `[aria-current='page']`, and the key has no equivalent. `current` still renders `aria-current="page"` and the key's pressed slab, so the current page is signalled; the mobile "you are here" accent is not. Same shape as the nav-list active-row divergence parked in Task 11: accept the key's treatment, and revisit together. Cost if wrong: a few declarations in one place once the design call is made. Do not reintroduce `.dock__item` without that call — decision 012 is what makes the dock a data-driven list rather than four hard-coded anchors.

## Nav list rows are key slabs, not the mockup's flat rows

Status: OPEN

indicator-nav-list renders every row as a key slab — uppercase display type on a raised slab in the key's muted --k-text — where the mockup's rows in features/design-theme/browse.html are sentence case, --text-sm and --text-muted on a flat transparent background. The mockup also puts a .chip__count in each row (features/design-theme/components.css:1137-1140, browse.html:73-75) and NavItem has no field to represent it. Consequence: the nav list reads noticeably heavier than the mockup intends, and the count chip is not representable at all. Accepted in T11-2 for the active row; the question is whether the rest of the row should follow.

## Port the three .launcher narrow-screen rules to the components that own them

Status: OPEN

The mockup's narrow block at features/design-theme/components.css:1418-1430 has three rules that reach projected content and so cannot live in joo-console-landing-template: .launcher .logotype { font-size: 2rem } (:1418-1420, owed to joo-logotype), .launcher .keygrid { grid-template-columns: repeat(2, 1fr); gap: var(--space-2); padding: var(--space-2) } (:1422-1426, owed to joo-keycap-grid), and .launcher .keycap { min-height: 3.25rem } (:1428-1430, owed to joo-keycap). They were not ported in the page-template work because each one is a property of the component's own box at narrow widths, not of the launcher layout: a rule in the template stylesheet compiles with the template's own _ngcontent and projected nodes do not carry it, so it would match nothing (measured: the compiled selector is .launcher__lead[_ngcontent-X] > [_ngcontent-X] and matches 0 elements on the running console-landing demo). Each component needs its own @media (max-width: 767px) block setting the same values, after which the launcher demo will pick them up automatically.

## Port the mockup's base body typography

Status: OPEN

features/design-theme/components.css:30-37 gives body { margin: 0; min-height: 100dvh; background: var(--bg-page); color: var(--text-primary); font: 400 var(--text-md)/1.55 var(--font-read); -webkit-font-smoothing: antialiased }. It was never ported: src/styles/base-element-styles.css holds only a reset, and --bg-page is defined in src/styles/design-tokens.css but used nowhere. Measured on the running app (2026-09-16, port 4250, /specimen): body font-family "Times New Roman", font-size 16px, line-height normal, background rgba(0,0,0,0). Every component that sets its own font looks right; the gap only shows on text no component owns, e.g. the specimen index lede (.specimen-page__lede computes to "Times New Roman" while its colour correctly resolves to --text-muted). Found during the page-template work and left alone as out of scope.

## Record grid: who owns horizontal overflow

Status: OPEN

The mockup wrapped its table in `.table-wrap { overflow-x: auto }` (`features/design-theme/components.css:1149-1151`). The port deliberately did not carry it, and `joo-record-grid` has no containment of its own: above 767px the grid is eight columns with `white-space: nowrap` on `th` (`src/styles.css:284-289`), so inside a parent narrower than the table's natural width nothing scrolls or clips and the page itself widens.

Task 17 fixed the 767px card layout by letting the tracks shrink (`grid-template-columns: minmax(0, auto) ...`), measured at 390px: `document.documentElement.scrollWidth` 620 to 390, with no containment rule needed. That is the card case only. The wide table still has no owner.

Phase 3 decides: `overflow-x: auto` on the host (the mockup's answer), or a declared minimum width with the page carrying the scroll. Cost of leaving it: a page that puts the grid in a narrow column silently widens the viewport.

## Vitest resolves roles from its own vendored table

Status: OPEN

`getByRole` in the Vitest browser tests resolves roles from a table **vendored inside Vitest**, not from the accessibility tree of the page under test: `node_modules/.pnpm/@vitest+browser@4.1.11_*/node_modules/@vitest/browser/dist/index.js:5056`. It is a hand-maintained map, and it disagrees in places with the engine actually rendering the page (`playwright-core@1.63.0` `lib/coreBundle.js`).

Symptom: a role assertion fails or passes differently in a test than in the live DOM, with no error pointing at the cause. The table is not configurable and not documented.

Phase 3 tests should reach for `getByLabelText`, `getByText` or an explicit `data-testid` when a role query behaves oddly, and the browser is the arbiter, not the table. Worth a decision only if a role query actually blocks a real test.

## Design-system fidelity deltas against the mockup

Status: OPEN

Small places where the shipped component and the mockup do not agree. None is a defect on its own; together they are the reason "done" means checked in the browser, not diffed against the mockup.

- `:focus-visible` ring is defined at `features/design-theme/components.css:43` and the port's ring does not match it exactly.
- `prefers-contrast: more` logotype override exists in the mockup (`components.css:1686-1690`) and was not carried across.
- Keycap interior padding is about 2px off the mockup's.
- Navigation rows are `2.75rem` in the port and `2.5rem` in the mockup.
- A contentless head at 390px renders a box the mockup does not.
- `segment-readout` paints its ghost digits above the live digits rather than behind them.

Fix them only if the difference is visible in the running app at 390px or 1440px. Recorded so the next reader knows these are known, not missed.

## Budgets and tooling owed a decision

Status: OPEN

Five things tooling owes a decision on. Each is one call, none blocks anything today.

- **The 320 kB bundle warn is exceeded** and so is the component-style warn. `ARCHITECTURE.md` records the fact and deliberately no current number, because any figure here would be stale the moment `record-grid` landed. The decision is whether the warn lines move, whether `@defer` comes in, or whether the budget is dropped as a gate for a prototype.
- **Component-style budget:** `hardware-key.component.css` is 2.44 kB and `console-input.component.css` about 2140 B, against PrimeNG's own stylesheet budget calc.
- **`pnpm run format` rewrites tracked `pnpm-lock.yaml`** because there is no `.prettierignore`. Harmless but noisy; a one-line ignore fixes it.
- **`src/styles.css:1` still carries the `ng new` CLI placeholder comment.** Removing it would have added an unlisted path to Task 18's commit, so it was left and recorded instead.
- **Completed plans in `_architecture/plans/` carry pre-rule gate lines.** `2026-09-15-angular-foundation-phase-1.md` names `ng build` as the gate at several steps. These are the record of a finished phase that predated the Iteration loop rule, not instructions, and rewriting them would falsify that record. They were left deliberately. If a reader may copy them, the fix is a one-line banner at the top of the file, not an edit to its steps.

## Mockup patterns with no owner

Status: OPEN

The mockups carry patterns no component owns, and one is load-bearing:

- `<details class="drawer panel">` — a native disclosure styled as a panel, `features/design-theme/components.css:1351-1377`. It is interactive, it appears in the mockups in more than one place, and nothing in `shared/design-system/` implements it. Either it becomes a component or Phase 3 pages hand-roll it; hand-rolling it in a page is the outcome to avoid.

Anything else in `features/design-theme/` that no component claims belongs here rather than a new entry.

## Decision records 013 and 014 have stale edges

Status: OPEN

Two decision records describe the folder shape slightly differently from what shipped.

- **013 (page templates)** proposed template folder names that are not the shipped ones — the shipped set is `console-landing-template`, `directory-browse-template`, `record-detail-template`, `document-template` under `shared/design-system/page-templates/`. The shipped names are what `ARCHITECTURE.md` and `shared/design-system/CONTEXT.md` now record; the ADR was left alone deliberately, since editing a decision after the fact is worse than a named divergence.
- **014 (global layer)** names the projected-content cases it knew about; the shipped set is the four targets listed in `shared/design-system/CONTEXT.md`. Same treatment.

Nothing is broken. Read the code, not the ADR, for the folder names.

## Record grid: mobile card layout is keyed to consumer field names

Status: OPEN

The mobile card layout in `src/styles.css` assigns `grid-area` through `[data-col='name']`, `[data-col='desc']`, `[data-col='act']` and four more, and `data-col` is the wrapper's own binding from `col.field` — so the responsive layout binds to whatever the consumer named its columns. `GridColumn` in `record-grid.component.ts` carries `field`, `header` and `width` and no separate layout key, which is stated outright at `src/styles.css:339-343`: a consumer whose field names are not these gets the stacked layout without the areas.

`CuratedWebsite` does not exist yet, so the fix is a Phase 3 call: either give `GridColumn` an explicit column role (name / desc / act) so the contract is typed rather than implied by string equality, or move these responsive rules out of `shared/design-system` into the feature that owns the schema.

Raised by the Phase 2 whole-branch review and parked deliberately rather than fixed, because designing a public-interface contract against a guessed schema is worse than waiting for the real table to exist. Cost of leaving it: a Phase 3 table whose field names differ silently loses its card layout. Mitigated because the behaviour is documented in the stylesheet itself, not silent.

## Unused design tokens and elevation entries

Status: OPEN

`--led-violet` (`--p-violet-400`), `--led-red` (`--p-red-400`) and `--metal-light` (`--p-chrome-100`) are defined in `src/styles/design-tokens.css:130,132,134` and referenced by no component. `ELEVATION.dock` and `ELEVATION.hud` in `theme/elevation.ts:8-9` are read nowhere — `app.config.ts` consumes only `menu`, `overlay`, `modal` and `tooltip`, while the comment in that file says to change one and change the other.

The LED pair is currently unreachable rather than merely unused: the `StatusLightColor` and `BezelJewelColor` types expose only `cyan`, `magenta`, `amber` and `green`. Both the tokens and the two `ELEVATION` entries look like a faithful forward-port of the full mockup palette, waiting on Phase 3. Decide then: use them, or delete them so the token scale stays honest.

Raised by the Phase 2 whole-branch review.

## Nav list has no list semantics

Status: OPEN

indicator-nav-list renders its rows as bare joo-hardware-key anchors directly under the navigation landmark — a template-level @for with no ul or li wrapper — so assistive tech reports the rows as individual links with no list and no item count. The mockup used ul and li for these rows in features/design-theme/browse.html, so this is a divergence rather than a deliberate simplification. Parked in Task 11 because the landmark defect it was found beside was the one worth fixing then, and changing the wrapper touches the key [block] layout. Decide in Phase 3 alongside the nav-list entry above: the port already renders each row as a key slab rather than a flat mockup row, and both questions are the same one — how far the row should follow the mockup.
