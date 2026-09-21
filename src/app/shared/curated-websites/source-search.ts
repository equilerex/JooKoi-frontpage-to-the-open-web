import { Source } from './source.model';

/**
 * Pure, framework-free search and sort over an in-memory `Source[]`. No
 * Angular imports — directly unit-testable, per the plan's "Search"
 * section: "Client-side, synchronous... a linear scan per keystroke is far
 * below a frame budget."
 *
 * Two independent concerns:
 *   - Matching + relevance ranking (`filterByQuery`, `sortByRelevance`).
 *   - Plain sorts over whatever result set a caller already has
 *     (`sortByTrust`, `sortByVerified`, `sortByName`) — Task 5 calls
 *     whichever one the user picks via `SortMode`/`sortSources`.
 */

export type SortMode = 'relevance' | 'trust' | 'verified' | 'name';

/**
 * Field weights, highest first, per the plan: "name exact, name prefix,
 * domain, tags, category/type, desc." A name match that is neither exact
 * nor a prefix (a substring elsewhere in the name) isn't named by the plan;
 * it's placed just below prefix and above domain, since it's still the
 * `name` field outranking every other field.
 */
const FIELD_WEIGHT = {
  nameExact: 60,
  namePrefix: 50,
  nameContains: 45,
  domain: 40,
  tags: 30,
  categoryOrType: 20,
  desc: 10,
  none: 0,
} as const;

/** Trust bands from the plan's "Trust is a score, not a tier" table. Used
 *  only for the `Relevance` sort's tie-break (below); the `Trust` sort
 *  itself orders by the raw `trustScore`, which is the reason the score
 *  exists. */
function trustTier(trustScore: number): 0 | 1 | 2 {
  if (trustScore >= 80) return 2; // Trusted
  if (trustScore >= 50) return 1; // Known
  return 0; // Discovered
}

/** Trust bands from `source.model.ts`'s doc comment (80-100 Trusted, 50-79
 *  Known, below 50 Discovered). Display-only; ranking uses the raw score.
 *  Shared between `home.page.ts` (Task 4) and `search.page.ts` (Task 5) —
 *  the banding thresholds are domain logic, not page-specific presentation,
 *  so it lives in this framework-free module rather than being duplicated
 *  in each page's display-row mapping. */
export function trustLabel(trustScore: number): 'Trusted' | 'Known' | 'Discovered' {
  if (trustScore >= 80) return 'Trusted';
  if (trustScore >= 50) return 'Known';
  return 'Discovered';
}

/** Short, locale-aware rendering of `verified` (an ISO `YYYY-MM-DD` string,
 *  `source.model.ts`) for the results table — the raw ISO string is too wide
 *  for the `Verified` column at 1440px+. `timeZone: 'UTC'` pins the
 *  formatted day/month/year to the ISO string's own calendar date rather
 *  than reinterpreting it in the browser's local offset (`new Date` parses a
 *  date-only ISO string as UTC midnight, so without this a negative-offset
 *  timezone would roll it back a day); the locale itself is left as the
 *  browser default (`undefined`), which is what makes the day/month order
 *  and separator follow the viewer rather than a fixed European reading.
 *  Shared by `home.page.ts` (`toHighlightRow`) and `search.page.ts`
 *  (`toSearchRow`) — both render the same `verified` field the same way. */
const VERIFIED_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

