# angular-design-system-phase-2

Session: 2026-09-15. Status: plan. Implementation not started.

Driven by `_architecture/plans/2026-09-15-angular-design-system-phase-2-handoff.md`. Decisions made in this session: `decisions/011`, `012`, `013`.

## Goal

Build the **architecture for building pages**, not the pages. Two deliverables:

1. A **common component system** — generic, domain-agnostic visual primitives in `src/app/shared/design-system/`, plus the `app-shell/` chrome that wraps every page.
2. A set of **base page templates** — the four shell layouts the mockups show, as components with named projection slots, that Phase 3 fills with real content.

No routes beyond the existing `/` and `**`. No feature components. No real data. One dev-only `/specimen` route exists purely to render the parts kit.

## Rulings made this session

These were user calls, not derivations. They override anything in the handoff brief or the current `CONTEXT.md` files that contradicts them.

- **Scope:** identify the shell _types of layouts_ and the _individual components_ seen across the mockup pages. End state is base templates plus a common component system of generic primitives. Do not build the app or its routes.
- **Verification:** one live dev-only `/specimen` route as the Angular parts kit. Components are verified there as they are built, not page-by-page in Phase 3.
- **Derivation method (this is the important one):** a component's identity, name and boundary come from its **visual role**, not from the mockup's HTML structure, DOM nesting or class names. Existing code is raw material for painting only. Code-derived boundaries produce assumptions and hallucinated relationships. Recorded as decision 012.
- **Tables and other solved widgets:** do not rebuild tables or datepickers from scratch. Pick an open-source dependency and skin it. Cells accept arbitrary content. Table-specific cell content may become its own small components, reusable across the app. Infinite scroll inside a fixed-height area — **no load-more button**. Dependency chosen: **PrimeNG**. Recorded as decision 011.
- **Angular Material's problem was its stubborn theme with limited override surface.** Other dependencies that are more flexible are not blocked by decision 006. 011 amends 006; it does not supersede it.

## Non-negotiables: this is a modern-Angular reference

The app's aim is to be easy to use, performant, and an excellent example of modern Angular at its best. That is an acceptance criterion for these components, not a side benefit, and it arbitrates the calls below. Concretely, every component in this phase:

- **Signal APIs only.** `input()`, `input.required()`, `output()`. Two-way state uses **`model()`** — never a hand-written `value` / `valueChange` pair. Derived state uses `computed()`; state that resets when an input changes uses `linkedSignal()`.
- **Styles the host element, not a wrapper.** `host: { '[class.is-pressed]': 'pressed()' }` and host CSS. An extra wrapper `<div>` inside a component breaks the grid relationship between a template's container and its child, and this design is grid-heavy throughout. Where a host must be transparent to its parent grid, `display: contents`.
- **`inject()`, standalone, `ChangeDetectionStrategy.OnPush`, modern control flow** (`@if` / `@for` with a real `track` / `@switch`, `@let`). No NgModules, no constructor DI, no `*ngIf`.
- **Zoneless-safe.** No reliance on zone-triggered change detection — no `setTimeout`-driven view updates.
- **`@defer` for anything heavy.** See Part 4; it is the idiomatic answer to the bundle question, and a flagship feature worth demonstrating.

The reader test: someone opening this repo to learn how a modern Angular design system is built should find the answer here, not a wrapper around someone else's.

## Part 1 — Visual parts inventory

Derived by looking at the six rendered mockup pages at 1440px, then reading the breakpoint rules for mobile behaviour. Names describe what a part _is_ on screen. Where a name differs from `shared/design-system/CONTEXT.md`'s current class map, the name here wins.

### Atomic primitives (`shared/design-system/`)

