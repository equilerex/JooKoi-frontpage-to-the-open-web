# Angular Design System Phase 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the architecture for building pages — a generic design-system component library, the four base page templates, and the `app-shell/` chrome — verified in one dev-only `/specimen` route.

**Architecture:** Plain-CSS components under `src/app/shared/design-system/<group>/<name>/`, styling their own host element, reading semantic design tokens only. Solved widgets (select, drawer, table) come from PrimeNG in styled mode, skinned through a `definePreset` custom preset plus cascade-layer ordering. Page templates are slot-only shells in a `page-templates/` sub-group; chrome lives in `app-shell/`.

**Tech Stack:** Angular 22.1 (zoneless, standalone, strict, `outputMode: static`), plain CSS with cascade layers, PrimeNG 22.1.x + `@primeuix/themes`, `@angular/cdk`, `@angular/aria`, Vitest browser mode, pnpm.

**Spec:** `_architecture/plans/2026-09-15-angular-design-system-phase-2.md` — read it before Task 1. Supporting decisions: `_architecture/plans/decisions/011-primeng-as-component-base.md`, `012-components-derived-from-visual-role.md`, `013-page-templates-as-a-design-system-sub-group.md`, `007-styles-architecture-cascade-layers.md`. Conventions: `.agents/context/engineering-guidelines.md`.

---

## Global Constraints

Every task inherits all of these. They are not repeated per task.

- **Gate after every task:** none beyond the normal loop. Gates live in `AGENTS.md`'s **Iteration loop** table and nowhere else — the dev server's watch build is the per-change gate, the `Stop` hook owns lint and format, `pnpm run test:ci` runs at a batch boundary, production builds belong to CI. This plan previously restated them per task; those restatements are gone, because `scripts/task-brief` copies a task's text verbatim into the brief a subagent is handed, and what it was handing over was a build command.
- **UI check** at 390px and 1440px in the preview browser, on `/specimen`, for any task that adds something visible.
- **Tests only where this plan names a test.** Per `AGENTS.md`: no tests for the sake of tests. The dev server's watch build is the correctness gate. Named test targets are `console-input`, `stompbox-toggle`, `segment-selector`, `chrome-select`, `record-grid` — nothing else gets a spec file.
- **Signal APIs only.** `input()`, `input.required()`, `output()`, `model()` for two-way, `computed()`, `linkedSignal()`. Never a hand-written `value`/`valueChange` pair, never `@Input`/`@Output` decorators.
- **`ChangeDetectionStrategy.OnPush` on every component.** `inject()`, never constructor DI. No NgModules.
- **Style the host, not a wrapper.** Use `host: { ... }` bindings and `:host` CSS. An extra wrapper `<div>` breaks the grid relationship between a template's container and its child. Where a host must be transparent to its parent grid, `:host { display: contents; }`.
- **Modern control flow only:** `@if`, `@for` with a real `track`, `@switch`, `@let`, `@defer`. No `*ngIf`, no `*ngFor`, no `NgIf`/`NgForOf` imports.
- **Zoneless-safe.** No `setTimeout`-driven view updates, no reliance on zone change detection.
- **Semantic tokens only in component CSS.** Never a raw colour or size, never a `--p-*` primitive, never another component's class. No `::ng-deep`, no `!important`, no `ViewEncapsulation.None`.
- **Naming:** `<name>.component.ts` / `<Name>Component` / selector `joo-<name>`; directives `<name>.directive.ts` / `<Name>Directive` / selector `[joo<Name>]`. Files for one component (`.ts`, `.html`, `.css`, `.spec.ts`) sit together in its own folder. No `components/` or `services/` folders.
- **Generate with the CLI**, do not hand-create folders: `pnpm ng g c shared/design-system/<group>/<name>`, `pnpm ng g d shared/design-system/surfaces/corner-brackets`. Add `--dry-run` first when unsure.
- **Single-column grids use `grid-template-columns: minmax(0, 1fr)`.** Plain `1fr` overflows. This is a hard rule from `features/design-theme/CONTEXT.md`.
- **Component CSS budget:** `anyComponentStyle` warns at 2 kB, errors at 4 kB. If a component's CSS crosses 2 kB, that is a signal the component is doing too much — split it, do not raise the budget.
- **Initial bundle budget:** warn 320 kB, error 500 kB. Phase 1 baseline is 244.34 kB.
- **Never run `git commit` on the main checkout.** Commits inside this SDD worktree are permitted and expected, one per task, using the message given in the task's final step.
- **Do not build feature components, real routes, stores, or data.** Not in Phase 2: feature folders, `shared/curated-websites/` contents, the data pipeline, CI, hosting.
- **Derivation rule (decision 012):** a component's identity and boundary come from its visual role. The mockup CSS in `features/design-theme/components.css` is a **paint source only** — its class names, nesting and modifier structure carry no authority over the component boundary. When porting, you are copying declarations, not structure.

## File Structure

New and modified files, by responsibility.

```
src/
  index.html                               MODIFY: drop nothing; fonts are self-hosted (Task 2)
  styles/
    cascade-layers.css                     MODIFY: layer list gains `primeng` (Task 3)
    design-tokens.css                      NEW: ported token layer + z-tier tokens (Task 2)
    fonts.css                              NEW: @font-face declarations, `base` layer (Task 2)
  app/
    app.config.ts                          MODIFY: providePrimeNG + TitleStrategy (Tasks 3, 13)
    app.routes.ts                          MODIFY: dev-only /specimen route (Task 4)
    app-shell/
      app-shell-layout/                    MODIFY: chrome grid + three children (Task 13)
      horizon-backdrop/                    NEW (Task 13)
      heads-up-display-header/             NEW (Task 13)
      mobile-bottom-dock/                  NEW (Task 13)
      page-title.strategy.ts               NEW (Task 13)
      CONTEXT.md                           REWRITE (Task 18)
    specimen/
      specimen.routes.ts                   NEW (Task 4)
      specimen.page.ts/.html/.css          NEW (Task 4), MODIFY each component task
      specimen-section/                    NEW (Task 4): framed section wrapper used by the page
      template-demos/                      NEW (Task 14): one full-page demo per page template
      CONTEXT.md                           NEW (Task 18)
    shared/design-system/
      theme/
        elevation.ts                       NEW: numeric z tiers (Task 3)
        jookoi-preset.ts                   NEW: definePreset custom preset (Task 3)
      indicators/                          status-light, bezel-jewel, segment-readout,
                                           classification-badge (Task 5)
      typography/                          eyebrow-label, stripe-rule, logotype (Task 6)
      actions/                             hardware-key, keycap, keycap-grid (Task 7)
      form-controls/                       field-label, console-input, stompbox-toggle,
                                           segment-selector (Task 8); chrome-select (Task 15)
      data-display/                        capability-tag, count-chip, tag-set, spec-list,
                                           prose-content (Task 9); record-grid (Task 17)
      surfaces/                            corner-brackets (directive), readout-panel,
                                           paper-sheet (Task 10)
      navigation/                          breadcrumb-trail, indicator-nav-list, pager (Task 11)
      page-layouts/                        toolbar-row (Task 12); filter-drawer (Task 16)
      page-templates/                      launcher-template, rack-results-template,
                                           detail-split-template, document-template (Task 14)
      CONTEXT.md                           REWRITE (Task 18)
public/fonts/                              NEW: 11 woff2 files (Task 2)
_architecture/ARCHITECTURE.md              MODIFY (Task 18)
_architecture/TODO.md                      MODIFY (Task 18)
```

Group folders are created by the CLI when the first component in them is generated. Do not pre-create empty folders — the ESLint config reads the folder list at load time and an empty `shared/` subfolder would generate a boundary rule for a folder with no code.

---

## Task 1: Install dependencies

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**

- Produces: `primeng`, `@primeuix/themes`, `@angular/cdk`, `@angular/aria` resolvable from `src/`.

- [ ] **Step 1: Read the peer ranges before installing**

```bash
pnpm view primeng@22 peerDependencies
pnpm view primeng@22 version
pnpm view @angular/cdk versions --json | tail -20
pnpm view @angular/aria versions --json | tail -20
```

Expected: `primeng` 22.1.x with peers `@angular/core ^22.1.0` and `@angular/cdk ^22.1.0`. `@angular/cdk` and `@angular/aria` must have a 22.1.x release. If `primeng`'s `@angular/core` peer does not include `^22.1.0`, **stop and report** — do not install a mismatched major.

- [ ] **Step 2: Install**

```bash
pnpm add primeng@~22.1.1 @angular/cdk@~22.1.6 @angular/aria@~22.1.6
```

Use the exact 22.1.x patch that Step 1 reported as latest; the `~` range keeps patch updates and blocks minors. If `@primeuix/themes` does not appear in `pnpm ls --depth 1` afterwards, add it explicitly: `pnpm add @primeuix/themes`.

- [ ] **Step 3: Confirm no licence warning and no peer conflict**

```bash
pnpm ls primeng @primeuix/themes @angular/cdk @angular/aria
```

Expected: no `ERR_PNPM_PEER_DEP_ISSUES`, and no `@primeui/license-manager` warning once the dev server has rebuilt.

If a licence warning does appear, record the exact text in `_architecture/plans/2026-09-15-angular-design-system-phase-2.md` under "Implementation deviations" and continue — a warning is not a blocker unless it fires at runtime in the browser.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Phase 2 task 1: install primeng, @angular/cdk, @angular/aria"
```

---

## Task 2: Design tokens and self-hosted fonts

**Files:**

- Create: `src/styles/design-tokens.css`, `src/styles/fonts.css`, `public/fonts/*.woff2`
- Modify: `angular.json` (styles array), `src/styles.css` (leave as-is, it stays the escape hatch)
- Source: `features/design-theme/tokens.css` (209 lines, port verbatim)

**Interfaces:**

- Produces: every semantic token named in `features/design-theme/tokens.css` lines 68–194, available on `:root`, inside `@layer tokens`. Plus six new elevation tokens: `--z-backdrop`, `--z-dock`, `--z-hud`, `--z-menu`, `--z-overlay`, `--z-modal`, `--z-tooltip`.

- [ ] **Step 1: Port the token file**

Copy `features/design-theme/tokens.css` to `src/styles/design-tokens.css` **unchanged in content**, then wrap the whole body in `@layer tokens { ... }` — including both trailing `@media` blocks (`max-width: 767px` and `prefers-contrast: more`), which stay inside the layer.

Structure after wrapping:

```css
/* Ported from features/design-theme/tokens.css. Two layers:
 *   1. Primitives (--p-*): raw values. Never referenced by components.
 *   2. Semantic tokens: what components use. A theme redefines only this layer.
 * PrimeNG's generated variables use the `png` prefix (decision 011) so they do
 * not collide with the --p-* primitives here.
 */
@layer tokens {
  :root {
    /* ... primitives, verbatim from tokens.css lines 17–65 ... */
  }

  :root,
  [data-theme='retro'] {
    /* ... semantic tokens, verbatim from tokens.css lines 70–193 ... */

    /* Elevation. One scale for the whole app; PrimeNG's zIndex tiers are
     * configured from the matching numbers in
     * shared/design-system/theme/elevation.ts. Keep the two in step. */
    --z-backdrop: -1;
    --z-dock: 100;
    --z-hud: 200;
    --z-menu: 1000;
    --z-overlay: 1100;
    --z-modal: 1200;
    --z-tooltip: 1300;
  }

  @media (max-width: 767px) {
    /* ... verbatim ... */
  }

  @media (prefers-contrast: more) {
    /* ... verbatim ... */
  }
}
```

- [ ] **Step 2: Download the fonts**

Eleven faces are used by the mockups (from the Google Fonts link in `features/design-theme/index.html:11`): Chakra Petch 500/600/700 + italic 700, Inter 400/500/600, JetBrains Mono 400/500/600/700.

```bash
mkdir -p public/fonts
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
URL='https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
curl -sA "$UA" "$URL" -o /tmp/gf.css
grep -o 'https://fonts.gstatic.com[^)]*\.woff2' /tmp/gf.css | sort -u
```

Download each latin-subset URL into `public/fonts/` with a readable name: `chakra-petch-500.woff2`, `chakra-petch-600.woff2`, `chakra-petch-700.woff2`, `chakra-petch-700-italic.woff2`, `inter-400.woff2`, `inter-500.woff2`, `inter-600.woff2`, `jetbrains-mono-400.woff2`, `jetbrains-mono-500.woff2`, `jetbrains-mono-600.woff2`, `jetbrains-mono-700.woff2`.

The API returns several subsets per family (latin, latin-ext, cyrillic, greek, vietnamese). Take the **latin** block only — it is the last `@font-face` per weight in the returned CSS, preceded by a `/* latin */` comment. Eleven files total.

If the network is unavailable, **stop and report**. Do not commit placeholder files and do not fall back to the Google Fonts CDN link — self-hosting is the requirement.

- [ ] **Step 3: Write the `@font-face` declarations**

Create `src/styles/fonts.css`:

```css
@layer base {
  @font-face {
    font-family: 'Chakra Petch';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('/fonts/chakra-petch-500.woff2') format('woff2');
  }
  /* ... one block per file: Chakra Petch 600, 700, and 700 italic
     (font-style: italic); Inter 400, 500, 600; JetBrains Mono 400, 500,
     600, 700. Same shape every time — only font-family, font-style,
     font-weight and the url change. */
}
```

- [ ] **Step 4: Register both stylesheets**

In `angular.json`, the build target's `styles` array becomes, in this exact order:

```json
"styles": [
  "src/styles/cascade-layers.css",
  "src/styles/design-tokens.css",
  "src/styles/fonts.css",
  "src/styles/base-element-styles.css",
  "src/styles.css"
]
```

`cascade-layers.css` must stay first — it declares the layer order, and a layer's position is fixed by its first mention.

- [ ] **Step 5: Prove the fonts and tokens actually land**

Temporarily add to `src/app/app-shell/home.page.html`:

```html
<p style="font-family: var(--font-display); color: var(--text-accent)">Chakra Petch in cyan</p>
<p style="font-family: var(--font-mono); color: var(--text-hot)">JetBrains Mono in magenta</p>
```

Open the served page. Expected: both lines render in the named faces (not a fallback), in cyan and magenta, on the near-black `--bg-page` ground. Check the browser network panel: **zero 404s under `/fonts/`**, and no request to `fonts.gstatic.com`. Then revert the two temporary `<p>` lines.

- [ ] **Step 6: Commit**

```bash
git add src/styles/design-tokens.css src/styles/fonts.css public/fonts angular.json
git commit -m "Phase 2 task 2: design tokens layer and self-hosted fonts"
```

---

## Task 3: PrimeNG preset, cascade layer and elevation

Nothing consumes PrimeNG before this task. Doing it once, correctly, is what makes every later skin cheap.

**Files:**

- Create: `src/app/shared/design-system/theme/elevation.ts`, `src/app/shared/design-system/theme/jookoi-preset.ts`
- Modify: `src/app/app.config.ts`, `src/styles/cascade-layers.css`

**Interfaces:**

- Consumes: the semantic tokens from Task 2.
- Produces: `export const ELEVATION: { dock: number; hud: number; menu: number; overlay: number; modal: number; tooltip: number }` from `theme/elevation.ts`; `export const jookoiPreset` from `theme/jookoi-preset.ts`. PrimeNG CSS variables are emitted with the `png` prefix into an `@layer primeng`.

- [ ] **Step 1: Declare the PrimeNG layer**

`src/styles/cascade-layers.css` becomes:

```css
/* Layer order. A layer's position is fixed by its first mention, so this file
 * is the first entry in angular.json's styles array. PrimeNG emits into
 * `primeng`, which sits below `components` so our component rules win by
 * layer rather than by specificity (decisions 007 and 011). */
