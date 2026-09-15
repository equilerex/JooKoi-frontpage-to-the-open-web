# Decision 003 — Version and update policy

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

This repo exists partly as the user's reference for a modern Angular app, so it has to track Angular majors rather than freeze. At the same time, an unpinned install breaks it: on 2026-09-15 the npm `latest` tags for TypeScript (7.0.2) and Vitest (5.0.0) both sat outside Angular 22's peer ranges. Something had to say which versions are allowed, how upgrades happen, and when a new dependency is allowed in at all.

## Options considered

1. Float on `latest` and fix breakage when it appears.
2. Pin caret ranges only for Angular packages, leave the rest loose.
3. Pin the whole toolchain (Node, package manager, TypeScript, test runner) and upgrade Angular majors deliberately on a branch.

## Decision

Option 3. Start on Angular 22.1 with the toolchain pinned:

- Node 24 in `.nvmrc` and `engines`, pnpm through `packageManager`.
- TypeScript `~6.0.3` (Angular 22 peer is `>=6.0 <6.1`).
- Vitest and `@vitest/browser-playwright` at `~4.1.11` (`@angular/build` peer is `^4.0.8`).
- `@ngrx/signals` `~22.0.1`.

Each new Angular major is tried on a branch named `upgrade/angular-<major>` with `ng update @angular/core @angular/cli` plus `@ngrx/signals`. Automated dependency PRs (Dependabot) are part of the deferred CI work in decision 009.

**Dependency rule.** A new dependency needs a stated reason it earns its place over the web platform or a few lines of our own code. That reason is recorded in the ADR or the commit that adds it. The rule applies to lint plugins and test helpers as much as to runtime packages — decisions 005 and 008 both resolved to zero new packages once the built-in option was checked.

## Why not the alternatives

Option 1 was already observed failing: two `latest` tags in the toolchain were incompatible with Angular 22 on the day the workspace was generated, and the failure surfaces as a confusing build error rather than an install error. Option 2 leaves exactly the packages that broke (TypeScript, Vitest) unpinned, so it doesn't solve the observed problem.

## Next step

Upgrade branches are run by hand until decision 009's CI work lands, at which point Dependabot opens the PRs. The pinned versions and the peer-range check are written up in `.agents/context/engineering-guidelines.md`.
