# Stage 1: Subagents / Multi-Agent Delegation

A subagent is a helper agent the parent spins up for one bounded piece of work, in its own context. Whatever it reads or runs stays there — only its final report comes back. Useful if your coding sessions run long and context fills up. Skip if sessions stay short.

Stage 0 already drew the line: fresh-context subagents for *scope* (well-supported) vs. multi-agent voting for *confidence* (contested). This doc covers the subagent concept itself, then compares Claude Code, Copilot CLI, and Gemini CLI.

## What is a subagent?

A separate agent instance the parent invokes for one bounded task. Parent sends a task description → subagent runs its own tool loop (read files, run commands, search) → reports back a result (summary, findings, diff) → parent decides what to do with it.

The defining feature: **context isolation**.

### Why the pattern exists

Context windows are fixed-size. Long sessions fill them fast: reading a dozen files to find one function, a build log, a repo-wide grep. None of that raw material matters once you have the answer — but if it happened in the main conversation, it stays there forever, slowing and costing more on every later turn.

Subagents push that disposable work into a side context that gets thrown away. Only the conclusion comes back.

### What happens to a subagent's context

- Starts fresh — no parent history unless explicitly included in the brief.
- Everything it reads/runs stays in its own window.
- Only the final report returns. Parent's context grows by that report, not by the work behind it.

Bonus: fresh context means no anchoring bias. A subagent reviewing code for bugs isn't carrying the same assumptions that built the code.

### When delegation saves tokens

Win condition: raw output volume >> useful conclusion, and the parent has no further need for the raw material.

- Broad codebase exploration ("find every place this API is called")
- Reading logs/build output/test results to extract one fact
- Research that ends in a synthesized answer — sources don't need to stay in context
- Independent investigations that don't depend on each other

### When delegation costs more

- One-line fixes, single-file edits — anything doable in 1-2 tool calls
- Tasks needing most of the current conversation restated in the brief (nothing got isolated)
- Several subagents all re-reading the same shared files (duplicated cost)

### Good candidates

- Independent, self-contained investigations ("how does auth work here")
- Several unrelated fixes that don't touch the same files
- Research where only the summary matters afterward

### Poor candidates

- Sequential work where step 2 needs step 1's full output, not a summary — isolation breaks this
- Tiny mechanical changes
- Anything needing the full running conversation to decide correctly
- Parallel subagents editing the same file (conflicts)

### Automatic vs. explicit delegation

Both exist. Copilot CLI decides on its own sometimes (see below). Claude Code supports both: it can suggest delegation, or you invoke `Task`/a named subagent directly.

**When to ask for one yourself:** the task will clearly generate a pile of disposable exploration ("map this module," "find every caller of X"), or you want a genuinely independent second opinion. Not sure it'll generate much noise? Do it inline, delegate next time if it turns out bigger.

### Parallel delegation

Independent subagents can run concurrently — saves wall-clock time too, not just context. Only works when tasks are truly independent (no shared files, no mid-task coordination needed). Practical ceiling: roughly 3-5 concurrent subagents. Past that, managing the outputs eats the gain.

### Simple subagents vs. orchestration frameworks

Claude Code / Copilot CLI / Gemini CLI subagents: bounded handoff. Delegate once, run once, report back, done. No persistent state, no subagent-to-subagent chat.

Frameworks like CrewAI, AutoGen, LangGraph go further: persistent roles (agents with memory across many tasks), shared state/queues, direct inter-agent messaging. That's a different architecture — built for standalone multi-agent *products*, not for delegating a subtask mid-session.

### When "multi-agent" is overkill

Most dev work needs one agent that occasionally delegates bounded subtasks — investigate, fix, review. Reach for a full framework only when the actual deliverable *is* a multi-agent system. Don't use one to make a single session feel fancier. Unstructured swarms with no single owner mostly produce noise unless roles, handback artifacts, and merge criteria are explicit (see below).

## Implementation comparison

Same concepts everywhere. Syntax and defaults differ — secondary detail.

### Claude Code

