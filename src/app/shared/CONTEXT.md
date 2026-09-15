# shared/

Code used by **more than one** feature, or by the shell and a feature. Everything else lives in the feature that uses it.

Rules: `_architecture/plans/decisions/005-workspace-location-folders-and-naming.md`. Full map: `_architecture/ARCHITECTURE.md`.

> Nothing is built here yet. `shared/design-system/` arrives in Phase 2, `shared/curated-websites/` in Phase 3. This file is the rule that governs them when they're created.

## What qualifies

`shared/` is the one folder in the app with a general name. Every folder **inside** it names exactly what it is — `design-system/`, `curated-websites/`, `keyboard-shortcuts/`. No `utils/`, `helpers/`, `common/`, `core/`.

Something qualifies only when placement rules 3, 4 or 5 apply:

| It is…                                                                           | Goes in                                               |
| -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Used by 2+ features (or shell + a feature), and knows about curated websites     | `shared/curated-websites/`                            |
| Usable by anyone, knows nothing about websites, routes or app state              | `shared/design-system/`                               |
| App-wide behaviour rather than something you see (hotkeys, storage, preferences) | its own folder in `shared/`, named after what it does |
| Used by exactly one feature                                                      | **not here** — that feature's folder                  |
| Rendered once around every page                                                  | **not here** — `app-shell/`                           |

Planned folders, named in the map but not created: `keyboard-shortcuts/` (global hotkey registry behind the HUD keycaps), and parked `browser-storage/` and `local-preferences/`.

## Promote on the second consumer

Code moves up into `shared/` **when a second consumer appears, not before**, and the move happens in the same change that adds that second consumer. Don't pre-place something here because it "feels reusable".

No `<feature>-shared/` folders, and no shared folder that exists to hold leftovers.

## Imports

- `shared/design-system` imports nothing from the app — not other `shared/*` folders, not features, not the shell.
- Other `shared/*` folders may import `shared/design-system`.
- Other `shared/*` folders **do not import each other**. If two of them need each other, that's a signal the split is wrong: either merge them or update ADR 005. Don't work around the lint rule.
- `shared/*` never imports a feature or `app-shell`.

Enforced by generated `no-restricted-imports` blocks in `eslint.config.js`, which read this folder's subdirectory listing at lint time. A new `shared/` subfolder is covered automatically on the next lint run.

## Conventions

- Components here follow the normal-component rules: own subfolder, `.component.ts`, `joo-` element selector, data in through `input()`, events out through `output()`. There are no page components in `shared/`.
- Stores here are root-provided (`providedIn: 'root'`) and follow ADR 010's store rules — a store never fetches, it calls a `.service.ts` in the same folder.