@layer reset, tokens, base, primeng, components, utilities;
```

- [ ] **Step 2: Write the elevation constants**

`src/app/shared/design-system/theme/elevation.ts`:

```ts
/**
 * One elevation scale for the whole app. These numbers are the same values as
 * the --z-* tokens in src/styles/design-tokens.css; PrimeNG's overlay manager
 * is JavaScript-side and cannot read CSS custom properties, so it is configured
 * from here. Change one, change the other.
 */
export const ELEVATION = {
  dock: 100,
  hud: 200,
  menu: 1000,
  overlay: 1100,
  modal: 1200,
  tooltip: 1300,
} as const;
```

- [ ] **Step 3: Write the custom preset**

`src/app/shared/design-system/theme/jookoi-preset.ts`. Preset token values are emitted as CSS variable values, so `'var(--surface-chrome)'` is a legal value and makes PrimeNG components inherit our palette natively — which is what makes a future `sleek` theme a pure `[data-theme]` swap.

```ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * PrimeNG preset mapped onto our semantic tokens (decision 011). Aura supplies
 * the structural token set; every value that is visible in our design is
 * redirected at a token we already own, so PrimeNG components follow the theme
 * without a second palette.
 *
 * Only the semantic layer is overridden here. Component-level fine-tuning
 * belongs in that component's own CSS, in the `components` cascade layer.
 */
export const jookoiPreset = definePreset(Aura, {
  semantic: {
    primary: {
      color: 'var(--text-accent)',
      contrastColor: 'var(--text-on-neon)',
      hoverColor: 'var(--p-cyan-300)',
      activeColor: 'var(--p-cyan-400)',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--focus-ring)',
      offset: '2px',
    },
    formField: {
      background: 'var(--surface-chrome)',
      borderColor: 'var(--border-chrome)',
      color: 'var(--text-primary)',
      placeholderColor: 'var(--text-dim)',
      focusBorderColor: 'var(--focus-ring)',
      borderRadius: 'var(--radius-chip)',
      paddingX: 'var(--space-3)',
      paddingY: 'var(--space-2)',
    },
    overlay: {
      select: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 12px 32px var(--shadow-deep)',
      },
      popover: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 12px 32px var(--shadow-deep)',
      },
      modal: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 24px 64px var(--shadow-deep)',
      },
    },
    list: {
      option: {
        color: 'var(--text-muted)',
        focusColor: 'var(--text-primary)',
        selectedColor: 'var(--text-accent)',
        focusBackground: 'var(--surface-row-hover)',
        selectedBackground: 'var(--surface-inset)',
        borderRadius: 'var(--radius-chip)',
      },
    },
    content: {
      background: 'var(--surface-readout)',
      borderColor: 'var(--border-subtle)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-panel)',
    },
    text: {
      color: 'var(--text-primary)',
      mutedColor: 'var(--text-muted)',
    },
    maskBackground: 'var(--shadow-deep)',
  },
});
```

Aura's token names are the contract here. Before writing the file, open `node_modules/@primeuix/themes/aura/index.mjs` (or `.d.ts`) and confirm each key above exists in the `semantic` object. **Any key that does not exist is silently ignored by `definePreset`** — that is the main failure mode of this task. Drop keys that are not there and note which in the commit message; do not invent replacements.

- [ ] **Step 4: Wire the config**

`src/app/app.config.ts`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { jookoiPreset } from './shared/design-system/theme/jookoi-preset';
import { ELEVATION } from './shared/design-system/theme/elevation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    providePrimeNG({
      theme: {
        preset: jookoiPreset,
        options: {
          // PrimeNG defaults to `p`, which collides head-on with our --p-*
          // primitive tokens. Moving PrimeNG's prefix is the cheaper side of
          // the collision (decision 011).
          prefix: 'png',
          // Our theme is always dark. Binding the dark selector to the theme
          // attribute that is already static in index.html means PrimeNG's
          // dark palette applies without a second mechanism.
          darkModeSelector: '[data-theme="retro"]',
          cssLayer: {
            name: 'primeng',
            order: 'reset, tokens, base, primeng, components, utilities',
          },
        },
      },
      zIndex: {
        menu: ELEVATION.menu,
        overlay: ELEVATION.overlay,
        modal: ELEVATION.modal,
        tooltip: ELEVATION.tooltip,
      },
    }),
  ],
};
```

- [ ] **Step 5: Verify the emitted CSS**

Inspect the live stylesheet in the running dev server — devtools, the layer order as it actually computes. Do not build to look at this: the dev server emits the same layers into the document, and reading the built bundle only answers the question a build later.

Then, in the same panel:

```bash
grep -o "@layer primeng" dist/jookoi-frontpage/browser/styles-*.css | head -1
grep -c -- "--png-" dist/jookoi-frontpage/browser/styles-*.css
grep -c -- "--p-primary" dist/jookoi-frontpage/browser/styles-*.css
```

Expected: `@layer primeng` present; `--png-` count greater than zero; `--p-primary` count **zero** (a non-zero count means `prefix` did not take and PrimeNG is overwriting our primitives — stop and fix before going further).

- [ ] **Step 6: Commit**

```bash
git add src/styles/cascade-layers.css src/app/app.config.ts src/app/shared/design-system/theme
git commit -m "Phase 2 task 3: PrimeNG preset, primeng cascade layer, elevation scale"
```

---

## Task 4: The `/specimen` route

**Files:**

- Create: `src/app/specimen/specimen.routes.ts`, `src/app/specimen/specimen.page.ts`, `.html`, `.css`
- Create: `src/app/specimen/specimen-section/specimen-section.component.ts`, `.html`, `.css`
- Modify: `src/app/app.routes.ts`

**Interfaces:**

- Produces: `joo-specimen-section` with `label` input and content projection — every later task adds its components inside one of these. `specimenRoutes` lazy-loaded at `/specimen`, dev builds only.

- [ ] **Step 1: Generate the page and the section component**

```bash
pnpm ng g c specimen/specimen --type=page --flat --selector=joo-specimen-page
pnpm ng g c specimen/specimen-section
```

- [ ] **Step 2: Write the section wrapper**

`src/app/specimen/specimen-section/specimen-section.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-specimen-section',
  templateUrl: './specimen-section.component.html',
  styleUrl: './specimen-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenSectionComponent {
  readonly label = input.required<string>();
}
```

`specimen-section.component.html`:

```html
<h2>{{ label() }}</h2>
<div class="specimen-section__items">
  <ng-content />
</div>
```

`specimen-section.component.css`:

```css
:host {
  display: block;
  padding: var(--space-4);
  background: var(--surface-panel);
  border: 1px solid var(--border-panel);
  border-radius: var(--radius-panel);
}

h2 {
  margin: 0 0 var(--space-4);
  font: 600 var(--text-xs) / 1 var(--font-display);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.specimen-section__items {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-4);
}
```

- [ ] **Step 3: Write the page, empty of components**

`specimen.page.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

@Component({
  selector: 'joo-specimen-page',
  imports: [SpecimenSectionComponent],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {}
```

`specimen.page.html`:

```html
<h1>Specimen</h1>
<p>Dev-only parts kit. Every design-system component, in every state it has.</p>

<!-- Each task appends one <joo-specimen-section> here. Keep them in the
     order components were built: indicators, typography, actions,
     form-controls, data-display, surfaces, navigation, page-layouts,
     page-templates. -->
```

`specimen.page.css`:

```css
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  width: 100%;
  max-width: var(--content-max);
  margin-inline: auto;
  padding: var(--space-6);
}

h1 {
  margin: 0;
  font: 700 var(--text-xl) / 1.1 var(--font-display);
  color: var(--text-primary);
}

p {
  margin: 0;
  color: var(--text-muted);
}
```

`specimen.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { SpecimenPage } from './specimen.page';

export const specimenRoutes: Routes = [{ path: '', component: SpecimenPage }];
```

- [ ] **Step 4: Register it, dev builds only**

`src/app/app.routes.ts`:

```ts
import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { HomePage } from './app-shell/home.page';
import { NotFoundPage } from './app-shell/not-found.page';

/**
 * The specimen parts kit is a development tool, not a page of the site. The
 * route exists only when isDevMode() is true, so the production route table
 * never contains it and the prerenderer never sees it. Its chunk is lazy, so
 * it costs nothing in the initial bundle either way.
 */
export const routes: Routes = [
  { path: '', component: HomePage },
  ...(isDevMode()
    ? [
        {
          path: 'specimen',
          loadChildren: () => import('./specimen/specimen.routes').then((m) => m.specimenRoutes),
        },
      ]
    : []),
  { path: '**', component: NotFoundPage },
];
```

The wildcard stays last. `app.routes.server.ts` needs no change — prerendering enumerates the production route table, where `specimen` is absent.

- [ ] **Step 5: Verify both modes**

```bash
pnpm start
```

Open `http://localhost:4200/specimen`. Expected: the heading renders; no console errors.

```bash
ls dist/jookoi-frontpage/browser/
```

Expected: **no `specimen/index.html`** in the prerendered output. If one exists, the `isDevMode()` guard is not being applied at prerender time — stop and report before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/app/specimen src/app/app.routes.ts
git commit -m "Phase 2 task 4: dev-only /specimen route and section wrapper"
```

---

## How the component tasks work

Tasks 5 through 12 all have the same shape, so the shape is written here once.

For each component:

1. Generate it: `pnpm ng g c shared/design-system/<group>/<name>`.
2. Write the `.ts` exactly as the task gives it.
3. Write the `.html` exactly as the task gives it, or delete it and use an inline `template: ''` where the task says the component has no template of its own.
4. Write the `.css` by porting the named line range of `features/design-theme/components.css`, applying the **porting rules** below.
5. Add it to `/specimen` inside its group's `<joo-specimen-section>`, in every state the task lists.

**Porting rules** — these apply to every CSS port in this plan:

- The mockup's **block class becomes `:host`**. `.led { ... }` becomes `:host { ... }`.
- The mockup's **modifier classes become host classes driven by inputs**. `.led--cyan` becomes `:host(.is-cyan)`, set by `host: { '[class.is-cyan]': "color() === 'cyan'" }`. Never re-expose the mockup's class name as an input value unless the task says so.
- The mockup's **element classes (`.toggle__jewel`) do not survive** unless they name a real child element inside this component's template. Where the child is itself a component, the declarations move to that component's own file instead.
- **Attribute selectors that describe real ARIA state stay as attribute selectors**: `:host([aria-pressed='true'])`. This is the point of the design — state is already in the DOM, so the CSS reads it directly.
- Raw values stay raw only where the mockup has them raw (`8px`, `50%`). Anything the mockup wrote as a token stays a token.
- Drop `@media` blocks that belong to the page, not the part. Keep `@media` inside a component only where the task says so.
- Where a component must not introduce a box into its parent's grid, add `:host { display: contents; }` and style the children.

---

## Task 5: Indicators

**Files:**

- Create: `src/app/shared/design-system/indicators/status-light/`, `bezel-jewel/`, `segment-readout/`, `classification-badge/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:206-246` (status-light), `:460-503` (bezel-jewel), `:922-943` (segment-readout), `:993-1031` (classification-badge)

**Interfaces:**

- Produces:
  - `joo-status-light` — `color: 'off' | 'cyan' | 'magenta' | 'amber' | 'green'` (default `'off'`), `on: boolean`, `blink: boolean`, `label: string` (default `''`).
  - `joo-bezel-jewel` — `color: 'cyan' | 'magenta' | 'amber' | 'green'` (default `'cyan'`), `on: boolean`.
  - `joo-segment-readout` — `color: 'cyan' | 'magenta' | 'amber'` (default `'cyan'`), content projected.
  - `joo-classification-badge` — `variant: 'solid' | 'dashed' | 'double'` (default `'solid'`), content projected.

- [ ] **Step 1: `status-light`**

The bare emissive dot. No housing — the housed version is `bezel-jewel`, a separate component (decision 012, finding 1).

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusLightColor = 'off' | 'cyan' | 'magenta' | 'amber' | 'green';

@Component({
  selector: 'joo-status-light',
  template: '',
  styleUrl: './status-light.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[class.is-cyan]': "color() === 'cyan'",
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
    '[class.is-green]': "color() === 'green'",
    '[class.is-lit]': 'lit()',
    '[class.is-blinking]': 'blink()',
  },
})
export class StatusLightComponent {
  readonly color = input<StatusLightColor>('off');
  readonly on = input(false);
  readonly blink = input(false);
  readonly label = input('');

  /** A coloured light is lit unless it is explicitly the `off` colour. */
  protected readonly lit = computed(() => this.on() && this.color() !== 'off');
}
```

