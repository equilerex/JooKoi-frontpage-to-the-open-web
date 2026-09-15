# AGENTS.md — JooKoi: Front Page to the Open Web

Project-level. Inherits from `~/.agents/AGENTS.md` (personal, cross-project, cross-provider) — do not restate anything from there. This file is the source of truth for this repo and is mostly pointers.

## What this is

A curated launcher and directory for the open web, for personal and small-community use. Not a business, not a competitor to search. It sends people to original sources rather than reproducing them.

Also the user's personal reference and experimenting ground for a modern Angular application.

Stage: **Phase 1 planning — Angular project setup.** No application code exists yet. Visual direction is mocked up in `features/design-theme/`. Phase order and reasoning: `_architecture/plans/decisions/002-*`. Handoff brief: `_architecture/plans/2026-09-15-angular-project-setup-handoff.md`.

## Build philosophy (the gate — read before proposing work)

- **Minimal viable feature first, always.** Don't build general architecture in advance of needing it. Accumulate features incrementally; let the repo's shape emerge from what's been built, not from an upfront design. Framework choice (Angular) already answers most of "what does a good repo look like" — don't re-litigate structure the framework settled.
- **No scope creep during implementation.** If work branches into an additional feature or task, list it in `_architecture/BACKLOG.md` and report it back. Do not pursue it inline.
- **Not a business.** No startup/corporate framing. No formal model-comparison process, no production-readiness pipeline during prototyping. Try one approach; if it causes a real problem, that's its own task later.
- **No tests for the sake of tests.** Add a test only if it adds real value to the LLM-assisted iteration loop. Not for future-proofing, not as stability insurance on something small enough that an agent is unlikely to break it. This is a proof-of-concept prototype; over-engineering against risks that haven't materialised is itself the thing to avoid.

This constrains scope and ceremony. It does not relax the personal layer's engineering stances — strict typing, explicit errors, compiler-as-correctness-gate still apply.

## Where things are

| Need                                          | File                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| Product constraints, the four-claims gate     | `.agents/context/principles.md`                                          |
| What the product is (raw + parked ideas)      | `.agents/context/product-concept.md`                                     |
| Why this project exists                       | `_architecture/plans/2026-08-22-founding-context.md`                     |
| Dev-stack layers, repo naming, build sequence | `_architecture/plans/2026-08-22-dev-stack-plan.md`                       |
| Critique of the concept, MVP call             | `_architecture/plans/2026-08-22-discovery-phase-review.md`               |
| Traps found the hard way                      | `.agents/context/gotchas.md`                                             |
| Live working set (current status, checklist)  | `_architecture/TODO.md`                                                  |
| Logged but not yet scoped work                | `_architecture/BACKLOG.md`                                               |
| Flushed TODO history                          | `_architecture/archive/`                                                 |
| Completed work log                            | `llm-progress-complete.jsonl`                                            |
| Whole-system architecture                     | `_architecture/ARCHITECTURE.md` — written at Stage 5, does not exist yet |
| Per-feature scoped context                    | `features/<name>/CONTEXT.md`                                             |
| Decisions made, with reasoning                | `_architecture/plans/decisions/`                                         |
| Page types and routes                         | `_architecture/sitemap.yaml`                                             |
| Visual direction, CSS tokens and mockups      | `features/design-theme/`                                                 |

## Conventions

- Paper trail follows `jookoi-paper-trail`: `_architecture/TODO.md` (live working set), `BACKLOG.md`, `ARCHITECTURE.md`, `plans/` (design sessions), `plans/decisions/` (single calls with reasoning), `archive/` (flushed TODO history). Folder-local `CONTEXT.md` beside code it describes.
- Single-decision ADRs (a call made, with reasoning) go in `_architecture/plans/decisions/NNN-slug.md`, numbered, never reused. Multi-part planning-session docs go in `_architecture/plans/YYYY-MM-DD-topic.md` instead. Ship either in the same commit as the pattern it constrains.
- Skills live in `.agents/skills/<name>/SKILL.md` — provider-agnostic, plain markdown.
- Deterministic work goes in `scripts/`, not into a model's turn.
- `sources/` is human-authored data (editorial clock). `data/` is machine-observed data (fast clock).
- Log completed work to `llm-progress-complete.jsonl`; track outstanding work in `_architecture/TODO.md`.
- UI verification: check at 390px and 1440px in preview browser. Gate: `pnpm run build` and `pnpm run lint`. Tests only when explicitly asked.
