# Stage 1 — Protocol Landscape: ACP, A2A, and CLI-vs-MCP

Different rulesets for how an AI agent talks to other things: the files/programs it operates on, the editor it runs in, or agents built by someone else. Skim this if you're curious how these plug together. Skip it if you only use one and don't care how it's wired.

## 0. What problem is this solving?

An AI coding agent needs to talk to several different things — files/APIs it operates on, the editor/terminal a person uses, sometimes other agents. Each is a separate integration problem, standardized separately rather than with one protocol:

- **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/specification)** — agent ↔ tools/data. Defines how an AI app (the "host," e.g. an IDE or CLI agent) gets context (files, DB rows, search results) and calls functions ("tools") exposed by a separate server. The protocol a developer is most likely to touch directly — installing an MCP server for GitHub, Postgres, Slack, etc.
- **[Agent Client Protocol (ACP)](https://agentclientprotocol.com)** — agent ↔ editor. Standardizes how a coding agent talks to the editor/IDE hosting it (diffs, open files, plans), so one editor can plug in any ACP-compliant agent instead of custom per-pairing integration.
- **[Agent-to-Agent (A2A)](https://a2a-protocol.org/latest/)** — agent ↔ agent, across separately-built systems. Lets independently-owned agents (different vendors, different frameworks) discover each other's capabilities and hand off tasks without knowing each other's internals.

Rough mental model: MCP = "give my agent tools and data." ACP = "let my agent plug into any editor." A2A = "let my agent talk to someone else's agent."

A fourth, non-protocol option shows up constantly alongside these: for something small and local, just run a **CLI** command — no protocol, no standing server. That's the "do I even need a protocol here" question, and it's often the right answer for one repo, one machine, one-off work.

Where each shows up for a developer:
- MCP — installing a tool integration for a coding agent.
- ACP — an editor advertises "bring your own agent" support.
- A2A — mostly multi-agent *products* (a company's agents calling a partner's agent), not solo dev.
- CLI-vs-MCP — every time "should I build an MCP server for this, or just write a script" comes up.

Not a ranking — these solve different problems and normally coexist in one system (MCP to reach a database, ACP to talk to the editor, a CLI for a quick local check, all in the same session).

---

New topic surfaced from a ChatGPT-sourced dump (quarantine trail resolved and removed once processed). Covers the interface layer one level above individual tools — what connects to what, and when a protocol is even the right answer vs. a plain script. No pick — this is a map, not a recommendation to adopt any of these now.

**Updated 2026-08-23** (cowork research pass): ACP and A2A sections refreshed below. Both prior gaps (ACP's unnamed maintainer, A2A's unconfirmed 403'd source) are now resolved. This doc's own MCP framing was checked against the 2026-07-28 stateless-protocol revision documented in `mcp-model-context-protocol.md` — §4's security citation already references that revision correctly, nothing else here needs correcting.

## 1. The four-layer picture

- **Agent ↔ tools/data** — MCP (covered in depth in [`mcp-model-context-protocol.md`](./mcp-model-context-protocol.md)).
- **Agent ↔ editor/IDE** — Agent Client Protocol (ACP).
- **Agent ↔ agent** — A2A (Agent-to-Agent).
- **Agent ↔ local machine, small one-off ops** — increasingly just a CLI script, no protocol.

Genuinely different layers, not competing standards. Treating "ACP vs MCP" or "CLI vs MCP" as one winner-take-all choice is the wrong frame — each answers a different question.

## 2. Agent Client Protocol (ACP)

**What it is:** standardizes communication between editors/IDEs and coding agents (confirmed from [`agentclientprotocol.com`](https://agentclientprotocol.com)). Explicitly LSP-shaped: LSP let one editor speak to any language server without custom per-pairing work; ACP aims for the same with coding agents. Reuses MCP's JSON representations where possible, adds agentic-coding-specific types (e.g. structured diff display) MCP doesn't have.

**What it is not:** doesn't replace MCP or Skills. MCP is agent↔tools; ACP is editor↔agent — an agent using ACP to talk to your editor still uses MCP (or CLI scripts) to talk to your filesystem, GitHub, etc.

**Maturity — both prior gaps resolved (2026-08-23 pass):**
- Jointly governed by **Zed Industries and JetBrains** (not Zed alone) — confirmed via the spec's `/community/governance` page.
- Two lead maintainers hold veto authority: Ben Brandt (Zed), Sergey Ignatov (JetBrains, appointed 2026-02-18).
- Canonical repo moved to [`github.com/agentclientprotocol/agent-client-protocol`](https://github.com/agentclientprotocol/agent-client-protocol) (out from under `zed-industries`), ~4.0k★/351 forks, published `MAINTAINERS.md`/`GOVERNANCE.md`, official SDKs (Rust, TypeScript, Python, Java, Kotlin).
- **Not** an AAIF project, despite both maintaining orgs being AAIF members — governance page says they're "working toward transitioning to an independent foundation," no date given.

**Adoption — real and broad, not Zed-only:**
- ~40 listed agents (Claude Agent, Codex CLI, Gemini CLI, GitHub Copilot, Cline, Goose, OpenCode, Cursor, others).
- Editor/client support: JetBrains IDEs, Neovim, Emacs, VS Code extensions, Qt Creator, more (`/get-started/clients`, `/get-started/agents`).
- Caveat: self-listed directory pages — "claims support," not verified conformance depth.
- Remote-agent support not shipped: stdio is still the only production transport. A Transports Working Group formed 2026-04-22 to standardize HTTP/WebSockets — currently "draft proposal in progress."
- Other 2026 developments: an ACP Registry for cross-client agent discovery/install; Rust/TypeScript SDKs hit 1.0 on 2026-06-25.

## 3. Agent-to-Agent (A2A)

**What it is:** protocol for agent↔agent communication — distinct from MCP (agent↔tool) and ACP (agent↔editor). Announced by Google (April 2025), donated to the Linux Foundation with founding orgs AWS, Cisco, Google, Microsoft, Salesforce, SAP, ServiceNow.

**Governance update, confirmed 2026-08-23** (previously-blocked Axios source now superseded by primary sources): on **2026-08-17** — six days before this pass — **A2A joined the Agentic AI Foundation (AAIF)**, the same Linux Foundation entity hosting MCP, `goose`, and `AGENTS.md`. Confirmed directly against AAIF's blog/project pages ([`aaif.io/blog/a2a-joins-aaif`](https://aaif.io/blog/a2a-joins-aaif), `aaif.io/projects/agent2agent`). The protocol's own site ([`a2a-protocol.org`](https://a2a-protocol.org/latest/)) hadn't been updated to mention AAIF as of this pass — stale, not wrong, since AAIF is itself a Linux Foundation body.

A2A hit **v1.0** (first stable spec) in March 2026: multi-tenancy, modernized security flows, signed Agent Cards for cryptographic identity. Linux Foundation's press release (2026-04-09) reports **150+ participating organizations** and enterprise production use — named implementers include Google Cloud, Microsoft (Azure AI Foundry, Copilot Studio), AWS (Bedrock AgentCore Runtime), Cisco, IBM, Salesforce, SAP, ServiceNow, plus LangGraph/CrewAI framework integration. Treat "150+ organizations" as a self-reported foundation participation count, not an audited deployment count.

**Relevance to this stack, honestly assessed:** still low — a solo developer isn't building a multi-agent *product* where independently-owned agents negotiate with each other. The adoption breadth above changes "is this real," not "is this relevant to me." A2A matters when the multi-agent system *is* the product (comparable to when CrewAI/LangGraph/AutoGen becomes relevant — see [`subagents-and-delegation.md`](./subagents-and-delegation.md) §"Third-party orchestration frameworks"). Not a near-term concern here.

## 4. CLI-scripts vs. MCP for local capabilities

The practical decision that actually matters for a personal setup, more than either protocol above.

**The pattern:** for small, repo-local operations (`npm run test:affected`, a lint-and-report script, a "find component context" helper), an ordinary shell command a coding agent can already run is often simpler than standing up a dedicated MCP server:

- No extra server process or protocol layer to keep alive.
- Already versioned with the repo, already familiar, already testable normally.
- Works with any coding agent that can run a shell command — no MCP client support required.
- Permissions are whatever your existing shell/sandbox already enforces.

**Where this doesn't apply:** MCP earns its cost for genuinely *external*, *reusable*, *multi-client* integrations — a database connector, a GitHub API wrapper, anything meant to be discovered and called the same way from Claude Code, Cursor, and a teammate's IDE alike. [`mcp-model-context-protocol.md`](./mcp-model-context-protocol.md) §5 documents this exact pattern from the opposite direction (Skill-wrapping-a-CLI as the low-cost MCP alternative). General rule: CLI-first for anything local and single-purpose, MCP when it needs to be a standing, multi-client, discoverable service.

**The security correction:** "use a CLI script instead of MCP" isn't automatically safer. A shell command with broad filesystem/network access isn't inherently more contained than a narrowly-scoped MCP tool. The real principle is least privilege, explicit approval, sandboxing, auditability — regardless of mechanism.

MCP's own current security docs ([`modelcontextprotocol.io`](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices), `2026-07-28`, fetched directly) confirm this:
- **Local MCP Server Compromise** — a malicious local MCP server binary runs with the same privileges as the client, capable of data exfiltration or destructive commands exactly like an unreviewed shell script.
- **Confused deputy problem** — a proxy server with a static client ID can be tricked into leaking an authorization code to an attacker.
- **Token passthrough** — a server forwards a client's token to a downstream API without validating it was issued for that server.

Both confused-deputy and token-passthrough are explicit `MUST`/`MUST NOT` requirements in the current spec, not informal guidance. The source dump's other two claimed risks — prompt injection and untrusted tool metadata ("tool poisoning") — are real but come from a different part of MCP's security story, already covered in [`mcp-model-context-protocol.md`](./mcp-model-context-protocol.md) §4 via Cloud Security Alliance research. This page's scope is mostly OAuth/SSRF/local-execution risk — broader and more detailed than what's currently cited there (SSRF, state-handle hijacking, localhost redirect impersonation, mix-up attacks). **Follow-up flagged:** `mcp-model-context-protocol.md`'s security section should cite this primary source directly.

## 5. Agent Skills as an open standard — one claim checked

The source dump cited [`github.com/agentskills/agentskills`](https://github.com/agentskills/agentskills) as "the Agent Skills specification released as an open standard." Worth scrutinizing since [`skill-libraries-and-marketplaces.md`](./skill-libraries-and-marketplaces.md) already establishes `platform.claude.com/docs` as the canonical spec source — a second repo claiming to be "the standard" could be overstatement or an unofficial fork.

Direct fetch confirms it's not a rival: the repo's own README says the format "was originally developed by Anthropic, released as an open standard, and has been adopted by a growing number of agent products." It frames itself as the open-ecosystem home for that same standard, and shows real activity — 24.6k stars, 1.8k forks, 145 commits, active issues/PRs. Consistent with, not contradicting, `skill-libraries-and-marketplaces.md`. No correction needed there.

**2026-08-23 delta check:** a follow-up fetch returned ~20.6k★/123 commits — lower than the 24.6k★/145 commits above. GitHub star counts don't typically drop, so this is more likely a snapshot/rendering discrepancy than an actual decline, but unresolved — treat both numbers as approximate. Governance unchanged: still not an AAIF project, still Anthropic-originated, community-run under the neutral `agentskills` org, Apache-2.0 code / CC-BY-4.0 docs.

## 6. Practical read for this setup

Given this user's actual context — solo home developer, Angular-monorepo-adjacent work, already running Claude Code with subagents and MCP research done separately:

- **Worth acting on now:** CLI-first instinct for small repo-local operations. Before reaching for a new MCP server scoped to one repo, check whether a plain script does the job.
- **Worth knowing about, not urgent to build around:** ACP now has real breadth (~40 agents, multiple editors, joint Zed/JetBrains governance) — not a single-vendor experiment. Worth a look if a future editor switch or multi-agent-in-one-IDE need arises. Remote-agent/HTTP transport still isn't shipped, so nothing changes for a local stdio-only setup today.
- **Not relevant yet:** A2A. Revisit only if a future project's product architecture involves independently-owned agents negotiating with each other.

## Open questions / weak sourcing

- **Resolved 2026-08-23:** ACP's maintainers (Zed + JetBrains, named leads) and the A2A governance/adoption picture — both previously flagged unconfirmed, now sourced from primary pages (§2, §3).
- ACP Registry's release date is unresolved — spec's `/updates` page dates it 2026-03-09, Zed's announcement blog dates it 2026-01-28. Possibly two distinct events (launch vs. stabilization) — don't cite a single date without rechecking.
- ACP's stated goal of an independent foundation has no timeline — not confirmed whether it's active work or aspiration.
- Agent Skills' star count is inconsistent: 24.6k★ (original pass) vs. ~20.6k★ (2026-08-23 delta check) — see §5, unresolved.
- [`mcp-model-context-protocol.md`](./mcp-model-context-protocol.md) §4 covers tool-poisoning/prompt-injection via secondary aggregated coverage; this doc's §4 fetched a different, more detailed primary MCP security page directly (confused deputy, token passthrough, SSRF, local-server compromise, state-handle hijacking). Complementary, not duplicative — but `mcp-model-context-protocol.md` would benefit from citing this fuller primary source directly.
