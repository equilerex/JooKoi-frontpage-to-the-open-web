# JooKoi: Front Page to the Open Web

> **Live site:** [https://equilerex.github.io/JooKoi-frontpage-to-the-open-web/](https://equilerex.github.io/JooKoi-frontpage-to-the-open-web/)

A curated launcher and directory for the open web. It organizes independent web resources, developer tools, and reference documentation, routing users directly to primary sources instead of summarizing or reproducing them.

A personal project and reference ground for modern, zoneless Angular.

---

## What is inside

- **Home & Quick Keys**: Keyboard-navigable launcher pointing to primary sources across tech, tools, and digital culture.
- **Search Console**: In-place filtering and fast keyword search over the curated directory fixture.
- **Library & Reader**: Reference materials and technical documents with collapsible topic trees, section navigation, and zero-flash transitions.
- **Retro HUD Theme**: High-contrast, tactile UI inspired by retro instrumentation, built on layered CSS custom properties.

---

## Technical stack

- **Framework**: Angular 22 (zoneless, standalone components, signals, `@ngrx/signals`).
- **Rendering**: Static prerendering (`outputMode: static`) with client-side fallback routing (`index.csr.html` / `404.html`).
- **Components & Styling**: PrimeNG 22 with custom design preset, Angular CDK/Aria, explicit CSS cascade layers (`@layer`).
- **Testing**: Vitest browser mode running against headless Chromium via Playwright.
- **Quality & Performance**: Built-in lab audit harness using Lighthouse (`pnpm run ux:lab`), UX smoke testing (`pnpm run ux:smoke`), and committed performance baselines.
- **Hosting & CI**: GitHub Actions automated pipeline with direct deployment to GitHub Pages.

---

## Development

Requires Node 24 (`.nvmrc`) and `pnpm` (v11+).

```bash
# Install dependencies
pnpm install

# Start local watch dev server (http://localhost:4200)
pnpm start

# Run unit and browser-mode test suite
pnpm test:ci

# Run local UX smoke scenario checks
pnpm run ux:smoke
```

---

## Architecture & documentation

- Whole-system structure and decisions: [`_architecture/ARCHITECTURE.md`](_architecture/ARCHITECTURE.md)
- Outstanding work and live status: [`_architecture/TODO.md`](_architecture/TODO.md)
- Architectural Decision Records: [`_architecture/plans/decisions/`](_architecture/plans/decisions/)
