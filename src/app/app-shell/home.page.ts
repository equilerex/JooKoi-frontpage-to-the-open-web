import { Component, computed, inject, signal } from '@angular/core';
import { Params, Router, RouterLink } from '@angular/router';
import {
  HardwareKeyAccent,
  HardwareKeyComponent,
} from '../shared/design-system/actions/hardware-key/hardware-key.component';
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
import { ALL_SOURCES } from '../shared/curated-websites/source-fixture';
import { Capability, Source } from '../shared/curated-websites/source.model';
import {
  domainOf,
  formatVerifiedDate,
  outboundSearchHref,
  sortByTrust,
  trustLabel,
} from '../shared/curated-websites/source-search';

interface QuickKey {
  readonly fn: string;
  readonly label: string;
  readonly count?: number | null;
  /** Real navigation target — either routerLink + queryParams for SPA routing or external href. */
  readonly routerLink?: string | readonly unknown[];
  readonly queryParams?: Params;
  readonly href?: string;
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
 *
 * `act`/`actionHref`/`actionAccent` mirror `search.page.ts`'s `SearchRow` —
 * fix wave 2 makes home's row action query-aware the same way `/search`'s
 * already is (Search↗ when the launcher's `query` is non-empty and the
 * record has a `searchUrl`, plain `Open` otherwise), so the fields line up
 * on purpose. See `toHighlightRow` below.
 */
interface CapabilitySignal {
  readonly id: Capability;
  readonly label: string;
}

interface HighlightRow {
  readonly name: string;
  readonly domain: string;
  readonly url: string;
  readonly trust: 'Trusted' | 'Known' | 'Discovered';
  readonly desc: string;
  readonly type: string;
  readonly sig: readonly CapabilitySignal[];
  readonly ver: string;
  /** Optional GitHub/source URL. Empty when unknown — `src` is the cell label. */
  readonly sourceUrl: string;
  readonly src: string;
  readonly act: string;
  readonly actionHref: string;
  readonly actionAccent: HardwareKeyAccent;
}

interface Tag {
  readonly label: string;
  readonly count: number;
  readonly href: string;
}

/** Abbreviations the mock's `.sig` pills use — display-only, per
 *  `source.model.ts`'s "Capabilities are named semantically" note. */
const CAPABILITY_LABEL: Record<Capability, string> = {
  'rss-feed': 'RSS',
  'site-search': 'SRCH',
  'public-api': 'API',
};

function countByCategory(category: string): number {
  return ALL_SOURCES.filter((source) => source.category === category).length;
}

function countByTag(tag: string): number {
  return ALL_SOURCES.filter((source) => source.tags.includes(tag)).length;
}

function searchHref(params: Readonly<Record<string, string>>): string {
  return `/search?${new URLSearchParams(params).toString()}`;
}

/** How many tags the "Browse by tag" panel shows — same count as the
 *  trusted-highlights panel above it (`HIGHLIGHT_COUNT`), preserving the
 *  8-chip visual density the earlier placeholder markup had. */
const TAG_PANEL_COUNT = 8;

/** Real tag frequency across the fixture, most-used first (ties broken
 *  alphabetically for a deterministic order), top `TAG_PANEL_COUNT` only.
 *  Replaces the earlier hard-coded `tags` array, whose labels and counts
 *  were invented and didn't match `SOURCE_FIXTURE` at all. Each entry's
 *  `href` follows the same `searchHref({ tag })` pattern the F5 quick key
 *  already uses. */
function topTags(count: number): readonly Tag[] {
  const counts = new Map<string, number>();
  for (const source of ALL_SOURCES) {
    for (const tag of source.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([labelA, countA], [labelB, countB]) => countB - countA || labelA.localeCompare(labelB))
    .slice(0, count)
    .map(([label, tagCount]) => ({ label, count: tagCount, href: searchHref({ tag: label }) }));
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
 * Task 4 behaviour (plan D4, brief "Home page behaviour"), **reversed by fix
 * wave 2** (see the plan's "Implementation deviations", 2026-09-16 entry
 * after the final review): D4's live in-place swap — typing in the launcher
 * re-filtering this table to ranked results — is gone. The table always
 * shows the curated `curatedSources` set (top `HIGHLIGHT_COUNT` by trust
 * score). `query` still exists (the launcher console, bound two-way to
 * `joo-console-input`) but now only feeds two things:
 *   - Submitting (Enter on the console, or the Launch key's `press`)
 *     navigates to `/search?q=…`.
 *   - It makes each row's action query-aware, the same way `/search`'s
 *     `toSearchRow` already does: `Search ↗` (opens `source.searchUrl` with
 *     `query` substituted in) when `query` is non-empty and the record has a
 *     `searchUrl`, plain `Open` (the landing page) otherwise. See
 *     `toHighlightRow` below — same pattern, not shared code, since the two
 *     pages' row shapes (`HighlightRow` vs `SearchRow`) differ.
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
    RouterLink,
  ],
  styleUrl: './home.page.css',
  templateUrl: './home.page.html',
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
      routerLink: '/search',
      queryParams: { category: 'developer-reference' },
    },
    {
      fn: 'F2',
      label: 'News',
      count: countByCategory('news'),
      routerLink: '/search',
      queryParams: { category: 'news' },
    },
    {
      fn: 'F3',
      label: 'Open-web holdouts',
      count: countByCategory('open-web'),
      routerLink: '/search',
      queryParams: { category: 'open-web' },
    },
    {
      fn: 'F4',
      label: 'Inspiration',
      count: countByCategory('inspiration'),
      routerLink: '/search',
      queryParams: { category: 'inspiration' },
    },
    {
      fn: 'F5',
      label: 'Investigative',
      count: countByTag('investigative'),
      routerLink: '/search',
      queryParams: { tag: 'investigative' },
    },
    // AI marketplace (D3) — the mock's F6 hot key. Real count from the
    // fixture, replacing the earlier hard-coded placeholder.
    {
      fn: 'F6',
      label: 'AI marketplace',
      count: countByCategory('ai-marketplace'),
      routerLink: '/search',
      queryParams: { category: 'ai-marketplace' },
      accent: 'hot',
    },
    {
      fn: 'DEV',
      label: 'Developer stack ↗',
      count: null,
      href: 'https://github.com/equilerex/JooKoi-developer-stack',
      accent: 'cyan',
    },
  ];

