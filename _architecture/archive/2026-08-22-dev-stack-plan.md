# 002 — Dev Stack Plan: Three Layers, Repo Name, Build Sequence

Session: 2026-08-22. Status: Accepted — the dev-stack layer of this is now built separately in `JooKoi-developer-stack`; this file's build-sequence section (Part 2) still governs this repo's own stages.

## Context

- **Source:** `jookoi-dev-stack-plan.md` (Cowork research session), preserved below in full.

---

# JooKoi Dev Stack — Synthesis, Repo Naming, and Implementation Plan

**`00-START-HERE.md` is the actual entry point now** — it has the full file index, what's settled vs. still open, and the three physical next steps. This document is one of the eight it points to: the folder structure, the build sequence, and the repo-naming decision specifically.

Seven documents now exist, not five — the two below were missing from the original count and that was a real gap, not a stylistic omission:

| Document                                | Use it when                                                                                                                                                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontpagetotheopenwebbrainstorming.md` | The original uploaded (Gemini-generated) product-concept scratch material. Primary source, not a plan — raw input to `discovery-phase-review.md`'s critique.                                                                                                                                         |
| `founding-context-dev-stack.md`         | **The actual primary source for everything else in this set.** Your own stated values, hard constraints, and project motivation, in first person, preserved separately from my derived research. Read this before any of the below if you want to check my synthesis against what you actually said. |
| `discovery-phase-review.md`             | You want the critique of the _product_ concept — why the launcher beats the directory, the four-claims test for "why not just ask a model," the repo skeleton this plan is built from                                                                                                                |
| `personal-ai-dev-stack-blueprint.md`    | You want the _evidence_ behind a stack decision — why chezmoi not Stow, why short sessions, the work-vs-home transfer table                                                                                                                                                                          |
| `planning-before-implementation.md`     | You're about to plan a real feature and want the elicitation/decomposition/critique method                                                                                                                                                                                                           |
| `staying-current-ai-dev-2026.md`        | Quarterly — refresh who/what to follow                                                                                                                                                                                                                                                               |
| **This document**                       | You want to know what to actually create, in what order, under what name                                                                                                                                                                                                                             |

Nothing below is new research. It's extraction and sequencing of decisions already made in the other six — but the two source documents above are the ones worth checking my sequencing _against_, since everything else here is my derived interpretation of them, not a transcript.

---

## Part 0 — Repo name: decided

`JooKoi.com` is the actual brand — your public-facing engineering hub, home for published work generally, with room for this and future projects to live as subdomains or sections under it. That reframes what this repo's name needs to do: it doesn't need to _carry_ the brand (JooKoi already does that), it needs to be **descriptive enough to identify the project at a glance, on a shelf next to whatever else ends up under the same domain, without locking in a title or slogan you might still want to change.**

Your own `JooKoi-frontpage-to-the-open-web` already satisfies that better than a clever metaphor name would — a metaphor (lighthouse, stoop, wayfinder) reads well once but tells you nothing about the project from the repo list six months from now when there are four other `jookoi-*` repos next to it. Descriptive-but-plain is the right call for an entry in a personal hub, not a standalone product.

**Decided:** repo = `JooKoi-frontpage-to-the-open-web`. The in-app title/slogan stays open — nothing here locks you into calling it "Guide to the Open Web" in the UI; that's a Stage 2/4 decision (product exploration, then MVP spec), same as the rest of the naming/voice work. The bang/search-keyword question from A10 ("Front Page to the Open Web... unsayable as a URL bar keyword") is still open and worth answering separately — it doesn't have to match the repo name, only the thing you'll actually type daily. Revisit it once Stage 1's real data makes the keyword choice concrete rather than abstract.

---

## Part 1 — The three layers, concretely, right now

This is Part 1 of the blueprint and Section C of the discovery review, merged into one set of folders you can create today.

```
LAYER 1 — Personal, travels with you (home + work)
~/.agents/
  AGENTS.md              # durable preferences only — Markin's test: "is this true in every repo, every job?"
  skills/                # self-authored skills you've actually invoked in the last month
  prompts/                # ad-hoc reusable prompts
~/.agents-journal/        # dated cross-project decisions and learnings
managed by chezmoi (blueprint M4) — NOT GNU Stow, NOT symlinks on Windows

LAYER 2 — Template, materialized once per new project
A repo you'll create once (e.g. jookoi-template or just a local scaffold script) containing:
  the Layer-3 skeleton below, empty
  CI config, lint config, docs/adr scaffold, bootstrap script
