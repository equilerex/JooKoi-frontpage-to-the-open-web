# Sources data pipeline

Session: 27-09-2026 16:52. Status: built 27-09-2026, supersedes decision 017. Covers parked items t013 Data pipeline: `sources/` to `src/generated/` and t045 Cut source-fixture from main, and part of t047 Fix /search interaction cost and t048 Home and library LCP above 4s in lab.

## Context

The app's one dataset is `src/app/shared/curated-websites/source-fixture.ts`: 3,944 lines, 21 exported arrays plus one `WebOutlet[]`, merged at module load by `compileAllSources()` into `ALL_SOURCES` (313 URLs). Decision 017 chose a hand-written fixture over `sources/` plus a compiler "until the schema has proven itself against real records", and named this migration as its next step. The schema has now held through Phase 3, home, search and the AI-marketplace work, so the condition is met.

What the fixture costs today:

- **Bundle.** `home.page.ts` and `search.page.ts` import `ALL_SOURCES` statically, so the full dataset loads with home, the landing route, even though home only needs counts, the top 8 tags and the top N by trust. The shell already dynamic-imports it for `.length` (`app-shell-layout.component.ts:85`), so the 119 kB t045 Cut source-fixture from main measured is out of main but still on the landing path.
- **Runtime merge.** `compileAllSources()` runs on every load: dedupes by `id` with a spread merge (a later array silently overrides fields of an earlier one), normalises `YYYYMMDD` dates, converts `WebOutlet` records with hard-coded `trustScore: 88` and `verified: '2026-09-19'`. None of that is visible to the author, and none of it fails loudly.
- **No validation.** A malformed `searchUrl` without `{q}`, a bad capability or a duplicate id compiles fine as long as the type allows it. Several arrays are untyped (`alternativeMenswearGlobal = [`), so even the type check is partial.
- **Wrong home for the data.** `AGENTS.md` says `sources/` is human-authored data on the editorial clock. It is empty. The link checker (`2026-09-27-source-link-verification`) needs to read and annotate records without importing Angular code.

## Design

### Authoring format: JSON plus a JSON Schema

