# Stage 1 — Personal Harness Architecture: Context Bundling, Capability Lifecycle, Task Graphs

Companion to [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md) but different in kind: that doc checks vocabulary against industry terms. This one is build-oriented — four concrete architecture pieces for a personal **agent harness** (confirmed industry term: "Agent = Model + Harness," the tool-access/memory/state/feedback-loop layer around a model). This repo brands that harness "developer stack" — that's identity, not a competing term; use "harness" in technical writing. No pick here, just patterns to consider.

Surfaced from a ChatGPT conversation, reframed from Angular-specific advice to a project-agnostic personal harness. Three ideas the user flagged for follow-up, plus a fourth (async execution) from their own idea.

---

## 1. Deterministic context bundling before model calls

**The idea.** Instead of the agent burning early turns on exploratory discovery (read this file, grep that, list this dir), a script generates a compact fact-bundle up front — project facts, architecture map, relevant files, constraints, commands, task state — and the model reasons over that.

**Not just context engineering restated.** [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md) §3 already covers context engineering as a discipline. This is a specific *mechanism* for the front-loading half of it: a deterministic, scriptable step, not a prompting technique. Testable and versionable in a way "write a good system prompt" isn't — it's code with inputs/outputs, reviewable on its own.

**Prior art.** The user already has an informal version of this for their "review utils" and finds it works — that's the reference design, not a from-scratch build. (No details given here — don't invent them.)

