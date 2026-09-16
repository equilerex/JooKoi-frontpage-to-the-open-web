# shared/design-system/

Domain-agnostic visual building blocks. The retro HUD look, extracted from the mockups in `features/design-theme/` into real Angular components.

Rules: ADRs `005` (folders/naming), `006` (Aria + CDK), `007` (styles), `008` (harnesses), `011` (PrimeNG as the component base), `012` (derivation), `013` (page templates), `014` (global layer for projected content). Visual direction: ADR `001` and `features/design-theme/CONTEXT.md`.

## The agnostic rule

A design-system component **knows nothing about curated websites, routes or app state.** It imports nothing from outside this folder — no feature, no `app-shell`, no `Router`/`RouterLink`, no store, no domain model. Everything arrives through `input()`; everything leaves through `output()` or a plain DOM event.

Enforced by the generated `no-restricted-imports` block in `eslint.config.js` (ADR 005, and the block is generated from the `src/app/` folder list, so a new feature folder is covered the moment it exists). The rule was verified firing in Task 18 — importing `app-shell` from a component in this folder fails lint with the folder name in the message. A component that cannot be built without reaching out belongs in a feature folder instead.

## Sub-groups

| Folder           | What belongs in it                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `actions/`       | Things you press: `hardware-key`, `keycap`, `keycap-grid`.                                                                       |
| `data-display/`  | Data on screen: `record-grid`, `spec-list`, `tag-set`, `capability-tag`, `count-chip`, `prose-content`.                          |
| `form-controls/` | Inputs and their labels: `chrome-select`, `console-input`, `field-label`, `segment-selector`, `stompbox-toggle`.                   |
| `indicators/`    | State at a glance: `status-light`, `bezel-jewel`, `segment-readout`, `classification-badge`.                                      |
| `navigation/`    | Moving between places: `breadcrumb-trail`, `indicator-nav-list`, `pager`.                                                        |
| `page-layouts/`  | Pieces composed **inside** a page. Currently `toolbar-row`.                                                                       |
| `page-templates/`| The outermost grid a page **is** (ADR 013): `console-landing-template`, `directory-browse-template`, `record-detail-template`, `document-template`. |
| `surfaces/`      | Boxes and their decorations: `readout-panel`, `paper-sheet`, `filter-drawer`, and the `corner-brackets` directive.                 |
| `typography/`    | Type that is part of the look: `logotype`, `eyebrow-label`, `stripe-rule`.                                                        |

`theme/` is the tenth folder and holds no components — `elevation.ts` (the `ELEVATION` scale) and `jookoi-preset.ts` (PrimeNG's `definePreset`).

`page-layouts/` and `page-templates/` are separate because they answer different questions: one holds what you compose inside a page, the other the shell a page starts from.

## Derivation rule

**A component's identity, name and boundary come from its visual role** (ADR 012). The mockup's HTML structure, nesting and class names are ignored when deciding what a component is; `features/design-theme/components.css` is a paint source, read *after* the boundary is settled, never a source of structure. The class map that Phase 1 carried here (`.led` → `status-light/`, `.key` → `hardware-key-button/`) is superseded and gone; it named relationships the screen does not show.

Three places the two derivations disagreed, which is why the rule exists: `.led` is two components (bare dot, dot-in-bezel) not one; a classification badge takes no `color` input because shape and border carry its meaning; the hardware key is one component in five placements, not four components.

The procedure for any project is `.agents/skills/visual-component-derivation/SKILL.md`.

## The PrimeNG boundary

`chrome-select`, `filter-drawer` and `record-grid` wrap a PrimeNG component. **Nothing outside this folder imports a PrimeNG symbol** — the wrapper owns the import and re-exposes a design-system API, so PrimeNG stays replaceable and no consumer inherits its types.

A component is adopted only when ADR 011's test passes in order: (1) CSS and preset tokens alone reach the design → adopt; (2) a template slot or `pt` exposes the part that falls short → adopt; (3) the design needs structural DOM that is neither present nor templatable → build our own.

PrimeNG emits into `@layer primeng`, ordered before `components` by `src/styles/cascade-layers.css`, so a global override wins **by layer, not by specificity** — no `!important`, no specificity war, and no `::ng-deep`. That layer order is the whole reason the adoption works; a rule in an unlayered component stylesheet still beats a layered one, which is the distinction to keep in mind when a rule appears to be losing.

## Styling rules that bit during the build

- **Style the host, not a wrapper.** A wrapper element inside `:host` adds a box the parent's grid or flex container did not account for. Where the host's own box breaks the parent, the host is `display: contents` (`hardware-key`, `keycap`, `spec-list`, `pager`).
- **Variants are `:host(.is-x)`.** `is-sm`, `is-hot`, `is-large`, `is-muted` and so on — the caller sets a class on the host, the component reads it.
- **Two documented exceptions to "everything under `:host`".** `hardware-key` styles an inner element, because its slab is a child `.key` rather than the host itself. Everything else that has to reach beyond its own box is a projected-content or library-internal case and belongs in the global layer (ADR 014), not here.
- **`--png-*` variables are the sanctioned PrimeNG integration.** They may be set on the host when a preset value cannot express the same thing, provided the declaration references a semantic token rather than a raw colour or size. A PrimeNG class selector (`.p-*`) written into a component stylesheet is not sanctioned — emulated encapsulation scopes it to this component's own template and it matches nothing PrimeNG rendered.

## The one global-CSS entry

`src/styles.css` inside its `@layer components` block is the only place a rule can live that has to reach an element this component does not render. Emulated encapsulation compiles `:host x` to `[_nghost-c] x[_ngcontent-c]`; a projected node, or an element a library's own template created, carries the *other* template's scope attribute, so the descendant half never matches — silently, with no error and no warning.

Four targets, all there for that one reason:

- `.joo-corner-brackets` — a directive has no stylesheet of its own, so its CSS is global by necessity.
- `.joo-filter-drawer` — `styleClass` lands on PrimeNG Drawer's root element, which Drawer's template created.
- `.joo-record-grid` — `tableStyleClass` lands on PrimeNG's inner `<table>`, so the class *is* the table, not the host.
- `joo-logotype b`, `joo-prose-content *` and `joo-paper-sheet :focus-visible` — the consumer projects these elements in.

A rule that looks dead in a component stylesheet should be read as a hint to check `src/styles.css` first.

## Generating

```
ng g c shared/design-system/<group>/<name>
ng g d shared/design-system/<group>/<name>
```

produces `<name>.component.ts` with selector `joo-<name>` per the `angular.json` schematic defaults. A `<name>.harness.ts` is added only when the markup is complex enough that other tests would otherwise reach into it (ADR 008) — no component currently needs one.
