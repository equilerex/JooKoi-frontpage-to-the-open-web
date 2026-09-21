import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * The specimen parts kit is a development tool, not a page of the site. The
 * route exists only when isDevMode() is true, so the production route table
 * never contains it and the prerenderer never sees it. Its chunk is lazy, so
 * it costs nothing in the initial bundle either way.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app-shell/home.page').then((m) => m.HomePage),
    title: 'Home',
  },
  {
    path: 'search',
    loadComponent: () => import('./app-shell/search.page').then((m) => m.SearchPage),
    title: 'Search',
  },
  /** D8 + ADR 029: old `/learn` URLs land on the crash-course collection. */
  {
    path: 'learn',
    pathMatch: 'full',
    redirectTo: '/library/ai-tooling-crash-course-for-developers',
  },
  {
    path: 'learn/:topic',
    redirectTo: (data) => `/library/ai-tooling-crash-course-for-developers/${data.params['topic']}`,
  },
  {
    path: 'library',
    loadChildren: () => import('./app-shell/library/library.routes').then((m) => m.libraryRoutes),
  },
  ...(isDevMode()
    ? [
        {
          path: 'specimen',
          title: 'Specimen',
          loadChildren: () => import('./specimen/specimen.routes').then((m) => m.specimenRoutes),
        },
      ]
    : []),
  {
    path: '**',
    loadComponent: () => import('./app-shell/not-found.page').then((m) => m.NotFoundPage),
    title: 'Not found',
  },
];
