import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
 * `/search` (Task 5 — `search.page.ts`) is the real filter/sort/results
 * page, so the header console, the home launcher console and the quick keys
 * all land somewhere real. `/learn` is still not routed (Task 6) — the
 * wildcard route sends it to `NotFoundPage`, an honest "not built yet"
 * rather than a dead `href="#"`. `/browse` stays `#`: it is `parked` (D2),
 * not scheduled.
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

  protected readonly headerNavItems: readonly NavItem[] = [
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Learn', href: '/learn' },
  ];

  protected readonly dockNavItems: readonly NavItem[] = [
    { label: 'Home', href: '/', active: true },
    { label: 'Search', href: '/search' },
    { label: 'Browse', href: '#' },
    { label: 'Learn', href: '/learn' },
  ];

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
