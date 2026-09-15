# Decision 008 — Testing: Vitest browser mode, hybrid interaction tests

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

`AGENTS.md` says tests are added only where they help the agent iteration loop, not for coverage. That makes the _shape_ of a test the important call: a test that asserts on component internals tells an agent nothing useful and breaks on every refactor, while a test that drives the real DOM catches the thing that actually regressed. The app is zoneless, which rules out the `detectChanges()` habits most Angular test examples still use.

## Options considered

1. Karma plus Jasmine — the legacy default, no longer what `ng new` produces.
2. Vitest in jsdom — fast, but a simulated DOM: no real layout, no real focus, no real pointer events.
3. Vitest in **browser mode** via Playwright/Chromium — real browser, real events.

## Decision

Option 3. Vitest browser mode with `browsers: ["chromium"]`, and every test written as a **hybrid interaction test**:

- Render the real component with `TestBed.createComponent`.
- Find elements by role or label, not by CSS selector or test id.
- Fire real events with `userEvent` from `vitest/browser`.
- `await fixture.whenStable()`, then assert on what the DOM shows.

That is Act, Wait, Assert for a zoneless app. **Never** call `fixture.detectChanges()` and never call component methods directly — if a behaviour can't be reached through the DOM, the test is asserting the wrong thing.

- Page components are tested through their route with `RouterTestingHarness`. Normal components are tested with `TestBed.createComponent` and input values.
- **Component harnesses are optional.** A design-system component gets a `<name>.harness.ts` only when its markup is complex enough that other tests would otherwise reach into its internals — Aria-backed selects, listboxes, grids.
- Stores are tested through the page that uses them, or directly when they hold real logic (filtering, URL mapping). Pure data-transform functions may get plain unit tests.
- No e2e suite in Phase 1. A Playwright smoke test is in `_architecture/BACKLOG.md`.

The reference implementation is `src/app/app.component.spec.ts`: it navigates to an unknown path with `RouterTestingHarness`, finds the not-found heading by role, clicks its home link with `userEvent`, waits, and asserts the route changed. New tests copy its shape.

## Why not the alternatives

Karma is deprecated and is not what the CLI generates. jsdom would be faster to start but would quietly weaken every assertion the hybrid pattern depends on — focus order, real click targets, computed styles — which is precisely the class of bug a retro-HUD interface with custom controls produces.

One thing checked before deciding: Vitest browser mode's `page` and `userEvent` API ships inside the `vitest` package itself (`vitest/browser`, re-exported through `@vitest/browser-playwright/context`). Role-based queries and `userEvent` need no `@testing-library/*` dependency, so decision 003's dependency rule is satisfied with zero additions beyond the runner.

## Next step

Tests are added per feature as features are built. If the reference spec's Act/Wait/Assert shape drifts, `.agents/context/engineering-guidelines.md` is the file to correct, and the spec with it.
