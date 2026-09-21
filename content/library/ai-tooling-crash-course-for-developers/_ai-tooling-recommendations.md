# Verified Tools & Repos

Curated, evidence-checked repos, products, and protocols for AI-assisted dev tooling. Nothing goes in this file without meeting the evidence bar: named practitioners with a checkable identity, current docs, or repo-health signals (stars, forks, active commits — not a one-person abandoned project). New-but-promising entries are allowed as a labeled exception. For newsletters/people/communities, see [`_inspiration-and-staying-current.md`](./_inspiration-and-staying-current.md). Process notes live in `decisions/`.

---

## Repos / awesome-lists

### Design-to-code / browser verification tooling (verified 2026-08-22)

- [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) — official Google org repo. MCP server exposing live Chrome DevTools (DOM/computed styles, viewport emulation, network/console/perf) to coding agents. 49.6k stars, 3.5k forks, pushed within 24h of verification.
- [MengTo/Skills](https://github.com/MengTo/Skills) — portable SKILL.md playbooks for design/layout discipline (spacing, typography, guardrails) in coding agents. 5.2k stars, 633 forks, active. **Currently being trialed** — see `decisions/001-first-design-skill-picks.md`.
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) — Vercel's structural guidelines/skill trees for web-design and framework conventions (incl. Next.js/RSC patterns). 30.3k stars, 2.7k forks, active.
- [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) — CLI/daemon orchestrating local Chrome/Puppeteer sessions for agents inspecting a running local dev server. 41.1k stars, 2.7k forks, active.
- [BuilderIO/skills](https://github.com/BuilderIO/skills) — visual-to-code mapping skills (`/visual-plan`, `/visual-edit`) connecting a repo to an editable browser layout. 4.1k stars, 204 forks, active.
- [browser-use/browser-use](https://github.com/browser-use/browser-use) — Python library giving LLMs structured browser control (accessibility-tree extraction, click/scroll/fill, visual inspection). 110k stars, 12.1k forks, very active — the dominant player in this category by a wide margin.
- [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) — vision-first web interaction/layout-validation pipeline (planner/actor/validator loop). 22.8k stars, 2.1k forks, active.
- [browserbase/stagehand](https://github.com/browserbase/stagehand) — open-source automation SDK over Chrome DevTools Protocol, browser control + visual state capture. 24k stars, 1.7k forks, active.
- [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) — reverse-engineers a screenshot/mockup into matching HTML/Tailwind layout. 74.4k stars, 9.1k forks, active.
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) ([impeccable.style](https://impeccable.style)) — design language for making an AI coding harness better at design. 61.6k stars. Maintainer Paul Bakaus, ex-Google, creator of jQuery Mobile — real, checkable identity.
- [nraiden/openv0](https://github.com/nraiden/openv0) — 4.0k stars. Note: an earlier pass separately checked "Open Design / OpenV0" as a general concept and found no single canonical project (see "Checked and discarded" below); this specific repo is the one confirmed real entry in that space.
- [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) — **new-but-promising, labeled exception**: design-token/WCAG-oriented skill set for turning a coding agent into a design-system-aware assistant. 507 stars, 46 forks, active as of 2026-06 — smaller signal than the rest of this subsection, include with that caveat.

### Skill libraries (multi-skill collections — not individual skills)

Every entry here is a collection of many skills bundled in one repo, not a single skill — see "Individual atomic skills" below for the actual single-skill answer.

- [obra/superpowers](https://github.com/obra/superpowers) — "agentic skills framework & software development methodology": plan-first, spec-driven workflow (brainstorming → writing-plans → TDD → verification). 276k stars, 24.7k forks, active. **This is the exact skill framework already active in this Claude Code session** (`superpowers:brainstorming`, `superpowers:writing-plans`, etc.) — already adopted, not a new pick.
- [mattpocock/skills](https://github.com/mattpocock/skills) — "Skills for Real Engineers," personal collection from Matt Pocock, a well-known TypeScript educator (creator of totaltypescript.com). Includes strict-interrogation and TDD-style workflow skills. 231.6k stars, 19.8k forks, active.
- [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — reshapes agent output for ADHD-friendly reading (answer-first, numbered steps, no preamble, one clear next action). 23.2k stars, 1.5k forks, active; organic virality confirmed across multiple independent write-ups, not one aggregator's spin. Single-behavior in spirit, but ships as a repo with related material — check the folder structure before treating it as strictly atomic.
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — "Production-grade engineering skills for AI coding agents," 24 distinct skills (spec-driven dev, TDD, code review, performance optimization, Chrome DevTools browser testing). 89.1k stars, 9.5k forks, active. Maintainer Addy Osmani, a named, highly checkable web-performance/Chrome practitioner. Included here specifically to make a point stick: even top-tier named individuals ship libraries, not atomic skills.

### Correction (2026-08-23): several tools wrongly called fabricated

Earlier passes marked these "likely fabricated" or "uncertain" based on model-knowledge-only checks. The user found real, direct GitHub links for all but one — correcting the record:

- [rtk-ai/rtk](https://github.com/rtk-ai/rtk) — agent terminal/context-output compression layer (intercepts `git`/test/build output, filters to a much smaller version for the LLM, ~60–90% token reduction claimed). Works across Claude Code, Copilot, Cursor, Gemini CLI, Codex. **Was wrongly flagged "high-confidence hallucination"** on the theory it coincidentally matched the user's own personal `rtk` CLI alias — it's a real, unrelated project.
- [skilld-dev/skilld](https://github.com/skilld-dev/skilld) — generates Agent Skills from actual project dependencies (`skilld add npm:vue` → version-aware SKILL.md + refs from docs/releases/issues). Local-first, cross-agent, can use Ollama for generation. Directly relevant to the capability-lifecycle ideas in `personal-harness-ARCHITECTURE.md`.
- [frontman-ai/frontman](https://github.com/frontman-ai/frontman) — browser-aware frontend coding agent; connects the live running app to source (click an element, ask it to change it — sees DOM, computed CSS, component hierarchy, routes, source maps, logs). Targets Next.js/Astro/Vite (React/Vue/Svelte). Note: a separate, unrelated `androsland/frontman` (orchestrator/model-routing skill) also exists — don't conflate the two.
- [cloudflare/skills](https://github.com/cloudflare/skills) — official Cloudflare Agent Skills repo, includes the `web-perf` skill (Core Web Vitals/LCP/INP/CLS/Lighthouse auditing guidance for an agent). It's a skill inside this repo, not a standalone `cloudflare/web-perf` repo as originally miscited.
- [remotion-dev/skills](https://github.com/remotion-dev/skills) — official Remotion (React video framework) Agent Skills, install via `npx skills add remotion-dev/skills`.
- `VoltAgent/awesome-agent-skills` — already listed above; confirmed as a large curated directory (1000+ skills from Cloudflare, Vercel, Angular, Remotion, OpenAI, etc.), not a competing framework claim.

**"Codeex" — most likely just a garbled/misspelled reference to [OpenAI Codex](https://openai.com/codex/).** That was the original hypothesis, and it's still the most defensible read: no authoritative source for a distinct "Codeex" product exists, just a weak, thinly-sourced mention of an unrelated "Codeex AI super-app." If a future dump repeats this name, default to OpenAI Codex (real, well-known) unless a specific different repo/product is confirmed.

### Individual atomic skills (single SKILL.md, one job — verified 2026-08-22)

Genuinely standalone or subfolder-level single-purpose skills, distinct from the libraries above. See [`skill-libraries-and-marketplaces.md`](./topics/skill-libraries-and-marketplaces.md) section 7 for full reasoning.

- [netresearch/context7-skill](https://github.com/netresearch/context7-skill) — one job: Context7 documentation lookup as a lightweight REST wrapper, no MCP overhead. 53 stars, 8 forks, pushed within days, active. Maintainer netresearch, a named dev agency. **New-but-promising**: real, well-scoped, thin signal.
- [mgifford/accessibility-skills — `skills/color-contrast/SKILL.md`](https://github.com/mgifford/accessibility-skills/blob/main/skills/color-contrast/SKILL.md) — WCAG contrast-check, single job. Cite the subfolder, not the whole repo (the repo itself is a small library, 39 stars/2 forks). Maintainer Mike Gifford, a named/checkable accessibility practitioner. **New-but-promising**, low star count.
- [softaworks/agent-toolkit — `skills/commit-work/SKILL.md`](https://github.com/softaworks/agent-toolkit/blob/main/skills/commit-work/SKILL.md) — stage/split/write Conventional Commits messages, single job. Parent repo is a library (2,378 stars/221 forks, real and active) — cite this subfolder specifically for the atomic use case.
- [agensi.io/skills/git-commit-writer](https://www.agensi.io/skills/git-commit-writer) — single-purpose Conventional Commits writer, marketplace-listed. Agensi's own dashboard calls it their most-downloaded skill — real listing, but that popularity figure is self-reported by the marketplace, not independently auditable.
- [agensi.io/skills/pr-description-writer](https://www.agensi.io/skills/pr-description-writer) — single-purpose PR-description generator from a diff. Same marketplace, same self-reported-metric caveat.
- [mcpmarket.com/tools/skills/leaderboard](https://mcpmarket.com/tools/skills/leaderboard) — real, numbered leaderboard of atomic single-purpose skills, ranked by GitHub stars of each skill's underlying repo (confirmed methodology, not a marketplace-only self-reported metric). Confirmed live entries incl. [#1 diagram-maker-visualizer](https://mcpmarket.com/tools/skills/diagram-maker-visualizer) (SVG/HTML/Excalidraw architecture-diagram generator), `next-js-turbopack-optimizer`, `frontend-slides`, `react-flow-implementation`, `frontend-performance-optimizer`, `context7-documentation-lookup`, `react-performance-optimization`, `react-code-fix-linter`. Per-entry underlying-repo star counts and exact rank positions beyond #1 not independently re-pulled this pass (site rate-limited, HTTP 429) — existence and ranking method confirmed, individual numbers not yet.

**Marketplaces referenced but not promoted as sources in their own right** (real platforms, self-reported metrics only — useful as places to find/verify individual skills, not citable authorities themselves): [mdskills.ai](https://www.mdskills.ai) — 4,000+ skill/plugin/MCP listings with visible download counts. [agensi.io](https://www.agensi.io) — 4,000+ paid skills marketplace, cross-tool; hosts `git-commit-writer` and `pr-description-writer` above (both real, free, cross-tool listings — "most downloaded" claim is Agensi's own unverifiable metric).

### Core infra & framework repos

- [ollama/ollama](https://github.com/ollama/ollama) — single-command local model runner.
- [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp) — C/C++ inference engine, popularized GGUF-style quantization for consumer hardware.
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — PagedAttention high-throughput serving engine, the production/multi-user standard (not the right tool for solo local use — see [`local-model-hardware-fit.md`](./topics/local-model-hardware-fit.md)).
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — Python multi-agent orchestration framework.
- [microsoft/autogen](https://github.com/microsoft/autogen) — multi-agent conversation framework. Original authors also continue as the community-led **AG2** fork.
- [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) — autonomous software-engineering agent, product renamed OpenHands (formerly OpenDevin), org is All Hands AI.
- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) — official MCP reference-server hub.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — composable-chain framework for LLM apps.
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — stateful/cyclic agent orchestration with persistence.
- [run-llama/llama_index](https://github.com/run-llama/llama_index) — data-ingestion/RAG framework; also the standard ingestion/chunking layer for a personal RAG-over-codebase pipeline (see "Dev-scoped second brain" below).
- [Mastra](https://mastra.ai) — TypeScript-native agent framework.
- **Microsoft Agent Framework** — Microsoft's 2025 convergence of AutoGen + Semantic Kernel (exact repo URL not confirmed).

### Utility / observability repos

- [yamadashy/repomix](https://github.com/yamadashy/repomix) — packs a repo into one LLM-friendly context file.
- [Langfuse](https://github.com/langfuse/langfuse) — open-source LLM observability/tracing platform.
- [Arize Phoenix](https://github.com/Arize-ai/phoenix) — open-source tracing tool, OpenTelemetry-based.
- [mem0ai/mem0](https://github.com/mem0ai/mem0) — memory layer for AI agents, formerly Embedchain.

### Other real products

- [Lovable](https://lovable.dev) — AI full-stack web-app builder (formerly GPT Engineer).
- [Firecrawl](https://www.firecrawl.dev) — web-scraping/crawling API built for LLM ingestion.

### Currently being trialed

See `decisions/001-first-design-skill-picks.md`:
- [MengTo/Skills](https://github.com/MengTo/Skills) (above)
- Claude Design (below, in Products)
- `Adityaraj0421/naksha-studio` — **unverified**, user's own find, no repo-health data on record.

### Dev-scoped second brain / RAG-over-own-context

See [`dev-scoped-second-brain-rag.md`](./topics/dev-scoped-second-brain-rag.md) for full reasoning, including the OpenClaw security resolution below.

- [run-llama/llama_index](https://github.com/run-llama/llama_index) — already listed above; also the standard ingestion/chunking layer for a personal RAG-over-codebase pipeline.
- [open-webui/open-webui](https://github.com/open-webui/open-webui) — already listed above (browser tooling); also a legitimate offline chat front-end for a local RAG stack.
- **Continue.dev** — IDE extension (VS Code/JetBrains) pulling custom retrieved context directly into inline completions/chat, avoiding a separate chat-window context switch.
- **Dify** — open-source visual RAG-pipeline/app builder.
- [logseq/logseq](https://github.com/logseq/logseq) — privacy-first outliner/knowledge graph with an active AI-plugin ecosystem.
- [infiniflow/ragflow](https://github.com/infiniflow/ragflow) — deep document-understanding engine specialized in extracting clean data from messy unstructured files.
- **pgvector / Qdrant / ChromaDB** — the three established local vector-store options (Postgres extension / standalone service / simplest local file-backed option, respectively). None is a wrong pick; differ mainly in operational overhead.
- `aristoapp/awesome-second-brain` — curated list, general life-organization scope (not dev-specific) — browsing entry point, not a citable authority on its own.

**OpenClaw (github.com/openclaw/openclaw)** — real, large (247k stars/47.7k forks by March 2026), local-first personal-AI messaging gateway, not a fabrication and not a naming collision with anything else. Its plugin ecosystem, distributed via ClawHub, **is** the same registry documented in [`security-and-supply-chain.md`](./topics/security-and-supply-chain.md) as systematically poisoned with malware in Feb 2026. Core project legitimate; treat any third-party "claw" with the same unaudited-marketplace scrutiny as any other unvetted skill/MCP server — do not adopt broadly on the strength of the core project's popularity alone.

**tinyhumansai/openhuman** (the project an earlier dump garbled as "Open Human") — real, Rust+Tauri, GPL3, local-first encrypted memory graph over documents/emails/chats, MCP-native. Maintained by Tiny Humans AI.

### Discovered via jaychempan/Agent-Leaderboard (agentskills.media)

This leaderboard tool (github.com/jaychempan/Agent-Leaderboard, own repo only 39 stars) was previously flagged as "too thin to promote." Correction: it's a legitimate live discovery tool — cron-updated via GitHub Search API across 5 boards (Agent Skills, MCP Servers, Prompt Library, AI Frameworks, Auto Research), methodology confirmed real. Its own low star count doesn't matter for that use. Star counts on the site run stale (~15–40% under real, some names post-rename) — verify current numbers directly on GitHub before citing exact figures elsewhere. Standouts pulled from it and confirmed real via GitHub API (2026-08-22):

- [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) — 100k stars. Claude Code skill for token-reduction via terse output. Directly relevant to the caveman-mode config already in this user's setup — worth comparing against.
- [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) (renamed from `safishamsi/graphify`) — 109.5k stars. AI coding assistant skill. Directly relevant to the user's own parked "Graphify" knowledge-graph interest — worth a look before building anything custom.
- [affaan-m/ECC](https://github.com/affaan-m/ECC) (renamed from `everything-claude-code`) — 242k stars. Agent-harness performance-optimization system (skills, instincts, memory).
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 234k stars. From NousResearch, a real/known open AI org.
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — 205k stars. Single CLAUDE.md derived from Karpathy's own stated Claude Code preferences.
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — 119.8k stars. Design-intelligence skill for professional UI/UX — relevant to the design-skill gap noted in [`skill-libraries-and-marketplaces.md`](./topics/skill-libraries-and-marketplaces.md).
- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — 94.5k stars. Real, confirmed on Karpathy's own account — AI agents running research on single-GPU nanochat training automatically.
- [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) — 143k stars. Extracted system prompts from major AI coding tools (Cursor, Devin, Claude Code, etc.) — reference material, not a skill.

For the rest of the leaderboard (MCP servers, prompt libraries, AI frameworks, auto-research tools) — browse [agentskills.media](https://agentskills.media) directly rather than duplicating the full ranking here; it refreshes daily.

**Checked and discarded (failed the evidence bar):**
- "Open Design / OpenV0" as a general concept — no single canonical project found beyond the specific `nraiden/openv0` repo now listed above; GitHub search otherwise turns up only unrelated small personal repos (`CrambitHazard/openv0`, etc.), no dominant checkable identity. Not promoted as a category, the one specific repo is.
- "Impeccable" (Claude anti-slop design skill), as a separate concept from `pbakaus/impeccable` above — no other single canonical repo found; GitHub search returns dozens of unrelated small forks/clones using "impeccable" in the name. Sourced originally to a single YouTube video only. Not promoted beyond the one confirmed repo.
- "GSD / Body Double / Executioner" skill — no repo, no named author found. Not promoted.
- `jaychempan/Agent-Leaderboard` as a followable source in its own right — real repo but only 39 stars/0 forks, too thin to meet the repo-health bar on its own merits (it's promoted above as a discovery *tool*, which is a different bar — live methodology, not personal following-worthiness).

## Coding-agent harnesses

| Harness | Type | Models | VS Code | JetBrains/WebStorm | Local models |
|---|---|---|---|---|---|
| [OpenCode](https://opencode.ai) | Open-source agent harness | 75+ providers | ✅ | Via CLI | ✅ |
| [Kilo Code](https://kilo.ai) | Open-source agent harness, built on OpenCode's server | 500+, BYOK | ✅ | ✅ | ✅ |
| [Cline](https://cline.bot) | Open-source IDE agent | Many, BYOK | ✅ | ❌ | ✅ |
| [Continue](https://continue.dev) | Open-source IDE + CLI | Many, BYOK | ✅ | ⚠️ community-maintained | ✅ |
| [Aider](https://aider.chat) | Terminal coding agent | Almost any | Terminal | Terminal | ✅ |
| [Goose](https://block.github.io/goose/) | General developer agent | Many | Terminal/desktop | Terminal/desktop | ✅ |
| [OpenHands](https://openhands.dev) | Autonomous coding-agent platform | Many | Indirect | Indirect | ✅ |
| [OpenAI Codex](https://openai.com/codex/) | Vendor harness | OpenAI | ✅ | integrations vary | ❌ |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Vendor harness | Gemini | Terminal | Terminal | limited |
| [GitHub Copilot](https://github.com/features/copilot) | Vendor harness | Microsoft-hosted selection | ✅ | ✅ | ❌ |
| [Cursor](https://cursor.com) | AI IDE, own VS Code fork | Several hosted | Own fork | ❌ | limited |
| [Windsurf](https://windsurf.com) | AI IDE, own IDE | Several hosted | Own IDE | Plugin exists | limited |
| ~~Roo Code~~ | Cline fork — **shut down May 15, 2026, do not install** | — | — | — | — |

Kilo Code is the only WebStorm/JetBrains-relevant multi-surface option on this list. Claude Code isn't in this table — see `session-and-token-economics.md` / `subagents-and-delegation.md` for its harness behavior.

## General-purpose chat/agent harnesses

| Harness | What it is | Local | Cloud |
|---|---|---|---|
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | Plugin-oriented general agent harness (185k★, dev preview) | ✅ | ✅ |
| [Open WebUI](https://github.com/open-webui/open-webui) | Self-hosted ChatGPT-like platform | ✅ | ✅ |
| [LibreChat](https://github.com/danny-avila/LibreChat) | Open-source multi-provider chat | ✅ | ✅ |
| [LobeChat](https://github.com/lobehub/lobe-chat) | Multi-provider AI workspace | ✅ | ✅ |
| [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) | Self-hosted workspace, RAG + agents | ✅ | ✅ |
| [Chatbox](https://github.com/chatboxai/chatbox) | Lightweight multi-model client | ✅ | ✅ |
| [Cherry Studio](https://github.com/CherryHQ/cherry-studio) | Desktop multi-model client | ✅ | ✅ |
| [Msty](https://msty.app) | Desktop client, local + hosted | ✅ | ✅ |
| [Ollama](https://ollama.com) | Local model runtime + chat UI | ✅ | ⚠️ |

## Model families

Pricing/tier names go stale fast — snapshot dated 2026-08-23, verify before relying on it. USD per 1M tokens, input→output, standard rates unless noted.

| Family | Company | Tiers | Pricing (verified) |
|---|---|---|---|
| [Claude](https://claude.ai) | Anthropic | Haiku 4.5, Sonnet 5, Opus 5, Fable 5 | not priced here |
| [GPT](https://chatgpt.com) | OpenAI | Luna, Terra, Sol | Terra: $2→$12 ($0.20 cached in), confirmed. Luna/Sol unverified. |
| [Gemini](https://gemini.google.com) | Google | Flash-Lite, Flash, Pro | unverified |
| [DeepSeek](https://www.deepseek.com) | DeepSeek | V4 Flash, V4 Pro | Cache-hit/miss + peak/off-peak tiers, confirmed via `api-docs.deepseek.com`: V4 Flash $0.007–$0.014/$0.22–$0.44 in, $0.66–$1.32 out; V4 Pro $0.022–$0.044/$0.66–$1.32 in, $1.98–$3.96 out. |
| [Grok](https://grok.com) | xAI | Model-dependent | unverified |
| [Mistral](https://mistral.ai) | Mistral AI | Large, Small, Ministral, Codestral | unverified |
| [Qwen](https://chat.qwen.ai) | Alibaba | General, Coder, VL | open weights, n/a |
| [Llama](https://www.llama.com) | Meta | Various sizes | open weights, n/a |

GitHub Copilot is not a model family — it's a harness exposing models from multiple providers (see table above).

## Benchmarks

Live leaderboards — check directly, don't trust rankings past today. [SWE-bench](https://www.swebench.com) (coding-agent standard) · [Aider leaderboards](https://aider.chat/docs/leaderboards/) (code-editing accuracy) · [Artificial Analysis — coding agents](https://artificialanalysis.ai/agents/coding-agents) (harness+model combos, cost/token-aware) · [Artificial Analysis — evaluations](https://artificialanalysis.ai/evaluations) (general) · [LMArena](https://lmarena.ai) (human-preference voting, general not coding-specific).

## Products (not repos)

- **Claude Design** — real, in beta (`support.claude.com`). Chat + canvas design tool importing design systems from GitHub/Figma/codebases, `/design-sync` command for Claude Code, direct canvas editing (drag/resize/align), multi-format export. Available Pro/Max/Team/Enterprise, web + Desktop. Note: an "interactive sliders for spacing/typography/color" claim seen elsewhere is **not** confirmed by the support doc — it describes canvas editing, not sliders specifically.

## Protocols / standards

- [Agent Client Protocol](https://agentclientprotocol.com) — standardizes editor/IDE↔coding-agent communication (LSP-shaped: one editor, any compatible agent). Real, live spec; maintainer/implementer list not established from primary docs in this pass — early-stage, not yet an adoption decision.
- [agentskills/agentskills](https://github.com/agentskills/agentskills) — the open-standard home for the Agent Skills / SKILL.md format, "originally developed by Anthropic, released as an open standard." 24.6k★, 1.8k forks, active. Consistent with (not a rival to) `platform.claude.com/docs` as canonical source already cited in [`skill-libraries-and-marketplaces.md`](./topics/skill-libraries-and-marketplaces.md).
- A2A (Agent-to-Agent protocol) — agent↔agent communication, distinct from MCP/ACP. Real effort, originally Google-backed; current 2026 status not independently confirmed in this pass (primary source blocked). Not near-term relevant for solo dev work — see [`protocol-landscape-acp-a2a.md`](./topics/protocol-landscape-acp-a2a.md).
