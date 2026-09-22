import { Location } from '@angular/common';
import { Component, computed, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  HardwareKeyAccent,
  HardwareKeyComponent,
} from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
import { ChipComponent } from '../shared/design-system/data-display/chip/chip.component';
import { RecordGridCellDirective } from '../shared/design-system/data-display/record-grid/record-grid-cell.directive';
import {
  GridColumn,
  RecordGridComponent,
} from '../shared/design-system/data-display/record-grid/record-grid.component';
import {
  SelectOption,
  ChromeSelectComponent,
} from '../shared/design-system/form-controls/chrome-select/chrome-select.component';
import { ConsoleInputComponent } from '../shared/design-system/form-controls/console-input/console-input.component';
import { FieldLabelComponent } from '../shared/design-system/form-controls/field-label/field-label.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { StompboxToggleComponent } from '../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { ClassificationBadgeComponent } from '../shared/design-system/indicators/classification-badge/classification-badge.component';
import { ToolbarRowComponent } from '../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { DirectoryBrowseTemplateComponent } from '../shared/design-system/page-templates/directory-browse-template/directory-browse-template.component';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { ALL_SOURCES } from '../shared/curated-websites/source-fixture';
import { Capability, Source } from '../shared/curated-websites/source.model';
import {
  domainOf,
  filterByQuery,
  formatVerifiedDate,
  outboundSearchHref,
  SortMode,
  sortSources,
  trustLabel,
} from '../shared/curated-websites/source-search';

/**
 * Display row for `joo-record-grid`, this page's version of `HighlightRow`
 * (`home.page.ts`). Same shape plus the two things the brief asks for that
 * home's table doesn't need: `lang` (its own column) and the three
 * `action*` fields backing the direct-search action (`toSearchRow` below).
 * Field names are pinned to `data-col` for the columns shared with home's
 * table, for the same reason `HighlightRow` states — the ported table CSS
 * (`src/styles.css:242-360`) keys on them, `lang` included (:334, :421).
 */
interface CapabilitySignal {
  readonly id: Capability;
  readonly label: string;
}

interface SearchRow {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly url: string;
  readonly trust: 'Trusted' | 'Known' | 'Discovered';
  readonly desc: string;
  readonly type: string;
  readonly sig: readonly CapabilitySignal[];
  readonly lang: string;
  readonly ver: string;
  /** Optional GitHub/source URL. Empty when unknown — `src` is the cell label. */
  readonly sourceUrl: string;
  readonly src: string;
  readonly searchUrl?: string;
  readonly act: string;
  readonly actionHref: string;
  readonly actionAccent: HardwareKeyAccent;
}

/** Abbreviations the table's `.sig` pills use — same map as `home.page.ts`,
 *  duplicated rather than extracted: it's a three-entry display constant,
 *  not logic, and the brief's "minimal shared extraction" bar is for
 *  behaviour two pages would otherwise disagree on, not for a literal. */
const CAPABILITY_LABEL: Record<Capability, string> = {
  'rss-feed': 'RSS',
  'site-search': 'SRCH',
  'public-api': 'API',
};

type BaseSearchRow = Omit<SearchRow, 'actionHref'>;

/** Precomputed base rows for all sources so URL parsing and date formatting
 *  never execute on sort or filter transitions. */
const BASE_SEARCH_ROWS_MAP: ReadonlyMap<string, BaseSearchRow> = new Map(
  ALL_SOURCES.map((source) => {
    const canSearch = !!source.searchUrl;
    const sourceUrl = source.sourceUrl ?? '';
    return [
      source.id,
      {
        id: source.id,
        name: source.name,
        domain: domainOf(source.url),
        url: source.url,
        trust: trustLabel(source.trustScore),
        desc: source.desc,
        type: source.type,
        sig: source.capabilities.map((id) => ({ id, label: CAPABILITY_LABEL[id] })),
        lang: source.lang ? source.lang.toUpperCase() : '—',
        ver: formatVerifiedDate(source.verified),
        sourceUrl,
        src: sourceUrl ? domainOf(sourceUrl) : '',
        searchUrl: source.searchUrl,
        act: canSearch ? 'Search ↗' : 'Open',
        actionAccent: canSearch ? 'cyan' : 'neutral',
      },
    ];
  }),
);

