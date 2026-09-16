# shared/curated-websites/

The domain: the websites this app lists and links out to. Models, data access, the root store, pure filtering functions, and the components that render a website.

Rules: ADRs `005` (vocabulary, folders) and `010` (state). Full map: `_architecture/ARCHITECTURE.md`.

> **Phase 3 task 3 started this folder.** `source.model.ts`, `source-fixture.ts` and `source-search.ts` (+ spec) exist; the store, service and components below are still unbuilt.

## Vocabulary — superseded for the data model, still true for everything else

The things this app lists are **curated websites**. In code, **never** the bare word "source": in an engineering context it reads as source code, and an earlier draft that used it produced `source-directory/` and a `Source` model that nobody could read at a glance.

**Exception, resolved by ADR 026:** `_architecture/plans/2026-09-16-phase-3-content-and-features.md`'s "Data model" section specifies the record type as `Source`, verbatim, including the `TrustScore`/`Capability` comments — a newer, dated, explicit decision that overrides this rule for the data model specifically. `source.model.ts`, `source-fixture.ts` and `source-search.ts` follow the plan and use `Source`/`source-*`, not `CuratedWebsite`/`website-*`. ADR 026 formalizes this as a narrow, permanent exception rather than a rename:

- Model `Source` (not `CuratedWebsite`), files `source.model.ts` / `source-fixture.ts` / `source-search.ts`.
- The rest of this rule still holds for anything not yet built: components stay `website-*`, the store stays `CuratedWebsitesStore` (or is renamed alongside the model — a call for the ADR above, not decided here).
- "Source" stays correct outside `src/app/`: the `sources/` data folder (human-authored input) and the `source-ingest` skill. Those keep their names for now. (The `sources/` folder itself is still empty — task 3's fixture lives in `src/app/shared/curated-websites/` instead, because `tsconfig.app.json`/`tsconfig.spec.json` only include `src/**/*.ts`; a file under root `sources/` wouldn't compile or be testable without a tsconfig change, which was out of this task's scope.)
- `_architecture/sitemap.yaml` still says `source_detail` and `/source/:id`. Renaming the public route is a product call logged in `_architecture/BACKLOG.md` — don't do it as a side effect of feature work.

## Service vs store — the split

Two files, two jobs, and they don't blur:

| `curated-websites-data.service.ts`                                                                          | `curated-websites.store.ts`                                                              |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Data access only.** Knows how the data arrives                                                            | **State only.** Holds websites and categories as signals                                 |
| Returns data. Holds no state                                                                                | Calls the service to get data. **Never fetches, imports or reads a file itself**         |
| Its public API doesn't leak the mechanism — swapping bundled JSON for `httpResource` changes only this file | Built with `withState`, `withComputed`, `withMethods`, `withHooks`; `providedIn: 'root'` |

How data actually arrives — bundled JSON import, or per-category JSON fetched with `httpResource` (which works with prerendering) — is a Phase 3 data-pipeline decision, and it lives behind the service.

## Store rules (ADR 010)

- One store per file, `<thing>.store.ts`, exporting `<Thing>Store`.
- **Only page components inject stores.** Components in this folder are normal components: `input()` in, `output()` out.
- Stores don't inject other stores. When two need coordinating, the page does it. If that grows, write an ADR.
- State changes only through store methods. `patchState` stays inside the store.
- No `effect` for syncing state — `withComputed`, `computed` or `linkedSignal`.

Search/filter state is **not** held here. It lives in the URL, mirrored by `website-search/website-search-query.store.ts`, which is route-scoped. This store holds only the read-only catalogue.

## Planned contents

Models: `curated-website.model.ts`, `website-category.model.ts`, `trust-tier.model.ts`, `capability-signal.model.ts`.

Pure functions, plain `.ts` files with named exports and no Angular in them (the one place plain unit tests are clearly worth writing):

- `website-filtering.ts` — filter and sort by trust, language, region, type, RSS, site search.
- `site-search-url.ts` — sitemap `site_search_launch`: a query plus a website becomes that website's own search URL.

Components, each in its own folder: `website-result-card/`, `trust-tier-badge/`, `capability-signal-list/`, `outbound-website-link/`, `direct-site-search-form/`. These are the domain-flavoured counterparts to the mockup's `.trust`, `.sig`/`.sigs` and `.src-name`/`.src-domain` classes, built on top of `shared/design-system/` components.

## Imports

- This folder may import `shared/design-system/`.
- It must **not** import other `shared/*` folders or `app-shell/`. It must not import any feature folder (convention only — not lint-enforced).
- Features and the shell may import from here. `shared/design-system/` may not.

Enforced by the generated `no-restricted-imports` blocks in `eslint.config.js`.

## Open question

Steyer's 2026 layout would make the domain its own top-level folder rather than a child of `shared/`. It sits here because every feature uses it and the user wanted `shared/` to hold stores and services. Logged in `_architecture/BACKLOG.md`; if it moves, ADR 005 gets superseded, not edited.
