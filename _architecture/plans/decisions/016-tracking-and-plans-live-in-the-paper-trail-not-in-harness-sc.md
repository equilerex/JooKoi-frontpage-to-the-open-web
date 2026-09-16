# Decision 016 — Tracking and plans live in the paper trail, not in harness scratch

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Executing a plan ran a second record alongside the paper trail. The subagent-driven-development ledger at `.superpowers/sdd/<plan>/progress.md` grew to about 2,000 lines and became where decisions, status and rationale landed: rulings, adjudications, parked findings, verification results. It was read whole by the controller and by most subagents, once per task.

Two consequences:

- The repo's durable record went stale while git-ignored scratch accumulated the reasoning. Nothing in `_architecture/` said why the Phase 2 review parked its findings — the ledger did, and the ledger is deleted when the run ends.
- A log read as a decision record contradicts itself. The ledger carried two rulings on the `--png-` preset prefix that disagreed, and a reader believes the first one they find.

## Options considered

1. Keep the ledger as it was, and copy entries into the paper trail after the run.
2. Drop the ledger, and have subagents write to `_architecture/` directly as they work.
3. Keep the ledger as per-run scratch holding only dispatch order and commit SHAs, and route everything durable to the paper trail at the moment it is decided.

## Decision

Option 3. The SDD ledger is scratch for one run: task number, base commit, dispatch order, commit SHAs, fix-round count. Nothing durable stays in it.

Durable content goes where the paper trail's routing already sends it.

| Content | Destination |
| --- | --- |
| A call that was made, with reasoning | `_architecture/plans/decisions/NNN-slug.md` |
| Intended work, not yet scoped | `_architecture/BACKLOG.md` |
| Work worth tracking now | `_architecture/TODO.md` |
| Friction hit during the session | `_architecture/workflow-friction-log.md` |
| Structure or a durable pattern | `_architecture/ARCHITECTURE.md` |
| How to build in `src/` | `.agents/context/engineering-guidelines.md` |

## Why not the alternatives

Option 1 is what the Phase 2 run actually did, and it failed. The copy step does not happen, because by the time a run ends the context that knows what was decided has been compacted away, and the ledger is the only copy. Anything worth keeping has to be written where it belongs at the moment it is decided.

Option 2 removes the recovery map the SDD skill depends on. After a compaction the ledger is how the controller knows which tasks are done and which commits exist; without it a resumed controller re-dispatches completed work, which that skill names as the most expensive failure observed.

## Next step

Nothing durable is left only in the Phase 2 ledger. The parked findings are the two new `_architecture/BACKLOG.md` entries, the friction is in `_architecture/workflow-friction-log.md`, the Angular 22 default-change-detection ruling is in `.agents/context/engineering-guidelines.md` with the spec and plan corrected to match, and the drawer's missing modal semantics are in decision `011` beside the focus half of the same finding. What remains in the ledger is per-task porting and process calls, which the code and the commits already carry. The Phase 2 ledger can be deleted once the branch merges.
