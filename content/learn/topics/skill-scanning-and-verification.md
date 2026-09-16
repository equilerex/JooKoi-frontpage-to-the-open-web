# Stage 1 — Scanning Third-Party Skills, MCP Servers, and Plugins for Malicious Content

People share ready-made add-ons for AI coding tools — skills, MCP servers, plugins — the same way browser extensions get shared. Most are fine. Some have been found to steal passwords, copy private files, or exfiltrate data.

Scanning means checking one of these for hidden bad behavior before you install it and grant it access to your machine. Worth knowing if you install add-ons other people wrote. Skip if you never install anything beyond what came built in.

New topic, flagged 2026-08-23 in `topic-index.md`. Distinct from the general verification *practice* already covered in `security-and-supply-chain.md` (checklist, 2026 incidents — ClawHub poisoning, Snyk's ToxicSkills study, OWASP Agentic Skills Top 10, Socket.dev for dependency monitoring). Not re-covered here.

**The conclusion this doc builds toward:** a scanner beats no scanner, but no single scanner is enough evidence that a third-party agent artifact is safe. Everything below justifies that line, not talks you out of scanning.

## 1. What you're actually defending against

Documented patterns from real 2026 incidents and research — not hypothetical attack classes.

- **Direct malicious instructions embedded in the artifact.** A `SKILL.md` or manifest just tells the agent to do something harmful, in plain language. The bulk of what's been found in the ClawHub poisoning campaigns — see `security-and-supply-chain.md` for incident numbers (341–1,184 malicious skills depending on count; [Snyk's ToxicSkills study](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) found 1,467 of 3,984 scanned skills with at least one flaw).
- **Indirect prompt injection.** The malicious instruction isn't in what you installed — it's in content the artifact later reads (a webpage, email, file, tool response), and the agent treats it as instructions instead of data. [Unit 42's documented case](https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/): a webpage advertising counterfeit military-style glasses carried hidden prompts to trick an AI ad-review agent into approving content it should've rejected — the first reported real-world case of this kind, per the researchers.
- **Obfuscated or encoded content.** [SlowMist's analysis of the ClawHub poisoning](https://slowmist.medium.com/threat-intelligence-analysis-of-clawhub-malicious-skills-poisoning-0448ffd49c80) found attackers Base64-encoding payloads directly inside `SKILL.md` files, with a two-stage loader that only decodes and runs the hidden stage at execution time — invisible to a plain-text read.
- **Dynamically constructed URLs or commands.** Instead of a hardcoded malicious endpoint a scanner can pattern-match, the artifact builds a URL or command at runtime — e.g. appending stolen environment-variable values as query params. Anthropic's own guidance names this directly: a malicious Skill can read env vars and exfiltrate them "via URL parameters or embedded requests" ([Anthropic Help Center](https://support.claude.com/en/articles/15927065-get-started-with-skill-and-plugin-scanning)).
- **Instructions that read innocuous to a human but different to an LLM.** [A study of malicious skills in the wild](https://arxiv.org/pdf/2602.06547) documents a dual-instruction pattern: the human-facing description looks legitimate, while a separate embedded directive — its title example: literally "do not mention this to the user" — tells the model to act and hide it. A manual read that only checks "does the stated purpose sound reasonable" misses this by design.
- **Delayed or conditional malicious behavior.** A payload activates only under specific conditions (a file present, a date, a user action), so it passes a static read and a one-off test run. Repello AI's manual-audit writeup calls this "conditional activation" — the exact gap sandbox/behavioral testing (§4) is built to catch.
- **Malicious scripts or resources bundled with and executed by a skill.** [Reversec's "Skill Issues" writeup](https://labs.reversec.com/posts/2026/05/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1) shows a Claude Code skill whose frontmatter grants broad tool permissions (`allowed-tools: Bash(*)`) plus inline command execution, letting a bundled reverse-shell run without the confirmation prompt shell access normally triggers. The risk isn't only the natural-language instructions — it's what scripts or binaries ship alongside them, and what permissions the artifact grants itself.
- **Malicious MCP server or plugin behavior.** [The `postmark-mcp` incident](https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html): a package impersonating the real Postmark MCP server ran cleanly for 15 versions, then v1.0.16 added one hidden line that BCC'd every outgoing email to an attacker — silently forwarding an estimated 3,000–15,000 emails a day for over a week. Nothing looked different at a glance; the change was one line, deep in the diff, running with full pre-granted permissions.
- **Attempts to exfiltrate credentials, source code, environment variables, or other accessible data.** The consistent end goal across most of the above. The [keyv/cacheable npm worm](https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack) (not agent-specific, but the same failure mode reaching agent tooling) targeted `.npmrc` tokens, GitHub CLI tokens, AWS credentials, Kubernetes configs. In agent-artifact terms, the same goal shows up as "read this env var, put it in a URL" or "read this file, describe its contents somewhere that gets sent externally."

## 2. The defense stack, in order

No single layer is sufficient alone:

1. **Inspect the source yourself.** Read the manifest/`SKILL.md` end to end. Inventory every bundled file — a skill with no stated need for code shouldn't ship scripts or binaries. Look for the §1 patterns: encoded blobs, dynamically built URLs, env-var/credential-shaped references, instructions that contradict or exceed the stated purpose.
2. **Use scanners — plural.** One scanner is one static/semi-static pass with known blind spots (§4). Running several, from different vendors with different detection approaches, catches more than any one alone.
3. **Cross-check signals — scanners disagree with each other (§4).** Don't take a clean result from one scanner as final. Check it against another tool, the repo's own history/context, or a manual read.
4. **Restrict the permissions granted to the artifact.** Grant only what the stated purpose actually requires. Treat any request for more as a red flag on its own (this is what the Reversec example in §1 exploited).
5. **Sandbox execution where possible.** The single highest-leverage step, and the one most often skipped for convenience. See `agent-sandboxing.md` for how — not repeated here.
6. **Prefer reputable, actively maintained sources.** Popularity and age aren't proof of safety on their own (`security-and-supply-chain.md` covers why — compromised-legitimate-package incidents), but a first-party or well-established maintainer is still a meaningfully better starting point than an anonymous, week-old account.
7. **Treat scanner output as one piece of evidence, not a guarantee.** This is the conclusion, not a footnote — see §4 and the top of this doc.

## 3. Scanner landscape (as of August 2026)

Purpose-built scanners went from nonexistent to plentiful over 2026:

- **NVIDIA `SkillSpector`** ([`github.com/NVIDIA/SkillSpector`](https://github.com/NVIDIA/SkillSpector), Apache-2.0) — scans a local dir, single `SKILL.md`, zip, or GitHub URL directly, pre-install. Two-pass: static (regex + Python AST + taint-tracking + live OSV.dev dependency lookups) plus optional LLM semantic pass. 0–100 risk score, SARIF/JSON/markdown output. Can run *as* an MCP server exposing a `scan_skill()` tool to gate installs at runtime.
- **Snyk `agent-scan`** ([`github.com/snyk/agent-scan`](https://github.com/snyk/agent-scan), Apache-2.0) — covers skills and MCP servers in one pass, descended from Invariant Labs' MCP security research. Risk-scores prompt injection, tool poisoning, tool shadowing, toxic flows. Also runs zero-install as a browser drag-and-drop tool ([`labs.snyk.io/experiments/skill-scan`](https://labs.snyk.io/experiments/skill-scan)).
- **Cisco AI Defense `skill-scanner`** ([`github.com/cisco-ai-defense/skill-scanner`](https://github.com/cisco-ai-defense/skill-scanner), YARA + YAML rules + LLM pass) — its own docs admit "no findings ≠ no risk." No MCP coverage claimed.
- **Sentry's `skill-scanner`** — a Skill that scans Skills, bundled in [`getsentry/skills`](https://github.com/getsentry/skills). Checks permissions requested vs. actually used, plus the usual injection/exfiltration/secret categories.
- **`NMitchem/SkillScan`** — most technically interesting design: a three-stage audit/predict/test pipeline that actually runs the skill in a sandboxed microVM against honeypot canary credentials. Very small, effectively one-person project — worth reading for the canary-file technique, not worth depending on alone.

**MCP-specific drift/rug-pull detection is a separate, narrower gap.** A tool's declared behavior can change silently after you've already approved it. [`DataScience-EngineeringExperts/mcp-warden`](https://github.com/DataScience-EngineeringExperts/mcp-warden) canonicalizes an MCP server's declared tool/resource/prompt surface and pins it to a lock file, failing on drift. Small project, but the technique — hash the declared surface once, alert on any change — is simple enough to reimplement directly.

**What Anthropic itself offers.** Automatic skill/plugin scanning exists but is Enterprise-plan-only ([Anthropic Help Center](https://support.claude.com/en/articles/15927065-get-started-with-skill-and-plugin-scanning)): runs automatically on upload/edit across Claude, Claude Cowork, and Enterprise marketplaces, pass/warn/fail in 1–2 minutes. No individual/Pro/Max equivalent, no documented way to manually scan an arbitrary skill even on Enterprise.

What individuals *do* get: the community marketplace (`anthropics/claude-plugins-community`) runs automated validation/safety screening and SHA-pins each plugin to a specific commit, and the `/plugin` Discover tab shows a "Will install" pane before you commit — every command, agent, skill, hook, MCP server, and LSP server a plugin adds. Anthropic's own docs still disclaim they "can't verify that they work as intended" even for the vetted marketplace.

## 4. Why no single scanner is enough — the evidence

This section shapes how everything above should actually be used.

- **Scanners barely agree with each other.** [Ilya Kabanov's independent study](https://theweatherreport.ai/posts/skill-scanner-disagreement/) (2026-03-24) ran seven scanners (VirusTotal, Snyk, Socket, Cisco, others) across 238,180 unique skills. On the one marketplace where five scanners' coverage overlapped, they agreed on only 33 of 27,111 skills — 0.12%. Of skills flagged by at least one scanner, 72% were flagged by exactly one.
- **Static scanning is straightforwardly evadable.** HKUST researchers ([arXiv 2607.02357](https://arxiv.org/abs/2607.02357), July 2026) built `SkillCloak`: across eight scanners and 1,613 in-the-wild malicious skills, a packing technique bypassed every scanner over 90% of the time; a semantics-preserving rewrite cleared over 80% of static scanners and 96% of a hybrid static+LLM scanner. Their behavior-based counterpart, `SkillDetonate`, caught 97% of injected payloads across original, obfuscated, and packed forms — sandbox/behavioral testing meaningfully outperforms static scanning, at a real time cost.
- **Scanners also over-flag heavily without context.** Researchers from TU Wien and collaborators ([arXiv 2603.16572](https://arxiv.org/abs/2603.16572)) found marketplace scanners classify up to 46.8% of skills as malicious in isolation, but only 0.52% stay suspicious once cross-checked against the skill's own GitHub repo context (age, commit history, stars, whether the code matches the stated purpose) — roughly a 99% reduction in flagged skills.

**Synthesis:** a clean scan proves very little on its own. A dirty scan (marketplace-level automated screening) proves less than it looks like without repo context. The signal that actually discriminates well is repo-provenance context plus sandboxed behavioral testing, not static pattern-matching alone. Scanning still isn't worthless — a scan result is one input into a judgment call, not the judgment call itself.

## 5. Does the current MCP spec close any of this?

Checked directly against the [official spec](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) and the [2026-07-28 release candidate notes](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/):

- **Tool annotations exist, but the spec tells clients not to trust them.** Tools can carry optional `annotations` (destructive, read-only, idempotent). The spec is explicit: "clients **MUST** consider tool annotations to be untrusted unless they come from trusted servers" — advisory metadata a malicious server can just lie about, not a verified property.
- **Human-in-the-loop consent is a "SHOULD," not enforced.** The spec recommends implementations "SHOULD" prompt for confirmation on sensitive operations and show tool inputs before calling — guidance for client implementers, not a protocol-enforced guarantee every client honors.
- **No tool-definition signing or integrity verification in the base spec.** No cryptographic hash, version binding, or signature ties a tool's definition to what a user previously approved. The "rug pull" pattern — a server changing a tool's behavior after approval, no re-consent — isn't addressed. Fixes exist in research (e.g. [ETDI](https://arxiv.org/pdf/2506.01333), binding tool definitions to signed JWTs) but aren't in the adopted spec.
- **The 2026-07-28 RC's security changes are about authorization and audit, not artifact trust.** It hardens OAuth/OIDC flows (mix-up-attack mitigation per RFC 9207), constrains unsolicited server-to-client requests, and sandboxes server-shipped UI inside an iframe with the same consent path as a direct tool call. None of it changes whether a tool's declared behavior can be trusted or verified against tampering.

**Bottom line:** the current spec gives you a defined consent hook and an explicit "don't trust annotations blindly" rule — more than earlier versions had. It still doesn't provide signing, drift detection, or any built-in way to verify a tool hasn't changed since approval. `mcp-warden`'s hash-and-pin approach (§3) remains a client-side workaround, not something the protocol does for you.

## 6. Personal stack

This doc is the general landscape and framework, not the specific pick. Scanners actually being trialed against real candidate skills/MCP servers are tracked in [`decisions/005-skill-scanner-picks.md`](../../_architecture/plans/decisions/005-skill-scanner-picks.md) — currently NVIDIA's scanner plus Snyk's `agent-scan`, run together rather than either alone, per §4. Check that file for what's actually adopted; this one stays on the general landscape.

## Sources

- [Anthropic Help Center — Get started with skill and plugin scanning](https://support.claude.com/en/articles/15927065-get-started-with-skill-and-plugin-scanning); [Claude Code plugin discovery docs](https://code.claude.com/docs/en/discover-plugins)
- [`github.com/NVIDIA/SkillSpector`](https://github.com/NVIDIA/SkillSpector); [`github.com/snyk/agent-scan`](https://github.com/snyk/agent-scan); [Snyk skill-scan web tool](https://labs.snyk.io/experiments/skill-scan); [`github.com/cisco-ai-defense/skill-scanner`](https://github.com/cisco-ai-defense/skill-scanner); [`github.com/getsentry/skills`](https://github.com/getsentry/skills); [`github.com/NMitchem/SkillScan`](https://github.com/NMitchem/SkillScan); [`github.com/DataScience-EngineeringExperts/mcp-warden`](https://github.com/DataScience-EngineeringExperts/mcp-warden)
- Ilya Kabanov, ["Seven scanners for malicious AI agent skills agree on only 0.12%"](https://theweatherreport.ai/posts/skill-scanner-disagreement/) (theweatherreport.ai, 2026-03-24)
- HKUST et al., ["Cloak and Detonate: Scanner Evasion and Dynamic Detection of Agent Skill Malware"](https://arxiv.org/abs/2607.02357) (arXiv 2607.02357, July 2026)
- ["Context Matters: Repository-Aware Security Analysis of the Agent Skill Ecosystem"](https://arxiv.org/abs/2603.16572) (arXiv 2603.16572)
- ["'Do Not Mention This to the User': Detecting and Understanding Malicious Agent Skills in the Wild"](https://arxiv.org/pdf/2602.06547) (arXiv 2602.06547)
- Reversec, ["Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1"](https://labs.reversec.com/posts/2026/05/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1)
- Unit 42 (Palo Alto Networks), ["Fooling AI Agents: Web-Based Indirect Prompt Injection Observed in the Wild"](https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/)
- The Hacker News, ["First Malicious MCP Server Found Stealing Emails in Rogue Postmark-MCP Package"](https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html); [Snyk's writeup of the same incident](https://snyk.io/blog/malicious-mcp-server-on-npm-postmark-mcp-harvests-emails/)
- SlowMist, [ClawHub malicious-skills poisoning analysis](https://slowmist.medium.com/threat-intelligence-analysis-of-clawhub-malicious-skills-poisoning-0448ffd49c80)
- Wiz, [keyv and cacheable npm supply chain attack](https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack)
- Model Context Protocol, [official specification — Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools); [2026-07-28 release candidate notes](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/); ETDI proposal, [arXiv 2506.01333](https://arxiv.org/pdf/2506.01333)
- [`decisions/005-skill-scanner-picks.md`](../../_architecture/plans/decisions/005-skill-scanner-picks.md) — this project's actual scanner trial, referenced rather than duplicated here