**What the bundle would hold, for this repo:**
- Which stage-1 docs exist + one-line scope
- What's already in [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md) (avoid re-verifying promoted items)
- Claims already checked and discarded (see that doc's "Checked and discarded" notes)
- Open items from `BACKLOG.md` / decision records

**MCP vs. CLI script.** Per [`mcp-model-context-protocol.md`](./mcp-model-context-protocol.md): this is a CLI-script job, not an MCP server — deterministic, local, versioned with the repo.

### The concrete design: a "context compiler" / tool shelf

**Attribution correction.** This design was attributed to Martin Fowler's "Context Engineering for Coding Agents" (Birgitta Böckeler, 5 Feb 2026 — real article). Fetched directly: **attribution doesn't hold.** That article covers context *configuration features* (CLAUDE.md, Rules, Skills, Subagents, MCP, Hooks, Plugins) and "keep context small" generally — no collector/normalizer/renderer pipeline, no structured subagent contracts. Treat the design below as a proposal from conversation, not a sourced pattern.

**The pipeline:**

```
raw project data → collector → normalized result → renderer → task-specific bundle → agent/subagent
```

- **Collector** — reads a build log, runs `git diff`, queries a dependency graph.
- **Normalized result** — JSON/JSONL/SQLite, not prose.
- **Renderer** — turns that into concise Markdown/XML sized for the target agent.
- **Prompt** — task + interpretation rules, not a manual dump of logs/source.

**Proposed layout** (starting point, not a spec):

```
ai-kit/
├── contexts/<situation>/{context.yaml, collect.ts, render.md}
├── tools/{repo-map, test-summary, build-summary, git-context, dependency-graph}
└── prompts/*.md
```

**Worked example — build failure.** Instead of 5,000 lines of raw output:

```json
{
  "command": "npm run build", "exitCode": 1, "durationMs": 42100, "status": "failed",
  "errors": [{"file": "src/app/orders/orders.component.ts", "line": 42, "column": 9,
              "code": "TS2339", "message": "Property 'total' does not exist on type 'Order'"}],
  "warnings": 3,
  "affectedFiles": ["src/app/orders/orders.component.ts", "src/app/orders/order.service.ts"],
  "rawLogPath": ".ai/artifacts/build-2026-08-23.log"
}
```

Raw log stays on disk if a follow-up needs it. Applies to any noisy command: keep exit code, duration, errors, warnings, affected files, test counts, failed-test names, artifact path, short tail of raw output — not the full scrollback.

**Use structured reporters, not scraping.** `tsc --pretty false`, `jest --json`, `playwright test --reporter=json`, `eslint --format=json` — parse JSON where available, scrape text only when nothing else exists.

**Contexts are task-shaped, not universal.** `repo-orientation`, `implementation-context`, `build-failure`, `change-review`, `dependency-impact`, `test-failure`, `architecture-investigation` — each answers a different question, needs different inputs.

**Subagents get different contracts, not copies of one bundle.** A "repo scout" gets read-only search, no edits. An "implementation agent" gets target files, conventions, tests, acceptance criteria. A "review agent" gets the diff, spec, quality gates. Each returns a structured result — `{status, confidence, summary, evidence: [{file, line, reason}], recommendedNextAction, needsMoreContext}` — not a full transcript. This matches [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md) §5's already-documented "primary owns the task, specialists produce bounded findings" pattern, already in live use in this project's own fork-dispatch-and-merge workflow. It's a refinement (typed result shape, per-role permissions), not a new discovery.

**Manifest per context.** A `context.yaml` (name, version, description, inputs, output schema, limits like `maxSourceExcerptLines`/`maxErrors`, activation mode) makes token cost measurable — logs context name, inputs, output bytes, estimated tokens, model, task, result. Shows which context builders are actually worth keeping.

**Not Repomix.** [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md) already lists `yamadashy/repomix` — a broad repo-packager, pack-everything-into-one-file. This design is the opposite: narrow, task-specific bundles. Different job.

**Starter tool-shelf:** `repo-map`, `git-diff-context`, `build-summary`, `test-summary`, `changed-symbols`, `dependency-impact`, `source-excerpt`, `project-context`, `task-state`. Skills/prompts become thin adapters over these.

---

## 2. Capability lifecycle management

**The idea.** Treat skills/tools as managed packages, not files that just exist or don't:

```
discover → review → trust → install → scope → activate → update → disable/remove
```

Metadata per capability: owner/source, version, trust level, supported agents/runtimes, project-or-global scope, activation conditions, dependencies, removal path.

**Why it's a real gap.** [`skill-libraries-and-marketplaces.md`](./skill-libraries-and-marketplaces.md) covers what a skill *is*; [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md) has a growing candidate list. Neither covers what happens *after* a skill is picked — tracked as trusted, version bumps noticed, safe removal. This repo already lives the gap: `decisions/001-first-design-skill-picks.md` records three picks with no trust level, no version pin, no removal path. That's steps 1-2 (discover, informally review) done ad hoc — the rest isn't tracked.

**Ties to security research.** [`security-and-supply-chain.md`](./security-and-supply-chain.md) already covers why "trust" can't be assumed — the ClawHub/OpenClaw poisoning (real, 30+ malicious skills at peak) is exactly what a "review → trust" gate exists to catch.

**Minimal version to try first:** a single `skills/REGISTRY.md` (or small JSON/YAML) per installed capability — source URL, date added, trust note, version/commit pinned at install, scope (global vs. project). Not a package manager — just a trace of "discover → review → trust" so "update → disable/remove" has something to act on.

---

## 3. Task state as a dependency graph, not a flat list

**The idea and source.** [`gastownhall/beads`](https://github.com/gastownhall/beads) (26,529 stars, 1,785 forks, pushed within the last day — real, active) replaces flat task lists with a dependency graph: `task A blocks task B and task C`, agent works the next unblocked item instead of one giant linear plan. Maintainer: Steve Yegge, also behind "Gas Town" (his org `gastownhall`) — an orchestration experiment the user was correctly advised not to prioritize. Beads is a smaller, more useful idea than Gas Town's scope — separate, lighter-weight, not tied to that "don't start here" verdict.

**Beyond Topic #10's research.** [`memory-and-progress-ledgers.md`](./memory-and-progress-ledgers.md) evaluates four ledger options (Claude Code memory, dated journals, Obsidian, JSONL extraction) — all linear/append-only, a record of what happened. None model dependencies between *not-yet-done* work, which is Beads' whole point. A ledger answers "what happened and why," a task graph answers "what can I work on now." A real harness plausibly wants both.

**Worth borrowing without adopting Beads.** Minimal version at this repo's scale: a JSON or SQLite file with per-task status, dependencies, completion condition, files/decisions touched — small enough to hand-maintain. Same "durable external state beats trusting the model to remember" pattern already in [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md) §2 — the graph structure is what's new.

---

## 4. Asynchronous, non-blocking long-running commands

**The gap.** Confirmed via grep across `planning/*.md` — nothing covers this. Real, uncovered.

**The idea.** Running a test suite synchronously blocks the agent for the full duration, and most of the output is noise (only pass/fail + why matters). Proposal: launch detached, let the agent keep working or go idle, inject a concise result back on completion — event-driven, not polled, not blocked.

**Already happening in Claude Code.** Bash's `run_in_background` runs a command detached; on completion the harness delivers a `<task-notification>` on a later turn instead of blocking the tool call. `ScheduleWakeup` (check in later without polling) and `Monitor` (stream events from a background process) are the same family. Every fork in this whole project used exactly this pattern.

**Correction — not yet solved cross-vendor.** The user's own corporate-environment observation: an agent running tests via Copilot or Gemini just blocks and waits, even though Gemini CLI's interface does expose background-process management (see [`session-and-token-economics.md`](./session-and-token-economics.md)). The primitive exists but isn't used — likely an instruction/skill gap (never told to prefer async), not proof the capability is Claude-only. Copilot's async story specifically is untested.

**Design implication:** don't build this as "wrap Claude Code's `run_in_background`" — that's single-vendor, not portable. Needed instead: (1) confirm what each target agent (Claude Code, Copilot CLI, Gemini CLI) actually exposes; (2) where a primitive exists, write the instruction telling the agent to prefer it; (3) where none exists or is confirmed, build a fallback — a detached-process wrapper plus a hook/poll outside the agent's own tool schema. Goal: a harness-level capability, not a vendor dependency.

**Connects to:**
- Structured reporters (section 1) — the right shape for what gets injected on completion: a `test-summary` JSON object, not raw scrollback.
- Hooks (settled category per [`topic-index.md`](./topic-index.md)) — a plausible trigger point for generating that summary the moment a background process exits.

**Practical shape:** an async-run wrapper for long commands that (a) launches detached, (b) pipes through a structured summarizer where available, (c) writes the raw log to disk regardless, (d) delivers a short structured result when done. Buildable now — the user already has proof-of-concept exposure via this session's own tooling.

---

## How these four relate

Not independent: context bundle (#1) reads from the task graph (#3) for current state, and from the capability registry (#2) for what's active. None needs to exist first — each is useful alone — but build order, if all three happen: registry (cheapest) → task graph (next cheapest) → context bundling (pulls from both). Async execution (#4) is orthogonal — a delivery mechanism for #1's structured results, not a dependency of the other three.

## Open questions / weak sourcing

- User's "review utils" prior art — reference it directly when building #1, not this doc.
- Martin Fowler citation for #1's pipeline design doesn't hold up (see above) — the subagent-contract part stands on its own verified basis; the rest (directory shape, manifest format, build-summary example) is an unsourced proposal. Treat as "worth trying," not "how the field does it."
- Beads' star count (26,529) will drift — re-check before citing elsewhere.
- No existing tool found for #2 — it's a proposed pattern, not a survey. #1 and #3 point at real prior art; #2 is closer to original design.
- #4 has no tool survey — a gap-naming note, not a literature review.
</content>
