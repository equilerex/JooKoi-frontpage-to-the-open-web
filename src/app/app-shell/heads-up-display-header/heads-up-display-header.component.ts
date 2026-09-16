import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { ConsoleInputComponent } from '../../shared/design-system/form-controls/console-input/console-input.component';
import { StatusLightComponent } from '../../shared/design-system/indicators/status-light/status-light.component';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';
import { LogotypeComponent } from '../../shared/design-system/typography/logotype/logotype.component';

/**
 * The wide-screen HUD: brand mark, wordmark, the primary navigation, an
 * inner-page search console and a status strip, stuck to the top of the
 * viewport. Ported from `features/design-theme/components.css` `.hud`
 * (:690-773).
 *
 * The mockup's `.hud__inner` wrapper IS ported, because it carries the header's
 * whole layout: the flex line, the `min-height: var(--hud-height)`, the
 * `max-width: var(--content-max)` centring and the horizontal padding. Without
 * it the bar has no height and the nav's `margin-left: auto` pushes it off a
 * flex line it is not sharing.
 *
 * It reads `aria-label="Primary"` on its own `<nav>`; the `banner` role on the
 * host is what makes it a header landmark.
 *
 * `console` and `statusText` are new capabilities (Phase 3 task 1, backlog
 * #1-3): a compact search console for inner pages (mock's
 * `hud__search console console--compact`, absent on home per decision D4/the
 * plan's Search page notes) and the `412 SRC ONLINE` status strip. Wiring
 * real nav items, a real source count and real query state into this shell
 * is Task 2/5 — this component only has to be *capable* of showing them,
 * which `/specimen` demonstrates with fixture data. Staying agnostic
 * (decision 011/012's design-system rule): the query lives in a local
 * `model()`, submission is a plain `output()`, and the source count is a
 * plain string input — nothing here reaches into Router or a store.
 */
@Component({
  selector: 'joo-heads-up-display-header',
  imports: [LogotypeComponent, HardwareKeyComponent, StatusLightComponent, ConsoleInputComponent],
  templateUrl: './heads-up-display-header.component.html',
  styleUrl: './heads-up-display-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'banner' },
})
export class HeadsUpDisplayHeaderComponent {
  readonly navItems = input.required<readonly NavItem[]>();
  /** Shows the compact search console. Off by default (home has no header
   *  search — the console landing page owns the query there instead). */
  readonly console = input(false);
  readonly searchQuery = model('');
  readonly searchSubmitted = output<string>();
  /** Empty (the default) omits the status strip entirely, same reasoning as
   *  `readout-panel`'s `led`: an unlit status readout with no count behind it
   *  yet is not a state worth shipping unasked. */
  readonly statusText = input('');
}
