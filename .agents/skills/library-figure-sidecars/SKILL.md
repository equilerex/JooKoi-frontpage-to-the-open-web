---
name: library-figure-sidecars
description: Use when adding or improving illustrations, diagrams or visual layout for library docs (the AI crash course in content/library/), including new topic docs, a doc resync that moved headings, and the phone-responsive pass. Not for the app's own pages or design-system components.
metadata:
  repo: JooKoi-frontpage-to-the-open-web
  origin: crash course makeover, decision 040 and item qc5w, 02-10-2026
---

# Library figure sidecars

Makes crash-course pages scannable and engaging with inline SVG figures that sit in sidecar files. The text is never touched. Mechanism and rationale: `_architecture/plans/decision-history/040-library-docs-get-designed-html-variants-beside-the-md.md`.

## What the user expects

- Not a wall of text. Concepts get explained visually: flows, comparisons, timelines, bar charts, matrices, card grids, decision trees, before/after pairs.
- Every substantial section earns a figure, not just the opening. The user found two earlier passes uneven: a hero at the top and nothing after. Rule of thumb: one figure per h2/h3 with real content, about one per 300-500 words. Sections that are only a list of links or a short note can stay bare.
- A figure explains or compares something from the doc. No decorative filler, no invented facts. Every number, name and date comes from the doc text.
- The `.md` stays the text source and is synced from another repo (`content:sync` overwrites it). Do not edit it or its `md-sha` pin.
- Looks fun and on-brand. SVG only; no stock photos unless the user asks.
- Must work on phones. See Responsive.

## Files and anchors

Per doc, next to `foo.md`:

- `foo.figs.html`: figures. Each is `<!-- after: heading-id -->` then `<figure class="fig"><svg viewBox="0 0 900 H" role="img" aria-label="...">...</svg><figcaption>...</figcaption></figure>`. The build inserts it after the first `p/ul/ol/table/pre/blockquote` following that heading (`injectFigures` in `scripts/build-library-content.mjs`). Several figures on one anchor stack in file order.
- `foo.top.html`: block prepended to the doc (README hero, reading path).
- `foo.html`: full custom page (turns off the plain facelift). Rare; only `0-how-llms-actually-work-under-the-hood`.

`heading-id` is `slugifyHeading`: lowercase, strip everything except `a-z 0-9 space -`, trim, spaces to `-`. So `2.2` becomes `22`, `jaychempan/Agent` becomes `jaychempanagent`, punctuation and em dashes vanish, a repeated heading gets `-2`. Derive anchors by script or from the generated `id="..."`, not by eye: hand-typed slugs were the one bug in the third pass (`agient` typo).

## Workflow

1. Map coverage first: list each doc's h2/h3 headings against its `<!-- after:` anchors. The uncovered headings are the work list. Do this per doc and rank by words per figure.
2. Read the section before drawing it. Pick the form that fits the claim: sequence is a flow, ranking is bars, versus is two columns, evolution is a timeline, a checklist is tiers, a pipeline is boxes and arrows.
3. Copy palette and markup from an existing sidecar (`topics/session-and-token-economics.figs.html` is the reference). Palette: purple `#6d45e0`, teal `#0e8c99` with tint `#e0f6f8`, amber `#c77d00` with `#fff1d6`, green `#12915a` with `#dff5ea`, text `#17152a`, muted `#5d5a78`. viewBox width 900, text 13px or larger, `text-anchor` set explicitly, no `<style>`, no external assets.
4. Append with targeted edits. Never rewrite a large sidecar whole. Keep existing figures.
5. Run `pnpm run content` (`node scripts/build-library-content.mjs`, not a production build) and fix any `figure anchor #... not found` warning. This is the only automated check there is.
6. Look at the pages in the running dev server at 1440px and 390px. Text width is guessed blind when writing SVG, so labels overflow boxes. This is the real verification and it must be done by whoever holds the browser, not by a subagent. Never start a second dev server.
7. Record in the items store (`qc5w` or a successor) via the `jookoi-paper-trail` script. Numbers in sidecars go stale on resync; flag that.

## Making it cheaper next time

- Parallelize by doc group: one subagent per 3-5 docs, each given the coverage gaps from step 1, the format above and this skill. Five agents covered 21 docs in about 3 minutes. Tell them: no builds, no tests, no lint, no commits, sidecars only, report anchors they are unsure of.
- Agents generate figures well from a throwaway script. Keep the output, discard the script. Sidecars are hand-edited sources afterwards.
- Have agents compute text width conservatively (about 8px per character at 14px) and wrap or shorten labels instead of trusting a single long line. This was the main unverified risk.
- Mixed LF/CRLF appears when agents append. Harmless; match the file if the lint hook complains.
- The user wants the first pass to be complete. Run step 1 before dispatching so nothing is left "bare minimum".

## Responsive

Two tiers, user decision 03-10-2026. Prefer a figure that fits a phone inline. Only complex figures that need the width fall back to tap-to-enlarge.

- **Fits inline (preferred):** give the `<figure>` a second svg, a phone redraw. Mark the original `class="fig-wide"` and add `<svg class="fig-narrow" viewBox="0 0 390 H" role="img" aria-label="...same label...">` inside the same `<figure>`, before the `<figcaption>`. At 768px and below CSS shows the narrow svg and hides the wide one, and no zoom pill appears (`src/styles.css` `.fig:has(.fig-narrow)`). Narrow rules: viewBox width 390, text 12.5px or larger, one column stack of cards or rows, no label wider than about 340 units (estimate 7px per character at 13px), bars shorter than 250 with the value label inside or above, no diagonal connectors. Same facts as the wide one.
- **Needs the width (fallback):** sequence diagrams, wide matrices, multi-lane timelines, anything that loses its meaning when stacked. Leave without a `.fig-narrow`. Below 768px it shrinks to a preview with no label (user: a pill covers the drawing, a tap is a pleasant surprise). A tap opens a 640px clone in a `<dialog>` that pans both ways and pinch-zooms (`ProseContentComponent`, `.fig-zoom`, decision 040 addendum). The zoom draws at 0.71x, so keep wide text at 13px or larger and expect readers to pinch.

## Checking figures

After a batch, run the overflow sweep in the dev server tab (chrome-devtools `evaluate_script`): for each doc, `history.pushState` to its route, dispatch `popstate`, wait about 900ms, then for every `joo-prose-content .fig svg` compare each `text.getBBox()` with the smallest `rect` that contains its centre, the viewBox, and other text boxes. Third pass found about 20 hits that way (long labels, bars scaled past 900, labels straddling two boxes). Also run a dedupe check on sidecars: agents appended identical blocks twice in three files, which renders the figure twice. Compare `<!-- after: -->` plus block text.

For `.fig-narrow` twins the sweep needs them visible: set `svg.style.display='block'` before reading `getBBox()` (hidden svgs report zeros) and expect viewBox width 390 and font size 12.5 or more. Look at the tall ones by eye (a stack over 600 units, hand-placed arrows, node meshes).
