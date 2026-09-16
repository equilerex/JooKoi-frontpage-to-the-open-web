# Decision 013 — Page templates are agnostic components in the design system

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED -->

## Problem

The mockups show four distinct page shells — launcher, rack plus results, detail split, and document — each a specific responsive grid, each reused across more than one page. Phase 2 is meant to deliver "base templates for the different types of pages" alongside the component system.

The folder map in `ARCHITECTURE.md` has `page-layouts/` for layout primitives (the toolbar row, the drawer, the split), but no home for a whole-page shell. It is also not obvious that a page shell belongs in `shared/design-system/` at all, since a page is the one thing that is usually route-aware.

## Options considered

1. Put the four shells in `app-shell/`, next to the chrome.
2. Put them in `shared/design-system/page-layouts/` alongside the layout primitives.
3. Add a new `shared/design-system/page-templates/` sub-group.

## Decision

Option 3: a new **`shared/design-system/page-templates/`** sub-group holding `launcher-template/`, `rack-results-template/`, `detail-split-template/` and `document-template/`.

They are components with named projection slots and nothing else — no `Router`, no `ActivatedRoute`, no stores, no domain models. The agnostic rule applies to them unchanged, and the existing generated `no-restricted-imports` block already enforces it. A Phase 3 page component imports a template, fills its slots, and owns all the routing and state itself.

They are kept separate from `page-layouts/` because the two answer different questions. `page-layouts/` holds pieces you compose _inside_ a page. `page-templates/` holds the outermost grid a page _is_. Collapsing them would make it ambiguous which of the fourteen things in that folder a page should start from.

`ARCHITECTURE.md`'s folder map gains the ninth sub-group.

## Why not the alternatives

`app-shell/` (option 1) is defined by placement rule 2 as what renders **once around every page**. The four templates are mutually exclusive — a page uses exactly one — so they fail that test. The chrome that genuinely does wrap every page (backdrop, HUD header, mobile dock) stays in `app-shell/`. Option 2 keeps the folder count down at the cost of the distinction that makes the folder navigable.

## Next step

Phase 2 builds the four templates after the chrome and before `record-grid`, and renders each one in `/specimen` with placeholder slot content, checked at 390px and 1440px. `ARCHITECTURE.md` and `shared/design-system/CONTEXT.md` are updated in the same phase.
