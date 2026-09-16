# TODO

<!-- Live working set. `jookoi-paper-trail flush` archives it and resets it. See AGENTS.md. -->

## Context

**Phase 1 (foundation) and Phase 2 (design system) are done.** An Angular 22 workspace sits at the repo root — zoneless, strict, statically prerendered, with lint/format/test gates, decisions 003–015, `ARCHITECTURE.md` and `.agents/context/engineering-guidelines.md`. `shared/design-system/` holds nine component sub-groups plus `theme/`; `app-shell/` holds the three chrome parts; `/specimen` is the dev-only parts kit that renders all of it. The app itself is still a placeholder home page and a not-found page — no feature folder exists yet. Visual direction settled and mocked up in `features/design-theme/` (decision 001). Build is three phases (decision 002): 1 Angular project setup (done), 2 design system (done), 3 content and features. Next up is Phase 3, which needs its own planning session. The repo also serves as the user's personal modern-Angular reference and experimenting ground. A1, A2 and the ingestion spike stay open but gate nothing so far. The dev-stack layer itself (personal cross-project tooling) is built separately in `JooKoi-developer-stack` — don't re-derive it here.

## Checklist

- [ ] **Answer A1 in five sentences:** why this beats just asking a model. Real gate, per `plans/2026-08-22-dev-stack-plan.md` Part 2. Constraints in `.agents/context/principles.md`.
- [ ] **Confirm A2:** launcher-first vs directory-first. Recommendation is launcher; the skeleton assumes it.
- [x] Recover `discovery-phase-review.md` and file it — now `plans/2026-08-22-discovery-phase-review.md`.
- [ ] Decide what happens to `~/.agents/AGENTS.md` — an existing personal ruleset and the researched one both exist and only partly overlap.
- [ ] Place the three cross-project reference docs (blueprint, planning-before-implementation, staying-current) outside this repo.
- [ ] Write the `~/.agents-journal/` dated entry from `founding-context-dev-stack.md` Part A — the reasoning that doesn't compress into a rule.
- [ ] `scripts/probe-url.mjs` — HTTP status, redirects, RSS/OpenSearch autodiscovery, CSP headers, robots.txt. Deterministic, no model.
- [ ] Run it against 20 daily-use sites; note what it can't determine.
- [ ] Write `.agents/skills/source-ingest/SKILL.md` on top of it.
- [ ] Ingest 30–50 real sources, timed. That timing is the maintenance-economics number.
- [x] Review the retro theme proposal in `features/design-theme/`. Approved as v3, recorded as decision 001.
- [x] **Phase 1 planning session:** planned from `plans/2026-09-15-angular-project-setup-handoff.md`. Output: `plans/2026-09-15-angular-foundation-phase-1.md` (revision 3), decisions 003–010, implementation checklist.
- [x] **Phase 1 implementation** — all 13 steps, one commit each:
  - [x] 1–3 Workspace (`ng new`, merged into the repo root), `angular.json` schematic naming defaults, toolchain pinned (Node 24, pnpm, TypeScript `~6.0.3`, lockfile committed).
  - [x] 4–5 Extra strictness (`noUncheckedIndexedAccess`, `noImplicitOverride`, `strictTemplates`); static prerendering (`outputMode: static`), `app-shell/` with home and not-found pages.
  - [x] 6–7 Styles pipeline (cascade layers, base element styles, static `data-theme="retro"`); `angular-eslint` + Prettier + generated `no-restricted-imports` import-direction rules.
  - [x] 8–10 `@ngrx/signals@~22.0.1` installed (no store code yet); Vitest browser mode + the reference hybrid spec; build budgets from the measured baseline.
  - [x] 11–12 `scripts/serve-static-build.mjs` (Node built-ins only) + `.claude/launch.json` entries; `.mcp.json` with the Angular CLI MCP server and UI-verification notes in `AGENTS.md`.
  - [x] 13 Paper trail: decisions 003–010, `ARCHITECTURE.md`, area `CONTEXT.md` files, `.agents/context/engineering-guidelines.md`, `AGENTS.md` / `principles.md` / `TODO.md` / `BACKLOG.md` updates, plan deviations section.
- [x] **Phase 2 planning session:** planned from `plans/2026-09-15-angular-design-system-phase-2-handoff.md`. Output: `plans/2026-09-15-angular-design-system-phase-2.md`, decisions 011–013.
- [x] **Phase 2 implementation** — build order and detail in `plans/2026-09-15-angular-design-system-phase-2.md`. Gates are `AGENTS.md`'s Iteration loop table and nowhere else. All 18 tasks committed, one task per commit:
  - [x] 1 Install `@angular/aria`, `@angular/cdk`, `primeng@~22.1.1`. Confirm resolution against Angular 22.1 and that no licence warning fires.
  - [x] 2 `src/styles/design-tokens.css` under the `tokens` layer (port `features/design-theme/tokens.css`, two layers intact) + self-hosted woff2 under `public/fonts/` with `@font-face` in the `base` layer. Verify no 404 in the prerendered build.
  - [x] 3 PrimeNG preset + layer config (decision 011): `definePreset` onto our semantic tokens, `prefix: 'png'` (collides with our `--p-*` otherwise), `cssLayer` order `reset, tokens, base, primeng, components, utilities`, `zIndex` tiers mapped to our elevation tokens. Nothing consumes PrimeNG before this.
  - [x] 4 `/specimen` dev-only route, empty, excluded from the prerender route list.
  - [x] 5 Our own atomic primitives — plan Part 1. Each appears in `/specimen` in all states.
  - [x] 6 Our own composite patterns — plan Part 1.
  - [x] 7 `app-shell/` chrome: `horizon-backdrop` → `heads-up-display-header` → `mobile-bottom-dock` → wire into `app-shell-layout`. Plus `page-title.strategy.ts` (verify `TitleStrategy` API first).
  - [x] 8 Four page templates in the new `page-templates/` sub-group (decision 013).
  - [x] 9 Adopted PrimeNG components, each with a time-boxed skin check in `/specimen`; anything failing the adoption test moves to build-our-own and is logged in the plan's deviations. `record-grid` last — size is CI's to measure; the 320 kB warn is a logged budget decision (`BACKLOG.md`), not a build step here.
  - [x] 10 Hybrid interaction tests for the interactive parts only. No `*.harness.ts` was built — decision 008 makes a harness optional and none earned its place. Confirm the `no-restricted-imports` boundary fails a real component.
  - [x] 11 Paper trail: rewrite `shared/design-system/CONTEXT.md` (class map superseded by decision 012) and `app-shell/CONTEXT.md`; update `ARCHITECTURE.md` Phase 2 section and folder map.
