# local-ux-quality-and-motion-system

Session: 2026-09-18. Status: Implemented — `pnpm run ux:smoke` + motion tokens/recipes landed. Stop-hook automation rejected: keep agent-invoked (same class as `test:ci`), not every-turn.

## Context

Library work kept producing paint-order glitches (width jump, font FOUC, loading label wiping real content). Catching them manually is the wrong loop. Solo local-first project → gates run on this machine against `pnpm start` / static preview, not CI (decision 009).

Two gaps: (1) automated detection of CLS / loading flashes; (2) a small design-system motion vocabulary so route/shell/pending transitions are not improvised each time.

## Tooling research (local-first)

| Tool | Job | Verdict |
| --- | --- | --- |
| Playwright + Layout Instability API | CLS + forbidden loading copy + H1 stability across nav | **Primary** — `pnpm run ux:smoke` |
| chrome-devtools MCP | Same checks in agent sessions | Secondary — already connected |
| Unlighthouse / lighthouse CLI | Cold-load lab scores on static preview | Occasional |
| Lighthouse CI | Remote budgets/history | Defer (009) |
| Vitest browser (008) | Component tests | Keep; not for route paint-order |

## Motion research

Keep `--duration-press` / `--duration-state`. Add `--duration-route` and `--duration-shell` (~240ms). Recipes: route pane VT, shell width, pending-without-wipe, fonts. Full drill-in URL-stack stays BACKLOG.

## Build order

1. `scripts/ux-smoke.mjs` + `pnpm run ux:smoke` against localhost:4200
2. Motion tokens + retarget CSS + design-system recipes
3. Note Unlighthouse for occasional static audits

## Anti-patterns

Loading UI replacing painted content; remount on isLoading; font-display swap without preload; shell width transition on first paint; second dev server.

## Implementation deviations

<!-- Added once the build diverges. -->
