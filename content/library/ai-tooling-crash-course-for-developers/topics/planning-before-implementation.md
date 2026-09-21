# Planning Before Implementation — An Evidence-Based Approach

Should a coding agent stop and explain its plan before touching files, the way a contractor sketches a plan before knocking down a wall? Doing that catches mistakes as words on a page instead of after something's broken. Useful if you direct an agent to make changes and want fewer surprises. Skip if you never do that.

## What "planning" means here

Given a task, an agent can start editing immediately, or first write a description of what it intends to do — files touched, approach, order — and have that checked before any changes happen. That written, checked description is "the plan." It's not a separate tool, just a phase of the same session: text describing intended changes instead of the changes themselves.

**What changes with a plan first:** without one, the agent acts on its first interpretation and course-corrects only when something breaks (failing test, error) or you notice mid-edit. With one, the interpretation is visible and fixable while it's still a paragraph, not a diff across ten files. Trade-off: time and tokens spent on something that isn't the deliverable.

**How planning gets triggered:**
1. You ask for it explicitly.
2. A dedicated **planning mode** many CLIs/IDEs offer — read-only exploration and drafting until you approve.
3. A **skill** that enforces planning before implementation regardless of phrasing.

**Plan when:** the change spans multiple files/subsystems, requirements are ambiguous, blast radius is high (schema change, auth flow, public API), or work spans sessions and something needs to hold shared intent between them.

**Skip planning when:** a one-line fix, a file the agent already read this session, a fast deterministic feedback loop (a failing test will just tell you), or you're still discovering the shape of the problem and a plan would lock in a guess too early.

---

A note on the evidence: most cited papers are 2025-2026 arXiv preprints, written 2-4 months before this doc. A paper measuring GPT-5-mini or Claude 4.5 in February may test a stale model by August. Two things survive that and two don't:

- **Survives:** *mechanisms* — the shape of a failure mode, why a technique works or fails. "Self-review misses semantic drift because the model sharing the blind spot produced the error" is structural, not a benchmark score.
- **Doesn't survive:** *magnitudes* — "80-point cliff," "31.7%," "3% effect." True of the specific models tested, on that date.

Read this for direction. Verify magnitude yourself if a decision hinges on it. Re-test anything numeric after a major model release.

---

# Part 1 — Should you even plan?

**Core finding, and it cuts against "always plan first":** a controlled ablation (16,991 SWE-bench trajectories, plan-removal design) found removing an upfront plan barely affected strong models but collapsed weaker ones — planning substitutes for capability more than it adds to it. A second study found planning helped only on tasks past the model's unaided ceiling; on easy tasks, imposing a plan actively hurt by constraining exploration. In the ablation, removing the plan let models solve dozens of instances the plan had been blocking.

**The real test: not "is this a big task" but "would I bet on the agent one-shotting this unaided?"**

**Skip planning when:**
- The change touches files the agent already read this session
- Fast deterministic feedback loop exists (failing test, type error, stack trace) — try-and-fix beats deliberation
- The change is cheaply reversible
- You're still discovering the shape of the problem

**Plan when:**
- Past what you'd bet the agent can one-shot
- Work spans multiple sessions, nothing else holds shared intent
- A wrong architectural choice would be expensive to discover late
- Multiple people (or future-you sessions) need to agree on scope first

**Easy to miss:** an unreviewed plan is worse than no plan. Pure cost — your time, the agent's tokens — plus false confidence, since an approved plan *feels* validated even when nobody checked it against the codebase. **Your review of the plan is the load-bearing step**, not the plan itself.

Not abstract: in the one industrial-scale randomized trial available (16 experienced developers, 246 real tasks), developers using AI tools were **19% slower** while believing they were **20% faster**. Don't trust the vibe, check the artifact.

---

# Part 2 — Elicitation: getting the requirements out of your head

### 2.1 Keep the interrogation prompt thin

A minimal interviewer prompt elicits *more* requirements and more context-adaptive questions than a heavy structured framework. The heavy prompt gives better-formed questions and a tidier summary, at the cost of exploration. **Rule: start with "ask me what you need to know to build this, one question at a time" — save checklist rigor for a second pass.**

### 2.2 Never ask the model to self-report ambiguity

When models flag ambiguity in their own understanding, detection precision sits around chance, localization is worse. An underspecified prompt doesn't produce incoherent output — the model confidently picks one plausible reading and won't tell you it guessed. Coherent output isn't evidence of correct understanding.

**Do this instead: generate divergence, look at the diff.** Ask the same question twice (different model families if you have them, higher temperature if not) and compare the *interpretations*, not the code. Disagreement is a real signal of underspecification. Agreement is weaker evidence of clarity than it feels, but still better than the model grading its own homework.

### 2.3 Use a small ambiguity taxonomy

