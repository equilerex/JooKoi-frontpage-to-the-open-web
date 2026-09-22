# Phase 3 content and features

Session: 2026-09-16. Status: final, ready to implement, not started. Implementation is expected to run on a different model, so this plan is written to be read cold.

## Context

Phases 1 (foundation) and 2 (design system) are done. Phase 3 is content and features, and it had not been planned yet.

Two things forced this session. First, the real home page was built at `/` from the Phase 2 parts and then compared against the mockup screenshot-to-screenshot: it drifts from `features/design-theme/index.html` in roughly twenty visible ways, several of them structural rather than cosmetic. Second, the app has no behaviour at all — the mockups link page to page and their `demo.js` only toggles `aria-pressed`, so the search that the product is named after has never existed in any form.

The root cause of the largest visual drift was found and fixed during the session: `src/styles/base-element-styles.css` ported only `margin: 0` out of the mockup's `body` rule, dropping `background`, `color` and `font`. The canvas therefore fell back to the UA dark-mode default (a neutral black rather than the theme's purple-leaning `#07060d`) and inherited text fell back to the UA serif. That single omission accounted for the "too green / too flat" cast and for body copy rendering in Times New Roman. It is fixed; the rest of the drift is catalogued below and is in scope here.

This phase therefore bundles three things that would otherwise fight each other: the remaining design alignment, the first real data, and the first real features.

## Decisions taken this session

Each needs an ADR at implementation time, numbered from `017` (next free).

| #   | Decision                                                                                                                                                   | Reasoning                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Source records are a **hand-written TS fixture**, not `sources/` YAML with a build step                                                                    | The ingestion story (`source-ingest` skill, `probe-url.mjs`) now belongs to `JooKoi-developer-stack`. Committing to a YAML-plus-compiler pipeline here would design the schema before enough records exist to know its shape. A typed fixture is trivially migratable later.                                                                                                  |
| D2  | Page scope is **home, search, learn**                                                                                                                      | Supersedes the sitemap's MVP set. `browse` and `source_detail` are deferred: browse is query-less discovery that only pays off at a dataset size we do not have, and source detail is a whole page template for records that are currently one-liners. Learn earns its place because the content already exists and is written.                                               |
| D3  | AI skill marketplaces are a **category value on the ordinary source record**, not a second entity                                                          | Keeps one dataset and one rendering path. The home quick-key and the search filter both become pre-applied filters. Matches "one dataset, many views" in `product-concept.md` §35.                                                                                                                                                                                            |
| D4  | Typing on home **swaps the highlights table to results in place**                                                                                          | Same component, same position, content swaps. No overlay positioning, no outside-click handling, no focus trap.                                                                                                                                                                                                                                                               |
| D5  | Learn content is **vendored into this repo** and rendered at build time                                                                                    | The canonical copy stays in `JooKoi-developer-stack`. Reading it across a sibling path would hard-code `D:\repos\Serenity\...` and break CI and every other clone. Duplication is the accepted cost; D8 covers the re-sync.                                                                                                                                                   |
| D6  | Markdown is rendered by **`marked` at build time, as a devDependency**                                                                                     | `JooKoi-md-archive` already solved this (`web/src/app/core/services/markdown.service.ts`) but does it at runtime with `marked` + `highlight.js` + `mermaid` as shipped dependencies. Our content is static and known at build time, so the same library runs in a Node script instead and emits HTML strings. Zero runtime dependencies, zero bundle cost, and it prerenders. |
| D7  | The hero wordmark is the **sentence lockup**: eyebrow `FRONT PAGE TO THE` over logotype `OPEN WEB`, with the source count moved to the header status strip | The product is a statement about what the page is for, not a brand. A compound `OPENWEB` reads as a product name and inverts that. `JooKoi` leaves the UI entirely — it earns its keep as a memorable URL. Detail and the rejected alternatives are in "Wordmark and page identity".                                                                                          |
| D8  | Vendored learn content is **re-synced by hand**, with no sync script, hash or provenance check                                                             | The set is small and changes rarely, so a mechanism now would be built before its failure mode has ever occurred — the same "three occurrences, then encode" reasoning `sitemap.yaml` already applies to the link-decay checker. Revisit when manual re-sync actually starts going stale.                                                                                     |
| D9  | **No syntax highlighting.** `marked` renders fenced code to plain `<pre><code>`                                                                            | Fourteen fences across twenty documents, two of them labelled. `highlight.js` is not worth a dependency, even a dev-only one, at that volume. Purely additive later if it ever is.                                                                                                                                                                                            |

