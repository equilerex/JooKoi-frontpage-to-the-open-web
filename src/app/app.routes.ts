import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { HomePage } from './app-shell/home.page';
import { NotFoundPage } from './app-shell/not-found.page';
import { SearchPage } from './app-shell/search.page';

/**
 * The specimen parts kit is a development tool, not a page of the site. The
 * route exists only when isDevMode() is true, so the production route table
 * never contains it and the prerenderer never sees it. Its chunk is lazy, so
 * it costs nothing in the initial bundle either way.
 */
export const routes: Routes = [
  { path: '', component: HomePage, title: 'Home' },
  { path: 'search', component: SearchPage, title: 'Search' },
  ...(isDevMode()
    ? [
        {
          path: 'specimen',
          title: 'Specimen',
          loadChildren: () => import('./specimen/specimen.routes').then((m) => m.specimenRoutes),
        },
      ]
    : []),
  { path: '**', component: NotFoundPage, title: 'Not found' },
];
