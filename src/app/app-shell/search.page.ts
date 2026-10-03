import { Location, NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { WireFollowStore } from '../shared/curated-websites/wire-follow.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  HardwareKeyAccent,
  HardwareKeyComponent,
} from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
import { CornerBracketsDirective } from '../shared/design-system/surfaces/corner-brackets/corner-brackets.directive';
import { StatusLightComponent } from '../shared/design-system/indicators/status-light/status-light.component';
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
import { DualConsoleInputComponent } from '../shared/design-system/form-controls/dual-console-input/dual-console-input.component';
import { FieldLabelComponent } from '../shared/design-system/form-controls/field-label/field-label.component';
import { StompboxToggleComponent } from '../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { ToolbarRowComponent } from '../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { DirectoryBrowseTemplateComponent } from '../shared/design-system/page-templates/directory-browse-template/directory-browse-template.component';
import { FilterDrawerComponent } from '../shared/design-system/surfaces/filter-drawer/filter-drawer.component';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { ALL_SOURCES } from '../shared/curated-websites/sources.generated';
import { Capability, Source } from '../shared/curated-websites/source.model';
import { TYPE_GROUP_ORDER, typeGroupOf } from '../shared/curated-websites/type-groups';
import {
  domainOf,
  filterByQuery,
  formatVerifiedDate,
  outboundSearchHref,
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
];

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
  utilities: 'Useful tooling',
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

/** How many tabs the pink "Open" key opens. */
const BULK_OPEN_COUNT = 5;

