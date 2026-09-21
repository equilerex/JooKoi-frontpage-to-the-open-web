import { Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { NavItem } from '../../shared/design-system/navigation/indicator-nav-list/indicator-nav-list.component';

/**
 * Thumb-reach navigation fixed to the bottom of the viewport below 768px, where
 * the HUD's nav is hidden. Ported from `features/design-theme/components.css`
 * `.dock` (:776-826).
 *
 * The mockup renders its items as bare `.dock__item` anchors with a hand-drawn
 * LED bar. This uses `joo-hardware-key` instead, for the same reason
 * `indicator-nav-list` does: decision 012 makes the key one component in five
 * placements and nav link is one of them, so the dock matches the HUD's own nav
 * and the nav list rather than being a fourth look. The consequence is recorded
 * in `_architecture/BACKLOG.md`: the dock loses the mockup's per-item LED bar
 * and its mobile "you are here" accent. `current` still renders
 * `aria-current="page"` and the key's pressed slab, so the current page is still
 * signalled — just with the key's treatment rather than the mockup's.
 *
 * The mockup's `grid-template-columns: repeat(4, 1fr)` becomes
 * `grid-auto-flow: column; grid-auto-columns: 1fr` because `navItems` is data,
 * not four hard-coded anchors: fixed columns would render a one-item list in a
 * quarter-width cell with three empty columns beside it.
 */
@Component({
  selector: 'joo-mobile-bottom-dock',
  imports: [HardwareKeyComponent],
  templateUrl: './mobile-bottom-dock.component.html',
  styleUrl: './mobile-bottom-dock.component.css'
})
export class MobileBottomDockComponent {
  readonly navItems = input.required<readonly NavItem[]>();
}
