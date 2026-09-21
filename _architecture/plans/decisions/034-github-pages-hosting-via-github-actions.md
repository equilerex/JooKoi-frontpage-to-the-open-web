# Decision 034 — GitHub Pages hosting via GitHub Actions

Date: 2026-09-22

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Decision 009 left hosting deferred until the app was closer to done. The user chose GitHub Pages as the hosting platform, with a need to resolve subfolder routing (`--base-href /JooKoi-frontpage-to-the-open-web/`), SPA fallback on deep routes, and deployment automation without polluting the repository git history.

## Options considered

1. **Commit `dist/` to git via a local pre-commit hook** and push to a `gh-pages` branch using third-party deployment actions (`JamesIves/github-pages-deploy-action`).
2. **Dedicated deployment branch (`gh-pages`) built on CI** and committed to by an action.
3. **Official GitHub Actions Pages integration (`actions/upload-pages-artifact` and `actions/deploy-pages`)**: build on Ubuntu runner after `verify` job passes on `main`, deploy directly from runner memory.

## Decision

Option 3. This resolves and supersedes the "hosting still deferred" part of Decision 009.

- **No `dist/` in git**: `dist/` remains gitignored. No local pre-commit build hook is installed.
- **Dedicated build script**: `scripts/build-gh-pages.mjs` runs `primeui-license.mjs`, `build-library-content.mjs`, and builds Angular with `--base-href ${BASE_HREF ?? '/JooKoi-frontpage-to-the-open-web/'}`. Exposed via `pnpm run build:gh-pages`.
- **404 SPA fallback**: `scripts/build-gh-pages.mjs` copies `dist/jookoi-frontpage/browser/index.csr.html` (the un-prerendered client-side fallback emitted by Angular 22) to `404.html`. Deep non-prerendered routes or direct reloads hitting GitHub Pages' 404 handler boot the client router cleanly rather than flashing the home page or showing a blank error.
- **Jekyll bypass**: `scripts/build-gh-pages.mjs` writes an empty `.nojekyll` to `dist/jookoi-frontpage/browser/` so GitHub Pages serves static underscore directories without processing.
- **CI deployment job**: `.github/workflows/ci.yml` gains a `deploy` job that runs only on `push` to `main` after the `verify` job succeeds, uploading `dist/jookoi-frontpage/browser` with `actions/upload-pages-artifact@v3` and deploying with `actions/deploy-pages@v4`.

## Why not the alternatives

Option 1 violates the repository iteration rules in `AGENTS.md` ("Never pay for a full production build to look at one change", "Never run a production build in the agent loop"): running `ng build` on every local commit stalls work by 20–30 seconds and adds megabytes of churn to git history.
Option 2 requires managing personal access tokens / write permissions to a separate `gh-pages` branch, whereas native GitHub Pages actions deploy directly from workflow artifacts using OIDC and standard `pages: write` permissions.

## Next step

Enable GitHub Pages in repo settings:
- Navigate to GitHub Repository `Settings` → `Pages`.
- Under **Build and deployment > Source**, select **GitHub Actions**.
- Push changes to `main` to trigger the CI verification and automated Pages deployment.
