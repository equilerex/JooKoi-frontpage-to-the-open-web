import { Source } from './source.model';
import {
  filterByQuery,
  matchesQuery,
  sortByName,
  sortByRelevance,
  sortByTrust,
  sortByVerified,
  sortSources,
  trustLabel,
} from './source-search';

/** Small, purpose-built fixture — deliberately not the full
 *  `SOURCE_FIXTURE` — so every field-weight tier and tie-break has an
 *  unambiguous, hand-picked record behind it. */
function makeSource(overrides: Partial<Source> & Pick<Source, 'id'>): Source {
  return {
    name: 'Placeholder',
    url: 'https://example.com',
    desc: 'placeholder description',
    type: 'placeholder-type',
    category: 'placeholder-category',
    tags: [],
    trustScore: 70,
    capabilities: [],
    verified: '2026-01-01',
    ...overrides,
  };
}

describe('matchesQuery / filterByQuery', () => {
  const mdn = makeSource({
    id: 'mdn',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    desc: 'Reference for HTML, CSS, JavaScript and Web APIs.',
    type: 'Reference',
    category: 'developer-reference',
    tags: ['html', 'css', 'javascript'],
  });
  const arxiv = makeSource({
    id: 'arxiv',
    name: 'arXiv',
    url: 'https://arxiv.org',
    desc: 'Open-access preprints in physics, maths and computer science.',
    type: 'Preprint archive',
    category: 'open-web',
    tags: ['preprints', 'science'],
  });
  const fixture = [mdn, arxiv];

  it('matches case-insensitively', () => {
    expect(matchesQuery(mdn, 'MDN')).toBe(true);
    expect(matchesQuery(mdn, 'mdn')).toBe(true);
    expect(matchesQuery(mdn, 'MdN')).toBe(true);
  });

  it('requires every whitespace-split term to match (AND across terms)', () => {
    // Both terms hit MDN (name + tags); only one hits arXiv.
    expect(matchesQuery(mdn, 'css javascript')).toBe(true);
    expect(matchesQuery(arxiv, 'css javascript')).toBe(false);
  });

  it('matches a term against any field (OR across fields)', () => {
    // 'preprints' only appears in arXiv's tags, not its name.
    expect(matchesQuery(arxiv, 'preprints')).toBe(true);
    expect(matchesQuery(mdn, 'preprints')).toBe(false);
  });

  it('collapses repeated whitespace and ignores leading/trailing spaces', () => {
    expect(matchesQuery(mdn, '  css   javascript  ')).toBe(true);
  });

  it('treats an empty or whitespace-only query as matching everything', () => {
    expect(matchesQuery(mdn, '')).toBe(true);
    expect(matchesQuery(mdn, '   ')).toBe(true);
    expect(filterByQuery(fixture, '')).toEqual(fixture);
  });

  it('filterByQuery returns only the records that match', () => {
    expect(filterByQuery(fixture, 'science')).toEqual([arxiv]);
    expect(filterByQuery(fixture, 'reference')).toEqual([mdn]);
    expect(filterByQuery(fixture, 'nonexistent-term-xyz')).toEqual([]);
  });
});

