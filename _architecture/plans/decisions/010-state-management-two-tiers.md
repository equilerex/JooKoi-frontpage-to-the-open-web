# Decision 010 — State management: plain signals and NgRx SignalStore, two tiers

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The app has three kinds of state that behave differently: a read-only catalogue of curated websites, search and filter state that should survive a page reload and be shareable as a link, and ordinary per-component UI state. Without a rule for which is which, each agent session invents its own signal-service pattern and the shapes stop matching across features.

## Options considered

1. Plain signals everywhere, with hand-written signal services for anything shared.
2. Classic NgRx Store — actions, reducers, effects, selectors.
3. Two tiers: plain signals for component-local state, NgRx SignalStore for everything else.

## Decision

Option 3, confirmed by the user.

- **Plain `signal`s** (`signal`, `computed`, `linkedSignal`) for state that belongs to one component and dies with it.
- **NgRx SignalStore** (`@ngrx/signals` 22.x) for state that is shared between components, persists (URL, browser storage), or has real logic — loading, filtering, derived views.

**Store rules** (after Steyer 2026):

- One store per file, `<thing>.store.ts`, exporting `<Thing>Store`.
- Only page components inject stores. Normal components get data through `input()` and report through `output()`.
- Stores don't inject other stores. When two stores need coordinating, the page does it. If that grows, it's a new ADR.
- Stores don't fetch data themselves. They call a `.service.ts` in the same area.
- State changes only through store methods; `patchState` stays inside the store.
- No `effect` for syncing state. Use `withComputed`, `computed` or `linkedSignal`.

**Where each kind of state lives:**

| State kind                     | Example                             | Where                                                                                                                                           | Provided                                                 |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Domain data, read-only         | the curated websites and categories | `shared/curated-websites/curated-websites.store.ts`                                                                                             | `providedIn: 'root'`                                     |
| Shareable view state           | search query, filters, sort, page   | the URL, mirrored by `website-search/website-search-query.store.ts`, which reads query params into state and writes back with `router.navigate` | route `providers` (created and destroyed with the route) |
| Local UI state                 | panel open, focused row             | component `signal`s; `linkedSignal` for editable values derived from inputs                                                                     | component                                                |
| Persistent user state (parked) | bookmarks, personal homepage        | `shared/local-preferences/` store over `shared/browser-storage/`                                                                                | `providedIn: 'root'`                                     |

**Why the URL holds view state:** a filtered search can then be bookmarked, shared, prerendered or restored — that's principle 2, persistence, from `.agents/context/principles.md`. The store is a typed view of the URL, not a second source of truth.

**Data loading:** the service's public API does not depend on how data arrives. Bundled JSON import or per-category JSON fetched with `httpResource` (which works with prerendering) is a Phase 3 data-pipeline decision.

## Why not the alternatives

Classic NgRx Store models event-driven global state that this app doesn't have — there are no long-running workflows, no optimistic writes, nothing to replay. It would be ceremony per feature with no payoff.

Hand-written signal services as the shared-state pattern is the tempting zero-dependency option, and it is what decision 003's dependency rule would normally push towards. SignalStore earns the dependency anyway on one argument: every store gets the same shape (`withState`, `withComputed`, `withMethods`, `withHooks`) instead of a slightly different hand-rolled pattern per agent session. Consistency is the whole point in an LLM-assisted repo. 2026 guidance (Steyer; the ABP write-up on Angular 22) puts SignalStore at exactly this level.

## Next step

Phase 1 installs `@ngrx/signals@~22.0.1` and documents the pattern in `.agents/context/engineering-guidelines.md`. **No store code is written yet.** The first real store is `curated-websites.store.ts` in Phase 3.