Delete the generated `.html`. CSS, ported from `components.css:206-246`:

```css
:host {
  --light: var(--led-off);
  display: inline-block;
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    color-mix(in srgb, white 55%, var(--light)),
    var(--light) 60%
  );
  box-shadow: 0 0 0 1px var(--shadow-deep);
}

:host(.is-cyan) {
  --light: var(--led-cyan);
}
:host(.is-magenta) {
  --light: var(--led-magenta);
}
:host(.is-amber) {
  --light: var(--led-amber);
}
:host(.is-green) {
  --light: var(--led-green);
}

:host(.is-lit) {
  box-shadow:
    0 0 0 1px var(--shadow-deep),
    0 0 8px var(--light);
}

:host(.is-blinking) {
  animation: status-light-blink 1.4s steps(2, jump-none) infinite;
}

@keyframes status-light-blink {
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  :host(.is-blinking) {
    animation: none;
  }
}
```

The mockup's local variable was `--led`; it is renamed `--light` so it cannot be mistaken for the `--led-*` semantic tokens it reads from.

- [ ] **Step 2: `bezel-jewel`**

The same emissive idea seated in a metal bezel ring. Ported from the `.toggle__jewel` declarations at `components.css:460-503` — those declarations belong to this component, not to `stompbox-toggle`, because the bezel is what makes it a different part.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BezelJewelColor = 'cyan' | 'magenta' | 'amber' | 'green';

@Component({
  selector: 'joo-bezel-jewel',
  template: '',
  styleUrl: './bezel-jewel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
    '[class.is-green]': "color() === 'green'",
    '[class.is-lit]': 'on()',
  },
})
export class BezelJewelComponent {
  readonly color = input<BezelJewelColor>('cyan');
  readonly on = input(false);
}
```

CSS:

```css
:host {
  --jewel: var(--led-cyan);
  display: inline-block;
  width: 14px;
  height: 14px;
  flex: none;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--led-off), var(--surface-inset));
  box-shadow:
    0 0 0 2px var(--jewel-rim),
    0 0 0 3px var(--key-edge);
  transition: box-shadow var(--duration-state);
}

:host(.is-magenta) {
  --jewel: var(--led-magenta);
}
:host(.is-amber) {
  --jewel: var(--led-amber);
}
:host(.is-green) {
  --jewel: var(--led-green);
}

:host(.is-lit) {
  background: radial-gradient(
    circle at 35% 30%,
    color-mix(in srgb, white 60%, var(--jewel)),
    var(--jewel) 65%
  );
  box-shadow:
    0 0 0 2px var(--jewel-rim),
    0 0 0 3px var(--key-edge),
    0 0 12px var(--jewel);
}
```

- [ ] **Step 3: `segment-readout`**

Ported from `components.css:922-943`. Read the source range before writing — it includes a `::before` that holds the unlit "ghost" segments behind the value, which is the whole effect.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SegmentReadoutColor = 'cyan' | 'magenta' | 'amber';

@Component({
  selector: 'joo-segment-readout',
  template: '<ng-content />',
  styleUrl: './segment-readout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
  },
})
export class SegmentReadoutComponent {
  readonly color = input<SegmentReadoutColor>('cyan');
}
```

In the CSS, `.readout` becomes `:host`, and the colour modifiers become `:host(.is-magenta)` / `:host(.is-amber)` redefining a local `--readout-color` that the text colour and glow both read.

- [ ] **Step 4: `classification-badge`**

Meaning is carried by border treatment and shape, not colour (decision 012, finding 2). The input is a named border treatment. Ported from `components.css:993-1031` — the `.trust--trusted` and `.trust--discovered` rules there are the `solid` and `dashed` variants; `double` is the third treatment, written by analogy using `border-style: double`.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Border treatment, not colour. The shape is what carries the meaning. */
export type ClassificationVariant = 'solid' | 'dashed' | 'double';

@Component({
  selector: 'joo-classification-badge',
  template: '<ng-content />',
  styleUrl: './classification-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-dashed]': "variant() === 'dashed'",
    '[class.is-double]': "variant() === 'double'",
  },
})
export class ClassificationBadgeComponent {
  readonly variant = input<ClassificationVariant>('solid');
}
```

Port the shared `.trust` declarations to `:host`, including the `::before` glyph. `:host(.is-dashed)` gets `border-style: dashed`, `:host(.is-double)` gets `border-style: double; border-width: 3px`. Each variant keeps its own `::before` content from the source range.

- [ ] **Step 5: Add all four to `/specimen`**

In `specimen.page.ts`, add the four components to `imports`. In `specimen.page.html`:

```html
<joo-specimen-section label="Indicators">
  @for (color of ['off', 'cyan', 'magenta', 'amber', 'green']; track color) {
  <joo-status-light [color]="color" [on]="true" [label]="color" />
  }
  <joo-status-light color="cyan" [on]="true" [blink]="true" label="blinking" />
  <joo-status-light color="cyan" [on]="false" label="unlit" />

  <joo-bezel-jewel [on]="false" />
  @for (color of ['cyan', 'magenta', 'amber', 'green']; track color) {
  <joo-bezel-jewel [color]="color" [on]="true" />
  }

  <joo-segment-readout>0142</joo-segment-readout>
  <joo-segment-readout color="magenta">88</joo-segment-readout>
  <joo-segment-readout color="amber">7</joo-segment-readout>

  <joo-classification-badge>Trusted</joo-classification-badge>
  <joo-classification-badge variant="dashed">Discovered</joo-classification-badge>
  <joo-classification-badge variant="double">Archived</joo-classification-badge>
</joo-specimen-section>
```

`@for` over a string literal array needs the array to be a component field for `strictTemplates` to type it. Add to `SpecimenPage`:

```ts
protected readonly lightColors = ['off', 'cyan', 'magenta', 'amber', 'green'] as const;
protected readonly jewelColors = ['cyan', 'magenta', 'amber', 'green'] as const;
```

and iterate those instead of inline literals.

- [ ] **Step 6: Verify and commit**

Check `/specimen` at 390px and 1440px in the running dev server. Every lit light glows; the unlit ones do not; the jewel visibly has a metal ring the status light lacks; the three badges are distinguishable with colour vision disabled (check by taking a greyscale screenshot — if you cannot tell them apart, the port lost the shape distinction and must be fixed).

```bash
git add src/app/shared/design-system/indicators src/app/specimen
git commit -m "Phase 2 task 5: indicator primitives"
```

---

## Task 6: Typography primitives

**Files:**

- Create: `src/app/shared/design-system/typography/eyebrow-label/`, `stripe-rule/`, `logotype/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:159-166` (eyebrow), `:190-203` (stripe rule), `:130-151` (logotype)

**Interfaces:**

- Produces:
  - `joo-eyebrow-label` — content projected, no inputs.
  - `joo-stripe-rule` — no inputs, no content.
  - `joo-logotype` — `size: 'md' | 'sm'` (default `'md'`), content projected.

- [ ] **Step 1: `eyebrow-label`**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-eyebrow-label',
  template: '<ng-content />',
  styleUrl: './eyebrow-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EyebrowLabelComponent {}
```

CSS: port `.eyebrow` from `components.css:159-166` onto `:host`, adding `display: block`.

- [ ] **Step 2: `stripe-rule`**

The hazard-stripe divider. It is decoration, so the host carries `role="separator"` and the stripes are a background, not content.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-stripe-rule',
  template: '',
  styleUrl: './stripe-rule.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
})
export class StripeRuleComponent {}
```

CSS: port `.stripes` from `components.css:190-203` onto `:host`. Delete the generated `.html`.

- [ ] **Step 3: `logotype`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-logotype',
  template: '<ng-content />',
  styleUrl: './logotype.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-small]': "size() === 'sm'" },
})
export class LogotypeComponent {
  readonly size = input<'md' | 'sm'>('md');
}
```

CSS: `.logotype` at `components.css:130-146` becomes `:host`, `.logotype--sm` at `:147-151` becomes `:host(.is-small)`. The `.logotype b` rule at `:142-146` stays as a descendant `b` selector — the consumer projects `<b>` to mark the accented half of the wordmark, and that is part of this component's contract. Say so in a comment above the rule.

- [ ] **Step 4: Add to `/specimen` and commit**

```html
<joo-specimen-section label="Typography">
  <joo-eyebrow-label>Section label</joo-eyebrow-label>
  <joo-logotype>Joo<b>Koi</b></joo-logotype>
  <joo-logotype size="sm">Joo<b>Koi</b></joo-logotype>
  <joo-stripe-rule style="flex-basis: 100%" />
</joo-specimen-section>
```

The stripe rule needs full width to read correctly, hence the inline `flex-basis`. Specimen-local layout hacks are fine; design-system CSS stays clean.

```bash
git add src/app/shared/design-system/typography src/app/specimen
git commit -m "Phase 2 task 6: typography primitives"
```

---

## Task 7: Actions — the hardware key

`hardware-key` is **one component in five placements**, not four components (decision 012, finding 3). Every pressable slab in the design is this part: buttons, nav links, latching toggles, pager cards, dock items.

**Files:**

- Create: `src/app/shared/design-system/actions/hardware-key/`, `keycap/`, `keycap-grid/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:265-378` (hardware-key), `:381-406` (keycap), `:408-418` (keycap-grid)

**Interfaces:**

- Produces:
  - `joo-hardware-key` — `size: 'xs' | 'sm' | 'md' | 'lg'` (default `'md'`), `accent: 'neutral' | 'hot' | 'cyan'` (default `'neutral'`), `block: boolean`, `pressed: boolean | null` (default `null`), `current: boolean`, `as: 'button' | 'anchor'` (default `'button'`), `href: string`, `type: 'button' | 'submit'` (default `'button'`), `disabled: boolean`; `press` output of type `void`; content projected.
  - `joo-keycap` — `fn: string`, `label: string` (required), `count: number | null` (default `null`), `href: string`.
  - `joo-keycap-grid` — content projected.

- [ ] **Step 1: Write `hardware-key`**

The host renders the real `<button>` or `<a>` inside itself and is `display: contents`, so the interactive element becomes the direct grid child of whatever contains the key. This is the one place a component owns an inner element rather than styling its host: the choice between `<button>` and `<a>` is semantic and must be a real element, and an Angular component's host element cannot change tag name.

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type HardwareKeySize = 'xs' | 'sm' | 'md' | 'lg';
export type HardwareKeyAccent = 'neutral' | 'hot' | 'cyan';

@Component({
  selector: 'joo-hardware-key',
  templateUrl: './hardware-key.component.html',
  styleUrl: './hardware-key.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-xs]': "size() === 'xs'",
    '[class.is-sm]': "size() === 'sm'",
    '[class.is-lg]': "size() === 'lg'",
    '[class.is-hot]': "accent() === 'hot'",
    '[class.is-cyan]': "accent() === 'cyan'",
    '[class.is-block]': 'block()',
  },
})
export class HardwareKeyComponent {
  readonly size = input<HardwareKeySize>('md');
  readonly accent = input<HardwareKeyAccent>('neutral');
  readonly block = input(false);
  /** null means "not a latching control" — no aria-pressed attribute at all. */
  readonly pressed = input<boolean | null>(null);
  readonly current = input(false);
  readonly as = input<'button' | 'anchor'>('button');
  readonly href = input('');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly press = output<void>();
}
```

`hardware-key.component.html`:

```html
@if (as() === 'anchor') {
<a
  class="key"
  [href]="href()"
  [attr.aria-current]="current() ? 'page' : null"
  [attr.aria-pressed]="pressed()"
  (click)="press.emit()"
>
  <ng-content />
</a>
} @else {
<button
  class="key"
  [type]="type()"
  [disabled]="disabled()"
  [attr.aria-current]="current() ? 'page' : null"
  [attr.aria-pressed]="pressed()"
  (click)="press.emit()"
>
  <ng-content />
</button>
}
```

`<ng-content />` appears in both branches of the `@if`. Angular projects into whichever branch is live, so the content is not duplicated in the DOM.

CSS, ported from `components.css:265-365`:

```css
:host {
  display: contents;
}

.key {
  /* every declaration from components.css:266-298, verbatim */
}

.key:hover {
  filter: brightness(1.15);
}

.key:active {
  /* components.css:305-313 */
}

.key[aria-pressed='true'],
.key[aria-current='page'] {
  /* components.css:315-324 */
}

.key:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.key:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:host(.is-hot) .key {
  /* components.css:326-333 */
}
:host(.is-cyan) .key {
  /* components.css:335-342 */
}
:host(.is-sm) .key {
  /* components.css:344-348 */
}
:host(.is-xs) .key {
  /* components.css:350-355 */
}
:host(.is-lg) .key {
  /* components.css:357-361 */
}
:host(.is-block) .key {
  width: 100%;
}
```

The mockup rules at `components.css:368-378` light a nested `.led` when the key latches. Do **not** port them — a `status-light` projected into a key is a separate component and cannot be reached from here without `::ng-deep`. The consumer binds the light's own `on` input to the same condition that sets `pressed`. Put that in the component's file-header comment so the next reader does not go hunting for the missing rule.

- [ ] **Step 2: Write `keycap`**

A legend key: small fn line, label, optional trailing count. It **uses** `hardware-key` rather than restyling it — `keycap` is the composition, the slab is the primitive.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../hardware-key/hardware-key.component';

@Component({
  selector: 'joo-keycap',
  imports: [HardwareKeyComponent],
  templateUrl: './keycap.component.html',
  styleUrl: './keycap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeycapComponent {
  readonly fn = input('');
  readonly label = input.required<string>();
  readonly count = input<number | null>(null);
  readonly href = input('');
}
```

`keycap.component.html`:

```html
<joo-hardware-key [as]="href() ? 'anchor' : 'button'" [href]="href()" [block]="true">
  <span class="keycap__body">
    @if (fn()) {
    <span class="keycap__fn">{{ fn() }}</span>
    }
    <span class="keycap__label">{{ label() }}</span>
    @if (count() !== null) {
    <span class="keycap__count">{{ count() }}</span>
    }
  </span>
</joo-hardware-key>
```

