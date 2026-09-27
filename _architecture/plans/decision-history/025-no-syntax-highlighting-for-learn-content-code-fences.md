# Decision 025 — No syntax highlighting for learn content code fences

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The vendored learn markdown has fenced code blocks. Rendering them plainly loses language-aware coloring; rendering them highlighted costs a dependency.

## Options considered

- Add `highlight.js` (dev-only, paired with `marked`) for syntax-highlighted fences.
- Render fences to plain `<pre><code>`, with no highlighting.

## Decision

No syntax highlighting (D9). `marked` renders fenced code to plain `<pre><code>`.

## Why not the alternatives

Fourteen fences across twenty documents, two of them labelled with a language. `highlight.js` is not worth a dependency, even a dev-only one, at that volume.

## Next step

Purely additive later if the volume of fenced code in learn content grows enough to justify it.
