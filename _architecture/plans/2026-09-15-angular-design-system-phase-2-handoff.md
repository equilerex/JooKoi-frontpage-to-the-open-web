# angular-design-system-phase-2-handoff

Session: 2026-09-15. Status: consumed. The planning session ran and produced `2026-09-15-angular-design-system-phase-2.md` plus decisions 011–013. Open questions below are answered there; where the two disagree, the plan wins.

## Context

Phase 1 (project setup) is merged to `main`: an Angular 22 workspace, zoneless, strict, statically prerendered, with lint/format/test/budget gates. The app itself is still a placeholder — a home page and a not-found page, nothing real. The visual direction was settled in decision 001 and mocked up as plain HTML/CSS in `features/design-theme/`: `tokens.css`, `components.css`, `demo.js`, six static pages (`index.html`, `search.html`, `browse.html`, `source.html`, `learn-topic.html`, `specimen.html`).

Work is three phases (decision 002). This brief covers **Phase 2: design system** only — extracting the mockup into real, reusable Angular components and the `app-shell/` chrome that hosts every page. Phase 3 (content, features, real data) is a separate planning session; don't plan it beyond what Phase 2 must leave room for.

## What the planning session should produce

- A Phase 2 architecture plan in `_architecture/plans/YYYY-MM-DD-<topic>.md`.
- One ADR per hard-to-reverse call in `_architecture/plans/decisions/NNN-slug.md` (next free number is 011). Use the `jookoi-paper-trail` skill and its script for both.
- Updates to `_architecture/ARCHITECTURE.md`'s Phase 2 section once real decisions replace the target-state description there now.
- `CONTEXT.md` rewrites for `shared/design-system/` and `app-shell/` once real components land (both currently describe planned, not-yet-built content).
- A scoped implementation checklist in `_architecture/TODO.md`.

Follow the workflow in `.agents/planning-before-implementation.md` Part 7 and `superpowers:subagent-driven-development` for execution, matching how Phase 1 ran. Verify Angular Aria/CDK facts against current docs (the `ctx7` CLI, angular.dev) rather than training data — both are newer surfaces than most training data covers well.

## Read first

| File                                      | Why                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                               | Build philosophy, conventions, where things live                                                                                            |
| `_architecture/ARCHITECTURE.md`           | Folder map, naming, import boundaries, page-vs-component split — all already fixed, Phase 2 builds inside them                              |
| `_architecture/plans/decisions/001-*`     | Visual direction (the retro HUD look)                                                                                                       |
| `_architecture/plans/decisions/002-*`     | Phase order and why design system is its own phase                                                                                          |
| `_architecture/plans/decisions/005-*`     | Folder/naming rules and the agnostic-component boundary this phase must respect                                                             |
| `_architecture/plans/decisions/006-*`     | Angular Aria + CDK over Angular Material — confirmed choice, install happens in this phase                                                  |
| `_architecture/plans/decisions/007-*`     | Cascade layers, semantic tokens, encapsulation rules the new styles must follow                                                             |
| `_architecture/plans/decisions/008-*`     | Test rules (Vitest browser mode, hybrid interaction tests, harnesses only when needed)                                                      |
| `src/app/shared/design-system/CONTEXT.md` | The rule this phase builds to: agnostic-component boundary, sub-groups, mockup class map, harness rule                                      |
| `src/app/app-shell/CONTEXT.md`            | What's already built there (home/not-found pages, layout wrapper) vs. what Phase 2 adds (HUD header, mobile dock, backdrop, title strategy) |
| `features/design-theme/CONTEXT.md`        | How the mockup CSS system is built — token layers, surface families, mobile-breakpoint behaviour, gotchas                                   |

Skip the rest of `_architecture/plans/` unless a question needs it.

## Fixed constraints