CSS: port `components.css:381-406`. `.keycap`'s own declarations (`flex-direction: column`, `min-height: 4.5rem`, alignment, `text-align: left`, `white-space: normal`) apply to `.keycap__body` — it is the projected content inside the key, and `display: flex` must be added to it because the mockup inherited that from `.key`. The `__fn` / `__label` / `__count` rules port unchanged.

- [ ] **Step 3: Write `keycap-grid`**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-keycap-grid',
  template: '<ng-content />',
  styleUrl: './keycap-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeycapGridComponent {}
```

CSS: port `.keygrid` from `components.css:408-418` onto `:host`. Keep the `padding-bottom: calc(var(--space-3) + var(--key-travel))` — that extra space is what stops the bottom row's key travel clipping.

- [ ] **Step 4: Add to `/specimen`**

```html
<joo-specimen-section label="Actions">
  <joo-hardware-key size="xs">Extra small</joo-hardware-key>
  <joo-hardware-key size="sm">Small</joo-hardware-key>
  <joo-hardware-key>Medium</joo-hardware-key>
  <joo-hardware-key size="lg">Large</joo-hardware-key>
  <joo-hardware-key accent="hot">Hot</joo-hardware-key>
  <joo-hardware-key accent="cyan">Cyan</joo-hardware-key>
  <joo-hardware-key [pressed]="true">Latched</joo-hardware-key>
  <joo-hardware-key [current]="true" as="anchor" href="#">Current page</joo-hardware-key>
  <joo-hardware-key [disabled]="true">Disabled</joo-hardware-key>

  <joo-keycap-grid style="flex-basis: 100%">
    <joo-keycap fn="F1" label="Reference" [count]="42" href="#" />
    <joo-keycap fn="F2" label="Tools" [count]="17" href="#" />
    <joo-keycap label="No legend" />
  </joo-keycap-grid>
</joo-specimen-section>
```

- [ ] **Step 5: Verify and commit**

Check at 390px and 1440px. Every key visibly travels down on press and springs back; the latched key sits half-down with its edge shortened; the disabled key does not respond to hover. Keyboard focus shows the cyan ring on every key, the anchor included.

```bash
git add src/app/shared/design-system/actions src/app/specimen
git commit -m "Phase 2 task 7: hardware key, keycap, keycap grid"
```

---

## Task 8: Our own form controls

Four components, three with real interaction logic and therefore a spec file each. This is the first task with tests.

**Files:**

- Create: `src/app/shared/design-system/form-controls/field-label/`, `console-input/`, `stompbox-toggle/`, `segment-selector/`
- Test: `console-input/console-input.component.spec.ts`, `stompbox-toggle/stompbox-toggle.component.spec.ts`, `segment-selector/segment-selector.component.spec.ts`
- Source: `components.css:679-687` (field-label), `:576-658` (console-input), `:426-459` + `:470-503` (stompbox-toggle), `:526-568` (segment-selector)

**Interfaces:**

- Produces:
  - `joo-field-label` — `for: string`, content projected.
  - `joo-console-input` — `size: 'compact' | 'md' | 'lg'` (default `'md'`), `placeholder: string`, `inputId: string`, `value` as `model<string>('')`, `submitted` output of type `string`, content projected after the field.
  - `joo-stompbox-toggle` — `on` as `model<boolean>(false)`, `color: BezelJewelColor` (default `'cyan'`), content projected as the label.
  - `joo-segment-selector` — `options` as `input.required<readonly SegmentOption[]>()` where `SegmentOption = { readonly value: string; readonly label: string }`, `value` as `model<string>('')`, `ariaLabel: string`.

- [ ] **Step 1: `field-label`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-field-label',
  template: '<label [attr.for]="for()"><ng-content /></label>',
  styleUrl: './field-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldLabelComponent {
  readonly for = input('');
}
```

CSS: `:host { display: block; }` plus `.field-label`'s declarations from `components.css:679-687` applied to `label`.

- [ ] **Step 2: Write the failing test for `console-input`**

`console-input.component.spec.ts`. The host-component pattern here is the point: it binds `[(value)]` and renders the bound signal, so the assertion reads the two-way contract off the DOM rather than off the component instance.

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { ConsoleInputComponent } from './console-input.component';

