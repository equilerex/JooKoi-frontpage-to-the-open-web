# Stage 1 — Base Instruction Files (AGENTS.md / CLAUDE.md)

A base instruction file is a short file an AI coding tool reads automatically, before doing any work on a project. It stops the agent guessing your conventions or getting told the same things every session.

Relevant if you use one of these tools and want it to stop making wrong assumptions. Skip if you've never set one up.

Deep-dive on baseline topic #1, split out from topic #10 per the 2026-08-23 correction in `topic-index.md`. This doc covers the file itself: what goes in it, root-vs-nested precedence, provider loading mechanics. Cross-project memory/ledgers are a separate question — see `memory-and-progress-ledgers.md`.

**Framing constraint** (per `topic-index.md`'s 2026-08-23 correction): `AGENTS.md` is the primary, provider-agnostic source of truth here — not `CLAUDE.md`. Provider files are researched as thin pointers *to* it. No pick is made in this doc, options and evidence only.

## What is a base instruction file?

A plain Markdown file, checked into a repo (or a user config folder), that a coding agent reads before it starts — no prompt required.

Two names that matter:
- [`AGENTS.md`](https://agents.md/) — provider-agnostic, read by 30+ tools.
- `CLAUDE.md` — [Claude Code](https://code.claude.com/docs/en/memory)'s own name for the same idea.

Cursor, Copilot, Gemini CLI, and most other agents have their own equivalents (table below).

**Why it exists.** An agent starting cold on a repo has no idea how you build, test, deploy, or what conventions you follow. It has to guess or ask, every session. This file is a standing answer to "how does this project work," loaded once per session instead of re-explained every time. Same problem a README solves for humans — different reader, different needs: executable commands over prose, explicit boundaries over onboarding narrative.

**What belongs in it:**
- Build/test/lint commands, with real flags — not "run the tests."
- Code-style conventions the agent should match.
- Where things live in the repo.
- What's off-limits (files not to touch, patterns not to introduce).
- Project-specific gotchas the agent would otherwise trip over.

**What doesn't:** general product docs, architecture explainers for new hires, anything a human reads but an agent never acts on. That's a README or `docs/ARCHITECTURE.md`'s job.

**Global vs. repo-local.** Most agents support two scopes:
- A repo file (checked into git, shared with everyone who clones it).
- A personal config file (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`) — applies across every project, never shared.

Global holds your personal habits. Repo-local holds what's true about *this* codebase regardless of who's working on it.

**Root vs. nested.** A single root file covers the whole repo. Some agents also support one file per subdirectory (`frontend/AGENTS.md` alongside `backend/AGENTS.md`), loaded only when the agent works in that subtree — so a monorepo doesn't force every session to load rules for parts it isn't touching. Support varies by tool (§2).

**Provider-agnostic vs. provider-specific.** `AGENTS.md` works unmodified across any agent that reads it. `CLAUDE.md` and other vendor-named files are read only by their own tool. Common pattern: write one `AGENTS.md`, have provider files import or symlink to it — no duplicate instructions to maintain.

**Why bother:** less time re-explaining project context every session, more consistent output (agent matches your conventions instead of generic defaults), and a place to encode hard constraints ("never touch `migrations/`") that would otherwise only live in your head.

## 1. Governance, and the "60,000 repositories" claim

`AGENTS.md` is a real, governed convention. Released by OpenAI in August 2025, it's now one of three anchor project contributions to the **Agentic AI Foundation (AAIF)** — alongside [MCP](https://modelcontextprotocol.io/) (Anthropic) and [`goose`](https://github.com/block/goose) (Block). Announced by the [Linux Foundation on 2025-12-09](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), confirmed against [`agents.md`](https://agents.md/) itself: "now stewarded by the Agentic AI Foundation under the Linux Foundation." Founding Platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI.

The spec is thin by design. The canonical repo, [`agentsmd/agents.md`](https://github.com/agentsmd/agents.md), states plainly: "AGENTS.md is just standard Markdown. Use any headings you like." No mandatory fields, no schema.

The **"60,000+ repositories" adoption figure** (repeated in the Linux Foundation release and on `agents.md` itself) traces to a single origin: the project's own self-reporting. No independent third party reproduces the count, and it's a December 2025 figure still being carried forward as current. Treat it as a marketing data point, not a verified metric.
<!-- VERIFY: no independent count of AGENTS.md adoption found; figure is self-reported by the AAIF/agents.md project -->

A different, unrelated number — 60.03% file-level agent-adoption among newly created GitHub projects, from [arXiv:2606.07448](https://arxiv.org/abs/2606.07448) — measures something else entirely. Don't conflate the two.

## 2. Per-provider loading mechanics

Confirmed against official docs where available. "Not documented" means the vendor's own docs don't state it — not that the answer is unknown.

| Tool | Reads AGENTS.md natively? | Nested discovery | Documented precedence | Global/user file |
|---|---|---|---|---|
| Claude Code | No — reads `CLAUDE.md`; bridged via `@AGENTS.md` import or symlink | Yes, ancestors at launch + subdirs lazily | Concatenated, root→cwd | `~/.claude/CLAUDE.md` |
| Cursor | Yes, root + nested | Yes, nested overrides parent on conflict | Team → Project → User Rules, merged | UI-based User Rules |
| GitHub Copilot (IDE/coding agent) | Yes, incl. nested | Yes | Not documented | Web/CLI/JetBrains only |
| Copilot CLI | Yes | Yes | Explicitly none — "does not define a general precedence order" | `$HOME/.copilot/` |
| Gemini CLI | No, needs `context.fileName` config | Yes | Concatenated | `~/.gemini/GEMINI.md` |
| OpenAI Codex CLI | Yes (originator) | Yes, root→cwd, one file per dir | Nearer file overrides — concatenated in order | `~/.codex/AGENTS.md`, `AGENTS.override.md` checked first |
| opencode | Yes, preferred over CLAUDE.md | Yes, walks up from cwd | Nearest AGENTS.md → global → CLAUDE.md fallback | `~/.config/opencode/AGENTS.md` |
| Zed | Yes, but ranked below 5 other filenames in a 9-entry list | No — top-level of worktree only | First match in ordered list wins | Rules Library (app-level) |
| Amp | Yes | Yes — most thorough: ancestors always, subtree on file access | Per-directory fallback chain | `$HOME/.config/amp/AGENTS.md` |
| Windsurf/Cascade (Devin Desktop) | Yes | Yes, auto-scoped per directory | Not documented | Not documented |
| Cline | Yes (merged via a long-stalled PR) | Workspace + global combined | Workspace wins on conflict | `~/Documents/Cline/Rules` |
| Aider | No — no auto-discovery of any kind | n/a | n/a | Explicit `--read`/config only |
| Google Jules | Yes | Root only | n/a | Not documented |

Two flags:
- `agents.md`'s own "supported tools" list includes [Aider](https://aider.chat/docs/usage/conventions.html), whose own docs contradict it. Treat that list as a self-claim, not a compatibility matrix.
- Precedence is mostly unpublished — only Codex, opencode, Zed, Amp, and Cursor state a resolution order. Copilot CLI explicitly disclaims having one.

Provider docs checked: [Claude Code memory](https://code.claude.com/docs/en/memory), [Cursor rules](https://cursor.com/docs/context/rules), [GitHub Copilot docs](https://docs.github.com/copilot), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [opencode rules](https://opencode.ai/docs/rules/), [Zed AI rules](https://zed.dev/docs/ai/rules), [Amp manual](https://ampcode.com/manual), [Devin/Cascade AGENTS.md docs](https://docs.devin.ai/desktop/cascade/agents-md), [Cline rules](https://docs.cline.bot/customization/cline-rules), [Aider conventions](https://aider.chat/docs/usage/conventions.html), [Google Jules docs](https://jules.google/docs).

## 3. What actually belongs in the file — official guidance vs. the empirical record

[Anthropic's own docs](https://code.claude.com/docs/en/memory) give a concrete target: "under 200 lines per CLAUDE.md file... longer files consume more context and reduce adherence." No measurement is published behind that guidance.

**The only controlled tests of this specific claim contradict it.** Three independent studies, checked directly:

- **ETH Zurich SRI Lab** ([arXiv:2602.11988](https://arxiv.org/abs/2602.11988), Gloaguen/Mündler/Müller/Raychev/Vechev) — SWE-bench Lite + a 138-issue benchmark, 4 agents including Claude Code and Codex. Context files did not generally improve task success (−0.5% to −2% for LLM-generated files, +4% for developer-written ones) and increased inference cost 19–23% regardless. Repository overviews specifically — "despite being popular and recommended" — proved unhelpful.
- **Damon McMillan** ([arXiv:2605.10039](https://arxiv.org/abs/2605.10039), solo author, weaker provenance) — factorial study across 1,650 real Claude Code sessions, varying file length 25–500 lines, rule position, structure. No detectable contrast on compliance after correction for multiple testing. The one real effect: **within-session decay** — roughly 5.6% lower compliance odds per additional function generated, regardless of file design.
- **Prakhar Khatri** ([arXiv:2607.27250](https://arxiv.org/abs/2607.27250), independent researcher, weakest provenance) — 288 runs, no significant effect on correctness from having a context file at all. Near-miss failures traced to implementation skill, not missing repo knowledge.

**Honest synthesis:** having a file at all matters — compliance went from 0% to 67.7% with vs. without one, per McMillan. Its length and internal structure are not shown to matter. If anything decays adherence, it's session length, not file length — a stronger argument for hooks (deterministic enforcement) than for editing file structure.

Descriptively, [GitHub's own analysis of 2,500+ repositories](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) (Matt Nigh, GitHub Blog, 2025-11-19) found effective files converge on executable commands with flags, testing practices, real code-style examples over prose — "one real code snippet showing your style beats three paragraphs describing it." No length prescription given.

**Compaction, answered directly by the docs:** root-level `CLAUDE.md` survives `/compact` — Claude re-reads it from disk and re-injects it. Nested files and `paths:`-scoped rules reload only when Claude reads files they apply to, so they decay under compaction until re-triggered. Argument for keeping load-bearing rules at root.

## 4. Nested files and the local-override pattern

Nested `AGENTS.md` (root for global rules, per-subtree files only where a subtree genuinely differs) is a named, repeatable practice — confirmed via [Maximiliano Contieri](https://dev.to/mcsee/ai-coding-tip-014-use-nested-agentsmd-files-3iec) (O'Reilly author) and [Simon Boudrias](https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0) (Datadog).

Boudrias adds a counter-argument: proximity-based discovery only works if the agent is already working from that subfolder, or is told to `@`-reference it. His fix: a root-level router file that explicitly dispatches to nested files by task type, not nesting alone.

The local-override filename is `AGENTS.local.md`, not `AGENTS.md.local`. Mostly convention, not tooling — Contieri himself hedges "support varies by tool; check your documentation."

What's actually native:
- **Claude Code's `CLAUDE.local.md`** — documented, gitignore-friendly. Real gotcha: it only exists in the worktree it was created in; use an `@~/.claude/...` import to share across worktrees.
- **Codex CLI's `AGENTS.override.md`** — checked before `AGENTS.md` at both global and per-directory scope.
- opencode explicitly declined this ([issue #16110](https://github.com/anomalyco/opencode/issues/16110), closed "not planned"). Everywhere else, a file by that name is simply not read.

## 5. ADRs as agent context — folklore, not yet a spec

Both sources cited for a 2026 "agent-optimized ADR" trend check out as real — [BrainGrid](https://www.braingrid.ai/blog/architecture-decision-records-for-ai-coding-agents) and [Actual AI](https://www.actual.ai/blog/agent-optimized-adrs) — but both are vendor content marketing, not independent research. No quantitative validation in either.

The mechanism-level argument (an agent blind to *why* a decision was made will confidently refactor the reason away) is plausible and untested. [`adr.github.io`](https://adr.github.io/) itself has no agent-related content as of this pass.

The one attempt at a real standard, [`me2resh/agent-decision-record`](https://github.com/me2resh/agent-decision-record) ("AgDR"), records decisions *made by* an agent, not decisions fed *to* one — a different problem. Low star count, effectively solo-maintained.

**Bottom line: no canonical agent-optimized ADR format yet.** Worth knowing the idea, not worth adopting a specific template.

## 6. Drift, linting, and generation tooling — traction flagged bluntly

- **[`agent-sh/agnix`](https://github.com/agent-sh/agnix)** — a real linter/LSP (400+ self-claimed rules across 9 tools) with editor plugins and a GitHub Action. The only tool in this category with anything resembling a real project around it.
- One-person / near-zero traction, worth knowing but not depending on:
  - [`severity1/claude-code-auto-memory`](https://github.com/severity1/claude-code-auto-memory) — auto-maintains CLAUDE.md via isolated agents, healthiest of the small ones, still solo, pre-1.0.
  - [`BitRaptors/Archie`](https://github.com/BitRaptors/Archie) — near-zero forks, a low-adoption signal.
  - [`giacomo/agents-lint`](https://github.com/giacomo/agents-lint) — checks whether the file still matches the codebase, right idea, no adoption.
  - [`felixgeelhaar/cclint`](https://github.com/felixgeelhaar/cclint) — the only one with an explicit size budget, ~10KB default warning threshold.
- The CI check pattern (fail the build if `CLAUDE.md` isn't a symlink or a one-line `@AGENTS.md` import) is real and matches Anthropic's own suggested pattern. Windows needs Administrator/Developer Mode for symlinks, so the `@AGENTS.md` import is the portable version.
- Demand for native AGENTS.md support in Claude Code is real: [`anthropics/claude-code#6235`](https://github.com/anthropics/claude-code/issues/6235), open since 2025-08-21 with 5,000+ reactions — the largest open feature request on the tracker. Secondary reporting says Anthropic indicated in May 2026 that native support is "not planned for now"; no primary Anthropic statement confirms this directly.
<!-- VERIFY: primary source for Anthropic's "not planned" response to claude-code#6235 -->
  Workaround: a symlink or `@AGENTS.md` import (§4, above).

## 7. Anti-patterns and failure modes

**The strongest-sourced risk in this doc: a cloned repo's own AGENTS.md is a live prompt-injection vector, not a theoretical one.**

[NVIDIA's AI Red Team](https://developer.nvidia.com/blog/mitigating-indirect-agents-md-injection-attacks-in-agentic-environments/) (Daniel Teixeira, 2026-04-20) demonstrated a real chain: a malicious dependency detects it's running inside an agent's environment, writes an `AGENTS.md` claiming "absolute authority" that supersedes the user's own instructions — and instructs the agent's own PR-summarization step to hide the change from reviewers.

[Backslash Security](https://www.backslash.security/blog/openai-codex-injection-in-agents-md-exfiltrating-credentials) (2026-07-06) found OpenAI Codex CLI's non-interactive `exec` mode would silently follow attacker-controlled AGENTS.md instructions to exfiltrate AWS/npm/git credentials. OpenAI shipped a partial model-level fix; the underlying claim — safety gating is mode-dependent, not invariant — stands unaddressed.

**Practical read: don't auto-trust a cloned repo's instruction file the way you'd trust your own.**

Other named failure modes:
- Anthropic's own docs admit contradictory rules get resolved arbitrarily, and ship a `claudeMdExcludes` setting because monorepo ancestor files from *other teams* pollute context by default.
- [Clay Tercek's critique, "AGENTS.md Is Not a README"](https://tercek.me/blog/agents-md-is-not-readme/) adds two sharp points: committing an instruction file imposes one person's workflow on a whole team, and personal local files don't track your git branch, so they go stale by construction.
- A widely-reported (but not independently primary-sourced here) 2026 incident — Apple shipping internal `CLAUDE.md` files inside a consumer app — worth logging as a category example (committed instruction files leaking internal context), even unconfirmed.

## 8. Practical read for this setup

Consistent with `topic-index.md`'s framing constraint: research and write any future instruction-file work provider-agnostically — `AGENTS.md` first, `CLAUDE.md`/others as thin `@`-imports, not the reverse.

The empirical record (§3) argues against spending effort trimming file length, and toward:
- Keep root-level content load-bearing — it survives compaction, nested content doesn't until re-triggered.
- Don't blanket-trust a cloned repo's own instruction file (§7).
- Treat within-session decay as the thing hooks should compensate for, not file editing.

Once `~/.claude/CLAUDE.md` is revisited per `_architecture/BACKLOG.md`'s flagged item (unreviewed merge of an old personal version and an AI-suggested rewrite), this doc's §2–4 is the reference to check it against.

## Sources

Linux Foundation press release (2025-12-09, AAIF formation); `agents.md`; `aaif.io/projects/agents-md`; `github.com/agentsmd/agents.md`; arXiv 2606.07448; official docs — `code.claude.com/docs/en/memory`, `code.claude.com/docs/en/hooks`, Cursor (`cursor.com/docs/context/rules`), GitHub Copilot (`docs.github.com/copilot`), Gemini CLI (`github.com/google-gemini/gemini-cli`), OpenAI Codex CLI docs, `opencode.ai/docs/rules`, `zed.dev/docs/ai/rules`, `ampcode.com/manual`, `docs.devin.ai/desktop/cascade/agents-md`, `docs.cline.bot/customization/cline-rules`, `aider.chat/docs/usage/conventions.html`, `jules.google/docs`; arXiv 2602.11988 (ETH Zurich), 2605.10039 (McMillan), 2607.27250 (Khatri), 2509.14744 (PROFES 2025, note: numbers cited elsewhere for this paper did not match on direct fetch); GitHub Blog, Matt Nigh, "How to write a great agents.md" (2025-11-19); Maximiliano Contieri, "Use Nested AGENTS.md Files"; Simon Boudrias, DEV.to (Datadog); BrainGrid and Actual AI on agent-optimized ADRs; `adr.github.io`; `github.com/me2resh/agent-decision-record`; `github.com/agent-sh/agnix`; `github.com/severity1/claude-code-auto-memory`; `github.com/BitRaptors/Archie`; `github.com/giacomo/agents-lint`; `github.com/felixgeelhaar/cclint`; `anthropics/claude-code#6235`; NVIDIA AI Red Team, Daniel Teixeira (2026-04-20); Backslash Security, Amit Waizman (2026-07-06); Clay Tercek, "AGENTS.md Is Not a README" (2026-05-27).