- **Folder map and naming are already decided.** `_architecture/ARCHITECTURE.md`'s folder map names all eight `shared/design-system/` sub-groups (`typography/`, `indicators/`, `actions/`, `form-controls/`, `surfaces/`, `navigation/`, `data-display/`, `page-layouts/`) and the `app-shell/` chrome components (`heads-up-display-header/`, `mobile-bottom-dock/`, `horizon-backdrop/`, `page-title.strategy.ts`). Component names in that map are candidates from the mockup classes — this phase settles the final list, it doesn't re-derive the structure.
- **The agnostic-component rule is non-negotiable** (per `shared/design-system/CONTEXT.md`): a design-system component knows nothing about curated websites, routes or app state — no `Router`/`ActivatedRoute`/`RouterLink` imports, no injected stores, no domain models. It's enforced by a generated `no-restricted-imports` ESLint block (the one the Phase 1 final review had to fix — verify it still catches violations against real components, not just the probe file).
- **Angular Aria + CDK, never Angular Material** (decision 006). Aria directives are headless; CSS styles off the resulting ARIA attributes.
- **Styles.** Plain CSS custom properties, semantic tokens only, default `Emulated` encapsulation, no `::ng-deep`, no `ViewEncapsulation.None` without an ADR (decision 007). Cascade layers already declared in `src/styles/cascade-layers.css`; `design-tokens.css` under the `tokens` layer is new this phase.
- **Fonts.** Self-host Chakra Petch, Inter, JetBrains Mono as woff2 under `public/fonts/` — the mockups' Google Fonts links are a shortcut, not the answer for the app (principle: no unneeded third-party network requests).
- **Mobile is a first-class layout**, not a shrunk desktop, per the mockup's own rules (HUD compacts, nav moves to `.dock`, tables become stacked cards, filters collapse into `details.drawer`, decoration drops below 768px).
- **Accessibility relaxed by the user's call** (personal use): keyboard navigation must work, readout/sheet text keeps AA contrast, decoration is exempt. `prefers-reduced-motion` and `prefers-contrast: more` fallbacks carry over from the mockup CSS.
- **Harnesses are optional** (decision 008 / `shared/design-system/CONTEXT.md`): only for components complex enough that other tests would otherwise reach into internals (Aria-backed selects, listboxes, grids). A button or badge doesn't need one.
- **Git.** Never run `git commit` or `git push`. The user commits.

## Tension to resolve, not ignore

`AGENTS.md`'s build gate says minimal-viable-feature-first and no speculative work applies to pages, features and content — not to foundation phases, and the design system is named as one of the deliberate up-front builds alongside Phase 1. That said, it's still worth deciding scope inside Phase 2 itself: build every component the folder map names now, or build only what the first real Phase-3 page will actually consume and let the rest follow on the second consumer (the same "promote on the second consumer" rule `ARCHITECTURE.md` already applies to `shared/`). The folder map names candidates, not commitments — resolve this with a ruling, not a default.

## Open questions for the plan

Each needs a recommendation, and an ADR where it is hard to reverse.

- **Component scope for this phase.** All eight sub-groups and every named component, or a smaller set sized to what Phase 3's first pages need, with the rest logged in `BACKLOG.md`.
- **`@angular/aria` + `@angular/cdk` install and version.** Confirm current stable versions via `ctx7`/angular.dev rather than assuming Phase 1's Angular 22.1 baseline versions still apply unchanged.
- **Design token structure.** How `tokens.css`'s two-layer system (primitive `--p-*` values, semantic tokens under `[data-theme]`) maps into `src/styles/design-tokens.css` under the `tokens` cascade layer, and how the second theme (`sleek`, mentioned but not built) stays a pure token swap.
- **Font loading mechanism.** `@font-face` in CSS vs. Angular's font-inlining/`ngx-build` behaviour, and how `public/fonts/` gets referenced without a build-time 404 risk.
- **Component-to-mockup-class mapping.** `shared/design-system/CONTEXT.md` already has a full table (mockup class → component); confirm it's still accurate against `features/design-theme/components.css` before building, since that file is the actual current source of truth for the CSS.
- **`app-shell/` chrome build order.** Whether HUD header, mobile dock, and backdrop can be built independently or need a shared layout contract with `app-shell-layout/` first.
- **`page-title.strategy.ts`.** Confirm the `TitleStrategy` pattern (`"<page> · JooKoi"`) against current Angular Router docs before implementing.
- **Testing.** Which of the new components get hybrid interaction tests (decision 008) vs. none at all — "no tests for the sake of tests" still applies; a presentational badge likely needs none, an Aria-backed listbox likely does.
- **Demo/specimen page.** Whether `features/design-theme/specimen.html` (the parts kit) gets a live Angular equivalent for visually verifying components as they're built, or whether verification happens page-by-page once Phase 3 exists.

## Not in Phase 2

- Feature folders, real routes beyond the existing `/` and `**`, and any page beyond `home.page.*` / `not-found.page.*` (Phase 3).
- `shared/curated-websites/` — models, store, data service, filtering functions (Phase 3, needs real data).
- The data pipeline (`sources/` → `scripts/` → `src/generated/`) and the Stage 1 ingestion spike.
- CI/hosting (decision 009, deliberately deferred until the app is closer to done).

## Build order

Defined by the planning session.

## Implementation deviations
