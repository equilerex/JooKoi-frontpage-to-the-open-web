import { Component, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
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
 * #1-3): a compact search console (mock's `hud__search console
 * console--compact`) and the `412 SRC ONLINE` status strip. The plan's
 * original Search-page notes had the console appear on inner pages only, not
 * home; a mid-build user override (plan's "Implementation deviations",
 * 2026-09-16) put it on every page instead, home included — Task 4 is the
 * one that passes `[console]="true"` unconditionally from
 * `app-shell-layout.component.html`. This component itself doesn't know or
 * care which pages show it: real nav items, a real source count and real
 * query-submit navigation are wired by the app shell (Task 2/4), and
 * `/specimen` demonstrates the component itself with fixture data. Staying
 * agnostic (decision 011/012's design-system rule): the query lives in a
 * local `model()`, submission is a plain `output()`, and the source count is
 * a plain string input — nothing here reaches into Router or a store.
 */
@Component({
  selector: 'joo-heads-up-display-header',
  imports: [
    LogotypeComponent,
    HardwareKeyComponent,
    StatusLightComponent,
    ConsoleInputComponent,
    RouterLink,
  ],
  templateUrl: './heads-up-display-header.component.html',
  styleUrl: './heads-up-display-header.component.css',
  host: { role: 'banner' },
})
export class HeadsUpDisplayHeaderComponent {
  readonly navItems = input.required<readonly NavItem[]>();
  /** Shows the compact search console. Off by default; the app shell passes
   *  `true` on every page, home included (deviation, 2026-09-16). */
  readonly console = input(false);
  readonly searchQuery = model('');
  readonly searchSubmitted = output<string>();

  /** Submit handler for both the Enter key (`joo-console-input`'s
   *  `submitted`) and the `Go` key (`press`) — fix wave 4: this console is
   *  a one-shot shortcut into `/search?q=…`, not a field that mirrors `q`
   *  once there, so it clears its own value right after emitting rather
   *  than continuing to display what was typed. */
  protected onSearchSubmit(): void {
    this.searchSubmitted.emit(this.searchQuery());
    this.searchQuery.set('');
  }
  /** Empty (the default) omits the status strip entirely, same reasoning as
   *  `readout-panel`'s `led`: an unlit status readout with no count behind it
   *  yet is not a state worth shipping unasked. */
  readonly statusText = input('');
}
