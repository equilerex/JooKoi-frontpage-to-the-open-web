# Backlog — logged, not yet scoped

<!-- Deliberately unordered. Pull an item into TODO.md's checklist when it gets a real slot. See AGENTS.md. -->

## AI basics 101 onboarding doc

Status: OPEN

Daily concepts, model routing, session hygiene — currently scattered across `AGENTS.md` and the dev-stack blueprint. Offered in the original research pass, never written.

## Execution-phase discipline doc

Status: OPEN

Session boundaries, state handoff, review economics, recovery from a bad step. Offered in the original research pass, never written.

## Code navigation

Status: OPEN

Flagged as genuinely wanted in every research pass, skipped every time. Nothing currently answers it.

## Personal knowledge-notes index

Status: OPEN

Knowledge files accumulate across separate repos (research notes, decisions, explorations). Want a sub-section of this site exposing them as personal notes/education/ideas instead of leaving them buried in scattered repos. Likely shape: a deterministic pull script (list of source repo paths, glob for notes, copy into `sources/`) rather than live fetch-on-request — same "curated, not crawled" pattern as the main source list, same Stage 1 ingestion-spike mechanics. Rendering ties to the "Markdown rendering" item below (`JooKoi-md-archive`).

## Markdown rendering

Status: OPEN

If this project ever needs to render Markdown content, inherit from `JooKoi-md-archive` rather than building it fresh.
