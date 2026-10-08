import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import { DocumentTemplateComponent } from '../../shared/design-system/page-templates/document-template/document-template.component';
import { PaperSheetComponent } from '../../shared/design-system/surfaces/paper-sheet/paper-sheet.component';

/** `/calendar-sync`: what the personal calendar sync service is. Static copy, prerendered. */
@Component({
  selector: 'joo-calendar-sync-page',
  imports: [
    RouterLink,
    BreadcrumbTrailComponent,
    DocumentTemplateComponent,
    PaperSheetComponent,
    ProseContentComponent,
  ],
  templateUrl: './calendar-sync.page.html',
})
export class CalendarSyncPage {
  protected readonly crumbs: readonly Crumb[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Calendar sync' },
  ];
}
