# Stage 1 — Agent code-execution sandboxing

AI coding tools can misbehave — delete the wrong file, read something they shouldn't, send data somewhere it shouldn't go. A sandbox restricts what the tool's process can actually do at the OS level, so a bad action stays contained instead of reaching the rest of the machine. Relevant if you use an AI coding assistant that runs commands on your machine; skip it if you only chat with an AI in a browser.

Topic: whether "sandboxing" is becoming a real named security standard for AI coding agents, beyond the generic advice already in [`security-and-supply-chain.md`](./security-and-supply-chain.md) ("run unfamiliar tooling in an isolated context"). Options only, no pick made.

## What is an agent sandbox?

A coding agent that can read files, run shell commands, and make network requests can, by design or by mistake, do real damage: delete the wrong directory, read an SSH key it had no reason to touch, or send data somewhere it shouldn't. A sandbox is an enforcement layer, sitting below the agent and outside its control, that restricts what a process is actually allowed to do at the OS level — regardless of what the model decides to try.

**What's being restricted**, typically some combination of:
- **Filesystem access** — write access limited to the working directory (or an explicit allow-list), with certain paths (`~/.ssh`, shell rc files, credential stores) denied outright even if they're technically inside the project tree.
- **Network access** — outbound connections blocked by default, or routed through a proxy that only permits an allow-listed set of domains.
- **Process/syscall access** — the set of system calls a process can make is filtered, so even a compromised or misbehaving process can't do arbitrary things to the host kernel.

**The risk this contains**: a model that misinterprets an instruction, gets prompt-injected by something it read (a malicious dependency, a scraped web page, a poisoned instruction file — see [`base-instruction-files.md`](./base-instruction-files.md) §7 for a concrete example), or just makes a bad tool call. Sandboxing doesn't require trusting the model to behave — it makes bad behavior structurally harder regardless of why it happened.

**What can stop working inside a sandbox**: anything the allow-list doesn't cover. A build step that reaches an unlisted package registry, a script that needs to read a credential file outside the project directory, or a tool that needs a network domain nobody thought to allow — all fail, often with a permission error rather than an obvious explanation. Loosening a sandbox to fix this reintroduces exactly the risk it existed to contain, so the practical work of using one is mostly tuning the allow-list, not fighting the concept.

**Why a developer would turn one on**: most sandbox implementations cost nothing to enable and cost little day-to-day friction once the allow-list is tuned, in exchange for containing the worst case — an agent's mistake staying inside a working directory versus reaching the rest of the machine.

**Sandboxed is not the same as safe.** A sandbox limits *blast radius* — what an agent can reach if something goes wrong. It does not limit what the agent can do *within* its allowed scope. An agent with write access to the whole working directory and network access to your package registry can still delete the wrong file, commit broken code, or leak a secret living inside the sandboxed path.

It's a containment control, not a correctness or trust guarantee. Pair it with the usual practices — review diffs, don't blanket-trust a cloned repo's instructions, scope credentials narrowly — rather than treating it as a substitute for them.

The rest of this document covers the deeper mechanics: what's actually converging across vendors, and how specific tools (Claude Code's `/sandbox` among them, as one example of several) implement this.

## 1. Is there an actual named standard?

