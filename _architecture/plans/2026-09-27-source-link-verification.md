# Source link verification

Session: 27-09-2026 16:52. Status: planned, not started. Depends on `2026-09-27-sources-data-pipeline` (reads `sources/*.json`, merges at its build step).

## Context

Claim 1 of the four-claims gate (`principles.md`, discovery review A1) is "the URLs are real: every entry has been fetched, verified, and re-verified on a schedule... Verification is the product's hard edge, not a maintenance chore." Nothing in the repo does this. `verified` is a date typed by hand, or invented by `outletToSource` (`'2026-09-19'` for every outlet). Decision 017 assigned the ingestion tooling (`source-ingest`, `probe-url.mjs`) to `JooKoi-developer-stack`, and neither exists there. So the product's primary claim is currently unbacked, and the "~500 sources in under an hour a month" budget has no measurement behind it.

## Design

### Script: `scripts/verify-sources.mjs`

Run by hand, monthly or after adding a batch. Not scheduled and not in CI: `principles.md` says curated, not crawled, no automated re-updates, and a failing external site must never fail a build.

Checks per record, built-in `fetch` only:

| Target | Check | Pass |
|---|---|---|
| `url` | `HEAD`, fall back to `GET` on 405 or 501 | final status 2xx |
| `searchUrl` | `GET` with `{q}` substituted by a fixed probe term (`test`) | 2xx, and the final URL still carries the term (catches search that redirects to the homepage) |
| `feeds[].url` | `GET` | 2xx and the body starts like XML or JSON |
| `sourceUrl` | `HEAD` | 2xx |

Politeness and determinism: one request at a time per host, a small global concurrency (6), 10 s timeout, one retry on network error, an honest `User-Agent` naming the project and repo. Redirects are followed, and the final URL is recorded.

Result classes: `ok`, `redirected` (ok but the canonical URL moved, the author should update the record), `blocked` (401, 403, 429, or a known bot wall: the site is probably fine and a browser can reach it), `dead` (404, 410, DNS failure), `error` (timeout, 5xx, TLS). `blocked` is its own class because treating Cloudflare walls as dead would make the report useless.

### Output: `data/link-status.json`

Machine-observed, the fast clock, which is what `data/` is for per `AGENTS.md`. Committed, so the build and the deployed site see it. Keyed by source id: `{ checkedAt, url: { status, class, finalUrl }, searchUrl: {...}, feeds: [...] }`. The script keeps the previous `lastOk` per target, so a site that was fine last month and times out today reads as "unreachable since X", not as dead.

A console summary per run: counts per class, then every non-`ok` target with its record id and file, sorted by severity. That list is the monthly maintenance to-do.

### In the app

`build-sources.mjs` merges the status into each record at build time. The hand-written `verified` field is removed from the schema and replaced by derived `lastChecked` (date of the last `ok`) and `linkState` (`ok` | `moved` | `unreachable` | `dead`). The existing "verified" column shows `lastChecked`. Every reader of `verified` switches with it: `sortByVerified` (`source-search.ts:225`), the "Verified" sort option (`search.page.ts:129`), the `ver` cell in `search.page.ts` and `home.page.ts`, and home's "recently verified" panel. Records never checked sort last. Records that are `dead` stay listed with a visible dead marker and a dimmed action key, instead of disappearing: a record that silently vanishes looks the same as one that was never curated.

No record has status before the first run. The build treats missing status as `unchecked` and shows no date.

## Open questions for the user

1. Remove the hand `verified` field (this plan's recommendation), or keep it as "curated on" beside the machine `lastChecked`? Two dates in one table is the cost of keeping it.
2. Dead records: show with a marker (recommended), or hide from search results and list them only in the script report?

## Build order

1. `verify-sources.mjs` with the check table and classes. First run against the migrated data, report reviewed with the user.
2. Fix or remove what the first report finds. This is editorial work in `sources/`, done with the user.
3. `data/link-status.json` merge in `build-sources.mjs`, schema change for `verified`.
4. Record-grid display of `lastChecked` and `linkState`, checked in the running browser at 390 px and 1440 px.
5. Paper trail: `sources/CONTEXT.md` gets the monthly routine (run, read the report, fix, rebuild). `principles.md` claim 1 points at the script. First run's wall time goes into `principles.md` as the first real maintenance measurement.

## Implementation deviations
