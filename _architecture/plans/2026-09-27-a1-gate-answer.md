# A1 gate answer and A2 call

Session: 27-09-2026 16:52. Status: draft answer written, waiting on the user's own wording. Only the user can close this.

## Context

The discovery review (`2026-08-22-discovery-phase-review.md`, section H, steps 1 and 2) set two gates before application code: answer A1 ("why does this beat asking a model?") in five sentences, and decide A2 (is the launcher or the directory the MVP?). `principles.md` still says A1 "has not been answered yet". Three phases of application code later, neither gate has a written answer. The four claims exist as a list, but nobody has committed to them as the project's reason to exist, or checked them against what was built.

This matters now because the other three 27-09-2026 plans are each justified by a claim: link verification by claim 1, the data pipeline by claims 1 and 2, browser search integration by claim 3 and by A2. If the user's answer drops a claim, the plan that serves it drops with it.

## Where each claim stands today

| Claim | Delivered? | Evidence |
|---|---|---|
| 1. Verified URLs | No | `verified` is a hand-typed date. No checker exists. `2026-09-27-source-link-verification` builds it. |
| 2. Persistence | Partly | 313 curated records in git, stable and revisitable. But they sit in one TS file no editor workflow touches, and the curation step (`source-ingest`) was never built. |
| 3. Action, not answer | Mostly | Per-row Search↗ runs the query on the source's own search. Missing: reaching it without first opening the app, and routing to one named source. `2026-09-27-browser-search-integration` covers both. |
| 4. No network dependency at read time | Yes | Static prerendered build, client-side filtering, no model or API calls. |

## Draft for the user to rewrite

Five sentences, written from the review's four claims and what the repo now shows. It is a starting point to disagree with, not the answer:

> A model can tell me where to look, but it recalls URLs rather than checking them, and it gives a different answer every time I ask. JooKoi is a set of sources I chose, where every link has been fetched and checked on a date I can see. It doesn't describe those sources to me. It sends my query into their own search, from my browser's address bar, in one step. It works as a static page with no model call and nothing leaving the browser. If a feature serves none of those four things, it doesn't belong here.

## A2

The review recommended the launcher as the MVP. What got built leans that way (home is a launcher console, `/search` is the main page, browse and source detail are parked), but it was never decided explicitly. Proposed call: **the launcher is the product, the directory is its dataset.** Browse and source-detail pages stay parked until the launcher needs them.

## Build order

1. User rewrites or rejects the five sentences.
2. The final text replaces "It has not been answered yet" in `principles.md`, under the four-claims test.
3. A2 call recorded (in `principles.md` if it becomes a standing constraint, `decision-history/` if the reasoning matters more than the rule).
4. If a claim is dropped, the sibling plan that serves it is re-scoped or dropped in the same turn.

## Implementation deviations