@Component({
  selector: 'joo-console-input-host',
  imports: [ConsoleInputComponent],
  template: `
    <joo-console-input [(value)]="query" inputId="q" placeholder="Search" />
    <p>echo: {{ query() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConsoleInputHost {
  readonly query = signal('');
}

describe('ConsoleInputComponent', () => {
  it('writes typed text back through the two-way value binding', async () => {
    const fixture = TestBed.createComponent(ConsoleInputHost);
    await fixture.whenStable();

    await userEvent.type(page.getByRole('textbox', { name: 'Search' }), 'weather');
    await fixture.whenStable();

    await expect.element(page.getByText('echo: weather')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `pnpm run test:ci`
Expected: FAIL — `Cannot find module './console-input.component'`.

- [ ] **Step 4: Write `console-input`**

```ts
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export type ConsoleInputSize = 'compact' | 'md' | 'lg';

@Component({
  selector: 'joo-console-input',
  templateUrl: './console-input.component.html',
  styleUrl: './console-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-compact]': "size() === 'compact'",
    '[class.is-large]': "size() === 'lg'",
  },
})
export class ConsoleInputComponent {
  readonly size = input<ConsoleInputSize>('md');
  readonly placeholder = input('');
  readonly inputId = input('');
  readonly value = model('');
  readonly submitted = output<string>();

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onEnter(): void {
    this.submitted.emit(this.value());
  }
}
```

`console-input.component.html`:

```html
<span class="console__prompt" aria-hidden="true">&gt;</span>
<input
  class="console__input"
  type="text"
  [id]="inputId()"
  [attr.aria-label]="placeholder() || null"
  [placeholder]="placeholder()"
  [value]="value()"
  (input)="onInput($event)"
  (keydown.enter)="onEnter()"
/>
<ng-content />
```

The trailing `<ng-content />` is where a consumer projects the launch key. CSS: `.console` at `components.css:576-593` becomes `:host`; `.console:focus-within` becomes `:host(:focus-within)`; `.console--lg` and `.console--compact` become `:host(.is-large)` and `:host(.is-compact)`. Keep the `@media (max-width: 767px)` block at `:653-658` that forces `font-size: 16px` — that one belongs to the part, because it stops iOS zooming the page on focus.

- [ ] **Step 5: Run the test again**

Run: `pnpm run test:ci`
Expected: PASS.

- [ ] **Step 6: Write the failing test for `stompbox-toggle`**

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { StompboxToggleComponent } from './stompbox-toggle.component';

@Component({
  selector: 'joo-stompbox-toggle-host',
  imports: [StompboxToggleComponent],
  template: `<joo-stompbox-toggle [(on)]="active">Has feed</joo-stompbox-toggle>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StompboxToggleHost {
  readonly active = signal(false);
}

describe('StompboxToggleComponent', () => {
  it('latches on click and reports its state through aria-pressed', async () => {
    const fixture = TestBed.createComponent(StompboxToggleHost);
    await fixture.whenStable();

    const toggle = page.getByRole('button', { name: /has feed/i });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    await fixture.whenStable();

    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByText('ON')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run it and watch it fail**

Run: `pnpm run test:ci`
Expected: FAIL — `Cannot find module './stompbox-toggle.component'`.

- [ ] **Step 8: Write `stompbox-toggle`**

The state word is real text, not CSS `content`. The mockup used `::before { content: 'OFF' }`; generated content is not reliably read by screen readers and the test above asserts on it, so it becomes a `<span>`.

```ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
  BezelJewelComponent,
  BezelJewelColor,
} from '../../indicators/bezel-jewel/bezel-jewel.component';

@Component({
  selector: 'joo-stompbox-toggle',
  imports: [BezelJewelComponent],
  templateUrl: './stompbox-toggle.component.html',
  styleUrl: './stompbox-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-on]': 'on()' },
})
export class StompboxToggleComponent {
  readonly on = model(false);
  readonly color = input<BezelJewelColor>('cyan');

  protected toggle(): void {
    this.on.update((current) => !current);
  }
}
```

`stompbox-toggle.component.html`:

```html
<button type="button" class="toggle" [attr.aria-pressed]="on()" (click)="toggle()">
  <joo-bezel-jewel [color]="color()" [on]="on()" />
  <span class="toggle__label"><ng-content /></span>
  <span class="toggle__state">{{ on() ? 'ON' : 'OFF' }}</span>
</button>
```

CSS: `:host { display: block; }`; `.toggle` declarations from `components.css:426-458` apply to `.toggle`; the `[aria-pressed='true']` rules at `:480-484` and `:497-499` stay as attribute selectors on `.toggle`. The `.toggle__jewel` rules at `:460-468` and `:485-495` are **not** ported — they live in `bezel-jewel` already (Task 5). The `--toggle-color` modifier rules at `:505-513` are not ported either; colour now travels as the jewel's own input.

- [ ] **Step 9: Run the test again**

Run: `pnpm run test:ci`
Expected: PASS.

- [ ] **Step 10: Write the failing test for `segment-selector`**

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { SegmentSelectorComponent } from './segment-selector.component';

@Component({
  selector: 'joo-segment-selector-host',
  imports: [SegmentSelectorComponent],
  template: `
    <joo-segment-selector [options]="sorts" [(value)]="sort" ariaLabel="Sort order" />
    <p>sort: {{ sort() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SegmentSelectorHost {
  readonly sorts = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
  ] as const;
  readonly sort = signal('relevance');
}

describe('SegmentSelectorComponent', () => {
  it('moves the pressed position to the clicked segment', async () => {
    const fixture = TestBed.createComponent(SegmentSelectorHost);
    await fixture.whenStable();

    await expect
      .element(page.getByRole('button', { name: 'Relevance' }))
      .toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(page.getByRole('button', { name: 'Recent' }));
    await fixture.whenStable();

    await expect.element(page.getByText('sort: recent')).toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Relevance' }))
      .toHaveAttribute('aria-pressed', 'false');
  });
});
```

- [ ] **Step 11: Run it and watch it fail**

Run: `pnpm run test:ci`
Expected: FAIL — `Cannot find module './segment-selector.component'`.

- [ ] **Step 12: Write `segment-selector`**

```ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface SegmentOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'joo-segment-selector',
  templateUrl: './segment-selector.component.html',
  styleUrl: './segment-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'ariaLabel() || null' },
})
export class SegmentSelectorComponent {
  readonly options = input.required<readonly SegmentOption[]>();
  readonly value = model('');
  readonly ariaLabel = input('');
}
```

`segment-selector.component.html`:

```html
@for (option of options(); track option.value) {
<button
  type="button"
  [attr.aria-pressed]="value() === option.value"
  (click)="value.set(option.value)"
>
  {{ option.label }}
</button>
}
```

CSS: `.segment` at `components.css:526-537` becomes `:host`; the `.segment button` rules at `:539-568` become bare `button` selectors — view encapsulation keeps them scoped.

- [ ] **Step 13: Run the test again**

Run: `pnpm run test:ci`
Expected: PASS.

- [ ] **Step 14: Add all four to `/specimen`**

```html
<joo-specimen-section label="Form controls">
  <joo-field-label for="spec-q">Query</joo-field-label>
  <joo-console-input inputId="spec-q" placeholder="Search the open web" style="flex-basis: 100%">
    <joo-hardware-key accent="hot" size="sm">Go</joo-hardware-key>
  </joo-console-input>
  <joo-console-input size="compact" placeholder="Compact" style="flex-basis: 100%" />
  <joo-console-input size="lg" placeholder="Large" style="flex-basis: 100%" />

  <joo-stompbox-toggle style="flex-basis: 100%">Has feed</joo-stompbox-toggle>
  <joo-stompbox-toggle color="magenta" [on]="true" style="flex-basis: 100%">
    Trusted only
  </joo-stompbox-toggle>

  <joo-segment-selector [options]="sortOptions" value="relevance" ariaLabel="Sort order" />
</joo-specimen-section>
```

Add to `SpecimenPage`:

```ts
protected readonly sortOptions: readonly SegmentOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'recent', label: 'Recent' },
  { value: 'alpha', label: 'A–Z' },
];
```

- [ ] **Step 15: Full run, verify and commit**

```bash
pnpm run test:ci
```

Expected: three new specs pass plus the existing `app.component.spec.ts`. On `/specimen` the console frame lights cyan on focus, the toggle's jewel lights and the word flips, the segment strip moves its raised position.

```bash
git add src/app/shared/design-system/form-controls src/app/specimen
git commit -m "Phase 2 task 8: field label, console input, stompbox toggle, segment selector"
```

---

## Task 9: Data-display atoms

Five display parts. No interaction, no tests.

**Files:**

- Create: `src/app/shared/design-system/data-display/capability-tag/`, `count-chip/`, `tag-set/`, `spec-list/`, `prose-content/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:1033-1047` (capability-tag), `:945-976` (count-chip), `:1049-1078` (spec-list), `:1523-1652` (prose-content)

**Interfaces:**

- Produces:
  - `joo-capability-tag` — content projected, no inputs.
  - `joo-count-chip` — `count: number | null` (default `null`), `interactive: boolean` (default `false`), content projected.
  - `joo-tag-set` — content projected.
  - `joo-spec-list` — `entries` as `input.required<readonly SpecEntry[]>()` where `SpecEntry = { readonly term: string; readonly value: string }`.
  - `joo-prose-content` — content projected.

- [ ] **Step 1: `capability-tag`**

This is the generic form of the mockup's `.sig` (decision 012: a part that looks generic is generic). It names a capability — "has RSS", "no tracking" — and the domain layer decides the text.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-capability-tag',
  template: '<ng-content />',
  styleUrl: './capability-tag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityTagComponent {}
```

CSS: port `.sig` from `components.css:1033-1047` onto `:host`. The mockup's `.sig--strong` variant is not ported — nothing in the design distinguishes it visually from the base once the theme tokens apply. If a second weight turns out to be needed, it arrives as an input then.

- [ ] **Step 2: `count-chip`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-count-chip',
  templateUrl: './count-chip.component.html',
  styleUrl: './count-chip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-interactive]': 'interactive()' },
})
export class CountChipComponent {
  readonly count = input<number | null>(null);
  readonly interactive = input(false);
}
```

`count-chip.component.html`:

```html
<ng-content />
@if (count() !== null) {
<span class="chip__count">{{ count() }}</span>
}
```

CSS: `.chip` at `components.css:945-963` becomes `:host`; `.chip__count` at `:965-971` stays a class; the hover rule at `:973-976` becomes `:host(.is-interactive):hover`. `interactive` only changes appearance — a chip that is actually clickable wraps a `hardware-key`; this input exists so a chip inside one picks up the affordance.

- [ ] **Step 3: `tag-set`**

The wrapping row that holds tags and chips. No mockup class — it is the `display: flex; flex-wrap: wrap; gap` that the mockup repeated inline at each use site. Extracting it is the point.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-tag-set',
  template: '<ng-content />',
  styleUrl: './tag-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagSetComponent {}
```

```css
:host {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}
```

- [ ] **Step 4: `spec-list`**

A term/value table. It takes data rather than projection because the two columns must align across rows, which projection cannot guarantee.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface SpecEntry {
  readonly term: string;
  readonly value: string;
}

@Component({
  selector: 'joo-spec-list',
  templateUrl: './spec-list.component.html',
  styleUrl: './spec-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecListComponent {
  readonly entries = input.required<readonly SpecEntry[]>();
}
```

`spec-list.component.html`:

```html
<dl>
  @for (entry of entries(); track entry.term) {
  <div class="spec__row">
    <dt>{{ entry.term }}</dt>
    <dd>{{ entry.value }}</dd>
  </div>
  }
</dl>
```

CSS: port `components.css:1049-1078`. `.spec` maps to `dl`, `.spec dt` and `.spec dd` to bare `dt`/`dd`. The `.spec__row` wrapper exists because `<dl>` grid children must pair; keep the grid on `dl` with `grid-template-columns: max-content minmax(0, 1fr)` and give `.spec__row` `display: contents` so the pairs land in the parent grid.

- [ ] **Step 5: `prose-content`**

Long-form body copy. The one place descendant selectors are correct: the component's contract is that it styles arbitrary projected HTML.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-prose-content',
  template: '<ng-content />',
  styleUrl: './prose-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProseContentComponent {}
```

CSS: port `components.css:1523-1652` with `.prose` becoming `:host` and every `.prose x` descendant rule becoming a bare `x` rule. **Emulated view encapsulation does not scope projected content to this component** — projected nodes keep the host component's scope attribute, so bare `h2` rules here will not match projected `<h2>` elements. Wrap the descendant rules in `:host ::ng-content`-free form by relying on the fact that they are written as `:host h2`, which does match projected children. Write them as `:host h2`, `:host p`, `:host ul`, and so on. This is the documented exception in the styles rules: not `::ng-deep`, just host-descendant selectors, which stay scoped to this host's subtree.

Watch the budget here — `anyComponentStyle` errors at 4 kB. If the ported prose CSS exceeds it, drop the rules for elements the site does not actually render (the mockup's `figure`, `kbd`, `table` blocks) rather than raising the budget.

- [ ] **Step 6: Add to `/specimen` and commit**

```html
<joo-specimen-section label="Data display">
  <joo-tag-set style="flex-basis: 100%">
    <joo-capability-tag>RSS</joo-capability-tag>
    <joo-capability-tag>No tracking</joo-capability-tag>
    <joo-count-chip [count]="128">Articles</joo-count-chip>
    <joo-count-chip [count]="9" [interactive]="true">Tools</joo-count-chip>
  </joo-tag-set>

  <joo-spec-list [entries]="specEntries" style="flex-basis: 100%" />

  <joo-prose-content style="flex-basis: 100%">
    <h2>Heading</h2>
    <p>Body copy with a <a href="#">link</a> and some <code>inline code</code>.</p>
    <ul>
      <li>List item</li>
    </ul>
  </joo-prose-content>
</joo-specimen-section>
```

```ts
protected readonly specEntries: readonly SpecEntry[] = [
  { term: 'Updated', value: 'Weekly' },
  { term: 'Feed', value: 'Atom' },
  { term: 'Licence', value: 'CC BY-SA' },
];
```

Verify the prose block renders its heading, paragraph, link and list with the theme's typography — if any is unstyled, the `:host x` selector form did not take and the CSS needs fixing before committing.

```bash
git add src/app/shared/design-system/data-display src/app/specimen
git commit -m "Phase 2 task 9: data display atoms"
```

---

## Task 10: Surfaces

**Files:**

- Create: `src/app/shared/design-system/surfaces/corner-brackets/`, `readout-panel/`, `paper-sheet/`
- Modify: `src/app/specimen/specimen.page.html`
- Source: `components.css:883-901` (corner-brackets), `:834-881` + `:922-943` (readout-panel), `:1496-1521` (paper-sheet)

**Interfaces:**

- Produces:
  - `jooCornerBrackets` — attribute directive, no inputs.
  - `joo-readout-panel` — `label: string`, `flush: boolean` (default `false`), content projected; `head` slot via `<ng-content select="[panelHead]" />`.
  - `joo-paper-sheet` — content projected.

- [ ] **Step 1: `corner-brackets` as a directive**

Brackets are a decoration applied _to_ a surface, not a box that wraps one. A directive keeps it from adding a DOM node, and a directive selector may be an attribute — the component-selector lint rule applies to components only.

Generate with `pnpm ng g d shared/design-system/surfaces/corner-brackets/corner-brackets`.

```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[jooCornerBrackets]',
  host: { class: 'joo-corner-brackets' },
})
export class CornerBracketsDirective {}
```

A directive has no stylesheet of its own. Its CSS goes in `src/styles.css` inside `@layer components`, keyed on the `.joo-corner-brackets` class, ported from `components.css:883-901` (the `::before`/`::after` corner rules). Note in a comment that this is global CSS because a directive cannot carry encapsulated styles — the one global component rule in the system.

- [ ] **Step 2: `readout-panel`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-readout-panel',
  templateUrl: './readout-panel.component.html',
  styleUrl: './readout-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-flush]': 'flush()' },
})
export class ReadoutPanelComponent {
  readonly label = input('');
  readonly flush = input(false);
}
```

`readout-panel.component.html`:

```html
@if (label()) {
<div class="panel__head">
  <span class="panel__label">{{ label() }}</span>
  <ng-content select="[panelHead]" />
</div>
}
<div class="panel__body">
  <ng-content />
</div>
```

CSS: `.panel` at `components.css:834-852` becomes `:host`; `.panel__head` and `.panel__body` rules at `:854-881` stay classes; the `.readout` rules at `:922-943` merge into `.panel__body` — the mockup kept them separate because it had two boxes, and on screen it is one framed readout. `:host(.is-flush) .panel__body { padding: 0; }` for the case where a table or grid fills the frame edge to edge.

- [ ] **Step 3: `paper-sheet`**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-paper-sheet',
  template: '<ng-content />',
  styleUrl: './paper-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperSheetComponent {}
```

CSS: port `.sheet` from `components.css:1496-1521` onto `:host`, including the paper texture background and the ruled edge.

- [ ] **Step 4: Add to `/specimen` and commit**

```html
<joo-specimen-section label="Surfaces">
  <joo-readout-panel label="Signal" style="flex-basis: 100%">
    <joo-hardware-key panelHead size="xs">Refresh</joo-hardware-key>
    <p>Panel body content.</p>
  </joo-readout-panel>

  <div jooCornerBrackets style="padding: var(--space-4); flex-basis: 100%">Bracketed region</div>

  <joo-paper-sheet style="flex-basis: 100%">
    <joo-prose-content>
      <p>Sheet content.</p>
    </joo-prose-content>
  </joo-paper-sheet>
</joo-specimen-section>
```

Verify the brackets draw at all four corners and the panel head strip aligns its label and trailing key on one row at 390px.

```bash
git add src/app/shared/design-system/surfaces src/styles.css src/styles src/app/specimen
git commit -m "Phase 2 task 10: corner brackets, readout panel, paper sheet"
```

---

## Task 11: Navigation

**Files:**

- Create: `src/app/shared/design-system/navigation/breadcrumb-trail/`, `indicator-nav-list/`, `pager/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:1079-1099` (breadcrumb), `:1101-1141` (nav list), `:1459-1488` (pager)

**Interfaces:**

- Produces:
  - `joo-breadcrumb-trail` — `crumbs` as `input.required<readonly Crumb[]>()` where `Crumb = { readonly label: string; readonly href?: string }`.
  - `joo-indicator-nav-list` — `items` as `input.required<readonly NavItem[]>()` where `NavItem = { readonly label: string; readonly href: string; readonly active?: boolean; readonly lightColor?: StatusLightColor }`.
  - `joo-pager` — `page: number` (required), `pageCount: number` (required), `pageChange` output of type `number`.

These take data rather than projection: all three are lists whose items must be uniform, and the design has no per-item variation beyond what the item types above carry.

- [ ] **Step 1: `breadcrumb-trail`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Crumb {
  readonly label: string;
  readonly href?: string;
}

@Component({
  selector: 'joo-breadcrumb-trail',
  templateUrl: './breadcrumb-trail.component.html',
  styleUrl: './breadcrumb-trail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Breadcrumb' },
})
export class BreadcrumbTrailComponent {
  readonly crumbs = input.required<readonly Crumb[]>();
}
```

`breadcrumb-trail.component.html`:

```html
<ol>
  @for (crumb of crumbs(); track crumb.label; let last = $last) {
  <li>
    @if (crumb.href && !last) {
    <a [href]="crumb.href">{{ crumb.label }}</a>
    } @else {
    <span [attr.aria-current]="last ? 'page' : null">{{ crumb.label }}</span>
    } @if (!last) {
    <span class="breadcrumb__sep" aria-hidden="true">/</span>
    }
  </li>
  }
</ol>
```

The separator is a real element rather than the mockup's `::after { content: '/' }` so `aria-hidden` can hide it from the accessibility tree. CSS: port `components.css:1079-1099`, dropping the generated-content rule and giving `.breadcrumb__sep` its colour and spacing instead. Reset `ol` margin and padding and set `display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2)`.

- [ ] **Step 2: `indicator-nav-list`**

A vertical nav where each row carries a status light. It composes `status-light` and `hardware-key`, which is what makes it a navigation recipe rather than a layout.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../../actions/hardware-key/hardware-key.component';
import {
  StatusLightComponent,
  StatusLightColor,
} from '../../indicators/status-light/status-light.component';

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly lightColor?: StatusLightColor;
}

@Component({
  selector: 'joo-indicator-nav-list',
  imports: [HardwareKeyComponent, StatusLightComponent],
  templateUrl: './indicator-nav-list.component.html',
  styleUrl: './indicator-nav-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation' },
})
export class IndicatorNavListComponent {
  readonly items = input.required<readonly NavItem[]>();
}
```

`indicator-nav-list.component.html`:

```html
@for (item of items(); track item.href) {
<joo-hardware-key as="anchor" [href]="item.href" [current]="item.active ?? false" [block]="true">
  <joo-status-light [color]="item.lightColor ?? 'cyan'" [on]="item.active ?? false" />
  <span class="navlist__label">{{ item.label }}</span>
</joo-hardware-key>
}
```

This is the consumer side of the rule from Task 7: the light's `on` is bound to the same condition as the key's `current`, because the key cannot reach into the light.

CSS: port `components.css:1101-1141`. The `.navlist` container rules apply to `:host` (`display: flex; flex-direction: column; gap`). The per-item rules that the mockup put on `.navlist a` are already the key's; only `.navlist__label` (`flex: 1`, alignment) survives here.

- [ ] **Step 3: `pager`**

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HardwareKeyComponent } from '../../actions/hardware-key/hardware-key.component';

@Component({
  selector: 'joo-pager',
  imports: [HardwareKeyComponent],
  templateUrl: './pager.component.html',
  styleUrl: './pager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Pagination' },
})
export class PagerComponent {
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly hasPrevious = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.pageCount());

  protected go(delta: number): void {
    this.pageChange.emit(this.page() + delta);
  }
}
```

`pager.component.html`:

```html
<joo-hardware-key size="sm" [disabled]="!hasPrevious()" (press)="go(-1)">Previous</joo-hardware-key>
<span class="pager__position">{{ page() }} / {{ pageCount() }}</span>
<joo-hardware-key size="sm" [disabled]="!hasNext()" (press)="go(1)">Next</joo-hardware-key>
```

CSS: port `components.css:1459-1488`. `.pager` becomes `:host` (`display: flex; align-items: center; gap; justify-content: space-between`); `.pager__position` keeps the mono font and letter spacing. The mockup's per-page number keys are not ported — the design shows a position readout, not a numbered strip.

- [ ] **Step 4: Add to `/specimen` and commit**

```html
<joo-specimen-section label="Navigation">
  <joo-breadcrumb-trail [crumbs]="crumbs" style="flex-basis: 100%" />
  <joo-indicator-nav-list [items]="navItems" style="flex-basis: 100%" />
  <joo-pager [page]="2" [pageCount]="7" style="flex-basis: 100%" />
</joo-specimen-section>
```

```ts
protected readonly crumbs: readonly Crumb[] = [
  { label: 'Home', href: '#' },
  { label: 'Directory', href: '#' },
  { label: 'Zines' },
];

protected readonly navItems: readonly NavItem[] = [
  { label: 'Directory', href: '#', active: true },
  { label: 'Reference', href: '#', lightColor: 'amber' },
  { label: 'Tools', href: '#' },
];
```

Verify the active nav row's light is lit and the inactive rows' are dark, and that the pager's Previous key is enabled at page 2 and disabled at page 1.

```bash
git add src/app/shared/design-system/navigation src/app/specimen
git commit -m "Phase 2 task 11: breadcrumb trail, indicator nav list, pager"
```

---

## Task 12: Page layouts — the toolbar row

Only one layout primitive earns a component in Phase 2. The rest of the mockup's layout classes (`.split`, `.with-rack`, `.page`) are page-shell concerns and land in the page templates in Task 14, not here.

**Files:**

- Create: `src/app/shared/design-system/page-layouts/toolbar-row/`
- Modify: `src/app/specimen/specimen.page.html`
- Source: `components.css:1336-1346`

**Interfaces:**

- Produces: `joo-toolbar-row` — content projected; `trailing` slot via `<ng-content select="[toolbarTrailing]" />`.

- [ ] **Step 1: Write it**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-toolbar-row',
  templateUrl: './toolbar-row.component.html',
  styleUrl: './toolbar-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarRowComponent {}
```

`toolbar-row.component.html`:

```html
<div class="toolbar__lead"><ng-content /></div>
<div class="toolbar__trail"><ng-content select="[toolbarTrailing]" /></div>
```

CSS: port `components.css:1336-1346` onto `:host`. Add a container query rather than a media query — this is a component, and it must reflow when it is narrow regardless of viewport width (the rule from spec Part 5):

```css
:host {
  container-type: inline-size;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  /* remaining declarations from components.css:1336-1346 */
}

@container (max-width: 30rem) {
  .toolbar__lead,
  .toolbar__trail {
    flex-basis: 100%;
  }
}
```

A container query needs a containing element with `container-type`, and `:host` is that element here. The query then measures the toolbar, not the window.

- [ ] **Step 2: Add to `/specimen` and commit**

```html
<joo-specimen-section label="Page layouts">
  <joo-toolbar-row style="flex-basis: 100%">
    <joo-segment-selector [options]="sortOptions" value="relevance" ariaLabel="Sort order" />
    <joo-count-chip toolbarTrailing [count]="128">Results</joo-count-chip>
  </joo-toolbar-row>
</joo-specimen-section>
```

Verify the trailing chip drops to its own row when the browser is at 390px, and that it does so because of the container width — resize a wrapper, not just the window, if in doubt.

```bash
git add src/app/shared/design-system/page-layouts src/app/specimen
git commit -m "Phase 2 task 12: toolbar row"
```

---

## Task 13: Application chrome

Chrome is what renders once around every page. The test is literal: if a page can exist without it, it is not chrome. Three parts qualify — the horizon backdrop, the HUD header, the mobile dock — and they live in `src/app/app-shell/`, not in the design system, because they are this application's frame and nothing else composes them.

**Files:**

- Create: `src/app/app-shell/horizon-backdrop/`, `heads-up-display-header/`, `mobile-bottom-dock/`, `src/app/app-shell/page-title.strategy.ts`
- Modify: `src/app/app-shell/app-shell-layout/app-shell-layout.component.html` and `.css`, `src/app/app.config.ts`
- Source: `components.css:57-89` (horizon, currently on `body::before`/`::after`), `:690-774` (HUD), `:776-826` (dock)

**Interfaces:**

- Produces:
  - `joo-horizon-backdrop` — no inputs.
  - `joo-heads-up-display-header` — `navItems` as `input.required<readonly NavItem[]>()`.
  - `joo-mobile-bottom-dock` — `navItems` as `input.required<readonly NavItem[]>()`.
  - `PageTitleStrategy` — a `TitleStrategy` subclass provided in `app.config.ts`.

- [ ] **Step 1: `horizon-backdrop`**

The mockup paints the horizon on `body::before` and `body::after`. That cannot stay: the backdrop is a visual part of the shell and belongs in the shell's own tree where it can be reasoned about, and pseudo-elements on `body` are not something a component can own.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-horizon-backdrop',
  template: '',
  styleUrl: './horizon-backdrop.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class HorizonBackdropComponent {}
```

```css
:host {
  position: fixed;
  inset: 0;
  z-index: var(--z-backdrop);
  pointer-events: none;
  /* the gradient declarations from components.css:57-72 */
}

:host::after {
  content: '';
  position: absolute;
  inset: 0;
  /* the grid/scanline declarations from components.css:74-89 */
}
```

Two layers, so one pseudo-element survives — the gradient and the grid overlay are genuinely stacked, not two boxes. `--z-backdrop` is `-1`, so the fixed layer sits behind the page without needing a stacking hack. Delete the `body::before`/`body::after` rules if any were carried into `src/styles/base-element-styles.css` in Phase 1; check before assuming they were.

Delete the generated `.html` file.

- [ ] **Step 2: `heads-up-display-header`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LogotypeComponent } from '../../shared/design-system/typography/logotype/logotype.component';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { StatusLightComponent } from '../../shared/design-system/indicators/status-light/status-light.component';

@Component({
  selector: 'joo-heads-up-display-header',
  imports: [LogotypeComponent, HardwareKeyComponent, StatusLightComponent],
  templateUrl: './heads-up-display-header.component.html',
  styleUrl: './heads-up-display-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'banner' },
})
export class HeadsUpDisplayHeaderComponent {
  readonly navItems = input.required<readonly NavItem[]>();
}
```

`heads-up-display-header.component.html`:

```html
<a class="hud__brand" href="/">
  <joo-logotype size="sm">Joo<b>Koi</b></joo-logotype>
</a>
<nav class="hud__nav" aria-label="Primary">
  @for (item of navItems(); track item.href) {
  <joo-hardware-key as="anchor" size="sm" [href]="item.href" [current]="item.active ?? false">
    <joo-status-light color="cyan" [on]="item.active ?? false" />
    {{ item.label }}
  </joo-hardware-key>
  }
</nav>
```

CSS: port `components.css:690-774`. `:host` gets `position: sticky; top: 0; z-index: var(--z-hud)` plus the frame declarations. The mockup's `@media (max-width: 767px)` rule that hides the nav stays — this is chrome, so a media query is correct here; the container-query rule applies to design-system components, not to the shell.

- [ ] **Step 3: `mobile-bottom-dock`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';

@Component({
  selector: 'joo-mobile-bottom-dock',
  imports: [HardwareKeyComponent],
  templateUrl: './mobile-bottom-dock.component.html',
  styleUrl: './mobile-bottom-dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBottomDockComponent {
  readonly navItems = input.required<readonly NavItem[]>();
}
```

`mobile-bottom-dock.component.html`:

```html
<nav aria-label="Primary, mobile">
  @for (item of navItems(); track item.href) {
  <joo-hardware-key as="anchor" size="xs" [href]="item.href" [current]="item.active ?? false">
    {{ item.label }}
  </joo-hardware-key>
  }
</nav>
```

CSS: port `components.css:776-826`. `:host` gets `position: fixed; inset-inline: 0; bottom: 0; z-index: var(--z-dock)` and, critically, `padding-bottom: env(safe-area-inset-bottom, 0px)` so the dock clears the iOS home indicator. The mockup's `@media (min-width: 768px) { display: none }` stays — the dock is the small-screen half of the same navigation the HUD shows wide.

- [ ] **Step 4: Wire the three into `app-shell-layout`**

Read `app-shell-layout.component.html` before editing; Phase 1 left it a minimal `<router-outlet />` host. It becomes:

```html
<joo-horizon-backdrop />
<joo-heads-up-display-header [navItems]="navItems" />
<main id="main-content">
  <router-outlet />
</main>
<joo-mobile-bottom-dock [navItems]="navItems" />
```

and the component declares the nav data as a constant for now — Phase 2 builds the architecture, not the content, so this is a hard-coded list of the routes that exist plus placeholders:

```ts
protected readonly navItems: readonly NavItem[] = [
  { label: 'Home', href: '/', active: true },
];
```

Add a `// Phase 3 replaces this with the real route table.` comment above it so it is not mistaken for a finished nav.

The layout's own CSS gets the page grid ported from `components.css:91-103` (`.page`) plus `padding-bottom: calc(var(--dock-height) + var(--space-4))` under the dock's media query, so the dock never covers the last row of content. If `--dock-height` does not exist in the tokens, add it to `design-tokens.css` next to the other layout tokens rather than hard-coding a number.

- [ ] **Step 5: `page-title.strategy.ts`**

**Verify the API before writing this.** Run `pnpm ng version` to confirm the router major, then check the `TitleStrategy` signature in `node_modules/@angular/router/index.d.ts` — specifically whether `updateTitle` still takes `RouterStateSnapshot` and whether `buildTitle` is still the protected helper. Write to the signature you find, not to the one below, if they differ.

```ts
import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_NAME = 'JooKoi';

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  readonly #title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    this.#title.setTitle(routeTitle ? `${routeTitle} — ${SITE_NAME}` : SITE_NAME);
  }
}
```

Register it in `app.config.ts`:

```ts
{ provide: TitleStrategy, useClass: PageTitleStrategy },
```

and give the two existing routes titles in `app.routes.ts` (`title: 'Home'`, `title: 'Not found'`). The `/specimen` route gets `title: 'Specimen'` too.

- [ ] **Step 6: Verify and commit**

Build, then check the prerendered output actually carries the titles — this is the part that silently fails:

```bash
grep -o '<title>[^<]*</title>' dist/jookoi-frontpage/browser/index.html
```

Expected: `<title>Home — JooKoi</title>`. If it shows the raw app title, the strategy is not running during prerender and needs fixing before the commit.

Then check `/` at 390px and 1440px: the HUD sticks to the top on scroll, the dock is visible only at 390px, the horizon renders behind everything, and no content hides under the dock at the bottom of the page.

```bash
git add src/app/app-shell src/app/app.config.ts src/app/app.routes.ts src/styles.css src/styles
git commit -m "Phase 2 task 13: application chrome and page title strategy"
```

---

## Task 14: Page templates

The ninth design-system sub-group (decision 013). A page template is the outermost grid a page _is_ — derived by grouping the design's pages by layout, not by URL or feature. Four templates cover the sitemap.

**Files:**

- Create: `src/app/shared/design-system/page-templates/console-landing-template/`, `directory-browse-template/`, `record-detail-template/`, `document-template/`
- Modify: `src/app/specimen/specimen.routes.ts`, and add four specimen sub-routes
- Source: `components.css:1396-1431` (`.launcher`, the landing stack), `:1433-1457` (`.split`), `:1312-1334` (`.with-rack`)

**Interfaces:**

- Produces, each with named projection slots and no data inputs:
  - `joo-console-landing-template` — slots `[templateHero]`, `[templateConsole]`, `[templateKeys]`.
  - `joo-directory-browse-template` — slots `[templateToolbar]`, `[templateRack]`, default slot for results.
  - `joo-record-detail-template` — slots `[templateCrumbs]`, `[templateHead]`, `[templateAside]`, default slot for body.
  - `joo-document-template` — slots `[templateCrumbs]`, default slot for prose.

Projection, not inputs: what varies between two pages using the same template is arbitrary content, and a content input would force every page through the same data shape.

- [ ] **Step 1: `console-landing-template`**

The front page: a centred stack of wordmark, search console and key grid, vertically centred in the viewport with the dock and HUD accounted for.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-console-landing-template',
  templateUrl: './console-landing-template.component.html',
  styleUrl: './console-landing-template.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsoleLandingTemplateComponent {}
```

```html
<div class="landing__hero"><ng-content select="[templateHero]" /></div>
<div class="landing__console"><ng-content select="[templateConsole]" /></div>
<div class="landing__keys"><ng-content select="[templateKeys]" /></div>
```

```css
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  justify-items: center;
  align-content: center;
  min-height: 100%;
  padding-block: var(--space-8);
}

.landing__console,
.landing__keys {
  inline-size: min(100%, 44rem);
}
```

- [ ] **Step 2: `directory-browse-template`**

Toolbar across the top, a filter rack beside the results, results filling the rest. The rack drops above the results when narrow.

```html
<div class="browse__toolbar"><ng-content select="[templateToolbar]" /></div>
<aside class="browse__rack"><ng-content select="[templateRack]" /></aside>
<div class="browse__results"><ng-content /></div>
```

```css
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'toolbar' 'rack' 'results';
  gap: var(--space-5);
}

