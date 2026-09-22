# Decision 035 — no-deprecated-angular-animations-and-url-filters-without-navigation

Date: 2026-09-22

Status: PARTIALLY SUPERSEDED by [Decision 036](036-search-filter-memory-and-safe-record-grid-row-transitions.md) (Clause 1 row exit animations evolved to safe compositor opacity transitions with stable tracking)

## Problem

Filtering on `/search` and toggling facets (category, type, capabilities, region, keyword) caused severe performance degradation:
1. Complete UI and mouse freezing for several seconds on filter actions or typing.
2. The page unconditionally jumped/scrolled to `(0, 0)` (top of the page) whenever any filter or keyword changed.
3. Rapid keystrokes or fast clicking caused `AbortError` exceptions from View Transitions and zombie element leaks.

Investigation revealed two root causes:
1. **Row exit animations in collection rendering**: The grid table rows had `[animate.enter]` and `[animate.leave]` bindings. On every filter change, Angular intercepted element removal for hundreds of rows, bound hundreds of listeners, calculated `window.getComputedStyle(el)` inside `requestAnimationFrame` (triggering forced synchronous layouts), and held outgoing rows in the DOM during transition timeouts. Rapid filtering multiplied zombie rows and resulted in UI freezes and memory leaks. In addition, legacy `@angular/animations` is deprecated starting in Angular 20.2+ in favor of modern CSS native capabilities.
2. **Router navigation used for in-page filter state**: Every filter action executed `router.navigate()`. Because `app.config.ts` configures `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`, every forward navigation without a restored history scroll offset triggered `RouterScroller.scrollToPosition([0, 0])`. Furthermore, each navigation triggered `document.startViewTransition()` through `withViewTransitions()`, cancelling in-flight transitions on keystrokes and causing frame stutter.

## Options considered

1. **Keep Angular enter/leave animations on rows but debounce them**: Rejected. Tables containing tens or hundreds of items must never animate row-by-row exits during active filtering. It destroys scanning readability and inherently blocks DOM pruning.
2. **Use `router.navigate()` with custom extras (`skipLocationChange` or manual scroll preservation)**: Rejected. `router.navigate()` still runs full Angular routing cycles, router guards, resolvers, `NavigationStart`/`NavigationEnd` lifecycle events, and global View Transition hooks. For typing in a keyword input or toggling filter chips, running the routing machinery on every event is an architectural anti-pattern.
3. **Pure in-memory signals without URL sync**: Rejected. Search filters must be shareable and survive page refresh or back/forward navigation.
4. **Writable signals for state + silent URL memory via `Location.replaceState()` + pure CSS without row animations**: Adopted.

## Decision

1. **Zero animations on data collection rows**: Do not animate table rows or collection items (`@for`) in `joo-record-grid` or search results. The grid remains a plain `<table>` tracked by `$index` per Decision 032. Elements are added and removed from the DOM immediately.
2. **No `@angular/animations`**: The deprecated `@angular/animations` package remains absent from the project. Any discrete UI animation (dialogs, drawers, dropdowns) must use native CSS transitions or `@starting-style`.
3. **In-page filter state uses writable signals with `Location.replaceState()`**:
   - Filter state (`category`, `type`, `region`, `lang`, `trusted`, `caps`, `sort`, `kw`, `q`) is owned by component signals initialized from `ActivatedRoute.snapshot.queryParamMap`.
   - Modifying a filter synchronously updates signals and renders immediately.
   - The browser URL is updated in-place via `Location.replaceState()` (debounced for text input), preserving shareability and page refresh memory without triggering Angular router navigation events, `RouterScroller` scroll-to-top resets, or View Transitions.
   - External navigations (header search, quick keys, browser Back/Forward) are observed via `route.queryParamMap.pipe(takeUntilDestroyed())` to resynchronize signals.

## Why not the alternatives

- Rebuilding routing pipeline workarounds (`NavigationExtras`) fights the framework's configured scroll restoration and global view transitions. `Location.replaceState()` directly meets the requirement of URL memory without side effects.
- Attempting to animate row insertions/removals in data grids creates severe performance bottlenecks and poor usability when scanning data.

## Next step

- Document this rule in `.agents/context/gotchas.md`, `.agents/context/engineering-guidelines.md`, `_architecture/ARCHITECTURE.md`, and `src/app/app-shell/CONTEXT.md`.
- Ensure any future list or table views adhere to immediate DOM reconciliation without enter/leave retention.
