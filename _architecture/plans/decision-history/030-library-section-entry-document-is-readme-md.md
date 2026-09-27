# Decision 030 — Library section entry document is README.md

Date: 2026-09-18

Status: DECIDED

## Problem

Opening a collection (tile click, folder activate) needs a default document. The crash course used `topic-index.md`. `index.md` is already folder meta (title, summary, intro HTML) and is not a reader document. We need one shared entry-file name for every collection.

## Options considered

- `index.md` as the entry document (conflicts with folder-meta `index.md`).
- Keep `topic-index.md` as a special-case convention.
- `README.md` as the entry document for every section/folder that has one.
- `overview.md` or another invented name.

## Decision

The default entry document is `README.md`. `entryDocForFolder` prefers it first. `index.md` stays folder meta only and is never a document route. The crash-course survey file is `README.md` (formerly `topic-index.md`). Sync still skips the source repo’s own `README.md`, and maps source `topic-index.md` → dest `README.md` until the source renames. Old `/…/topic-index` URLs redirect to `/…/README`.

## Why not the alternatives

`index.md` already means folder chrome. `topic-index.md` is crash-course-specific. Another coined name adds a third concept for no gain.

## Next step

Prefer `README.md` in `library-tree.ts`. Keep redirects and link aliases for `topic-index` until the source tree renames.