| Component               | Group            | Visual role                                                                                                                                            | API surface (what visibly changes)                                                                     |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `status-light/`         | `indicators/`    | Bare emissive dot with a coloured halo. No housing.                                                                                                    | `color`, `on`, `blink`, `label`                                                                        |
| `bezel-jewel/`          | `indicators/`    | Emissive dot **seated in a metal bezel ring**. Reads as a physical lamp, not a dot.                                                                    | `color`, `on`                                                                                          |
| `segment-readout/`      | `indicators/`    | Glowing fixed-width numeric/short-text readout, monospace, inset well.                                                                                 | projected content, `color`                                                                             |
| `hardware-key/`         | `actions/`       | The pressable slab: solid bottom edge that collapses on press. **One part**, not four.                                                                 | `size` (xs/sm/md/lg), `accent`, `block`, `pressed`, `current`, `as` (button/anchor), projected content |
| `keycap/`               | `actions/`       | Legend key: small fn line above, label, optional trailing count.                                                                                       | `fn`, `label`, `count`                                                                                 |
| `classification-badge/` | `indicators/`    | Meaning carried by **shape and border treatment**, not colour alone — solid vs dashed vs double border.                                                | `variant` (a named border treatment, not a colour), projected label                                    |
| `capability-tag/`       | `data-display/`  | Small outline tag, tight tracking, no fill.                                                                                                            | projected label                                                                                        |
| `count-chip/`           | `data-display/`  | Pill with label and trailing count in a contrasting well.                                                                                              | `count`, projected label, `selected`                                                                   |
| `eyebrow-label/`        | `typography/`    | Tiny uppercase tracked label above a heading.                                                                                                          | projected content                                                                                      |
| `stripe-rule/`          | `typography/`    | Hazard-stripe horizontal divider.                                                                                                                      | none                                                                                                   |
| `logotype/`             | `typography/`    | Wordmark. Two sizes.                                                                                                                                   | `size`                                                                                                 |
| `field-label/`          | `form-controls/` | Caption above a control.                                                                                                                               | `for`, projected content                                                                               |
| `console-input/`        | `form-controls/` | Prompt glyph plus text input in an inset well.                                                                                                         | `size` (compact/md/lg), `placeholder`, `value` as `model()`                                            |
| `chrome-select/`        | `form-controls/` | Select skinned as a brushed-metal control. The **open list** must carry the theme, which a native `<select>` cannot do — so this wraps PrimeNG Select. | `options`, `value` as `model()`                                                                        |
| `corner-brackets`       | `surfaces/`      | Directive. Decorative bracket overlay on a surface corner set.                                                                                         | attribute only                                                                                         |

### Composite patterns (`shared/design-system/`)

| Component             | Group            | Visual role                                                                                                                   | Slots / API                                    |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `readout-panel/`      | `surfaces/`      | Chrome-framed panel: head strip (title + meta) over a recessed body.                                                          | `title`, `meta` slot, body slot, `flush`       |
| `paper-sheet/`        | `surfaces/`      | Paper surface with a four-layer frame shadow. Goes full-bleed below 768px.                                                    | body slot                                      |
| `stompbox-toggle/`    | `form-controls/` | Three-column row: `bezel-jewel`, label, state word that flips OFF→ON.                                                         | `on` as `model()`, `color`, projected label    |
| `segment-selector/`   | `form-controls/` | Joined segment strip, exactly one active.                                                                                     | `options`, `value` as `model()`                |
| `keycap-grid/`        | `actions/`       | Wrapping grid of `keycap`.                                                                                                    | projected keycaps                              |
| `tag-set/`            | `data-display/`  | Wrapping row of `capability-tag` or `count-chip`.                                                                             | projected tags                                 |
| `spec-list/`          | `data-display/`  | Two-column term/value list, dotted leaders.                                                                                   | `items` or projected rows                      |
| `breadcrumb-trail/`   | `navigation/`    | Separator-joined trail, last item inert.                                                                                      | `items` (label + href), current index          |
| `indicator-nav-list/` | `navigation/`    | Vertical rows each with a leading `status-light`.                                                                             | `items`, `currentHref`                         |
| `pager/`              | `navigation/`    | Prev/next cards with a direction eyebrow. Built from `hardware-key`.                                                          | `prev`, `next` (label + href)                  |
| `toolbar-row/`        | `page-layouts/`  | Horizontal control strip, end-aligned trailing group, wraps on mobile.                                                        | start slot, end slot                           |
| `filter-drawer/`      | `page-layouts/`  | Collapsible section with a caret. Open on desktop, an overlaying drawer below 768px — so it wraps PrimeNG Drawer.             | `summary`, body slot, `open` as `model()`      |
| `prose-content/`      | `data-display/`  | Long-form typographic scope for injected article HTML.                                                                        | projected content                              |
| `record-grid/`        | `data-display/`  | The tabular record view. **PrimeNG Table, skinned** (decision 011). Fixed-height scroll region, virtual scroll, no load-more. | `columns`, `rows`, cell templates, `rowHeight` |

