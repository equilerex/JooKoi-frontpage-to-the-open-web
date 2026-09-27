# Decision 032 — Home is lazy, record-grid is a plain table, initial budget 700-900kB

Date: 2026-09-21

Status: SUPERSEDED by Decision 037

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

> **Superseded by [Decision 037](037-restore-primeng-table-with-defer-and-virtual-scroll.md)**:
> Replaced the plain table removal. PrimeNG `Table` was restored per Decision 011 with lazy chunking / route deferral and virtual scrolling.

## Problem

The first production build of the Phase 3 app failed: initial bundle 1.31 MB raw against a 500 kB error budget (that budget was set in the empty-foundation phase, never derived from real numbers). Measured with `stats.json`: `HomePage` was an eager route, and `record-grid` wrapped PrimeNG `p-table`, which drags datepicker, inputnumber, paginator, scroller and select code (~400 kB raw) into any chunk that shows a grid. `source-fixture` (119 kB) was also in `main`, for one `ALL_SOURCES.length` in the shell status text. The library content files were not the cause: each of the 23 docs is already its own lazy chunk.

## Options considered

- Keep `p-table`, load the grid with `@defer (hydrate on viewport)` (needs `withIncrementalHydration()`).
- Replace `p-table` with a plain `<table>` inside `record-grid`, same API and CSS.
- Just raise the budget.

## Decision

`record-grid` renders a plain `<table class="joo-record-grid">`. The `virtual` and `rowHeight` inputs are removed (only the dev-only specimen used `virtual`). Its padding moved from `--png-datatable-*` variables to plain rules in `src/styles.css`. `HomePage` is a `loadComponent` route. `angular.json` production budgets: `initial` 700 kB warning / 900 kB error, plus `anyScript` 700 kB warning / 1 MB error (raw bytes; measured initial is 640 kB raw, 150 kB transferred). `learn/:topic` is `RenderMode.Client` in `app.routes.server.ts` because a param route cannot prerender.

Measured after: home route lazy cost 649 kB to 25 kB, search 667 kB to 255 kB, `primeng-table` appears in no chunk.

## Why not the alternatives

The grid is read-only with no sorting or paging, so `p-table` was paying for features nothing used, and hydration deferral would only hide that cost while adding a hydration mode and pre-hydration dead-UI states. Raising the budget alone would have kept 1.3 MB on every home visit.

## Next step

`src/app/shared/curated-websites/source-fixture.ts` (119 kB) is still in `main` via `app-shell-layout.component.ts` (status count). The specimen's 5,000-row "virtualised" demo now renders a plain table and should be trimmed or removed. Remaining perf work (Lighthouse baseline script, per-SHA JSON) is in `BACKLOG.md`.
