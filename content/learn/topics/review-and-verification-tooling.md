# Stage 1 — Review Discipline: Off-the-Shelf Tooling Survey

Scope: not the custom compound-review-skill pattern (already well understood — preprocessing scripts, blast-radius flagging, ticket context pulls). This covers what exists ready-made: IDE-native review features, Claude Code's own baseline, and open-source review agents worth knowing rather than rebuilding.

Not about agent execution loops — for that, see [`loop-engineering-agent-loops.md`](./loop-engineering-agent-loops.md). This doc is about reviewing/verifying code output, not the "run the agent again until done" pattern.

## 1. IDE-native / built-in features

**GitHub Copilot code review, JetBrains IDEs (including WebStorm).**
- Shipped to JetBrains and Visual Studio in September 2025, feature updates through Feb 2026 ([Sep 2025 changelog](https://github.blog/changelog/2025-09-18-copilot-code-review-now-in-jetbrains-ides-and-visual-studio/), [Feb 2026 changelog](https://github.blog/changelog/2026-02-13-new-features-and-improvements-in-github-copilot-in-jetbrains-ides-2/)).
- Invoke from the PR context menu (Copilot → Request a Review) to self-review before opening a PR. Feedback lands inline: logic, security, performance issues.
- WebStorm 2026.2 onward: Copilot is natively integrated, no separate plugin ([JetBrains blog, Jul 2026](https://blog.jetbrains.com/webstorm/2026/07/webstorm-2026-2/)). Agent Skills support is in preview inside the JetBrains Copilot plugin.
- Versus cold-start-critic: single-pass reviewer, not confirmed to run with a fresh isolated context. Sourcing describes what it flags, not its isolation guarantees. Treat as a useful first-pass catch, not a substitute for a real fresh-context critic.

**Cursor.** No distinct review feature comparable to Copilot's. 2026 coverage centers on agent/autonomous-loop capabilities instead — Background Agents on separate branches opening PRs, Cloud Agents running in parallel. Enterprise plan has an "AI Code Tracking API" (attribution/audit logging of which model wrote which line) — an audit tool, not a review tool. If self-review happens, it's folded into the agent loop, not a separate reviewer role. Sourcing here is thinner than for Copilot.

**JetBrains' own AI review tooling independent of Copilot** — nothing distinct turned up; JetBrains' 2026 AI investment in WebStorm appears to route through the Copilot integration rather than a separate native reviewer.

## 2. Claude Code's own baseline (this session's harness)

The most-documented fresh-context-critic implementation available, per [Claude Code docs](https://code.claude.com/docs/en/code-review):

- `/code-review` reviews a local diff.
- Team/Enterprise: "Code Review" runs on GitHub PRs directly, posting inline comments from "a fleet of specialized agents" checking changes against the full codebase — logic errors, security issues, broken edge cases, regressions.
- The `code-reviewer` subagent type runs with its own focused system prompt and fresh context — built around the cold-start pattern, not self-review.
- Official Code Review shipped March 2026; `/ultrareview` (cloud-based multi-agent bug hunter) shipped April 2026.

Confirms the cold-start-critic pattern is productized here, not just a DIY technique — check for it elsewhere before rebuilding it.

## 3. Open-source review agents

**PR-Agent (qodo-ai/pr-agent, formerly Codium-PR-Agent).** The clear leader by adoption: ~10.7k GitHub stars, ~1.4k forks, active maintenance. Self-hostable as a GitHub Action, provider-agnostic (Anthropic, OpenAI, Google, others behind a unified interface), triggered via slash commands (`/review`, `/describe`, `/improve`, `/ask`) on GitHub, GitLab, Bitbucket, or Azure DevOps. This is the one genuinely worth trying for a single-developer setup — real repo health, self-hostable, not locked to one model vendor, which fits the provider-independence constraint.

**CodeRabbit / Sourcery** — both commercial SaaS, not self-hosted open-source. CodeRabbit has a free tier covering private repos; Sourcery's free tier is limited to open-source projects and is more Python-refactoring-focused. Neither is open-source in the way PR-Agent is; noted for completeness, not recommended over PR-Agent for this use case.

## 4. Reusable "second opinion" / cold-start-critic implementations

One direct hit: **`pghqdev/second-opinion`** — a Claude Code plugin/skill that intercepts risky plans (migrations, auth changes, production deploys, destructive ops) via a `PreToolUse` hook, routes them to a different-lineage model (Codex, Gemini, Opencode) for adversarial review, returns `SHIP` / `REVISE` / `RECONSIDER`. Exactly the cross-provider cold-start pattern the user's own review-discipline principle calls for.

**Flagged, not recommended as-is:** 0 stars, 0 forks, 6 commits — a solo, unproven prototype. Worth reading as a working example (install script, hook mechanism, fallback-to-self-review when no external reviewer is configured), not worth adopting sight-unseen. If the pattern is wanted, building a small version directly may be more solid than depending on this unmaintained one-person repo.

No other standalone reusable cold-start-critic tool turned up. The pattern mostly lives as *guidance* (Anthropic's best-practices docs, Augment Code's "adversarial code review" writeups) rather than a mature ecosystem of ready tools. `pghqdev/second-opinion` is the only concrete implementation found, and it's early.

## What this leaves open

The gap between "IDE gives you a review button" and "a fresh, different-lineage critic reviews this" is still mostly closed by DIY — either Claude Code's built-in subagent pattern (solid, documented, in-house) or a self-built cross-provider hook similar to `second-opinion`'s approach. PR-Agent is the one mature, self-hostable, provider-agnostic option worth trying for day-to-day PR review; nothing else in the open-source space matched it on repo health.

## Sources
- [GitHub Changelog — Copilot code review in JetBrains IDEs and Visual Studio](https://github.blog/changelog/2025-09-18-copilot-code-review-now-in-jetbrains-ides-and-visual-studio/)
- [GitHub Changelog — Copilot in JetBrains IDEs, Feb 2026 update](https://github.blog/changelog/2026-02-13-new-features-and-improvements-in-github-copilot-in-jetbrains-ides-2/)
- [JetBrains blog — WebStorm 2026.2 release notes](https://blog.jetbrains.com/webstorm/2026/07/webstorm-2026-2/)
- [Claude Code Docs — Code Review](https://code.claude.com/docs/en/code-review)
- [qodo-ai/pr-agent on GitHub](https://github.com/qodo-ai/pr-agent) — star/fork counts checked directly
- [pghqdev/second-opinion on GitHub](https://github.com/pghqdev/second-opinion) — fetched directly, repo stats confirmed (0 stars/forks, 6 commits)
- General 2026 coverage of Cursor's agent/review capabilities (multiple review-aggregator sites — directional, not primary-sourced; weaker than the above)