### Boundary findings that contradict the current `CONTEXT.md` map

Three, all from visual derivation. `shared/design-system/CONTEXT.md`'s class map is superseded on these points.

1. **`status-light` and `bezel-jewel` are different parts.** The map treats `.led` as one component and `.toggle__jewel` as internal markup. On screen the jewel has a metal bezel the bare dot does not. Two components.
2. **`classification-badge` cannot take a `color` input.** The design encodes meaning in border treatment and shape. A colour-only API silently loses the distinction at the one place it matters. The input is a named variant.
3. **`hardware-key` is one part, not four.** The map splits it across button, nav link, latching toggle, pager card and dock item. Visually it is the same slab in five placements, differing only by size, accent and latch state.

Two consequences for placement:

- `.trust` and `.sig`, currently classed as domain components outside the design system, are visually **generic** — a classification badge and a capability tag. They belong in `shared/design-system/`. The domain layer in Phase 3 _configures_ them (decides that a trusted source gets the solid-border variant); it does not own them.
- The rest of the class map's 1:1 mapping holds and can be reused as a CSS source when painting.

## Part 2 — Base page templates

Four shells. Every one sits inside the same chrome: `horizon-backdrop`, `heads-up-display-header`, a centred `--content-max` (80rem) column, and `mobile-bottom-dock` below 768px.

Templates go in a **new** `shared/design-system/page-templates/` sub-group (decision 013). They are agnostic: named slots, no routes, no stores.

| Template                 | Seen on                      | Shape                                                                                                        | Slots                               |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `launcher-template/`     | `index.html`                 | Two columns at ≥1024px (`minmax(0,1.25fr) minmax(0,1fr)`), stacked below. Command area lead, secondary rail. | `lead`, `rail`                      |
| `rack-results-template/` | `search.html`, `browse.html` | Sticky filter rack `17rem` + results `minmax(0,1fr)` at ≥1024px. Rack collapses into `filter-drawer` below.  | `rack`, `toolbar`, `results`        |
| `detail-split-template/` | `source.html`                | `minmax(0,1.4fr) minmax(0,1fr)` at ≥1024px. Aside-first variant reorders below 1024px.                       | `main`, `aside`, `asideFirst` input |
| `document-template/`     | `learn-topic.html`           | Single `paper-sheet` column capped at `--sheet-max` (950px), full-bleed below 768px.                         | `header`, `body`                    |

**Mandatory CSS detail:** any single-column grid must use `grid-template-columns: minmax(0, 1fr)`, per `features/design-theme/CONTEXT.md`. Plain `1fr` overflows.

## Part 3 — Three tiers and where the feature boundary sits

```
shared/design-system/     common components + page templates      <- Phase 2 builds all of this
  (feature components)    domain-aware wrappers                   <- Phase 3; Phase 2 only defines the boundary
app-shell/                chrome rendered once around every page  <- Phase 2
```

A **feature component** is one that cannot be built without knowing what a curated website is. It configures common components; it never restyles them. Example: a `source-row` feature component decides which `classification-badge` variant a trust tier maps to, and passes `capability-tag` labels. It owns the mapping. The design system owns the appearance.

Phase 2 writes this rule down and builds nothing under it.

## Part 4 — PrimeNG

Verified 2026-09-15:

