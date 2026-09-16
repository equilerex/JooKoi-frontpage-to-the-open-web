# Topic Index — What's Actually Agreed On (2026)

A survey, not a shopping list. Each topic below states what's settled vs. contested in the field, then links to the deep-dive doc(s) that cover it in this repo — or says plainly if no deep-dive exists yet. Personal reactions/mark-labels from the original pass are kept separately in `local/stage-0-raw-notes.md` (gitignored, not shareable content — this file is the shareable version).

---

## 1. Context/memory files
Every major agentic coding tool now reads a plain-markdown instruction file at project root before acting: `CLAUDE.md` (Claude Code), `AGENTS.md` (cross-tool convention, adopted by Codex CLI, Cursor, others), `.github/copilot-instructions.md` (Copilot). Settled pattern: keep it short, pointers not prose, and treat provider-specific files as thin wrappers around one provider-agnostic source (`AGENTS.md`) rather than duplicating content per tool. `AGENTS.md` is the primary source of truth, not `CLAUDE.md` — provider-specific content is the exception, only for what a tool genuinely can't get any other way.

Deep dive: [`base-instruction-files.md`](./topics/base-instruction-files.md) — governance/adoption verification, per-provider loading mechanics, the (contradicted) 200-line-length guidance, nested/local-override patterns, ADR-as-context status, drift tooling, and anti-patterns including a confirmed prompt-injection vector via cloned repos' own AGENTS.md files. No pick made.

*Not the same topic as #10 — that's session/progress ledgers, cross-project memory of decisions. This is the base instruction file itself. Open item: `~/.claude/CLAUDE.md` hasn't been reviewed against this doc's findings yet, see `_architecture/BACKLOG.md`. Also open: no dedicated doc yet for "per-feature/per-quirk architectural context" — related but unresolved by [`harness-engineering-vocabulary.md`](./topics/harness-engineering-vocabulary.md) and [`personal-harness-ARCHITECTURE.md`](./topics/personal-harness-ARCHITECTURE.md), blocked pending a pick from item 10.*

## 2. Prompt & skill libraries
Anthropic's `SKILL.md` format (a folder with a markdown file plus optional scripts/resources, progressively disclosed into context only when triggered) is a de facto standard for Claude Code and is being mirrored by other tools' "custom command" systems. The unsettled part: whether skills should be personal, project-local, or org-distributed as plugins — practice varies by how much the author expects reuse.

Deep dive: [`skill-libraries-and-marketplaces.md`](./topics/skill-libraries-and-marketplaces.md) — spec state, anti-patterns, marketplaces, individual atomic skills vs. libraries. Reference lists: [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md).

## 3. Session & token economics
Consensus: long-running sessions degrade output quality ("context rot") well before they hit the hard token limit, because irrelevant history competes for the model's attention on every turn. Agreed mitigations: one coherent unit of work per session, proactive `/compact`/`/clear`, and prompt caching (rewarding session *shape* — stable prefix, volatile content appended — over raw brevity). Still evolving: automated context-management hooks that decide *for* you when to compact.

Deep dive: [`session-and-token-economics.md`](./topics/session-and-token-economics.md) — caching cost mechanics, compaction vs. fresh, subagent token impact by provider (including a firsthand corporate-environment audit).

## 4. Subagents / multi-agent delegation
Agreed use case: delegating work whose *intermediate* tool output you don't need to keep — broad exploration, isolated research, parallel independent tasks. Agreed anti-pattern (debated in degree, not direction): using multiple agents as a substitute for review quality ("ask 3 agents, take the majority") — correlated error, not independent verification. The distinction: *fresh-context subagent for scope* (well-supported) vs. *multi-agent voting for confidence* (contested).

Deep dive: [`subagents-and-delegation.md`](./topics/subagents-and-delegation.md) — cross-provider status, bounded-roles-vs-swarms pattern.

## 5. MCP (Model Context Protocol)
Adoption moved from experimental to mainstream fast: by mid-2026, MCP-backed agents are in production at the large majority of enterprise AI teams tracked in industry surveys. In restricted corporate environments, the documented workaround is packaging the same capability as an Agent Skill that wraps a direct API/CLI call instead of running an MCP server. Three-primitive framing gaining traction: **Skills** for reusable capability + know-how, **MCP** for governed live connectivity, **CLI/local execution** underneath both.

Deep dive: [`mcp-model-context-protocol.md`](./topics/mcp-model-context-protocol.md) — servers, security, CLI-vs-MCP tradeoff. Related: [`protocol-landscape-acp-a2a.md`](./topics/protocol-landscape-acp-a2a.md) (how MCP relates to ACP/A2A).

## 6. Hooks / automation triggers
Settled as a category: hooks (shell commands firing on tool-call, session-start, session-end, etc.) are the accepted mechanism for deterministic guardrails an LLM shouldn't be trusted to self-enforce. Not contested that they're useful; what's a matter of personal taste is *how much* automation to hang off them.