export interface FunnelCategory {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

export interface FunnelSubType {
  readonly value: string;
  readonly count: number;
}

export interface FunnelTypeGroup {
  readonly label: string;
  readonly types: readonly FunnelSubType[];
}

export interface FunnelGroup {
  readonly label: string;
  readonly categories: readonly FunnelCategory[];
}

/** Themed columns for the category funnel. A category missing here lands in
 *  a trailing "Other" column, so a new category in the data still shows up. */
const CATEGORY_GROUPS: readonly { readonly label: string; readonly ids: readonly string[] }[] = [
  {
    label: 'AI & tooling',
    ids: ['utilities', 'ai-marketplace', 'developer-reference', 'technology', 'open-web'],
  },
  { label: 'Culture & play', ids: ['culture', 'lifestyle', 'inspiration'] },
  { label: 'News & world pulse', ids: ['news', 'public', 'science'] },
  { label: 'Money & movement', ids: ['finance', 'transport'] },
];

/** `a,b` from a URL param to a set. Category slugs and type names hold no commas. */
function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

function parseList(value: string | null): ReadonlySet<string> {
  return new Set((value ?? '').split(',').filter(Boolean));
}

const REGION_OPTIONS = toSelectOptions(
  'Any region',
  uniqueSorted(
    ALL_SOURCES.map((source) => source.region).filter((region): region is string => !!region),
  ),
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
 * **Dual input (above the table):** the left box is `kw`, which filters the
 * table. The right box is `q`, which never filters: it only feeds each row's
 * Search↗ href, and the pink Open key opens the first five rows' hrefs as
 * new tabs. Both live in the URL. Trusted-only and Has-API are not in the UI
 * (the data fields stay). Category and type are the two funnel chip rows
 * between the inputs and the table.
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
    DualConsoleInputComponent,
    RecordGridComponent,
    RecordGridCellDirective,
    CapabilityTagComponent,
    HardwareKeyComponent,
    ChipComponent,
    CornerBracketsDirective,
    StatusLightComponent,
    FilterDrawerComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.css',
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly wire = inject(WireFollowStore);
  private queryDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly initialParams = this.route.snapshot.queryParamMap;
  private readonly initialQuery = this.initialParams.get('q') ?? '';
  private readonly initialKeyword = this.initialParams.get('kw') ?? '';
  private keywordDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Text currently in the query box (right half of the dual input), updated immediately. */
  protected readonly queryInput = signal(this.initialQuery);

  /** Query appended to each row's outbound link. Never filters the table. Debounced on typing. */
  protected readonly q = signal(this.initialQuery);

  /** Text currently in the filter box (left half of the dual input), updated immediately. */
  protected readonly keywordInput = signal(this.initialKeyword);

  /** Keyword that filters the table rows. Debounced on typing. */
  protected readonly kw = signal(this.initialKeyword);

  /** Unrecognised values (a hand-edited or stale URL) are silently inert —
   *  the `.has()` check below never matches a `Capability` that a stray
   *  string can't equal, so a garbage `caps` param filters nothing rather
   *  than throwing. */
  protected readonly caps = signal<ReadonlySet<Capability>>(
    new Set((this.initialParams.get('caps') ?? '').split(',').filter(Boolean) as Capability[]),
  );
  protected readonly typeFilter = signal<ReadonlySet<string>>(
    parseList(this.initialParams.get('type')),
  );
  protected readonly regionFilter = signal(this.initialParams.get('region') ?? '');
  protected readonly categoryFilter = signal<ReadonlySet<string>>(
    parseList(this.initialParams.get('category')),
  );
  /** Whether the types layer of the funnel is expanded. */
  protected readonly typesOpen = signal(false);
  /** Phone only: the category chips can be folded away (`.funnel__toggle` is hidden above 767px). */
  protected readonly categoriesOpen = signal(true);
  /** Below 1024px the Signals/Region/Language rack lives in a left drawer. */
  protected readonly filtersOpen = signal(false);
  protected readonly railActive = computed(
    () => this.caps().size > 0 || this.regionFilter() !== '' || this.langFilter() !== '',
  );
  protected readonly langFilter = signal(this.initialParams.get('lang') ?? '');
  protected readonly tagFilter = signal(this.initialParams.get('tag') ?? '');
  protected readonly sortField = signal<string | undefined>(
    this.initialParams.get('sortField') ??
      (this.initialParams.get('sort') ? this.initialParams.get('sort')! : undefined),
  );
  protected readonly sortOrder = signal<number>(
    this.initialParams.get('sortOrder') === '-1' ? -1 : 1,
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.queryDebounceTimer) {
        clearTimeout(this.queryDebounceTimer);
      }
      if (this.keywordDebounceTimer) {
        clearTimeout(this.keywordDebounceTimer);
      }
    });

    // Synchronize filters when external navigation lands on /search (e.g. Header search, F5 tag quick key)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.applyParamMap(params);
    });
  }

  protected readonly showLangFilter = DISTINCT_LANGS.length > 1;
  protected readonly capabilityToggles = CAPABILITY_TOGGLES;
  protected readonly regionOptions = REGION_OPTIONS;
  protected readonly langOptions = LANG_OPTIONS;
  protected readonly totalSourceCount = ALL_SOURCES.length;

  /** Funnel layer 1: categories with source counts, arranged in themed columns. */
  protected readonly funnelGroups: readonly FunnelGroup[] = (() => {
    const counts = new Map<string, number>();
    for (const source of ALL_SOURCES) {
      counts.set(source.category, (counts.get(source.category) ?? 0) + 1);
    }
    const toCategory = (id: string): FunnelCategory => ({
      id,
      label: CATEGORY_LABEL[id] ?? id,
      count: counts.get(id) ?? 0,
    });
    const grouped = new Set(CATEGORY_GROUPS.flatMap((group) => group.ids));
    const groups: FunnelGroup[] = CATEGORY_GROUPS.map((group) => ({
      label: group.label,
      categories: group.ids.filter((id) => counts.has(id)).map(toCategory),
    }));
    const other = [...counts.keys()].filter((id) => !grouped.has(id)).map(toCategory);
    if (other.length) groups.push({ label: 'Other', categories: other });
    return groups.filter((group) => group.categories.length > 0);
  })();

  /** Funnel layer 2: specific types, limited to the selected categories (all
   *  categories when none is selected), biggest first. */
  protected readonly funnelSubTypes = computed<readonly FunnelSubType[]>(() => {
    const categories = this.categoryFilter();
    const counts = new Map<string, number>();
    for (const source of ALL_SOURCES) {
      if (!categories.size || categories.has(source.category)) {
        counts.set(source.type, (counts.get(source.type) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  });

  /** The same types arranged in themed columns (`type-groups.ts`), empty groups dropped. */
  protected readonly funnelTypeGroups = computed<readonly FunnelTypeGroup[]>(() => {
    const byGroup = new Map<string, FunnelSubType[]>();
    for (const sub of this.funnelSubTypes()) {
      const group = typeGroupOf(sub.value);
      byGroup.set(group, [...(byGroup.get(group) ?? []), sub]);
    }
    return TYPE_GROUP_ORDER.filter((label) => byGroup.has(label)).map((label) => ({
      label,
      types: byGroup.get(label)!,
    }));
  });

  protected readonly resultColumns: readonly GridColumn<SearchRow>[] = [
    { field: 'name', header: 'Source', sortable: true },
    { field: 'desc', header: 'About', sortable: false },
    { field: 'type', header: 'Type', sortable: true },
    { field: 'sig', header: 'Signals', sortable: false },
    { field: 'lang', header: 'Lang', sortable: true },
    { field: 'ver', header: 'Verified', sortable: true },
    { field: 'src', header: 'Src', sortable: false },
    { field: 'act', header: '', sortable: false },
  ];

  /** Filters applied in the order the rack lists them. */
  private readonly filteredSources = computed<readonly Source[]>(() => {
    let sources: readonly Source[] = ALL_SOURCES;

    for (const cap of this.caps()) {
      sources = sources.filter((source) => source.capabilities.includes(cap));
    }
    const types = this.typeFilter();
    if (types.size) {
      sources = sources.filter((source) => types.has(source.type));
    }
    const region = this.regionFilter();
    if (region) {
      sources = sources.filter((source) => source.region === region);
    }
    const categories = this.categoryFilter();
    if (categories.size) {
      sources = sources.filter((source) => categories.has(source.category));
    }
    const lang = this.langFilter();
    if (lang) {
      sources = sources.filter((source) => source.lang === lang);
    }
    const tag = this.tagFilter();
    if (tag) {
      sources = sources.filter((source) => source.tags.includes(tag));
    }
    const kw = this.kw().trim();
    if (kw) {
      sources = filterByQuery(sources, kw);
    }
    return sources;
  });

  protected readonly rows = computed<readonly SearchRow[]>(() => {
    const kw = this.kw().trim();
    const q = this.q().trim();
    const sources = kw
      ? sortSources(this.filteredSources(), 'relevance', kw)
      : this.filteredSources();
    return sources.map((source) => this.toSearchRow(source, q));
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

    for (const cap of this.caps()) {
      filters.push({
        key: `cap-${cap}`,
        label: this.capabilityLabel(cap),
        clear: () => this.onCapabilityToggle(cap),
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
    const lang = this.langFilter();
    if (lang) {
      filters.push({
        key: 'lang',
        label: `Language: ${labelFor(LANG_OPTIONS, lang)}`,
        clear: () => this.onLangChange(null),
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
    if (this.caps().size) params.set('caps', [...this.caps()].join(','));
    if (this.typeFilter().size) params.set('type', [...this.typeFilter()].join(','));
    const regVal = this.regionFilter();
    if (regVal) params.set('region', regVal);
    if (this.categoryFilter().size) params.set('category', [...this.categoryFilter()].join(','));
    const langVal = this.langFilter();
    if (langVal) params.set('lang', langVal);
    const tagVal = this.tagFilter();
    if (tagVal) params.set('tag', tagVal);
    if (this.sortField()) {
      params.set('sortField', this.sortField()!);
      params.set('sortOrder', String(this.sortOrder()));
    }

    const qs = params.toString();
    this.location.replaceState('/search', qs ? `?${qs}` : '');
  }

  private applyParamMap(map: ParamMap): void {
    const q = map.get('q') ?? '';
    if (q !== this.q()) {
      this.q.set(q);
      this.queryInput.set(q);
    }
    const kw = map.get('kw') ?? '';
    if (kw !== this.kw()) {
      this.kw.set(kw);
      this.keywordInput.set(kw);
    }
    const rawCaps = (map.get('caps') ?? '').split(',').filter(Boolean) as Capability[];
    const capsSet = new Set(rawCaps);
    if (capsSet.size !== this.caps().size || [...capsSet].some((c) => !this.caps().has(c))) {
      this.caps.set(capsSet);
    }
    const types = parseList(map.get('type'));
    if (!sameSet(types, this.typeFilter())) this.typeFilter.set(types);
    const region = map.get('region') ?? '';
    if (region !== this.regionFilter()) this.regionFilter.set(region);
    const categories = parseList(map.get('category'));
    if (!sameSet(categories, this.categoryFilter())) {
      this.categoryFilter.set(categories);
    }
    const lang = map.get('lang') ?? '';
    if (lang !== this.langFilter()) this.langFilter.set(lang);
    const tag = map.get('tag') ?? '';
    if (tag !== this.tagFilter()) this.tagFilter.set(tag);
    const sortField = map.get('sortField') ?? map.get('sort') ?? undefined;
    if (sortField !== this.sortField()) this.sortField.set(sortField);
    const sortOrder = map.get('sortOrder') === '-1' ? -1 : 1;
    if (sortOrder !== this.sortOrder()) this.sortOrder.set(sortOrder);
  }

  /** Search input field — updates `queryInput` immediately while debouncing `q` and URL memory.
   *  Prevents rapid-fire DOM animation thrashing when typing fast. */
  protected onQueryInput(value: string): void {
    this.queryInput.set(value);
    if (this.queryDebounceTimer) {
      clearTimeout(this.queryDebounceTimer);
    }
    if (!value.trim()) {
      this.q.set('');
      this.syncUrl();
      return;
    }
    this.queryDebounceTimer = setTimeout(() => {
      this.q.set(value.trim());
      this.syncUrl();
    }, 120);
  }

  /** Blur, Enter, or Update button commits the box into query immediately. */
  protected onQueryCommit(value: string): void {
    if (this.queryDebounceTimer) {
      clearTimeout(this.queryDebounceTimer);
    }
    const trimmed = value.trim();
    this.queryInput.set(trimmed);
    this.q.set(trimmed);
    this.syncUrl();
  }

  /** Table header sort change — updates `sortField` and `sortOrder`. */
  protected onSortChange(event: { field: string; order: number }): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    this.syncUrl();
  }

  /** Filter input (left half of the dual input): filters the table rows. */
  protected onKeywordInput(value: string): void {
    this.keywordInput.set(value);
    if (this.keywordDebounceTimer) {
      clearTimeout(this.keywordDebounceTimer);
    }
    this.keywordDebounceTimer = setTimeout(() => {
      this.kw.set(value.trim());
      this.syncUrl();
    }, 120);
  }

  /** Opens the first `BULK_OPEN_COUNT` rows of the table as new tabs, in the
   *  table's current sort order. Does nothing when the table is empty. */
  protected onBulkOpen(): void {
    const field = this.sortField() as keyof SearchRow | undefined;
    const order = this.sortOrder();
    const rows = field
      ? [...this.rows()].sort((a, b) => order * String(a[field]).localeCompare(String(b[field])))
      : this.rows();
    for (const row of rows.slice(0, BULK_OPEN_COUNT)) {
      window.open(row.actionHref, '_blank', 'noopener');
    }
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

  protected onRegionChange(value: string | null): void {
    this.regionFilter.set(value ?? '');
    this.syncUrl();
  }

  /** Funnel layer 1, multi-select. Clicking a selected category deselects it.
   *  Selected types that no remaining category holds are dropped. */
  protected onCategoryFunnelClick(category: string): void {
    const next = new Set(this.categoryFilter());
    if (!next.delete(category)) next.add(category);
    this.categoryFilter.set(next);
    if (next.size) {
      const available = new Set(
        ALL_SOURCES.filter((s) => next.has(s.category)).map((source) => source.type),
      );
      const kept = [...this.typeFilter()].filter((type) => available.has(type));
      if (kept.length !== this.typeFilter().size) this.typeFilter.set(new Set(kept));
    }
    this.syncUrl();
  }

  /** "All" chip: clears categories and types. */
  protected onCategoryFunnelClear(): void {
    this.categoryFilter.set(new Set());
    this.typeFilter.set(new Set());
    this.syncUrl();
  }

  /** Funnel layer 2, multi-select. Clicking a selected type deselects it. */
  protected onTypeFunnelClick(type: string): void {
    const next = new Set(this.typeFilter());
    if (!next.delete(type)) next.add(type);
    this.typeFilter.set(next);
    this.syncUrl();
  }

  protected onCategoriesToggle(): void {
    this.categoriesOpen.update((open) => !open);
  }

  protected onTypesToggle(): void {
    this.typesOpen.update((open) => !open);
  }

  protected onLangChange(value: string | null): void {
    this.langFilter.set(value ?? '');
    this.syncUrl();
  }
}
