# Decision 015 — app.config.ts may import app-shell

Date: 2026-09-15

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Decision 005 fixes the import direction as "only `app.routes.ts` and `app.component.ts` import `app-shell`", and `eslint.config.js` generates that rule as an `ignores` list of exactly those two paths.

`app-shell/page-title.strategy.ts` defines `PageTitleStrategy`, and a `TitleStrategy` has to be registered in the application's environment injector — a root component's `providers` array is an element injector and the `Router` cannot see it from there. That means `app.config.ts`, which was not on the list.

## Options considered

1. Add `src/app/app.config.ts` to the rule's `ignores` list, keeping the strategy in `app-shell/`.
2. Move `page-title.strategy.ts` out of `app-shell/` — to its own `shared/` folder, per decision 005's placement rule 5 ("app-wide behaviour rather than something you see → its own folder in `shared/`").
3. Provide it from `app.component.ts`, which may already import `app-shell/`.

## Decision

Option 1. `app.config.ts` joins `app.routes.ts` and `app.component.ts` as a root file permitted to import `app-shell/`.

## Why not the alternatives

**Option 2 is a literal match for decision 005's placement rule but contradicts every other record of where this file goes.** `_architecture/ARCHITECTURE.md` (`:63` folder map, `:278` Phase 2 list), `src/app/app-shell/CONTEXT.md` and the Phase 2 plan all put `page-title.strategy.ts` in `app-shell/`, and the folder's own one-line description already names the page title strategy. Moving it would invalidate four documents to satisfy one clause — and that clause's "app-wide behaviour" wording is aimed at folders like stores and services, not at a file the shell owns and nothing else composes.

**Option 3 does not work.** Angular resolves `TitleStrategy` for the `Router` from the environment injector; `provideRouter` and `bootstrapApplication`'s `appConfig.providers` are where it has to be declared. A root component's `providers` array goes to its element injector and is invisible to the `Router`.

The chosen option is not a widening of the boundary. `app.config.ts` is the composition root — a sibling of `app.component.ts` in the same layer, importing `app.routes.ts`, `primeui-license.ts` and `shared/design-system/theme/*` for exactly this reason. The `ignores` list enumerated two of the three root files and was written before the third needed anything from the shell.

## Next step

Done. Decision 005's import-direction sentence was amended in place to name all three root files, so this decision and that one now agree. `eslint.config.js`'s comment above the generated block states the same three-file list.
