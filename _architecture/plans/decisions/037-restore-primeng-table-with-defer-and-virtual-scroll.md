# Decision 037 — Restore PrimeNG Table with lazy route/chunk loading and virtual scrolling

Date: 2026-09-22

Status: DECIDED

## Problem

Decision 032 had stripped PrimeNG `p-table` out of `RecordGridComponent` and replaced it with a plain `<table>` to bypass an initial bundle budget failure caused by `HomePage` being an eager route. This removed virtual scrolling and built-in PrimeNG data-table capabilities, and directly contradicted Decision 011 ("Adopt: Table with virtual scroll... `@defer` is the fix if the warn line is crossed, not a raised budget").

When viewing long tables (such as the 104-item directory on the Search page), rendering all unvirtualized rows in the DOM caused layout thrashing on sort and filter operations.

## Options considered

1. Re-implement custom virtual scrolling and sorting logic from scratch using raw DOM manipulation or CDK scrolling wrappers on a plain `<table>`.
2. Restore PrimeNG `Table` inside `RecordGridComponent`, keeping routes lazy (`loadComponent`) and using `@defer` / lazy chunking as originally planned in Decision 011.

## Decision

Option 2: Restore PrimeNG `Table` (`p-table`) inside `RecordGridComponent`, honoring Decision 011.
- `RecordGridComponent` wraps `p-table` with pass-through cell templating (`jooRecordGridCell`), `tableStyleClass="joo-record-grid"`, and custom design tokens.
- Supports `[virtual]="true"` with `[virtualScrollItemSize]="rowHeight()"` and `[scrollHeight]="scrollHeight() || 'flex'"` for long tables.
- Keeps routes lazy loaded (`loadComponent: () => import(...)` in `app.routes.ts`) so `TableModule` remains isolated in lazy chunks rather than bloating `main.js`.

## Why not the alternatives

Option 1 unnecessarily reinvented data-table primitives (virtual scrolling, ARIA attributes, keyboard navigation, sort mechanics) that the project had already evaluated, selected, and styled in Phase 2 via PrimeNG.

## Next step

Precomputed base rows in `search.page.ts` (`BASE_SEARCH_ROWS_MAP`) prevent re-running URL parsing and date formatting during sorting/filtering. Verify search page performance and ensure unit tests pass.
