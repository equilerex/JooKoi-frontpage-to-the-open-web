# Stage 1 — MCP (Model Context Protocol)

Deeper pass on topic #5 from Stage 0. Baseline covered the adoption trend and the work-restricted workaround. This stage covers the protocol itself, what's worth connecting at home, named servers, and security — enough to set something up, not just recognize the acronym. No pick made — this is knowledge plus a short candidate list to choose from.

## 1. What MCP actually is

MCP is an open, client/server protocol for connecting an AI application to external systems. Anthropic's framing: "a USB-C port for AI applications" — one standard interface instead of a bespoke integration per tool. A client (Claude Code, Claude Desktop, VS Code, Cursor, and others) connects to one or more MCP servers. Each server exposes some combination of three primitives:

- **Tools** — actions the model can invoke ("run this SQL query," "create this GitHub issue")
- **Resources** — data the client can read into context (a file, a database row)
- **Prompts** — reusable, server-defined prompt templates

**Difference from a plain API wrapper or a Skill:** a Skill is your packaged know-how plus optional script, loaded into your session. An MCP server is a standing, addressable connection — a client discovers it and calls into it live, following a schema it introspects at runtime instead of you hand-coding the call.

That live, governed, multi-client-reusable connection is the value-add over "just write a script that calls the API." Trade-off: a running server process, plus its own security surface (§4).

## 2. Worth connecting at home vs. overkill

For a single-developer personal stack (unrestricted home setup), the servers worth having are the ones that save you from re-explaining your own filesystem/tools to the model every session:

- **Filesystem** — read/write access to a directory with path restrictions. Near-universally the starting point in current guides.
- **GitHub** — repo search, PR/issue management, without copy-pasting diffs by hand.
- **Fetch/browser** — pulling and converting web content into usable context.
- A **database connector**, only if you actually query a database often — not worth installing speculatively.

Slack, Notion, enterprise data-warehouse connectors: overkill for one person. Real for a team/production agent, not for a personal dev-tooling stack unless you have a specific standing use.

## 3. Named servers worth knowing

- **`modelcontextprotocol/servers`** (github.com/modelcontextprotocol/servers) — Anthropic's own reference-implementation repo, ~79k stars. Includes Filesystem, Git, Fetch, and an "Everything" test server. Explicitly framed as reference/educational rather than hardened production code — a reasonable starting point, but read what you install rather than trusting "official" alone.
- **`punkpeye/awesome-mcp-servers`** — actively-maintained community curated list, ~92.7k stars, ongoing commits. The better catalog for "what exists" today.
- **`appcypher/awesome-mcp-servers`** — a second curated list, ~5.8k stars, **archived as of August 2026, read-only.** Don't treat it as current; use `punkpeye`'s list instead.
- **Serena** — currently running as an MCP server in this project's environment; not yet actually evaluated for what it does or whether it's worth keeping. Flagged 2026-08-26 as needing a real look before it factors into any pick — logged here rather than `BACKLOG.md` since it's specifically an MCP-server question.

## 4. Security — MCP-specific

(Brief here; general repo/dependency vetting is its own stage, #12.)

**Tool poisoning** — the risk shape unique to MCP. A malicious or later-compromised server embeds hidden instructions inside a tool's description field: text the model reads as context, but a human reviewing the UI doesn't see. The agent follows those instructions without you noticing.

A related pattern: the **"rug pull"** — a tool's description changes after you've already approved it, weeks or months later, with no new consent prompt.

Anthropic has confirmed this is a known, accepted characteristic of the current protocol design, and hasn't committed to a protocol-level fix — mitigation burden sits with whoever configures the client. Industry response as of mid-2026: Microsoft's June guidance classifies MCP tool descriptions as a supply-chain asset needing the same review rigor as production code; OWASP lists tool poisoning in its MCP Top 10.

**Practical takeaway:** treat adding or updating an MCP server config as a real review event, not a checkbox. Read the tool descriptions it registers. Prefer servers from `modelcontextprotocol/servers` or well-known maintainers over random unaudited ones. Don't blanket-trust a server just because it worked fine on day one.

**Beyond tool poisoning — the fuller picture, from MCP's own current security-best-practices spec page (`modelcontextprotocol.io`, `2026-07-28`, fetched directly for `protocol-landscape-acp-a2a.md`'s research and folded back in here since it covers meaningfully more ground):**

