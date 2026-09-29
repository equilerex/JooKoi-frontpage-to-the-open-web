# Decision history

<!-- Background on why rules exist. Maintained by jookoi-paper-trail (new-decision appends here). -->

Background on why rules exist. Not rules. Open a file only when a doc cites it or the user asks why.

- [001 Retro HUD design theme v3 as visual direction](001-retro-hud-design-theme-v3-as-visual-direction.md): Visual direction and palette choices contrasting rejected v1 and v2 directions.
- [002 Resequence build: Angular foundation before design system and content](002-resequence-build-angular-foundation-before-design-system-and.md): Build sequence rationale exempting foundation setup from the minimal viable feature gate.
- [004 Rendering: static prerendering, no server](004-static-prerendering-no-server.md): Why static prerendering was chosen over SSR node servers and CSR.
- [006 Component behaviour library: Angular Aria plus CDK, not Material](006-angular-aria-plus-cdk-not-material.md): Why Angular Material was rejected in favour of unstyled headless behaviour primitives.
- [011 PrimeNG as the component base, styled mode, skinned through a custom preset](011-primeng-as-component-base.md): Component base selection, styled mode, and token prefix collision mitigation.
- [027 Library section's generated content is committed, not gitignored](027-library-section-generated-content-is-committed-not-gitignored.md): Why generated TypeScript markdown bundles are committed for zero-codegen dev server startup.
- [031 Layered drill-in is the project navigation rule; library proves it](031-layered-drill-in-is-the-project-navigation-rule-library-prov.md): Architectural navigation rule for persistent contextual drill-in hierarchies.
- [032 Home is lazy, record-grid is a plain table, initial budget 700-900kB](032-home-is-lazy-record-grid-is-a-plain-table-initial-budget-700.md): Performance budget tuning and separation of landing page weight from full search tables.
- [033 Performance baselines are committed per-commit JSON; Lighthouse is a devDependency; CI is built](033-perf-baselines-are-committed-per-commit-json-lighthouse-is-a-dev.md): Git-tracked performance baseline architecture and automated CI validation.
- [034 Stop-hook formatter covers md and yaml; items.yaml prettier-ignored](034-stop-hook-formatter-covers-md-and-yaml-items-yaml-prettier-i.md): the Stop hook now formats md and yaml; the script-owned items.yaml is prettier-ignored.
- [035 no-deprecated-angular-animations-and-url-filters-without-navigation](035-no-deprecated-angular-animations-and-url-filters-without-nav.md): Zero animations on data collection rows, Location.replaceState for in-page URL memory without router navigation jumps.
- [036 search-filter-memory-and-safe-record-grid-row-transitions](036-search-filter-memory-and-safe-record-grid-row-transitions.md): Compositor-only opacity transitions with stable rowKey identity tracking and debounced keyword input.
- [037 Restore PrimeNG Table with lazy route/chunk loading and virtual scrolling](037-restore-primeng-table-with-defer-and-virtual-scroll.md): Re-adopt PrimeNG Table with virtual scroll and lazy chunk isolation.
