import { ChangeDetectionStrategy, Component } from '@angular/core';
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

interface QuickKey {
  readonly fn: string;
  readonly label: string;
  readonly count: number | null;
  /** Defaults to 'neutral' at the call site. Only the AI-marketplace key
   *  (F6, backlog #8) carries 'hot'. */
  readonly accent?: HardwareKeyAccent;
}

interface HighlightRow {
  readonly name: string;
  readonly trust: string;
  readonly desc: string;
  readonly type: string;
  readonly sig: string;
  readonly ver: string;
  readonly act: string;
}

interface Tag {
  readonly label: string;
  readonly count: number;
}

/**
 * Home route (`''`). Content mirrors `features/design-theme/index.html`'s
 * `<main>` — the shell (`app-shell-layout.component.html`) already supplies
 * the header and mobile dock, so this page owns only the launcher, the
 * trusted-highlights table and the tag chips.
 *
 * The highlights table is `joo-record-grid` using Task 1's cell-template API
 * (backlog #11-14): the source cell, trust chip, signal pills and `OPEN` key
 * are each a `jooRecordGridCell` template rather than the plain-text
 * fallback. `splitSourceCell`/`splitSignals` below parse the placeholder
 * `"Name — domain"`/`"RSS, SRCH"` strings this page has always hard-coded —
 * Task 3/4 replaces `highlights` with real `Source` records (`name`/`url`
 * and a `capabilities` array already split), at which point these two
 * helpers go away rather than change shape. No route exists yet for
 * `/source` or `/browse` (Phase 3), so every link here is `href="#"`,
 * matching the placeholder convention already used in
 * `console-landing-demo.page.html`.
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
  protected readonly scopeOptions: readonly SegmentOption[] = [
    { value: 'trusted', label: 'Trusted' },
    { value: 'all', label: 'All' },
    { value: 'discovered', label: 'Discovered' },
  ];

  protected readonly quickKeys: readonly QuickKey[] = [
    { fn: 'F1', label: 'Dev reference', count: 48 },
    { fn: 'F2', label: 'Independent news', count: 31 },
    { fn: 'F3', label: 'Science', count: 27 },
    { fn: 'F4', label: 'Search engines', count: 12 },
    { fn: 'F5', label: 'Estonian web', count: 19 },
    // AI marketplace (D3/backlog #8) — replaces the mock's "Surprise me"
    // placeholder. 8 = the seed-content list's mdskills.ai, agensi.io,
    // mcpmarket.com plus five skill-library repos; a real count arrives with
    // the Task 3/4 fixture.
    { fn: 'F6', label: 'AI marketplace', count: 8, accent: 'hot' },
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

  protected readonly highlights: readonly HighlightRow[] = [
    {
      name: 'MDN Web Docs — developer.mozilla.org',
      trust: 'Trusted',
      desc: 'Reference for HTML, CSS, JavaScript and Web APIs.',
      type: 'Reference',
      sig: 'SRCH',
      ver: '2026-09-02',
      act: 'Open',
    },
    {
      name: 'ERR News — news.err.ee',
      trust: 'Trusted',
      desc: 'Estonian public broadcaster, English-language news desk.',
      type: 'News',
      sig: 'RSS, SRCH',
      ver: '2026-08-29',
      act: 'Open',
    },
    {
      name: 'Marginalia Search — marginalia-search.com',
      trust: 'Trusted',
      desc: 'Independent search engine that favours small, text-heavy sites.',
      type: 'Search engine',
      sig: 'SRCH, API',
      ver: '2026-08-21',
      act: 'Open',
    },
    {
      name: 'arXiv — arxiv.org',
      trust: 'Trusted',
      desc: 'Open-access preprints in physics, maths and computer science.',
      type: 'Archive',
      sig: 'RSS, SRCH, API',
      ver: '2026-08-18',
      act: 'Open',
    },
  ];

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

  /**
   * Splits the placeholder `"Name — domain"` join (backlog #11) into the
   * mock's two display lines: bold name, dim mono domain underneath. Real
   * `Source` records (Task 3+) carry `name` and `url` separately and derive
   * the domain from `url` instead of a string split.
   */
  protected splitSourceCell(name: string): { readonly name: string; readonly domain: string } {
    // `noUncheckedIndexedAccess` types array-destructured elements as
    // possibly `undefined`, so both branches fall back explicitly even
    // though the placeholder data always contains the ' — ' separator.
    const [label, domain] = name.split(' — ');
    return { name: label ?? name, domain: domain ?? '' };
  }

  /**
   * Splits the placeholder comma-joined signal string (backlog #13) into
   * individual pills. Real `Source` records carry `capabilities` as an array
   * already, so this parsing step goes away with the fixture.
   */
  protected splitSignals(sig: string): readonly string[] {
    return sig
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
}
