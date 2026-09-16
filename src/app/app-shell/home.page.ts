import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HardwareKeyAccent, HardwareKeyComponent } from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../shared/design-system/actions/keycap/keycap.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
import { ChipComponent } from '../shared/design-system/data-display/chip/chip.component';
import { RecordGridCellDirective } from '../shared/design-system/data-display/record-grid/record-grid-cell.directive';
import {
  GridColumn,
  RecordGridComponent,
} from '../shared/design-system/data-display/record-grid/record-grid.component';
import { TagSetComponent } from '../shared/design-system/data-display/tag-set/tag-set.component';
import { ConsoleInputComponent } from '../shared/design-system/form-controls/console-input/console-input.component';
import { FieldLabelComponent } from '../shared/design-system/form-controls/field-label/field-label.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { ClassificationBadgeComponent } from '../shared/design-system/indicators/classification-badge/classification-badge.component';
import { ToolbarRowComponent } from '../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { ConsoleLandingTemplateComponent } from '../shared/design-system/page-templates/console-landing-template/console-landing-template.component';
import { CornerBracketsDirective } from '../shared/design-system/surfaces/corner-brackets/corner-brackets.directive';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { LogotypeComponent } from '../shared/design-system/typography/logotype/logotype.component';
import { StripeRuleComponent } from '../shared/design-system/typography/stripe-rule/stripe-rule.component';
import { SOURCE_FIXTURE } from '../shared/curated-websites/source-fixture';
import { Capability, Source } from '../shared/curated-websites/source.model';
import { domainOf, filterByQuery, sortByRelevance, sortByTrust } from '../shared/curated-websites/source-search';

interface QuickKey {
  readonly fn: string;
  readonly label: string;
  readonly count: number;
  /** Real navigation target (Task 4) — a `/search?…` URL carrying either a
   *  `category` or a `tag` pre-filter. Plain `href`, not `Router.navigate`:
   *  `joo-keycap` renders a real anchor whenever `href` is non-empty, and the
   *  design system stays Router-agnostic (see its own component doc). */
  readonly href: string;
  /** Defaults to 'neutral' at the call site. Only the AI-marketplace key
   *  (F6) carries 'hot'. */
  readonly accent?: HardwareKeyAccent;
}

/**
 * Display row for `joo-record-grid`. Field *names* are pinned to the
 * `data-col` keys the ported table CSS keys on (`src/styles.css:242-360`) —
 * `GridColumn.field` must be `keyof HighlightRow`, so `sig` stays `sig`
 * rather than becoming `capabilities` even though the value underneath is
 * now a real `Capability[]`, not the old placeholder's comma-joined string.
 * `domain` and `url` aren't columns; they're extra data the `name`/`act`
 * cell templates need and a plain interface is free to carry.
 */
interface HighlightRow {
  readonly name: string;
  readonly domain: string;
  readonly url: string;
  readonly trust: 'Trusted' | 'Known' | 'Discovered';
  readonly desc: string;
  readonly type: string;
  readonly sig: readonly Capability[];
  readonly ver: string;
  readonly act: string;
}

interface Tag {
  readonly label: string;
  readonly count: number;
}

/** Abbreviations the mock's `.sig` pills use — display-only, per
 *  `source.model.ts`'s "Capabilities are named semantically" note. */
const CAPABILITY_LABEL: Record<Capability, string> = {
  'rss-feed': 'RSS',
  'site-search': 'SRCH',
  'public-api': 'API',
};

/** Trust bands from `source.model.ts`'s doc comment (80-100 Trusted, 50-79
 *  Known, below 50 Discovered). Display-only; ranking uses the raw score. */
function trustLabel(trustScore: number): HighlightRow['trust'] {
  if (trustScore >= 80) return 'Trusted';
  if (trustScore >= 50) return 'Known';
  return 'Discovered';
}

