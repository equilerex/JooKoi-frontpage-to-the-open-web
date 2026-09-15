# Decision 002 — Resequence build: Angular foundation before design system and content

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

`plans/2026-08-22-dev-stack-plan.md` Part 2 orders the work as: A1/A2 gate answers, Stage 1 ingestion spike, Stage 2 throwaway HTML prototypes on real data, then Stage 4/5 spec and architecture. The project now has a second purpose. The user wants this repo to be their personal reference for a modern Angular application (fast loading, responsive, proper build and CI pipelines) and an experimenting ground for keeping up with Angular changes, as a clean contrast to the more complex system they use at work. That purpose does not depend on the dataset.

## Options considered

1. Keep the original order. Ingestion spike and data first, framework and architecture at Stage 4/5.
2. Build the Angular foundation now. Then extract the design system, then build content and features.

## Decision

Option 2. Three phases:

1. **Project setup.** Architecture, folder structure, build, tooling, CI, hosting. Planned from `plans/2026-09-15-angular-project-setup-handoff.md`.
2. **Design system.** Extract components and tokens from `features/design-theme/` into the app.
3. **Content and features.** MVP pages from `sitemap.yaml`, source data, ingestion.

## Why not the alternatives

Option 1 treats the framework as a late decision, but Angular is already chosen and the foundation's value (a reference setup for the user) exists without real data. Waiting on the ingestion spike delays the part the user wants to learn from now.

## Next step

A fresh planning session takes the handoff doc and produces the Phase 1 architecture plan and ADRs. Still open and not gating Phase 1: A1 (why this beats asking a model), A2 (launcher-first, assumed), and the Stage 1 ingestion spike. The setup must not lock in a source data schema before Stage 1 produces real data.