.browse__toolbar {
  grid-area: toolbar;
}
.browse__rack {
  grid-area: rack;
}
.browse__results {
  grid-area: results;
}

@media (min-width: 60rem) {
  :host {
    grid-template-columns: 18rem minmax(0, 1fr);
    grid-template-areas:
      'toolbar toolbar'
      'rack    results';
    align-items: start;
  }

  .browse__rack {
    position: sticky;
    top: calc(var(--hud-height) + var(--space-4));
  }
}
```

A media query, not a container query: a page template _is_ the page, so the viewport is the right thing to measure. Port the rack's frame treatment from `components.css:1312-1334`. If `--hud-height` does not exist, add it to the tokens alongside `--dock-height` from Task 13.

- [ ] **Step 3: `record-detail-template`**

```html
<div class="detail__crumbs"><ng-content select="[templateCrumbs]" /></div>
<header class="detail__head"><ng-content select="[templateHead]" /></header>
<div class="detail__body"><ng-content /></div>
<aside class="detail__aside"><ng-content select="[templateAside]" /></aside>
```

```css
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'crumbs' 'head' 'body' 'aside';
  gap: var(--space-5);
}

.detail__crumbs {
  grid-area: crumbs;
}
.detail__head {
  grid-area: head;
}
.detail__body {
  grid-area: body;
}
.detail__aside {
  grid-area: aside;
}

@media (min-width: 60rem) {
  :host {
    grid-template-columns: minmax(0, 1fr) 20rem;
    grid-template-areas:
      'crumbs crumbs'
      'head   head'
      'body   aside';
    align-items: start;
  }
}
```

This is the `.split` layout from `components.css:1433-1457`, generalised to a grid with named areas so the narrow order is explicit rather than a consequence of source order.

- [ ] **Step 4: `document-template`**

```html
<div class="document__crumbs"><ng-content select="[templateCrumbs]" /></div>
<div class="document__body"><ng-content /></div>
```

```css
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  justify-items: center;
}