describe('sortByRelevance', () => {
  it('ranks a name-exact match above a name-prefix match', () => {
    const exact = makeSource({ id: 'exact', name: 'Arena' });
    const prefix = makeSource({ id: 'prefix', name: 'Arena Extended' });
    const ranked = sortByRelevance([prefix, exact], 'arena');
    expect(ranked.map((s) => s.id)).toEqual(['exact', 'prefix']);
  });

  it('ranks a name-prefix match above a name-contains match', () => {
    const prefix = makeSource({ id: 'prefix', name: 'Arena Weekly' });
    const contains = makeSource({ id: 'contains', name: 'The Arena Journal' });
    const ranked = sortByRelevance([contains, prefix], 'arena');
    expect(ranked.map((s) => s.id)).toEqual(['prefix', 'contains']);
  });

  it('ranks a name match above a domain match', () => {
    const nameMatch = makeSource({ id: 'name', name: 'Marginalia', url: 'https://example.com' });
    const domainMatch = makeSource({
      id: 'domain',
      name: 'Independent Search',
      url: 'https://marginalia-search.com',
    });
    const ranked = sortByRelevance([domainMatch, nameMatch], 'marginalia');
    expect(ranked.map((s) => s.id)).toEqual(['name', 'domain']);
  });

  it('ranks a domain match above a tags match', () => {
    const domainMatch = makeSource({
      id: 'domain',
      name: 'Something Else',
      url: 'https://css-tricks.example',
    });
    const tagMatch = makeSource({
      id: 'tags',
      name: 'Unrelated Name',
      url: 'https://example.com',
      tags: ['css'],
    });
    const ranked = sortByRelevance([tagMatch, domainMatch], 'css');
    expect(ranked.map((s) => s.id)).toEqual(['domain', 'tags']);
  });

  it('ranks a tags match above a category/type match', () => {
    const tagMatch = makeSource({ id: 'tags', name: 'Unrelated', tags: ['news'] });
    const typeMatch = makeSource({ id: 'type', name: 'Different', type: 'News' });
    const ranked = sortByRelevance([typeMatch, tagMatch], 'news');
    expect(ranked.map((s) => s.id)).toEqual(['tags', 'type']);
  });

  it('ranks a category/type match above a desc-only match', () => {
    const typeMatch = makeSource({ id: 'type', name: 'Unrelated', category: 'ai-marketplace' });
    const descMatch = makeSource({
      id: 'desc',
      name: 'Different',
      desc: 'A curated ai-marketplace of listings.',
    });
    const ranked = sortByRelevance([descMatch, typeMatch], 'ai-marketplace');
    expect(ranked.map((s) => s.id)).toEqual(['type', 'desc']);
  });

  it('a multi-term query ranks by its weakest-matching term', () => {
    // Both terms hit `both`'s name; only 'css' hits `mixed`'s name, 'tools'
    // only hits `mixed`'s desc — so `mixed`'s weight is bottlenecked by
    // its desc-level match even though one term matched on name.
    const both = makeSource({ id: 'both', name: 'Css Tools Weekly' });
    const mixed = makeSource({
      id: 'mixed',
      name: 'Css Digest',
      desc: 'Roundup of developer tools.',
    });
    const ranked = sortByRelevance([mixed, both], 'css tools');
    expect(ranked.map((s) => s.id)).toEqual(['both', 'mixed']);
  });

  it('breaks a same-weight tie by trust tier (Trusted before Known before Discovered)', () => {
    const trusted = makeSource({ id: 'trusted', name: 'Signal Trusted', trustScore: 85 });
    const known = makeSource({ id: 'known', name: 'Signal Known', trustScore: 60 });
    const discovered = makeSource({ id: 'discovered', name: 'Signal New', trustScore: 30 });
    const ranked = sortByRelevance([known, discovered, trusted], 'signal');
    expect(ranked.map((s) => s.id)).toEqual(['trusted', 'known', 'discovered']);
  });

  it('does not let raw trustScore differences break a tie within the same tier', () => {
    // Both are 'Trusted' (>= 80) despite an 8-point gap, so the tier tie
    // holds and the tie-break falls through to `verified` instead.
    const higherScore = makeSource({
      id: 'higher',
      name: 'Tier Match',
      trustScore: 95,
      verified: '2026-01-01',
    });
    const lowerScoreNewer = makeSource({
      id: 'newer',
      name: 'Tier Match',
      trustScore: 87,
      verified: '2026-06-01',
    });
    const ranked = sortByRelevance([higherScore, lowerScoreNewer], 'tier match');
    expect(ranked.map((s) => s.id)).toEqual(['newer', 'higher']);
  });

  it('breaks a same-tier tie by verified date, most recent first', () => {
    const older = makeSource({ id: 'older', name: 'Echo', trustScore: 85, verified: '2026-01-01' });
    const newer = makeSource({ id: 'newer', name: 'Echo', trustScore: 85, verified: '2026-06-15' });
    const ranked = sortByRelevance([older, newer], 'echo');
    expect(ranked.map((s) => s.id)).toEqual(['newer', 'older']);
  });

  it('is case-insensitive when ranking, same as when matching', () => {
    const source = makeSource({ id: 'a', name: 'Marginalia' });
    expect(sortByRelevance([source], 'MARGINALIA').map((s) => s.id)).toEqual(['a']);
    expect(sortByRelevance([source], 'MaRgInAlIa').map((s) => s.id)).toEqual(['a']);
  });

  it('leaves order unaffected for an empty query (nothing to rank on)', () => {
    const a = makeSource({ id: 'a', name: 'Alpha' });
    const b = makeSource({ id: 'b', name: 'Beta' });
    // Both weigh FIELD_WEIGHT.none for an empty term list; a stable sort
    // keeps input order rather than throwing or reordering arbitrarily.
    expect(sortByRelevance([a, b], '').map((s) => s.id)).toEqual(['a', 'b']);
  });
});

describe('plain sorts', () => {
  const low = makeSource({ id: 'low', name: 'Zed', trustScore: 40, verified: '2026-03-01' });
  const mid = makeSource({ id: 'mid', name: 'Mid', trustScore: 70, verified: '2026-05-01' });
  const high = makeSource({ id: 'high', name: 'Alpha', trustScore: 95, verified: '2026-01-01' });

  it('sortByTrust orders by raw trustScore descending', () => {
    expect(sortByTrust([low, mid, high]).map((s) => s.id)).toEqual(['high', 'mid', 'low']);
  });

  it('sortByVerified orders by most recently verified first', () => {
    expect(sortByVerified([low, mid, high]).map((s) => s.id)).toEqual(['mid', 'low', 'high']);
  });

  it('sortByName orders A-Z by name', () => {
    expect(sortByName([low, mid, high]).map((s) => s.id)).toEqual(['high', 'mid', 'low']);
  });
});

describe('sortSources dispatch', () => {
  const low = makeSource({
    id: 'low',
    name: 'Zed',
    trustScore: 40,
    verified: '2026-01-01',
  });
  const high = makeSource({
    id: 'high',
    name: 'Alpha',
    trustScore: 95,
    verified: '2026-06-01',
  });

  it('dispatches to each named sort mode', () => {
    expect(sortSources([low, high], 'trust', '').map((s) => s.id)).toEqual(['high', 'low']);
    expect(sortSources([low, high], 'name', '').map((s) => s.id)).toEqual(['high', 'low']);
    expect(sortSources([low, high], 'verified', '').map((s) => s.id)).toEqual(['high', 'low']);
  });

  it('dispatches to relevance ranking using the given query', () => {
    const alpha = makeSource({ id: 'a', name: 'Alpha Weekly' });
    const beta = makeSource({ id: 'b', name: 'Beta' });
    expect(sortSources([beta, alpha], 'relevance', 'alpha').map((s) => s.id)).toEqual(['a', 'b']);
  });
});

describe('trustLabel', () => {
  it('bands scores per the model doc comment: 80-100 Trusted, 50-79 Known, below 50 Discovered', () => {
    expect(trustLabel(100)).toBe('Trusted');
    expect(trustLabel(80)).toBe('Trusted');
    expect(trustLabel(79)).toBe('Known');
    expect(trustLabel(50)).toBe('Known');
    expect(trustLabel(49)).toBe('Discovered');
    expect(trustLabel(0)).toBe('Discovered');
  });
});
