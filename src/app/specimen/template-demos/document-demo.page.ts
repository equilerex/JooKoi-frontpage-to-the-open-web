import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { DocumentTemplateComponent } from '../../shared/design-system/page-templates/document-template/document-template.component';
import { PaperSheetComponent } from '../../shared/design-system/surfaces/paper-sheet/paper-sheet.component';

/**
 * The whole-page demo for `joo-document-template`, modelled on the mockup's
 * `features/design-theme/learn-topic.html`: a breadcrumb trail, then a
 * `joo-paper-sheet` of `joo-prose-content`.
 *
 * The sheet's `max-width: var(--sheet-max)` and the template's
 * `.document__body` measure are the same token, so the paper and the column it
 * sits in agree rather than fighting.
 */
@Component({
  selector: 'joo-document-demo-page',
  imports: [
    DocumentTemplateComponent,
    BreadcrumbTrailComponent,
    PaperSheetComponent,
    ProseContentComponent,
  ],
  templateUrl: './document-demo.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDemoPage {
  protected readonly crumbs: readonly Crumb[] = [
    { label: 'Home', href: '#' },
    { label: 'Learn', href: '#' },
    { label: 'Context windows' },
  ];
}
