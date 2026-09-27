# Decision 012 — Component boundaries derived from visual role, not from mockup markup

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED -->

## Problem

`src/app/shared/design-system/CONTEXT.md` carried a 1:1 map from mockup CSS class to Angular component: `.led` becomes `status-light/`, `.key` becomes `hardware-key-button/`, and so on. The map was written by reading `features/design-theme/components.css`.

The mockups are hand-written static HTML built to look right, not to express a component tree. Their class names and DOM nesting encode the shortest path to a rendering, not the design's actual parts. Deriving components from them inherits every shortcut as an architectural boundary, and produces names for relationships that do not exist on screen.

## Options considered

1. Keep the class map. It is written, it is complete, and it is cheap.
2. Derive components from the rendered pages, treating the CSS as a paint source only.

## Decision

Option 2. **A component's identity, name and boundary come from its visual role.** The mockup's HTML structure, DOM nesting and class names are ignored when deciding what a component is. The CSS is raw material for painting a component once its boundary is already settled.

The class map in `shared/design-system/CONTEXT.md` is superseded by the inventory in `plans/2026-09-15-angular-design-system-phase-2.md` Part 1 and is rewritten in Phase 2.

Three concrete places the two derivations disagree, which is the evidence for the rule:

- **`.led` is two components, not one.** The bare emissive dot and the dot seated in a metal bezel ring look different on screen. The markup hides this by making the bezel version internal to `.toggle`.
- **A classification badge cannot take a `color` input.** Its meaning is carried by border treatment and shape. Reading the CSS suggests a colour variant, because colour is what the selectors vary. Looking at the page shows colour is not what distinguishes them.
- **The hardware key is one component, not four.** The markup spreads it across button, nav link, latching toggle, pager card and dock item. On screen it is the same pressable slab in five placements.

The same rule reassigns two parts the map put outside the design system: `.trust` and `.sig` are visually a generic classification badge and a generic capability tag. They belong in `shared/design-system/`, and the domain layer configures them rather than owning them.

## Why not the alternatives

The class map is faster and mostly correct, and its correct parts are still used — as CSS sources. But its errors are the expensive kind: a wrong component boundary is baked into every consumer and is costly to unpick later, while a wrong colour value is a one-line fix. The three disagreements above are not edge cases; two of them are load-bearing parts of the design.

## Next step

Phase 2 rewrites `shared/design-system/CONTEXT.md` around the visual inventory. When a new component is proposed later, it is justified by what it looks like and what visibly changes about it, not by which mockup class it replaces.

The method itself is written up as a reusable skill at `.agents/skills/visual-component-derivation/SKILL.md` — this ADR is the call for this project, the skill is the procedure for any project.