.document__body {
  inline-size: min(100%, 68ch);
}
```

`68ch` rather than a pixel width — the measure should follow the font, and this template exists to hold `prose-content`.

- [ ] **Step 5: Add four specimen sub-routes**

Templates cannot be demonstrated inside the specimen page's flex row; each needs the full page area. Add them as child routes in `specimen.routes.ts`:

```ts
export const specimenRoutes: Routes = [
  { path: '', component: SpecimenPage, title: 'Specimen' },
  {
    path: 'templates/console-landing',
    loadComponent: () =>
      import('./template-demos/console-landing-demo.page').then((m) => m.ConsoleLandingDemoPage),
    title: 'Console landing template',
  },
  {
    path: 'templates/directory-browse',
    loadComponent: () =>
      import('./template-demos/directory-browse-demo.page').then((m) => m.DirectoryBrowseDemoPage),
    title: 'Directory browse template',
  },
  {
    path: 'templates/record-detail',
    loadComponent: () =>
      import('./template-demos/record-detail-demo.page').then((m) => m.RecordDetailDemoPage),
    title: 'Record detail template',
  },
  {
    path: 'templates/document',
    loadComponent: () =>
      import('./template-demos/document-demo.page').then((m) => m.DocumentDemoPage),
    title: 'Document template',
  },
];
```

Each demo page follows this shape — `directory-browse-demo.page.ts` shown in full, the other three differing only in which template they fill and with what:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DirectoryBrowseTemplateComponent } from '../../shared/design-system/page-templates/directory-browse-template/directory-browse-template.component';
import { ToolbarRowComponent } from '../../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import {
  SegmentSelectorComponent,
  SegmentOption,
} from '../../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { StompboxToggleComponent } from '../../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { CountChipComponent } from '../../shared/design-system/data-display/count-chip/count-chip.component';

@Component({
  selector: 'joo-directory-browse-demo-page',
  imports: [
    DirectoryBrowseTemplateComponent,
    ToolbarRowComponent,
    ReadoutPanelComponent,
    SegmentSelectorComponent,
    StompboxToggleComponent,
    CountChipComponent,
  ],
  templateUrl: './directory-browse-demo.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryBrowseDemoPage {
  protected readonly sortOptions: readonly SegmentOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
  ];
}
```

```html
<joo-directory-browse-template>
  <joo-toolbar-row templateToolbar>
    <joo-segment-selector [options]="sortOptions" value="relevance" ariaLabel="Sort order" />
    <joo-count-chip toolbarTrailing [count]="128">Results</joo-count-chip>
  </joo-toolbar-row>

  <joo-readout-panel templateRack label="Filters">
    <joo-stompbox-toggle>Has feed</joo-stompbox-toggle>
    <joo-stompbox-toggle>No tracking</joo-stompbox-toggle>
  </joo-readout-panel>

  <joo-readout-panel label="Results">
    <p>Result rows land here in Phase 3.</p>
  </joo-readout-panel>
</joo-directory-browse-template>
```

The other three: `console-landing-demo` fills `[templateHero]` with a `logotype`, `[templateConsole]` with a `console-input` holding a hot `hardware-key`, and `[templateKeys]` with a `keycap-grid` of three `keycap`s. `record-detail-demo` fills `[templateCrumbs]` with a `breadcrumb-trail`, `[templateHead]` with an `eyebrow-label` plus `tag-set`, `[templateAside]` with a `spec-list` in a `readout-panel`, and the default slot with a `prose-content` block. `document-demo` fills `[templateCrumbs]` with a `breadcrumb-trail` and the default slot with a `paper-sheet` wrapping `prose-content`.

Each demo page is a small standalone component that fills the template's slots with the primitives already built — real keys, a real console input, real panels — so the template is exercised with the components it will actually hold, not with grey boxes. Link the four from the specimen index page.

- [ ] **Step 6: Verify and commit**

Check all four demo routes at 390px and 1440px. The browse rack must sit beside the results at 1440px and above them at 390px; the detail aside likewise; the document body must not exceed its measure on a wide screen. Confirm no horizontal scrollbar appears at 390px on any of them — that is the usual symptom of a missing `minmax(0, 1fr)`.

```bash
git add src/app/shared/design-system/page-templates src/app/specimen
git commit -m "Phase 2 task 14: page templates"
```

---

## The three-step adoption test (Tasks 15–17)

Decision 011 governs the next three tasks. Before skinning any PrimeNG component, apply this test in order and **record the answer in the component's file-header comment**:

1. Can CSS and theme tokens alone reach the design? → adopt as-is.
2. If not, does PrimeNG expose a template slot (`<ng-template>` / `pt`) for the part that falls short, so we own that subtree's DOM? → adopt, using the slot.
3. Neither — the design needs DOM that is neither present nor templatable → build our own instead, and say so in the ADR record.

Two failure modes to avoid. Looking bespoke is not an argument for building: a control can look like nothing PrimeNG ships and still be a listbox underneath. And adopting is not free: skinning someone else's `<span>` can cost more than writing one.

Every PrimeNG-based component is wrapped in our own component with our own selector. Consumers never import a PrimeNG symbol directly — that is what makes a later swap a one-file change.

---

## Task 15: `chrome-select` on PrimeNG Select

The first skin. Its real job is to prove the preset from Task 3 works: if the token mapping is wrong, it shows here, on the simplest possible component, rather than three tasks later inside a table.

**Files:**

- Create: `src/app/shared/design-system/form-controls/chrome-select/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:661-677` (`.select`)

**Interfaces:**

- Produces: `joo-chrome-select` — `options` as `input.required<readonly SelectOption[]>()` where `SelectOption = { readonly value: string; readonly label: string }`, `value` as `model<string | null>(null)`, `placeholder: string`, `ariaLabel: string`, `inputId: string`.

- [ ] **Step 1: Write it**

```ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Select } from 'primeng/select';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'joo-chrome-select',
  imports: [Select],
  templateUrl: './chrome-select.component.html',
  styleUrl: './chrome-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChromeSelectComponent {
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = model<string | null>(null);
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly inputId = input('');
}
```

`chrome-select.component.html`:

```html
<p-select
  [options]="options()"
  [ngModel]="value()"
  (ngModelChange)="value.set($event)"
  optionLabel="label"
  optionValue="value"
  [placeholder]="placeholder()"
  [ariaLabel]="ariaLabel()"
  [inputId]="inputId()"
  appendTo="body"
/>
```

If `Select` requires `FormsModule` for `ngModel`, add it to `imports` — check the component's own docs before assuming; PrimeNG v22 components may expose a non-forms value binding. Prefer the non-forms binding if one exists, since it avoids pulling `FormsModule` into a design-system component.

`appendTo="body"` puts the panel in the overlay layer where the `zIndex` tiers from Task 3 apply. Without it the panel is clipped by any ancestor with `overflow: hidden` — which the readout panel has.

- [ ] **Step 2: Check what the preset already achieves before writing any CSS**

Add it to `/specimen`, build, and look at it. Open the panel and check against the mockup's `.select`: border, background, mono font, the chevron, the hover and selected states of the options.

Write down which of those the preset already got right. **Only style what is still wrong**, and prefer fixing the preset in `theme/jookoi-preset.ts` over adding CSS here — a preset fix corrects every PrimeNG component at once, a local override corrects one.

- [ ] **Step 3: Style only the remainder**

Any remaining gap is closed in `chrome-select.component.css` using PrimeNG's own `--png-*` variables scoped to the host, never by reaching into PrimeNG's class names:

```css
:host {
  --png-select-background: var(--surface-chrome);
  --png-select-border-color: var(--border-strong);
  --png-select-color: var(--text-primary);
  /* only the variables the preset could not set globally */
}
```

Overriding a `--png-*` custom property on the host is supported and stays inside the component's scope. Overriding `.p-select .p-select-label` is not — it needs `::ng-deep`, which the guidelines forbid, and it breaks on the next PrimeNG minor. If a gap cannot be closed with a variable, that is the step-2 signal from the adoption test: use the `pt` pass-through or a template slot instead, and if neither works, record that this component should have been built from scratch.

- [ ] **Step 4: Verify the overlay layering and commit**

Put a `chrome-select` inside a `readout-panel` on the specimen page, open the panel, and confirm it escapes the panel's frame and draws above the HUD. Check keyboard operation: arrow keys move the highlight, Enter selects, Escape closes, focus returns to the trigger.

```bash
git add src/app/shared/design-system/form-controls src/app/shared/design-system/theme src/app/specimen
git commit -m "Phase 2 task 15: chrome select on PrimeNG Select"
```

---

## Task 16: `filter-drawer` on PrimeNG Drawer

The overlay class is exactly what decision 011 adopted PrimeNG for: focus trapping, scroll locking, `inert` on the background, restore-focus on close. None of that is worth writing by hand.

**Files:**

- Create: `src/app/shared/design-system/surfaces/filter-drawer/`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:1351-1393` (`.drawer`)

**Interfaces:**

- Produces: `joo-filter-drawer` — `open` as `model<boolean>(false)`, `heading: string`, content projected.

- [ ] **Step 1: Write it**

```ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'joo-filter-drawer',
  imports: [Drawer],
  templateUrl: './filter-drawer.component.html',
  styleUrl: './filter-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDrawerComponent {
  readonly open = model(false);
  readonly heading = input('Filters');
}
```

`filter-drawer.component.html`:

```html
<p-drawer
  [visible]="open()"
  (visibleChange)="open.set($event)"
  position="right"
  [header]="heading()"
  styleClass="joo-filter-drawer"
>
  <ng-content />
</p-drawer>
```

- [ ] **Step 2: Apply the adoption test to the header**

Look at the rendered header against `components.css:1351-1372`. If the mockup's header — eyebrow label, stripe rule, close key — cannot be reached by styling PrimeNG's default header, that is step 2 of the test: use the `<ng-template pTemplate="header">` slot and put our own DOM in it, including a `hardware-key` as the close control. Prefer the slot over fighting the default; owning that subtree is exactly what the slot is for.

Check the current template-slot syntax in the PrimeNG docs before writing it — v22 may use the `#header` content-child form rather than `pTemplate`.

- [ ] **Step 3: Style the panel**

`styleClass` lands on PrimeNG's own root element, outside this component's encapsulation, so `.joo-filter-drawer` rules must go in `src/styles.css` under `@layer components`. Because PrimeNG emits into `@layer primeng`, which orders before `components`, our rules win without a single `!important` — that ordering is the whole reason Task 3 set up the layer.

Port the panel frame from `components.css:1374-1393`, and set `--png-mask-background` on the drawer so the scrim matches the theme's mask token.

- [ ] **Step 4: Verify the overlay behaviour and commit**

Open the drawer from a specimen key. Confirm: Tab cycles only inside the drawer, the page behind does not scroll, Escape closes it, and focus returns to the key that opened it. That list is the value being bought — if any of it fails, the wiring is wrong, not PrimeNG.

```bash
git add src/app/shared/design-system/surfaces src/styles.css src/styles src/app/specimen
git commit -m "Phase 2 task 16: filter drawer on PrimeNG Drawer"
```

---

## Task 17: `record-grid` on PrimeNG Table

The heaviest component and the one with the real bundle risk. It gets a test because it has behaviour worth asserting and because it is the component most likely to break silently later.

**Files:**

- Create: `src/app/shared/design-system/data-display/record-grid/`
- Test: `record-grid/record-grid.component.spec.ts`
- Modify: `src/app/specimen/specimen.page.html`, `specimen.page.ts`
- Source: `components.css:1149-1307` (`.data-table`)

**Interfaces:**

- Produces:
  - `joo-record-grid<T>` — `rows` as `input<readonly T[]>([])`, `columns` as `input<readonly GridColumn<T>[]>([])` where `GridColumn<T> = { readonly field: keyof T & string; readonly header: string; readonly width?: string }`, `rowHeight: number` (default `44`), `virtual: boolean` (default `false`), `emptyMessage: string` (default `'No records.'`), `ariaLabel: string` (default `''`); `rowActivate` output of type `T`. Neither array is `input.required`, and Step 3 carries the reason.

Generic over the row type: a grid that types its rows as `Record<string, unknown>` pushes a cast onto every consumer, and `keyof T & string` is what makes the column list check against the data at compile time.

- [ ] **Step 1: Write the failing test**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { GridColumn, RecordGridComponent } from './record-grid.component';

interface DemoRow {
  readonly name: string;
  readonly kind: string;
}

