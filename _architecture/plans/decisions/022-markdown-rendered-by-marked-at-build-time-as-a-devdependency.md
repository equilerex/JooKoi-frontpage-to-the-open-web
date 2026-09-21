# Decision 022 — Markdown rendered by marked at build time, as a devDependency

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The vendored learn markdown (decision 021) needs to render as HTML for `/learn/:topic`.

## Options considered

- Runtime rendering, as `JooKoi-md-archive` does it (`web/src/app/core/services/markdown.service.ts`): `marked` + `highlight.js` + `mermaid` shipped as runtime dependencies.
- Build-time rendering: a Node script runs `marked` (devDependency only) and emits HTML strings into a generated module.

## Decision

Markdown is rendered by `marked` at build time, as a devDependency (D6). `scripts/build-learn-content.mjs` reads `content/learn/`, parses front matter and the H1, renders each document with `marked`, and emits a gitignored generated TS module (`src/app/shared/learn-content/learn-content.generated.ts`) with typed topic records plus the prerender route list.

## Why not the alternatives

This content is static and fully known at build time, unlike `JooKoi-md-archive`'s use case. Running `marked` in a Node script instead of shipping it (plus `highlight.js` and `mermaid`) as runtime dependencies costs nothing in the client bundle and lets `/learn/:topic` prerender.

## Next step

None. This mirrors the existing secrets-materialisation pattern already in this repo — a gitignored module built by a script chained into the build.

**Amended by decision 027** (2026-09-16): the library section splits this into a committed index plus per-document files, no longer gitignored. Build-time `marked` rendering itself is unchanged.