*No dedicated deep-dive doc yet — a lighter-pass topic, not yet researched beyond this baseline note.*

## 7. Local model use
Converging, previously contested: for a single consumer GPU in the 8GB class, the realistic role is opportunistic — batch/offline jobs where latency doesn't matter — not a default coding-assistant tier. Frontier cloud models still substantially outperform anything that fits in 8GB VRAM for actual coding/reasoning work.

Deep dive: [`local-model-hardware-fit.md`](./topics/local-model-hardware-fit.md) — hardware fit, quantization tradeoffs, Ollama vs. alternatives.

## 8. Review discipline
Agreed: self-review by the same model/context that wrote the code is weak evidence, and multi-agent "consensus" review is correlated rather than independent for the same reason as item 4. The stronger pattern — sometimes called a cold-start or fresh-context critic — is a separate agent with no shared conversation history, forced into a typed verdict, ideally from a different model family. Demanding pasted command output over claimed correctness is close to universal agreement.

Deep dive: [`review-and-verification-tooling.md`](./topics/review-and-verification-tooling.md) — off-the-shelf/IDE-native review tooling, open-source review agents.

## 9. Dotfiles / portability
The mainstream answer is a dedicated dotfile manager (chezmoi being the most-referenced, with GNU Stow and plain symlink scripts as lighter alternatives), trading a steeper tool for templated per-machine divergence.

**Decided against, 2026-09-01 — see [`decisions/009-no-binary-dependencies.md`](../_architecture/plans/decisions/009-no-binary-dependencies.md).** No dotfile manager, no binary, no install step anywhere in the shippable layer. A binary fails on a locked corporate machine, which is exactly where the stack has to work, and the divergence problem it solves is already handled by the `_jookoi-` prefix plus one vault per environment. Applying the stack is a manual copy.

*No dedicated deep-dive doc — the pick closed the topic rather than a research pass doing it.*

## 10. Personal cross-project memory/ledger
No single agreed tool here — a real gap, not just an unresearched one. Candidates named: Claude Code's own built-in memory system, plain dated journal files, a personal notes vault (Obsidian-class), periodic extraction scripts mining AI session transcripts, gitignored per-repo notes.

Deep dive: [`memory-and-progress-ledgers.md`](./topics/memory-and-progress-ledgers.md) — full evaluation of all candidates, no pick made yet. **2026-08-23 addition:** storage/vault-layer research for the corporate-environment-viable design (§8 of that doc) — most named vault products fail the corporate no-native-binaries/no-MCP filter; the closest named prior art is the Cline-style "Memory Bank" pattern, not a vault product.

## 11. Usage analytics / self-assessment tooling
Confirmed: **AI Engineering Fluency** (VS Code extension, author Rob Bos / rajbos) — reads local session logs from VS Code, Copilot CLI, Claude Code, Gemini CLI, Cursor and others, surfaces token usage/cost/usage-pattern insights in the editor status bar, local-first. Beyond this one extension, the category is small and not yet consolidated.

*No dedicated deep-dive doc — confirmed via this baseline pass, open follow-up (more options in this category) not yet pursued.*

## 12. Security
The volume of new repos/scripts/skills available makes it tempting to just install and use things, but shipping malicious code inside them is easier than ever — closer to old-school piracy risk (grab a pile of loot, find a surprise inside) than typical package-manager trust.

Deep dive: [`security-and-supply-chain.md`](./topics/security-and-supply-chain.md) — verification checklist, real 2026 incidents (ClawHub/OpenClaw, Snyk ToxicSkills), low-effort solo-dev practices.

## 13. Frontend debugging, browser interaction, AI integration tooling
*No dedicated stage-1 deep-dive doc — this ground was covered instead through direct verification passes on user-supplied tool lists. See [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md) → "Design-to-code / browser verification tooling" (chrome-devtools-mcp, browser-use, Skyvern, Stagehand, etc.).*

## 14. IDE inline completion and general tooling (WebStorm / VS Code)
*No dedicated deep-dive doc yet — a lighter-pass topic, not yet researched beyond this baseline note.*

---

## Surfaced later (not part of the original 14 topics)

These emerged mid-process from later research/conversations, not the original Stage 0 pass:

