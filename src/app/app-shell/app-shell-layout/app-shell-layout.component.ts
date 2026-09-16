import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
 * `/search` and `/learn` are not routed yet (Tasks 5/6) — the wildcard route
 * sends them to `NotFoundPage` until then, which is an honest "not built yet"
 * rather than a dead `href="#"`. `/browse` stays `#`: it is `parked` (D2), not
 * scheduled.
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

  /**
   * Placeholder source count for the header status strip (backlog #1-3),
   * matching `home.page.ts`'s current hard-coded `highlights.length` (4).
   * Becomes accurate once Task 3/4 land the real fixture — do not read this
   * as the real catalog size.
   */
  protected readonly statusText = '4 src online';
}
