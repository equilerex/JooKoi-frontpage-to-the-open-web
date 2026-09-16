import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { SOURCE_FIXTURE } from '../../shared/curated-websites/source-fixture';
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
 * `.hud__nav` is Search/Browse/Learn only — the brand mark is the way home,
 * not a fourth nav item — while the mobile dock is a `Home` item plus the same
 * three. A single shared list could satisfy one shape or the other but not
 * both, so this component owns two.
 *
 * `/search` (Task 5 — `search.page.ts`) and `/learn` + `/learn/:topic`
 * (Task 6 — `learn.page.ts`, `learn-topic.page.ts`) are both real routes
 * now, so the header console, the home launcher console, the quick keys and
 * the Learn nav item all land somewhere real. `/browse` stays `#`: it is
 * `parked` (D2), not scheduled.
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
  templateUrl: './app-shell-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private readonly baseHeaderNavItems: readonly NavItem[] = [
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Learn', href: '/learn' },
  ];

  private readonly baseDockNavItems: readonly NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Learn', href: '/learn' },
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
    if (href === '#') {
      return false;
    }
    if (href === '/') {
      return url === '/' || url.startsWith('/?');
    }
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
  }

  /** Header status strip (backlog #1-3) — real record count from the Task 3
   *  fixture, not the earlier hard-coded placeholder. */
  protected readonly statusText = `${SOURCE_FIXTURE.length} src online`;

  /** The header's compact console (deviation, 2026-09-16 mid-build: it
   *  appears on every page including home, not just inner pages) submits
   *  straight to `/search?q=…` — independent of the home launcher console's
   *  live in-place results (D4), which only `home.page.ts` implements. */
  protected onHeaderSearch(query: string): void {
    const q = query.trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }
}