- Latest `primeng` is **22.1.1**. Peers: `@angular/core ^22.1.0`, `@angular/cdk ^22.1.0`, `@angular/forms`, `@angular/router`, `@angular/common`, `@angular/platform-browser`, `rxjs ^7.8.1`. Matches the workspace's Angular 22.1 baseline exactly, and satisfies the `@angular/cdk` install decision 006 already called for.
- `definePreset` builds a custom theme preset whose design-token values can point at our own semantic tokens, with per-component token overrides and injected CSS.
- `options.cssLayer` emits PrimeNG's styles into a named cascade layer with an explicit order, so our `components` layer wins by layer rather than by specificity.
- `options.prefix` changes PrimeNG's generated CSS variable prefix, which defaults to `p`.
- `pt` (pass-through) puts our classes, attributes and handlers on each named internal element; template slots (`#item`, `#header`) replace an inner subtree's DOM outright.
- `zIndex` config manages overlay layering automatically in named tiers — modal, overlay, menu, tooltip.
- `Table` supports `virtualScroll` with a fixed `virtualScrollItemSize`, with a lazy variant that loads on demand. That is the fixed-area infinite scroll the ruling asked for.

Two things the plan treats as tasks, not assumptions:

- `primeng@22.1.1` pulls `@primeui/*` runtime packages and `@primeui/license-manager`. Confirm the components in use are in the free tier and that nothing emits a licence warning at runtime.
- **Bundle budget.** Baseline is 244.34 kB against a 320 kB warn / 500 kB error initial budget. Measure after `record-grid` lands. The fix if it crosses the warn line is **`@defer`**, not a raised budget: `record-grid` is the one component heavy enough to justify a deferrable view, it is never on the initial route, and a deferred block with a skeleton placeholder is both the idiomatic modern-Angular answer and a flagship feature worth showing. Route-level lazy loading in Phase 3 is the fallback if `@defer` alone isn't enough.

### Styled mode, not unstyled

Unstyled mode is rejected. It discards PrimeNG's structural CSS along with its appearance — overlay geometry, positioning and scroll containment go with it, and that is half the reason to adopt a library at all. **We modify existing styling rather than author it from nothing.** Decision 011 records the full reasoning.

Four override surfaces, in the order to reach for them:

1. **Preset tokens** — a `definePreset` custom preset whose token values point at our semantic tokens. PrimeNG components inherit the palette natively, so the `[data-theme]` swap a future `sleek` theme needs flows through them at no extra cost.
2. **Our `components` cascade layer** — PrimeNG emits into a `primeng` layer ordered before ours, so our rules win by layer. No `::ng-deep`, no `!important`, no `ViewEncapsulation.None`. Decision 007 stays intact.
3. **`pt`** — our class hooks on named internal elements.
4. **Template slots** — replace an inner subtree's DOM when the design needs structure PrimeNG does not emit.

Configuration this commits to:

```
providePrimeNG({
  theme: {
    preset: <custom preset via definePreset>,
    options: {
      prefix: 'png',
      cssLayer: { name: 'primeng', order: 'reset, tokens, base, primeng, components, utilities' },
    },
  },
  zIndex: { modal, overlay, menu, tooltip },
})
```

**`prefix: 'png'` is load-bearing.** PrimeNG defaults to prefix `p`, generating `--p-*`, which collides head-on with our primitive token layer. Moving PrimeNG's is the cheaper side of the collision.

**One elevation system.** Our elevation tokens map onto PrimeNG's `zIndex` tiers. We do not run a parallel scale.

### Which components come from PrimeNG

Default is **adopt**. Building our own is the exception and has to be argued. The test, in order:

1. Can CSS and preset tokens alone reach the design? → adopt.
2. If not, is there a template slot for the part that falls short, so we own that subtree's DOM? → adopt.
3. Neither — the design needs DOM that is neither present nor templatable → build our own.

Adopt: Table with virtual scroll, Dialog, Drawer, Popover, Tooltip, Select, MultiSelect, AutoComplete, InputMask, InputNumber, Slider, DatePicker, Image and Galleria. This resolves two items Part 1 left open — `chrome-select` becomes PrimeNG Select, and `filter-drawer` becomes PrimeNG Drawer.

Build our own: the parts that _are_ the design language and carry no layering, focus or locale complexity — listed in Part 1.

Permissive does not mean reflexive, in either direction. A count chip is a `<span>`; skinning someone else's costs more than writing it, so the saving has to be real. Equally, looking bespoke is not an argument for building — the stompbox toggle is a checkbox, and it is ours because its DOM is unreachable by template, not because it looks unusual.

Each adopted component gets a time-boxed skin check in `/specimen` against the maximalist look. Anything that fails step 3 moves to the build-our-own column and is recorded in the deviations section at the bottom of this plan.

