import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HardwareKeyComponent } from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../shared/design-system/actions/keycap/keycap.component';
import { CapabilityTagComponent } from '../shared/design-system/data-display/capability-tag/capability-tag.component';
import { CountChipComponent } from '../shared/design-system/data-display/count-chip/count-chip.component';
import { ProseContentComponent } from '../shared/design-system/data-display/prose-content/prose-content.component';
import {
  SpecEntry,
  SpecListComponent,
} from '../shared/design-system/data-display/spec-list/spec-list.component';
import { TagSetComponent } from '../shared/design-system/data-display/tag-set/tag-set.component';
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
import { PaperSheetComponent } from '../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { LogotypeComponent } from '../shared/design-system/typography/logotype/logotype.component';
import { StripeRuleComponent } from '../shared/design-system/typography/stripe-rule/stripe-rule.component';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

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
    CapabilityTagComponent,
    CountChipComponent,
    TagSetComponent,
    SpecListComponent,
    ProseContentComponent,
    ReadoutPanelComponent,
    PaperSheetComponent,
    CornerBracketsDirective,
    BreadcrumbTrailComponent,
    IndicatorNavListComponent,
    PagerComponent,
    ToolbarRowComponent,
  ],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {
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
  protected readonly navItems: readonly NavItem[] = [
    { label: 'Directory', href: '#directory', active: true },
    { label: 'Reference', href: '#reference', lightColor: 'amber' },
    { label: 'Tools', href: '#tools' },
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
