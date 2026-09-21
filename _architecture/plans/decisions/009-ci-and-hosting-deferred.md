# Decision 009 — Delivery: CI and hosting shape recorded, build deferred

Date: 2026-09-15

Status: DEFERRED (CI part built in decision 033; hosting still deferred)

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The first version of the Phase 1 plan included building the CI pipeline and picking a host. The user cut it: "plan it" and "build it" are separate, and delivery work belongs near the end, when the app is close to done. But some delivery constraints do have to be honoured _now_, because reversing them later means reworking the Angular config — output shape, base href, host-specific code, and whether every CI step can even be invoked.

## Options considered

1. Build the GitHub Actions workflow and pick a host during Phase 1.
2. Say nothing about delivery until the app is ready, and deal with it then.
3. Record the intended shape and the constraints it puts on Phase 1 config, build nothing.

## Decision

Option 3. Status is **DEFERRED**: this ADR is a record of intent, not of work done.

**Intended CI:** a GitHub Actions workflow running `format:check`, `lint`, `build` and `test:ci`, with the build budgets (see `_architecture/ARCHITECTURE.md`) enforced by `build`. Plus Dependabot, which is where decision 003's upgrade policy gets automated.

**Hosting candidates**, unranked: Cloudflare Pages (free, branch previews), Vercel, or nginx on the user's existing Linode.

**Constraints Phase 1 honours now**, so none of the above is blocked later:

- Build output is plain static files (decision 004), no server bundle.
- Base href is `/`.
- No host-specific code or configuration lives in the app.
- Every CI step exists as a pnpm script, so the workflow is a list of script names, not embedded shell.
- Headless test mode works when `CI=true`.

## Why not the alternatives

Option 1 was the original plan and got rejected on scope: a pipeline for an app with two routes tests nothing and costs a session. Option 2 risks the config decisions quietly closing doors — an `outputMode` other than `static`, or a CI step that only exists as an ad-hoc command, would each have to be undone.

## Next step

Both items sit in `_architecture/BACKLOG.md` (CI workflow plus Dependabot; hosting and deploy). Pull them into `TODO.md` when the app is close to done. This ADR's status changes to DECIDED, or a superseding ADR is written, when a host is actually chosen.
