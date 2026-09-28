# app-quality-harness

Session: 2026-09-18. Status: Implemented v1 — app-wide `ux:smoke` + budgets + history + `ux:lab`.

## Context

Library-only smoke was not enough. Need a universal local harness: all main routes, transition compliance, glitch/paint-order checks, load metrics, long-task proxy for thrash, and JSONL history for regressions — without CI (009) and without a second dev server.

Extends `2026-09-18-local-ux-quality-and-motion-system.md`.

## Layers

| Layer               | Command                                            | Against                                                 |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| A Interaction smoke | `pnpm run ux:smoke`                                | `pnpm start` :4200                                      |
| B Lab audit         | `pnpm run ux:lab`                                  | `serve:static-build` :4321 (deliberate; not every turn) |
| C History           | `.local/ux-smoke/` / `.local/ux-lab/` (gitignored) | regression vs prior run                                 |

Budgets: `scripts/ux-smoke.budgets.json`. Ship a new page → add a scenario in `scripts/ux-smoke.mjs` `SCENARIOS`.

## Angular signal loops

v1 uses long-task + CLS bursts as thrash proxy. No private Angular profiler APIs. Static/effect hygiene stays BACKLOG.

## Implementation deviations

<!-- Added once the build diverges. -->
