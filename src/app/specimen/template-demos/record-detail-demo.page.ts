import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CapabilityTagComponent } from '../../shared/design-system/data-display/capability-tag/capability-tag.component';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import {
  SpecEntry,
  SpecListComponent,
} from '../../shared/design-system/data-display/spec-list/spec-list.component';
import { TagSetComponent } from '../../shared/design-system/data-display/tag-set/tag-set.component';
import {
  Crumb,
  BreadcrumbTrailComponent,
} from '../../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { RecordDetailTemplateComponent } from '../../shared/design-system/page-templates/record-detail-template/record-detail-template.component';
import { PaperSheetComponent } from '../../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../../shared/design-system/typography/eyebrow-label/eyebrow-label.component';

/**
 * The whole-page demo for `joo-record-detail-template`, modelled on the mockup's
 * `features/design-theme/source.html`.
 *
 * `asideFirst` is set: `source.html:81` is `div.split.split--aside-first`, so the
 * variant is the one the mockup's record page actually uses, and an unexercised
 * variant is what the specimen exists to catch.
 *
 * The body is a `joo-paper-sheet`. `joo-prose-content` sets the sheet ink
 * (`--sheet-text`), which is calibrated against `--surface-sheet` and measures
 * about 1.1:1 against this page's ground, so prose without the sheet under it is
 * unreadable.
 */
@Component({
  selector: 'joo-record-detail-demo-page',
  imports: [
    RecordDetailTemplateComponent,
    BreadcrumbTrailComponent,
    EyebrowLabelComponent,
    TagSetComponent,
    CapabilityTagComponent,
    ReadoutPanelComponent,
    PaperSheetComponent,
    ProseContentComponent,
    SpecListComponent,
  ],
  templateUrl: './record-detail-demo.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordDetailDemoPage {
  protected readonly crumbs: readonly Crumb[] = [
    { label: 'Home', href: '#' },
    { label: 'Directory', href: '#' },
    { label: 'MDN Web Docs' },
  ];

  protected readonly specEntries: readonly SpecEntry[] = [
    { term: 'Domain', value: 'developer.mozilla.org' },
    { term: 'Updated', value: 'Weekly' },
    { term: 'Feed', value: 'Atom' },
    { term: 'Licence', value: 'CC BY-SA' },
  ];
}
