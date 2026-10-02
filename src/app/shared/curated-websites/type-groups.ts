/**
 * Themed grouping for the free-text `Source.type` values, used by the search
 * page's type funnel. Types are not a controlled vocabulary, so a group is
 * decided by the first rule whose pattern matches the lower-cased type.
 * Rule order matters: put the more specific theme first. A type no rule
 * matches lands in `OTHER_TYPE_GROUP`, so new data still shows up.
 *
 * To place a type in a theme, add a word to that theme's pattern. To add a
 * theme, add it to `TYPE_GROUP_ORDER` (display order) and a rule.
 */

export const OTHER_TYPE_GROUP = 'Other';

/** Display order of the groups. */
export const TYPE_GROUP_ORDER: readonly string[] = [
  'AI & agent tooling',
  'Dev & web reference',
  'Maker & hardware',
  'News & journalism',
  'Art, culture & music',
  'Fashion & streetwear',
  'Shops & marketplaces',
  'Archives & knowledge',
  'Civic & everyday',
  'Web & tech culture',
  OTHER_TYPE_GROUP,
];

const TYPE_GROUP_RULES: readonly { readonly group: string; readonly pattern: RegExp }[] = [
  { group: 'AI & agent tooling', pattern: /\b(skill|mcp)\b|^ai /i },
  {
    group: 'Maker & hardware',
    pattern: /maker|hardware|fabrication|robotics|embedded/i,
  },
  { group: 'Archives & knowledge', pattern: /archive|encyclopedia|academic|library|r&d|snapshot/i },
  {
    group: 'News & journalism',
    pattern:
      /journalism|investigative|newsroom|\bnews\b|press|daily|newspaper|broadcaster|media (analysis|collective)|political media|publication/i,
  },
  {
    group: 'Fashion & streetwear',
    pattern: /streetwear|wear\b|label|merch|alternative|skate|colorful retro|tattoo/i,
  },
  {
    group: 'Shops & marketplaces',
    pattern: /retailer|marketplace|store|distributor|classifieds|payment/i,
  },
  {
    group: 'Dev & web reference',
    pattern:
      /documentation|reference|specification|standards|support tables|framework|runtime|code repository|project repository|developer|design & dev|web design|q&a|technical community|offline docs/i,
  },
  {
    group: 'Civic & everyday',
    pattern:
      /government|tax|health|weather|real estate|city guide|journey|mapping|event aggregator/i,
  },
  {
    group: 'Web & tech culture',
    pattern:
      /web|digital culture|tech culture|tech theory|tech policy|experiment|toy|sandbox|simulation|aggregator|forum|weblog|curation|digital identity|link|search engine/i,
  },
  {
    group: 'Art, culture & music',
    pattern:
      /art\b|magazine|culture|creative|music|sound|audio|literary|zine|architecture|craft|studio|independent sports/i,
  },
];

export function typeGroupOf(type: string): string {
  return TYPE_GROUP_RULES.find((rule) => rule.pattern.test(type))?.group ?? OTHER_TYPE_GROUP;
}