/** The one display-row mapping this task's brief asks for: `Source` ->
 *  `HighlightRow`. `trustScore` -> `trust` (banded to a label), `capabilities`
 *  -> `sig` (kept as an array, no longer parsed from a string), `verified`
 *  -> `ver`. `act` has no `Source` field — it's the row action, synthesized
 *  as a constant label backed by the record's own `url`. */
function toHighlightRow(source: Source): HighlightRow {
  return {
    name: source.name,
    domain: domainOf(source.url),
    url: source.url,
    trust: trustLabel(source.trustScore),
    desc: source.desc,
    type: source.type,
    sig: source.capabilities,
    ver: source.verified,
    act: 'Open',
  };
}

function countByCategory(category: string): number {
  return SOURCE_FIXTURE.filter((source) => source.category === category).length;
}

function countByTag(tag: string): number {
  return SOURCE_FIXTURE.filter((source) => source.tags.includes(tag)).length;
}

function searchHref(params: Readonly<Record<string, string>>): string {
  return `/search?${new URLSearchParams(params).toString()}`;
}

/** How many of the trust-sorted fixture the empty-query "Trusted highlights"
 *  set shows. The plan doesn't specify a curation rule beyond "e.g. top N by
 *  trustScore" — this is that judgment call: top 8 by `trustScore` (ties
 *  broken by name, via `sortByTrust`), same size as the tag panel below it. */
const HIGHLIGHT_COUNT = 8;

/**
 * Home route (`''`). Content mirrors `features/design-theme/index.html`'s
 * `<main>` — the shell (`app-shell-layout.component.html`) already supplies
 * the header and mobile dock, so this page owns only the launcher, the
 * trusted-highlights/search-results table and the tag chips.
 *
 * Task 4 behaviour (plan D4, brief "Home page behaviour"):
 *   - The launcher console (`query`, a signal bound two-way to
 *     `joo-console-input`) drives `displayedRows` in place. Empty query ->
 *     the curated `curatedHighlights` set; non-empty -> `filterByQuery` +
 *     `sortByRelevance` over the real fixture, same panel, retitled, with a
 *     match count. No overlay, no outside-click handling, no focus trap —
 *     per D4, the swap is the same component staying in the same position.
 *   - Submitting (Enter on the console, or the Launch key's `press`)
 *     navigates to `/search?q=…`. `/search` is a Task 5 page; this task adds
 *     a minimal placeholder route (`search.page.ts`) so the navigation lands
 *     somewhere real instead of the wildcard 404.
 *   - `quickKeys` (F1-F6) are real `href`s into pre-filtered search. The
 *     fixture's real `category` values (`developer-reference`, `news`,
 *     `open-web`, `inspiration`, `ai-marketplace`) don't total five without
 *     `ai-marketplace` (reserved for F6, the hot key) — one short of the
 *     F1-F5 the plan's placeholder labels implied. Judgment call: F5 filters
 *     by the `investigative` tag instead of a category, since the plan's own
 *     "News, deliberately not US-centric" section names that as a real
 *     editorial subgroup. Counts are computed from the fixture, not
 *     hard-coded, so they can't drift from it.
 */
