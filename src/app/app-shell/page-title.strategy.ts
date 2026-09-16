import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_NAME = 'JooKoi';

/**
 * `"<page> · JooKoi"`, or the bare site name on a route with no title.
 *
 * The router calls `updateTitle` on every successful navigation AND once during
 * prerender, which is the reason this exists: the static `src/index.html` title
 * is a placeholder, and a prerendered page that never runs the strategy ships
 * that placeholder as its real `<title>`.
 *
 * Signature checked against the installed router (`@angular/router` 22.1.6,
 * `types/router.d.ts:179-193`): `updateTitle` is still the abstract
 * `(snapshot: RouterStateSnapshot) => void`, and `buildTitle` is a public
 * helper with the same parameter — not `protected`, despite what the brief
 * hedged about.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  readonly #title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    this.#title.setTitle(routeTitle ? `${routeTitle} · ${SITE_NAME}` : SITE_NAME);
  }
}