## Scope

**In:** the three pages above; the source fixture; client-side search; the design-alignment backlog; the design-system component work those require.

**Out:** `browse`, `source_detail`, `/explore`, and every other `parked` sitemap route; the ingestion pipeline; any server or API; authentication; persistence of user state.

**Mobile is explicitly deferred.** The user's instruction this session was to focus on the desktop/web layout first. Mobile must not be left _broken_, but matching `features/design-theme/`'s mobile treatment is not a goal of this phase and its remaining gaps stay in `BACKLOG.md`.

## Data model

One record type, in a typed fixture. Field names are chosen to match the `data-col` attributes the ported table CSS in `src/styles.css:242-360` already keys on, so the grid needs no re-styling.

```ts
/** 0–100. AI-assigned when the record is authored, never hand-filled. */
type TrustScore = number;

/** Named for what it is, not for the four-letter chip the table draws. */
type Capability = 'rss-feed' | 'site-search' | 'public-api';

interface Source {
  readonly id: string; // slug, stable, used in URLs later
  readonly name: string; // "MDN Web Docs"
  readonly url: string; // full URL; the displayed domain derives from this
  readonly desc: string; // no length rule
  readonly type: string; // specific, not a generic bucket — see below
  readonly category: string; // controlled vocabulary, incl. 'ai-marketplace'
  readonly tags: readonly string[];
  readonly trustScore: TrustScore;
  readonly capabilities: readonly Capability[];
  readonly verified: string; // ISO date
  readonly searchUrl?: string; // {q} template; absent = open the landing page
  readonly lang?: string; // nice-to-have, not vital
  readonly region?: string; // nice-to-have, not vital
}
```

**No stored `domain`.** It is derivable from `url`, so storing both invites them to disagree. The mockup's two-line source cell (name over dim mono domain) derives its second line at render time.

**Trust is a score, not a tier.** A two-value tier cannot support the `Trust` sort the search page offers — every trusted source would tie. The score is AI-assigned at authoring time so it never becomes hand-filled busywork. Sorting uses the raw number; display bands it into the three border treatments `classification-badge` already has, which keeps `features/design-theme/CONTEXT.md`'s "don't signal trust tier by colour alone" rule intact:

| Score    | Label      | Treatment |
| -------- | ---------- | --------- |
| 80–100   | Trusted    | solid     |
| 50–79    | Known      | dashed    |
| below 50 | Discovered | double    |

Worth naming the tension: `product-concept.md` §32 says trusted status stays curator-controlled. Delegating scoring to a model is the curator's own call to make, but the scores are editorial heuristics, not measurements, and the plan should not pretend otherwise.

**Capabilities are named semantically.** `RSS` / `SRCH` / `API` are display abbreviations for the mockup's `.sig` chips and nothing more; the data says `rss-feed`, `site-search`, `public-api`. Same rule applies to `type` and `category`: prefer a specific value over a generic bucket, because a generic one stops being useful the moment two unlike things land in it.

`searchUrl` is what makes `site_search_launch` work: substitute the query and send the user straight into the source's own search. When a source has no usable template, the action still renders and simply opens the landing page — a working link beats a missing one, and templates can be filled in later without touching the UI.

`lang` and `region` are optional. The audience is English-speaking, so language is not a primary axis; both are cheap to fill in and nice to have, so they stay in the model but neither blocks a record from being useful.

### Seed content

Five groups, roughly 50–60 records. Enough to make search, categories and filters meaningful, small enough to author by hand. Treat this as a first pass: deeper curation passes are expected, so a reasonable model-knowledge entry now beats an empty category.

