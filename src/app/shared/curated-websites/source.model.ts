/**
 * Data model for the app's one dataset — the websites this app lists and
 * links out to. Field names are chosen to match the `data-col` attributes
 * the ported table CSS in `src/styles.css:242-360` already keys on
 * (`desc`, `ver`, `act`, `lang`), so the grid needs no re-styling once
 * Task 4/5 bind these records into it.
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
  readonly searchUrl?: string; // {q} template; absent = open the landing page
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
