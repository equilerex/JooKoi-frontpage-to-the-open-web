# shared/design-system/

Domain-agnostic visual building blocks. The retro HUD look, extracted from the mockups in `features/design-theme/` into real Angular components.

Rules: ADRs `005` (folders/naming), `006` (Aria + CDK), `007` (styles), `008` (harnesses), `011` (PrimeNG as the component base), `012` (derivation), `013` (page templates), `014` (global layer for projected content). Visual direction: ADR `001` and `features/design-theme/CONTEXT.md`.

## The agnostic rule

A design-system component **knows nothing about curated websites, routes or app state.** It imports nothing from outside this folder — no feature, no `app-shell`, no `Router`/`RouterLink`, no store, no domain model. Everything arrives through `input()`; everything leaves through `output()` or a plain DOM event.

Enforced by the generated `no-restricted-imports` block in `eslint.config.js` (ADR 005, and the block is generated from the `src/app/` folder list, so a new feature folder is covered the moment it exists). The rule was verified firing in Task 18 — importing `app-shell` from a component in this folder fails lint with the folder name in the message. A component that cannot be built without reaching out belongs in a feature folder instead.

## Sub-groups

| Folder            | What belongs in it                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions/`        | Things you press: `hardware-key`, `keycap`, `keycap-grid`.                                                                                          |
| `data-display/`   | Data on screen: `record-grid`, `spec-list`, `tag-set`, `capability-tag`, `count-chip`, `prose-content`.                                             |
| `form-controls/`  | Inputs and their labels: `chrome-select`, `console-input`, `field-label`, `segment-selector`, `stompbox-toggle`.                                    |
| `indicators/`     | State at a glance: `status-light`, `bezel-jewel`, `segment-readout`, `classification-badge`.                                                        |
| `navigation/`     | Moving between places: `breadcrumb-trail`, `indicator-nav-list`, `pager`.                                                                           |
| `page-layouts/`   | Pieces composed **inside** a page. Currently `toolbar-row`.                                                                                         |
| `page-templates/` | The outermost grid a page **is** (ADR 013): `console-landing-template`, `directory-browse-template`, `record-detail-template`, `document-template`. |
| `surfaces/`       | Boxes and their decorations: `readout-panel`, `paper-sheet`, `filter-drawer`, and the `corner-brackets` directive.                                  |
| `typography/`     | Type that is part of the look: `logotype`, `eyebrow-label`, `stripe-rule`.                                                                          |

`theme/` is the tenth folder and holds no components — `elevation.ts` (the `ELEVATION` scale) and `jookoi-preset.ts` (PrimeNG's `definePreset`).

`page-layouts/` and `page-templates/` are separate because they answer different questions: one holds what you compose inside a page, the other the shell a page starts from.

## Derivation rule

**A component's identity, name and boundary come from its visual role** (ADR 012). The mockup's HTML structure, nesting and class names are ignored when deciding what a component is; `features/design-theme/components.css` is a paint source, read _after_ the boundary is settled, never a source of structure. The class map that Phase 1 carried here (`.led` → `status-light/`, `.key` → `hardware-key-button/`) is superseded and gone; it named relationships the screen does not show.

Three places the two derivations disagreed, which is why the rule exists: `.led` is two components (bare dot, dot-in-bezel) not one; a classification badge takes no `color` input because shape and border carry its meaning; the hardware key is one component in five placements, not four components.

The procedure for any project is `.agents/skills/visual-component-derivation/SKILL.md`.

## The PrimeNG boundary

`chrome-select` and `filter-drawer` wrap a PrimeNG component (`record-grid` no longer does, see decision 032). **Nothing outside this folder imports a PrimeNG symbol** — the wrapper owns the import and re-exposes a design-system API, so PrimeNG stays replaceable and no consumer inherits its types.

A component is adopted only when ADR 011's test passes in order: (1) CSS and preset tokens alone reach the design → adopt; (2) a template slot or `pt` exposes the part that falls short → adopt; (3) the design needs structural DOM that is neither present nor templatable → build our own.

PrimeNG emits into `@layer primeng`, ordered before `components` by `src/styles/cascade-layers.css`, so a global override wins **by layer, not by specificity** — no `!important`, no specificity war, and no `::ng-deep`. That layer order is the whole reason the adoption works; a rule in an unlayered component stylesheet still beats a layered one, which is the distinction to keep in mind when a rule appears to be losing.

## Motion recipes

Motion is functional infrastructure, not decoration. Every new transition must
answer what state or spatial relationship it explains, use `transform` and/or
`opacity` where possible, stay under 300ms for ordinary UI, and define a
reduced-motion result. Do not animate keyboard-initiated actions, frequently
changing data rows, or content users are scanning. Hover motion is only valid
inside `@media (hover: hover) and (pointer: fine)`.

Durations and easing tokens live in `src/styles/design-tokens.css` (mirrored in
`features/design-theme/tokens.css`):

| Token              | Default | Use                                              |
| ------------------ | ------- | ------------------------------------------------ |
| `--duration-press` | 70ms    | Hardware keys                                    |
| `--duration-state` | 160ms   | Hover, border, pending opacity                   |
| `--duration-route` | 220ms   | Route pane view-transitions / enter-exit         |
| `--duration-shell` | 240ms   | App shell `max-width` (e.g. library wide column) |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entries, exits, and responsive UI feedback |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movement that remains on screen |

Recipes (pick one; do not invent a fifth duration):

1. **Shell routes (Home / Search / Library)** — `view-transition-name: app-main` on `<main>`; HUD/dock named `app-chrome` / `app-dock` stay still. Use the route keyframes in `src/styles.css`, with `--duration-route` and `--ease-out`. Skip VT for library-internal paths; the reader owns that transition.
2. **Library reader entry** — keep the opaque reader frame stable; enter with `opacity` plus `translateX(1rem)` over `--duration-route` and `--ease-out`. Never fade the dark container behind a white document.
3. **Conditional state** — for occasional inserted panels, tiers, or filter rows, use `@starting-style` with `opacity` plus a 4–8px translate. When a state is removed, DOM removal is immediate; do not hold nodes alive with exit animations. Do not put `@if` around a surface whose box geometry needs to morph.
4. **Filtered collections** — table rows in `record-grid` may use enter/leave transitions only if restricted to compositor-safe opacity, tracked by stable unique identifiers (`rowKey`), and protected with input debouncing. Never animate layout geometry (`transform`, `height`) on table rows. In-page filter updates sync via `Location.replaceState` rather than `router.navigate` to prevent scroll-to-top and unneeded View Transitions (ADR 035, ADR 036).
5. **Press feedback** — use a subtle `translateY` or `scale(0.98)` over `--duration-press`; hardware keys are the physical reference. Do not add a second scale to keys that already travel.
6. **Pending without wipe** — keep last painted content; dim with `--duration-state` if needed; never replace with a loading label slower than the real render. SSR resources that hydrate need a TransferState `id`.
7. **Fonts** — preload first-paint faces in `index.html`; `font-display: optional` in `fonts.css`.

View Transition ownership: shell navigation uses the document View Transition;
library-internal navigation skips it and uses the reader layer. A CSS fallback
may exist for browsers without View Transitions, but it must not run alongside
the API transition or create a second fade.

Local gate: `pnpm run ux:smoke` (dev server already on `:4200`; app-wide scenarios + metrics history in `.local/ux-smoke/`). Occasional lab: `pnpm run ux:lab` against `serve:static-build` (:4321). Plans: `2026-09-18-local-ux-quality-and-motion-system.md`, `2026-09-18-app-quality-harness.md`.

## Styling rules that bit during the build

- **Style the host, not a wrapper.** A wrapper element inside `:host` adds a box the parent's grid or flex container did not account for. Where the host's own box breaks the parent, the host is `display: contents` (`hardware-key`, `keycap`, `spec-list`, `pager`).
- **Variants are `:host(.is-x)`.** `is-sm`, `is-hot`, `is-large`, `is-muted` and so on — the caller sets a class on the host, the component reads it.
- **Two documented exceptions to "style the host".** `hardware-key` styles an inner element, because its slab is a child `.key` rather than the host itself; `breadcrumb-trail` uses `:host ol` / `:host li`, which is safe only because it renders those elements itself. A descendant selector under `:host` cannot reach projected content, so `prose-content`'s heading, list and link rules live in `src/styles.css` (ADR 014) instead. Anything else that has to reach beyond its own box is a library-internal case and belongs in the global layer, not here.
- **`--png-*` variables are the sanctioned PrimeNG integration.** They may be set on the host when a preset value cannot express the same thing, provided the declaration references a semantic token rather than a raw colour or size. A PrimeNG class selector (`.p-*`) written into a component stylesheet is not sanctioned — emulated encapsulation scopes it to this component's own template and it matches nothing PrimeNG rendered.

## The one global-CSS entry

`src/styles.css` inside its `@layer components` block is the only place a rule can live that has to reach an element this component does not render. Emulated encapsulation compiles `:host x` to `[_nghost-c] x[_ngcontent-c]`; a projected node, or an element a library's own template created, carries the _other_ template's scope attribute, so the descendant half never matches — silently, with no error and no warning.

Four targets, all there for that one reason:

- `.joo-corner-brackets` — a directive has no stylesheet of its own, so its CSS is global by necessity.
- `.joo-filter-drawer` — `styleClass` lands on PrimeNG Drawer's root element, which Drawer's template created.
- `.joo-record-grid` — the class sits on the component's own `<table>`, so it _is_ the table, not the host.
- `joo-logotype b`, `joo-prose-content *` and `joo-paper-sheet :focus-visible` — the consumer projects these elements in.

A rule that looks dead in a component stylesheet should be read as a hint to check `src/styles.css` first.

## Generating

```
ng g c shared/design-system/<group>/<name>
ng g d shared/design-system/<group>/<name>
```

produces `<name>.component.ts` with selector `joo-<name>` per the `angular.json` schematic defaults. A `<name>.harness.ts` is added only when the markup is complex enough that other tests would otherwise reach into it (ADR 008) — no component currently needs one.
