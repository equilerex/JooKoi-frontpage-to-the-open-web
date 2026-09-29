# Landing page running RSS feed

Session: 29-09-2026 03:25. Status: In progress. Build script implemented and generating articles. UI integration pending.

## Context

The landing page presents a search console, category quick keys, top tags, and a table of static curated highlights (`HOME_HIGHLIGHTS`). While this directs users to sources, it does not show what those sources are currently publishing.

The goal is to aggregate recent entries from curated open web sources into a running news and article feed on the landing page. Users can scan fresh headlines from open web publications without leaving the launcher console.

## Architecture

1. **Build-time Node.js execution.** The feed collection runs entirely in Node.js at build time and on GitHub Actions CI. It issues standard HTTP GET requests (like curl, desktop feed readers, or search crawlers) to download public XML feeds directly from publisher servers.
2. **Zero client-side feed fetching.** The browser makes no network requests to external RSS endpoints. It consumes the pre-parsed, static feed data compiled during the build.
3. **Generated static artifacts:**
   - `data/running-feed.json`: Machine-observed article history (fast clock).
   - `src/app/shared/curated-websites/running-feed.generated.ts`: Typed constant array (`RUNNING_FEED_ARTICLES`) ready for instant imports on the landing page with zero runtime network delay.

## Feed compilation pipeline (`scripts/build-running-feed.mjs`)

The compiler script:

- Reads all source definitions in `sources/*.json`.
- Identifies sources that declare active RSS/Atom endpoints in their `feeds` array.
- Issues HTTP GET requests with custom User-Agent headers in concurrent batches.
- Handles RSS 2.0 (`<item>`) and Atom 1.0 (`<entry>`) XML formats, decoding CDATA blocks and HTML entities.
- Extracts headline title, direct article link, publication timestamp, source identity, and excerpt snippet.
- Sorts articles descending by date, deduplicates by URL, and outputs the top 50 items.
- Runs via `pnpm run feed:build`, and is wired into `pnpm run build`.

## UI and visual integration

The feed renders on `src/app/app-shell/home.page.ts` following the retro HUD visual language:

- **Wire panel presentation:**
  - Relative timestamp (for example "2h ago", "yesterday")
  - Source callsign chip linking to source details
  - Article headline linking directly to the outbound article
  - Category tag
- **Layout on landing page:**
  - Integrated into `ConsoleLandingTemplateComponent` below or alongside the directory table.

## Build order

1. [x] Create `scripts/build-running-feed.mjs` to fetch and parse public XML feeds into static JSON and TypeScript.
2. [x] Wire `feed:build` script into `package.json` build pipeline.
3. [ ] Build the UI component for feed article display in `src/app/shared/design-system/data-display/`.
4. [ ] Integrate feed list into `src/app/app-shell/home.page.ts`.
5. [ ] Configure GitHub Actions cron to periodically trigger build and redeploy.

## Implementation deviations

- Zero external XML parsing libraries were added. Pure Node.js regex and entity decoding handles RSS 2.0 and Atom 1.0 cleanly without bloat.
