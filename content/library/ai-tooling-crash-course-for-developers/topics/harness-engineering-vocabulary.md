# Stage 1 — Harness Engineering, Context Engineering, Repository Legibility

New topic (not covered by any prior stage-1 doc), surfaced via a ChatGPT-sourced breakdown (quarantine trail resolved and removed once processed). Covers what a harness actually is, how information flows through it, and what makes the surrounding codebase usable by it. No pick, practices to consider adopting, not a mandate.

**Split 2026-09-05:** agent loops moved out to their own doc, [`loop-engineering-agent-loops.md`](./loop-engineering-agent-loops.md) — a loop always runs inside some harness, but building one is a distinct enough topic to stand alone.

## 1. Harness engineering — what it actually means

Per OpenAI's own framing (`openai.com/index/harness-engineering/` — confirmed real via independent secondary coverage; the page itself blocks direct fetching but three independent write-ups, including InfoQ and Milvus's technical blog, converge on the same content): a harness is the designed environment around an agent. The primary engineering job shifts from writing code to "designing environments, specifying intent, and building feedback loops."

OpenAI's own worked example: over one million lines of a real product generated with zero manually-written code, by:
- making the repository structurally legible to agents,
- encoding the project's core principles/conventions directly into the repo,
- running scheduled background agent tasks that scan for convention deviations and submit their own refactoring PRs.

The dump's list of what a harness covers — tool access, permissions/sandboxing, context loading, planning/task state, retries/recovery, test execution, verification, subagents, compaction/memory, logging, stop conditions — is a reasonable inventory. But the *level* matters: this project already has real harness components without naming them as such.

- `AGENTS.md` files are context loading.
- `_architecture/next-steps.md`/`current-state.md` and `llm-progress-complete.jsonl` are task state and logging.
- The Superpowers skill framework already active in this Claude Code session is a planning/verification layer.

Naming it "harness engineering" doesn't change any of that. The value of the term: it names the *whole system* as one design surface, so a change to one part (adding a new skill) gets evaluated against how it affects the others (context budget, verification coverage) rather than in isolation.

## 2. Context engineering — real gap or already covered?

Checked against [`session-and-token-economics.md`](./session-and-token-economics.md) directly. That doc covers cost/economics of context (caching pricing, linear cost growth, compaction-vs-fresh tradeoffs) — a financial/mechanical framing.

Anthropic's `effective-context-engineering-for-ai-agents` article (fetched directly) defines a **different, complementary** discipline: "the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference," guided by finding "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome." This is about *what* goes in the window, not what it costs once it's there.

Concrete practices from the source, genuinely not covered in the existing session-economics doc:

- **Minimal, non-overlapping tool sets** that return token-efficient information. Tool bloat and ambiguous tool overlap actively confuses the model, independent of any cost concern.
- **"Just-in-time" context** — agents dynamically retrieve data via tools at the moment it's needed (file paths, stored queries, links as lightweight identifiers) instead of front-loading everything into the system prompt. Same principle Agent Skills' progressive disclosure already implements at the skill level (covered in [`skill-libraries-and-marketplaces.md`](./skill-libraries-and-marketplaces.md)) — repeats at the tool-design level too.
- **Structured note-taking as persistent external memory** — distinct from compaction (compaction summarizes what happened; note-taking is the agent deliberately writing durable facts to a file as it works, meant to be read back later). Close to, but not identical to, the Topic #10 memory-ledger question — cross-reference when that pick is made.
- **Diverse canonical examples over exhaustive edge-case lists** — a prompt-writing guideline, applies directly to how skills and `AGENTS.md` files should be written.

Net: real, complementary gap. Session-economics answers "does this cost too much and is quality degrading." Context engineering answers "is the right information in the window at all, and is there too much irrelevant material crowding it." Both matter, neither substitutes for the other.

## 3. Repository legibility

Named explicitly in OpenAI's harness-engineering piece as one of three pillars of their million-line experiment: a structured repository, with the project's conventions encoded directly into it (not left as tribal knowledge), so an agent starting fresh can discover what it needs from the repo itself rather than a person's memory or a Slack thread.

The dump's list — architecture notes, decision records, explicit test commands, known-failure documentation, generated codebase maps, schemas, executable validation, small coherent files — maps almost one-to-one onto conventions this repo and the JooKoi product repo already commit to: `JooKoi-frontpage-to-the-open-web/AGENTS.md` states "Decisions are ADR-lite... one file per decision," names `ARCHITECTURE.md` as the whole-system doc (deferred to Stage 5, not built yet — a legibility gap by its own admission, not an oversight), and separates `sources/` (human-authored) from `data/` (machine-observed) explicitly so an agent can tell which clock governs which files without being told in conversation.

**One real gap in this repo's own practice:** executable checks as part of the system of record, not just written docs. OpenAI's background-agent pattern (scheduled tasks scanning for convention deviations, submitting their own fixes) is a step beyond what's here — this repo's conventions are currently enforced by whoever reads `AGENTS.md` before acting, not by anything that runs and checks. Given this repo's own stated anti-speculative-infrastructure stance (`docs/reasoning.md`), building a scheduled deviation-scanner now would be premature — not enough accumulated convention yet to make automated drift-checking worth the setup cost. A real future step once `skills/`/`prompts/` have real content, not something to build today.

## 4. Cross-reference check — verification loops and subagents

Per the source dump's overlap flags:

- "Verification loops / eval-driven development" is already covered by [`review-and-verification-tooling.md`](./review-and-verification-tooling.md) (IDE review tooling, Claude Code's own `/code-review`/`/ultrareview`, PR-Agent, the cold-start-critic pattern) — no meaningful gap found, the framing is consistent (make correctness machine-checkable, don't trust self-report).
- "Parallel agents / subagent delegation" is covered by [`subagents-and-delegation.md`](./subagents-and-delegation.md) and [`session-and-token-economics.md`](./session-and-token-economics.md) §B — the "primary agent owns the task, specialized agents produce bounded findings, primary agent integrates and verifies" pattern the dump describes is exactly the fork-based pattern already in active use across this whole curation project (the parent conversation dispatching bounded research forks and merging their results).

No new doc needed for either.

## Connection to existing conventions

Nothing here contradicts or requires changing `JooKoi-frontpage-to-the-open-web/AGENTS.md` or this repo's own structure — it's a vocabulary and completeness check, not a redesign. One concrete forward-looking note: when `ARCHITECTURE.md` in the JooKoi product repo eventually gets written (Stage 5, per its own roadmap), it's the direct repository-legibility artifact this research describes — write it with an agent's-eye view (what would a fresh-context agent need to discover here) rather than as human-facing documentation, per OpenAI's framing.

## Open questions / weak sourcing

- OpenAI's harness-engineering page itself returned HTTP 403 on direct fetch (likely bot-blocking, not a content issue) — content confirmed via three independent secondary sources (InfoQ, Milvus's technical blog, a Medium write-up) converging on the same specifics, not via the primary page directly. Treat as high-confidence but not verbatim-sourced.
- The dump's individual claim-to-source mappings aren't fully reliable even when the underlying links are real (see [`loop-engineering-agent-loops.md`](./loop-engineering-agent-loops.md) for a caught example, a misattribution about agent loops) — consistent with this project's broader finding that AI-search summaries sometimes misattribute specific claims to real sources that say something adjacent but different.
- Anthropic's context-engineering article was fetched successfully and its claims quoted directly — high confidence.
- ACP and A2A (also new topics from the same Batch 5 dump) are covered in a separate document by a parallel research pass — not duplicated here.
