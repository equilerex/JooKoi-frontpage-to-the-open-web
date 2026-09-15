# Decision 001 — Retro HUD design theme v3 as visual direction

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The app needed a visual language before components get built. Input: `visual-design-style.md`, the page types in `sitemap.yaml`, and the markdown styling in the sibling repo JooKoi-md-archive. Requirements from the user: rich, tactile, 80s retro-futurist interface with a Ready Player One and cyberpunk lean, good on mobile, calm and readable for text and data, plain markdown documents look like md-archive.

## Options considered

1. v1: restrained token set with flat shapes and colour.
2. v2: maximalist physical object. Beige terminal case, CRT, pedalboard of literal stompboxes, results as cartridges.
3. v3: dark neon HUD with three surface families. Rich chrome for controls, flat readout for tables and data, light paper sheet for markdown. Separate mobile layout.

## Decision

v3, as built in `features/design-theme/` (`tokens.css`, `components.css`, six mockup pages). Details and gotchas live in `features/design-theme/CONTEXT.md`. Retro is the default theme. A later "sleek" theme redefines only the semantic token layer.

## Why not the alternatives

- v1 read as too minimal. No tactile or retro character.
- v2 leaned old arcade cabinet instead of retro-futurist. Pedals were meant as inspiration for controls, not drawn as devices. Mobile was unusable, and decoration sat under text that needs to be read.

## Next step

Phase 2 (after the Angular foundation, see decision 002) extracts these mockups into a design system inside the app. Component behaviour library (Angular CDK recommended over Angular Material) is settled in the Phase 1 setup plan.