  protected readonly highlightColumns: readonly GridColumn<HighlightRow>[] = [
    { field: 'name', header: 'Source' },
    { field: 'trust', header: 'Trust' },
    { field: 'desc', header: 'About' },
    { field: 'type', header: 'Type' },
    { field: 'sig', header: 'Signals' },
    { field: 'ver', header: 'Verified' },
    { field: 'src', header: 'Src' },
    { field: 'act', header: '' },
  ];

  /** Curated panel content — top `HIGHLIGHT_COUNT` by trust score. Fixed
   *  (fix wave 2 drops D4's live swap): this is the only set the table ever
   *  shows, regardless of `query`. */
  private readonly curatedSources: readonly Source[] = sortByTrust(ALL_SOURCES).slice(
    0,
    HIGHLIGHT_COUNT,
  );

  /** Live-bound launcher query. No longer drives the table (fix wave 2) —
   *  feeds `onSubmit`'s navigation and each row's query-aware action instead
   *  (`toHighlightRow`). */
  protected readonly query = signal('');

  protected readonly displayedRows = computed<readonly HighlightRow[]>(() =>
    this.curatedSources.map((source) => this.toHighlightRow(source)),
  );

  protected readonly panelLabel = 'Trusted highlights';
  protected readonly panelMeta = 'recently verified';

  protected readonly tags: readonly Tag[] = topTags(TAG_PANEL_COUNT);

  /** Enter in the console, or the Launch key — both land here. An empty
   *  query still navigates, just without `q`, so Launch always does
   *  something. */
  protected onSubmit(): void {
    const q = this.query().trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }

  /** Same pattern as `search.page.ts`'s `toSearchRow`: the right-hand key
   *  always follows `searchUrl` when present (Search↗ with `{q}` filled, or
   *  Open to that marketplace landing). `url` is Name only — GitHub/home. */
  private toHighlightRow(source: Source): HighlightRow {
    const q = this.query().trim();
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
      ver: formatVerifiedDate(source.verified),
      sourceUrl,
      src: sourceUrl ? domainOf(sourceUrl) : '',
      act: canSearch ? 'Search ↗' : 'Open',
      actionHref: outboundSearchHref(source, q),
      actionAccent: canSearch ? 'cyan' : 'neutral',
    };
  }
}
