# TODO

<!-- Live working set. `jookoi-paper-trail flush` archives it and resets it. See AGENTS.md. -->

## Context

No application code yet. Visual direction settled and mocked up in `features/design-theme/` (decision 001). Build is resequenced into three phases (decision 002): 1 Angular project setup, 2 design system extracted from the mockups, 3 content and features. Next session plans Phase 1 from `plans/2026-09-15-angular-project-setup-handoff.md`. The repo also serves as the user's personal modern-Angular reference and experimenting ground. A1, A2 and the ingestion spike stay open but no longer gate Phase 1. The dev-stack layer itself (personal cross-project tooling) is built separately in `JooKoi-developer-stack` — don't re-derive it here.

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
- [ ] **Phase 1 planning session:** plan Angular project setup from `plans/2026-09-15-angular-project-setup-handoff.md`. Output: plan doc, ADRs from 003, first `ARCHITECTURE.md`, implementation checklist.
- [ ] Phase 1 implementation (checklist comes from the planning session).
- [ ] Phase 2: extract design system from `features/design-theme/` into the app.
