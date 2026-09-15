# Front Page to the Open Web — Discovery Phase

Session: 2026-08-22. Status: Reference — critical review and proposed development system, superseded piecemeal by later decisions in this same `plans/` folder.

## Context

**Critical concept review + proposed AI-assisted development system**
Prepared August 2026. Tooling claims verified against current sources (links at the end).

Recovered 2026-08-23 from the original Cowork session (the user's phone-started session, not reachable from this desktop environment) via a user-supplied context handoff — this file was lost in the original repo-split porting pass. See `JooKoi-developer-stack/planning/decisions/004-cross-repo-consolidation-plan.md` for the recovery story.

---

# A. Critical review of the project concept

I'm skipping everything I agree with. These are the points where I think the document is wrong, unresolved, or missing something.

## A1. The document never confronts its actual competitor

The concept positions itself against Google. Google is not the competitor. The competitor is **typing "what are the best sites for learning CSS layout" into an LLM and getting ten annotated links in four seconds.**

That is the same job — "where should I look for this" — done by something the user already has open, with no maintenance burden and infinite coverage. The document was written as if 2015-era search were the baseline. It isn't.

If you can't answer *"why not just ask a model?"* in one sentence, the project is a nostalgia exercise. I think there are four defensible answers, and they should become design constraints rather than afterthoughts:

1. **The URLs are real.** Every entry has been fetched, verified, and re-verified on a schedule. Models still confidently produce plausible-but-dead links. Verification is the product's hard edge, not a maintenance chore.
2. **It's yours and it persists.** A model's answer evaporates. A curated set accumulates, gets refined, and reflects taste developed over years.
3. **It's an action, not an answer.** The output isn't prose describing MDN — it's a link that runs *your query* against MDN's own search. Zero latency, no reading, no summarizing.
4. **It runs with no network dependency and no data leaving the browser.** That matters for the local/sensitive use case in §21 and it's a real differentiator against every AI product.

Everything that doesn't serve one of those four should be suspect. Notably, "rich AI-generated descriptions" (§8) mostly *doesn't* — an LLM can generate that description on demand, better and fresher. The description isn't the moat. Verification, taste, and routing are.

**Recommendation:** add a "why this exists" section to the concept doc with those four claims, and treat them as acceptance criteria for MVP features.

## A2. You have the MVP inverted. The search launcher is the product.

The document treats the directory as the core (§5) and the search launcher (§13, §14) as an important-but-secondary feature. I think that's backwards, for reasons that are practical rather than aesthetic:

- **Frequency.** A browsable directory is a once-a-month artifact. A query box you use instead of Google is a daily habit. Habit is the only thing that makes a personal front page actually become your front page. Nothing else in the concept creates daily use.
- **Motivation.** Curation is a chore that decays. If the only reason to add a source is "the directory should be complete," you will stop within a month. If the reason is "I want `!mdn` to work," every addition pays you back immediately. **The launcher makes the dataset self-motivating.** This is the single biggest risk mitigation available to a solo curation project.
- **Uniqueness.** Directory = a crowded, dead category. A personal, verified, mobile-friendly, offline-capable query router across a few hundred sites you chose — nobody ships that.
- **Cost.** It needs almost no metadata. Name, URL, search template, tags. The 40-field record in §6 is not required to make it useful.

The browse/category experience then becomes the *discovery surface for the launcher* ("what can I even route to?") rather than the main event. Same dataset, different emphasis, dramatically different MVP.

**Concretely, three things the document misses that follow from this:**

- **Bangs.** DuckDuckGo-style `!mdn angular signals`, `!hn`, `!gh`. This is a fifteen-year-proven UX for exactly this problem, it's pure client-side string substitution, and it turns your dataset into muscle memory. Ten lines of code.
- **Browser search-engine registration.** A static site can register itself as a browser search keyword via an OpenSearch description document, so `fp <query>` in the address bar goes to your app. This is the mechanism by which the thing actually becomes a front page, and it costs one XML file. Its absence from the concept is the clearest missed opportunity in the document.
- **OpenSearch autodiscovery, in reverse.** Many sites still publish `/opensearch.xml` declaring their own search URL template. That means a large chunk of §13's data acquisition problem is a *deterministic fetch*, not an AI task. Check for the descriptor first; fall back to a model guessing at query parameters only when it's absent.

## A3. "Trusted" is the wrong word and is doing too much work

§4.1, §15 and §32 pull in three directions: trust as *personal endorsement*, trust as *institutional credibility*, and trust as *editorial gatekeeping for community contributions*. §15 correctly notices that a single trust score is misleading, then proposes eight descriptive dimensions — which is a research project, not an MVP field set.

Two tiers, honestly named, is enough: **picked** (I read it, I vouch for it) and **found** (it exists, unreviewed). "Trusted" implies a claim about truthfulness you explicitly disclaim in §4.1 and will spend the rest of the project's life explaining.

Of §15's dimensions, only three are things you'd ever *filter* on: source type, independence (independent / corporate / institutional / community), and access (open / paywalled / login). Encode those three. Drop the rest until a real query needs them.

## A4. Single-user vs. public project is an unresolved contradiction with real design consequences

The document simultaneously wants a *personal* front page (§3.3, §29, §31), a *public* curated directory with community contributions and governance (§32), and a *forkable open dataset* (§34). These have opposing pressures: personal means opinionated, small, and no process; public means coverage, neutrality, submission workflow, moderation, and trust semantics you have to defend.

Resolve it now, in one direction: **build it single-user and personal.** Put the data in git as plain files. Publish the repo. Forkability and contributions then come free as a *side effect* of the storage format, and you never build governance machinery for contributors who don't exist yet. If someone opens a PR, you review it like any PR. That's the whole system.

This resolution kills a surprising amount of complexity: no moderation design, no submission UI, no trust arbitration, no abuse handling, no rate limits (§33).

## A5. The maintenance economics are the actual existential risk, and they're unaddressed

Directories didn't die of deep taxonomies. They died because curation cost grew linearly with entries while value grew slower, and the humans stopped. §38 notices decay; nothing in the document *budgets* for it.

Make it an explicit design target: **500 sources maintainable in under an hour a month.** That single number kills several ideas outright (rich hand-written descriptions on every entry, multi-dimensional trust scoring, deep taxonomy) and promotes others (automated verification, machine-observed metadata, aggressive tolerance of thin entries).

Design for decay from day one:
- A dead-link/ownership-change detector running on a schedule is not a "later" feature. It's the thing that distinguishes you from every abandoned directory.
- Add a "last confirmed by a human" separate from "last reachable by a script." Only the former should ever be needed manually.
- Accept that entries rot, and show it: a visibly stale entry is more honest and more useful than a silently wrong one.

## A6. Split the data model by *who writes it and how often it changes*

§6 lists ~30 fields; §7 correctly worries about metadata churn causing noisy diffs. The fix isn't discipline, it's file layout. Two clocks, two files:

- **Editorial / human-authored** (`sources/*.yaml` or `.md`): name, URL, why-it-matters note, tags, tier, type, independence, related sources. Changes rarely. Diffs are meaningful. This is the file a contributor edits.
- **Machine-observed** (`data/observed.json`, generated, never hand-edited, possibly gitignored or committed as a single blob): HTTP status, redirect target, title hash, RSS autodiscovery result, OpenSearch descriptor, `X-Frame-Options`/CSP frame-ancestors, robots.txt directives, last reachable timestamp.

This makes §7's "routine verification should not cause unnecessary content diffs" structurally true instead of a rule someone has to remember. It also makes the split between "what a script can determine" and "what needs judgment" explicit, which is exactly the distinction your whole tooling philosophy is built on.

## A7. The one field that matters most isn't in the list

Every field in §6 is factual. None of them is **"why I picked this and where it's weak."**

> *MDN — the reference. Not a tutorial; go to web.dev for that. Best-in-class for anything spec-adjacent.*

That single line is the thing an LLM cannot fabricate credibly, the thing a scraper can't derive, and the thing that makes a directory feel curated rather than generated. It's also the only content on the page a reader actually reads. Make it required for the picked tier and skip descriptions entirely for the found tier — the site's own meta description is fine there.

Corollary: **do not use AI to write these.** Use AI for classification, extraction, and verification. Use yourself for the opinion. If you outsource the opinion, you've built a slower LLM.

## A8. Categories: don't build a taxonomy at all

§10 wants browsability, §11 warns against thin categories. At 300–500 sources both cannot be satisfied by a tree — any tree will be mostly thin. The resolution is to stop treating categories as structure:

**Categories are curated queries.** A category is a name, a description, an ordering, and a filter expression over tags. "Frontend Reference" is a saved query, not a folder. Consequences: a source is in as many categories as match, categories can be added and deleted freely with zero data migration, thin categories simply don't get created, and §35's vertical directories are the same mechanism rather than a new feature.

This is worth deciding before implementation because it changes the data model — but it is not worth deciding before you've hand-entered 30 real sources and looked at what naturally clusters.

## A9. Logos break two of your own principles

§18 wants third-party logos/favicons. Hotlinking favicons (especially via Google's favicon service) leaks the user's browsing to third parties, breaks §21's "no network request unless necessary," and produces visually inconsistent 16px mush on a mobile card grid.

Default to generated monogram tiles (first letter + deterministic color from the domain hash) with an optional, off-by-default logo mode. Cheaper, prettier, consistent, and principle-compliant. This is a small decision that quietly saves a lot of design thrash.

## A10. Smaller notes

- **Search-template rot is worse than dead links.** A stale template sends the user to a 404 *with their query in it* — actively worse than nothing. Verification must include running each template with a canary query and asserting the response is a 200 that contains the term. Deterministic script, no AI.
- **Personal state needs an escape hatch.** localStorage gets cleared. Any personalization (§31) needs export/import to a file or a URL fragment from the first version, or the "personal" layer is a trap. Still zero backend.
- **`§27 OpenWebSearch.eu is not usable yet.`** Verified: the pipeline runs at ~1 TiB/day but download facilities are not yet available to third parties. Treat as a watch item, not a dependency. **Marginalia, by contrast, has a working API today** with free non-commercial keys (CC-BY-NC-SA) — that's a realistic near-term discovery source and a far better fit for "the small, old and weird web" than Common Crawl.
- **§30 local utilities is a different product.** Keep it out. But note it's an excellent *tooling* sandbox later, and it shares the local-only story.
- **Naming.** "Front Page to the Open Web" is descriptive but long, unbrandable, and unsayable as a URL bar keyword. If bangs and search-keyword registration matter (A2), you need a short token. Worth resolving early since it becomes the keyword you type daily.

## A11. Deliberately leave unresolved

Do not decide these yet; they're the things prototypes should answer:
homepage density and whether the default view is a query box or a grid · how picked and found tiers coexist visually · whether search results are sources or a mixed list of sources and direct-search actions · mobile navigation model · whether categories are visible at all on first load · framework choice.

---

# B. Development approach — the stages

The ordering below is opinionated in two places, and both matter more than the tool choices further down.

**Opinion 1: data before app.** Hand-enter 30–50 real sources, with AI help, before writing any application code. For a directory product, prototyping UI against fake data is the classic fatal mistake — density, tag distribution, description length, and how thin the categories really are all only become visible with real entries. Those are exactly the unknowns in your list. Fake data will lie to you about every one of them.

**Opinion 2: prototype without a framework.** The UX questions are about density, hierarchy, and thumb reach. Angular answers none of them and adds a build step, a component model, and sunk-cost attachment to prototype code. Framework choice is a *stage 5* decision.

### Stage 0 — Repo and provider-neutral skeleton (half a day)
Git repo, `.agents/` layout, AGENTS.md, three context files, one script directory. Nothing else. Details in section C.

### Stage 1 — Ingestion spike (1–2 sessions)
Build the `source-ingest` capability *first*, because it's simultaneously the product's core workflow, the thing that reveals the schema, and the flagship example of your deterministic-vs-model split. Run it over 30–50 sites you personally use.

Output: a real dataset, a schema that emerged from reality, and a measured answer to "how long does one source take?" — which is the maintenance-economics number from A5.

### Stage 2 — Product exploration on real data (the big one)
3–5 disposable single-file HTML prototypes, each committing hard to one interaction thesis (query-box-first; dense grid; category-first; launcher-with-bangs-only; results-as-actions). Same real data in all of them. Viewed on your actual phone, not a devtools emulator.

Judge them by use, not by looking: put each on your phone for a day. The one you actually reach for wins. Then **throw the code away and keep the decisions.**

### Stage 3 — Decision capture (continuous, ~10 min each)
Short ADRs. Not ceremony — this is the persistent context layer that makes every later agent session cheaper, and it's the most provider-portable asset you'll build.

### Stage 4 — MVP definition
Now, and only now, write the spec. It should be short, because stages 1–3 already decided most of it. Anything not required by A1's four claims is out.

### Stage 5 — Architecture and stack
Framework, search library, build, hosting, data pipeline. One session. Informed by the prototype that won.

### Stage 6 — Implementation loops
Feature → agent implements → agent inspects its own output in a real browser at 390px → screenshot + a11y check → you review the *result*, not the diff. Small vertical slices.

### Stage 7 — Verification and decay tooling
Link checker, template canary, observed-metadata refresh, scheduled. Introduce when you have >50 sources and have felt the first stale entry.

### Stage ∞ — Recurring-work harvesting
Runs across all stages, and it's the actual learning objective. See section G.

---

# C. Recommended initial developer setup

The smallest thing worth having. Everything here is justified by a problem you already have, not a capability that exists.

## C1. Repository layout (essential)

```
AGENTS.md                  # ~40 lines. Source of truth. Points to everything else.
CLAUDE.md                  # 2 lines: "See @AGENTS.md"
.agents/
  context/
    principles.md          # enduring; the A1 four claims + constraints
    product-concept.md     # the brainstorming doc, trimmed
    decisions/             # ADR-lite, one file per decision
    gotchas.md             # things that bit you; grows organically
  skills/
    source-ingest/SKILL.md
  prompts/                 # ad-hoc reusable prompts, no ceremony
scripts/                   # deterministic tooling; the durable layer
sources/                   # human-authored data
data/                      # machine-generated data
```

**Why AGENTS.md as the root:** it's the closest thing to a real standard — now stewarded by the Linux Foundation's Agentic AI Foundation, supported by Codex, Cursor, Copilot, Gemini CLI, Jules, Aider, Zed, Warp and others. Provider files become thin pointers. This directly satisfies your "if Claude disappeared tomorrow" test.

**Why `.agents/skills/` with SKILL.md:** the Agent Skills format was also transferred to the AAIF (Dec 2025) with a published spec at agentskills.io, and is claimed to be adopted across 30+ tools including Codex CLI, Claude Code, Gemini CLI and Cursor. Stick to the core spec (frontmatter + markdown + optional `scripts/`, `references/`, `assets/`) and skip agent-specific frontmatter extensions — that's where portability actually breaks.

**Keep AGENTS.md brutally short.** The failure mode you named — giant instruction files injecting irrelevant context — is real and expensive. AGENTS.md should be commands, conventions, hard constraints, and *pointers*. Everything else loads on demand.

**What loads always vs. on demand:**

| Always | On demand |
|---|---|
| AGENTS.md (~40 lines) | product-concept.md |
| | decisions/ (referenced when relevant) |
| | skills (loaded by trigger) |
| | gotchas.md (pointed to from AGENTS.md, read when debugging) |

## C2. Model split (essential, zero setup cost)

Current lineup, verified: **Fable 5** ($10/$50), **Opus 5** ($5/$25), **Sonnet 5** ($2/$10), **Haiku 4.5** ($1/$5). All with 1M context except Haiku's 200k.

- **Opus 5** — concept critique, architecture, decisions, anything where being wrong is expensive.
- **Sonnet 5** — the default for implementation. It's the workhorse; using Opus for bulk coding is mostly burning money.
- **Haiku 4.5** — classification, tag normalization, extraction over N sources. This is where a routing habit actually pays.
- **Fable 5** — worth one deliberate experiment on a long-horizon task (e.g. "ingest and classify 200 sources end to end") to see whether the long-running-agent positioning is real for your workload. Don't default to it.

The habit worth building is not the routing itself — it's **noticing which tier a task belongs to before starting it.**

## C3. One MCP: Chrome DevTools MCP (essential)

`npx -y chrome-devtools-mcp@latest`. Actively maintained (49k stars, ~1.1k commits, release-please automation), ~50 tools spanning input, navigation, network, console, performance tracing.

This solves your single most concrete problem: **an agent that builds UI but can't see it.** It closes the loop — the agent renders at 390px, reads the accessibility tree, checks console errors, and iterates without you as the eyeball. That's the highest-leverage single addition to a frontend workflow available right now.

The distinction worth internalizing: **Chrome DevTools MCP is for inspecting and debugging a live page; Playwright MCP/CLI is for driving deterministic, repeatable flows.** You want the former during development and the latter in CI. Don't pick one — they're different jobs. Start with the former.

Security caveat, from the project's own docs: it opens a debugging port that any local process can connect to. Use a dedicated profile; don't browse authenticated sites in that instance.

## C4. Deterministic scripts (essential)

`scripts/probe-url.mjs` — the beating heart of the whole system and the thing that best expresses your philosophy. For a URL it deterministically returns: HTTP status, final redirect, title, RSS/Atom autodiscovery links, `/opensearch.xml` descriptor and its search template, `X-Frame-Options`/CSP frame-ancestors, robots.txt rules (including AI crawler directives), and canonical URL.

None of that needs a model. The model's job starts *after* this output, and is limited to judgment: tags, type, independence, and the one-line why-it-matters note — which you then edit.

This one script is your proof of the general principle: **push everything mechanical into deterministic code and let the model do only the part that's actually judgment.** It's also 100% portable, works at your job, and works with no AI at all.

## C5. Skipped at the start

No hooks (except possibly format-on-write), no subagents, no local models, no agent teams, no repo indexing, no doc MCP, no CI. Every one of these appears later in section E, gated on a problem.

---

# D. Experiments worth running

Ordered by learning-per-hour. These are explicitly *experiments* — run, judge, keep or discard.

**1. Deterministic-vs-model boundary, measured (highest value)**
Run `probe-url.mjs` + Haiku over 50 sources. Count how many fields came from the script vs. the model, and how many model outputs you had to correct. You will learn more about how to build AI tooling from this one measurement than from any amount of reading. It also directly answers whether §8's "AI as metadata compiler" holds up.

**2. Browser-in-the-loop UI iteration**
Give an agent the Chrome DevTools MCP and a UI task, and don't look at the screen until it says it's done. Watch how many iterations it self-corrects. This is the pattern most likely to change how you work, and the one your work environment probably won't have — which makes it a priority to understand well now.

**3. Parallel prototypes via git worktrees**
Stage 2's 3–5 prototypes are an unusually good fit for parallel agents: independent, disposable, no merge conflicts, and comparison is the point. This is the *only* multi-agent scenario I'd endorse for a solo project — parallel agents on a shared codebase mostly produce merge misery.

**4. Local model batch classification vs. Haiku**
When you have 200+ sources, run tag normalization locally and against Haiku, and diff. Current sensible local candidates by VRAM: `gpt-oss:20b` (~14GB, runs acceptably spilling to RAM), `qwen3-coder:30b` (~19GB, 256K context) for the 24–32GB tier, and small dense models like `granite4:3b` or `gemma4:e2b-it-qat` for pure classification. Note the practical constraint: a model that fits in VRAM runs several times faster than one spilling to system RAM, which matters a lot for batch jobs.
The honest expected result: local wins on cost and privacy, loses on instruction-following consistency for structured output. Find out where the line is *for your hardware* — that's a durable piece of personal knowledge, and it's exactly the knowledge that transfers to a restricted work environment.

**5. One Skill, written properly, then tested cross-provider**
Write `source-ingest` to the core Agent Skills spec, then run it under Claude Code and under one other agent (Gemini CLI or Codex CLI). Portability is claimed; verify it yourself. This single test tells you how much your "provider-agnostic" requirement actually costs.

**6. A mobile-UX reviewer subagent**
A subagent with browser access whose only job is: load at 390px, screenshot, check tap target sizes, one-handed reachability, contrast, focus order. Run it after every UI change. Worth it if you use it more than five times; if not, it becomes a prompt in `.agents/prompts/`.

**7. Marginalia as a discovery source**
Free non-commercial API key via email (CC-BY-NC-SA), plus a `public` test key for immediate experimentation. It indexes exactly the kind of small independent web your §37 wants. One afternoon; either it produces good candidates or it doesn't.

---

# E. Tools worth evaluating — prioritized shortlist

**Adopt now**
1. [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) — agent sees its own output. The single highest-leverage addition.
2. [AGENTS.md](https://agents.md/) — provider-neutral context root.
3. [Agent Skills spec](https://agentskills.io) — portable SKILL.md format, AAIF-governed.
4. Claude Code with deliberate model selection (Opus 5 / Sonnet 5 / Haiku 4.5).

**Evaluate within the first month**
5. Playwright MCP / Playwright CLI — deterministic flows and CI, once there's something stable to test. Complementary to #1, not a substitute.
6. Ollama + a small local model for batch classification (see D4).
7. One alternative agent CLI — Codex CLI or Gemini CLI — used purely to test skill/context portability. Gemini CLI is the more relevant one given your work environment.
8. [Marginalia API](https://about.marginalia-search.com/article/api/) — discovery source for the independent web.
9. `axe-core` invoked from your own Playwright script — I'd take this over the various a11y MCP servers, which are mostly small single-maintainer wrappers around axe. You get the same result, deterministically, with no dependency, and it runs in CI. This is a case where the MCP is strictly worse than a script.

**Watch, don't adopt**
10. [OpenWebSearch.eu / Open Web Index](https://openwebsearch.eu/the-project/status/) — real pipeline (~1 TiB/day, CIFF format) but no third-party download facility yet. Check back in six months.
11. Design/prototyping agents (Claude Design and similar) — potentially useful at Stage 2, but your prototypes are deliberately crude and disposable; a polished-mockup generator may actively work against "commit to one thesis and test it on a phone."

**Explicitly considered and rejected for now**
- [GitHub Spec Kit](https://github.com/github/spec-kit) and spec-driven-development frameworks — designed for teams needing shared, reviewable intent. For a solo vibe-coded project it's the enterprise ceremony you said you didn't want. Your ADR-lite files cover 90% of the value at 5% of the weight.
- Context7 and documentation MCPs — you're using frameworks that are well-represented in model training plus normal web fetch. Revisit only if you hit repeated hallucinated APIs on a fast-moving library.
- Repo indexing / code-search MCPs — your repo will be small. Grep genuinely beats a vector index at this scale, and will for a long time.
- Model routers (LiteLLM, OpenRouter, claude-code-router) — real value, but only once you're routinely running two or more providers in anger. Premature now; obvious later.

---

# F. Defer or avoid

| Thing | Why not now | Trigger to revisit |
|---|---|---|
| Multi-agent orchestration frameworks | 20 moving parts to build a component | Never, for this project |
| Vector DB / RAG over your own repo | Repo is small; grep wins | >50k LOC |
| Docker / containerized dev env | Contradicts your portability preference | Only if a tool demands it |
| Crawling infrastructure | MVP doesn't need it; huge scope | After 300 sources and proven use |
| Common Crawl | Enormous, awkward, poor precision for this | Probably never; Marginalia is a better fit |
| Accounts / sync backend | Kills the zero-backend story | Not in MVP; export/import instead |
| Angular Material | Heavy for a card grid, and you'd learn less a11y | If you need complex widgets (menus, dialogs) |
| Hosted AI inference in the product | Breaks the local-only promise outright | Never, in the core |
| CI beyond link-checking | Nothing to protect yet | When something breaks twice |

---

# G. Likely evolution — what should trigger new tooling

The rule I'd hold you to: **three occurrences, then encode.** Not two, not once. And always the smallest form that removes the friction:

*prompt → markdown procedure → Skill → script → subagent → hook → MCP → service.*

Only move rightward when the current form has demonstrably failed.

| Recurring friction | Correct response | Wrong response |
|---|---|---|
| "Analyze this URL and propose an entry" (3rd time) | Skill + probe script | An ingestion web app |
| "Check this on mobile" (5th time) | Subagent with browser | A visual regression SaaS |
| "Fix the formatting again" (2nd time) | Format-on-write hook | A linting agent |
| "Are any links dead?" (2nd time) | Script + scheduled GitHub Action | A monitoring service |
| "Normalize these tags" over 200 rows | Local model batch job | Frontier model per row |
| "What did we decide about X?" (2nd time) | An ADR file | A knowledge-base MCP |
| Same instruction to 3 different agents | Move it into AGENTS.md | Three provider files |

**The portability test, applied continuously:** every time you build something, ask which layer it lands in — data, script, markdown procedure, skill, or provider-specific execution. The first four are yours forever and work at your job. The last one is rented. Keep the ratio honest, and you'll pass the "if Claude disappeared" test without ever doing a migration.

**Reusability triage.** When something works, sort it immediately into: *this repo only* / *personal skills collection* / *project template* / *work-safe*. Do it at the moment of creation — retroactive sorting never happens. The work-safe subset (scripts, AGENTS.md conventions, prompts, ADR habits) is the highest-value output of this entire experiment, because it's the part that changes your day job.

---

# H. Immediate next actions

1. **Answer A1 in writing, in five sentences.** Why this beats asking a model. If you can't, stop and reconsider the project — this is a genuine gate, not a formality.
2. **Decide A2:** is the query launcher the MVP, or the directory? Everything downstream depends on it. My strong recommendation is the launcher.
3. **Create the repo skeleton** (C1) with AGENTS.md and three context files. Half a day. Move the brainstorming doc into `.agents/context/product-concept.md` and this review into `.agents/context/decisions/000-discovery.md`.
4. **Write `scripts/probe-url.mjs`** (C4) and run it against 20 sites you use daily. Note what it gets right, what it can't determine, and where you disagree.
5. **Write the `source-ingest` skill** on top of it, and ingest 30–50 real sources. Time yourself. That number is your maintenance budget from A5.
6. **Then, and only then**, start Stage 2 prototypes on real data.

Do not write application code before step 6.

---

## Sources

- [AGENTS.md](https://agents.md/) · [Agent Skills open standard overview](https://codex.danielvaughan.com/2026/05/05/agent-skills-open-standard-portable-skills-codex-cli-cross-agent/)
- [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) · [Playwright vs Chrome DevTools MCP — driving vs debugging](https://stevekinney.com/writing/driving-vs-debugging-the-browser)
- [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Best Ollama models by VRAM, Aug 2026](https://www.morphllm.com/best-ollama-models)
- [OpenWebSearch.eu status](https://openwebsearch.eu/the-project/status/) · [Marginalia API](https://about.marginalia-search.com/article/api/)
- [a11y-mcp](https://github.com/priyankark/a11y-mcp) · [Angular roadmap](https://angular.dev/roadmap)