`sources/<group>.json`, one file per current thematic group (keeps the author's grouping, keeps diffs local). Each file is `{ "$schema": "./source.schema.json", "sources": [ ... ] }`. `sources/source.schema.json` describes `Source`, which gives autocomplete and inline validation in the editor with no dependency.

Rejected: YAML. Nicer for long `desc` strings and comments, but needs a parser devDependency, and the dependency rule asks for the no-dependency option first. The fixture's in-code authoring rules (the AI-marketplace Search↗ rules at `source-fixture.ts:28-34`) move to `sources/CONTEXT.md`, where they are rules for the author rather than comments in data.

`WebOutlet` disappears as a type. The migration writes those records as ordinary `Source` entries with the values `outletToSource` currently invents, so they become visible and editable.

### Build step: `scripts/build-sources.mjs`

Deterministic, no network. Reads `sources/*.json`, validates, writes generated TypeScript. Follows the library-content precedent (`scripts/build-library-content.mjs`, decision 027): output is committed, so `pnpm start` works without a prebuild and diffs show what changed.

Validation fails the build with file and record named: duplicate `id` across files, missing required field, unknown capability, `searchUrl` without `{q}`, unparsable URL, `verified` not `YYYY-MM-DD`, `trustScore` outside 0 to 100, `capabilities` includes `site-search` but no `searchUrl` (and the reverse). Duplicates are an error, not a merge. The one-time migration resolves the existing ones.

Outputs, under `src/app/shared/curated-websites/`:

| File                        | Contents                                                                                                                                | Imported by                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `sources.generated.ts`      | `ALL_SOURCES: readonly Source[]`, sorted by `id`                                                                                        | `search.page.ts` only (lazy route chunk) |
| `source-stats.generated.ts` | `SOURCE_COUNT`, category and tag counts, top tags, the home highlight set (top N by trust, already reduced to the fields the row needs) | shell, `home.page.ts`                    |

The split is what removes the dataset from main and from the home chunk. Home stays prerendered and stays static, no `httpResource` and no fetch at runtime. The script owns `HIGHLIGHT_COUNT`, `TAG_PANEL_COUNT` and the highlight order (trust descending, then `name.localeCompare`, the same rule as `sortByTrust` in `source-search.ts:220`) and writes them into `source-stats.generated.ts`. Home imports them from there. A `.mjs` script cannot import a `.ts` constants file, so the script is the single owner.

If the link-verification plan lands, the script also merges `data/link-status.json` into each record at this step. That is the other plan's concern, this plan only leaves the merge point.

### Wiring

- `package.json`: `sources` script, and `build` runs it before `ng build` the same way it runs `content`. `build-gh-pages.mjs` runs it too.
- Dev loop: editing `sources/*.json` needs `pnpm run sources`, then the watch server picks up the regenerated `.ts`. Same model as library content today.
- `source-fixture.ts` and `compileAllSources()` are deleted. `source-search.spec.ts` needs no change, it never imported the fixture.
- `.prettierignore` gets `src/app/shared/curated-websites/*.generated.ts`, as the library's generated files already have, so the lint Stop hook does not reformat generated output.

### One-time migration

`scripts/migrate-fixture-to-sources.mjs`, run once and deleted in the same change. Node 24 strips types but cannot import the fixture as-is: line 1 imports `./source.model` without an extension and fails with `ERR_MODULE_NOT_FOUND`. That import carries only types, so the script copies the fixture to a temp file without it and imports the copy. It writes one JSON file per exported array and prints every id that appears in more than one array together with the fields that differ. The user decides each conflict before the build step's duplicate check goes on.

## Open questions for the user

1. Group files or category files? This plan keeps the author's thematic groups (`european-online-shops.json`, `esp32-hacker-sources.json`). The alternative is one file per `category` value, which matches how the app filters but scatters related additions.
2. The duplicate-id conflicts the migration reports. Expected to be a handful, answered in one pass.

## Build order

1. Migration script, conflict report, user resolves duplicates, JSON files written.
2. `source.schema.json`, `sources/CONTEXT.md`.
3. `build-sources.mjs` with validation. Run against the migrated data until it is clean.
4. Generated modules. Switch shell, home and search imports. Delete the fixture and the migration script.
5. Wire `package.json` and `build-gh-pages.mjs`.
6. Paper trail: supersede decision 017 (or record the change in `decision-history/` per the migration plan's outcome), update `shared/curated-websites/CONTEXT.md`, `ARCHITECTURE.md` data section, close t013 and t045.
7. Batch gate: `test:ci` once. Home and `/search` checked in the running dev server at 390 px and 1440 px. CI owns the production build and `ux:lab:ci`, which report the chunk change.

## Implementation deviations

Built 27-09-2026. Calls made during the build, without the user (they said "review and proceed"):

- **Open question 1 answered with the recommendation:** one file per former thematic array, `sources/NN-<group>.json`. Numeric prefixes because relevance sort falls back to input order on ties, so the generated order must equal the old `ALL_SOURCES` order. Sorting by `id`, as the design said, would have changed the default table order. `03-bleeding-edge-tech` does not exist: all 8 of its records were duplicates of `02-tech-and-culture`.
- **Open question 2 answered by the old runtime rule, not by the user:** the 22 duplicate ids are merged exactly as `compileAllSources()` did (first position, later fields win), so the migration changed no visible data for them. Review them in `02-tech-and-culture.json`, `09-`, `10-` and `01-core.json` if any merged field looks wrong.
- **Real data problems the new validation found and fixed:** 30 camelCase ids renamed to slugs (`amazonDe` → `amazon-de`). 10 sites were listed twice under different ids with the same URL (for example `internetArchive` and `internet-archive`, `dr` and `dr-dk`, `arena` and `are-na`) and showed as two rows. Merged by the same rule. Record count 216 → 206. The build now rejects duplicate sites (URL without scheme, `www.` and trailing slash).
- **Not enforced:** `site-search` in `capabilities` versus the presence of `searchUrl` disagree on 110 records (58 one way, 52 the other). The UI keys off `searchUrl`. Parked as its own cleanup item instead of failing the build.
- **Shell reads `SOURCE_COUNT` statically.** The count is a build-time constant, so it is prerendered and the `afterNextRender` dynamic import is gone. No placeholder, no shift.
- **`package.json` was invalid** before this work (a stray `c` after `"tslib": "^2.3.0"`, uncommitted). Removed, since `pnpm start` could not run.
- **Dev server on 4201, not 4200.** Port 4200 was held by `jookoi-personal-history-scraper`'s explorer. This repo had no server running.
- Migration script deleted after one run, as planned. The fixture file is deleted.
