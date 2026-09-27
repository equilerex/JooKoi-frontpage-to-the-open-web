# Browser search integration: OpenSearch and bang keys

Session: 27-09-2026 16:52. Status: planned, not started. Depends on `2026-09-27-sources-data-pipeline` (new `keys` field and a generated key index).

## Context

Discovery review A2 argues that the search launcher, not the directory, is the product: a directory is visited monthly, a query box is used daily, and "if the reason [to add a source] is 'I want `!mdn` to work,' every addition pays you back immediately. The launcher makes the dataset self-motivating." The app has the pieces (`/search?q=`, per-source `searchUrl` templates, `outboundSearchHref` in `source-search.ts:112`) but is still only reachable by opening it in a tab first. It can't be set as the browser's search engine, and a query can't be routed straight to one source.

This serves claim 3 of the gate (action, not answer): the query lands in the source's own search in one step, without passing through a results page.

## Design

### OpenSearch description

`opensearch.xml` with `<Url type="text/html" template="{origin}{base}search?q={searchTerms}"/>`, plus `<link rel="search" type="application/opensearchdescription+xml" title="JooKoi" href="opensearch.xml">` in `src/index.html`. The `href` is relative so it resolves against `<base href>` on the GitHub Pages subpath.

The template has to be absolute, and the origin and base differ between dev and Pages, so the file is generated rather than kept in `public/`. `build-gh-pages.mjs` writes it into `dist/.../browser/` from `BASE_HREF` and a `PAGES_ORIGIN` env var that defaults to `https://equilerex.github.io`. Dev gets no file, the 404 on the link is harmless.

Firefox offers "Add JooKoi" from the address bar once the link tag is present. Chrome auto-detection is unreliable for sites on a subpath, so the fallback, documented in the page footer or README, is adding it by hand in `chrome://settings/searchEngines` with `.../search?q=%s`. That works in every browser regardless of OpenSearch.

### Bang keys

Syntax: `!key terms`, DuckDuckGo-style. The `!` prefix means a plain query can never trigger a redirect by accident.

- `!mdn flexbox` → `searchUrl` of the source keyed `mdn`, with `{q}` = `flexbox`.
- `!mdn` alone → that source's `url`.
- `!unknown flexbox` → normal `/search?q=flexbox` results, with a notice that the key is unknown.

Keys are data. New optional field `keys: string[]` on `Source`, short and explicit (`mdn`, `gh`, `wiki`), not derived from `id` (ids are slugs like `mdn-web-docs`). `build-sources.mjs` validates keys are lowercase `[a-z0-9]+` and unique across all records, and emits `source-keys.generated.ts`: a map from key to `{ url, searchUrl }` for keyed records only. That is small (a few kB for dozens of keys) and holds none of the dataset.

Where the redirect runs: a generated classic script, `public/bangs.js`, loaded with a plain blocking `<script src="bangs.js">` in the `<head>` of `src/index.html`. It holds the key map and a few lines of resolver. On any page other than `search` with a `q` starting with `!` it returns immediately. Otherwise it calls `location.replace(target)` before first paint. `/search` is prerendered, so the browser paints static HTML before `main.js` runs: an Angular initializer would show an empty search page and then leave. `replace`, not `assign`, so Back does not bounce into the redirect again. The prerenderer never evaluates the script.

The home console input goes through the same resolution on submit (a TS `resolveBang(q, index)` over the same generated key index, using `outboundSearchHref` from `source-search.ts:112` for the `{q}` substitution), so `!mdn flexbox` typed into the launcher behaves the same as from the address bar. The substitution rule is one line in both copies.

### Discoverability

A record with keys shows them in its row (a small mono `!mdn` next to the name). `q` no longer filters the table (t036 ADR update: q no longer filters results tables), so there is no "type `!` to list" mode. The key chips in rows are the discovery path. No separate help page.

## Open questions for the user

1. Initial key set. The plan needs a first batch to be useful from day one. Proposal: the user names the 10 to 20 sources they would actually search from the address bar, keys get added in `sources/`, more arrive with use.
2. Should the site's own search stay the default when there is no `!`, or should the default be a chosen fallback engine (for example a privacy search engine) so the browser integration can replace the user's default search outright? The first keeps JooKoi a directory search. The second makes it a front door for every query, which is closer to A2 but sends unkeyed queries to a third party.

## Build order

1. `keys` in the schema and validation, `source-keys.generated.ts` and `public/bangs.js` from `build-sources.mjs`. First key batch in `sources/`.
2. Pure resolver `resolveBang(q, index)` in `shared/curated-websites/` with a spec. It is exactly the kind of small pure function a test pays for.
3. `<script src="bangs.js">` in the `<head>` of `src/index.html`, and the home submit path.
4. `opensearch.xml` generation in `build-gh-pages.mjs`, link tag in `index.html`.
5. Key chips in rows. Checked in the running browser at 390 px and 1440 px.
6. Verify on the deployed Pages site: add as search engine in Firefox and Chrome, run a keyed and an unkeyed query from the address bar.
7. Paper trail: `shared/curated-websites/CONTEXT.md` (keys rules), `sources/CONTEXT.md` (how to add a key), `sitemap.yaml` (`site_search_launch` gains the bang path).

## Implementation deviations
