import { RenderMode, ServerRoute } from '@angular/ssr';
import { LEARN_TOPIC_ROUTES } from './shared/learn-content/learn-content.generated';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  /**
   * `/learn/:topic` needs its own entry ahead of the `**` catch-all: a
   * dynamic segment isn't enumerable from the route path alone, so the
   * prerenderer needs `getPrerenderParams` to supply the real slugs. Those
   * come from `LEARN_TOPIC_ROUTES` in the generated content module
   * (`scripts/build-learn-content.mjs`, chained ahead of `ng build` in
   * `package.json`) — same gitignored-module-imported-directly pattern as
   * `src/app/primeui-license.ts`.
   *
   * Unverified: this task's gates rule out running a production build (see
   * `AGENTS.md`'s Iteration loop table and the task brief), so this hasn't
   * been confirmed against a real prerender pass. `pnpm run build` is the
   * check — it should emit one static page per slug in `LEARN_TOPIC_ROUTES`.
   */
  {
    path: 'learn/:topic',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LEARN_TOPIC_ROUTES.map((topic) => ({ topic }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
