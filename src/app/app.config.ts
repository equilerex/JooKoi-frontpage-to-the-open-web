import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { jookoiPreset } from './shared/design-system/theme/jookoi-preset';
import { ELEVATION } from './shared/design-system/theme/elevation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    providePrimeNG({
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
