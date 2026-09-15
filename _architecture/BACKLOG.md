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
