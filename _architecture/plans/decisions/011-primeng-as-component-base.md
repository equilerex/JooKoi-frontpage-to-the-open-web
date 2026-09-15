# Decision 011 — PrimeNG as the component base, styled mode, skinned through a custom preset

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED -->

## Problem

The design is a maximalist retro HUD with physical metaphors — key travel, bezel rings, inset glow wells. Every control looks bespoke. That made it tempting to build everything by hand.

The parts that are genuinely expensive are not the ones that look bespoke. They are the ones that escape their own box: dialogs, popovers, dropdown overlays, drawers and slide-ups, tooltips, image zoom, sliders, date pickers, masked inputs, virtualised grids. Each needs focus management, scroll lock, portal lifecycle and — the part that compounds — a **coherent z-index and elevation model** that still holds at the third overlay type. CDK Overlay supplies the mechanism and none of the policy.

Decision 006 rejected Angular Material because its theme is stubborn and its override surface is limited. That reasoning is specific to Material, not to component libraries generally. The question here is whether any library can be adopted without repeating Material's problem.

## Options considered

1. Build everything. Own the elevation system by hand.
2. Angular Aria plus CDK only — behaviour primitives, assemble each pattern by hand.
3. Taiga UI — per-component CSS custom properties, strong portal system, Apache-2.0.
4. NG-ZORRO — MIT, but the heaviest base CSS and the most opinionated visual spec of the three.
5. PrimeNG in unstyled mode — ships zero CSS, every rule written by us.
6. **PrimeNG in styled mode**, with a custom preset and cascade-layer ordering.

## Decision

Option 6: **PrimeNG, styled, skinned by modifying its existing styling** rather than starting from nothing.

Unstyled mode was rejected deliberately. It discards PrimeNG's structural CSS as well as its appearance — overlay geometry, positioning and scroll containment go with it, and that is exactly the work this decision exists to avoid. Modifying existing styling is less work than authoring it.

Material's objection does not transfer, because PrimeNG gives three override surfaces Material does not:

1. **`definePreset`** — a custom theme preset whose design-token values point at this project's own semantic tokens. PrimeNG components then inherit the palette natively, and the `[data-theme]` swap that a future `sleek` theme needs flows through them for free. Presets also accept per-component token overrides and injected CSS.
2. **`options.cssLayer`** — PrimeNG emits its styles into a named cascade layer with an explicit order. Our `components` layer is ordered after it, so our rules win by layer, not by specificity. No `::ng-deep`, no `!important`, no specificity war. This is the mechanism Material lacks and the reason 006's objection does not apply.
3. **`pt` (pass-through) and template slots** — `pt` puts our class hooks on named internal elements; `#item`, `#header` and the other template slots let us replace an inner subtree's DOM outright when the design needs structure PrimeNG does not emit.

**This amends decision 006.** Angular Material stays rejected. Angular Aria and CDK stay available for bespoke controls, though with PrimeNG covering the overlay class, Aria may see little or no use in Phase 2 — CDK still arrives as a PrimeNG peer either way.

### What the overlays do and do not supply

Measured against `primeng@22.1.1` source during Phase 2, because the Problem section above lists focus management among the expensive parts and this decision was read as buying it. It buys less of it than that.

- **Portal lifecycle, overlay geometry, positioning and scroll containment** — yes. `appendTo`, the mask, `blockScroll` and the `zIndex` tiers below are real and are the savings this decision is for.
- **Focus management** — partly. `Dialog` has `focusOnShow` and `focusTrap`. `Drawer` has neither, and exposes no equivalent input and no global configuration for it.
- **Background `inert`** — no overlay in the library sets it.
- **Focus restoration to the trigger on close** — no overlay in the library does it, `Dialog` included.

So the shell, the portal and the scroll lock are bought; initial focus, background inertness and focus restoration stay ours, per overlay, whichever component is adopted. That is a property of the library rather than of any one component, which is why it is recorded here and not in the component that found it.

### Configuration this commits to

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

**`prefix: 'png'` is not cosmetic.** PrimeNG's default CSS variable prefix is `p`, which generates `--p-*` — a direct collision with this project's primitive token layer, which is also `--p-*` (decision 007). One of the two has to move, and moving PrimeNG's is the cheaper side.

The `zIndex` tiers are the single elevation system. Our elevation tokens map onto PrimeNG's scale. **We do not run a second one** — two parallel elevation models is the specific failure this decision exists to prevent.

### Which components come from PrimeNG

Default is **adopt**. Building our own is the exception, and it has to be argued.

The adoption test, applied in order:

1. Can CSS and preset tokens alone reach the design? → adopt.
2. If not, does the component expose a template slot for the part that falls short, so we own that subtree's DOM? → adopt.
3. If neither — the design needs structural DOM that is neither present nor templatable — → build our own.

Adopt: Table with virtual scroll, Dialog, Drawer, Popover, Tooltip, Select, MultiSelect, AutoComplete, InputMask, InputNumber, Slider, DatePicker, Image and Galleria.

Build our own: the parts that _are_ the design language and carry no layering, focus or locale complexity — the hardware key, status light, bezel jewel, segment readout, keycap, badges, tags, chips, panels, sheets, rules, breadcrumb, nav list, pager, toolbar row, and the page templates.

One nuance in both directions: permissive does not mean adopt reflexively. A count chip is a `<span>`; skinning someone else's is more work than writing it. The saving has to be real. Equally, a control that merely _looks_ bespoke is not a reason to build it — the stompbox toggle looks like nothing PrimeNG ships, but it is a checkbox, and it is ours because its DOM is unreachable by template, not because it looks unusual.

## Why not the alternatives

Building everything (1) and CDK-only (2) both mean owning an elevation and focus system, which is the compounding cost. Taiga UI (3) fits the token model well but declares fourteen peer packages for `core` alone and its Angular peer range is an untested `>=19.0.0`. NG-ZORRO (4) carries Ant Design's visual specification, the worst skin target of the three. Unstyled PrimeNG (5) throws away the structural CSS that is half the reason to adopt a library.

## Next step

Phase 2 installs `primeng@~22.1.1` and builds the preset and layer configuration before any component consumes it. Each adopted component gets a time-boxed skin check in `/specimen` against the maximalist look; failing step 3 of the test moves it to the build-our-own column and is recorded in the plan's deviations section. Confirm at install that `@primeui/license-manager` emits no runtime warning, and measure the bundle after Table lands — `@defer` is the fix if the 320 kB warn line is crossed, not a raised budget.
