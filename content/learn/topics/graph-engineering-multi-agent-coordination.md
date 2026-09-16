# Graph Engineering — Multi-Agent Coordination and Knowledge Graphs

Surfaced 2026-09-05, from a review of doc 0's terminology. Distinct from [`harness-engineering-vocabulary.md`](./harness-engineering-vocabulary.md) on purpose: a harness is the software wrapped around one model call (tools, memory, retries), and a loop is one agent repeating that call toward a goal. Graph engineering sits a level above both — it coordinates multiple agents or loops, or structures data as an explicit network — and works the same whether the agents underneath run on a heavy harness, a thin one, or none at all. It doesn't need a harness to exist as a concept, which is why it doesn't live inside that doc.

Two distinct things travel under the same name, worth keeping separate:

## 1. Agent coordination graphs (execution graphs)

Nodes are agents or deterministic code steps (a Planner, a Researcher, an Evaluator). Edges are the routing between them: sequential, conditional, or parallel. A shared state object travels along the edges and gets read/modified by each node as work passes through.

Example shape: route a prompt to a Researcher node, pass its output to a Skeptic node for review, use a conditional edge to either loop back for more research or advance to a Synthesizer node for final output. Making the routing explicit stops agents from looping without structure or silently dropping context between handoffs.

[LangGraph](https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph) is the named framework here, and the one part of this concept with an actual checkable source (LangChain's own blog, not just secondary write-ups). This is the same shape as this repo's own fork-dispatch-and-merge pattern described in [`subagents-and-delegation.md`](./subagents-and-delegation.md): a primary agent dispatches bounded work to specialized agents and integrates their results. LangGraph formalizes that as an explicit graph instead of an implicit one baked into the conversation flow.

## 2. Knowledge / retrieval graphs

A different sense of the same term: storing information as explicit typed relationships instead of flat text chunked for similarity search.

| Vector RAG | Knowledge graph |
|---|---|
| Finds semantically similar passages | Traverses explicit, typed relationships |
| Good for single-document answers | Good for multi-hop questions across scattered facts |
| Cheaper, faster for one-off queries | More expensive to build and maintain |

GraphRAG fuses the two: a model browses a structured graph to synthesize answers that need linking multiple disparate facts, not just retrieving one similar passage.

This sense connects to [`dev-scoped-second-brain-rag.md`](./dev-scoped-second-brain-rag.md), which currently covers only vector RAG over a personal codebase/notes. The graph-based alternative isn't covered there yet — worth a follow-up pass if that doc gets revisited.

## Why it's getting named now

As multi-agent setups scale, an ad hoc chain of prompts and loose tool calls gets hard to reason about: which agent is allowed to do what, where authority transitions happen, what happens on failure. An explicit graph makes those trust boundaries and failure paths visible artifacts instead of something buried in a long conversation transcript.

## Sourcing note, flagged per this repo's evidence bar

"Graph engineering" as a named discipline is a viral mid-2026 term, and most write-ups describing it (blog aggregators, X posts, YouTube explainers) don't meet the checkable-source bar on their own. LangGraph itself is real and checkable — an actual framework with real docs and adoption. The broader "prompt → context → harness → loop → graph" stack framing some sources attach to it is a labeled new-but-promising exception, not an established consensus term. Treat the framework as solid, the taxonomy around it as provisional. No pick made here — this is a definitions/orientation doc, not a recommendation to adopt LangGraph or any specific graph framework.