This does not need to exist before the first project — extract it FROM JooKoi-frontpage-to-the-open-web
once the skeleton has proven itself, not before. Building the template first is exactly
the kind of speculative infrastructure the discovery review's "three occurrences, then
encode" rule (section G) argues against.

LAYER 3 — JooKoi-frontpage-to-the-open-web itself
AGENTS.md                  # ~40 lines, source of truth, mostly pointers, INCLUDES the build-philosophy
                            # gate from founding-context-dev-stack.md Part C (MVP-first, no scope creep,
                            # no tests without LM-iteration value, not a business)
CLAUDE.md                  # 2 lines: "See @AGENTS.md"
architecture.md             # whole-system architecture, added when there's a system to describe (Stage 5+)
TODO-LIST.md                 # outstanding work, your own tracking convention
llm-progress-complete.jsonl  # completed-work log, your own tracking convention
.agents/
  context/
    principles.md          # the A1 four-claims test + constraints, verbatim from discovery-phase-review.md §A1
    product-concept.md     # your original brainstorm doc, trimmed + Part D's parked design ideas appended
    decisions/              # ADR-lite, MADR format (blueprint M8), one file per decision
      000-discovery.md      # the discovery-phase-review.md critique itself, filed as decision zero
      001-founding-context.md
      002-dev-stack-plan.md
    gotchas.md              # grows organically, do not pre-populate
  skills/
    source-ingest/SKILL.md  # written in Stage 1, see Part 2 below
  prompts/
scripts/                    # deterministic tooling — probe-url.mjs lives here, see Part 2
sources/                    # human-authored data (editorial clock)
data/                        # machine-observed data (fast clock), possibly gitignored
features/
  <feature-name>/
    llm-context.md          # scoped context for this one feature, per your own tracking convention —
                             # not the whole repo's context, just what an agent needs for this feature
