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

## Iteration loop (read before running anything)

Verification is cheap; rebuilding is not. Never pay for a full production build to look at one change.

**One mechanism per trigger. If a trigger already has a mechanism, do not add a second one for the same trigger — that is the failure mode this table exists to stop.**

| Trigger                     | What runs                          | How                                                                                                                                  |
| --------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Every save                  | Typecheck + compile                | The watch dev server. Free and continuous; errors land in the terminal and the browser overlay. **This is the per-change gate.**      |
| End of a turn               | Lint + format, changed files only  | `scripts/lint-changed.mjs` via a `Stop` hook. Automatic. **Never run lint or prettier by hand, and never list either as a task step.** |
| Batch boundary              | Test suite                         | `pnpm run test:ci` once after a group of components. Not per component. Not per change.                                               |
| End of a UI project / investigating a paint glitch | Local UX smoke              | Agent runs `pnpm run ux:smoke` **once** against the already running dev server — not per change, not mid-feature. Same class as `test:ci`: deliberate batch gate. Add a `SCENARIOS` row when shipping a new page. Occasional lab: `pnpm run ux:lab` on static preview (:4321). Plans: `2026-09-18-local-ux-quality-and-motion-system.md`, `2026-09-18-app-quality-harness.md`. |
| Production builds           | Never, in the agent loop           | CI (GitHub Actions) owns them. See the bullet below.                                                       |
| Any time                    | Looking at the app                 | The running dev server, by whoever holds the browser tools — in a delegated run, the controller, never the subagent writing the code.  |

The bullets below are the reasons behind it.

- **Keep a dev server running in watch mode for the whole session.** `pnpm start` on a fixed port, left up. Angular rebuilds in a few seconds and the browser updates itself. Do not boot a fresh server per change, per fix round, or per subagent — a server already running is always cheaper than one you start.
- **Never start a second dev server.** If the one on the fixed port is down, or its file watchers look dead, report that and stop. Do not boot another on a different port, and do not route around a process you cannot kill — a second server hides the first problem and splits the evidence across two of them.
- **Tests are written in bulk and run at a boundary.** Write a component's spec when you write the component; run the suite after a batch of them. A test run per change, per fix, or per component is the overhead this rule removes.
- **UI smoke is a project-end / glitch-hunt gate, not a per-turn habit.** Run `pnpm run ux:smoke` when a UI slice is finished or when chasing a reported flicker — not after every edit. Prefer chrome-devtools on the live app during the work. Do not start a second server for smoke.
- **Debug in the running browser, not through builds.** For a CSS or template change, look at the live page and read the live DOM and computed styles. A `getComputedStyle` probe answers in seconds what a build answers in minutes. Prefer chrome-devtools MCP when connected.
- **Never run a production build in the agent loop.** Not per task, not at a phase boundary, not at the end of the plan. The dev build is the whole feedback loop: it typechecks, compiles and prerenders nothing, and it answers every question about whether the code is broken. A production build adds exactly two things on top — bundle and component-style **budgets**, and **prerendering** — and both of those are continuous-integration's job. A budget overage or a prerender crash is a finding for a branch, reported by CI, fixed deliberately. Reproducing CI's build by hand duplicates that job and competes with the dev server for `.angular/cache`. The one exception is work whose subject *is* the build — bundle analysis, budget tuning, prerender debugging. Then you are building on purpose; say so in the report.
- **The agent that writes a change does not verify it.** In a delegated run: the subagent writes code and reports what it changed and what it could not check; the controller looks at the app. This is not a courtesy, it is the fix for the actual failure — a subagent has no browser tools here (the browser lives in the main session), so if it is asked to be careful it will reach for the only feedback it has, and the only feedback it has is the build. Remove the reason to build and the build stops happening.
- **Report a blocker; do not route around it.** A wedged process, a dead watcher, a permission refusal, a missing tool — say so and stop. Every "clever" workaround in this repo's history (a second dev server, a bypassed licence generator, a hand-rolled verification harness) cost more than the blocker it dodged. A refusal that gets reported is a correct outcome, not a failure.
- **If you are building on purpose, do not stop the dev server to do it.** Measured 2026-09-15: `pnpm run build` with the server up exited 0, the server kept serving, and a mtime-only touch still triggered a watch rebuild. The two share `.angular/cache` — Angular exposes no way to separate them — so a build here is untidy rather than dangerous. If the cache ever does go stale, delete `.angular/cache` and restart.
- **`tsconfig.json` compiler options are read at server start.** Changing one needs a restart — a watch rebuild will not pick it up.
- **Experiment config is reverted inside the same task.** Confirm `git status` shows the file clean before committing.

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
| Motion recipes (durations, VT, pending-without-wipe)         | `src/app/shared/design-system/CONTEXT.md` (Motion recipes) |
| Local UX smoke (app-wide CLS / glitch / metrics)             | `pnpm run ux:smoke` → `scripts/ux-smoke.mjs` + `ux-smoke.budgets.json` |
| Lighthouse lab and per-commit baselines                      | `pnpm run ux:lab` (`-- --record`, `-- --compare`), static preview :4321; baselines in `_architecture/perf-baselines/`; CI runs `ux:lab:ci` (decision 033) |
| UX / motion / quality plans                                  | `_architecture/plans/2026-09-18-local-ux-quality-and-motion-system.md`, `2026-09-18-app-quality-harness.md` |
| Codebase knowledge graph, god nodes, relationships           | `graphify-out/` (`graph.html`, `graph.json`, `GRAPH_REPORT.md`) |