**Delegate when:** research touching 10+ files, work splitting into 3+ independent pieces, sequential pipelines with distinct phases, or anything needing a genuinely clean slate. Rule of thumb ([Anthropic's guidance](https://www.claude.com/blog/subagents-in-claude-code)): if a task would flood the session with search results or logs you'll never look at again, delegate. See the [subagents docs](https://docs.claude.com/en/docs/claude-code/sub-agents) for configuring reusable roles.

**Good briefs:** scope tightly, name the output format (summary / findings list / recommendation), request independent tasks in parallel rather than one at a time.

Developer note: worth compiling a list of recurring tasks where prewritten scraper/helper scripts and premade prompts would cut token cost on repeated subagent runs.

**Anti-patterns:** sequential dependent work, parallel subagents on the same file, tiny tasks, a custom subagent for every scenario instead of a handful of well-scoped ones, tight mid-flight coordination.

### Copilot CLI — real, actively tuned

Two mechanisms:

1. **Automatic.** CLI decides on its own (unfamiliar-repo exploration, long commands). GitHub's 2026 "smarter delegation" update made this more selective after the prior version over-delegated. A/B test: 23% fewer tool failures per session (27% search, 18% edit), modest wait-time gains, no quality loss. 100% of production traffic now.
2. **Explicit.** `/delegate` (or `&`) hands a task to a GitHub-hosted Copilot cloud agent, which works on a branch in the background and opens a draft PR. Different shape from in-session subagents — "hand off and check later," not "spawn a helper here."

No install needed for either.

### Gemini CLI — shipped April 2026 (v0.36)

Same shape as Claude Code's: own instructions, own context window, optional restricted tool set, runs in parallel. Ships several built-in subagents (general assistant, CLI helper, codebase investigator) — nothing to author from scratch. One real difference: Gemini 2.5 Pro's context window (1M+ tokens) dwarfs Claude's per-subagent window (~200-400K) — matters if a subagent needs to hold a huge amount of source material at once.

**Bottom line:** Copilot and Gemini CLI both have real, built-in subagent primitives now. The gap that used to exist has closed.

## Bounded roles vs. unstructured swarms

```
primary agent owns the task
specialized subagents produce bounded findings
primary agent integrates and verifies
```

Not: agents freely coordinating with no single owner. That mostly produces noise unless roles, handback artifacts, and merge criteria are explicit. Same "3-5 concurrent, avoid tight coupling" guidance above, named as its own anti-pattern.

## Third-party orchestration frameworks — mostly not the relevant layer here

CrewAI/AutoGen/LangGraph solve a different problem: building standalone multi-agent *applications*, not delegating a task inside a coding session.

- **[CrewAI](https://github.com/crewAIInc/crewAI)** — lowest barrier, "agents as roles/tasks," good for prototypes. Teams commonly graduate off it for production.
- **[LangGraph](https://github.com/langchain-ai/langgraph)** — production-grade: durable execution, checkpointing, human-in-the-loop, [LangSmith](https://www.langchain.com/langsmith) observability. More boilerplate than a two-agent prototype needs.
- **[AutoGen](https://github.com/microsoft/autogen)** — treat as deprecated. Microsoft moved it to maintenance mode; its own README points new users to [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) instead. Don't adopt for anything new.

None fit "delegate a subtask within my coding session" — that's what native subagents already do. Only relevant if a future project's actual product needs a standalone multi-agent architecture, which nothing in scope does.

## Sources

- [How and when to use subagents in Claude Code](https://www.claude.com/blog/subagents-in-claude-code) — Anthropic, primary source
- [Claude Code subagents documentation](https://docs.claude.com/en/docs/claude-code/sub-agents) — Anthropic, official reference
- [How we made GitHub Copilot CLI more selective about delegation](https://github.blog/ai-and-ml/how-we-made-github-copilot-cli-more-selective-about-delegation/) — GitHub Engineering, primary source, A/B test numbers
- [GitHub Copilot CLI Custom Agents and /delegate Guide](https://www.itechguides.com/github-copilot-cli-create-custom-agents-and-delegate-work-to-copilot-cloud-agent/) — secondary, corroborates `/delegate` mechanics
- [Subagents in Gemini CLI Enable Task Delegation and Parallel Agent Workflows](https://www.infoq.com/news/2026/04/subagents-gemini-cli/) — InfoQ, corroborated by geminicli.one, pasqualepillitteri.it on version/date
- Multiple 2026 framework-comparison pieces (Pickaxe, Galileo, DataCamp, OpenAgents) — cross-checked, consistent on AutoGen's maintenance-mode status and LangGraph's production lean
</content>
