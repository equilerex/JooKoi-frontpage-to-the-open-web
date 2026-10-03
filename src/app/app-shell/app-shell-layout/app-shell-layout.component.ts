import { afterNextRender, Component, computed, inject, isDevMode, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { SOURCE_COUNT } from '../../shared/curated-websites/source-stats.generated';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { HeadsUpDisplayHeaderComponent } from '../heads-up-display-header/heads-up-display-header.component';
import { HorizonBackdropComponent } from '../horizon-backdrop/horizon-backdrop.component';

/**
 * The frame rendered once around every page: the horizon behind everything and
 * the HUD header around a `router-outlet`.
 *
 * The header and `<main>` are siblings, which keeps the header full-bleed
 * while only page content is constrained to `--content-max`.
 *
 * Wide screens use `.hud__nav` (Home, Search, Library, Tools). Below 768px that nav
 * is hidden and the header's menu button opens the same items. The brand mark
 * also links home. The footer links to the component playground (`/specimen`)
 * only in dev mode, because that route does not exist in a production build.
 *
 * `/search` and `/library` are real routes. The parked `Browse` item was removed
 * since browsing is part of the landing experience and the brand mark links home.
 */
@Component({
  imports: [RouterOutlet, RouterLink, HorizonBackdropComponent, HeadsUpDisplayHeaderComponent],
  selector: 'joo-app-shell-layout',
  styleUrl: './app-shell-layout.component.css',
  templateUrl: './app-shell-layout.component.html',
})
export class AppShellLayoutComponent {
  private readonly router = inject(Router);

  /** Current URL, reactive to navigation. Seeded with `router.url` (the
   *  value at construction) via `startWith` so the first render — before any
   *  `NavigationEnd` has fired — already reflects the route the app landed
   *  on, rather than defaulting to whatever a hard-coded `active` used to
   *  say. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Wide shell for `/library`. Set on `NavigationStart` when entering so the
   * column can ease open before the outlet swaps; cleared on `NavigationEnd`
   * when leaving. Seeded from the landing URL so a cold load of `/library`
   * is already wide (no narrow→wide flash).
   */
  private readonly libraryWide = signal(this.matchesRoute('/library', this.router.url));

  /**
   * Width transitions only after the first paint. Cold load of `/library`
   * must not animate from the default `--content-max`.
   */
  protected readonly shellMotionReady = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.matchesRoute('/library', event.url)) {
          this.libraryWide.set(true);
        }
        return;
      }
      if (event instanceof NavigationEnd) {
        this.libraryWide.set(this.matchesRoute('/library', event.urlAfterRedirects));
      }
    });

    afterNextRender(() => {
      this.shellMotionReady.set(true);
    });
  }

  /** The `/specimen` route is registered only when `isDevMode()` (see `app.routes.ts`). */
  protected readonly showPlaygroundLink = isDevMode();

  private readonly baseHeaderNavItems: readonly NavItem[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Search', routerLink: '/search' },
    { label: 'Library', routerLink: '/library' },
    { label: 'Tools', routerLink: '/tools' },
  ];

  /** `active` derived from the real current route instead of hard-coded.
   *  `/` matches only the exact root (so `/search` etc. don't also light
   *  "Home"); every other real href matches itself or a sub-path of itself
   *  (`/library` also lights for `/library/some-topic`). */
  protected readonly headerNavItems = computed<readonly NavItem[]>(() =>
    this.withActive(this.baseHeaderNavItems),
  );

  private withActive(items: readonly NavItem[]): readonly NavItem[] {
    const url = this.currentUrl();
    return items.map((item) => {
      const target = (typeof item.routerLink === 'string' ? item.routerLink : item.href) ?? '';
      return { ...item, active: this.matchesRoute(target, url) };
    });
  }

  private matchesRoute(href: string, url: string): boolean {
    const path = this.appPath(url);
    if (href === '#') {
      return false;
    }
    if (href === '/') {
      return path === '/' || path.startsWith('/?');
    }
    return path === href || path.startsWith(`${href}/`) || path.startsWith(`${href}?`);
  }

  /** Path + search only — `NavigationStart.url` can be absolute. */
  private appPath(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        return `${parsed.pathname}${parsed.search}`;
      } catch {
        return url;
      }
    }
    return url;
  }

  /** Library uses more of the viewport than the default 80rem column. */
  protected readonly isLibraryWide = computed(() => this.libraryWide());

  /** Header status strip: the real record count. A build-time constant from
   *  the generated stats module, so it is prerendered and costs one number
   *  in main, not the dataset (decision 032). */
  protected readonly statusText = signal(`${SOURCE_COUNT} src online`);

  /** The header's compact console (deviation, 2026-09-16 mid-build: it
   *  appears on every page including home, not just inner pages) submits
   *  straight to `/search?q=…` — independent of the home launcher console's
   *  live in-place results (D4), which only `home.page.ts` implements. */
  protected onHeaderSearch(query: string): void {
    const q = query.trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }
}