## Knowledge graph (graphify)

A prebuilt knowledge graph covering code AST symbols, design tokens, architectural decisions, and visual mockups sits in `graphify-out/`.

### When to use it (nudges for agents)

Do not start with broad `grep` across the codebase or read multiple large files sequentially. Query the graph first:

- **Component & architecture discovery**: find which page, layout, or service owns a feature without guessing folder structure (`graphify query "<feature_or_symbol>"`).
- **Blast radius & refactoring impact**: inspect every symbol that depends on or calls a target before editing it (`graphify affected "<symbol>"`).
- **Cross-boundary connections**: see how two distant components or concepts connect across communities (`graphify path "<SymbolA>" "<SymbolB>"`).
- **Focused concept explanation**: extract a compact subgraph around an abstraction rather than loading full files into context (`graphify explain "<concept>"`).
- **Architectural overview & central hubs**: inspect `graphify-out/GRAPH_REPORT.md` for god nodes, community clusters, and cross-domain bridges.

### Running commands

Use the pinned python interpreter or direct CLI:
- Run query: `& (Get-Content graphify-out\.graphify_python) -m graphify query "<symbol_or_question>"`
- Run path: `& (Get-Content graphify-out\.graphify_python) -m graphify path "<SymbolA>" "<SymbolB>"`
- Run affected: `& (Get-Content graphify-out\.graphify_python) -m graphify affected "<Symbol>"`
- Visual exploration: open `graphify-out/graph.html` directly in the browser (static, zero-server).

### Maintenance & hooks

- **Git post-commit hook**: `.git/hooks/post-commit` automatically rebuilds changed AST code nodes in the background after each commit.
- **Incremental update**: run `graphify update .` during active multi-file editing to update the graph without committing.

## Conventions

- Paper trail follows `jookoi-paper-trail`: `_architecture/TODO.md` (live working set), `BACKLOG.md`, `ARCHITECTURE.md`, `plans/` (design sessions), `plans/decisions/` (single calls with reasoning), `archive/` (flushed TODO history). Folder-local `CONTEXT.md` beside code it describes.
- **Harness scratch is not the record.** A subagent-driven-development ledger, or any other progress file a harness owns, is scratch for one run: dispatch order, commit SHAs, which tasks are done. Nothing durable stays in it. A decision with reasoning goes to `plans/decisions/`, parked work to `BACKLOG.md`, the live set to `TODO.md`, friction to `workflow-friction-log.md` — written at the moment it is decided, because a run's context is gone by the time it ends. Decision `016`.
- Single-decision ADRs (a call made, with reasoning) go in `_architecture/plans/decisions/NNN-slug.md`, numbered, never reused. Multi-part planning-session docs go in `_architecture/plans/YYYY-MM-DD-topic.md` instead. Ship either in the same commit as the pattern it constrains.
- Skills live in `.agents/skills/<name>/SKILL.md` — provider-agnostic, plain markdown.
- Deterministic work goes in `scripts/`, not into a model's turn.
- `sources/` is human-authored data (editorial clock). `data/` is machine-observed data (fast clock).
- Log completed work to `llm-progress-complete.jsonl`; track outstanding work in `_architecture/TODO.md`.
- Gates are defined once, in the **Iteration loop** table above. Do not restate them in a task brief, a dispatch, a plan or a checklist — a second copy is how this repo ended up running lint and tests per change. UI verification during work: 390px and 1440px in the running browser. `ux:smoke` only at project end or when hunting a glitch. No lint or format by hand (the hook owns those); no test run outside a batch boundary; no production build at all — CI runs it.
