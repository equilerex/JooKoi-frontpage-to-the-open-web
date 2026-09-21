import {
  afterNextRender,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { HeadsUpDisplayHeaderComponent } from '../heads-up-display-header/heads-up-display-header.component';
import { HorizonBackdropComponent } from '../horizon-backdrop/horizon-backdrop.component';
import { MobileBottomDockComponent } from '../mobile-bottom-dock/mobile-bottom-dock.component';

/**
 * The frame rendered once around every page: the horizon behind everything, the
 * HUD header and the mobile dock around a `router-outlet`.
 *
 * The header, `<main>` and the dock are siblings, which is what keeps the header
 * and the dock full-bleed while only page content is constrained to
 * `--content-max`.
 *
 * Two nav lists, not one, because the header and the mobile dock disagree with
 * each other by design (mock `index.html:25-35` vs `:221-226`): the header's
 * `.hud__nav` is Search/Browse/Library only — the brand mark is the way home,
 * not a fourth nav item — while the mobile dock is a `Home` item plus the same
 * three. A single shared list could satisfy one shape or the other but not
 * both, so this component owns two.
 *
 * `/search` (Task 5 — `search.page.ts`) and `/library` (the library-archive
 * section, `_architecture/plans/2026-09-16-library-archive-section.md` —
 * superseded the earlier `/learn` + `/learn/:topic`, which now redirect
 * into it) are both real routes, so the header console, the home launcher
 * console, the quick keys and the Library nav item all land somewhere real.
 * `/browse` stays `#`: it is `parked` (D2), not scheduled.
 */
@Component({
  imports: [
    RouterOutlet,
    HorizonBackdropComponent,
    HeadsUpDisplayHeaderComponent,
    MobileBottomDockComponent,
  ],
  selector: 'joo-app-shell-layout',
  styleUrl: './app-shell-layout.component.css',
  templateUrl: './app-shell-layout.component.html'
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
      // The record count needs the whole source fixture (~120 kB raw). It is
      // read after first render so the fixture stays out of the initial bundle
      // (decision 032); the placeholder is the same width, so nothing shifts.
      void import('../../shared/curated-websites/source-fixture').then(({ ALL_SOURCES }) => {
        this.statusText.set(`${ALL_SOURCES.length} src online`);
      });
    });
  }

  private readonly baseHeaderNavItems: readonly NavItem[] = [
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Library', href: '/library' },
  ];

  private readonly baseDockNavItems: readonly NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Library', href: '/library' },
  ];

  /** `active` derived from the real current route instead of hard-coded.
   *  `/` matches only the exact root (so `/search` etc. don't also light
   *  "Home"); every other real href matches itself or a sub-path of itself
   *  (`/learn` also lights for `/learn/some-topic`); `#` (the parked
   *  `Browse` route) never matches anything. */
  protected readonly headerNavItems = computed<readonly NavItem[]>(() =>
    this.withActive(this.baseHeaderNavItems),
  );

  protected readonly dockNavItems = computed<readonly NavItem[]>(() =>
    this.withActive(this.baseDockNavItems),
  );

  private withActive(items: readonly NavItem[]): readonly NavItem[] {
    const url = this.currentUrl();
    return items.map((item) => ({ ...item, active: this.matchesRoute(item.href, url) }));
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

  /** Header status strip: the real record count, filled in after first render
   *  (see the constructor). Three dashes match the width of a three-digit count. */
  protected readonly statusText = signal('--- src online');

  /** The header's compact console (deviation, 2026-09-16 mid-build: it
   *  appears on every page including home, not just inner pages) submits
   *  straight to `/search?q=…` — independent of the home launcher console's
   *  live in-place results (D4), which only `home.page.ts` implements. */
  protected onHeaderSearch(query: string): void {
    const q = query.trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }
}
