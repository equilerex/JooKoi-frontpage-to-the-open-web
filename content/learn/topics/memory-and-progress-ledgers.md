# Stage 1 — Personal Cross-Project Memory/Ledger

This is about keeping a private notebook of what you worked on and why, across projects, separate from any official work log or shared team record. It matters because coding tools don't remember anything between sessions unless something is set up to hold onto it. Read this if you juggle several projects and keep losing track of what you did last week or why you made a certain call; skip it if you only work on one thing at a time and already remember the history fine.

Deeper curation on baseline topic #10: a private, cross-repo record of what was worked on and why — independent of git log, not visible to colleagues, not tied to any single repo. Four candidates from Stage 0, evaluated here on setup/maintenance cost, the provider-independence test ("if Claude disappeared tomorrow, how much of this would still be usable"), and automation potential. No winner picked — this is options plus trade-offs, for you to choose from.

**Expanded 2026-08-23** after the user flagged this doc as too thin and conflating three separate concerns. See "Scope clarification" below before reading the rest — it's the map for where each idea belongs.

---

## Scope clarification (2026-08-23) — three separate things, not one

Earlier passes on this topic blurred three distinct concerns together. Splitting them out:

1. **Repo-scoped context/architecture files** — two different things share this bucket:
   - `AGENTS.md`/`CLAUDE.md`, loaded automatically every session.
   - Small context files placed next to the feature they describe (e.g. a file inside `accounts/`), *not* auto-loaded — found on demand, either because a developer points the agent at them or tooling discovers them.
   The second one is a convention/tooling question about one repo, not a memory *system* — **out of scope for this doc**. It belongs with Stage-0 topic #1 (base instruction files), still-unwritten "per-feature architectural context" sub-topic — see [`topic-index.md`](./../topic-index.md#1-contextmemory-files). Different lifecycle, different trigger, different owner from the ledger below. `_architecture/BACKLOG.md` already flags topic #1 as needing its own deep-dive; the research below should seed that doc, not get absorbed here.
2. **A personal, cross-project second-brain/memory system** — tracks *you* across all your work, independent of any one repo. **This is what the rest of this document is actually about.** The four candidates below, plus the newly-researched ones, all belong here.
3. **Graphify** — a knowledge-graph-from-any-input tool, primarily graph-and-query over an existing corpus, not a place you write new curated facts as you go. **Mostly out of scope, with one correction**: it turns out to have a secondary, ledger-adjacent layer (`save-result`, `reflect`, `.graphify_learning.json`) bolted on top of its primary graph/query job — not a clean "totally separate purpose" as earlier framed. See its own section below for the correction; the main pick still belongs with this crash-course folder's `README.md` "Parked" entry on Graphify, not here.

### Repo-scoped context files — research exists, not yet written up (belongs to topic #1)

