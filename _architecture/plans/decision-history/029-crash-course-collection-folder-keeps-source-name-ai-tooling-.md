# Decision 029 — Crash-course collection folder keeps source name ai-tooling-crash-course-for-developers

Date: 2026-09-18

Status: DECIDED

## Problem

The crash course was vendored under `content/library/learn/`, so URLs became `/library/learn/...`. That short name was invented in this repo. The canonical folder in `JooKoi-developer-stack` is `ai-tooling-crash-course-for-developers`. Decision 028 already said the library tree follows the real folder tree; renaming the collection broke that for the top segment.

## Options considered

- Keep `learn` as a friendlier URL slug and map it only in routing.
- Use the source folder name as the collection path and URL segment.
- Invent a third short slug.

## Decision

The collection path is `ai-tooling-crash-course-for-developers`, matching the source folder. Sync writes there. Old `/library/learn/...` and top-level `/learn` URLs redirect into the real path. Amends the path assumption in decision 028 (sync script + tree rules stay; the `learn` destination name does not).

## Why not the alternatives

A vanity slug reintroduces a rename layer decision 028 rejected. A third name is worse. Redirects cover old bookmarks without keeping a fake folder on disk.

## Next step

`pnpm run content:sync` (or `content` after a one-time move). Tile/tree labels come from `index.md` / `labelFromName` of the real folder name.
