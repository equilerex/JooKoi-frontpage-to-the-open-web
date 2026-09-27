# Decision 007 — Styles architecture: plain CSS in explicit cascade layers

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The mockups in `features/design-theme/` are plain CSS with a custom-property token layer and a second theme planned on top of it. Moving that into an Angular app needs a rule for where global styles sit versus component styles, and a way to keep specificity predictable once component styles, base element styles and utilities all exist. Prerendered HTML (decision 004) adds one more constraint: the theme has to be correct in the first painted frame, or the static output flashes.

## Options considered

1. Tailwind — utility classes, its own layer system.
2. Sass — nesting, variables, partials.
3. Plain CSS with explicit `@layer` ordering and custom properties as tokens.

## Decision

Option 3. Global CSS in explicit cascade layers, declared once in `src/styles/cascade-layers.css`:

```css
@layer reset, tokens, base, components, utilities;
```

- Tokens are CSS custom properties under `[data-theme]` on `<html>`. `data-theme="retro"` is set **statically in `index.html`**, so prerendered HTML carries the theme and there is no flash.
- Component styles use Angular's default `Emulated` encapsulation and read semantic tokens only — never raw colour or size values, never another component's class.
- No `::ng-deep`. No `ViewEncapsulation.None` without an ADR.
- `--style=css` in the workspace. No Sass, no Tailwind, no CSS-in-JS.

Phase 1 ships the skeleton: `cascade-layers.css` and `base-element-styles.css` wired through `angular.json`. `design-tokens.css` arrives with Phase 2.

## Why not the alternatives

Tailwind replaces the token vocabulary the mockups already have and pushes styling into templates, which makes the retro surface families harder to express and would mean rewriting the mockups rather than extracting them. Sass earns nothing here: custom properties already do the variable job and do it at runtime, which is what a theme swap needs, and nesting is native CSS now. Per decision 003's dependency rule, neither clears the bar.

Layer order rather than specificity juggling is what makes this hold: a base element style can never accidentally outrank a component style, whatever the selectors look like.

## Next step

Phase 2 extracts `features/design-theme/tokens.css` into `src/styles/design-tokens.css` under the `tokens` layer, and the component CSS into per-component styles in `shared/design-system/`. A later "sleek" theme redefines only the semantic token layer (decision 001).
