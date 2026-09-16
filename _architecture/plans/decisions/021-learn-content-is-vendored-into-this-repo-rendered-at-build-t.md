# Decision 021 — Learn content is vendored into this repo, rendered at build time

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The `/learn` pages render the AI-tooling crash course, whose canonical markdown lives in the sibling repo `JooKoi-developer-stack`. The build needs a way to reach that content.

## Options considered

- Read the crash-course markdown across the sibling repo path at build time.
- Vendor a copy of the markdown into this repo, under `content/learn/`.

## Decision

Learn content is vendored into this repo (D5) and rendered at build time by `scripts/build-learn-content.mjs`. The canonical copy stays in `JooKoi-developer-stack`.

## Why not the alternatives

Reading across a sibling path hard-codes a machine-specific path like `D:\repos\Serenity\...`, which breaks CI and every other clone of this repo.

## Next step

Duplication is an accepted, deliberate cost. Re-sync is manual — see decision 024. All 20 documents ship (19 topics plus the intro doc).
