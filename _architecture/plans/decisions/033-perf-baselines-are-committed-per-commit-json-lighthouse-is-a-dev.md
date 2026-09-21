# Decision 033 — Performance baselines are committed per-commit JSON; Lighthouse is a devDependency; CI is built

Date: 2026-09-21

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

`ux:lab` already ran Lighthouse through `npx --yes lighthouse`, which downloads whatever version is current on every run and logs to a gitignored `.local/` folder. Nothing could be compared across commits, and the versions were not reproducible. Decision 009 deferred CI until the app was close to done. The user asked for both: a standard way to detect performance regressions between commits, and that it run in CI.

## Options considered

1. Keep `npx lighthouse` and gitignored history.
2. `lighthouse` as a pinned devDependency, one committed JSON baseline per commit, compare command, CI gate.
3. A hosted service (Lighthouse CI server, RUM).

## Decision

Option 2. Supersedes the "build deferred" part of decision 009 for CI; hosting stays deferred.

- `lighthouse` is a devDependency. `scripts/ux-lab.mjs` runs it locally, three runs per URL, median per metric, on `/`, `/search`, `/library` and one library document.
- `pnpm run ux:lab:record` writes `_architecture/perf-baselines/<short-sha>[-dirty].json`: commit, Angular and Lighthouse versions, per-page score/LCP/FCP/TBT/CLS/transfer, and bundle sizes from `stats.json`. A baseline recorded on a dirty tree carries `-dirty`; re-record it after committing.
- `pnpm run ux:lab -- --compare[=<sha>]` prints deltas against the newest (or named) baseline.
- `pnpm run build` passes `--stats-json`, so the bundle numbers always exist.
- `scripts/ux-lab.budgets.json`: `absolute` values are targets (printed, never fail). `regression` tolerances fail `--strict`.
- `.github/workflows/ci.yml` runs format:check, lint, test:ci, build (which enforces the `angular.json` budgets), then `ux:lab:ci` against the committed baseline.
- `serve-static-build.mjs` now serves `<route>/index.html` for prerendered routes and compresses text with brotli, so the lab measures the prerendered pages a static host would serve. Before that it served the CSR fallback for every deep route with no compression, which inflated every number about 2x.

## Why not the alternatives

Option 1 is not reproducible and cannot compare commits. Option 3 needs infrastructure this project does not have, and decision 009 rules out host-specific setup for now. Absolute limits do not gate CI because the current pages exceed them (see Next step) and gating on a number nobody can meet would be turned off within a week. Regressions against a recorded baseline are the actionable signal.

## Next step

First baseline is `4e8d0ba-dirty`. Re-record it once the working tree is committed, and delete the `-dirty` file. Lab CI runners have different CPU than this machine, so the first CI run will likely need a new baseline recorded from a CI artifact. Known above-target pages: `/search` TBT ~780 ms and LCP ~5.2 s, `/` LCP ~4.4 s, library README LCP ~5.0 s. Logged in `BACKLOG.md`.
