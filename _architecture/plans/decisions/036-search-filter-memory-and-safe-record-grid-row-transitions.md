# Decision 036 — search-filter-memory-and-safe-record-grid-row-transitions

Date: 2026-09-22

Status: DECIDED

## Problem

Filtering results in `joo-record-grid` on `/search` felt jarring and instantaneous as items flopped in and out. The user required smooth enter and exit transitions for filtered table rows without artificial `min-height` constraints.

Earlier attempts at animating rows caused severe UI freezes, memory leaks, and mouse unresponsiveness because:
1. `transform` or `height` animations on `display: table-row` elements violate the CSS table formatting model and force synchronous layout recalcs across all table cells on every frame.
2. `@for` loops tracked by index (`$index`) destroyed and recreated rows on every filter change, queuing leave animations for every row even when rows persisted across filter steps.
3. Undebounced typing in keyword search synchronously fired filter cycles on every keystroke, piling up dozens of overlapping leave transitions and holding zombie DOM elements in memory.

## Options considered

1. **Strictly disallow all row enter/leave animations (ADR 035 initial stance)**: Rejected. Instantaneous popping of rows during category and facet filtering created an abrasive experience.
2. **Animate height/transform on rows**: Rejected. Modifying box model geometry on `<tr>` forces synchronous reflow across the entire table and freezes the main thread.
3. **Compositor-only opacity transitions with stable row key tracking and debounced input filtering**: Adopted.

## Decision

1. **Compositor-only CSS keyframe entrance on `<tr>` without Angular runtime bindings**:
   - `tr.is-animated` executes pure CSS `@keyframes recordGridRowEnter` from `opacity: 0` to `opacity: 1` over 140ms (`--duration-state`, `var(--ease-out)`).
   - Bypasses Angular's internal compiler `[animate.enter]` / `[animate.leave]` bindings, which invoke `determineLongestAnimationFromComputedStyles` and RAF queue listeners that triggered `[Violation] 'requestAnimationFrame' handler took 88ms` and caused static opacity bugs.
   - Removed rows unmount immediately without holding phantom DOM nodes or ghost click targets.
   - Strictly zero `transform`, `height`, or layout properties are transitioned on `<tr>`.
   - Disabled completely under `@media (prefers-reduced-motion: reduce)`.
2. **Stable identity tracking via `rowKey`**:
   - `RecordGridComponent` exposes `rowKey = input<keyof T & string | ((row: T) => unknown)>('id')`.
   - `trackRow(index, row)` tracks by unique row identity, falling back to `index` if no key exists.
   - Only genuinely departing or entering rows undergo transitions; unaffected rows stay in place without DOM re-creation.
3. **Decoupled input typing from filter evaluation**:
   - `SearchPage` uses `kwInput` signal for immediate input keystroke rendering, and debounces `kw` filter updates by 120ms.
   - Prevents overlapping animation storms during rapid typing while keeping input feedback instantaneous.
4. **Supersedes ADR 035 clause 1**:
   - Collection data rows may use enter/leave transitions provided they are strictly opacity-only, tracked by unique ID, and protected against rapid-fire keystroke cascades via input debouncing.

## Why not the alternatives

- Opacity transitions execute on the GPU compositor thread without forcing CPU layout recalculation or table reflow.
- Stable tracking ensures that a filter removing 2 out of 50 rows only animates those 2 rows leaving, rather than thrashing all 50.

## Next step

- Update ADR 035 to mark Clause 1 superseded by Decision 036.
- Update `_architecture/ARCHITECTURE.md` and `.agents/context/engineering-guidelines.md` to reflect safe opacity transitions.
