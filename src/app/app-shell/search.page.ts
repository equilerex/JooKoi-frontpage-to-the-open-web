import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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
  styleUrl: './search.page.css'
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly q = computed(() => this.queryParamMap().get('q') ?? '');
  /** Text currently in the results query box. Search↗ hrefs use
   *  `appliedQuery`, which updates when this box blurs or Enter is pressed. */
  protected readonly queryInput = signal(this.q());
  protected readonly appliedQuery = signal(this.q());

  constructor() {
    let previousUrlQ = this.q();
    effect(() => {
      const urlQ = this.q();
      if (urlQ === previousUrlQ) {
        return;
      }
      previousUrlQ = urlQ;
      this.queryInput.set(urlQ);
      this.appliedQuery.set(urlQ);
    });
  }
  /** New sidebar keyword filter (fix wave 2) — replaces `q` as the thing
   *  that actually filters the table (`filteredSources` below) and feeds
   *  the `Relevance` sort (`sortSources`'s third argument). Own URL param,
   *  `kw`, distinct from `q`: `q` keeps meaning "what the user searched
   *  for" (still feeds the header/launcher consoles and each row's
   *  Search↗/Open action), `kw` means "what's currently filtering this
   *  table" — conflating the two was exactly what D4/ADR 020 got wrong. */
  protected readonly kw = computed(() => this.queryParamMap().get('kw') ?? '');
  protected readonly trustedOnly = computed(() => this.queryParamMap().get('trusted') === '1');
  /** Unrecognised values (a hand-edited or stale URL) are silently inert —
   *  the `.has()` check below never matches a `Capability` that a stray
   *  string can't equal, so a garbage `caps` param filters nothing rather
   *  than throwing. */
  protected readonly caps = computed<ReadonlySet<Capability>>(() => {
    const raw = (this.queryParamMap().get('caps') ?? '').split(',').filter(Boolean);
    return new Set(raw as Capability[]);
  });
  protected readonly typeFilter = computed(() => this.queryParamMap().get('type') ?? '');
  protected readonly regionFilter = computed(() => this.queryParamMap().get('region') ?? '');
  protected readonly categoryFilter = computed(() => this.queryParamMap().get('category') ?? '');
  protected readonly langFilter = computed(() => this.queryParamMap().get('lang') ?? '');
  protected readonly tagFilter = computed(() => this.queryParamMap().get('tag') ?? '');
  protected readonly sortMode = computed<SortMode>(() => {
    const raw = this.queryParamMap().get('sort');
    return raw === 'trust' || raw === 'verified' || raw === 'name' ? raw : 'relevance';
  });

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
    return {
      rss: sources.filter((s) => s.capabilities.includes('rss-feed')).length,
      search: sources.filter((s) => s.capabilities.includes('site-search')).length,
      api: sources.filter((s) => s.capabilities.includes('public-api')).length,
      trusted: sources.filter((s) => s.trustScore >= 80).length,
    };
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
    const canSearch = !!source.searchUrl;
    const sourceUrl = source.sourceUrl ?? '';
    return {
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

  /** Every filter/sort control funnels through this: merge one or more
   *  params into the current URL, `null` to remove one, everything else
   *  (`q`, and every other filter) left untouched by `merge` handling.
   *  `replaceUrl` (fix wave 4): the sidebar keyword field calls this on
   *  every keystroke now, and a `navigate` per keystroke would otherwise
   *  push one back-button entry per character typed — `replaceUrl: true`
   *  swaps the current history entry in place instead, so the URL still
   *  ends up correct (shareable/linkable `kw`) without the history spam. */
  private updateQueryParams(
    params: Record<string, string | null>,
    options?: { readonly replaceUrl?: boolean },
  ): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: options?.replaceUrl ?? false,
    });
  }

  /** Sidebar Keyword field (fix wave 4: live, not Enter-gated) — fires on
   *  every keystroke (`joo-console-input`'s `value` is a `model()`, so its
   *  `valueChange` emits per character) and filters the table immediately
   *  via `kw`/`filteredSources`, `replaceUrl`d so typing doesn't spam
   *  history. Unrelated to `q`: see the class doc's fix-wave-2 note. */
  protected onKeywordChange(value: string): void {
    this.updateQueryParams({ kw: value.trim() || null }, { replaceUrl: true });
  }

  /** Blur or Enter commits the box into Search↗ hrefs and the URL `q`.
   *  `detectChanges` runs before a following click so Search↗ already has
   *  the new href when the pointer leaves the field for a row key. */
  protected onQueryCommit(value: string): void {
    this.appliedQuery.set(value);
    this.updateQueryParams({ q: value.trim() || null }, { replaceUrl: true });
    this.changeDetector.detectChanges();
  }

  /** Reserved: open the first N Search↗ results as new tabs. The pink key
   *  is not how the query is applied. */
  protected onBulkOpen(): void {
    return;
  }

  protected onTrustedToggle(): void {
    this.updateQueryParams({ trusted: this.trustedOnly() ? null : '1' });
  }

  protected onCapabilityToggle(cap: Capability): void {
    const next = new Set(this.caps());
    if (next.has(cap)) {
      next.delete(cap);
    } else {
      next.add(cap);
    }
    this.updateQueryParams({ caps: next.size ? [...next].join(',') : null });
  }

  /** Funnel Layer 1: Type Bucket (Category) click */
  protected onCategoryFunnelClick(category: string): void {
    const nextCat = this.categoryFilter() === category ? null : category || null;
    if (!nextCat) {
      this.updateQueryParams({ category: null, type: null, region: null });
      return;
    }
    const sourcesInCat = ALL_SOURCES.filter((s) => s.category === nextCat);
    const hasType = sourcesInCat.some((s) => s.type === this.typeFilter());
    const hasRegion = sourcesInCat.some((s) => s.region === this.regionFilter());
    this.updateQueryParams({
      category: nextCat,
      type: hasType ? this.typeFilter() : null,
      region: hasRegion ? this.regionFilter() : null,
    });
  }

  /** Funnel Layer 2: Specific Type click */
  protected onTypeFunnelClick(type: string): void {
    const nextType = this.typeFilter() === type ? null : type;
    if (nextType) {
      const found = ALL_SOURCES.find((s) => s.type === nextType);
      if (found && (!this.categoryFilter() || found.category !== this.categoryFilter())) {
        this.updateQueryParams({ type: nextType, category: found.category });
        return;
      }
    }
    this.updateQueryParams({ type: nextType });
  }

  /** Funnel Layer 3: Region facet click */
  protected onRegionFunnelClick(region: string): void {
    const nextRegion = this.regionFilter() === region ? null : region;
    this.updateQueryParams({ region: nextRegion });
  }

  /** Clears all funnel levels back to all sources. */
  protected onResetFunnel(): void {
    this.updateQueryParams({ category: null, type: null, region: null, caps: null, trusted: null });
  }

  protected onTypeChange(value: string | null): void {
    this.updateQueryParams({ type: value || null });
  }

  protected onTypeChipClick(value: string): void {
    this.onTypeFunnelClick(value);
  }

  protected onResetTypeAndCategory(): void {
    this.onResetFunnel();
  }

  protected onRegionChange(value: string | null): void {
    this.updateQueryParams({ region: value || null });
  }

  protected onCategoryChange(value: string | null): void {
    this.updateQueryParams({ category: value || null });
  }

  protected onCategoryChipClick(value: string): void {
    this.onCategoryFunnelClick(value);
  }

  protected onLangChange(value: string | null): void {
    this.updateQueryParams({ lang: value || null });
  }

  protected onSortChange(mode: string): void {
    this.updateQueryParams({ sort: mode === 'relevance' ? null : mode });
  }
}
