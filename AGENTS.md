# AGENTS.md — JooKoi: Front Page to the Open Web

Project-level. Inherits from `~/.agents/AGENTS.md` (personal, cross-project, cross-provider) — do not restate anything from there. This file is the source of truth for this repo and is mostly pointers.

## What this is

A curated launcher and directory for the open web, for personal and small-community use. Not a business, not a competitor to search. It sends people to original sources rather than reproducing them.

Also the user's personal reference and experimenting ground for a modern Angular application.

Stage: **Phase 1 complete — Angular foundation built.** An Angular 22 workspace sits at the repo root: zoneless, strict, statically prerendered, with lint/format/test/budget gates and written guidelines. No real pages or data yet — the app has a placeholder home page and a not-found page. Phase 2 is the design system, Phase 3 is content and features. Structure and rules: `_architecture/ARCHITECTURE.md` and decisions `003`–`010`. Phase order and reasoning: `_architecture/plans/decisions/002-*`. Visual direction is mocked up in `features/design-theme/`. Handoff brief: `_architecture/plans/2026-09-15-angular-project-setup-handoff.md`.

## Build philosophy (the gate — read before proposing work)

**What the gate applies to:** pages, features and content. It does **not** apply to the foundation phases. A build system, architecture, testing setup and design system are the minimum starting point, and they get set up deliberately and properly up front — the Phase 1 plan (`_architecture/plans/2026-09-15-angular-foundation-phase-1.md`) is the worked example. Once the foundation is in place, everything built on top of it obeys the gate.

- **Minimal viable feature first, always.** Don't build a page, feature or content pipeline in advance of needing it. Accumulate features incrementally; let the repo's shape emerge from what's been built, not from an upfront design. Framework choice (Angular) already answers most of "what does a good repo look like" — don't re-litigate structure the framework settled, and don't re-litigate what decisions `003`–`010` already settled either.
- **No scope creep during implementation.** If work branches into an additional feature or task, list it in `_architecture/BACKLOG.md` and report it back. Do not pursue it inline.
- **Not a business.** No startup/corporate framing. No formal model-comparison process. No production-readiness pipeline built around prototype pages and features — CI and hosting are designed (decision 009) and built when the app is close to done, not now. Try one approach; if it causes a real problem, that's its own task later.
- **No tests for the sake of tests.** Add a test only if it adds real value to the LLM-assisted iteration loop. Not for future-proofing, not as stability insurance on something small enough that an agent is unlikely to break it. This is a proof-of-concept prototype; over-engineering against risks that haven't materialised is itself the thing to avoid.

This constrains scope and ceremony. It does not relax the personal layer's engineering stances — strict typing, explicit errors, compiler-as-correctness-gate still apply.

## Where things are

| Need                                                         | File                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| Product constraints, the four-claims gate                    | `.agents/context/principles.md`                            |
| What the product is (raw + parked ideas)                     | `.agents/context/product-concept.md`                       |
| Why this project exists                                      | `_architecture/plans/2026-08-22-founding-context.md`       |
| Dev-stack layers, repo naming, build sequence                | `_architecture/plans/2026-08-22-dev-stack-plan.md`         |
| Critique of the concept, MVP call                            | `_architecture/plans/2026-08-22-discovery-phase-review.md` |
| Traps found the hard way                                     | `.agents/context/gotchas.md`                               |
| Live working set (current status, checklist)                 | `_architecture/TODO.md`                                    |
| Logged but not yet scoped work                               | `_architecture/BACKLOG.md`                                 |
| Flushed TODO history                                         | `_architecture/archive/`                                   |
| Completed work log                                           | `llm-progress-complete.jsonl`                              |
| Whole-system architecture                                    | `_architecture/ARCHITECTURE.md`                            |
| How to build in `src/` (conventions, stores, tests)          | `.agents/context/engineering-guidelines.md`                |
| Access, tooling and instruction friction hit during sessions | `_architecture/workflow-friction-log.md`                   |
| Per-feature scoped context                                   | `features/<name>/CONTEXT.md`, `src/app/<area>/CONTEXT.md`  |
| Decisions made, with reasoning                               | `_architecture/plans/decisions/`                           |
| Page types and routes                                        | `_architecture/sitemap.yaml`                               |
| Visual direction, CSS tokens and mockups                     | `features/design-theme/`                                   |

## Conventions

- Paper trail follows `jookoi-paper-trail`: `_architecture/TODO.md` (live working set), `BACKLOG.md`, `ARCHITECTURE.md`, `plans/` (design sessions), `plans/decisions/` (single calls with reasoning), `archive/` (flushed TODO history). Folder-local `CONTEXT.md` beside code it describes.
- Single-decision ADRs (a call made, with reasoning) go in `_architecture/plans/decisions/NNN-slug.md`, numbered, never reused. Multi-part planning-session docs go in `_architecture/plans/YYYY-MM-DD-topic.md` instead. Ship either in the same commit as the pattern it constrains.
- Skills live in `.agents/skills/<name>/SKILL.md` — provider-agnostic, plain markdown.
- Deterministic work goes in `scripts/`, not into a model's turn.
- `sources/` is human-authored data (editorial clock). `data/` is machine-observed data (fast clock).
- Log completed work to `llm-progress-complete.jsonl`; track outstanding work in `_architecture/TODO.md`.
- UI verification: check at 390px and 1440px in preview browser. Gate: `pnpm run build` and `pnpm run lint`. Tests only when explicitly asked.
