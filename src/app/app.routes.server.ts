import { RenderMode, ServerRoute } from '@angular/ssr';
import {
  LIBRARY_DOC_PATHS,
  LIBRARY_DOC_REDIRECTS,
  LIBRARY_FOLDER_PATHS,
} from './shared/library-content/library-index.generated';

/**
 * One literal `ServerRoute` per known library path, generated from the same
 * index `library.routes.ts` builds its literal client routes from (see that
 * file's header — a `UrlMatcher` was tried first, and Angular refuses
 * `RenderMode.Prerender` on any route reached through one, so neither side
 * uses a matcher).
 */
function prerenderRoute(path: string): ServerRoute {
  return { path, renderMode: RenderMode.Prerender };
}

export const serverRoutes: ServerRoute[] = [
  prerenderRoute(''),
  prerenderRoute('library'),
  ...LIBRARY_FOLDER_PATHS.map((path) => prerenderRoute(`library/${path}`)),
  ...LIBRARY_DOC_PATHS.map((path) => prerenderRoute(`library/${path}`)),
  ...LIBRARY_DOC_REDIRECTS.map(({ from }) => prerenderRoute(`library/${from}`)),
  // Redirect-only route (see app.routes.ts); has a param, so it cannot prerender.
  { path: 'learn/:topic', renderMode: RenderMode.Client },
  prerenderRoute('**'),
];
