import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { StatusLightComponent } from '../../shared/design-system/indicators/status-light/status-light.component';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { LogotypeComponent } from '../../shared/design-system/typography/logotype/logotype.component';

/**
 * The wide-screen HUD: brand mark, wordmark and the primary navigation, stuck
 * to the top of the viewport. Ported from `features/design-theme/components.css`
 * `.hud` (:690-773).
 *
 * Not ported from that range: `.hud__search` (:740-744) and `.hud__status`
 * (:751-752). A header search field and a source-count readout are content and
 * features — Phase 3 — not chrome.
 *
 * The mockup's `.hud__inner` wrapper IS ported, because it carries the header's
 * whole layout: the flex line, the `min-height: var(--hud-height)`, the
 * `max-width: var(--content-max)` centring and the horizontal padding. Without
 * it the bar has no height and the nav's `margin-left: auto` pushes it off a
 * flex line it is not sharing.
 *
 * It reads `aria-label="Primary"` on its own `<nav>`; the `banner` role on the
 * host is what makes it a header landmark.
 */
@Component({
  selector: 'joo-heads-up-display-header',
  imports: [LogotypeComponent, HardwareKeyComponent, StatusLightComponent],
  templateUrl: './heads-up-display-header.component.html',
  styleUrl: './heads-up-display-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'banner' },
})
export class HeadsUpDisplayHeaderComponent {
  readonly navItems = input.required<readonly NavItem[]>();
}
