# TODO

<!-- Live working set. `jookoi-paper-trail flush` archives it and resets it. See AGENTS.md. -->

## Context

**Phase 1 and Phase 2 are done** (archived 2026-09-17). Phase 3 home and search are live. Library **content pipeline** and **Pages UI** are live. App quality harness v1: app-wide `pnpm run ux:smoke` (budgets + `.local` history), occasional `ux:lab`, motion recipes in design-system CONTEXT (plans `2026-09-18-local-ux-quality-and-motion-system`, `2026-09-18-app-quality-harness`). AI-marketplace Search↗ is scoped to the row: own marketplace `{q}` or `mcpservers.org/agent-skills/author/{owner}?q=`. Optional Src column for GitHub. Remaining open product work: exercising Mermaid. **Performance pass done 2026-09-21** (decisions 032, 033): initial bundle 1.31 MB to 536 kB raw, budgets re-set, Lighthouse baselines in `_architecture/perf-baselines/`, CI workflow built. Lab numbers are still above target on `/search` (TBT ~780 ms, LCP ~5.2 s), `/` and library docs (LCP 4.4 to 5.0 s); next perf work is on BACKLOG. Working-tree notes: baseline `35e9919.json` recorded against HEAD; the CI Lighthouse step is `continue-on-error` until a CI-runner baseline is committed. Install/hook traps are in `.agents/context/gotchas.md`.

## Checklist

- [x] **Library UI planning session** — `plans/2026-09-17-library-pages-ui.md`. Pages baseline plus clarification: landing is a transitional entryway (chunky tiles) **and** the full file tree stays available; tile click expands that branch, others collapsed. Folder = intro + inert filter row + scoped tree. Document = document-template reader.
- [x] **Library UI build** — tree always on the left. Landing: tiles (open collection entry doc, e.g. `topic-index`) + tree. Folder: intro/filters on the right. Document: sheet beside the tree. Plan deviations updated.
- [x] **Library tree filter** — PrimeNG `p-tree` filter on `joo-topic-tree`: hides non-matches, expands ancestors (lenient). Filter input skinned in `styles.css`.
- [x] **Library document base type** — reader prose at `0.8rem`; heading/pre scale uses `em` so the ladder follows the base.
- [x] **Library tree default order + expand query** — files A–Z then folders A–Z; landing tiles use `?expand=<collection>` to fan out that branch (other tops stay collapsed). Rich filter/sort panel on BACKLOG.
- [x] **Crash-course collection path** — `ai-tooling-crash-course-for-developers` (decision 029); drop the invented `learn` slug; redirects keep old URLs working.
- [x] **Section entry doc is README.md** — decision 030; crash-course `topic-index.md` renamed/mapped to `README.md`; `index.md` stays folder meta only.
- [x] **Library right-pane route transitions** — `withViewTransitions` + `library-pane`/`library-tree` names; query-only skipped; scroll restoration on. Full drill-in/reuse architecture stays on BACKLOG.
- [x] **AI marketplace search destinations** — `sourceUrl` + Src column; library Search↗ is author-scoped mcpservers, not global skills.sh. Plan: `plans/2026-09-18-ai-marketplace-search-destinations.md`.
- [x] **Library doc loading flash** — no slower "Loading document" wipe; resource TransferState `id` + keep last HTML while loading. UX-glitch automation on BACKLOG.
- [x] **Local UX smoke + motion tokens** — `pnpm run ux:smoke`; `--duration-route` / `--duration-shell`; recipes in design-system CONTEXT. Plan: `plans/2026-09-18-local-ux-quality-and-motion-system.md`.
- [x] **App quality harness v1** — app-wide `ux:smoke` scenarios + budgets + `.local/` history; `ux:lab` for static Lighthouse. Plan: `plans/2026-09-18-app-quality-harness.md`.
- [x] **Layered drill-in MVP** — ADR 031; reader layer over browse underlay; `LibraryLayoutStore` for filter/scroll; CSS reader motion; document VT deferred. Plan: `plans/2026-09-18-library-layered-drill-in.md`.
- [ ] **Mermaid path** — add one vendored document with a `mermaid` fence, or mark the path explicitly untrusted until then.
- [x] **mdskills / Agensi / MCP Market searchUrl** — own `?q=` URLs: `/skills?q=`, `/search?q=`, `mcpmarket.com/search?q=`.
- [x] **Performance pass and Lighthouse baselines** — decisions 032, 033. Home lazy, `record-grid` plain table, shell status count deferred, budgets re-set, `learn/:topic` `RenderMode.Client`, `lighthouse` devDependency, `ux:lab` record/compare/strict, `ci.yml`. Briefing for the skill that guided it: `jookoi-ai-market/_architecture/plans/angular-skill-improvement-brief.md`.
- [ ] **Record a CI-runner Lighthouse baseline** — then remove `continue-on-error` in `.github/workflows/ci.yml`.
