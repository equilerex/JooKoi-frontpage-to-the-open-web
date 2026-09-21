# Decision 027 — Library section's generated content is committed, not gitignored

Date: 2026-09-16

Status: DECIDED

## Problem

Decision 022 gitignored the learn-content generated module and rebuilt it on every `start`/`build`. The library section (`_architecture/plans/2026-09-16-library-archive-section.md`) splits that one module into a small index plus one generated file per document (R2 — keeping content out of the main bundle), and content is now authored directly in this repo (`content/library/`), not only vendored. Should the split output stay gitignored the same way?

## Decision

The generated output (`src/app/shared/library-content/library-index.generated.ts` and `src/app/shared/library-content/docs/*.generated.ts`) is committed. `pnpm start`/`pnpm run watch` no longer run the generator at all; `pnpm run build` still runs it first; `pnpm run content` runs it by hand after content changes. A fresh clone builds and serves without running anything.

## Why not the alternatives

Gitignoring one file was fine when it was one file. Gitignoring 20+ per-document files plus an index, none of which is a secret, buys nothing decision 004's "static, no server" stance needs — the content is public and already lives in git as markdown. Committing it also means `pnpm start` (watch mode) never needs to invoke the generator, matching the iteration-loop table (`AGENTS.md`) more closely: one trigger, one mechanism, and content changes are regenerated deliberately (`pnpm run content`) rather than on every server start.

## Other changes bundled into this pass, not worth their own ADR

- **`content/library/`, not `content/learn/`.** The generator walks one directory per collection; `content/learn/` (decision 021) is migrated to `content/library/learn/`, `topics/` flattened, `topic-index.md` renamed to `index.md`.
- **A `UrlMatcher` consuming every URL segment was tried first** for R1 (routes of any depth) and does not work: Angular refuses `RenderMode.Prerender` on any route reached through a matcher (confirmed against the real dev server, not just inferred from docs — the plan flagged this as unverified). Both `library.routes.ts` (client) and `app.routes.server.ts` (prerender) instead build one literal route per path from the generated index — no route-config change as content grows, since the list itself is generated.
- **Mermaid** (R4) ships as a normal runtime dependency (`mermaid@^12`), lazy-imported only on a document with `hasDiagrams: true`. No current document has a diagram, so this path is unexercised beyond a manual read of the code; add one test document with a `mermaid` fence before trusting it (this plan's build order, step 7, was not completed).

## Next step

None for this decision. The plan's own build order still has an item outstanding: exercise the mermaid path with a real diagram.
