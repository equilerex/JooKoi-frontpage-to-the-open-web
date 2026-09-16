# Decision 017 — Source records are a hand-written TS fixture, not sources/ YAML

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Phase 3 needs curated-website records to build against. `_architecture/sitemap.yaml` and the original data-pipeline BACKLOG item (`Data pipeline: sources/ to src/generated/`) assumed a `sources/` YAML folder compiled to typed build-time data by a `scripts/` step.

## Options considered

- A hand-authored `sources/` YAML tree plus a build-time compiler script, matching the originally planned pipeline.
- A hand-written TypeScript fixture (`source-fixture.ts`) checked in directly under `src/app/shared/curated-websites/`.

## Decision

Records are a hand-written TS fixture (`source-fixture.ts`), not YAML with a build step. Full reasoning and the seed-content groups: `_architecture/plans/2026-09-16-phase-3-content-and-features.md`, "Decisions taken this session" (D1) and "Seed content".

## Why not the alternatives

The ingestion story (`source-ingest` skill, `probe-url.mjs`) now belongs to `JooKoi-developer-stack`, not this repo. Committing to a YAML-plus-compiler pipeline here would design the schema before enough records exist to know its real shape.

## Next step

A typed fixture is trivially migratable to YAML later once the schema has proven itself against real records. The BACKLOG item `Data pipeline: sources/ to src/generated/` stays open for that migration.
