# Decision 041 — Front page mirror on jookoi.com deployed manually, not CI

Date: 06-10-2026
Status: DECIDED

## Problem

The front page should also be served from `jookoi.com`, an nginx host on the owner's second Linode (shared with Mutants Rising and other apps). CI today builds and deploys only to GitHub Pages, whose build bakes in the base path `/JooKoi-frontpage-to-the-open-web/`, so that artifact does not work at the domain root.

## Options considered

- CI job that builds with `BASE_HREF=/` and `rsync`s to the server: needs a deploy user and a secret stored in GitHub.
- Rewrite the Pages artifact's base path after the fact: hacky, a base path baked into JS could be missed.
- Manual on-demand build and copy from the owner's PC.

## Decision

Manual deploy: `node scripts/deploy-jookoi.mjs` (`--dry-run` lists first, `--check` tests the login). The script holds no server details: target, key, web root and protected folders come from the gitignored `.local/deploy-jookoi.json` (fields documented in the script header), because the repo is public. It runs `scripts/build-gh-pages.mjs` with `BASE_HREF=/` (the only Git-specific base is that CLI flag, there is none in `angular.json`), refuses a build containing a protected folder, streams a tar over ssh into the web root with `--no-same-permissions` (Windows tar stores 666/777 modes), and never deletes, so old hashed bundles stay. nginx got `error_page 404 /404.html` for the SPA fallback. This is a deliberate exception to "no production build in the agent loop": the deploy is a build on purpose.

## Why not alternatives

CI deploy is wanted later, not now. The owner plans a GitHub company account where Pages can use a custom domain, so a rsync job plus stored secret would be thrown away. Rewriting the artifact is fragile.

## Next step

Item hi0z Move the jookoi.com deploy into CI. If the apex DNS ever moves to GitHub Pages, the other apps living under jookoi.com paths on that server need their own subdomains first.