No single cross-vendor spec for sandboxing itself. 2026's agentic-AI standards convergence is real, but it's happening one layer up: [MCP](https://modelcontextprotocol.io/) (tool connectivity, governed by Anthropic/community), [A2A](https://github.com/a2aproject/A2A) (agent-to-agent, now under the Linux Foundation), [WebMCP](https://github.com/webmachinelearning/webmcp) (browser-facing tool exposure, W3C Community Group draft).

Sandboxing isn't one of those layers. Each vendor still implements it independently, from a shared *pool* of isolation tech rather than a shared *protocol* — convergence on primitives, fragmentation on interface. If you've seen "an emerging security standard" claimed somewhere, it's more accurately "a converging set of practices around a shared toolkit" than a ratified spec.

## 2. The shared toolkit (what's actually converging)

Three isolation primitives, used in different combinations:

- **OS-level syscall filtering** — macOS Seatbelt (Apple's App Store sandbox framework, reused, invoked via `sandbox-exec`), Linux [`bubblewrap`](https://github.com/containers/bubblewrap)/[Landlock](https://landlock.io/), Windows AppContainer. Cheap, no VM overhead, but shares the host kernel — a kernel exploit escapes it.
- **[gVisor](https://gvisor.dev/)** — a user-space kernel that intercepts syscalls and only allows a vetted subset through to the real kernel. Stronger isolation than bubblewrap, some performance/compatibility cost. Anthropic uses this for Claude web's sandboxed code execution.
- **MicroVMs ([Firecracker](https://firecracker-microvm.github.io/))** — hardware-virtualized, full kernel-boundary isolation, ~100-125ms cold start, snapshot/pause/resume in 5-30ms. Strongest guarantee, used by E2B and others built for concurrent multi-tenant execution.

Named vendor choices, each confirmed against current docs/blog sources (not aggregator-only):

- **Claude Code**: opt-in via `/sandbox` command (not default), documented in [Claude Code's sandboxing docs](https://code.claude.com/docs/en/sandboxing). macOS uses Seatbelt natively; Linux/WSL2 needs `bubblewrap` + `socat` installed; WSL1 unsupported. Two isolation layers: filesystem (write access restricted to working directory, explicit deny-list for things like `~/.bashrc`, SSH keys; reads are broader), and network (proxied, allow-list of domains, prompts on new ones). Two run modes: auto-allow within those boundaries, or manual-approval-per-command. `/sandbox` is one example implementation among the vendor approaches below, not the definition of what a sandbox is.
- **Claude web / Anthropic's hosted code-execution tool**: gVisor-based, MCP-integrated Python execution — chosen for gVisor's better fit at high concurrent-sandbox counts, not because it's inherently better than Firecracker for a single user.
- **OpenAI Codex CLI**: macOS Seatbelt, Linux Landlock (default), Windows AppContainer — same category of OS-level primitive as Claude Code, different implementation per OS.
- **Dedicated sandbox-as-a-service platforms** (relevant if building custom agent tooling, not just using an existing coding agent): [E2B](https://e2b.dev/) (Firecracker-based, fastest cold start in benchmarks ~717ms, strong SDK ergonomics, best fit for ephemeral single-session tasks), [Modal](https://modal.com/) (gVisor-based, GPU-friendly since gVisor doesn't block hardware passthrough the way some microVM setups can), [Daytona](https://www.daytona.io/) (snapshot-based, tuned for persistent dev-workflow use rather than one-shot execution — sources differ on whether its isolation layer is Docker- or gVisor-based; not independently confirmed here <!-- VERIFY: Daytona's underlying isolation primitive (Docker snapshots vs. gVisor) --> ). These are aimed at people building agent products, not typically something a solo dev wires in just to run Claude Code safely — see Section 4.

## 3. Convergence or fragmentation?

Fragmented at the interface level, converging at the primitive level. Every serious vendor has landed on "OS-level enforcement, not prompt-level trust" as the design principle — that part is now closer to settled consensus than contested opinion. But there's no equivalent of MCP for sandboxes: no shared config format, no portable "sandbox descriptor" a tool from one vendor could hand to another. One relevant real signal: Anthropic's Claude Code sandbox runtime was released as an open source npm package ([`@anthropic-ai/sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime)) usable outside Claude Code itself — a step toward a shared primitive, not yet a standard other vendors have adopted.

## 4. Practical takeaway for a solo home-dev setup

- Turning on Claude Code's `/sandbox` costs nothing and matches the current best-practice consensus (kernel-level enforcement over trusting the model/prompt). It's a real, low-effort, already-available feature, not vaporware or enterprise-only.
- A named CVE ([CVE-2026-35022](https://www.cve.org/CVERecord?id=CVE-2026-35022), a command-injection report against Claude Code CLI/Agent SDK auth-helper execution) is cited by some 2026 sources as motivating sandboxing adoption — but its CNA rejected the record, on the basis that the behavior is documented and warned-against intended behavior (non-interactive mode should only be used in trusted directories), not an unpatched vulnerability. Treat it as a disputed/rejected CVE, not a confirmed forcing-function.
- The sandbox-as-a-service platforms (E2B/Modal/Daytona/Firecracker-direct) solve a different problem — running *many* concurrent isolated agent sessions at scale, typically for a product, not a single local dev's Claude Code sessions. Not worth adopting for a personal setup unless a future project specifically needs to spin up agent-executed code in an ephemeral cloud sandbox (e.g., a tool that lets an agent run untrusted code against real infra). Worth knowing the names exist, not worth setting up now — matches the project's stated anti-speculative-infrastructure stance.

## Open questions / weak sourcing

- The "emerging standard" framing itself is not fully pinned down — no primary spec document found; conclusion above is inferred from the pattern across several 2026 vendor blogs and comparison posts (Modal, Northflank, Qovery, Blaxel), which are vendor-interested parties, not neutral standards bodies. Treat the "convergence on primitives, not protocol" conclusion as a reasonable synthesis, not a verified fact from a primary source.
- CVE-2026-35022's CNA rejection is confirmed against its [CVE Record](https://www.cve.org/CVERecord?id=CVE-2026-35022); some 2026 vendor content still cites the CVE number as if it were a confirmed vulnerability, which it is not.
- Whether Claude Code's sandbox runtime npm package has seen real third-party adoption outside Anthropic's own tools — not checked; flagged as a claim from a single blog post, not a repo-health signal.
- No direct check performed on GitHub Copilot's sandboxing approach specifically (search results covered Codex and Claude but not Copilot in comparable depth) — gap, not a "Copilot has none" claim.
