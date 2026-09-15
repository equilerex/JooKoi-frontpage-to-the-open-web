# TODO

<!-- Live working set. `jookoi-paper-trail flush` archives it and resets it. See AGENTS.md. -->

## Context

**Phase 1 is done.** An Angular 22 workspace sits at the repo root — zoneless, strict, statically prerendered, with lint/format/test/budget gates, decisions 003–010, `ARCHITECTURE.md` and `.agents/context/engineering-guidelines.md`. The app itself is still a placeholder home page and a not-found page. Visual direction settled and mocked up in `features/design-theme/` (decision 001). Build is three phases (decision 002): 1 Angular project setup (done), 2 design system extracted from the mockups, 3 content and features. Next up is Phase 2, which needs its own planning session. The repo also serves as the user's personal modern-Angular reference and experimenting ground. A1, A2 and the ingestion spike stay open but didn't gate Phase 1 and don't gate Phase 2. The dev-stack layer itself (personal cross-project tooling) is built separately in `JooKoi-developer-stack` — don't re-derive it here.

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
- [ ] **Phase 2 planning session:** extract the design system from `features/design-theme/` into `src/app/shared/design-system/`. Install `@angular/aria` + `@angular/cdk` (decision 006), add `src/styles/design-tokens.css` and `public/fonts/`, build the `app-shell/` chrome components. Rules already written in `src/app/shared/design-system/CONTEXT.md`.
