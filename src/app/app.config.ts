import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  RouteReuseStrategy,
  TitleStrategy,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { PRIMEUI_LICENSE } from './primeui-license';
import { routes } from './app.routes';
import { PageTitleStrategy } from './app-shell/page-title.strategy';
import { LibraryRouteReuseStrategy } from './app-shell/library/library-route-reuse-strategy';
import { jookoiPreset } from './shared/design-system/theme/jookoi-preset';
import { ELEVATION } from './shared/design-system/theme/elevation';

function routePath(snapshot: {
  pathFromRoot: readonly { url: readonly { path: string }[] }[];
}): string {
  return snapshot.pathFromRoot
    .map((route) => route.url.map((segment) => segment.path).join('/'))
    .filter((part) => part.length > 0)
    .join('/');
}

function inLibrary(path: string): boolean {
  return path === 'library' || path.startsWith('library/');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const fromPath = routePath(from);
          const toPath = routePath(to);
          // Query/fragment-only: no flash.
          if (fromPath === toPath) {
            transition.skipTransition();
            return;
          }
          // Library-internal drill-in uses CSS reader-layer motion (ADR 031).
          // Document VT there double-claimed nodes; keep shell VT for Home/Search/Library.
          if (inLibrary(fromPath) && inLibrary(toPath)) {
            transition.skipTransition();
          }
        },
      }),
    ),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    { provide: RouteReuseStrategy, useClass: LibraryRouteReuseStrategy },
    provideClientHydration(),
    providePrimeNG({
      // Generated before every build by scripts/primeui-license.mjs, from a
      // gitignored file rather than from source. An empty string is a valid
      // state: PrimeNG reports the missing licence itself with a console
      // warning and an on-page banner, so a fresh clone runs unchanged.
      license: PRIMEUI_LICENSE,
      theme: {
        preset: jookoiPreset,
        options: {
          // PrimeNG defaults to `p`, which collides head-on with our --p-*
          // primitive tokens. Moving PrimeNG's prefix is the cheaper side of
          // the collision (decision 011).
          prefix: 'png',
          // Our theme is always dark. Binding the dark selector to the theme
          // attribute that is already static in index.html means PrimeNG's
          // dark palette applies without a second mechanism.
          darkModeSelector: '[data-theme="retro"]',
          cssLayer: {
            name: 'primeng',
            order: 'reset, tokens, base, primeng, components, utilities',
          },
        },
      },
      zIndex: {
        menu: ELEVATION.menu,
        overlay: ELEVATION.overlay,
        modal: ELEVATION.modal,
        tooltip: ELEVATION.tooltip,
      },
    }),
  ],
};
