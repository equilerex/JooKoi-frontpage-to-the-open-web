# Decision 004 — Rendering: static prerendering, no server

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The app is a launcher and directory over a small curated set. It has no API and no accounts, and the hosting question is deliberately left open (decision 009), so the build must not assume a Node process exists at runtime. It still needs crawlable HTML and a fast first paint, because the page types in `sitemap.yaml` are mostly link lists that should be readable immediately.

## Options considered

1. SSR with `@angular/ssr` running a Node server.
2. Pure client-side rendering, a single `index.html` shell.
3. Static prerendering: `ng add @angular/ssr` with `"outputMode": "static"`, which emits prerendered HTML per route and no server bundle.

## Decision

Option 3. `outputMode: static`. Build output is plain static files that any static host or `scripts/serve-static-build.mjs` can serve.

- Render mode per route lives in `app.routes.server.ts`.
- Parameterised routes (`website-detail`) will use `getPrerenderParams` fed from build-time data, with `PrerenderFallback.Client` so an unlisted id still resolves in the browser.
- Search stays client-rendered. It's query-driven and there is nothing meaningful to prerender.
- A service worker is not part of Phase 1. It's in `_architecture/BACKLOG.md`.

## Why not the alternatives

SSR needs a server process, which contradicts the no-host-lock-in constraint in decision 009 and buys nothing for content that is fully known at build time. Pure CSR gives up crawlable HTML and delays first paint behind the JS bundle, on pages whose whole job is showing a list of links.

## Next step

Phase 3 wires `getPrerenderParams` to the real curated-website data once the data pipeline (`sources/` → `src/generated/`) exists. Until then only `''` and the wildcard route exist.
