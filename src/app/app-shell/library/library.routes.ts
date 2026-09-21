import { Routes } from '@angular/router';
import {
  LIBRARY_DOC_PATHS,
  LIBRARY_DOC_REDIRECTS,
  LIBRARY_FOLDER_PATHS,
} from '../../shared/library-content/library-index.generated';
import { LibraryLayoutStore } from './library-layout.store';

/**
 * One literal route per known path (R1, `_architecture/plans/2026-09-16-library-archive-section.md`),
 * built from the same generated index the content pipeline emits — not a
 * `UrlMatcher`. The plan named a `UrlMatcher` consuming every remaining
 * segment as the first choice and flagged it "verify before building"
 * against prerendering; verified against the real dev server and it does
 * not work — Angular refuses `RenderMode.Prerender` on any route reached
 * through a matcher (`ssr.mjs`: "Routes with matchers cannot use
 * prerendering"), and this repo prerenders everything (decision 004, no
 * server). The plan's own named fallback — literal routes/`ServerRoute`s —
 * is what actually ships. Angular's flat `path` strings accept literal
 * multi-segment values directly (`'learn/agent-sandboxing'`). The one
 * nested parent is the layout that holds the persistent file tree; the
 * folder/document entries stay literal children of that, not a matcher.
 * The resolved path travels as route `data` rather than a `:param`, since
 * there is no param to read — each entry already knows its own path at
 * generation time.
 */
export const libraryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./library-layout.page').then((m) => m.LibraryLayoutPage),
    providers: [LibraryLayoutStore],
    children: [
      {
        path: '',
        loadComponent: () => import('./library-folder.page').then((m) => m.LibraryFolderPage),
        data: { libraryPath: '' },
        title: 'Library',
      },
      ...LIBRARY_FOLDER_PATHS.map((path) => ({
        path,
        loadComponent: () => import('./library-folder.page').then((m) => m.LibraryFolderPage),
        data: { libraryPath: path },
        title: 'Library',
      })),
      ...LIBRARY_DOC_PATHS.map((path) => ({
        path,
        loadComponent: () => import('./library-document.page').then((m) => m.LibraryDocumentPage),
        data: { libraryPath: path },
        title: 'Library',
      })),
      ...LIBRARY_DOC_REDIRECTS.map(({ from, to }) => ({
        path: from,
        redirectTo: `/library/${to}`,
      })),
    ],
  },
];