1. **AI skill marketplaces** (`category: 'ai-marketplace'`) — the feature that motivated this phase. `JooKoi-developer-stack/ai-tooling-crash-course-for-developers/_ai-tooling-recommendations.md` already holds a verified, dated list with written descriptions: `mdskills.ai`, `agensi.io`, `mcpmarket.com`, plus the skill-library repos (`obra/superpowers`, `addyosmani/agent-skills`, `mattpocock/skills`, `vercel-labs/agent-skills`, `cloudflare/skills`). Copy the descriptions and verification dates from there rather than rewriting them.
2. **Open-web holdouts** — Wikipedia, Internet Archive, Marginalia Search, arXiv, Hacker News, Public Domain Review, Low-tech Magazine. `discovery-phase-review.md` already argues for Marginalia specifically and notes it has a working API today.
3. **Developer reference** — MDN and the other sources currently hard-coded in `home.page.ts`, promoted from placeholders to real records.
4. **News, deliberately not US-centric.** Two sub-groups. Mainstream European public-service and quality press: DR and Politiken (Denmark), Yle (Finland), SVT (Sweden), NRK (Norway), ERR News (Estonia), Der Spiegel, Le Monde, NRC, The Guardian, Euronews. Open-source and investigative outlets that show their working: Bellingcat, OCCRP, Correctiv, Follow the Money, Danwatch, Investigate Europe, ProPublica. Bellingcat in particular is the literal case of open-source investigation and belongs near the top of this group.
5. **Inspiration and things worth finding** — design and craft (Smashing Magazine, A List Apart, Are.na, It's Nice That), curiosity and positive news (Atlas Obscura, Colossal, Positive News, Reasons to be Cheerful, Kottke).

Note for whoever authors these: the earlier mockup content and the `estonia` tag lean Estonian, while this session's steer named Denmark. Both are represented above; if the regional emphasis should be one rather than both, that is a curation call to make while writing the fixture, not a code change.

## Search

Client-side, synchronous, over the in-memory fixture. No dependency and no index structure: at this record count a linear scan per keystroke is far below a frame budget, and adding a search library now would be solving a problem we do not have.

**Matching.** Case-insensitive, query split on whitespace, every term must match somewhere in the record (AND across terms, OR across fields).

**Ranking.** Weighted by which field matched, highest first: `name` exact, `name` prefix, `domain`, `tags`, `category`/`type`, `desc`. Ties break by trust tier, then by `verified` date descending. This is the `Relevance` sort; `Trust`, `Verified` and `A–Z` are plain sorts over the same result set.

Put this in a pure, framework-free module with no Angular imports, so it is directly unit-testable without a harness. This is the one part of the phase where tests clearly earn their place under the repo's "no tests for the sake of tests" rule — the ranking is real logic with real edge cases, unlike the components around it.

## Pages

### Home — `/`

The launcher panel, the stripe rule and the tag panel keep their current structure. Two behavioural changes:

- The console input becomes a live-bound signal. Empty query renders the curated "Trusted highlights" set. A non-empty query swaps the same panel to ranked results in place (D4), retitling it and showing the match count. Submitting (Enter, or the Launch key) navigates to `/search?q=…`.
- Quick keys become real navigation into pre-filtered search. `F1`–`F5` map to categories; the **AI marketplace** key is the new one and is the reason `F6` in the mockup is styled hot (`key--hot`) — it should carry that accent and a real count, not the mockup's placeholder `?`.

### Search — `/search?q=`

Query lives in the URL and is the single source of truth, so the page is linkable and the back button behaves. Layout follows `features/design-theme/search.html`: a filter rack aside plus a results panel.

- **Header gains a compact console** (`hud__search console console--compact` in the mock) on inner pages but not on home. This resolves a confusion from earlier in the session: the missing header search bar is correct behaviour on `/`, and a genuine gap on `/search`.
- **Filters**, following the mock: `Trusted only` toggle, which now means `trustScore >= 80` rather than a tier equality; `Has RSS` / `Has site search` / `Has API` toggles, bound to the semantic `capabilities` values; `Type` and `Region` selects. Add **Category**, carrying the AI-marketplace filter (D3). **Language is demoted** — the audience is English-speaking and `lang` is optional, so render that select only when the dataset actually holds more than one language, rather than shipping a control with one option in it.
- **Sort**: `Relevance` / `Trust` / `Verified` / `A–Z`. `Trust` sorts on the raw `trustScore`, which is the reason the score exists.
- Results reuse the home table plus a `lang` column and a direct-search action per row.
- Filter and sort state belong in the URL alongside `q`.

### Learn — `/learn` and `/learn/:topic`

Promotes `education_home` and `education_topic` from `parked` to built; update `sitemap.yaml` accordingly.

- `/learn` is the index. Source of truth is the crash course's own `topic-index.md`. Rendered as a tree — **PrimeNG's `p-tree`**, wrapped as a design-system component. This would be the fourth sanctioned PrimeNG adoption after `chrome-select`, `filter-drawer` and `record-grid`, so it gets the same time-boxed skin check those got in Phase 2 task 9: if it cannot be made to match the theme in the time box, build our own and log the deviation.
- `/learn/:topic` renders one article. The mockup (`learn-topic.html`) is `breadcrumb` → `article.sheet.prose` → `pager`, and `breadcrumb-trail`, `paper-sheet`, `prose-content` and `pager` all already exist in the design system. This page should be mostly composition.
- All 20 documents ship (19 topics plus `0-how-llms-actually-work-under-the-hood.md`).
- Routes are prerendered, so `/learn/:topic` needs its route list supplied to the prerenderer from the generated content module.

**Later, not now:** the user has flagged wanting a more interesting way to drill into these pages than a plain tree. Logged to `BACKLOG.md`, not designed here.

### Content pipeline

`scripts/build-learn-content.mjs`, chained into the build ahead of `ng build`:

1. Read vendored markdown from `content/learn/`.
2. Parse front matter and the H1 for title and ordering.
3. Render to HTML with `marked` (devDependency).
4. Emit a generated, gitignored TS module: typed topic records with `slug`, `title`, `order`, `html`, plus the route list for prerendering.

This mirrors the existing secrets-materialisation pattern in this repo — a gitignored module built by a script chained into the build — so it is a shape the codebase already uses.

## Wordmark and page identity

The product is _Front page to the open web_. Rendering that as the single compound `OPENWEB` reads as a product name, which inverts the intent — the phrase is a statement about what the page is for, not a brand to be recognised. But "open web" does need to be present and prominent, and `JooKoi` does not belong in the design at all; it earns its keep as a memorable URL, not as an on-screen mark.

One observation that carries most of the fix on its own: the current template is `Open<b>Web</b>`. Inserting a single space — `Open <b>Web</b>` — turns a compound brand into two ordinary words while keeping the existing italic accent on the second. No component change, no CSS change.

Three lockups were considered, all buildable from `eyebrow-label` and `logotype` as they already exist. **A is chosen (D7).** B and C are recorded so the reasoning is not re-litigated later.

**A. Sentence lockup — build this**

```
FRONT PAGE TO THE        <- eyebrow: small, letterspaced, dim
OPEN WEB                 <- logotype: full size, WEB italic
Find the sites worth …   <- existing lede
```

The whole name reads top to bottom as one sentence. The big words carry the message and the eyebrow supplies the grammar, so nothing reads as a brand. The mockup's current eyebrow text (`FRONT PAGE TERMINAL · 412 SOURCES INDEXED`) gives up its slot, and the source count moves to the header status strip — which the mock already specifies as `412 SRC ONLINE` and which we have to build anyway for alignment item #3. Nothing is lost.

**B. Statement beneath — rejected**

```
OPEN WEB
front page to the open web · 412 sources indexed
```

Keeps the eyebrow free for terminal flavour and keeps the count adjacent to the mark. Costs a repetition: "open web" appears twice in three lines.

**C. Above and below — rejected**

```
FRONT PAGE TO THE
OPEN WEB
412 SOURCES INDEXED · TRUSTED, NOT RANKED
```

The literal "smaller text above and below" idea. Strongest as a statement, but it stacks three type sizes directly above the lede and the launcher console, and the launcher is already the densest region of the page.

All three keep the header brand as a small `OPEN WEB`, dropping `JOOKOI` from the UI.

## Design alignment backlog

Catalogued by screenshot comparison against `features/design-theme/index.html`. `#20` (background) and `#4` (serif body text) are **already fixed**; the rest are open.

**Wrong component chosen — the real work**

| #   | Gap                                                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | Source cell should be bold name over dim mono domain on two lines; currently one flat line joined by an em-dash. This also distorts every column width.                                                                                             |
| 12  | Trust cell should be a cyan-bordered `◆ TRUSTED` chip (`.trust--trusted`); currently plain text. `classification-badge` exists and is unused.                                                                                                       |
| 13  | Signals should be separate bordered mono pills (`.sig`); currently a comma-joined string. `capability-tag` exists and is unused.                                                                                                                    |
| 14  | Row action should be a bordered `OPEN` key (`.key--xs`); currently plain text.                                                                                                                                                                      |
| 18  | Tag chips are the wrong object entirely. Mock `.chip` is a flat lowercase pill with an inline dim count, all eight on one row. We render raised uppercase `hardware-key` + boxed `count-chip`, wrapping to two rows. Needs a real `chip` component. |

Items 11–14 all stem from one limitation: `record-grid` renders `{{ row[col.field] }}` and nothing else. Either give it a cell-template API, or drop it here for a hand-written `.data-table` whose CSS is already ported in `src/styles.css:242-360`. **Resolve this first** — it decides four of the five items above and affects the search page too.

**Cheap — porting numbers from the mock**

| #     | Gap                                                                                                                                                                                                                                                 |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5     | Logotype→lede gap is roughly double the mock's.                                                                                                                                                                                                     |
| 6     | Console box ~12px short; Launch key undersized.                                                                                                                                                                                                     |
| 7     | Keycaps ~11px short each (mock `.keycap` is `min-height: 4.5rem`).                                                                                                                                                                                  |
| 8     | `F6` needs the `key--hot` accent and a real count. `keycap` currently has no `accent` passthrough to `hardware-key`.                                                                                                                                |
| 9     | Stripe rule should be 10px of 2px lines sitting flush under the launcher inside the bracket frame; currently thicker, brighter and detached.                                                                                                        |
| 10/17 | Panel LEDs are inverted. Mock puts a cyan LED beside the _title_ and leaves `recently verified` as plain text; we omit the title LED and wrongly put one before the meta. Tag panel is missing its magenta LED. `readout-panel` needs an LED input. |
| 15    | Table rows ~45px against the mock's ~60px.                                                                                                                                                                                                          |
| 16    | `About` and `Verified` text is blue-tinted; mock uses neutral `--text-muted`.                                                                                                                                                                       |
| 22    | Panels look flat — mock `.panel` carries `box-shadow: 0 12px 32px var(--shadow-deep)`.                                                                                                                                                              |

**Retracted after checking at full resolution:** logotype size and corner brackets are fine, and the grid-height difference was a viewport artefact of the two screenshots, not a defect.

**Header (1/2/3)** — brand reads `JOOKOI` vs the mock's `OPENWEB`; the mock's `SEARCH`/`BROWSE`/`LEARN` nav and its `412 SRC ONLINE` status strip are both absent. `app-shell-layout.component.ts:30` hard-codes `navItems` to a single `Home` entry behind a "Phase 3 replaces this" comment — this phase is where that happens. The brand-name difference is a product question, not a bug — settled in "Wordmark and page identity" above, which also moves the source count into that status strip.

## Design-system work implied

- `readout-panel`: LED input (#10/#17).
- `keycap`: `accent` passthrough (#8).
- `record-grid`: cell templates, or the decision to bypass it (#11–14).
- New `chip` component (#18).
- New tree component wrapping `p-tree` (learn index).
- `heads-up-display-header`: nav items, status strip, and the compact console on inner pages.

Everything here stays inside the design system's agnostic rule — no Router, no stores, no app-shell imports below `shared/design-system/`.

## Build order

1. Resolve the `record-grid` cell-template question. It blocks the most items and both table pages.
2. Design-system component work above, each appearing in `/specimen`.
3. Design alignment: cheap batch, then the rewritten table and chips.
4. Source fixture and the search module, with unit tests on ranking.
5. Home behaviour: live results, quick keys.
6. Search page.
7. Content pipeline, then the two learn routes.
8. Paper trail: ADRs `017`+, `ARCHITECTURE.md`, `sitemap.yaml` status changes, and the stale `home.page.*` "Phase 3 placeholder" lines at `ARCHITECTURE.md:47,59`.

Gates are `AGENTS.md`'s Iteration loop table and nowhere else. Verification happens in the running dev server, by whoever holds the browser tools.

## Deliberately deferred

Nothing in this plan is left undecided. These were considered and pushed out on purpose, so an implementer should not treat their absence as an oversight or design them in passing.

- **Content re-sync tooling** (D8) — by hand for now.
- **Source ingestion** — stays in `JooKoi-developer-stack`; this phase hand-authors the fixture (D1).
- **`browse` and `source_detail`** — deferred with the rest of the `parked` routes (D2).
- **Mobile parity** with `features/design-theme/` — must not be broken, is not a goal; remaining gaps stay in `BACKLOG.md`.
- **A richer drill-in UI for learn** than the tree — logged in `BACKLOG.md`.

## Notes for the implementing model

- Build in the order below. Step 1 is genuinely blocking: it decides four alignment items and the shape of both table pages, so do not start the table work before it is settled.
- Gates are the Iteration loop table in `AGENTS.md` and nowhere else. In particular: no production build, no lint or format by hand, no test run outside a batch boundary.
- The dev server stays up for the whole session. If it is down, report that and stop — do not start a second one.
- You will not be able to verify the UI yourself if you are running without browser tools. Report what you changed and what you could not check, rather than reaching for a build as a substitute.
- Anything that turns out to contradict this plan goes in "Implementation deviations" below, at the moment it is decided. A run's context is gone by the time it ends.

## Implementation deviations

<!-- Added once the build diverges from what this plan said. Future reads reconcile
     against this section, not just the sections above. -->

- **2026-09-16, mid-build (after Task 2, during Task 3):** user overrode the "Search — /search?q="
  section's implicit design (header console appears on inner pages only, not home) after seeing
  the built home page and finding the missing header search bar confusing there too. Decision:
  the compact header console (`hud__search console console--compact`) appears on **every** page,
  home included, submitting straight to `/search?q=…`. Home therefore keeps two search entry
  points: the large launcher console (live in-place results per D4) and the small header one.
  Task 2 built the header without this on home — folded into Task 4's brief as a fix, since
  Task 4 already touches `home.page.*` and the live-console behaviour.

- **2026-09-16, mid-build (after Task 5, during Task 6):** user asked that every outbound
  result-row link (home table's `OPEN` key, search page's `OPEN` key, and the per-row
  direct-search action D1 built) open in a new tab (`target="_blank" rel="noopener"`)
  rather than navigating the app away. Small fix, queued to apply after Task 6 completes
  (touches `home.page.html`/`search.page.html`, which Task 6 doesn't).

- **2026-09-16, after the final whole-branch review, reverses D4/ADR 020:** the search
  query (`q`) no longer filters the results table on **either** page. Strict scope,
  confirmed by the user: home's table always shows the curated "Trusted highlights" set
  (D4's live in-place swap-to-ranked-results-on-typing behaviour is dropped); `/search`'s
  table is driven only by the sidebar filters, never by `q`. `q` still does two things on
  both pages: it's what Enter/Launch/the header console submits into `/search?q=…`, and
  it's what gets substituted into a row's direct-search action (D1's `searchUrl`
  mechanism) — so home's plain `OPEN` key needs to become the same query-aware
  Search↗/Open action `/search` already has. `Relevance` as a sort option on `/search`
  becomes meaningless without query-filtering feeding it real matches — resolve this in
  the same pass (drop it, or repurpose/rename it; controller's call at implementation
  time). ADR update owed alongside/instead of ADR 020 at the next paper-trail pass —
  logged to `BACKLOG.md` in the meantime, not written here since this is mid-fix, not a
  planning session.