Captured here so it isn't lost, not analyzed in depth since it's out of this doc's scope. Note the first two bullets below are about `AGENTS.md`/`CLAUDE.md` specifically — files that *are* loaded automatically every session. The separate feature-local idea (files living beside `accounts/`-style feature code, loaded only on demand) is a distinct pattern with its own prior art — Malloy's [CONTEXT.md convention](https://docs.malloydata.dev/blog/2026-01-13-context-md-convention/), the [llm-context-md proposal](https://github.com/the-michael-toy/llm-context-md), and the [Codebase Context Specification](https://github.com/Agentic-Insights/codebase-context-spec) — that belongs in the eventual "per-feature architectural context" deep-dive, not here.

- **Provider loading mechanics genuinely differ**, confirmed via a 2026-08-07 primary-ish source (Alex Dunlop, `alexdunlop.com`, cross-checked against vendor docs same day): Claude Code reads `CLAUDE.md` specifically (needs an explicit `@AGENTS.md` import to pick up the other convention); Cursor reads `AGENTS.md` with no documented `CLAUDE.md` support; Copilot auto-detects and combines both with no guaranteed order; Gemini CLI defaults to `GEMINI.md`. Only three tools (opencode, Zed, Amp) publish an explicit nested-file precedence order when both filenames exist — everyone else either doesn't document it or explicitly disclaims a guaranteed order.
- **Nested `AGENTS.md` files are a named, repeatable practice**: root file for near-universal rules, nested per-subtree files only where that subtree genuinely differs, an uncommitted `AGENTS.md.local` for personal preferences (Maximiliano Contieri, cross-posted Medium/DEV.to/Substack under the same identity). Official Claude Code guidance: keep `CLAUDE.md` under ~200 lines — longer measurably reduces instruction adherence. <!-- VERIFY: exact adherence-degradation figure not independently re-checked this pass --> These nested files are still auto-loaded at session start, same as the root file — they're not the same mechanism as the on-demand feature-local files described above.
- **ADRs are having a specific, mechanism-level 2026 comeback**, not nostalgia: multiple 2026 dev-tooling blogs (BrainGrid, Actual AI) converge on the same claim — an agent blind to *why* a decision was made will confidently refactor the reason away. `AGENTS.md`/`CLAUDE.md` is standing convention loaded every session; an ADR is a point-in-time record of one decision — different jobs. "Agent-optimized ADR" (restructured for a machine reader) is a real described trend with no single canonical spec found yet.
- **Drift between multiple instruction files (root + nested + per-tool variants) is the community's clearly named pain point** — not hypothetical. Responses found: a CI check failing if `CLAUDE.md` isn't a symlink/one-line `@AGENTS.md` import; `severity1/claude-code-auto-memory` (a Claude Code plugin watching edits and auto-updating `CLAUDE.md`); a still-unconsolidated crop of `AGENTS.md` generator repos (`BitRaptors/Archie` and five others) with no star/fork counts pulled yet — flag the whole generator category as **new-but-promising, unverified**, not a mature "one clear winner" space.
- **One unverified claim, don't cite as fact yet**: a generator repo's own README claims AGENTS.md is "now under the Linux Foundation's Agentic AI Foundation, used in 60,000+ repositories" — that's the project's own self-description, not confirmed against a Linux Foundation source. <!-- VERIFY: Linux Foundation / Agentic AI Foundation stewardship claim -->

---

## 1. Claude Code's built-in memory system

**What it is.** Since Claude Code 2.1.59 (Feb 2026), Auto Memory ships on by default: Claude writes and maintains its own Markdown files under `~/.claude/projects/<project>/memory/`, loading an index (`MEMORY.md`) at session start that points to topic-specific files (this session used exactly this mechanism to store the "no commits" preference). Claude treats its own memory as a hint to verify against real code, not a fact to act on blindly.

**Setup/maintenance cost.** Effectively zero setup — it's on by default and self-writing. Maintenance is passive: you read/edit/delete files like any Markdown, but the system populates itself as you work and correct it.

**Provider independence.** Weak on this specific axis. The files themselves are plain Markdown and readable/portable by hand, but the *mechanism that decides what to write and when* is Claude Code's own harness logic — nothing else currently reads or writes this format automatically. If Claude disappeared, the accumulated files would survive as inert notes; the "occasionally auto-log a ledger entry" behavior would not.

**Automation potential.** Highest of the four, and already built — no scripting required. This directly answers the "can it write itself as I go" want from Stage 0: it already does, today, for free.

**Sourcing.** Official Claude Code docs (`code.claude.com/docs/en/memory`), and independent write-ups confirming the same architecture (Ian Paterson's blog on the MEMORY.md/topic-file structure; Claude Directory's auto-memory guide). Consistent across primary docs and independent coverage — solid.

---

## 2. Plain dated journal files

**What it is.** A flat folder of dated Markdown files (`~/.agents-journal/YYYY-MM-DD.md`), written by hand or with light AI assistance, no special tooling.

**Setup/maintenance cost.** Lowest possible setup (a folder). Maintenance cost is entirely discipline — nothing populates it for you, so it only has value if you (or a prompted AI) actually writes to it each session.

**Provider independence.** Strongest of the four by construction — it's just files, no vendor mechanism involved at all. Trivially passes "if Claude disappeared tomorrow."

**Automation potential.** Not self-populating on its own, but easy to bolt automation onto: a base prompt instruction ("append a dated entry summarizing this session's work to `~/.agents-journal/`") turns this into a semi-automated version of option 1, minus the vendor lock-in, at the cost of it only firing when you remember to trigger it (or wire a session-end hook to do so — see baseline topic #6).

**Sourcing.** This is closer to a general documentation practice than a named tool — the search results here are mostly generic "Markdown+Git for docs" advice rather than a specific practitioner-endorsed "personal engineering journal" pattern. Weakest sourcing of the four; treat this as a well-understood pattern rather than a named, widely-cited practice.

**Note:** already hard-vetoed by the user (see `decisions/003-memory-ledger-picks.md`) — kept here only for completeness of the original four-candidate comparison, not as a live option.

---

## 3. Personal notes vault (Obsidian-class)

**What it is.** A dedicated, local-first Markdown vault (Obsidian being the practitioner-standard example) used as a "second brain" — linked notes, backlinks, search, and increasingly AI-assisted querying over your own vault.

**Setup/maintenance cost.** Highest of the four — a real tool to learn (linking conventions, folder structure, plugin choices if you go that route). Pays off if you want search/cross-linking across years of notes; overkill if you just want a log.

**Corporate-environment blocker: resolved 2026-08-23.** Previously ruled out here for the corporate constraint (Linux-only native dependencies the firewall flagged). Obsidian's dependency set was forked and made corporate-compatible, and the npm lib was security-scanned into the org's own Artifactory. No longer a hard veto.

**Status: active trial, not a decision.** Git-backed Markdown plus hooks (the DIY design elsewhere in this doc) is attractive on paper — cheap, inspectable, no vendor lock-in — but keeping it fresh and organized as the note count grows is a real, unsolved risk. The preferred approach is to try an existing, maintained system before building something custom, and **Obsidian is the first one being trialed** (2026-08-26) — chosen partly to get hands-on experience with it, partly to see how well it can consume or coexist with this repo's own Markdown planning files. Nothing below should be read as a settled architecture pick; it's what's known about Obsidian going into that trial.

**2026 developments worth knowing before evaluating this further:**
- **Smart Connections** (the dominant Obsidian AI plugin) went from MIT-licensed to proprietary with a $99/yr paywall in January 2026 — the "free in-vault AI plugin" assumption no longer holds for the most popular option.
- **The real 2026 trend is bypassing in-vault plugins entirely**: point an external agent (e.g. Claude Code) at the vault via MCP instead, treating the vault as plain markdown you own while the agent does the intelligence work externally. Multiple 2026 sources converge on this pattern (content-marketing-tier sourcing, not named practitioners — weight as directional, not authoritative). Note this pattern is itself affected by the MCP 2026-07-28 stateless spec revision documented in `mcp-model-context-protocol.md`'s correction section — not verified whether Obsidian-MCP integrations have adopted the new wire format yet.

**Provider independence.** Very strong: vault contents are local Markdown files, independent of any AI account or model, and switching between Claude, GPT, or local models doesn't lose notes. This is explicitly called out as a selling point by current coverage, not just an incidental property.

**Automation potential.** Real, but requires setup: 2026 coverage points to connecting Claude Code to an Obsidian vault via MCP, turning the vault into a live workspace Claude can read/search/modify — and separately, structured note types plus encoded agent skills are reported to cut knowledge-management overhead from 30–40% of time to under 10% for at least one practitioner. This is the most capable automation path of the four, but also the only one requiring you to build the MCP/skill wiring yourself; it doesn't come free like option 1.

**Sourcing.** Reasonably well-sourced for the general pattern (Obsidian's own long track record, multiple 2026 write-ups on Obsidian+AI integration, the MCP-to-Obsidian pattern specifically). One source cited a specific 30–40%→10% overhead claim from a named practitioner blog — treat that number as one person's report, not a benchmark.

---

## 4. Periodic extraction scripts from session logs

**What it is.** A script that walks the local JSONL session logs every AI coding tool already writes (`~/.claude/projects/*.jsonl` for Claude Code, equivalents for Codex CLI, etc.) and compiles a summary ledger — prompts, tool calls, changed files — into Markdown.

**Setup/maintenance cost.** Real but bounded: multiple sources describe this as roughly a 20-line script (walk each JSONL file, emit a heading per user turn, format tool calls as fenced code blocks). Existing prior art includes purpose-built tools (`codeburn`, `tokscale` for token/cost tracking across 37+ tools; a `parse-sessions.py` pattern that takes a project slug and date range and produces a Markdown work summary) as well as roll-your-own scripts covered on DEV Community for browsing Claude Code/Codex CLI logs specifically.

**Provider independence.** Strong on the *output* (plain Markdown ledger, yours to keep), weaker on the *input* (each tool's JSONL log format is vendor-specific, so a script written against Claude Code's schema needs adjusting — not rewriting from scratch — for Copilot/Gemini equivalents). Better independence than option 1, worse than options 2/3.

**Automation potential.** This *is* the automation, run on a schedule (cron/scheduled task) rather than triggered per-session — the "occasional local endpoint call" idea from Stage 0 maps most directly onto this option. Doesn't require you to remember anything mid-session, unlike option 2's manual/hook-triggered version.

**Sourcing.** Genuinely well-attested — multiple independent tools and write-ups (GitHub repos, DEV Community posts) converge on the same underlying approach, and the JSONL log locations are documented by Claude Code itself. Solid.

---

## 5. Named memory-layer/second-brain products (added 2026-08-23)

Not in the original four — surfaced by the 2026-08-23 expansion pass specifically for the "developer-scoped personal memory" question, evidence-bar checked.

- **Mem0** (github.com/mem0ai/mem0) — 60–63k stars (sources vary June–Aug 2026), 90,000+ developers per the vendor. Framework-agnostic memory layer (bolts onto LangChain/CrewAI/AutoGen/a custom loop), layered memory with fact-promotion, a memory-compression engine aimed at token reduction. Highest-adoption named entry in this category — real, checkable, already listed in `_ai-tooling-recommendations.md`.
- **Letta** (formerly MemGPT) — agent-runtime-as-OS model: main context acts as RAM, an archival memory tier acts as disk, the agent manages its own allocation between them. Positioned for long-horizon coherence rather than simple fact recall — a different shape of problem than "log what I did."
- **Cognee** (github.com/topoteretes/cognee) — 29.7–30k stars, 2.3k forks (Q3 2026). Self-hosted knowledge-graph memory engine, real repo-health signal, self-hostable — relevant given the corporate/no-cloud-dependency constraint that shaped the Obsidian discussion above. The best-evidenced "graph, but not a huge operational lift" middle ground if the opinion piece's scaling concern (see below) is taken seriously.
- **Zep / Graphiti** — temporal knowledge graph (entities as nodes, facts as time-bounded edges). **Correction worth logging**: Zep dropped its self-hostable Community Edition in 2026 — current options are Zep Cloud (managed, credit-based) or building directly on the raw open-source Graphiti library. `OpenZep` (community, Zep-API-compatible, built on Graphiti) exists as a self-hosted alternative — **new-but-promising, not independently star-checked**.

None of these is purpose-built for the user's specific narrow ask (a small, curated, AI-authored fact-set per repo, hook-triggered, mirrored across a folder structure) — the closest real analogues are Cognee (self-hosted graph, avoids Zep's cloud-only pivot) and plain markdown with AI doing the upkeep (see next section), not a dedicated existing tool.

---

## 6. The "does markdown scale" debate — real, not fringe, not settled

`_architecture/local/opinion-piece-mem.md` argues markdown-based "memory" (Obsidian, OpenClaw's `MEMORY.md`) hits a real ceiling — no querying, no relationships, no schema, no concurrent-write safety — and proposes SQLite or an embedded graph DB (Kuzu) as the real fix once scale is a factor. The 2026-08-23 research pass found this is a genuine, live community tension, not a fringe take, but also not a settled one:

- PKM tooling in 2026 discourse splits into markdown-first (Obsidian, Logseq — local file ownership, no query engine) versus database-style (Tana — every note a structured, propertied, related object).
- The synthesis converging across multiple 2026 sources (content-marketing-tier, not named-practitioner-tier — directional, not authoritative): success depends less on file format itself and more on **whether something automates the curation** — "if the system depends on you linking, tagging, and filing everything yourself, it becomes a second job you will eventually drop."

**Read against this project's actual scope:** the opinion piece's failure modes bite at database-scale (thousands of queryable records). The proposal on the table here is explicitly a *small, curated* set (`ARCHITECTURE.md`/`decisions.md` per repo, AI-authored) — the use case is designed to never grow into what the opinion piece is warning about. This doesn't kill the critique, but sharpens where it applies: the real risk isn't "markdown doesn't scale," it's "nothing automates the upkeep and it silently rots" — which is a different, more actionable problem (worth solving with hooks/automation, per the still-open proposal in `decisions/003-memory-ledger-picks.md`) than "switch to SQLite."

---

## 7. Graphify — correction to earlier framing (added 2026-08-23)

Previously framed (see this crash-course folder's `README.md` "Parked" section) as having a "totally different purpose" from a memory ledger — pure graph/query over a fixed corpus, replay-basis. Confirmed real, single canonical project (`Graphify-Labs/graphify`, 109.7k stars, 10.7k forks, actively released — latest v0.9.48, 2026-08-20; matches this repo's own `/graphify` skill and `graphify-out/` convention, no naming collision). Its core job is confirmed as described: parses code/docs/SQL/PDFs/images/video into a queryable graph, deterministic local tree-sitter AST parsing for code (no vector store, nothing leaves the machine for code specifically), LLM-backed extraction for docs/PDFs/images, every edge tagged `EXTRACTED` (explicit in source) vs. `INFERRED` (resolved by graphify).

**The correction:** Graphify is not *purely* replay/analysis. It has a real, secondary, ledger-adjacent layer bolted on top: `graphify save-result` records Q&A outcomes (useful/dead_end/corrected), `graphify reflect` aggregates those into a `LESSONS.md`, and a work-memory overlay (`.graphify_learning.json`) tags graph nodes preferred/tentative/contested with recency weighting. So the clean three-way split at the top of this doc isn't perfectly clean — Graphify is "graph-and-query first, with a curated-outcomes layer bolted on," not a fully separate concern. No evidence found that anyone uses it as a substitute for a memory/progress ledger; its own docs frame the ledger-like features as supporting the graph, not the reverse.

**Corporate-install blocker — partially addressed, not resolved.** Graphify has a code-only, no-LLM-call extraction mode as well as a fully-local backend option, for corporate setups where a specific capability is policy-disabled rather than cloud access being blocked outright. Itemized detail on this and on this project's own corporate-environment specifics lives in the gitignored `_architecture/local/corporate-environment-audit.md`, not here — general educational docs shouldn't carry one employer's specific policy shape. Not found: anything confirming or denying whether the native-binary dependency set (numpy/rapidfuzz/tree-sitter parsers) is what's actually tripping corporate security scanning — the concern already logged in `_architecture/BACKLOG.md` is still just asserted, not reconfirmed against graphify's current dependency manifest.

This still belongs primarily under the Graphify "Parked" note in `../README.md`, not as a memory-ledger candidate — logged here only to correct the "totally separate purpose" framing.

---

## 8. Storage/vault layer — corporate-environment research pass (added 2026-08-23, cowork research pass)

Direct answer to the open question in `decisions/003-memory-ledger-picks.md`: what storage/vault layer works for the **centralized personal/cross-project memory** design (a `~/.agents` tree mirroring real repos, small curated files per repo, AI-authored, hook-triggered) inside the corporate constraint — no `uv`/`pipx`, native-binary dependencies get flagged by security scanning, MCP is blocked by policy, no cloud dependency, Windows desktop.

**This is a different question from the feature-local repo-context idea in §1 above.** That design is opt-in and on-demand — a file living beside `accounts/` or a specific component, pointed to by the developer or discovered by tooling, never a fixed set read automatically. Nothing below applies to it; this is the separate personal-memory ledger question, where "a fixed set of files, always loaded" is the shape being evaluated.

### Obsidian alternatives — most fail the "plain file, agent can write it" filter

The decisive filter for this design is a folder of markdown files an agent can write with an ordinary file write — no plugin, no API, no daemon required to read them back. That filter eliminates most of the field:

- **Fails outright — not plain files on disk**: Anytype (encrypted proprietary object store, explicitly not accessible outside the app — confirmed via `doc.anytype.io`), Trilium/TriliumNext (single SQLite `document.db`, per `docs.triliumnotes.org`), Joplin (official FAQ: sync files are "not meant to be user-editable"), Memos (SQLite/MySQL/Postgres via API), Outline (Postgres+Redis+S3 stack per third-party self-hosting guides, not independently confirmed against Outline's own docs this pass), Tana (SaaS only, no self-hosted option found on its own pricing page).
- **A real reversal worth flagging**: **Logseq's DB version now stores the graph in SQLite, not markdown** (`~/logseq/graphs/<name>/db.sqlite`, confirmed via `logseq/docs`' own `db-version.md`, still beta with an explicit data-loss warning). The file-based version still exists, but the project's direction is away from it. A HN thread on the DB beta surfaced the exact complaint relevant here: "I can no longer keep all my data as markdown files... half the edits are done by Claude." Not a safe long-term pick for this design.
- **Dendron is dormant, not just quiet** — repo banner states verbatim "currently in maintenance only, active development has ceased." Rule out.
- **Passes, with caveats:**
  - **Foam** — VS Code extension over an ordinary folder of markdown+wikilinks, not an app that owns the data. 17.2k★, active 2026 release, Windows-fine. If the extension disappeared the files are unaffected. Best fit of the named vault tools.
  - **SilverBullet** — self-hosted, single Windows/macOS/Linux binary, official docs confirm plain-markdown storage, independently reviewed on LWN. Real option, but it's a background local web server — closer to the class of unsigned local binary corporate scanning tends to flag — and built for a much bigger vault than a small curated set.
  - **Zettlr** — Electron editor over plain folders, active, cross-platform. Works as a reader; the on-disk-format claim is vendor marketing, not independently documented in this pass.
- No credible new 2026 entrant was found — search results below the fold were SEO listicle content, not treated as sources.

### The stronger finding: named prior art for "no vault at all"

For the centralized personal-memory design specifically (not the feature-local idea — see the disambiguation note above) — a small, fixed set of AI-authored markdown files per project, read at session start — this has a name in the field: the **Memory Bank** pattern.

- **Cline's own docs** (`docs.cline.bot/prompting/cline-memory-bank`) define exactly this: a `memory-bank/` directory with six fixed files (`projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`), collaboratively written and updated at task start/milestones, explicitly "requires no external database or special dependencies."
- **Independent, org-published corroboration**: Modus Create's Agentic Coding Handbook (`tweag.github.io/agentic-coding-handbook`) restates the same six-file structure and states the design rule directly: keep it "short, structured, and current," exclude "unfiltered chat transcripts or raw meeting notes" — an independent org arriving at the same "not a transcript dump" constraint already decided here.
- **The closest single match to this project's specific centralized-mirror twist**: `github.com/jayzeng/agentmemory` — a central `~/.agent-memory/` (configurable) holding `MEMORY.md`/`SCRATCHPAD.md`/`daily/`/`topics/`, distributed as a SKILL.md into each tool's skills folder, no database, no MCP, Windows paths documented. Repo health is weak by this project's own bar — **14 stars, 2 forks, one person** — read as a design reference, not a dependency.
- **Honest gap**: nobody named was found doing the *exact* variant of centralizing outside the repos in a path-mirrored tree. Every other named instance (Cline, Modus Create's writeup, `severity1/claude-code-auto-memory`, OpenClaw's own memory system) keeps the files **inside** the repo, version-controlled with the code — trading "memory travels with the code and gets reviewed" for "doesn't work in a repo you can't commit personal files to," which is exactly the corporate constraint driving this design.

### Hook-triggered agent-authored memory — prior art, mostly disqualified by the same corporate filter

Confirmed first: Claude Code's `SessionStart` and `SessionEnd` hooks both exist today (`code.claude.com/docs/en/hooks`), each firing once per session — the mechanical trigger the proposed design assumes is real, not aspirational.

Named tools checked, all against the corporate filter:

- `thedotmack/claude-mem` — large user base, but requires Bun + `uv` + Chroma's native deps. Fails.
- `coleam00/claude-memory-compiler` — closest *architecture* match: pure markdown output, no vector DB, no MCP. Ships requiring `uv` though — that's packaging, not design, so worth reading as a blueprint.
- `obra/episodic-memory` — named practitioner, MIT license, but needs MCP + sqlite-vec + an ONNX runtime. Fails on three separate grounds.
- `jayzeng/agentmemory` — see above.
- `cyrusNuevoDia/capn-hook` — novel idea: entries carry file hashes so `ARCHITECTURE.md` cache-busts when the underlying code changes. Downloads a 300MB–2GB embedding model on first use though. Fails.
- Tomaz Bratanic's Neo4j hook-based design (`towardsdatascience.com`) — named practitioner, strong track record. Worth reading for the *shape*: cheap append online, LLM curation offline into small markdown files at semantic paths, triggered before compaction rather than only at session end. Needs a Neo4j server though. Fails.
- **OpenClaw's own memory system** (`~/.openclaw/workspace/MEMORY.md` + dated notes + a pre-compaction "silent flush" + background "dreaming" consolidation) — the strongest convergent design evidence in this whole pass. An independent, mainstream harness arrived at nearly the same file taxonomy and the same pre-compaction trigger point. Worth citing as validation of the shape, even though it's not something to install.

### Embedded/queryable backend — the opinion piece's SQLite/Kuzu proposal needs a correction

`local/opinion-piece-mem.md` (already folded into `decisions/003`) proposed SQLite or an embedded graph DB (Kuzu) once scale is a factor. Checked against the corporate filter:

- **Python's stdlib SQLite ships with FTS5 compiled in** — confirmed directly against CPython's own Windows build config (`PCbuild/sqlite3.vcxproj`, `SQLITE_ENABLE_FTS5` in the preprocessor definitions). `import sqlite3` plus `CREATE VIRTUAL TABLE ... USING fts5(...)` needs zero installs — no pip, no wheel, nothing for corporate scanning to flag. This is the one backend in the whole search that cleanly passes.
- **Kuzu is dead — the opinion piece's specific recommendation is stale by about ten months.** The parent project (`kuzudb/kuzu`) archived itself 2025-10-10, confirmed via the repo's own README and independently via The Register's coverage of the abandonment. Two community forks exist (`Kineviz/bighorn`, 131★, no releases, build-from-source; `Vela-Engineering/kuzu`, 36★, maintained by a VC firm using it internally, no long-term commitment stated) — both fail the corporate filter twice over (native C++ binaries, plus the maintenance risk of a sub-200-star fork).
- `sqlite-vec`, DuckDB, LanceDB, and libSQL were all checked and all fail the native-compiled-binary filter that caused problems before — they're worth knowing about if the scope ever grows past "small curated set," not worth adopting now.
- **The size argument stated plainly**: for a small, curated set of files rather than a growing database, `pathlib`/`re` (or optional stdlib FTS5 as a rebuildable index) already covers retrieval. Nothing above buys anything until the corpus is large enough that grep is slow — and the design as specified doesn't get there.

### One directional 2026 data point

`nex-crm/wuphf` (a funded 2026 YC company building a CRM-adjacent agent tool) defaults its memory backend to **"git-native markdown"** — a local git repo of markdown notes — explicitly demoting its earlier Postgres backend to legacy. It fails the corporate filter itself (MCP-based access, non-OSI license), but it's evidence that at least one funded 2026 team made the same bet this design is making: markdown-in-git over a database, for agent memory specifically.

**Sources for this section**: `docs.cline.bot/prompting/cline-memory-bank`; `tweag.github.io/agentic-coding-handbook/WORKFLOW_MEMORY_BANK`; `github.com/jayzeng/agentmemory`; `github.com/thedotmack/claude-mem`; `github.com/coleam00/claude-memory-compiler`; `github.com/obra/episodic-memory`; `github.com/cyrusNuevoDia/capn-hook`; Tomaz Bratanic, "Unified Agentic Memory Across Harnesses Using Hooks" (Towards Data Science, 2026-05-08); `github.com/openclaw/openclaw` `docs/concepts/memory.md`; `github.com/foambubble/foam`; `github.com/silverbulletmd/silverbullet` + LWN review; `github.com/logseq/logseq` + `logseq/docs/db-version.md`; `github.com/dendronhq/dendron`; `github.com/kuzudb/kuzu` + The Register (2025-10-14); `github.com/Kineviz/bighorn`; `github.com/Vela-Engineering/kuzu`; CPython `PCbuild/sqlite3.vcxproj`; `github.com/nex-crm/wuphf`; `doc.anytype.io`; `docs.triliumnotes.org`; `joplinapp.org/help/faq`.

---

## What still needs a real trial, not just research

Which of these actually sticks is not decidable from research alone — Stage 0 already flagged this as "legitimately unclear which wins until you've tried logging into one for a few weeks," and nothing found here overturns that. Two things are decidable now, though: option 1 (built-in memory) costs nothing to keep running regardless of what else gets adopted, since it's already on; and option 2 (plain journal, already vetoed) is out. The real live fork is between "accept vendor coupling for zero-effort automation" (1), "own the pipeline for stronger independence" (4), and "a real notes/memory tool" (3 or 5, now that Obsidian's corporate blocker is resolved) — that's a judgment call on how much the provider-independence constraint and automation-vs-ceremony tradeoff should weigh, not a research question. Preference stated: try an existing, maintained system before building anything custom, rather than picking the "correct" design up front — Obsidian is that first trial (see §3), not a final pick, and trialing more than one option in parallel is fine.

---

## Sources

Claude Code official docs (`code.claude.com/docs/en/memory`); Ian Paterson, "Claude Code Memory System: MEMORY.md & Topic Files"; Claude Directory, "Claude Code's Auto-Memory" guide; Eric J. Ma, "Mastering Personal Knowledge Management with Obsidian and AI" (2026); multiple 2026 Obsidian+AI/MCP integration write-ups (eesel AI, NxCode, dsebastien.net); `codeburn` and `tokscale` GitHub repos (session-log/token tracking across AI coding tools); DEV Community posts on parsing Claude Code/Codex CLI JSONL session logs; labuladong.online on Claude Code session storage locations.

**Added 2026-08-23 (storage/vault research pass, §8):** `docs.cline.bot/prompting/cline-memory-bank`; `tweag.github.io/agentic-coding-handbook`; `github.com/jayzeng/agentmemory`; `github.com/thedotmack/claude-mem`; `github.com/coleam00/claude-memory-compiler`; `github.com/obra/episodic-memory`; `github.com/cyrusNuevoDia/capn-hook`; Tomaz Bratanic (Towards Data Science, 2026-05-08); `github.com/openclaw/openclaw`; `github.com/foambubble/foam`; `github.com/silverbulletmd/silverbullet`; `github.com/logseq/logseq`; `github.com/dendronhq/dendron`; `github.com/kuzudb/kuzu`; The Register (2025-10-14); CPython `sqlite3.vcxproj`; `github.com/nex-crm/wuphf`.

**Added 2026-08-23:** `github.com/mem0ai/mem0`; Vectorize.io's Mem0-vs-Letta and Zep-alternatives comparisons; `github.com/topoteretes/cognee`; OpenZep community project (unverified repo-health); reporting on Smart Connections' 2026 license change; `github.com/Graphify-Labs/graphify` (direct repo check, v0.9.48); Graphify's own CLI docs (`save-result`/`reflect`/`--code-only`/`--backend ollama`); Alex Dunlop, "CLAUDE.md vs AGENTS.md" (alexdunlop.com, 2026-08-07); Maximiliano Contieri, "Use Nested AGENTS.md Files"; BrainGrid and Actual AI on agent-optimized ADRs; `github.com/severity1/claude-code-auto-memory`; `github.com/BitRaptors/Archie` (AGENTS.md generator, unverified repo-health).