- [`harness-engineering-vocabulary.md`](./topics/harness-engineering-vocabulary.md) — harness engineering, context engineering, repository legibility as a connected vocabulary/completeness pass. Agent loops split out separately, see below.
- [`loop-engineering-agent-loops.md`](./topics/loop-engineering-agent-loops.md) — building an agent loop that actually finishes instead of drifting or self-reporting false completion.
- [`prompt-engineering.md`](./topics/prompt-engineering.md) — the base layer underneath every other topic here: writing the actual words sent to the model. Skeleton doc, resource curation still pending.
- [`personal-harness-ARCHITECTURE.md`](./topics/personal-harness-ARCHITECTURE.md) — concrete build proposals: deterministic context bundling, capability lifecycle management, task state as a dependency graph, async/non-blocking long-running commands.
- [`protocol-landscape-acp-a2a.md`](./topics/protocol-landscape-acp-a2a.md) — ACP, A2A, CLI-vs-MCP for local capabilities.
- [`agent-sandboxing.md`](./topics/agent-sandboxing.md) — code-execution sandboxing, Claude Code's `/sandbox` command.
- [`dev-scoped-second-brain-rag.md`](./topics/dev-scoped-second-brain-rag.md) — RAG over your own codebase/ADRs/notes (not general life-organization).
- [`graph-engineering-multi-agent-coordination.md`](./topics/graph-engineering-multi-agent-coordination.md) — coordinating multiple agents/loops as an explicit node/edge graph (LangGraph), and the separate knowledge-graph-vs-vector-RAG sense of the term. Newer, less-settled terminology, sourcing flagged as provisional.
- Coding-agent harness/model landscape — kept as reference tables in [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md), not a separate topic doc (no distinct educational content beyond listings).
- [`stack-distribution-ARCHITECTURE.md`](./topics/stack-distribution-ARCHITECTURE.md) — how the shippable stack layer (`AGENTS.md`/`skills/`/`prompts/`/`utility-scripts/`) should be organized and distributed: skill-sync mechanism, drop-in-folder vs. installer, root-`AGENTS.md` collision risk. No pick made — requirements + open research questions only, 2026-08-27.
- [`../../_architecture/plans/2026-08-30-jookoi-paper-trail.md`](./_architecture/plans/2026-08-30-jookoi-paper-trail.md) — the memory system: per-project context file set, feature-local `CONTEXT.md`, and a personal vault repo for repos where committing isn't allowed. Not a researched topic doc — the user's own design, with a prior-art scan (2026-08-27) and a full spec (2026-08-30). Lives in `_architecture/plans/`, not here, deliberately.

## Surfaced from cross-repo consolidation (not part of the original 14, added 2026-08-23)

- [`planning-before-implementation.md`](./topics/planning-before-implementation.md) — evidence-based planning methodology: when to skip planning, elicitation, decomposition, critique (cold-start review, premortem), when to skip heavyweight spec-driven ceremony. Ported from the old Cowork-session location — this was the one file that never made it across when the projects split. See `decisions/004-cross-repo-consolidation-plan.md`.

## Surfaced 2026-08-23, no deep-dive yet: where agents actually work — global folders, session logs, temp worktrees

Distinct topic, flagged by the user, not yet researched. Coding agents don't only touch the project directory — they keep session logs/temp files/state in global per-tool folders outside the repo (e.g. `~/.claude/`), and some workflows have an agent do its actual work in a temporary directory or git worktree entirely outside the visible project, branching and merging back later. This is real "AI basics" territory — someone new to agentic tooling needs to know this is happening, where to look, and what it means for review/trust. Likely touches token-efficiency and session-economics topics (3) but is its own subject, not a subset. **Do not start researching this yet — log only.** See `_architecture/BACKLOG.md` for the scoped follow-up task.

## Surfaced 2026-08-23, no deep-dive yet: scanning/verifying third-party skills and repos for malicious content

Distinct from topic 12 (Security) above, which covers verification *practice* and named incidents generally. This is narrower and more concrete: an actual tool/process pick for scanning a specific skill, plugin, or repo for malicious prompts/code before adopting it — not yet researched as its own question. Check `security-and-supply-chain.md` when it's reviewed (still unread) for whether it already answers this; if not, this needs its own research pass.

**Resolved 2026-08-23 (cowork research pass):** deep-dive doc now exists — [`skill-scanning-and-verification.md`](./topics/skill-scanning-and-verification.md). Confirms `security-and-supply-chain.md` does not already answer this (that doc covers general practice/incidents, not a specific scanning tool/process). Key finding: purpose-built scanners are now plentiful (NVIDIA SkillSpector, Snyk agent-scan, Cisco skill-scanner) but largely disagree with each other and are evadable — treat any single scan result as one weak signal, not a verdict. No pick made.

## Topics to add: 

- 0 how do llm's actually function under the hood explained semi-eli5 style ? (way too many people, incl. devs not understanding the topic)

---

## Sources
- Anthropic Claude Code documentation and this session's own harness behavior (memory system, hooks, subagents, SKILL.md, prompt caching) — primary source for items 1–6, 8.
- Industry survey coverage of MCP enterprise adoption, July 2026 (andrew.ooo, digitalapplied.com, a2a-mcp.org roadmap coverage) — item 5.
- Xebia engineering blog and DevOps Journal (2026) on the "AI Engineering Fluency" VS Code extension by Rob Bos (rajbos) — item 11.
- chezmoi project (public repo, active maintenance, cross-platform templating) — item 9's baseline. Evaluated and rejected, see `decisions/009-no-binary-dependencies.md`.