/** The three capability toggles, in the mock's order (`search.html:82-99`). */
const CAPABILITY_TOGGLES: readonly { readonly value: Capability; readonly label: string }[] = [
  { value: 'rss-feed', label: 'Has RSS' },
  { value: 'site-search', label: 'Has site search' },
  { value: 'public-api', label: 'Has API' },
];

const SORT_OPTIONS: readonly SegmentOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'trust', label: 'Trust' },
  { value: 'verified', label: 'Verified' },
  { value: 'name', label: 'A–Z' },
];

function parseSort(raw: string | null | undefined): SortMode {
  return raw === 'trust' || raw === 'verified' || raw === 'name' ? raw : 'relevance';
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/** Active-filter chip labels (fix wave 5) read the same options list the
 *  matching select already renders, so "Type: Blog" etc. shows the select's
 *  own label rather than the raw fixture slug. Falls back to the raw value
 *  for a hand-edited/stale URL param that matches no known option. */
function labelFor(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Readable labels for the category slugs the fixture actually holds — the
 *  same five labels `home.page.ts`'s `quickKeys` use, so the same category
 *  reads the same way in both places. Not exported/shared: `quickKeys`
 *  pairs a label with a count and an `href`, three things this page's plain
 *  select doesn't need, so re-deriving four short strings here is cheaper
 *  than threading a shared constant through two unrelated shapes. */
const CATEGORY_LABEL: Record<string, string> = {
  technology: 'Technology',
  culture: 'Culture & arts',
  lifestyle: 'Lifestyle & fashion',
  news: 'News & investigative',
  'ai-marketplace': 'AI marketplaces',
  inspiration: 'Inspiration & design',
  'developer-reference': 'Developer reference',
  'open-web': 'Open-web holdouts',
  public: 'Public & civic',
  finance: 'Finance & payments',
  transport: 'Transport',
  science: 'Science & weather',
};

/** Readable names for the ISO 639-1 codes the fixture's `lang` field holds.
 *  Only rendered when `distinctLangs` has more than one entry (brief: the
 *  select is demoted, not built, for a single-language dataset). */
const LANG_LABEL: Record<string, string> = {
  en: 'English',
  da: 'Danish',
  fi: 'Finnish',
  sv: 'Swedish',
  no: 'Norwegian',
  de: 'German',
  fr: 'French',
  nl: 'Dutch',
};

/** Prefixes every select with an `Any …` sentinel (mock: `search.html:106`,
 *  `:116`, `:124` — "Any type", "Any language", plain "Global" for region).
 *  Value `''`, since it can never collide with a real fixture value and
 *  reads cleanly as "no filter" once the query param is simply absent. */
function toSelectOptions(
  anyLabel: string,
  values: readonly string[],
  labelFor: (value: string) => string = (value) => value,
): readonly SelectOption[] {
  return [
    { value: '', label: anyLabel },
    ...values.map((value) => ({ value, label: labelFor(value) })),
  ];
}

export interface FunnelCategory {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

export interface FunnelSubType {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface FunnelRegion {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface TypePillOption {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface TypeThemeGroup {
  readonly id: string;
  readonly label: string;
  readonly sourceCount: number;
  readonly types: readonly TypePillOption[];
}

const REGION_OPTIONS = toSelectOptions(
  'Any region',
  uniqueSorted(
    ALL_SOURCES.map((source) => source.region).filter((region): region is string => !!region),
  ),
);
const CATEGORY_OPTIONS = toSelectOptions(
  'Any category',
  uniqueSorted(ALL_SOURCES.map((source) => source.category)),
  (value) => CATEGORY_LABEL[value] ?? value,
);
const DISTINCT_LANGS = uniqueSorted(
  ALL_SOURCES.map((source) => source.lang).filter((lang): lang is string => !!lang),
);
const LANG_OPTIONS = toSelectOptions(
  'Any language',
  DISTINCT_LANGS,
  (value) => LANG_LABEL[value] ?? value,
);

/**
 * Search route (`/search`). Plan's "Search — `/search?q=`" section, brief's
 * task 5. `q`, every filter and the sort mode live in the URL
 * (`ActivatedRoute.queryParamMap`, read reactively via `toSignal` rather
 * than the placeholder's `route.snapshot`) — this page holds no state of
 * its own, so a filter change writes the URL and the result set re-derives
 * from it, and the back button and a shared link both behave.
 *
 * Layout is `joo-directory-browse-template` (toolbar, filter rack, results)
 * per `features/design-theme/search.html`. Results reuse the exact cell
 * templates `home.page.ts` built for `joo-record-grid` (`toHighlightRow`'s
 * pattern) plus a `lang` column and the direct-search action.
 *
 * **`tag` is read but has no filter control here.** `home.page.ts`'s F5
 * quick key already links to `/search?tag=investigative` (the `investigative`
 * tag standing in for a five-way category split that fell one category
 * short — see that file's doc comment). The brief scopes this page's own
 * filter UI to Trusted/capabilities/Type/Region/Category/Language and says
 * nothing about a Tag control, and adding one would be scope creep on a
 * task that's explicitly "don't touch home beyond a genuinely shared
 * change." Honouring `tag` as a silent pass-through filter (no UI, no
 * "clear" affordance) is what keeps F5 a working link without building
 * unrequested UI for it — logged in the report as a judgment call.
 *
 * **Relevance sort with an empty keyword never gets special-cased.**
 * `sortByRelevance(sources, '')` (`source-search.ts`) already degrades to
 * its tie-break chain — trust tier, then verified date — because an empty
 * query has no terms for `relevanceWeight` to score, so every record ties
 * at weight 0. That fallback is a real, previously-defined ordering, not a
 * placeholder, so `Relevance` stays the default sort and stays enabled
 * whether or not `kw` is present, rather than being hidden or disabled.
 *
 * **Fix wave 2 (reverses D4/ADR 020, see the plan's "Implementation
 * deviations"):** `q` no longer filters this table — `filteredSources` is
 * now driven only by the sidebar filters, `kw` (the new keyword filter)
 * included. The results query box (`queryInput`) feeds each row's Search↗
 * live as the user types. URL `q` is the shareable snapshot (header, a
 * pasted link, Enter in the box). Neither filters the table — `kw` does.
 */
@Component({
  selector: 'joo-search-page',
  imports: [
    DirectoryBrowseTemplateComponent,
    ToolbarRowComponent,
    EyebrowLabelComponent,
    ReadoutPanelComponent,
    FieldLabelComponent,
    StompboxToggleComponent,
    ChromeSelectComponent,
    ConsoleInputComponent,
    SegmentSelectorComponent,
    RecordGridComponent,
    RecordGridCellDirective,
    ClassificationBadgeComponent,
    CapabilityTagComponent,
    HardwareKeyComponent,
    ChipComponent,
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.css',
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private kwDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly initialParams = this.route.snapshot.queryParamMap;

  protected readonly q = signal(this.initialParams.get('q') ?? '');
  /** Text currently in the results query box, linked to `q`. */
  protected readonly queryInput = linkedSignal(() => this.q());
  /** Search↗ href query, updated on submit/blur. */
  protected readonly appliedQuery = linkedSignal(() => this.q());

  /** Text currently in the keyword input box, updated immediately for snappy typing. */
  protected readonly kwInput = signal(this.initialParams.get('kw') ?? '');

  /** Keyword filter state, debounced slightly on typing to prevent animation storm in table. */
  protected readonly kw = signal(this.initialParams.get('kw') ?? '');

  protected readonly trustedOnly = signal(this.initialParams.get('trusted') === '1');
  /** Unrecognised values (a hand-edited or stale URL) are silently inert —
   *  the `.has()` check below never matches a `Capability` that a stray
   *  string can't equal, so a garbage `caps` param filters nothing rather
   *  than throwing. */
  protected readonly caps = signal<ReadonlySet<Capability>>(
    new Set((this.initialParams.get('caps') ?? '').split(',').filter(Boolean) as Capability[]),
  );
  protected readonly typeFilter = signal(this.initialParams.get('type') ?? '');
  protected readonly regionFilter = signal(this.initialParams.get('region') ?? '');
  protected readonly categoryFilter = signal(this.initialParams.get('category') ?? '');
  protected readonly langFilter = signal(this.initialParams.get('lang') ?? '');
  protected readonly tagFilter = signal(this.initialParams.get('tag') ?? '');
  protected readonly sortMode = signal<SortMode>(parseSort(this.initialParams.get('sort')));

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.kwDebounceTimer) {
        clearTimeout(this.kwDebounceTimer);
      }
    });

    // Synchronize filters when external navigation lands on /search (e.g. Header search, F5 tag quick key)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.applyParamMap(params);
    });
  }

  protected readonly showLangFilter = DISTINCT_LANGS.length > 1;
  protected readonly capabilityToggles = CAPABILITY_TOGGLES;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly totalSourceCount = ALL_SOURCES.length;
  protected readonly regionOptions = REGION_OPTIONS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly langOptions = LANG_OPTIONS;
  /** Category rendered as chips (fix wave 5), not a select — the "Any
   *  category" sentinel `CATEGORY_OPTIONS` carries for the select has no
   *  chip: an active chip toggling itself off is what clears the filter. */
  protected readonly categoryChipOptions = CATEGORY_OPTIONS.filter((option) => option.value);

  /** Funnel Layer 1: Base Categories / Domains */
  protected readonly funnelCategories = computed<readonly FunnelCategory[]>(() => {
    const counts = new Map<string, number>();
    for (const source of ALL_SOURCES) {
      counts.set(source.category, (counts.get(source.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([id, count]) => ({
        id,
        label: CATEGORY_LABEL[id] ?? id,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  });

  protected readonly activeCategoryLabel = computed(() => {
    const cat = this.categoryFilter();
    return cat ? (CATEGORY_LABEL[cat] ?? cat) : '';
  });

  /** Funnel Layer 2: Sub-types */
  protected readonly funnelSubTypes = computed<readonly FunnelSubType[]>(() => {
    const activeCat = this.categoryFilter();
    let sources = ALL_SOURCES;
    if (activeCat) {
      sources = sources.filter((s) => s.category === activeCat);
    }
    const counts = new Map<string, number>();
    for (const s of sources) {
      counts.set(s.type, (counts.get(s.type) ?? 0) + 1);
    }
    const entries = [...counts.entries()]
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return activeCat ? entries : entries.slice(0, 14);
  });

  /** Funnel Layer 3: Contextual region facet options */
  protected readonly funnelRegions = computed<readonly FunnelRegion[]>(() => {
    const activeCat = this.categoryFilter();
    const activeType = this.typeFilter();
    let sources = ALL_SOURCES;
    if (activeCat) {
      sources = sources.filter((s) => s.category === activeCat);
    }
    if (activeType) {
      sources = sources.filter((s) => s.type === activeType);
    }
    const counts = new Map<string, number>();
    for (const s of sources) {
      if (s.region) {
        counts.set(s.region, (counts.get(s.region) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  });

  /** Signal & trust counts for the active type bucket */
  protected readonly funnelSignalCounts = computed(() => {
    const activeCat = this.categoryFilter();
    const activeType = this.typeFilter();
    let sources = ALL_SOURCES;
    if (activeCat) {
      sources = sources.filter((s) => s.category === activeCat);
    }
    if (activeType) {
      sources = sources.filter((s) => s.type === activeType);
    }
    let rss = 0;
    let search = 0;
    let api = 0;
    let trusted = 0;
    for (const s of sources) {
      if (s.capabilities.includes('rss-feed')) rss++;
      if (s.capabilities.includes('site-search')) search++;
      if (s.capabilities.includes('public-api')) api++;
      if (s.trustScore >= 80) trusted++;
    }
    return { rss, search, api, trusted };
  });

  protected readonly funnelMeta = computed(() => {
    const cat = this.categoryFilter();
    const type = this.typeFilter();
    const region = this.regionFilter();
    if (cat && type && region) {
      return `${this.activeCategoryLabel()} › ${type} › ${region} · ${this.filteredSources().length} sources`;
    }
    if (cat && type) {
      return `${this.activeCategoryLabel()} › ${type} · ${this.filteredSources().length} sources`;
    }
    if (cat) {
      const subCount = this.funnelSubTypes().length;
      return `${this.activeCategoryLabel()} · ${this.filteredSources().length} sources · ${subCount} types`;
    }
    if (type) {
      return `Type: ${type} · ${this.filteredSources().length} sources`;
    }
    return `${this.totalSourceCount} sources across ${this.funnelCategories().length} type buckets`;
  });

  protected readonly resultColumns: readonly GridColumn<SearchRow>[] = [
    { field: 'name', header: 'Source' },
    { field: 'trust', header: 'Trust' },
    { field: 'desc', header: 'About' },
    { field: 'type', header: 'Type' },
    { field: 'sig', header: 'Signals' },
    { field: 'lang', header: 'Lang' },
    { field: 'ver', header: 'Verified' },
    { field: 'src', header: 'Src' },
    { field: 'act', header: '' },
  ];

  /** Filters (every field but sort), applied in the order the rack lists
   *  them. Order doesn't change the result set — every step is an
   *  intersection — but matches the rack for readability. */
  private readonly filteredSources = computed<readonly Source[]>(() => {
    let sources: readonly Source[] = ALL_SOURCES;

    if (this.trustedOnly()) {
      sources = sources.filter((source) => source.trustScore >= 80);
    }
    for (const cap of this.caps()) {
      sources = sources.filter((source) => source.capabilities.includes(cap));
    }
    const type = this.typeFilter();
    if (type) {
      sources = sources.filter((source) => source.type === type);
    }
    const region = this.regionFilter();
    if (region) {
      sources = sources.filter((source) => source.region === region);
    }
    const category = this.categoryFilter();
    if (category) {
      sources = sources.filter((source) => source.category === category);
    }
    const lang = this.langFilter();
    if (lang) {
      sources = sources.filter((source) => source.lang === lang);
    }
    const tag = this.tagFilter();
    if (tag) {
      sources = sources.filter((source) => source.tags.includes(tag));
    }
    const kw = this.kw();
    if (kw.trim()) {
      sources = filterByQuery(sources, kw);
    }
    return sources;
  });

  protected readonly sortedSources = computed(() =>
    sortSources(this.filteredSources(), this.sortMode(), this.kw()),
  );

  protected readonly rows = computed<readonly SearchRow[]>(() => {
    const q = this.appliedQuery();
    return this.sortedSources().map((source) => this.toSearchRow(source, q));
  });

  protected readonly isCapActive = computed(() => {
    const c = this.caps();
    return {
      'rss-feed': c.has('rss-feed'),
      'site-search': c.has('site-search'),
      'public-api': c.has('public-api'),
    } as const;
  });

  protected readonly resultCount = computed(() => this.rows().length);

  /** Active-filter chip row above the table (fix wave 5). Mirrors the
   *  mock's `.panel__meta` "2 on" count, but per the user's request goes
   *  further: every active filter renders as its own chip, and each
   *  chip's `clear` calls the exact same setter its own control uses, so
   *  clicking one chip removes only that filter — never the whole set. */
  protected readonly activeFilters = computed<
    readonly { readonly key: string; readonly label: string; readonly clear: () => void }[]
  >(() => {
    const filters: { key: string; label: string; clear: () => void }[] = [];

    if (this.trustedOnly()) {
      filters.push({ key: 'trusted', label: 'Trusted only', clear: () => this.onTrustedToggle() });
    }
    for (const cap of this.caps()) {
      filters.push({
        key: `cap-${cap}`,
        label: this.capabilityLabel(cap),
        clear: () => this.onCapabilityToggle(cap),
      });
    }
    const type = this.typeFilter();
    if (type) {
      filters.push({
        key: 'type',
        label: `Type: ${type}`,
        clear: () => this.onTypeChange(null),
      });
    }
    const region = this.regionFilter();
    if (region) {
      filters.push({
        key: 'region',
        label: `Region: ${labelFor(REGION_OPTIONS, region)}`,
        clear: () => this.onRegionChange(null),
      });
    }
    const category = this.categoryFilter();
    if (category) {
      filters.push({
        key: 'category',
        label: `Category: ${labelFor(CATEGORY_OPTIONS, category)}`,
        clear: () => this.onCategoryChange(null),
      });
    }
    const lang = this.langFilter();
    if (lang) {
      filters.push({
        key: 'lang',
        label: `Language: ${labelFor(LANG_OPTIONS, lang)}`,
        clear: () => this.onLangChange(null),
      });
    }
    const kw = this.kw();
    if (kw) {
      filters.push({
        key: 'kw',
        label: `Keyword: ${kw}`,
        clear: () => this.onKeywordChange(''),
      });
    }
    return filters;
  });

  private toSearchRow(source: Source, q: string): SearchRow {
    const base = BASE_SEARCH_ROWS_MAP.get(source.id);
    if (base) {
      return {
        ...base,
        actionHref: outboundSearchHref(source, q),
      };
    }
    const canSearch = !!source.searchUrl;
    const sourceUrl = source.sourceUrl ?? '';
    return {
      id: source.id,
      name: source.name,
      domain: domainOf(source.url),
      url: source.url,
      trust: trustLabel(source.trustScore),
      desc: source.desc,
      type: source.type,
      sig: source.capabilities.map((id) => ({ id, label: CAPABILITY_LABEL[id] })),
      lang: source.lang ? source.lang.toUpperCase() : '—',
      ver: formatVerifiedDate(source.verified),
      sourceUrl,
      src: sourceUrl ? domainOf(sourceUrl) : '',
      searchUrl: source.searchUrl,
      act: canSearch ? 'Search ↗' : 'Open',
      actionHref: outboundSearchHref(source, q),
      actionAccent: canSearch ? 'cyan' : 'neutral',
    };
  }

  protected capabilityLabel(capability: Capability): string {
    return CAPABILITY_LABEL[capability];
  }

  /** Synchronizes active filter state to the browser address bar in-place.
   *  Does NOT trigger Angular router navigation, scroll-to-top, or View Transitions. */
  private syncUrl(): void {
    const params = new URLSearchParams();
    const qVal = this.q().trim();
    if (qVal) params.set('q', qVal);
    const kwVal = this.kw().trim();
    if (kwVal) params.set('kw', kwVal);
    if (this.trustedOnly()) params.set('trusted', '1');
    if (this.caps().size) params.set('caps', [...this.caps()].join(','));
    const typeVal = this.typeFilter();
    if (typeVal) params.set('type', typeVal);
    const regVal = this.regionFilter();
    if (regVal) params.set('region', regVal);
    const catVal = this.categoryFilter();
    if (catVal) params.set('category', catVal);
    const langVal = this.langFilter();
    if (langVal) params.set('lang', langVal);
    const tagVal = this.tagFilter();
    if (tagVal) params.set('tag', tagVal);
    if (this.sortMode() !== 'relevance') params.set('sort', this.sortMode());

    const qs = params.toString();
    this.location.replaceState('/search', qs ? `?${qs}` : '');
  }

  private applyParamMap(map: ParamMap): void {
    const q = map.get('q') ?? '';
    if (q !== this.q()) {
      this.q.set(q);
      this.appliedQuery.set(q);
      this.queryInput.set(q);
    }
    const kw = map.get('kw') ?? '';
    if (kw !== this.kw()) {
      this.kw.set(kw);
      this.kwInput.set(kw);
    }
    const trusted = map.get('trusted') === '1';
    if (trusted !== this.trustedOnly()) this.trustedOnly.set(trusted);
    const rawCaps = (map.get('caps') ?? '').split(',').filter(Boolean) as Capability[];
    const capsSet = new Set(rawCaps);
    if (capsSet.size !== this.caps().size || [...capsSet].some((c) => !this.caps().has(c))) {
      this.caps.set(capsSet);
    }
    const type = map.get('type') ?? '';
    if (type !== this.typeFilter()) this.typeFilter.set(type);
    const region = map.get('region') ?? '';
    if (region !== this.regionFilter()) this.regionFilter.set(region);
    const category = map.get('category') ?? '';
    if (category !== this.categoryFilter()) this.categoryFilter.set(category);
    const lang = map.get('lang') ?? '';
    if (lang !== this.langFilter()) this.langFilter.set(lang);
    const tag = map.get('tag') ?? '';
    if (tag !== this.tagFilter()) this.tagFilter.set(tag);
    const sort = parseSort(map.get('sort'));
    if (sort !== this.sortMode()) this.sortMode.set(sort);
  }

  /** Sidebar Keyword field — updates `kwInput` immediately while debouncing `kw` and URL memory.
   *  Prevents rapid-fire DOM animation thrashing when typing fast. */
  protected onKeywordChange(value: string): void {
    this.kwInput.set(value);
    if (this.kwDebounceTimer) {
      clearTimeout(this.kwDebounceTimer);
    }
    if (!value) {
      this.kw.set('');
      this.syncUrl();
      return;
    }
    this.kwDebounceTimer = setTimeout(() => {
      this.kw.set(value);
      this.syncUrl();
    }, 120);
  }

  /** Blur or Enter commits the box into Search↗ hrefs and updates URL memory. */
  protected onQueryCommit(value: string): void {
    const trimmed = value.trim();
    this.q.set(trimmed);
    this.appliedQuery.set(trimmed);
    this.syncUrl();
  }

  /** Reserved: open the first N Search↗ results as new tabs. The pink key
   *  is not how the query is applied. */
  protected onBulkOpen(): void {
    return;
  }

  protected onTrustedToggle(): void {
    this.trustedOnly.update((v) => !v);
    this.syncUrl();
  }

  protected onCapabilityToggle(cap: Capability): void {
    const next = new Set(this.caps());
    if (next.has(cap)) {
      next.delete(cap);
    } else {
      next.add(cap);
    }
    this.caps.set(next);
    this.syncUrl();
  }

  /** Funnel Layer 1: Type Bucket (Category) click */
  protected onCategoryFunnelClick(category: string): void {
    const nextCat = this.categoryFilter() === category ? '' : category;
    this.categoryFilter.set(nextCat);
    if (!nextCat) {
      this.typeFilter.set('');
      this.regionFilter.set('');
      this.syncUrl();
      return;
    }
    const sourcesInCat = ALL_SOURCES.filter((s) => s.category === nextCat);
    const hasType = sourcesInCat.some((s) => s.type === this.typeFilter());
    const hasRegion = sourcesInCat.some((s) => s.region === this.regionFilter());
    if (!hasType) this.typeFilter.set('');
    if (!hasRegion) this.regionFilter.set('');
    this.syncUrl();
  }

  /** Funnel Layer 2: Specific Type click */
  protected onTypeFunnelClick(type: string): void {
    const nextType = this.typeFilter() === type ? '' : type;
    this.typeFilter.set(nextType);
    if (nextType) {
      const found = ALL_SOURCES.find((s) => s.type === nextType);
      if (found && (!this.categoryFilter() || found.category !== this.categoryFilter())) {
        this.categoryFilter.set(found.category);
      }
    }
    this.syncUrl();
  }

  /** Funnel Layer 3: Region facet click */
  protected onRegionFunnelClick(region: string): void {
    this.regionFilter.set(this.regionFilter() === region ? '' : region);
    this.syncUrl();
  }

  /** Clears all funnel levels back to all sources. */
  protected onResetFunnel(): void {
    this.categoryFilter.set('');
    this.typeFilter.set('');
    this.regionFilter.set('');
    this.caps.set(new Set());
    this.trustedOnly.set(false);
    this.syncUrl();
  }

  protected onTypeChange(value: string | null): void {
    this.typeFilter.set(value ?? '');
    this.syncUrl();
  }

  protected onTypeChipClick(value: string): void {
    this.onTypeFunnelClick(value);
  }

  protected onResetTypeAndCategory(): void {
    this.onResetFunnel();
  }

  protected onRegionChange(value: string | null): void {
    this.regionFilter.set(value ?? '');
    this.syncUrl();
  }

  protected onCategoryChange(value: string | null): void {
    this.categoryFilter.set(value ?? '');
    this.syncUrl();
  }

  protected onCategoryChipClick(value: string): void {
    this.onCategoryFunnelClick(value);
  }

  protected onLangChange(value: string | null): void {
    this.langFilter.set(value ?? '');
    this.syncUrl();
  }

  protected onSortChange(mode: string): void {
    this.sortMode.set(parseSort(mode));
    this.syncUrl();
  }
}