export function formatVerifiedDate(iso: string): string {
  try {
    let dateStr = iso;
    if (/^\d{8}$/.test(iso)) {
      dateStr = `${iso.slice(0, 4)}-${iso.slice(4, 6)}-${iso.slice(6, 8)}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return iso;
    }
    return VERIFIED_DATE_FORMAT.format(d);
  } catch {
    return iso;
  }
}

/** No stored `domain` on `Source` (model comment) — derived here the same
 *  way display will derive it. Falls back to the raw `url` if it doesn't
 *  parse, so a malformed record degrades rather than throwing mid-search.
 *  Exported so `home.page.ts`'s display-row mapping (Task 4) derives the
 *  table's dim mono domain line the same way ranking does, instead of a
 *  second copy of this logic. */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Right-hand key href. GitHub/home lives on Name (`source.url`) and is
 * never this button when `searchUrl` exists. `{q}` is always substituted
 * (empty string if the box is empty) so the marketplace query-param syntax
 * stays in the URL — e.g. `.../author/openai?q=`.
 */
export function outboundSearchHref(
  source: Pick<Source, 'url' | 'searchUrl'>,
  query: string,
): string {
  const template = source.searchUrl;
  if (!template) {
    return source.url;
  }
  return template.replace('{q}', encodeURIComponent(query.trim()));
}

/** Case-insensitive, whitespace-split query terms. Collapses repeated
 *  whitespace and drops empty tokens, so `'  '`, `''` and `'a  b'` all
 *  behave sensibly — an empty query yields no terms, which makes every
 *  record match (see `matchesTerm`'s caller, `matchesQuery`). */
function splitQueryTerms(query: string): readonly string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

/** The highest-weight field a single lowercase `term` matches on `source`,
 *  or `FIELD_WEIGHT.none` if it matches nowhere. Both `matchesQuery` and
 *  `sortByRelevance` call this, so "does it match" and "how well" share one
 *  definition — a term can never rank a field it wasn't also matched on. */
function termFieldWeight(term: string, source: Source): number {
  const name = source.name.toLowerCase();
  if (name === term) {
    return FIELD_WEIGHT.nameExact;
  }
  if (name.startsWith(term)) {
    return FIELD_WEIGHT.namePrefix;
  }
  if (name.includes(term)) {
    return FIELD_WEIGHT.nameContains;
  }
  if (domainOf(source.url).toLowerCase().includes(term)) {
    return FIELD_WEIGHT.domain;
  }
  if (source.tags.some((tag) => tag.toLowerCase().includes(term))) {
    return FIELD_WEIGHT.tags;
  }
  if (source.category.toLowerCase().includes(term) || source.type.toLowerCase().includes(term)) {
    return FIELD_WEIGHT.categoryOrType;
  }
  if (source.desc.toLowerCase().includes(term)) {
    return FIELD_WEIGHT.desc;
  }
  return FIELD_WEIGHT.none;
}

/**
 * True when every whitespace-split term in `query` matches somewhere in
 * `source` (AND across terms, OR across fields — the plan's matching rule).
 * An empty or whitespace-only query matches everything, since there are no
 * terms left to fail.
 */
export function matchesQuery(source: Source, query: string): boolean {
  const terms = splitQueryTerms(query);
  return terms.every((term) => termFieldWeight(term, source) > FIELD_WEIGHT.none);
}

/** Filters `sources` down to the ones `matchesQuery` accepts. Order is not
 *  guaranteed — call `sortByRelevance` (or another sort) on the result. */
export function filterByQuery(sources: readonly Source[], query: string): readonly Source[] {
  return sources.filter((source) => matchesQuery(source, query));
}

/**
 * A record's relevance weight for `query`: the *weakest* of its terms'
 * per-term field weights. A multi-term query is only as strong as its
 * worst-matching term, so a record where every term hits `name` outranks
 * one where only one term does and the rest fall back to `desc`.
 */
function relevanceWeight(source: Source, terms: readonly string[]): number {
  if (terms.length === 0) {
    return FIELD_WEIGHT.none;
  }
  return Math.min(...terms.map((term) => termFieldWeight(term, source)));
}

/**
 * Ranks `sources` for `query`, highest relevance first. Ties break by trust
 * tier (not raw score — see `trustTier`), then by `verified` date
 * descending. This is the `Relevance` sort; does not filter — pass an
 * already-filtered set (typically `filterByQuery`'s result).
 */
export function sortByRelevance(sources: readonly Source[], query: string): readonly Source[] {
  const terms = splitQueryTerms(query);
  return [...sources].sort((a, b) => {
    const weightDiff = relevanceWeight(b, terms) - relevanceWeight(a, terms);
    if (weightDiff !== 0) {
      return weightDiff;
    }
    const tierDiff = trustTier(b.trustScore) - trustTier(a.trustScore);
    if (tierDiff !== 0) {
      return tierDiff;
    }
    // ISO `YYYY-MM-DD` strings compare lexicographically the same as
    // chronologically, so a plain string comparison sorts newest first.
    return b.verified.localeCompare(a.verified);
  });
}

/** `Trust` sort: raw `trustScore` descending — the reason the score exists
 *  rather than a tier. Ties break by name for a deterministic order. */
export function sortByTrust(sources: readonly Source[]): readonly Source[] {
  return [...sources].sort((a, b) => b.trustScore - a.trustScore || a.name.localeCompare(b.name));
}

/** `Verified` sort: most recently verified first. Ties break by name. */
export function sortByVerified(sources: readonly Source[]): readonly Source[] {
  return [...sources].sort(
    (a, b) => b.verified.localeCompare(a.verified) || a.name.localeCompare(b.name),
  );
}

/** `A–Z` sort: plain locale-aware name comparison. */
export function sortByName(sources: readonly Source[]): readonly Source[] {
  return [...sources].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Dispatches to the sort the search page's `Sort` control selected.
 * `relevance` needs `query`; the others ignore it. Convenience for Task 5
 * over calling the four functions above directly.
 */
export function sortSources(
  sources: readonly Source[],
  mode: SortMode,
  query: string,
): readonly Source[] {
  switch (mode) {
    case 'relevance':
      return sortByRelevance(sources, query);
    case 'trust':
      return sortByTrust(sources);
    case 'verified':
      return sortByVerified(sources);
    case 'name':
      return sortByName(sources);
  }
}