Four categories catch most of it: missing goals, missing constraints/premises, vague terminology, structural/syntactic ambiguity. **Vague domain terminology is consistently the worst offender.** A project glossary (what do *you* mean by "trusted," "verified," "source") is probably higher-leverage than a better plan template. Write it once, keep it in persistent context.

### 2.4 Write acceptance criteria in EARS form, with real tests

EARS notation — "When \<trigger\>, the \<system\> shall \<response\>" — forces checkable statements instead of vague prose. Old requirements-engineering format, not AI-specific, but it eliminates the worst source of failure. AWS Kiro's spec workflow defaults to it for this reason.

Stronger move: **put a handful of concrete failing tests in the plan**, not just prose criteria. Test-first generation shows consistent gains, largest for messier/ambiguous tasks — exactly the tasks worth planning. Caveat: a few sharp tests beat a large suite pasted into context — dumping many tests degrades attention to the ones that matter. Two or three, not twenty.

### 2.5 What must stay yours

The agent fabricates plausible-sounding costs and effort estimates, misses privacy/scope implications a human would flag by instinct, and can't tell what a stakeholder said from what they meant. **Scope boundaries, cost/effort tradeoffs, which invariant wins when requirements conflict, and what "done" means** are yours to decide, not delegate. The agent surfaces the question; you answer it.

---

# Part 3 — Research before planning: worth it, less than the rhetoric claims

"Explore the codebase before you plan" is widely preached. The one controlled test found a real but small effect — ~3% quality improvement, not transformative. More interesting: **checking the plan against the actual repo (validation) beat reading the repo before writing the plan (discovery)** by a wide margin. And in a blinded human comparison, reviewers actually preferred the ungrounded output more often — grounding didn't obviously read as better even where it scored higher on automated metrics.

**Practical reading: don't over-invest in an elaborate research phase. Do invest in a cheap validation pass** — after drafting, check that the files/symbols/APIs the plan references actually exist and behave as assumed. Mechanical, not a research essay, and better evidenced.

**Where research genuinely earns its keep — strongest evidence in this whole area: writing down what the codebase can't tell the agent.** Compliance with product decisions and prior rulings — facts that live nowhere in the code — jumped from roughly half compliant to near-total once written into plan-time context, while decisions already visible in the code stayed near-100% either way. **Translation: spend plan-time research on product intent and prior decisions, not re-reading code the agent can already see.** This is exactly what an ADR practice is for.

If you run a research phase, run it as an isolated sub-agent returning a condensed brief (roughly a page, not a transcript), not a full exploration dump into your planning context. Just arithmetic about context budget, cheap either way.

---

# Part 4 — Decomposition: cutting the plan into executable pieces

**The one thing with real evidence: units of work need an explicit, independently-checkable output, and need to be retryable alone.** A rigid ordered task chain was *worse* than not decomposing at all when something failed partway — a downstream failure forced re-running the entire chain from the top. Decomposition allowing selective retry of just the failed unit cut recovery cost sharply vs. both the ordered-chain and no-decomposition baselines.

**Practically: don't write "step 1, step 2, step 3" where step 3 assumes step 1 and 2 succeeded in some fragile way.** Each step needs its own pass/fail condition, checkable without re-running everything before it.

**On "vertical slices vs horizontal layers"** — argued constantly as settled wisdom, but no study has actually measured the two against each other for agent execution. The one adjacent finding (retryable independent units win) happens to favor vertical slices as a rationalization — that's inference dressed as evidence. Reasonable default taste, not something to defend with a citation.

**Static plan, minimal replanning.** A plan regenerated mid-execution measurably underperforms a plan written once and executed — dynamic replanning produced action loops and lost track of what had been tried. Write once, execute against it, regenerate only on a hard failure that genuinely invalidates the approach.

---

# Part 5 — Critiquing the plan before you execute it

The two most natural moves — self-critique, multi-agent consensus — are the two with the strongest evidence *against* them.

### 5.1 Self-critique is not a gate

A model reviewing its own plan misses roughly a third of its own semantic errors on average, and the failure is bimodal — some models catch nearly everything, others almost nothing, and you don't know which regime yours is in without testing. This happens even when the model can *articulate* the exact rule it violated when asked directly — it knows the rule, doesn't apply it to its own output. **Use self-critique as a cheap first pass, never as clearance for execution.**

### 5.2 Consensus is not evidence

Multiple agents agreeing on a plan isn't a stronger signal than one agent agreeing with itself — can be weaker. Clearest demonstration: a stage-gated review pipeline once had 80-plus agents *unanimously* endorse a security vulnerability that didn't exist — only running actual code caught it. Multi-agent "debate"/"council of experts" patterns are popular and expensive, and after dozens of studies, none cleanly show it beats one strong model with the same token budget. Documented failure modes: sycophancy between agents, premature convergence on a shared wrong answer. **Don't spin up three agents to vote on a plan. Looks like rigor, isn't.**

### 5.3 What works: a cold-start critic, different model family, demanding evidence