```

**The one rule that governs all three layers, stated once so it doesn't need repeating in every file:** if it's true in every repo and every job, it goes in `~/.agents/AGENTS.md`. If it's true for how this specific project starts but not what it _is_, it goes in the template, once that exists. If it's specific to this product's decisions, it goes in `JooKoi-frontpage-to-the-open-web/AGENTS.md` and `.agents/context/decisions/`. Mixing these tiers is the "sludge" failure Markin describes in the blueprint (§1.3) — half too generic, half too local, and every turn pays a context tax for it.

---

## Part 2 — What actually gets built, in order

This merges Section B (stages) and Section H (immediate actions) of the discovery review with Part 9 of the blueprint (personal-layer setup) and the Part 7 workflow of the planning doc (how to plan the parts that need planning). One sequence, not three.

**Before any of this: the two decisions that gate everything downstream.**

1. Answer A1 in five sentences — why this beats asking a model. This is a real gate, not a formality; if you can't answer it, the rest of this plan isn't worth running yet.
2. Decide A2 — launcher-first or directory-first. Recommendation stands: launcher. Everything in Part 1's skeleton assumes this answer; revisit it if you land differently — it doesn't affect the repo name, which is decided, but it does affect what the skeleton's early files should emphasize.

**Hour 0–1 — free, zero tooling, do this regardless of anything else** _(blueprint Part 9, items 1–3)_
Question-framing as default phrasing, one unit of work per session, `/clear` aggressively. These are habits, not files — they don't belong in the repo skeleton, they belong in how you use whatever session you're in from today onward, including the one that builds everything below.

**Hour 1–4 — the personal layer** _(blueprint M4, Part 9 items 4–6)_
`~/.agents/` with `AGENTS.md`, `skills/`, `prompts/`. chezmoi over the top, templated for work/personal divergence. This is not `JooKoi-frontpage-to-the-open-web`-specific and should exist independent of this or any other JooKoi project — do it first because everything else inherits from it.

**Half a day — Stage 0, the repo skeleton** _(discovery review §B Stage 0, §C1, §H item 3)_
Create the Layer-3 structure from Part 1 above under the chosen repo name. Move the original brainstorm doc into `.agents/context/product-concept.md`. File `discovery-phase-review.md` itself as `.agents/context/decisions/000-discovery.md` — it already is an ADR-shaped document, it just isn't filed as one yet.

**1–2 sessions — Stage 1, the ingestion spike** _(discovery review §B Stage 1, §H items 4–5)_
Write `scripts/probe-url.mjs` (§C4 — HTTP status, redirects, RSS/OpenSearch autodiscovery, CSP headers, robots.txt — all deterministic, no model). Run it against 20 sites you use daily first, note what it can't determine. Then write the `source-ingest` skill on top and ingest 30–50 real sources, timed. That timing number is your maintenance-economics budget from A5 (target: 500 sources maintainable in under an hour a month) — you don't have a real number until you've done this.

**Stage 2 — product exploration on real data** _(discovery review §B Stage 2)_
3–5 disposable single-file HTML prototypes against the real dataset from Stage 1, each committing to one interaction thesis. This is the one place in the whole sequence where planning-before-implementation.md's Part 1 gate says _don't_ plan first — "you're still discovering the shape of the problem" is explicitly listed there as a reason to skip planning, and that's exactly Stage 2's situation. Judge on your phone, not by looking. Throw the code away, keep the decision, write it as an ADR (Stage 3).

**Continuous — ADRs** _(discovery review §B Stage 3, blueprint M8)_
MADR format, shipped same-PR as the pattern it constrains. This is the mechanism that makes every later planning session cheaper — it's the specific finding from planning-before-implementation.md Part 3 that compliance with prior decisions jumps from roughly half to near-total once written down, versus decisions the agent has to infer from code.

**One session — Stage 4/5, MVP spec and architecture** _(discovery review §B Stage 4–5)_
Write the spec now, short, because Stages 1–3 already decided most of it. This is the first point in the whole sequence where you should actually run the full seven-step workflow from `planning-before-implementation.md` Part 7 — it's a genuine multi-session, hard-to-reverse decision (framework, search library, hosting, data pipeline), which is exactly the "would you bet on one-shotting this unaided" case that document's Part 1 gate says to plan for.

**Ongoing from here — Stage 6/7** _(discovery review §B Stage 6–7)_
Feature → agent implements → agent inspects its own output via Chrome DevTools MCP at 390px → you review the result, not the diff. Link checker and decay tooling introduced when you hit >50 sources, not before — same "three occurrences, then encode" rule.

---

## Part 3 — What this plan deliberately does not do

Worth stating, because it's easy to re-introduce the exact ceremony the other documents argued against:

- **No template repo yet.** Building Layer 2 before Layer 3 has proven itself is speculative infrastructure. Extract it from `JooKoi-frontpage-to-the-open-web` after the skeleton has survived contact with real work, not before — and it's the natural place to also capture whatever's shared across future JooKoi.com properties, once there's a second one to compare against.
- **No spec-driven-development pipeline.** `planning-before-implementation.md` Part 6 is explicit about this, and the discovery review independently rejects GitHub Spec Kit for the same reason (§E, "explicitly considered and rejected"). ADR-lite plus the one real planning pass at Stage 4/5 covers it.
- **No local-model batch tier, no sandboxing, no multi-agent voting.** All three are explicitly demoted or dropped in the blueprint's Part 8 retractions — carried forward here rather than re-litigated.
- **No in-app title or slogan decided.** The repo name is settled; what the UI actually calls itself is deliberately still open, per Part 0 — that's a Stage 2/4 call, not a Stage 0 one.

---

## Part 4 — Porting this out of Cowork

All seven files are plain markdown with no dependency on this session — none of this requires staying in Cowork. Where each one actually goes, by layer:

**Layer 1 (`~/.agents/`, personal, not project-specific):**

- `AGENTS.md` — already finished as a ready-to-use file, not something left for you to extract. Drop it at `~/.agents/AGENTS.md` as-is.
- `founding-context-dev-stack.md` **Part A** — the reasoning behind `AGENTS.md`'s rules, for a dated `~/.agents-journal/` entry; the rules themselves are already in file 3, this is the "why" that doesn't compress into a one-line rule.
- `personal-ai-dev-stack-blueprint.md`, `planning-before-implementation.md`, `staying-current-ai-dev-2026.md` — keep as cross-project reference material, not inside any one repo.

**Layer 3 (`JooKoi-frontpage-to-the-open-web/.agents/context/`), in the numbering from Part 1's skeleton:**

- `product-concept.md` ← `frontpagetotheopenwebbrainstorming.md`, trimmed
- `decisions/000-discovery.md` ← `discovery-phase-review.md`
- `decisions/001-founding-context.md` ← `founding-context-dev-stack.md` **Part B only**
- `AGENTS.md` (project-level, not the personal one) ← `founding-context-dev-stack.md` **Part C** — the build-philosophy gate, kept visible in the file agents actually read every session, not buried
- `product-concept.md`, appended ← `founding-context-dev-stack.md` **Part D** — parked design ideas, marked as candidate material, not decided direction
- `decisions/002-dev-stack-plan.md` ← this file

From there, Claude Code on the desktop reads `AGENTS.md`, which should point at all three `decisions/` entries plus `product-concept.md`. Once that's in place, `founding-context-dev-stack.md` itself doesn't need to persist as a standing file — it exists to make sure the Part A/Part B split above actually happens, not to be an eighth permanent document.
