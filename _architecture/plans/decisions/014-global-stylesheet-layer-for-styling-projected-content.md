# Decision 014 — Global stylesheet layer for styling projected content

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

A component whose whole template is `<ng-content />` cannot style what its consumer projects into it. Under the default emulated encapsulation, `:host h2` compiles to `[_nghost-c] h2[_ngcontent-c]`, and a projected node carries the *parent* template's `_ngcontent`, so the descendant half never matches. The rule compiles and then silently matches nothing — there is no error, no warning, and no visible symptom except unstyled content.

Confirmed by reading the emitted bundle rather than by reasoning about it: `:host(.is-hot) .key` emits as `[_nghost-%COMP%].is-hot .key[_ngcontent-%COMP%]`.

Two parts have this contract. `joo-logotype` styles the accent `<b>` its consumer supplies, and `joo-prose-content` styles arbitrary projected long-form HTML. Decision 007 bars `::ng-deep` and requires an ADR for `ViewEncapsulation.None`, so neither escape hatch is available.

## Options considered

1. Descendant rules in the global stylesheet, inside `@layer components`, scoped by the component's custom-element name.
2. `::ng-deep` from the component's own stylesheet.
3. `ViewEncapsulation.None` on the component, letting the element name do the scoping.
4. Requiring the consumer to put a class on every projected element.

## Decision

Descendant rules that must reach projected content live in `src/styles.css` inside the existing `@layer components` block, scoped by the component's custom-element name — `joo-prose-content h2`, `joo-logotype b`. The component's own box rules stay in its own stylesheet under `:host`.

The layer placement is load-bearing, not incidental. `components` sits after `tokens` and `base` and before `utilities` in the order declared for the cascade layers, so these rules beat base element defaults and still lose to a utility class. A projected element therefore stays overridable by whoever uses the component.

## Why not the alternatives

- **`::ng-deep`** is barred by decision 007, and it leaks further than this does: it pierces into child components' templates, while an element-name rule stops at the host's subtree.
- **`ViewEncapsulation.None`** needs its own ADR under decision 007, and it gives up far more — it drops the component's own template out of emulated scoping too, so its internal classes become page-global to fix a problem that concerns only the projected part.
- **Per-element classes** push the design system's styling contract onto every consumer and make the consumer's markup depend on the theme, which is the coupling the component exists to remove.

## Next step

Both current instances ship this way. Anyone moving one of these rules back into its component's stylesheet will unstyle the projected content with no error to warn them, so a rule that appears dead in a component stylesheet should be read as a hint to check here first. Add a third instance the same way. If a case arrives that an element name cannot scope — projected content that needs to be distinguished by something other than its tag — that is the point to revisit this, and it should be its own decision rather than a quiet broadening of this one.