Two things compound, both real:

- **Cross-family, not same-family.** A critic from a different model lineage, with no memory of how the plan was produced, catches things a same-family reviewer misses — training-data-correlated blind spots are shared within a family, not across. Fresh context matters as much as different vendor — don't hand the critic your original prompt or reasoning, just the artifact.
- **Force a typed verdict, not general critique.** "What do you think?" invites agreement. Requiring an explicit verdict — agree with evidence, disagree with evidence, or concern needing follow-up — measurably outperforms open-ended critique. Two agreeable agents can converge on being wrong together; forcing explicit disagreement breaks that.

**Underneath it all: nothing substitutes for something actually running.** The strongest-performing review pipeline in this research kills most of its own candidate findings, and the stage doing the real work requires runtime evidence, not critique. If a plan claims how something behaves, the question is "did we run it," not "does this sound right to a second model."

### 5.4 The premortem — real, narrower than advertised

"Imagine this plan failed — why?" The best-controlled study found it improved calibration (confidence became more accurate) but showed no significant effect on actual plan comprehension. Real, useful, cheap — just narrower than the "premortems surface 30% more failure causes" claim you'll see repeated. Don't expect it to catch what self-critique misses.

---

# Part 6 — When to say no to a heavyweight process

**Full spec-driven ceremony — constitution, spec, plan, tasks, a formal multi-artifact pipeline — is a default to be skeptical of.** The most carefully measured critique found full ceremony produced less code for more total time than a normal iterative loop, most of that extra time spent by the *human* reviewing plan artifacts, and it still shipped an undetected bug. An independent assessment across three spec-driven tools found no quantitative data supporting the approach anywhere, plus a case where the tool turned a small bug fix into over a dozen formal acceptance criteria. Supportive evidence that does exist is real but thin: an unreplicated vendor-internal number, an "up to" figure that's an explicit upper bound, a pilot its own authors call illustrative, not controlled. **What survives: agents perform better against a written, human-reviewed statement of intent. That argues for writing a plan, not for a five-stage formal pipeline.**

**Automated drift-reconciliation** — tooling that tries to keep a spec and its code in sync automatically — has no published measurement despite being flagged as the single biggest unsolved problem in this space. Reconciling two documents with an LLM inherits the same silent-confident-wrong failure mode it's meant to fix. Keep the plan and code in sync by discipline (update the plan file in the same commit that changes the approach), not automation.

**Match ceremony to the actual size of the change.** The most common self-inflicted failure: running the heavyweight process on a task that didn't warrant it — a two-file bug fix wrapped in a formal spec, review time eating the whole benefit. Back to Part 1: task size doesn't determine whether you plan. Whether you'd bet on one-shotting it does.

---

# Part 7 — A concrete workflow

**Step 0 — Gate.** Would you bet on the agent one-shotting this unaided? If yes, skip everything below.

**Step 1 — Elicit, thin-first.** Minimal interrogation prompt, not a heavy framework. Four-category taxonomy (goals, constraints, terminology, structure), extra attention to domain vocabulary against your glossary. Never ask the model if it's confident it understood — ask the same question twice, compare readings, probe divergence.

**Step 2 — Write down what the code can't tell the agent.** Product intent, prior rulings, constraints with reasons no longer visible in the code. Highest-leverage plan-time context. If it's in an ADR, reference it.

**Step 3 — Draft one static plan.** EARS-form acceptance criteria, two or three sharp failing tests, steps each with its own independent output contract, retryable alone. Skip formal spec ceremony unless the task is genuinely large and multi-person.

**Step 4 — Validate against the repo.** Do the referenced files/symbols/APIs actually exist and behave as assumed? Better evidenced than a research phase, and cheaper.

**Step 5 — Critique once, correctly.** Cold-start review, different model family, no shared context with the authoring session, forced typed verdict (agree-with-evidence / disagree-with-evidence / concern). Add a premortem if stakes justify it — sharpens calibration, doesn't catch bugs by itself. No voting, no self-critique as clearance.

**Step 6 — You review it.** Not optional, not delegable. The plan is worthless as a safety mechanism if nobody actually reads it before execution starts.

**Step 7 — Execute without replanning.** Regenerate only on a hard failure that genuinely invalidates the approach.

---

## What this doesn't cover

Execution discipline once implementation starts — session boundaries, state handoff across sessions, keeping a multi-day build aligned to the plan, review economics at scale, recovery from a bad step — is its own phase with its own evidence base, never written up here. Flagged as an open gap in the original `00-START-HERE.md` porting notes too — still open.

---

## A note on confidence

Where a finding rests on a single study, it's stated as "one study found," not settled. Where multiple independent lines converge — self-review being unreliable, consensus not being evidence, execution feedback beating static analysis — it's stated more plainly. Re-test what matters to a real decision; don't take any of this, including this document, as more certain than the research behind it actually was.
</content>
