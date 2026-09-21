# Loop Engineering — Building Agent Loops That Actually Finish

Split out 2026-09-05 from `harness-engineering-vocabulary.md` on the user's call: a harness is the surrounding software, a loop is the specific practice of running one agent repeatedly toward a goal, and they deserve separate bite-size docs even though a loop always runs inside some harness. Recent term, possibly short-lived, possibly a lasting category, not yet settled either way.

Not about code review/verification tooling — for that, see [`review-and-verification-tooling.md`](./review-and-verification-tooling.md). This doc is about the "keep running the agent until the goal condition is met" pattern.

## What it actually is

Running the same agent in a cycle — see result, decide next step, act again — until a goal condition is met, instead of one single model call. The obvious naive version: just let the model keep going in one long session. In practice this doesn't hold up past a certain amount of work, which is the actual subject of loop engineering: not "how do you make a loop" (trivial), but "how do you make a loop that reliably finishes instead of drifting or lying about being done."

## Why plain looping fails

A source frequently misattributed on this point: it's *not* Anthropic's `effective-harnesses-for-long-running-agents` article arguing that looping alone is a core capability — that article argues close to the opposite. Direct quote: "compaction isn't sufficient. Out of the box, even a frontier coding model like Opus 4.5 running on the Claude Agent SDK in a loop across multiple context windows will fall short."

Its actual proposal is a **two-agent harness**, not a single loop:

- an **Initializer Agent** — runs once, first session, sets up scaffolding
- a **Coding Agent** — runs in subsequent sessions, makes incremental progress against state that was externalized by the first agent

The state that survives between fresh context windows lives in plain files, not in the model's memory or an automatic compaction summary: a `claude-progress.txt`, git commit history, a JSON feature-completion list.

The stated reason plain loops fail isn't infrastructure, it's a specific model behavior: Claude tends to "attempt to one-shot the app" and prematurely declare completion. A loop that trusts the model's own "I'm done" is a loop that stops early on hard tasks. The fix is giving the harness an explicit, externally-checkable definition of done, so the loop can verify completion itself instead of trusting self-report.

## The actionable shape

External progress file plus explicit, machine-checkable completion criteria the agent can't talk its way past. Cheap to build, no special infrastructure needed, just discipline about where state lives.

This repo already does this at two levels without having named it: `_architecture/TODO.md`'s live checklist at the project level, and individual decision files under `_architecture/plans/decisions/` at the single-decision level. The practice predates the term; the term is just a name for something already working here.

## Open questions / weak sourcing

- Anthropic's context-engineering article and the long-running-agents article were both fetched and quoted directly during the original research pass — high confidence on the quotes above.
- A prior version of this research (from a secondary "dump" source) attributed "the agent loop as a core runtime capability" to that same Anthropic article — checked directly and found inaccurate, corrected above. Worth remembering that AI-search summaries sometimes misattribute a claim to a real source that actually argues something adjacent but different.
- Whether "loop engineering" survives as a distinct named term or gets folded back into general harness/agent design is unresolved as of this writing (2026-09).
