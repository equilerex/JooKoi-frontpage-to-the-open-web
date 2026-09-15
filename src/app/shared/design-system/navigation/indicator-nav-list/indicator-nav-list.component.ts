import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../../actions/hardware-key/hardware-key.component';
import {
  StatusLightColor,
  StatusLightComponent,
} from '../../indicators/status-light/status-light.component';

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly lightColor?: StatusLightColor;
}

/**
 * A vertical navigation list where every row carries a lamp.
 *
 * A navigation recipe rather than a layout: it is a composition of
 * `hardware-key` and `status-light`, and the pairing is the point. Each row is
 * one key slab with a light mark at its left edge, which is what makes a
 * category tree or a doc table of contents scannable at a glance.
 *
 * It takes data rather than projection because the rows must be uniform, and
 * because the key and the light have to be driven from ONE condition. A key
 * cannot light a projected light — a parent cannot style a child component's
 * internals without `::ng-deep`, which decision 007 bans — so the caller side
 * of that pairing lives here, where both values come from the same `NavItem`.
 *
 * The active marker is two things at once, and they are deliberately different
 * mechanisms: the key's `current` input (which the key renders as
 * `aria-current="page"` and styles as a pressed slab) and the light's `on`
 * input. Both read `item.active`.
 */
@Component({
  selector: 'joo-indicator-nav-list',
  imports: [HardwareKeyComponent, StatusLightComponent],
  templateUrl: './indicator-nav-list.component.html',
  styleUrl: './indicator-nav-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation' },
})
export class IndicatorNavListComponent {
  readonly items = input.required<readonly NavItem[]>();
}
