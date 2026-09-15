# Decision 006 — Component behaviour library: Angular Aria plus CDK, not Material

Date: 2026-09-15

Status: DECIDED — amended by decision 011

Decision 011 adopts PrimeNG in styled mode as the component base, skinned through a custom preset and cascade-layer ordering. Angular Material stays rejected — the objection recorded here is to Material's stubborn theme and limited override surface specifically, not to component libraries as a class, and PrimeNG's `cssLayer` emission is the override mechanism Material lacks. Aria and CDK stay available for bespoke controls, but with PrimeNG covering the overlay class, Aria may see little or no use in Phase 2. CDK arrives regardless as a PrimeNG peer.

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The design direction (decision 001) is a heavily styled retro HUD. Its controls — segment selectors, stompbox toggles, listboxes, popups — need real keyboard handling, focus management and ARIA state, which is the part that's tedious and easy to get wrong. None of them need, or can use, an off-the-shelf visual style. The Phase 1 handoff brief recommended CDK only, written before Angular Aria stabilised.

## Options considered

1. Angular Material — themed components with behaviour built in.
2. Angular CDK alone — behaviour primitives, no components.
3. Angular Aria plus CDK — headless, unstyled directives for the component patterns, with CDK underneath for overlays and test harnesses.

## Decision

Option 3: **Angular Aria plus CDK**. This supersedes the handoff brief's CDK-only recommendation.

Aria has been stable since Angular v22. Its directives are headless and unstyled and handle keyboard, focus and ARIA state, and you style them through ARIA attributes, which suits the HUD look — the state a control is in is already in the DOM as an attribute, so the CSS reads directly off it. CDK supplies the overlay that Aria popups need, plus component harnesses for tests (decision 008).

Phase 1 records the decision only. Phase 2 installs the packages with `ng add` or pnpm when the design system is built.

## Why not the alternatives

Material ships a theme the design would fight the whole way, and overriding it means `::ng-deep` and specificity battles that decision 007 rules out. Its behaviour is the part worth having and Aria gives that without the styling. CDK alone would mean re-implementing the keyboard and ARIA logic for each pattern by hand, which is what Aria now covers.

## Next step

Phase 2 installs `@angular/aria` and `@angular/cdk` at the versions matching the Angular major in use (both were 22.1.6 at planning time), and builds `shared/design-system/` on top of them.
