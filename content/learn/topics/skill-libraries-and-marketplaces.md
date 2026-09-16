# Stage 1 — Prompt & Skill Libraries (Stage 0 topic #2)

An AI coding assistant is like a new hire who's smart but doesn't know your habits yet. A "skill" is a laminated instruction card for a recurring job — hand it over once, get the same result every time instead of re-explaining. A "library" or "marketplace" is a shelf of cards other people wrote, so you can grab one instead of writing your own. Useful if you use an assistant regularly and keep retyping the same instructions. Skip if you only ask one-off questions.

Survey, not a pick. Covers what a skill is, current `SKILL.md` spec, authoring anti-patterns, distribution, and what's broadly adopted. Nothing here is adopted by this stage — read and choose.

## 1. Skill basics

**What is it?** A packaged, reusable set of instructions (and optionally code) an agent loads on demand for a specific kind of task. Save it once, invoke it by name whenever the task matches.

**What's inside?** A folder with a `SKILL.md`:
- YAML frontmatter — at minimum a `description` (what it does, when to use it). `name` is optional, defaults to the folder name.
- Markdown body — the instructions.
- Optionally: reference docs, example collections, a `scripts/` folder.

Minimal working example:

```yaml
---
description: Stage changes and write a Conventional Commits message. Use when the user asks to commit or wants a commit message written from the diff.
---

Stage the relevant changes, then write a commit message in Conventional Commits
format (type(scope): summary). Keep the subject under 50 characters.
```

That's a complete skill.

**Skill vs. prompt.** A prompt is one-off — typed, used, gone. A skill is reusable and *discoverable*: named, and its `description` tells the agent when it applies, so it surfaces on future matching tasks without you re-explaining.

**Skill vs. `AGENTS.md`/`CLAUDE.md`.** A base instruction file loads in full, every session, regardless of task. A skill's full body loads only when relevant — only its `description` sits in context at session start. This is **progressive disclosure**: dozens of skills can exist without bloating every session.

**How does the agent know when to use one?** By matching the task against each skill's `description`. This is the actual retrieval mechanism, not decoration. "Helps with commits" competes poorly against "stage changes and write a Conventional Commits message from the diff; use when asked to commit."

**Explicit invocation:** yes. Skills double as slash commands — `/skill-name` runs it directly, bypassing the agent's own judgment.

