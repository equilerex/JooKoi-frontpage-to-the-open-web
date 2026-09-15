# 001 — Founding Context: Why This Project Exists

Session: 2026-08-22. Status: Accepted — foundational, constrains everything downstream.

- **Source:** `founding-context-dev-stack.md` Part B (Cowork research session), preserved verbatim below.

## Context

The motivation, constraints, and scope stated by the project owner before any planning began. This is primary source material, not a derivation — later decisions are constrained by it, and revising it is itself a decision worth recording.

## Decision

**There is no competitor, and treating Google as one was a category error in the original brainstorm.** The actual motivation is personal: the open web has become genuinely hard to navigate day to day, and general-purpose search has become close to unusable for this specific purpose, in your own direct experience — not as an abstract industry claim.

**This is not a business.** It's for you and close friends/local community. Free or minimal-cost, offsetting costs the way Wikipedia does if that ever becomes necessary. No monetization intent.

**The "manifesto" framing, stated with your own humor intact:** something of a reaction against the walled-garden, platform-owned model of discovery — an inversion of the old "don't be evil" framing, aimed specifically at not profiting off other people's content, and at sending users *to* original sources rather than reproducing them. That "send to sources, don't reproduce" stance is a design constraint, not just tone — it shows up directly in the discovery review's A1 four-claims test (verified URLs, persistence, action-not-answer, no-network-dependency) and A2's launcher-first argument.

**The brainstorm document is explicitly not a definitive plan.** It's Gemini-generated scratch material you hadn't fully read yourself, offered with the instruction to treat it skeptically and to actually define requirements, not transcribe them. Its job in the repo is raw material for `product-concept.md`, sitting behind `decisions/000-discovery.md` (the critique of it), not a spec to implement against.

**Scope for now:** a smaller curated set, client-side filtering only, no server-side search yet. Both the index/directory and the query/search-router feature are wanted together — the router is not a stretch feature, though which one is the actual MVP center of gravity was still open at the time of the original prompt and was resolved in `discovery-phase-review.md` §A2 (launcher-first).

**Named as future scope, not now:** dedicated news exploration, feed reading, multi-tab open-and-browse patterns. Explicitly deferred, not forgotten — worth a line in `.agents/context/gotchas.md` or a "not yet" section of the product-concept file so a future planning pass doesn't have to rediscover that these were considered and consciously parked.

**Design exploration is deliberately sequenced after planning, not before.** You corrected me mid-session for jumping into implementation-level design-token discussion prematurely — the instruction stands: design skill selection and UX exploration happen during Stage 2 (product exploration on real data) and Stage 4 (MVP definition) of `discovery-phase-review.md` §B, not before the stack and the data exist.


## Consequences

- "Send users to sources, don't reproduce them" is a hard design constraint, surfacing in the four-claims test and the launcher-first MVP call (see `000-discovery.md`).
- No monetization means no analytics/growth tooling and no production-readiness ceremony during prototyping.
- News exploration, feed reading, and multi-tab browse patterns are parked, not forgotten — see the "Not yet" section of `product-concept.md`.