## Part 5 — Supporting work

- **Tokens.** Port `features/design-theme/tokens.css` to `src/styles/design-tokens.css` under the `tokens` cascade layer, unchanged in structure: primitives `--p-*` first, semantic tokens under `:root, [data-theme='retro']`. Components reference semantic tokens only — never `--p-*`. A future `sleek` theme is then a second `[data-theme]` block and nothing else. Carry over the `max-width: 767px` and `prefers-contrast: more` blocks. Our `--p-*` prefix stays as it is; PrimeNG's moves to `png` (Part 4) to avoid the collision.
- **Responsive rules.** Components size themselves with `@container` — a `record-grid` sitting in `detail-split-template`'s narrow aside must card-ify because _it_ is narrow, not because the viewport is. Each template slot that hosts a component sets `container-type: inline-size`. Chrome and page templates keep `@media`, because viewport genuinely is the input there: the HUD compacting at 767px and the dock appearing are viewport facts. Use `subgrid` where child rows must align to a parent's tracks — the record card mode and `spec-list` both want it.
- **Fonts.** Self-host Chakra Petch, Inter, JetBrains Mono as woff2 under `public/fonts/`, declared with `@font-face` in a stylesheet under the `base` layer, `font-display: swap`. Verify the built output actually contains the files and that no path 404s in the prerendered build. Drop the mockups' Google Fonts links.
- **`app-shell/` chrome.** Build order: `horizon-backdrop` (no dependencies) → `heads-up-display-header` (consumes `logotype`, `console-input`, `hardware-key`, `status-light`) → `mobile-bottom-dock` (consumes `hardware-key`) → wire all three into `app-shell-layout`. No shared layout contract is needed first; the layout is a grid and the three are independent children.
- **`page-title.strategy.ts`.** `TitleStrategy` producing `"<page> · JooKoi"`. Verify the API against current Router docs before writing it.
- **`/specimen` route.** Dev-only. Renders every component in every state, grouped by sub-group, plus all four page templates with placeholder slot content. Must be excluded from the prerendered route list so it never ships.
- **Tests.** Hybrid interaction tests (decision 008) only for parts with real interaction logic: `stompbox-toggle`, `segment-selector`, `console-input`, `chrome-select`, `record-grid`. Nothing for presentational parts. Harnesses only for `record-grid`.
- **Lint boundary.** After the first real components exist, confirm the generated `no-restricted-imports` block actually fails a design-system component that imports `RouterLink` — against a real component, not the probe file.

## Build order

1. Install `@angular/aria`, `@angular/cdk`, `primeng`. Confirm versions resolve against Angular 22.1.
2. `src/styles/design-tokens.css` + `public/fonts/` + `@font-face`. Verify a built page renders in the right fonts and colours before any component exists.
3. **PrimeNG preset and layer configuration** — `definePreset` mapping preset tokens onto our semantic tokens, `prefix: 'png'`, `cssLayer` order, `zIndex` tiers mapped to our elevation tokens. Nothing consumes PrimeNG until this is right; doing it once is what makes every later skin cheap.
4. `/specimen` route, empty. Everything after this is verified in it as it lands.
5. Our own atomic primitives, in Part 1's order. Each appears in `/specimen` in all its states.
6. Our own composite patterns.
7. `app-shell/` chrome, in the order given in Part 5.
8. Page templates. Each one in `/specimen` with placeholder slot content, checked at 390px and 1440px.
9. Adopted PrimeNG components, each with its time-boxed skin check. `record-grid` last of these — Table is the heaviest single import and the only step that can fail the bundle budget. Size is CI's to measure and report; the 320 kB warn is a logged budget decision, not a build step here.
10. Paper trail: rewrite `shared/design-system/CONTEXT.md` and `app-shell/CONTEXT.md`, update `ARCHITECTURE.md`'s Phase 2 section and folder map.

Gates are `AGENTS.md`'s Iteration loop table and are not restated here.

## Not in Phase 2

Unchanged from the handoff brief: feature folders, real routes, `shared/curated-websites/`, the data pipeline, CI and hosting.

## Implementation deviations
