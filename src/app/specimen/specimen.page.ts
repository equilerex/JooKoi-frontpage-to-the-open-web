import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { HeadsUpDisplayHeaderComponent } from '../app-shell/heads-up-display-header/heads-up-display-header.component';
import { HardwareKeyComponent } from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../shared/design-system/actions/keycap/keycap.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
import { ChipComponent } from '../shared/design-system/data-display/chip/chip.component';
import { CountChipComponent } from '../shared/design-system/data-display/count-chip/count-chip.component';
import { ProseContentComponent } from '../shared/design-system/data-display/prose-content/prose-content.component';
import { RecordGridCellDirective } from '../shared/design-system/data-display/record-grid/record-grid-cell.directive';
import {
  GridColumn,
  RecordGridComponent,
} from '../shared/design-system/data-display/record-grid/record-grid.component';
import {
  SpecEntry,
  SpecListComponent,
} from '../shared/design-system/data-display/spec-list/spec-list.component';
import { TagSetComponent } from '../shared/design-system/data-display/tag-set/tag-set.component';
import { TopicTreeComponent } from '../shared/design-system/data-display/topic-tree/topic-tree.component';
import { ChromeSelectComponent } from '../shared/design-system/form-controls/chrome-select/chrome-select.component';
import { ConsoleInputComponent } from '../shared/design-system/form-controls/console-input/console-input.component';
import { FieldLabelComponent } from '../shared/design-system/form-controls/field-label/field-label.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { StompboxToggleComponent } from '../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { BezelJewelComponent } from '../shared/design-system/indicators/bezel-jewel/bezel-jewel.component';
import { ClassificationBadgeComponent } from '../shared/design-system/indicators/classification-badge/classification-badge.component';
import { SegmentReadoutComponent } from '../shared/design-system/indicators/segment-readout/segment-readout.component';
import { StatusLightComponent } from '../shared/design-system/indicators/status-light/status-light.component';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import {
  IndicatorNavListComponent,
  NavItem,
} from '../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { PagerComponent } from '../shared/design-system/navigation/pager/pager.component';
import { ToolbarRowComponent } from '../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { CornerBracketsDirective } from '../shared/design-system/surfaces/corner-brackets/corner-brackets.directive';
import { FilterDrawerComponent } from '../shared/design-system/surfaces/filter-drawer/filter-drawer.component';
import { PaperSheetComponent } from '../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { LogotypeComponent } from '../shared/design-system/typography/logotype/logotype.component';
import { StripeRuleComponent } from '../shared/design-system/typography/stripe-rule/stripe-rule.component';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

/** The mockup's own column set, in its order (`components.css:1146`): name,
 *  trust, desc, type, sig, lang, ver, act. The field names double as the
 *  `data-col` values the grid's cells carry, which is what the 1439px and 767px
 *  rules in `src/styles.css` key on — a demo with different names would leave
 *  the column dropping and the whole card layout untested while looking fine. */
interface DemoRecord {
  readonly name: string;
  readonly trust: string;
  readonly desc: string;
  readonly type: string;
  readonly sig: string;
  readonly lang: string;
  readonly ver: string;
  readonly act: string;
}