**Where do they live (Claude Code)?** Per [its docs](https://code.claude.com/docs/en/skills):
- Personal/global: `~/.claude/skills/<skill-name>/SKILL.md` (every project)
- Project-specific: `.claude/skills/<skill-name>/SKILL.md` (shared via version control)

Format is an open standard — [Agent Skills](https://agentskills.io) — so the same `SKILL.md` shape works across multiple tools.

**Simple vs. complex.** As simple as the one-file example above. As complex as a `SKILL.md` overview linking out to `reference.md`, `examples.md`, a `scripts/` folder — each loaded only when needed, keeping the always-in-context part tiny.

**What are scripts/resources for?** Two jobs: (1) offload fragile/deterministic logic to real code instead of prose the model re-derives every time, (2) keep large reference material off-context until actually read.

**Compound/workflow skills.** Some orchestrate a multi-step procedure or delegate to a subagent or other skills — still just `SKILL.md` files, complexity lives in the instructions and bundled scripts.

**When to write one?** When a specific need actually repeats — not because a marketplace listing looks useful. Trigger: you've typed the same instruction three times, or a section of your base instruction file has grown into a multi-step procedure.

**Can AI write one for you?** Yes — Anthropic ships `skill-creator` in [`anthropics/skills`](https://github.com/anthropics/skills), scaffolds a `SKILL.md`, tightens the `description`, helps write eval scenarios. Reading its source doubles as a format example.

## 2. Less is more

Every installed skill's `description` sits in context on every turn, even when the body never loads — a recurring token cost, and another chance the agent picks the wrong skill for an ambiguous task.

- Keep a small set you actually invoke, not a collection you might need someday.
- A precise, narrow skill beats a general one that half-fits several needs.
- Check if adapting an existing skill gets you there before writing a new one.
- Write your own when a workflow is specific enough — don't wait for someone else to publish one. A five-minute need justifies a five-line `SKILL.md`.

## 3. Current spec state

Open format: [Agent Skills](https://agentskills.io); Claude Code's extensions at [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills).

- **Frontmatter:** only `description` recommended (not strictly required — falls back to the first markdown paragraph). `name` optional. Write `description` in third person — it's injected straight into the system prompt, and inconsistent point-of-view breaks discovery.
- **Progressive disclosure:** only `name`+`description` load at session start. Full body loads when relevant or invoked directly. Referenced files load only when actually read — zero cost until touched.
- **Size discipline:** keep `SKILL.md` body under 500 lines; split into reference files beyond that. Keep reference files **one level deep** — an agent may only partially read a file referenced from another referenced file.
- **Degrees of freedom:** high freedom (prose heuristics) for judgment calls, low freedom (exact script, no deviation) for fragile/sequential operations like migrations.

## 4. Anti-patterns

Two sources converge: **build from your own repeated need, not from a marketplace browse.**

- Don't build a skill for something the model already knows or that rarely changes. Skills earn their cost loading *current* knowledge the model lacks — fast-moving APIs, your team's conventions, a fragile procedure — not re-explaining fundamentals.
- Progression ladder: direct prompt → (repeat 3x) → slash command → (too complex) → skill. Skipping straight to "download a skill for this" before hitting that threshold is the anti-pattern.
- One clear default with an escape hatch beats multiple options ("use pdfplumber... for scanned PDFs use X" beats listing five libraries).
- Scripts: handle errors explicitly, justify every numeric constant — same discipline as normal code review.
- Evaluation-first workflow: run a real task without the skill, note actual gaps, write a few eval scenarios against those gaps, *then* write minimal instructions to pass them. Skills built by imagining requirements instead of observing failures are the anti-pattern this workflow prevents.

Source: Anthropic's official best-practices doc (primary), cross-checked against a practitioner substack post on newcomer anti-patterns.

## 5. Distribution

No longer manual-copy-only:

- **Claude Code plugins** bundle skills plus optional hooks/MCP servers into one installable package, via `/plugin`.
- **Scope at install:** user-scope → `~/.claude/skills/` (every project); project-scope → `.claude/skills/` (team, via VCS).
- **Scale, mid-2026:** official Anthropic marketplace lists hundreds of plugins; community marketplaces list low thousands of skills, individual repos bundling hundreds each.

Manual copying still works for a one-off personal skill. For anything reused across machines or shared, the plugin/marketplace path is now the real option.

## 6. Recommended skills

Narrow on purpose — only one entry with clear, checkable, broad adoption. Candidate repos worth *evaluating* (not adopted) live in [`decisions/006-skill-stack-picks.md`](./decisions/006-skill-stack-picks.md).

- **[`anthropics/skills`](https://github.com/anthropics/skills)** — official Anthropic repo, 171k stars, 20.3k forks. 17 top-level skills (document processing, design/art, web artifacts, writing, dev tooling), including `skill-creator` and `frontend-design`. The one entry here with unambiguous provenance and adoption numbers — reasonable default to browse first.

Beyond it, dozens of community marketplaces exist (section 5) — evaluate like any third-party dependency: who maintains it, how recently touched, does it solve a need you actually have. Star count alone isn't an adoption signal.

## 7. Reference examples for writing a good skill

Anthropic's best-practices doc uses **`pdf-processing`** and a **BigQuery domain-organized skill** as worked examples — both demonstrate the one-level-deep reference pattern and domain-split reference files (`reference/finance.md`, `reference/sales.md`). Beyond the docs, read [`anthropics/skills/skill-creator`](https://github.com/anthropics/skills/tree/main/skill-creator) itself — a working example and a generation tool at once.

## 8. Individual skills in wide use — front-end focus

These are *libraries* (many skills), not atomic skills. Normal usage: cherry-pick a handful, don't install wholesale — section 8a names specific picks. Numbers below are from direct GitHub API checks (stars/forks/last-push), not aggregator claims.

**Chrome DevTools — adoption sits at the MCP-server layer, not the skill layer.** [`ChromeDevTools/chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) — official Google org, 48.1k stars, pushed within the last week, 27 DevTools tools (DOM inspection, network capture, performance tracing, viewport emulation). That's what front-end devs actually install. A standalone SKILL.md wrapping it isn't independently popular — marketplace-listing hits (mcpservers.org, claudeskills.info, awesomeskill.ai, mcpmarket.com) just republish the same thin wrapper. Current practice: install the MCP server, write your own thin `SKILL.md` around it if needed.

**Small-team/individual-maintained collections, ranked by repo-health signal (all confirmed live, not archived):**

- **[`MiniMax-AI/skills`](https://github.com/MiniMax-AI/skills)** — 13.4k stars, 1.1k forks, active. Dedicated `frontend-dev` skill. Backed by MiniMax (named commercial lab).
- **[`ConardLi/garden-skills`](https://github.com/ConardLi/garden-skills)** — 10.5k stars, 1.4k forks, active. Maintained by Conard Li (named practitioner). Covers web design, image generation, knowledge retrieval alongside front-end skills — broader than pure front-end.
- **[`microsoft/skills`](https://github.com/microsoft/skills)** — 2.9k stars, 333 forks, pushed within the last day (most active of this group). Official Microsoft org. Scoped to skills/MCP servers/custom agents/AGENTS.md for grounding coding agents — includes Playwright testing/visual-regression guidance (cross-ref [`review-and-verification-tooling.md`](./review-and-verification-tooling.md)).
- **[`finfin/awesome-frontend-skills`](https://github.com/finfin/awesome-frontend-skills)** — 184 stars, 24 forks. Small, but scoped exactly to this (curated, `npx skills add`, front-end only). New-but-promising: low absolute signal, scope matches directly.
- **[`colbymchenry/frontend-audit-skill`](https://github.com/colbymchenry/frontend-audit-skill)** — 19 stars, 9 forks. One person's visual-regression auditing skill (compares live renders against design PNGs) — same category as Anthropic's own worked example (section 7). Low stars, not confirmed wide adoption.

`anthropics/skills` (`web-artifacts-builder`, `frontend-design`, `webapp-testing`) is already covered in section 6 — the highest-confidence single source for front-end skills.

**Bottom line:** no thriving standalone "popular front-end skill" ecosystem separate from these collections. A handful of named orgs/practitioners (MiniMax, Conard Li, Microsoft) ship front-end skills inside broader multi-skill repos, plus a couple of small, narrowly-scoped, low-star projects. Chrome DevTools is the clearest example: real adoption sits at the MCP-server layer, skill-wrapping stays thin.

## 8a. Cherry-pick list — top individual front-end skills

Exact folder/skill names, checked against each repo's README. Install just the one skill, not the whole library.

**From [`anthropics/skills`](https://github.com/anthropics/skills)** (de facto standard):
- `frontend-design` — general front-end UI/layout generation.
- `web-artifacts-builder` — React 18 + TypeScript + Tailwind + shadcn/ui multi-component builds.
- `webapp-testing` — pairs with the above for testing.

**From [`microsoft/skills`](https://github.com/microsoft/skills)** (2.9k★, official Microsoft):
- `frontend-design-review` — the front-end-design counterpart to Anthropic's, worth comparing rather than assuming duplication.
- `frontend-ui-dark-ts` — dark-mode-aware UI patterns in TypeScript.
- `azure-microsoft-playwright-testing-ts` — Playwright-based automated browser testing.
- `react-flow-node-ts` — React Flow node/diagram UI components.
- `zustand-store-ts` — Zustand state-management patterns.

**From [`MiniMax-AI/skills`](https://github.com/MiniMax-AI/skills)** (13.4k★):
- `frontend-dev` — React/Next.js UI, animation, generative-art-asset workflows. The one relevant skill in the repo — the rest (mobile-native, PDF/DOCX/PPTX, music/voice) is out of scope here.

**From [`ConardLi/garden-skills`](https://github.com/ConardLi/garden-skills)** (10.5k★):
- `web-design-engineer` — front-end design for web pages, dashboards, prototypes, mockups. Again the one relevant skill in a mixed-purpose repo — pull this one, skip the rest.

**Design-specific, not full design systems:** `microsoft/skills/frontend-design-review` and `anthropics/skills/frontend-design` are the only two named, checkable, narrowly-scoped design-critique/generation skills found — both single-job, neither a full design-token suite. No standalone atomic repo doing only design-critique or token-enforcement at meaningful adoption exists beyond these two — a real, modest gap.

## 9. Individual atomic skills (single SKILL.md, not libraries)

"Atomic" = does one coherent job, not one trivial thing — "run a Chrome DevTools responsive-breakpoint check and report results" counts; a whole planning/testing workflow system doesn't, however good.

Genuinely standalone single-skill repos with real star-based adoption are rare. Most atomic skills live as one subfolder inside a larger collection (section 8). Where standalone repos exist, stars are mostly low-to-modest. Marketplace listings (mcpmarket.com, agensi.io) give each skill its own page and install count — but that's a self-reported metric, weaker sourcing, labeled as such below.

**Standalone single-purpose repos (confirmed via GitHub API):**
- **[`netresearch/context7-skill`](https://github.com/netresearch/context7-skill)** — wraps Context7 docs lookup as a lightweight REST call, no MCP overhead. 53 stars, 8 forks, pushed within days, not archived. Maintainer: netresearch (named German dev agency). Cleanest "one repo = one atomic skill" example found, modest adoption.
- **[`mgifford/accessibility-skills`](https://github.com/mgifford/accessibility-skills)** → `skills/color-contrast/SKILL.md` — repo is small (39 stars, 2 forks), but this subfolder specifically: a narrow WCAG contrast-check skill by Mike Gifford (named accessibility practitioner). Cite the skill, not the whole repo.
- **[`softaworks/agent-toolkit`](https://github.com/softaworks/agent-toolkit)** → `skills/commit-work/SKILL.md` — repo (2,378 stars, 221 forks) is a library, but `commit-work` (stage changes, split into logical commits, write Conventional Commits) is single-job — cite at the subfolder level.

**Marketplace-listed atomic skills — real, self-reported adoption:**
- **[`agensi.io`](https://agensi.io)`/skills/git-commit-writer`** — staged-diff → Conventional Commits message. Agensi's most-downloaded skill by their own dashboard — not independently auditable.
- **`agensi.io/skills/pr-description-writer`** — same marketplace, same caveat, PR-description generation from a diff.
- **[`mcpmarket.com`](https://mcpmarket.com)`/tools/skills/leaderboard`** — real, ranked by GitHub stars of each skill's underlying repo (confirmed, not a self-reported install count). Confirmed entries: **#1 `diagram-maker-visualizer`** (standalone SVG/HTML/Excalidraw diagrams, zero deps), plus `next-js-turbopack-optimizer`, `frontend-slides`, `react-flow-implementation`, `frontend-performance-optimizer`, `context7-documentation-lookup`, `react-performance-optimization`, `react-code-fix-linter`. <!-- VERIFY: per-entry star counts and exact ranks beyond #1 not re-confirmed against a live page render (rate-limited); existence and star-based ranking confirmed. -->

**What doesn't hold up:** even a high-profile, checkable maintainer — [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (Addy Osmani, Chrome/web-perf work, 89.1k stars, active) — ships a 24-skill collection, not an atomic skill. Reinforces section 8: at the top of the adoption curve, named practitioners ship libraries, not single skills. The atomic layer is real but stays at modest scale.

## Sources

- [`code.claude.com/docs/en/skills`](https://code.claude.com/docs/en/skills) — primary source for spec, frontmatter, locations, anti-patterns, progressive disclosure
- [`agentskills.io`](https://agentskills.io) — the open Agent Skills spec
- `aiforsystems.substack.com` post on Claude Code newcomer anti-patterns — cross-check
- [`github.com/anthropics/skills`](https://github.com/anthropics/skills) — direct fetch, confirmed stars/forks/structure
- Search aggregation across `alirezarezvani.github.io`, `agensi.io`, `hidekazu-konishi.com`, `designrevision.com`, `firecrawl.dev` — cross-checked for scale/mechanics, not independent sourcing on their own
- [`github.com/ChromeDevTools/chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) — direct API check, 48.1k stars confirmed
- [`github.com/MiniMax-AI/skills`](https://github.com/MiniMax-AI/skills), [`github.com/ConardLi/garden-skills`](https://github.com/ConardLi/garden-skills), [`github.com/microsoft/skills`](https://github.com/microsoft/skills), [`github.com/finfin/awesome-frontend-skills`](https://github.com/finfin/awesome-frontend-skills), [`github.com/colbymchenry/frontend-audit-skill`](https://github.com/colbymchenry/frontend-audit-skill) — all direct GitHub API checks
- Marketplace/SEO listing sites (`mcpservers.org`, `claudeskills.info`, `awesomeskill.ai`, `mcpmarket.com`) — surfaced in search, explicitly NOT treated as adoption-signal sources
</content>
