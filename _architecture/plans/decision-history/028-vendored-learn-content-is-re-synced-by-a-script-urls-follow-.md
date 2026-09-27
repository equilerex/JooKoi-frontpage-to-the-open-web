# Decision 028 — Vendored learn content is re-synced by a script, URLs follow the real folder tree

Date: 2026-09-17

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The library tree was grouping documents by `##` headings in `index.md`, not by folders on disk. Migration had also flattened `topics/` and dropped `_inspiration-and-staying-current.md` and `_ai-tooling-recommendations.md`. Decision 024 said re-sync by hand because the set was small. The copy had already gone stale, and the tree no longer matched the crash-course repo.

## Options considered

- Keep flattening and heading groups, copy the two missing files by hand.
- Read the sibling repo at `pnpm build` (rejected by decision 021: machine path, breaks CI).
- Vendor the real folder tree, re-sync with a script from the local sibling checkout or from GitHub.

## Decision

`content/library/ai-tooling-crash-course-for-developers/` is a vendored copy of `JooKoi-developer-stack/ai-tooling-crash-course-for-developers`, folder tree intact (`topics/` stays). URLs follow that tree (D7). Path name corrected by decision 029 (this ADR originally said `content/library/learn/`). `pnpm run content:sync` copies from `../JooKoi-developer-stack` (or `JOOKOI_DEV_STACK`), and fetches `https://github.com/equilerex/JooKoi-developer-stack` if neither is present. `pnpm build` still does not read a sibling path. README.md and TODO.md stay in the source repo. `index.md` in the dest is this collection's title, not a rename of `topic-index.md`. Flat `/library/<collection>/<slug>` aliases redirect into `topics/` when that is where the file lives. Supersedes decision 024.

## Why not the alternatives

Heading groups invented folders that do not exist. Flattening `topics/` contradicted D7 and hid the only real nested folder. Hand re-sync already dropped files. Reading the sibling path at build time still breaks CI.

## Next step

Run `pnpm run content:sync` when the crash-course repo changes. Remaining unresolved `.md` links point at files that were never vendored (architecture docs in the source repo) and stay warnings.