- **Confused deputy problem** — a proxy MCP server with a static client ID can be tricked into leaking an authorization code to an attacker, who then impersonates the server to a downstream API. An explicit `MUST NOT` in the current spec, not informal guidance.
- **Token passthrough** — a server forwarding a client's token to a downstream API without validating the token was actually issued for that server specifically. Also an explicit spec-level `MUST NOT`.
- **Local MCP Server Compromise** — a malicious local MCP server binary runs with the same privileges as the client process, capable of data exfiltration or destructive commands — structurally identical to running any unreviewed local script, which is why this doc's §4a argues you can't dodge that risk just by avoiding MCP.
- **SSRF, state-handle hijacking, localhost-redirect impersonation, mix-up attacks** — mostly OAuth-flow-specific risks that arise when an MCP server acts as an OAuth client/proxy. Relevant if a server you're connecting to does third-party auth on your behalf, not relevant to a simple local stdio server with no OAuth involved.

Practical read: tool poisoning is the risk that actually applies to casually adding a new MCP server from an unknown source. The four above matter once a server does OAuth/proxying on your behalf (most third-party SaaS-integration servers, less so a local filesystem/git server) — worth re-reading this section before connecting anything that authenticates against a real account.

## 4a. CLI scripts vs. standing up a new MCP server

Worth deciding explicitly before adding a new server, not just when policy-blocked (§5 covers that case).

For a small, repo-local, single-purpose operation — a lint-and-report script, a "find component context" helper, a project-specific test runner — a plain CLI command the agent can already run is often simpler than a dedicated MCP server: no extra process to keep alive, already versioned with the repo, works with any agent that can run a shell command, no MCP client support required.

Reach for MCP instead when the capability is genuinely external, reusable across multiple clients, and worth the standing-server cost — a database connector, a real third-party API integration, something meant to be discovered the same way from more than one tool.

**Security correction:** "use a script instead of MCP" is not automatically safer. A shell command with broad filesystem/network access isn't inherently more contained than a scoped MCP tool — the governing principle is least privilege, explicit approval, sandboxing, and auditability, regardless of mechanism. MCP's own current security docs confirm this: a **Local MCP Server Compromise** attack class exists precisely because a local MCP server binary runs with the same privileges as the client, and can exfiltrate data or run destructive commands exactly like an unreviewed shell script would.

See [`protocol-landscape-acp-a2a.md`](./protocol-landscape-acp-a2a.md) §4 for the fuller writeup and primary-source citation.

## 5. The work-restricted workaround, in more depth

Where MCP is blocked by policy (your work situation), the pattern already named in Stage 0 — wrap the same capability as an Agent Skill calling a direct API/CLI — works because a Skill doesn't require a standing server process or new network endpoint; it's markdown plus a script, invoked inside your existing session the same way any other Skill is. Concretely: instead of running a GitHub MCP server, a Skill's script shells out to `gh` (already installed, already authenticated) or calls the REST API directly with a token from your existing auth. You lose the live tool/resource schema MCP gives multiple clients for free, but you gain something MCP explicitly doesn't have yet: the whole thing is auditable as plain text before it ever runs — exactly what the tool-poisoning risk in §4 argues you want anyway.

## Correction (2026-08-23): the 2026-07-28 spec revision supersedes §1's session model

Everything in §1-§5 above describes MCP as it stood through the `2025-11-25` spec revision: session-based, `initialize`/`initialized` handshake, stateful client/server negotiation.