@Component({
  selector: 'joo-record-grid-host',
  imports: [RecordGridComponent],
  template: `
    <joo-record-grid
      [rows]="rows"
      [columns]="columns"
      ariaLabel="Records"
      (rowActivate)="activated = $event.name"
    />
    <p>activated: {{ activated }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RecordGridHost {
  readonly rows: readonly DemoRow[] = [
    { name: 'Alpha', kind: 'Zine' },
    { name: 'Beta', kind: 'Blog' },
  ];
  readonly columns: readonly GridColumn<DemoRow>[] = [
    { field: 'name', header: 'Name' },
    { field: 'kind', header: 'Kind' },
  ];
  activated = '';
}

describe('RecordGridComponent', () => {
  it('renders the given columns and rows and emits the activated row', async () => {
    const fixture = TestBed.createComponent(RecordGridHost);
    await fixture.whenStable();

    await expect.element(page.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    await expect.element(page.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();

    await userEvent.click(page.getByRole('row', { name: /beta/i }));
    await fixture.whenStable();

    await expect.element(page.getByText('activated: Beta')).toBeInTheDocument();
  });
});
```

The `getByRole('columnheader' | 'cell' | 'row')` queries are deliberate: they fail if PrimeNG's table stops emitting real table semantics, which is the regression worth catching.

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm run test:ci`
Expected: FAIL — `Cannot find module './record-grid.component'`.

- [ ] **Step 3: Write the component**

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface GridColumn<T> {
  readonly field: keyof T & string;
  readonly header: string;
  readonly width?: string;
}

@Component({
  selector: 'joo-record-grid',
  imports: [TableModule],
  templateUrl: './record-grid.component.html',
  styleUrl: './record-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordGridComponent<T> {
  /**
   * Neither array is `input.required`, and the reason is not style. The two
   * `computed`s below read them, and a `computed` that reads a required input
   * before it is set throws `NG0950`. Normal rendering is unaffected — inputs
   * are applied before the template renders — but Angular's SSR error-
   * **recovery** path calls `recreate()` without re-applying inputs, so on a
   * page containing this component any recoverable render error escalates into
   * an uncaught `NG0950` and the process exits 1. This repo prerenders, so that
   * is a crashed build rather than a failed page. An empty grid is a coherent
   * default anyway; the same reasoning is written out in `chrome-select` and
   * `pager`, which were bitten by it for real.
   *
   * The copies exist because `Table.value` and `Table.columns` are both typed
   * `any[] | undefined`, so a `readonly` array is rejected outright (TS4104).
   * Calling these inputs `readonly` is the right public contract — the
   * component never mutates either one — so the copy happens here rather than
   * by weakening the interface to a mutable array and pushing the problem onto
   * every caller. `computed` memoises, so the identity PrimeNG sees changes
   * only when the data does.
   */
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly GridColumn<T>[]>([]);
  readonly rowHeight = input(44);
  readonly virtual = input(false);
  readonly emptyMessage = input('No records.');
  readonly ariaLabel = input('');
  readonly rowActivate = output<T>();

  protected readonly tableValue = computed(() => [...this.rows()]);
  protected readonly tableColumns = computed(() => [...this.columns()]);
}
```

`record-grid.component.html`:

```html
<p-table
  [value]="tableValue()"
  [columns]="tableColumns()"
  [virtualScroll]="virtual()"
  [virtualScrollItemSize]="rowHeight()"
  [scrollable]="virtual()"
  [scrollHeight]="virtual() ? 'flex' : undefined"
  tableStyleClass="joo-record-grid"
  [pt]="{ table: { 'aria-label': ariaLabel() } }"
>
  <ng-template #header let-cols>
    <tr>
      @for (col of cols; track col.field) {
      <th [style.width]="col.width">{{ col.header }}</th>
      }
    </tr>
  </ng-template>

  <ng-template #body let-row let-cols="columns">
    <tr (click)="rowActivate.emit(row)">
      @for (col of cols; track col.field) {
      <td>{{ row[col.field] }}</td>
      }
    </tr>
  </ng-template>

  <ng-template #emptymessage let-cols>
    <tr>
      <td [attr.colspan]="cols.length">{{ emptyMessage() }}</td>
    </tr>
  </ng-template>
</p-table>
```

Every line above was checked against `primeng@22.1.5` in `node_modules`, because this is the part of the plan most likely to have drifted from the installed version. Read them as verified, not as guesses:

- **`tableStyleClass`, not `styleClass`.** `Table` in 22.1.5 declares no `styleClass` input at all — grep `styleClass` in `node_modules/primeng/types/primeng-table.d.ts` and the only hit is `tableStyleClass`. A bare `styleClass="joo-record-grid"` is not an error, it is a stray attribute on the host element that no selector matches, so the hook class silently styles nothing. `tableStyleClass` is the input, and it lands on PrimeNG's inner `<table>` (`[class]="cn(cx('table'), tableStyleClass())"`, `primeng-table.mjs:3587`).
- **The three slot names are right.** `contentChild('header')`, `contentChild('body')` and `contentChild('emptymessage')` are the queries, at `primeng-table.mjs:1654`, `:1656` and `:1671`. The `pTemplate="header"` form is not what this version reads, so there is nothing to fall back to.
- **The slot contexts are right, and they differ from each other.** `#header` gets `{ $implicit: scrollerOptions.columns }` (`:3593-3595`, and the non-virtual branch supplies `options: { columns }` at `:3580`), which is why `let-cols` is the column list. `#body` gets `{ $implicit: rowData, rowIndex, columns, editing, frozen }` (`:713-719`), which is why it is `let-row let-cols="columns"` and not the other way round. `#emptymessage` gets `bodyContext()`, i.e. `{ $implicit: columns, frozen }` (`:587-591`, rendered at `:1043`). All three render inside the right row group: the header template inside `<thead>`, the other two inside `<tbody>`, so the bare `<tr>` roots are correct.
- **`[pt]` is how the label reaches the table.** PrimeNG 22.1.5 declares no `ariaLabel` input on `Table` (unlike `Select`, which does — that is why `chrome-select` could just bind one). The inner `<table>` carries `role="table"` (`:3587`) and no accessible name, and it is outside this component's encapsulation, so a host attribute cannot reach it. `pt` is the library's own pass-through and `[pBind]="ptm('table')"` is what applies it to that element; `Bind`'s effect calls `renderer.setAttribute` for every key it is given (`primeng-bind.mjs`), so a plain `aria-label` key arrives as a real attribute. This is the one line in the step whose *runtime* effect could not be settled by reading `node_modules` — if the build rejects it, that is a reportable concern, not something to invent a workaround for, and either way the accessible name is confirmed in the running app before the task is called done.

Row activation is on `(click)` only here; keyboard row activation is a Phase 3 concern once there is a real destination to activate to. Note that in the file header so it is a recorded gap, not an oversight.

- [ ] **Step 4: Run the test again**

Run: `pnpm run test:ci`
Expected: PASS.

- [ ] **Step 5: Style it**

Same split as Task 16: `--png-*` variables on `:host` for anything PrimeNG parameterises, and `.joo-record-grid` rules in `src/styles.css` under `@layer components` for the frame. Port `components.css:1149-1307` — header strip, hover state, the mono numeric alignment. `min-width: 100%` on the table belongs in that layer too, as a `.joo-record-grid` rule; it was a `[tableStyle]` binding in an earlier draft of this step and there is no reason for it to be one. Two things an earlier draft of this step named are not in the port source and must not be invented to satisfy the list: the mockup's `.data-table` block has no zebra striping (hover only, at `:1182`) and no sticky header — the `position: sticky` the rendered `<thead>` carries is PrimeNG's own, emitted as an inline style. The mockup is the source of truth.

One rule in the port source has no counterpart here and is deliberately not carried over: `components.css:1186` splits a single declaration across `.num` and `td[data-col='ver']`, and only the second survives the derivation rule — a content class has no meaning in a `field`-driven wrapper, where the column is chosen by the caller. `.src-name` and `.src-domain` (`:1195-1210`) are content classes for the same reason, and are why the 767px block's last rule is absent.

Note where the hook class actually lands: `tableStyleClass` puts it on PrimeNG's inner `<table>`, not on the `<joo-record-grid>` host. So `.joo-record-grid thead th { … }` is a descendant selector from the table element itself, not from the host, and a rule meant to style the outer frame has to target `.joo-record-grid` directly.

Watch the `anyComponentStyle` budget: the table CSS is the largest port in the project and errors at 4 kB. If it exceeds, the frame rules belong in the global layer anyway (they target `.joo-record-grid`, not the host), which moves the weight out of the component budget.

- [ ] **Step 6: Bundle — for information, not action**

Bundle size is CI's to measure and report. Do not build here to get the number. PrimeNG's Table is the single biggest addition in Phase 2 and the reason the 320 kB warn line may be crossed. If it is crossed, do **not** raise the budget: the fix is `@defer` at the consuming site —

```html
@defer (on viewport) {
<joo-record-grid [rows]="rows" [columns]="columns" ariaLabel="Records" />
} @placeholder {
<joo-readout-panel label="Records">Loading records…</joo-readout-panel>
}
```

— and that is its own task, with its own build, not a step in this one. Two reasons not to fold it in: `@defer` changes when the grid mounts, which is a behaviour change this task's test does not cover, and measuring it needs the production build this plan does not run. Note the overage in the commit message and stop there.

- [ ] **Step 7: Verify and commit**

On `/specimen`, render the grid with a few rows and again with `virtual` on and 5,000 generated rows. Confirm the virtual case scrolls smoothly and that the DOM holds roughly a screenful of `<tr>` elements rather than 5,000 — check in the browser's element inspector, since that is the entire point of turning it on.

```bash
pnpm run test:ci
git add src/app/shared/design-system/data-display src/styles.css src/styles src/app/specimen
git commit -m "Phase 2 task 17: record grid on PrimeNG Table"
```

---

## Task 18: Boundary verification and paper trail

The last task proves the architecture's rules are actually enforced, then writes down what was built.

**Files:**

- Modify: `src/app/shared/design-system/CONTEXT.md`, `src/app/app-shell/CONTEXT.md`, `_architecture/ARCHITECTURE.md`, `_architecture/TODO.md`
- Create: `src/app/specimen/CONTEXT.md`

- [ ] **Step 1: Verify the lint boundary actually fires**

The generated `no-restricted-imports` block in `eslint.config.js` is keyed on folder names under `src/app/` — `**/app-shell`, `**/specimen`, `**/curated-websites`, and so on. It stops a shared component importing an app-specific one.

**Correction to the spec:** spec Part 5 says to prove the boundary by having a design-system component import `RouterLink`. That test would not fire — `@angular/router` matches none of the generated patterns, because the patterns come from folder names under `src/app/`, not from package names. The spec is wrong on this point; the check below replaces it.

Temporarily add to any design-system component:

```ts
import { HorizonBackdropComponent } from '../../../../app-shell/horizon-backdrop/horizon-backdrop.component';
```

Four `../`, not three: every design-system component sits at
`shared/design-system/<group>/<name>/`, so `app/` is four levels up. A
three-level path resolves to `shared/app-shell/…`, which does not exist — the
import fails to resolve and the lint rule is never reached.

Run eslint once, deliberately. `AGENTS.md` bans linting by hand, and this is the narrow exception it implies: the work here *is* the lint config, and a rule that has never been shown to fire is a comment. Point it at the violating file only — not a repo-wide run — and say in the report that this was the reason.
Expected: FAIL, naming the restricted import of `app-shell` from a shared file.

Remove the import and re-run; expected PASS. If the first run passes, the boundary is not enforced and `eslint.config.js` needs fixing before this task can complete — report it rather than working around it.

Record the spec correction in the plan's deviations section (below) and in `ARCHITECTURE.md`.

- [ ] **Step 2: Rewrite `shared/design-system/CONTEXT.md`**

The existing file carries the Phase 1 class map — `.led` becomes `status-light/`, `.key` becomes `hardware-key-button/`. Decision 012 superseded that map. Delete it; do not amend it.

The new file covers:

- The nine sub-groups and what belongs in each, one line apiece.
- The derivation rule: identity comes from visual role, the mockup CSS is a paint source only. Link decision 012 and `.agents/skills/visual-component-derivation/SKILL.md`.
- The PrimeNG boundary: which components wrap PrimeNG (`chrome-select`, `filter-drawer`, `record-grid`), that consumers never import a PrimeNG symbol directly, and the three-step adoption test. Link decision 011.
- The styling rules that bit during the build: style the host not a wrapper; `:host(.is-x)` for variants; `display: contents` where a box would break the parent grid; the two documented exceptions (`hardware-key`'s inner element, `breadcrumb-trail`'s `:host ol` / `:host li`); `--png-*` variables on the host are allowed, PrimeNG class selectors are not.
- The single global-CSS entry: `.joo-corner-brackets` and the `styleClass` targets, and why they cannot be encapsulated.

- [ ] **Step 3: Write `app-shell/CONTEXT.md` and `specimen/CONTEXT.md`**

`app-shell/CONTEXT.md`: the three chrome parts, the chrome test ("if a page can exist without it, it is not chrome"), the `--z-*` / `ELEVATION` pairing and the change-one-change-the-other rule, and the title strategy.

`specimen/CONTEXT.md`: what `/specimen` is for, that it is dev-only via `isDevMode()` and lazy `loadChildren` so it never prerenders, how to add a new component to it, and the check that `dist/` contains no `specimen/index.html`.

- [ ] **Step 4: Update `_architecture/ARCHITECTURE.md`**

Add the Phase 2 section: the design system's nine sub-groups, the PrimeNG adoption and its cascade-layer mechanism, the page-template group (decision 013), the elevation scheme, and the `/specimen` route. Update the folder map to match what was actually built. Record the spec correction from Step 1.

Do **not** record bundle numbers. An earlier draft of this step said "record the measured bundle numbers from Task 17", and Task 17 no longer measures any — its own bundle step was rewritten to state that size is CI's to measure and report. Writing a stale figure into `ARCHITECTURE.md` would be worse than writing none, because it would be read as measured.

Keep it to decisions and shape. No tutorials.

- [ ] **Step 5: Tick `_architecture/TODO.md`**

Mark the Phase 2 checklist items complete. Anything that came up during the build and was not done goes to `_architecture/BACKLOG.md`, not into a new task here — the no-scope-creep rule holds to the end.

- [ ] **Step 6: Final gate and commit**

```bash
pnpm run test:ci
```

That is the whole gate, and it runs once. Lint and format have run automatically on every save through the `Stop` hook, and the watch dev server has been typechecking continuously — re-running either by hand is the doubling `AGENTS.md` bans.

There is no production build and no `dist/` check here. An earlier draft of this step confirmed "`dist/jookoi-frontpage/browser/` has no `specimen/` directory", which cannot be done without a build; the `/specimen` route never prerenders for two structural reasons instead — it is lazily loaded and it is gated on `isDevMode()` — and Step 3's `specimen/CONTEXT.md` records the check for whoever next runs a build, which is CI.

Then commit, staging the paths by name rather than by directory:

```bash
git add src/app/shared/design-system/CONTEXT.md src/app/app-shell/CONTEXT.md src/app/specimen/CONTEXT.md
git add _architecture/ARCHITECTURE.md _architecture/TODO.md _architecture/BACKLOG.md
git status --short
git commit -m "Phase 2 task 18: lint boundary verification and paper trail"
```

Staging by name is what makes the `git status --short` between the adds and the commit worth reading — it is what confirms nothing else was swept in. Never `git add -A`, `git add .`, or `git add -u` here: this repo carries a gitignored licence token at `src/app/primeui-license.ts`, and a directory-wide add is one `-f` away from staging it.

---

## Deviations from the spec

Recorded here so the executor does not "fix" the plan back to the spec.

1. **The lint-boundary check changed.** Spec Part 5 proves the `no-restricted-imports` boundary with a `RouterLink` import. That import would not trip the rule: the generated patterns are folder names under `src/app/`, and `@angular/router` matches none of them. Task 18 uses an `app-shell` import instead, which does match.

2. **`.sig--strong` is not ported.** The spec's inventory lists it as a variant of the capability tag. Nothing distinguishes it visually once the theme tokens apply, so it is dropped until a real need appears (Task 9).

3. **The pager's numbered page keys are not ported.** The design shows a position readout between previous and next, not a numbered strip (Task 11).

4. **The horizon moves off `body`.** The mockup paints it with `body::before`/`::after`; it becomes a real component in the shell tree (Task 13).

5. **Generated content becomes real text in two places.** `.toggle__state::before { content: 'OFF' }` and the breadcrumb's `::after { content: '/' }` become elements — generated content is not reliably exposed to assistive technology and cannot be asserted in a test (Tasks 8, 11).
