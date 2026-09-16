# Decision 026 — Source is the data-model name; CuratedWebsite stays the vocabulary for everything else

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

ADR 005 bans the bare word "source" in `src/app/` — in an engineering context it reads as source code, and an earlier draft that used it produced `source-directory/` and a `Source` model nobody could read at a glance. `_architecture/plans/2026-09-16-phase-3-content-and-features.md`'s "Data model" section, written later and dated, specifies the record type as `Source` verbatim, including the `TrustScore`/`Capability` comments. Task 3 built `source.model.ts`, `source-fixture.ts` and `source-search.ts` following the plan, and flagged the conflict in `src/app/shared/curated-websites/CONTEXT.md` for this ADR to resolve: formalize the exception, or rename to `CuratedWebsite` to restore the rule.

## Options considered

- Rename `Source` / `source-*` to `CuratedWebsite` / `curated-website-*` to bring the data model back under ADR 005's rule, repo-wide.
- Formalize a narrow, named exception: the data model keeps `Source`/`source-*`, everything else in this domain still follows ADR 005.

## Decision

Formalize the exception. `Source` is the model name and `source.model.ts` / `source-fixture.ts` / `source-search.ts` are the file names, by the newer, dated, explicit decision in the Phase 3 plan. Every other future addition to `shared/curated-websites/` — the store, the service, and the components in "Planned contents" — stays `CuratedWebsite`/`website-*`, unchanged from ADR 005.

## Why not the alternatives

A rename here is a repo-wide rename of shipped, working code and tests, done as a side effect of a documentation task — new scope, not a decision. The plan's `Source` naming was also not an accident: it is dated, explicit, and specific to the data model's field shapes, not a casual reversion of ADR 005.

## Next step

`src/app/shared/curated-websites/CONTEXT.md`'s "flagged, pending reconciliation" language is updated to point at this ADR. If the split naming (`Source` the model, `CuratedWebsite` the folder and everything else) proves confusing in practice, a future ADR can supersede this one with a repo-wide rename — that rename is not scoped here.