**A major spec revision landed 2026-07-28** that changes this substantially. Confirmed directly against the primary changelog (`modelcontextprotocol.io/specification/2026-07-28/changelog`) and the official announcement (`blog.modelcontextprotocol.io/posts/2026-07-28/`), cross-checked against independent coverage (Cloudflare, Google Developers Blog, TechCrunch, VentureBeat, The Register) — not a single-source or aggregator-only claim.

**Core shift:** MCP moves "from a bidirectional stateful protocol into a request/response stateless protocol" (the official blog's own framing). Concretely:

- **Handshake removed.** The `initialize`/`notifications/initialized` exchange is gone. Every request now carries protocol version and client identity in `_meta` fields (`io.modelcontextprotocol/protocolVersion`, `clientCapabilities`, `clientInfo`). A new `server/discover` RPC lets a client probe supported versions/capabilities up front instead.
- **Session state removed.** `Mcp-Session-Id` and protocol-level sessions are gone from Streamable HTTP. `tools/list`/`resources/list`/`prompts/list` no longer vary per-connection. Servers needing cross-call state must mint their own explicit handles, passed as ordinary tool arguments — not protocol-managed.
- **Roots, Sampling, and Logging are deprecated** (12-month minimum deprecation window, not removed yet). Suggested migrations: pass paths via tool parameters instead of Roots, integrate directly with an LLM provider API instead of Sampling, log to stderr/OpenTelemetry instead of the Logging feature.
- **Caching is now spec-level**, not just a nice-to-have: `tools/list` and friends must return `ttlMs` (freshness hint) and `cacheScope` (`public`/`private`) — the "cacheable discovery" behavior, and it's real.
- **HTTP header-based routing**: `Mcp-Method`/`Mcp-Name` headers are now required on Streamable HTTP POST requests, letting gateways route/authorize without parsing the JSON body.
- **Server-initiated interactions redesigned**: the old server-initiated-request pattern (`roots/list`, `sampling/createMessage`, `elicitation/create`) is replaced by a Multi Round-Trip Requests (MRTR) pattern — a result comes back tagged `"input_required"` with what's needed, and the client retries the original request with the answer, instead of the server pushing a separate request mid-flight.
- **SDK rollout**: all four Tier 1 SDKs (TypeScript, Python, Go, C#) support the new spec at release; Rust SDK in beta.

**What's unaffected:** the local-vs-external tradeoff, the "worth connecting at home" server list (§2), and the CLI-vs-MCP decision logic (§5) — those are about when to reach for MCP at all, not handshake mechanics.

**What needs a fresh look before building anything against MCP:** any server implementation guidance. A server now needs `server/discover`, `_meta`-based version/capability negotiation, and `ttlMs`/`cacheScope` on list responses instead of the old handshake — the wire format in this doc's §1 is the previous revision, not current.

Tool-poisoning security risk (§4) isn't resolved by this update — orthogonal concern (content of a tool description vs. connection lifecycle), still open.

**Not yet independently checked in this pass:** how quickly major clients (Claude Code, Cursor, VS Code, etc.) actually adopt the new spec version versus continuing to negotiate the older one during the deprecation window — worth checking before assuming every MCP server/client pairing in practice already speaks the new wire format.

## Sources

- modelcontextprotocol.io official documentation (protocol overview, client/server/tools/resources/prompts model)
- `github.com/modelcontextprotocol/servers` (official reference servers, ~79k stars)
- `github.com/punkpeye/awesome-mcp-servers` (~92.7k stars, active) vs. `github.com/appcypher/awesome-mcp-servers` (~5.8k stars, archived Aug 2026) — checked directly, not taken from a secondary list
- Cloud Security Alliance research notes on MCP tool poisoning and design flaws (2026)
- Reporting on Microsoft's June 2026 MCP security guidance and OWASP's MCP Top 10 (tool poisoning, third entry) — via aggregated security-blog coverage, not fetched from Microsoft/OWASP primary docs directly; treat as directionally reliable, not verbatim-quoted
