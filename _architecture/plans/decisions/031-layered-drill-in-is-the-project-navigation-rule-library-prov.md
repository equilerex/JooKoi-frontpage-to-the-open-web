# Decision 031 — Layered drill-in is the project navigation rule; library proves it

Date: 2026-09-18

Status: DECIDED

## Problem

Drill-in (list/browse → document/detail) was destroying the browse surface on every navigation: ephemeral UI (tree scroll, filter text) reset, and the right pane hard-swapped instead of stacking. The product wants mobile-app-like layered drill-in with retained ephemeral state, while shareable state stays in the URL. That rule is project-wide; library is the first place it can be proven.

## Options considered

- Keep child-route swap only; rely on `withViewTransitions` cross-fades.
- Named auxiliary router outlets / different URL shapes for the reader.
- Full `RouteReuseStrategy` + navigateDrill helper suite in one pass.
- Document as a right-pane overlay over a browse underlay; ephemeral UI in a layout-scoped store; URL paths unchanged.

## Decision

Layered drill-in is the navigation rule for this app. Shareable state lives in the URL. Ephemeral UI lives in a layout- or route-scoped store that survives child navigation. The detail/document is a **visual layer** over the browse surface with enter/leave motion; Back uses browser history; breadcrumbs navigate to ancestor URLs.

**Library MVP proof:** right pane only (tree stays). Document routes keep `/library/...` paths. Layout shows a browse underlay for the parent folder and stacks the routed document in a reader layer. `LibraryLayoutStore` (layout route `providers`) holds tree scroll and tree filter text. Search/browse adopt the same rule later. Deferred: aux outlets, global reuse strategy, navigateDrill helpers, query-param filter chips.

## Why not the alternatives

Cross-fade alone still destroys the browse component and does not feel like a stack. Aux outlets change URL ergonomics and break the literal prerendered path scheme. Full helpers/reuse in one pass is scope beyond the first proof.

## Next step

Implement per `_architecture/plans/2026-09-18-library-layered-drill-in.md`. Encode a short pointer in engineering-guidelines.
