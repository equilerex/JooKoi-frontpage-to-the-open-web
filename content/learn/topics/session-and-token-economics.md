# Session & Token Economics, and Subagent Delegation

AI tools don't charge by the hour or by the word exactly — they charge by tiny chunks of text called "tokens," and the more back-and-forth history and files piled into a conversation, the more tokens get processed (and paid for) every single time, even for a short question. This topic is about understanding that cost, and about the fact that a conversation left running too long can also start giving worse answers, not just cost more. Worth knowing about if you pay for AI usage or run long working sessions with an AI assistant; skip it if you only send the occasional short question and don't worry about cost.

How coding agents spend tokens, what that costs, and when to compact a session, start fresh, or delegate to a subagent — plus a look at how subagent delegation is implemented across different AI coding tools.

## Section A — Tokens and context, from first principles

### What is a token?

A token is the unit an LLM actually reads and writes — not a word, not a character. Text gets split into subword pieces by a [tokenizer](https://platform.openai.com/tokenizer): common words are often one token, longer or rarer words split into two or more pieces, and punctuation/whitespace count too. Rough rule of thumb for English: **~4 characters per token**, or **~750 words per 1,000 tokens** (per [OpenAI's own tokenizer guidance](https://platform.openai.com/tokenizer)). Code tokenizes less predictably than prose — dense symbols, indentation, and identifiers can push the ratio either way — so treat 4 chars/token as a ballpark, not a formula.

### What is a context window?

The context window is the total number of tokens a model can hold and attend to in a single request — everything the model "sees" when it generates the next response. It's one shared budget covering:

- the system/instruction prompt (harness config, project rules, tool definitions)
- the full conversation history so far (every prior user and assistant turn)
- tool call inputs and outputs (file reads, search results, command output)
- the new turn itself

If the total exceeds the model's context window, older content has to be dropped or summarized before the model can respond at all — that's what compaction (below) exists to do.

### What actually fills up context in an agent coding session

In a typical coding-agent session, context accumulates from:

- **Instruction files** — project-level config the harness auto-loads (e.g. a `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, an `AGENTS.md`)
- **Conversation history** — every message exchanged so far, including ones from many turns ago
- **Tool outputs** — the full text of every file read, every search result, every command's stdout/stderr
- **File contents** — anything the agent opened to read or edit, often re-included on later turns even if unchanged

None of this is unique to one product — every agentic coding tool (terminal-based or IDE-integrated) assembles context the same way; only the exact instruction-file name and loading rules differ.

### Why context size matters

Two independent effects, not one:

1. **Cost.** Providers bill by tokens processed. More accumulated context means more tokens sent on every single turn, even the ones that don't need most of that history.
2. **Quality.** Beyond a certain amount of accumulated context, models get measurably worse at finding and using the relevant piece of it — irrelevant or stale content dilutes attention even when it's technically still "in view." This is sometimes called the **["needle in a haystack" problem](https://www.trychroma.com/research/context-rot)**: buried among enough hay, the needle gets missed even though it's physically present. [Chroma's 2025 research](https://www.trychroma.com/research/context-rot) tested 18 frontier models and found every one degraded as input length grew — often well before hitting the model's hard context limit (e.g. meaningful degradation at 50K tokens in a 200K-token window). A related, older finding is the ["lost in the middle" effect](https://arxiv.org/abs/2307.03172) (Liu et al., 2023): models retrieve information best when it's near the start or end of context, and worst when it's buried in the middle.

The practical upshot: "do I have context room left" and "is this session still working well" are different questions, and the second one degrades first.

### How tokens are billed

Most LLM APIs bill **input tokens** (everything sent to the model) and **output tokens** (everything the model generates) separately, and output is typically priced higher per token than input — generating text costs more than reading it. Subscription products (rather than pay-per-token API access) often convert this into a request-count-equivalent or a rolling usage quota instead of exposing raw token counts, but the underlying meter is still tokens.

### What is prompt caching?

Prompt caching lets a provider reuse the already-processed version of a prefix (the earlier, unchanged part) of your input instead of reprocessing it from scratch on every call. It exists because agent sessions resend a lot of identical content turn after turn — the same system prompt, the same instruction files, the same early conversation — and reprocessing all of that from zero every time is wasteful. A cache hit is billed at a steep discount versus a fresh read (commonly on the order of a 90% discount, though exact figures and mechanisms vary by provider — see below); a cache write (the first time a prefix is cached) usually costs a small premium over normal input pricing, since the provider is doing extra work to make it reusable.

Caching requires the cached portion to match **exactly** — any edit earlier in the prefix (a changed instruction, an added/removed tool, an image appearing) invalidates the cache from that point forward, and the next call pays full write price again.

### What is compaction (or "compression")?

Compaction is a process — automatic in some harnesses, manually triggered in others — that summarizes or discards older conversation history to make room in the context window. Instead of carrying every prior turn verbatim, a compaction pass replaces the discarded portion with a condensed summary, freeing up space for new work.

**What gets lost:** compaction is lossy by construction. Exact wording, precise tool outputs, small caveats and edge cases mentioned once, and any decision the summarizer didn't judge important enough to keep can all disappear. A compacted session remembers the gist of what happened, not the transcript.

### What happens on a fresh session?

Starting a new session drops all prior context entirely, unless something was deliberately saved outside the conversation (a file, a memory entry, a written spec). The upside: no inherited cost, no accumulated stale context, no risk of the "needle in a haystack" effect from unrelated earlier work. The downside: anything that mattered from the old session and wasn't written down is gone.

## Section B — Why growing context compounds cost and risk

Put simply, in mechanical terms:

1. **More accumulated context costs more per turn**, even with caching. Caching lowers the *rate* on the cached prefix (a steep discount, not a 100% discount), but every turn still pays full price for whatever's new since the last cached point, and the cache-rate charge still scales with however much history is being reused. A session ten times longer costs meaningfully more per turn than a fresh one, cached or not.
2. **Stale or irrelevant context isn't just a cost problem — it's a quality problem.** Per the needle-in-a-haystack research above, padding context with things the model doesn't need can make it worse at using the things it does need, independent of what it costs.
3. **Caching only protects the part that stays identical.** Any edit upstream of the cache point (a changed file, a new tool, a different setting) invalidates the cached prefix and forces a full-price reprocess — so a long, varied session is more exposed to unexpectedly losing its discount than a short, stable one.
4. **A fresh session avoids both problems (cost growth and context rot) but loses whatever wasn't externalized.** It's a clean reset, not a free one — the new session has to re-acquire any state that mattered.
5. **Compaction is the middle ground.** It keeps a compressed version of what happened so a session can keep going without paying full cost for the entire history — at the price of losing detail a plain summary won't preserve.

## Section C — Decision guide: continue, compact, restart, or delegate

Rough scale, so the numbers below mean something: **~20K tokens** is roughly a few long files or a half-hour of back-and-forth conversation; **~100K tokens** is roughly a small-to-medium codebase's worth of source files, or a long multi-hour debugging session; **~200K tokens** (a common context window ceiling as of 2026) is roughly a large module or several dozen files — the point past which most sessions are deep into needle-in-a-haystack territory even if the hard limit hasn't been hit.

| Option | Trigger | Benefit | Cost / risk |
|---|---|---|---|
| **Continue as-is** | Session is short-to-medium, task is still tightly scoped, no signs of the model losing track | No overhead, cache discount stays intact | Cost and rot-risk both creep up the longer this goes on |
| **Compact the session** | Mid-task, earlier turns hold decisions/constraints still needed, no external doc already captures them | Frees context room without losing the whole session; cheaper than restarting from scratch on a live task | Loses exact wording, exact tool output, anything the summarizer didn't flag as important |
| **Start a fresh session** | Everything that matters is already in files/memory/a written spec; the conversation itself isn't the source of truth for anything | Zero inherited cost, no accumulated rot, clean slate | New session must re-read whatever carries the state; anything left only in chat is gone |
| **Delegate to a subagent** | A subtask needs a lot of exploration/reading/searching whose raw output the parent session will never need again (e.g. "find where X is implemented," "read these 10 files and summarize") | Parent session only pays for the dispatch prompt and the final report — the subagent's own reading/searching stays out of the parent's growing context entirely | Total tokens across the whole operation aren't reduced — the subagent still burns its own (separate, non-cache-shared) tokens; only the parent's accumulated context is spared |

None of these is free — the right choice depends on where the state that matters currently lives, and whether the immediate need is "keep this exact conversation going" or "get an answer without polluting it."

## Section D — Seeing your own usage

How to actually check what a session is costing, from cheapest/simplest to most detailed. Categories are generic — specifics vary by harness.

- **Built-in status/usage commands.** Most terminal-based coding agents expose a slash or status command that shows current context/token usage in-session — e.g. `/context` or `/status` in Claude Code, or a usage panel in Gemini CLI. Check the specific harness's docs for the exact command; the capability itself is near-universal.
- **IDE status displays and extensions.** IDE-integrated tools (Copilot, Cursor, Cline, etc.) commonly surface a running token/request count in a status bar or sidebar panel rather than a slash command, since there's no terminal prompt to type into.
- **Local session logs.** Most harnesses write a session transcript or log to disk as you work — useful for after-the-fact inspection (what actually got sent, how big it was) even without a live dashboard.
- **Global per-harness state folders.** Session state, history, and config commonly live in a per-user folder — e.g. `~/.claude/` for Claude Code, `~/.gemini/` for Gemini CLI, `~/.copilot/` or the VS Code extension's global storage for Copilot. These folders are the raw material for any custom analysis, since they hold the actual logged sessions.
- **External local-first analytics tooling.** [AI Engineering Fluency](https://github.com/rajbos/ai-engineering-fluency) is a concrete example: it's an open-source VS Code/JetBrains extension (also with a CLI component) that reads local Copilot/agent usage data and displays it as a status-bar token counter (today's usage plus a rolling 30-day total) alongside a broader "fluency score" dashboard covering how the tool is used — modes, tool calls, context references, MCP tool usage. It works across Chromium-based VS Code forks (VS Code, Cursor, Windsurf, VSCodium, and others). All data is read and stored locally — nothing is sent to a remote service — which is what makes it a "local-first" example rather than a hosted analytics product.
- **Custom scripts.** Since session logs are usually just structured local files (JSON or JSONL in most harnesses), a short script that parses them and sums token counts per session/day is often the fastest path to a personalized view, if the built-in status output isn't granular enough.

<!-- VERIFY: exact log file formats and paths for each harness (Claude Code, Gemini CLI, Copilot CLI/extension) drift with releases — check current docs before relying on a specific path. -->

## Section E — Subagent delegation across coding tools

Subagents run their own dispatch with a separate, fresh context window from the parent session. The parent pays for the dispatch prompt and whatever report comes back — not for what the subagent internally read, searched, or generated. This is the mechanism Section C's "delegate to a subagent" row describes: total tokens spent across the whole operation aren't reduced, but the parent session's own growing context — the thing that drives Section B's cost/quality effects — is spared.

This pattern is now implemented, not experimental, across multiple mainstream tools:

- **Claude Code** supports subagents and forked agents with independent context, invoked either explicitly or (in agentic use) proactively by the model itself when a task looks like it would flood the parent session with content that won't be needed again.
- **GitHub Copilot CLI** has both automatic in-session delegation and an explicit handoff (`/delegate` or similar) to a cloud-hosted background agent that works independently and opens a draft PR when done.
- **Gemini CLI** shipped native subagents (own instructions, own context, restricted tool access, parallel execution) as of its v0.36 release in 2026, per the [Google Developers Blog announcement](https://developers.googleblog.com/en/subagents-have-arrived-in-gemini-cli/).

Where these tools differ is administrative control, not whether the underlying capability exists: enterprise policies can restrict which model a subagent may use (falling back to the parent's permitted model if blocked), or gate a feature behind an opt-in flag during early rollout. Neither of those removes subagent delegation as a capability — they constrain how it's configured in a managed environment. Any specific difference in how *readily* a given tool chooses to delegate on its own (versus waiting to be asked) is more a matter of product tuning/maturity than a hard architectural gap, and isn't something with a clean, citable head-to-head benchmark as of this writing.

<!-- ASIDE: corporate/managed-environment audits of specific tool configurations (which features are enabled/disabled under a specific org's policy) are environment-specific and not representative of the product's general capability — worth checking your own environment's admin settings directly rather than assuming from a doc. -->

## Open questions / weak sourcing

- Delegation "proactiveness" (how eagerly a tool decides to spawn a subagent unprompted) has no found head-to-head benchmark across tools — treated as inference from feature-maturity timing, not a citable claim.
- Context-rot's exact onset point is task- and model-dependent; the *existence* of the effect is well-supported (see Chroma's research above), but any specific token threshold quoted for a specific model should be re-verified against current benchmarks before being treated as fixed.
- Exact cache-discount percentages and mechanisms differ by provider and change over time — treat the ~90%/10-cent-on-the-dollar figures above as the general shape, not a locked-in number; check the relevant provider's current pricing docs before doing real cost math.
