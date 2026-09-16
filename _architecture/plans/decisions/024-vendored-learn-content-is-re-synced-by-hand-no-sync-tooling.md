# Decision 024 — Vendored learn content is re-synced by hand, no sync tooling

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Vendoring learn content into this repo (decision 021) means the vendored copy can drift from its canonical source in `JooKoi-developer-stack`.

## Options considered

- Build a sync script now, with a hash or provenance check against the canonical copy.
- Re-sync by hand, with no tooling.

## Decision

Vendored learn content is re-synced by hand (D8), with no sync script, hash or provenance check.

## Why not the alternatives

The set is small (20 documents) and changes rarely, so a sync mechanism now would be built before its failure mode has ever occurred. Same "three occurrences, then encode" reasoning `_architecture/sitemap.yaml` already applies to the link-decay checker.

## Next step

Revisit when manual re-sync actually starts going stale in practice, not before.