@Component({
  selector: 'joo-specimen-page',
  imports: [
    RouterLink,
    SpecimenSectionComponent,
    StatusLightComponent,
    BezelJewelComponent,
    SegmentReadoutComponent,
    ClassificationBadgeComponent,
    EyebrowLabelComponent,
    LogotypeComponent,
    StripeRuleComponent,
    HardwareKeyComponent,
    KeycapComponent,
    KeycapGridComponent,
    FieldLabelComponent,
    ConsoleInputComponent,
    StompboxToggleComponent,
    SegmentSelectorComponent,
    ChromeSelectComponent,
    CapabilityTagComponent,
    ChipComponent,
    CountChipComponent,
    TagSetComponent,
    SpecListComponent,
    ProseContentComponent,
    RecordGridComponent,
    RecordGridCellDirective,
    TopicTreeComponent,
    ReadoutPanelComponent,
    PaperSheetComponent,
    CornerBracketsDirective,
    FilterDrawerComponent,
    BreadcrumbTrailComponent,
    IndicatorNavListComponent,
    PagerComponent,
    ToolbarRowComponent,
    HeadsUpDisplayHeaderComponent,
  ],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {
  /** Two-way bound to the drawer's own `open` model, so the trigger key and
   *  PrimeNG's close paths (Escape, scrim, close icon) write to the same cell. */
  protected readonly filterDrawerOpen = signal(false);
  protected readonly lightColors = ['off', 'cyan', 'magenta', 'amber', 'green'] as const;
  protected readonly jewelColors = ['cyan', 'magenta', 'amber', 'green'] as const;
  protected readonly sortOptions: readonly SegmentOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
    { value: 'alpha', label: 'A–Z' },
  ];
  protected readonly specEntries: readonly SpecEntry[] = [
    { term: 'Updated', value: 'Weekly' },
    { term: 'Feed', value: 'Atom' },
    { term: 'Licence', value: 'CC BY-SA' },
  ];
  protected readonly crumbs: readonly Crumb[] = [
    { label: 'Home', href: '#' },
    { label: 'Directory', href: '#' },
    { label: 'Zines' },
  ];
  /** `width` on one column only: it is an optional input, so leaving every
   *  column to auto-size would ship it unexercised and a broken `[style.width]`
   *  binding would look identical to a working one. */
  protected readonly recordColumns: readonly GridColumn<DemoRecord>[] = [
    { field: 'name', header: 'Name', width: '18rem' },
    { field: 'trust', header: 'Trust' },
    { field: 'desc', header: 'Description' },
    { field: 'type', header: 'Type' },
    { field: 'sig', header: 'Signal' },
    { field: 'lang', header: 'Lang' },
    { field: 'ver', header: 'Version' },
    { field: 'act', header: 'Action' },
  ];
  protected readonly recordRows: readonly DemoRecord[] = [
    {
      name: 'Low-tech Magazine',
      trust: 'Trusted',
      desc: 'Solar-powered publishing, with the whole archive shipped as a single PDF.',
      type: 'Magazine',
      sig: 'RSS',
      lang: 'EN',
      ver: '2026.09',
      act: 'Open',
    },
    {
      name: 'The Analog Web',
      trust: 'Trusted',
      desc: 'A hand-built directory of sites that still serve plain HTML over a slow link.',
      type: 'Directory',
      sig: 'Atom',
      lang: 'EN',
      ver: '2026.07',
      act: 'Open',
    },
    {
      name: 'Marginalia Search',
      trust: 'Discovered',
      desc: 'Deliberately non-commercial index of the small, the strange and the old.',
      type: 'Search',
      sig: 'None',
      lang: 'EN',
      ver: '2026.03',
      act: 'Open',
    },
  ];
  /** The virtual-scroll demo's payload. 5,000 rows is the size at which the
   *  virtualiser's absence would be obvious; `virtual` renders a screenful. */
  protected readonly virtualRows: readonly DemoRecord[] = Array.from(
    { length: 5000 },
    (_, i) => ({
      name: `Record ${String(i + 1).padStart(4, '0')}`,
      trust: i % 3 === 0 ? 'Trusted' : 'Discovered',
      desc: 'Generated row, present only to give the virtualiser something to scroll.',
      type: 'Zine',
      sig: i % 5 === 0 ? 'RSS' : 'None',
      lang: 'EN',
      ver: `2026.${String((i % 12) + 1).padStart(2, '0')}`,
      act: 'Open',
    }),
  );
  protected readonly navItems: readonly NavItem[] = [
    { label: 'Directory', href: '#directory', active: true },
    { label: 'Reference', href: '#reference', lightColor: 'amber' },
    { label: 'Tools', href: '#tools' },
  ];
  /** The `/learn` index's own shape: topics grouped under a couple of
   *  sections, one topic pre-expanded. Representative of `topic-index.md`,
   *  not the real generated content — that arrives with the content
   *  pipeline (build order step 7). */
  protected readonly treeNodes: readonly TreeNode[] = [
    {
      key: 'fundamentals',
      label: 'Fundamentals',
      expanded: true,
      children: [
        { key: '0', label: 'How LLMs actually work', leaf: true },
        { key: '1', label: 'Prompting basics', leaf: true },
      ],
    },
    {
      key: 'tooling',
      label: 'Tooling',
      children: [
        { key: '2', label: 'Agents and skills', leaf: true },
        { key: '3', label: 'MCP servers', leaf: true },
      ],
    },
  ];
  /** The page templates cannot be shown inside this page's flex rows — each is
   *  the whole page — so they are links to their own routes instead. Paths are
   *  relative to this page's `/specimen`. */
  protected readonly templateDemos: readonly { label: string; path: string }[] = [
    { label: 'Console landing', path: 'templates/console-landing' },
    { label: 'Directory browse', path: 'templates/directory-browse' },
    { label: 'Record detail', path: 'templates/record-detail' },
    { label: 'Document', path: 'templates/document' },
  ];
}
