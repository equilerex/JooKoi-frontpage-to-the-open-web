# Architecture

## Build budgets

**Measured baseline** (2026-09-15):
- Initial bundle size: 244.34 kB (main.js 244.23 kB + styles.css 116 bytes)
- anyComponentStyle size: 0 kB (no component-scoped styles in current minimal app)

**Budget values** (baseline + ~30%):
- Initial: warning 320 kB, error 500 kB
- anyComponentStyle: warning 2 kB, error 4 kB

These values were set after the first production build to allow for ~30% growth headroom while keeping the app lean. Full architecture documentation will be written at project Stage 5.
