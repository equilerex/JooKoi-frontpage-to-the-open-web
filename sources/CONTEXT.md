# CONTEXT — sources
updated: 27-09-2026 17:26

## What this is

The curated-websites dataset, human-authored, on the editorial clock. `scripts/build-sources.mjs` (`pnpm run sources`) validates every file and writes the committed `src/app/shared/curated-websites/*.generated.ts` modules the app imports. Nothing in `src/` reads these files directly.

## Why it's built this way

- **File order is dataset order.** Files are read by name, records in file order. Relevance sort falls back to that order on ties, so the `NN-` prefixes are load-bearing. A new group gets the next free number. Gaps are fine.
- **JSON plus `source.schema.json`**, not YAML: editor autocomplete and inline checks with no dependency. The schema is a convenience. The build script is the real validator and fails with file, index and id.
- **One record per site.** The build rejects a duplicate `id` and a duplicate site (URL compared without scheme, `www.` and trailing slash). The old fixture listed ten sites twice under different ids.

## Authoring rules

- `id`: lowercase slug, stable. Nothing routes on it yet, it will once a detail page exists.
- `url`: the Name column. For AI skill marketplaces, the author's GitHub repo if known, otherwise the homepage.
- `searchUrl`: the right-hand Search↗ key, a `{q}` template, always a real search URL with a query param. Never GitHub, never a listing path. For AI marketplaces: that row's marketplace search if it takes `?q=` (`https://www.skills.sh/?q={q}`), else `https://mcpservers.org/agent-skills/author/{github-owner}?q={q}`. `{q}` stays even when the query is empty.
- `sourceUrl`: GitHub only, and only when `url` is not already the repo.
- `desc`, `trustScore`, `capabilities`, `tags`, `verified` are editorial heuristics assigned at authoring time. Consistent judgement is the bar, not precision.

## Gotchas

- Editing a file changes nothing in the running app until `pnpm run sources` regenerates the modules. The watch server then picks them up. `pnpm run build` runs it first.
- `site-search` in `capabilities` and the presence of `searchUrl` disagree on about 110 records. The UI keys off `searchUrl`. Not enforced by the build until the data is cleaned.

## Don't

- Don't hand-edit the generated modules. They are overwritten on the next run.
