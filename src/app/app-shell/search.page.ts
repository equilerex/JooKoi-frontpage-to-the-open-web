import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HardwareKeyAccent,
  HardwareKeyComponent,
} from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
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
import { SOURCE_FIXTURE } from '../shared/curated-websites/source-fixture';
import { Capability, Source } from '../shared/curated-websites/source.model';
import {
  domainOf,
  filterByQuery,
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
interface SearchRow {
  readonly name: string;
  readonly domain: string;
  readonly url: string;
  readonly trust: 'Trusted' | 'Known' | 'Discovered';
  readonly desc: string;
  readonly type: string;
  readonly sig: readonly Capability[];
  readonly lang: string;
  readonly ver: string;
  /** Text label for the `act` column's cell template — 'Search ↗' when a
   *  live query can be substituted into the source's `searchUrl`, 'Open'
   *  otherwise (no query yet, or the source has no `searchUrl` at all). */
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

/** Readable labels for the category slugs the fixture actually holds — the
 *  same five labels `home.page.ts`'s `quickKeys` use, so the same category
 *  reads the same way in both places. Not exported/shared: `quickKeys`
 *  pairs a label with a count and an `href`, three things this page's plain
 *  select doesn't need, so re-deriving four short strings here is cheaper
 *  than threading a shared constant through two unrelated shapes. */
const CATEGORY_LABEL: Record<string, string> = {
  'developer-reference': 'Developer reference',
  news: 'News',
  'open-web': 'Open-web holdouts',
  inspiration: 'Inspiration',
  'ai-marketplace': 'AI marketplace',
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

const TYPE_OPTIONS = toSelectOptions(
  'Any type',
  uniqueSorted(SOURCE_FIXTURE.map((source) => source.type)),
);
const REGION_OPTIONS = toSelectOptions(
  'Any region',
  uniqueSorted(
    SOURCE_FIXTURE.map((source) => source.region).filter((region): region is string => !!region),
  ),
);
const CATEGORY_OPTIONS = toSelectOptions(
  'Any category',
  uniqueSorted(SOURCE_FIXTURE.map((source) => source.category)),
  (value) => CATEGORY_LABEL[value] ?? value,
);
const DISTINCT_LANGS = uniqueSorted(
  SOURCE_FIXTURE.map((source) => source.lang).filter((lang): lang is string => !!lang),
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
 * included. `q` still means "what the user searched for" (it's what
 * `/search?q=…` carries in, and it still feeds each row's Search↗/Open
 * action via `toSearchRow`) but it no longer touches the result set or the
 * `Relevance` sort — `kw` does both now.
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
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly q = computed(() => this.queryParamMap().get('q') ?? '');
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
  private readonly tagFilter = computed(() => this.queryParamMap().get('tag') ?? '');
  protected readonly sortMode = computed<SortMode>(() => {
    const raw = this.queryParamMap().get('sort');
    return raw === 'trust' || raw === 'verified' || raw === 'name' ? raw : 'relevance';
  });

  protected readonly showLangFilter = DISTINCT_LANGS.length > 1;
  protected readonly capabilityToggles = CAPABILITY_TOGGLES;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly regionOptions = REGION_OPTIONS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly langOptions = LANG_OPTIONS;

  protected readonly resultColumns: readonly GridColumn<SearchRow>[] = [
    { field: 'name', header: 'Source' },
    { field: 'trust', header: 'Trust' },
    { field: 'desc', header: 'About' },
    { field: 'type', header: 'Type' },
    { field: 'sig', header: 'Signals' },
    { field: 'lang', header: 'Lang' },
    { field: 'ver', header: 'Verified' },
    { field: 'act', header: '' },
  ];

  /** Filters (every field but sort), applied in the order the rack lists
   *  them. Order doesn't change the result set — every step is an
   *  intersection — but matches the rack for readability. */
  private readonly filteredSources = computed<readonly Source[]>(() => {
    let sources: readonly Source[] = SOURCE_FIXTURE;

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

  protected readonly rows = computed<readonly SearchRow[]>(() =>
    this.sortedSources().map((source) => this.toSearchRow(source)),
  );

  protected readonly resultCount = computed(() => this.rows().length);

  private toSearchRow(source: Source): SearchRow {
    const q = this.q().trim();
    const canSearch = q.length > 0 && !!source.searchUrl;
    return {
      name: source.name,
      domain: domainOf(source.url),
      url: source.url,
      trust: trustLabel(source.trustScore),
      desc: source.desc,
      type: source.type,
      sig: source.capabilities,
      lang: source.lang ? source.lang.toUpperCase() : '—',
      ver: source.verified,
      act: canSearch ? 'Search ↗' : 'Open',
      actionHref: canSearch ? source.searchUrl!.replace('{q}', encodeURIComponent(q)) : source.url,
      actionAccent: canSearch ? 'cyan' : 'neutral',
    };
  }

  protected capabilityLabel(capability: Capability): string {
    return CAPABILITY_LABEL[capability];
  }

  /** Every filter/sort control funnels through this: merge one or more
   *  params into the current URL, `null` to remove one, everything else
   *  (`q`, and every other filter) left untouched by `merge` handling. */
  private updateQueryParams(params: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  protected onKeywordChange(value: string): void {
    this.updateQueryParams({ kw: value.trim() || null });
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

  /** `joo-chrome-select`'s `value` model is `string | null` (PrimeNG's
   *  `Select` reports no selection as `null`, not empty string) — every
   *  option here carries a real value including the `''` "Any …" sentinel,
   *  so `null` and `''` both mean "no filter" and collapse the same way. */
  protected onTypeChange(value: string | null): void {
    this.updateQueryParams({ type: value || null });
  }

  protected onRegionChange(value: string | null): void {
    this.updateQueryParams({ region: value || null });
  }

  protected onCategoryChange(value: string | null): void {
    this.updateQueryParams({ category: value || null });
  }

  protected onLangChange(value: string | null): void {
    this.updateQueryParams({ lang: value || null });
  }

  protected onSortChange(mode: string): void {
    this.updateQueryParams({ sort: mode === 'relevance' ? null : mode });
  }
}