@Component({
  selector: 'joo-home-page',
  imports: [
    ConsoleLandingTemplateComponent,
    ReadoutPanelComponent,
    CornerBracketsDirective,
    EyebrowLabelComponent,
    LogotypeComponent,
    ConsoleInputComponent,
    HardwareKeyComponent,
    ToolbarRowComponent,
    FieldLabelComponent,
    SegmentSelectorComponent,
    KeycapGridComponent,
    KeycapComponent,
    StripeRuleComponent,
    RecordGridComponent,
    RecordGridCellDirective,
    ClassificationBadgeComponent,
    CapabilityTagComponent,
    ChipComponent,
    TagSetComponent,
  ],
  styleUrl: './home.page.css',
  templateUrl: './home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly router = inject(Router);

  protected readonly scopeOptions: readonly SegmentOption[] = [
    { value: 'trusted', label: 'Trusted' },
    { value: 'all', label: 'All' },
    { value: 'discovered', label: 'Discovered' },
  ];

  protected readonly quickKeys: readonly QuickKey[] = [
    {
      fn: 'F1',
      label: 'Developer reference',
      count: countByCategory('developer-reference'),
      href: searchHref({ category: 'developer-reference' }),
    },
    {
      fn: 'F2',
      label: 'News',
      count: countByCategory('news'),
      href: searchHref({ category: 'news' }),
    },
    {
      fn: 'F3',
      label: 'Open-web holdouts',
      count: countByCategory('open-web'),
      href: searchHref({ category: 'open-web' }),
    },
    {
      fn: 'F4',
      label: 'Inspiration',
      count: countByCategory('inspiration'),
      href: searchHref({ category: 'inspiration' }),
    },
    {
      fn: 'F5',
      label: 'Investigative',
      count: countByTag('investigative'),
      href: searchHref({ tag: 'investigative' }),
    },
    // AI marketplace (D3) — the mock's F6 hot key. Real count from the
    // fixture, replacing the earlier hard-coded placeholder.
    {
      fn: 'F6',
      label: 'AI marketplace',
      count: countByCategory('ai-marketplace'),
      href: searchHref({ category: 'ai-marketplace' }),
      accent: 'hot',
    },
  ];

  protected readonly highlightColumns: readonly GridColumn<HighlightRow>[] = [
    { field: 'name', header: 'Source' },
    { field: 'trust', header: 'Trust' },
    { field: 'desc', header: 'About' },
    { field: 'type', header: 'Type' },
    { field: 'sig', header: 'Signals' },
    { field: 'ver', header: 'Verified' },
    { field: 'act', header: '' },
  ];

  /** Empty-query panel content — top `HIGHLIGHT_COUNT` by trust score. */
  private readonly curatedHighlights: readonly HighlightRow[] = sortByTrust(SOURCE_FIXTURE)
    .slice(0, HIGHLIGHT_COUNT)
    .map(toHighlightRow);

  /** Live-bound launcher query (D4). */
  protected readonly query = signal('');

  protected readonly isSearching = computed(() => this.query().trim().length > 0);

  private readonly searchResults = computed<readonly Source[]>(() => {
    const q = this.query();
    return q.trim() ? sortByRelevance(filterByQuery(SOURCE_FIXTURE, q), q) : [];
  });

  /** The one panel, in place: highlights or results, same shape either way
   *  (D4 — "no overlay... content swaps"). */
  protected readonly displayedRows = computed<readonly HighlightRow[]>(() =>
    this.isSearching() ? this.searchResults().map(toHighlightRow) : this.curatedHighlights,
  );

  protected readonly panelLabel = computed(() =>
    this.isSearching() ? 'Search results' : 'Trusted highlights',
  );

  protected readonly panelMeta = computed(() => {
    if (!this.isSearching()) {
      return 'recently verified';
    }
    const count = this.searchResults().length;
    return `${count} match${count === 1 ? '' : 'es'}`;
  });

  protected readonly tags: readonly Tag[] = [
    { label: 'css', count: 22 },
    { label: 'accessibility', count: 9 },
    { label: 'rss-friendly', count: 140 },
    { label: 'no-tracking', count: 63 },
    { label: 'estonia', count: 19 },
    { label: 'preprints', count: 6 },
    { label: 'small-web', count: 37 },
    { label: 'datasets', count: 14 },
  ];

  /** Enter in the console, or the Launch key — both land here (D4: "Submitting
   *  (Enter, or the Launch key) navigates to `/search?q=…`"). An empty query
   *  still navigates, just without `q`, so Launch always does something. */
  protected onSubmit(): void {
    const q = this.query().trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }

  protected capabilityLabel(capability: Capability): string {
    return CAPABILITY_LABEL[capability];
  }
}
