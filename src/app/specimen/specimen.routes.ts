import { Routes } from '@angular/router';
import { SpecimenPage } from './specimen.page';

/**
 * The parts kit index, plus one full-page route per page template.
 *
 * The four demos are siblings of the index, not children of it: a page template
 * *is* the page, so it has to render into the shell's `router-outlet` with its
 * own `main.page` around it, not inside the specimen index's flex rows. Each is
 * lazily loaded, so opening the index does not pull in four page components.
 */
export const specimenRoutes: Routes = [
  { path: '', component: SpecimenPage, title: 'Specimen' },
  {
    path: 'templates/console-landing',
    loadComponent: () =>
      import('./template-demos/console-landing-demo.page').then((m) => m.ConsoleLandingDemoPage),
    title: 'Console landing template',
  },
  {
    path: 'templates/directory-browse',
    loadComponent: () =>
      import('./template-demos/directory-browse-demo.page').then((m) => m.DirectoryBrowseDemoPage),
    title: 'Directory browse template',
  },
  {
    path: 'templates/record-detail',
    loadComponent: () =>
      import('./template-demos/record-detail-demo.page').then((m) => m.RecordDetailDemoPage),
    title: 'Record detail template',
  },
  {
    path: 'templates/document',
    loadComponent: () =>
      import('./template-demos/document-demo.page').then((m) => m.DocumentDemoPage),
    title: 'Document template',
  },
];
