# shared/design-system/

Domain-agnostic visual building blocks. The retro HUD look, extracted from the mockups in `features/design-theme/` into real Angular components.

Rules: ADRs `005` (folders/naming), `006` (Aria + CDK), `007` (styles), `008` (harnesses). Visual direction: ADR `001` and `features/design-theme/CONTEXT.md`.

> **Phase 2 work. Nothing here yet.** This file is the rule for when it's built.

## The agnostic rule

A design-system component **knows nothing about curated websites, routes or app state.** Concretely, it must not:

- import anything from `shared/curated-websites/`, a feature folder, or `app-shell/`;
- import `Router`, `ActivatedRoute` or `RouterLink` — a link takes an `href` or is projected in by the caller;
- inject a store, or reference `CuratedWebsite` or any domain model;
- know what a "trust tier" is. A `status-light` takes a colour and a label, and the caller decides that a trusted website gets a green one.

Everything it needs arrives through `input()`, and everything it reports leaves through `output()` or plain DOM events.

This is enforced: `eslint.config.js` generates a `no-restricted-imports` block forbidding any import from `**/app/**` outside this folder. A component that can't be built without reaching out belongs in `shared/curated-websites/` instead.

## Sub-groups

Eight folders, from the target map in `_architecture/ARCHITECTURE.md`. Component names are candidates taken from the mockup classes; Phase 2 settles the final list.

| Folder           | Components (candidates)                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `typography/`    | `logotype/`, `section-heading/`, `eyebrow-label/`, `stripe-rule/`                                          |
| `indicators/`    | `status-light/`, `seven-segment-readout/`                                                                  |
| `actions/`       | `hardware-key-button/`, `keycap-shortcut/`, `keycap-grid/`                                                 |
| `form-controls/` | `command-console-input/`, `stompbox-toggle/`, `rotary-segment-selector/`, `chrome-select/`, `field-label/` |
| `surfaces/`      | `readout-panel/`, `paper-sheet/`, `corner-brackets.directive.ts`                                           |
| `navigation/`    | `breadcrumb-trail/`, `indicator-navigation-list/`, `pagination-control/`                                   |
| `data-display/`  | `data-table/`, `tag-chip-list/`, `specification-list/`, `prose-content/`                                   |
| `page-layouts/`  | `filter-rack-layout/`, `two-column-split/`, `toolbar-row/`                                                 |

Names are spelled out on purpose — `hardware-key-button`, not `btn`; `seven-segment-readout`, not `readout7`.

## Mockup class map

Each component replaces a class from `features/design-theme/components.css`. Check that file for the actual rules before writing a component's CSS; these are the classes currently in use:

| Mockup class                                             | Becomes                                            |
| -------------------------------------------------------- | -------------------------------------------------- |
| `.hud`                                                   | `app-shell/heads-up-display-header/`               |
| `.dock`                                                  | `app-shell/mobile-bottom-dock/`                    |
| `.led` (`--on --blink --cyan --green --amber --magenta`) | `indicators/status-light/`                         |
| `.readout`                                               | `indicators/seven-segment-readout/`                |
| `.key` (`--xs --sm --lg --block --cyan --hot`)           | `actions/hardware-key-button/`                     |
| `.keycap`, `.keygrid`                                    | `actions/keycap-shortcut/`, `actions/keycap-grid/` |
| `.console` (`--compact --lg`)                            | `form-controls/command-console-input/`             |
| `.toggle` (`--green --amber --magenta`), `.toggles`      | `form-controls/stompbox-toggle/`                   |
| `.segment`                                               | `form-controls/rotary-segment-selector/`           |
| `.select`                                                | `form-controls/chrome-select/`                     |
| `.field-label`                                           | `form-controls/field-label/`                       |
| `.panel`                                                 | `surfaces/readout-panel/`                          |
| `.sheet`                                                 | `surfaces/paper-sheet/`                            |
| `.brackets`                                              | `surfaces/corner-brackets.directive.ts`            |
| `.breadcrumb`                                            | `navigation/breadcrumb-trail/`                     |
| `.navlist`                                               | `navigation/indicator-navigation-list/`            |
| `.pager`                                                 | `navigation/pagination-control/`                   |
| `.data-table`, `.table-wrap`                             | `data-display/data-table/`                         |
| `.chip`, `.chips`                                        | `data-display/tag-chip-list/`                      |
| `.spec`                                                  | `data-display/specification-list/`                 |
| `.prose`, `.lede`                                        | `data-display/prose-content/`                      |
| `.with-rack`, `.rack-group`                              | `page-layouts/filter-rack-layout/`                 |
| `.split`                                                 | `page-layouts/two-column-split/`                   |
| `.toolbar`                                               | `page-layouts/toolbar-row/`                        |
| `.logotype` (`--sm`)                                     | `typography/logotype/`                             |
| `.h-title`, `.h-section`                                 | `typography/section-heading/`                      |
| `.eyebrow`                                               | `typography/eyebrow-label/`                        |
| `.stripes`                                               | `typography/stripe-rule/`                          |

Domain-flavoured mockup classes (`.trust`, `.trust--trusted`, `.trust--discovered`, `.sig`, `.sigs`, `.src-name`, `.src-domain`) are **not** design-system components. They belong in `shared/curated-websites/`, built on top of the agnostic ones.

Utility classes (`.mono`, `.muted`, `.sr-only`, `.desktop-only`, `.stack`, `.page`) stay as global CSS in the `utilities` layer, not components.

## Behaviour and styling

- Behaviour comes from **Angular Aria** with **CDK** underneath (ADR 006) — never Angular Material. Aria directives are headless: they handle keyboard, focus and ARIA state, and the CSS styles off the resulting ARIA attributes.
- Styles use default `Emulated` encapsulation and read **semantic tokens only**. No raw colour or size values, no `::ng-deep`, no `ViewEncapsulation.None` without an ADR (ADR 007).

## Harnesses are optional

A component gets a `<name>.harness.ts` **only** when its markup is complex enough that other tests would otherwise reach into its internals — Aria-backed selects, listboxes, grids. A button or a badge does not need one (ADR 008).

## Generating

```
ng g c shared/design-system/<group>/<name>
```

produces `<name>.component.ts` with selector `joo-<name>`, per the `angular.json` schematic defaults.
