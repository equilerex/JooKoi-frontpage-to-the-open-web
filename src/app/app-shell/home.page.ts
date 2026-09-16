import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HardwareKeyComponent } from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../shared/design-system/actions/keycap/keycap.component';
import { CountChipComponent } from '../shared/design-system/data-display/count-chip/count-chip.component';
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
import { StatusLightComponent } from '../shared/design-system/indicators/status-light/status-light.component';
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
 * The highlights table is `joo-record-grid`, not a hand-written
 * `<table class="data-table">`: `.data-table`/`.table-wrap` from the mockup
 * were never ported into `src/styles.css` — the only styled, responsive
 * table path the app has is `.joo-record-grid` (`src/styles.css:242-360`).
 * record-grid only renders plain-text cells, so the mock's trust badge,
 * capability tags and per-row action key collapse to plain strings here;
 * logged in `BACKLOG.md` rather than building a cell-template API for one
 * table. No route exists yet for `/source` or `/browse` (Phase 3), so every
 * link here is `href="#"`, matching the placeholder convention already used
 * in `console-landing-demo.page.html`.
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
    StatusLightComponent,
    RecordGridComponent,
    TagSetComponent,
    CountChipComponent,
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
    { fn: 'F6', label: 'Surprise me', count: null },
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
}
