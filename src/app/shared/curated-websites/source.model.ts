/**
 * Data model for the app's one dataset — the websites this app lists and
 * links out to. Field names do NOT match the `data-col` attributes the
 * ported table CSS in `src/styles.css:242-360` keys on (`name`, `trust`,
 * `type`, `sig`, `ver`, `act`, `lang`, `desc`). Several are renamed for
 * clarity (`trust` -> `trustScore`, `sig` -> `capabilities`, `ver` ->
 * `verified`), and `act` has no field here at all. Task 4/5 will need a
 * display-row mapping layer from `Source` to grid columns — see
 * `HighlightRow` in `home.page.ts` for the shape that mapping should take.
 *
 * Naming note: `shared/curated-websites/CONTEXT.md` had earlier ruled out
 * the bare word "source" in `src/app/` code, in favour of `CuratedWebsite`.
 * `_architecture/plans/2026-09-16-phase-3-content-and-features.md` (D1, the
 * "Data model" section) supersedes that with a literal `Source` type and the
 * comments below, copied verbatim from the plan. This file follows the
 * newer, dated decision; the older rule is stale and flagged in this
 * folder's `CONTEXT.md` for reconciliation via an ADR in Task 7.
 */

/** 0–100. AI-assigned when the record is authored, never hand-filled. */
export type TrustScore = number;

/** Named for what it is, not for the four-letter chip the table draws. */
export type Capability = 'rss-feed' | 'site-search' | 'public-api';

export interface FeedEndpoint {
  readonly url: string;
  readonly name: string;
  readonly desc?: string;
  readonly format?: 'rss' | 'atom' | 'json';
}

export interface WebOutlet {
  readonly name: string;
  readonly url: string;
  readonly category: string;
  readonly description: string;
  readonly feeds?: readonly FeedEndpoint[];
}
export interface Source {
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
  readonly feeds?: readonly FeedEndpoint[];
  readonly searchUrl?: string; // {q} template for the right-hand key; absent = key falls back to url
  /** Optional source-code / GitHub README URL. Distinct from `url` (the
   *  marketplace or project home the name column opens). Empty when unknown. */
  readonly sourceUrl?: string;
  readonly lang?: string; // nice-to-have, not vital
  readonly region?: string; // nice-to-have, not vital
}

// No stored `domain`. It is derivable from `url`, so storing both invites
// them to disagree. The mockup's two-line source cell (name over dim mono
// domain) derives its second line at render time — a Task 4/5 concern.

// Trust is a score, not a tier. A two-value tier cannot support the `Trust`
// sort the search page offers — every trusted source would tie. The score
// is AI-assigned at authoring time so it never becomes hand-filled busywork.
// Sorting uses the raw number; display bands it into three border treatments:
//
//   Score      Label        Treatment
//   80–100     Trusted      solid
//   50–79      Known        dashed
//   below 50   Discovered   double
