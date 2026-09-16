# Prompt Engineering — Writing the Actual Words That Go to the Model

New topic, added 2026-09-05 on the user's call: high-impact enough to deserve its own doc, not a footnote in something else. Every single thing anyone writes to an LLM, a chat message, a system prompt, a skill file, an `AGENTS.md`, a tool description, is a prompt. This is the one technique that applies no matter what else surrounds the model: no harness, no agent loop, no tools required. It's also the cheapest thing to improve, since it costs nothing but rewriting text.

**Status: skeleton doc.** Core mechanics below are stable, well-documented practice. The resource list and technique coverage are due a proper research pass (per this repo's convention, that pass runs through cowork, not inline) before this gets marked complete.

## What it actually covers

Getting the model to reliably produce what you actually want, on a single call, by controlling:

- **What you ask for** — the literal task instruction.
- **How you show it what "good" looks like** — examples, format constraints, tone.
- **What context you hand it** — background, constraints, prior decisions (this overlaps with context engineering; prompt engineering is the wording, context engineering is the selection — see [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md#3-context-engineering--real-gap-or-already-covered)).

## Core techniques worth knowing

- **Be explicit and specific.** "Write a good commit message" underperforms "write a commit message under 50 characters for the subject, explain why not what in the body." Vague asks get vague, average-of-training-data answers.
- **Show, don't just tell (few-shot examples).** One or two concrete examples of the input/output shape you want outperforms a paragraph of abstract instruction. Diverse examples beat exhaustive edge-case lists, per Anthropic's own context-engineering guidance.
- **Give the model a role or persona when it changes the answer shape**, not as decoration. "You are a senior security reviewer" changes what gets flagged; "you are a helpful assistant" changes nothing and is filler.
- **State the output format explicitly** if it matters (JSON, a specific heading structure, a length limit). The model will guess a reasonable default otherwise, and reasonable defaults don't match your downstream parser.
- **Structure long or multi-part prompts** with clear delimiters, Claude specifically is trained to work well with XML-style tags (`<context>`, `<task>`, `<examples>`) to separate sections a model might otherwise blur together.
- **Iterate like debugging, not guessing.** If output is wrong, change one variable (the instruction, an example, the format spec) and re-test, rather than rewriting the whole prompt and losing track of what fixed it.
- **Ask the model to reason before answering, on hard tasks.** This is where prompt engineering touches the "thinking mode" mechanism from `0-how-llms-actually-work-under-the-hood.md`, more room to work through a problem in text before committing to a final answer measurably helps on math/code/multi-step tasks.

## Where it stops being enough

Prompt engineering optimizes one call. It has nothing to say about:

- what happens *before* the prompt is assembled, curating what data/context even makes it in, that's context engineering.
- what happens *after* the model responds, running tools, retrying, checking work, that's harness and loop engineering.
- coordinating more than one agent, that's graph engineering.

A perfectly engineered prompt run through a bad harness still produces bad outcomes at the system level, and a mediocre prompt in a well-designed harness with verification loops can still land. This doc is the base layer, not the whole stack.

## Resources (pending full research pass)

- [Anthropic's own prompt engineering documentation](https://docs.claude.com) — first-party, current, covers Claude-specific behavior (XML tags, extended thinking prompts, system prompt design).
- OpenAI's prompt engineering guide — first-party equivalent for GPT-family models, useful for contrast on where techniques are model-agnostic vs. provider-specific.

**Open item:** proper resource curation (courses, practitioner write-ups, technique comparisons across providers) is logged as pending work, not done here — see the crash-course `TODO.md`.
