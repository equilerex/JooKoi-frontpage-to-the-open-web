# angular-project-setup-handoff

Session: 2026-09-15. Status: handoff brief for the Phase 1 planning session. No plan written yet.

## Context

This repo is JooKoi: Front Page to the Open Web, a curated launcher and directory that sends people to original sources. No application code exists yet. The visual direction is settled (decision 001) and mocked up as plain HTML and CSS in `features/design-theme/`.

The user wants this repo to double as their personal reference for what a modern Angular application should look like: best practices, current Angular features, very fast loading, responsive, proper build system and CI pipelines. It is also an experimenting ground for trying new Angular releases and tooling. At work the user maintains a much more complex system with deep dependency and legacy problems. This project is the clean baseline.

Work is resequenced into three phases (decision 002). This brief covers **Phase 1: project setup** only. Design system extraction is Phase 2, content and features are Phase 3. Do not plan those beyond what the setup must leave room for.

## What the planning session should produce

- A Phase 1 architecture plan in `_architecture/plans/YYYY-MM-DD-<topic>.md`.
- One ADR per hard-to-reverse call in `_architecture/plans/decisions/NNN-slug.md` (next free number is 003). Use the `jookoi-paper-trail` skill and its script for both.
- The first `_architecture/ARCHITECTURE.md`, kept to shape and key decisions.
- A scoped implementation checklist in `_architecture/TODO.md`.

Follow the workflow in `.agents/planning-before-implementation.md` Part 7. Verify Angular and tooling facts against current docs (the `ctx7` CLI, angular.dev) rather than training data. Versions and defaults change fast and matching current practice is the point of the project.

## Read first

| File | Why |
|---|---|
| `AGENTS.md` | Build philosophy, conventions, where things live |
| `.agents/context/principles.md` | Product constraints (static, client-side, send to sources) |
| `.agents/context/product-concept.md` sections 20 to 22 | Accessibility, local-only use, client-heavy architecture |
| `_architecture/sitemap.yaml` | Page types and routes, `mvp` vs `parked` |
| `_architecture/plans/decisions/001-*`, `002-*` | Design direction and the phase order |
| `features/design-theme/CONTEXT.md` | How the CSS system is built. Phase 1 must be able to host it |
| `_architecture/plans/2026-08-22-dev-stack-plan.md` Part 1 | Existing repo layout intent (`sources/`, `data/`, `scripts/`, `.agents/`) |

Skip the rest of `_architecture/plans/` unless a question needs it.

## Fixed constraints

- **Angular.** Already chosen. Don't re-open the framework question.
- **Static and client-heavy.** The host serves files and does nothing else. No backend, no database, no server-side search. Must run locally from a clone. No telemetry, no analytics, no unneeded third-party scripts.
- **Data.** `sources/` holds human-authored data, `data/` holds machine-observed data, `scripts/` holds deterministic Node scripts (`scripts/sitemap-to-mermaid.mjs` exists). The source schema is not designed yet. Stage 1 ingestion has not run. Use sample fixtures and don't lock in a schema.
- **Routes.** MVP routes from `sitemap.yaml`: `/`, `/search?q=`, `/browse/:category?`, `/source/:id`, plus the external site-search launch. The parked `/learn/:topic` renders markdown and should inherit rendering from the sibling repo JooKoi-md-archive.
- **Styling.** Plain CSS custom properties, not a CSS framework. Semantic tokens under `[data-theme]`, so a second theme swaps one block. Fonts are self-hosted (Chakra Petch, Inter, JetBrains Mono). The mockups use Google Fonts only as a shortcut.
- **Component behaviour.** Angular CDK is recommended over Angular Material because Material's styling fights this look. Confirm or reject it in an ADR.
- **Mobile.** Mobile is a first-class layout, not a shrunk desktop. Mobile gets a bottom dock, stacked table cards and collapsed filters. Desktop is the playful surface.
- **Accessibility.** Relaxed by the user's call (personal use). Keyboard navigation must work. Readable text keeps AA contrast. `prefers-reduced-motion` and `prefers-contrast` fallbacks exist in the CSS.
- **Git.** Never run `git commit` or `git push`. The user commits.

## Tension to resolve, not ignore

`AGENTS.md` says "minimal viable feature first", "don't build general architecture in advance" and "no production-readiness pipeline during prototyping". The user now explicitly wants a best-practice foundation with builds and pipelines. Decision 002 governs. Apply the MVP rule inside Phase 1: set up what a modern Angular reference project needs on day one, and skip speculative extras such as Nx, a monorepo, micro-frontends or a state library before there is state. Then update the wording in `AGENTS.md` (it still says "Stage 0 — skeleton" and points per-feature context at `llm-context.md`, but the repo uses `CONTEXT.md`).

## Open questions for the plan

Each needs a recommendation, and an ADR where it is hard to reverse.

- **Version policy.** Which Angular version to start on, and how updates are tried out (`ng update` cadence, a branch per major, Renovate or Dependabot).
- **Rendering.** Pure client-side rendering, build-time prerendering (SSG) or SSR, given static hosting only. Prerendering vs a service worker for offline and fast repeat loads. This ties to principle 4, "no network dependency at read time".
- **Core app patterns.** Zoneless change detection, signals, standalone components, built-in control flow, deferrable views, lazy routes, and which newer APIs (resource, signal forms, and others) are stable enough to adopt.
- **Folder structure.** Where the Angular workspace sits relative to the existing `sources/`, `data/`, `scripts/`, `features/` and `.agents/`. Feature-based layout inside the app. Where the design system lives in Phase 2.
- **Styles pipeline.** How global token CSS and component-scoped styles coexist (cascade layers, view encapsulation mode), and how `[data-theme]` switching is wired.
- **Data pipeline.** How `sources/` becomes static JSON at build time, and how that is typed. Candidate client-side search libraries (decide in Phase 3, but leave room).
- **Tooling.** Package manager, Node version pinning, ESLint (angular-eslint), formatting, strict TypeScript and strict templates, and the unit test runner Angular currently defaults to. Tests stay minimal per `AGENTS.md`.
- **CI.** Lint, typecheck, build, bundle-size budgets, and possibly a Lighthouse or Web Vitals check. Keep it fast.
- **Hosting.** A static host (GitHub Pages, Cloudflare Pages, Netlify or similar) and preview deploys per branch, if worth it.
- **Agent workflow.** How agents verify UI work, for example Chrome DevTools MCP at 390px as in the dev-stack plan Part 2, and any Angular-specific AI tooling such as the Angular CLI MCP server, if current.

## Not in Phase 1

- Building real components from the mockups (Phase 2).
- Source schema, ingestion, search and page content (Phase 3 and Stage 1).
- A1 and A2 gate answers. They stay open in `TODO.md` and don't block setup.

## Build order

Defined by the planning session.

## Implementation deviations
