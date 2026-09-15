import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The horizon: a perspective grid floor and a radial glow, fixed behind every
 * page. Ported from `features/design-theme/components.css:57-89`, where the
 * mockup painted it on `body::before` / `body::after`.
 *
 * It is two stacked pseudo-elements rather than one box because the two layers
 * are not the same box: the grid is bottom-anchored (`bottom: -10vh; height:
 * 55vh`) and transformed (`perspective(420px) rotateX(62deg)`), while the glow
 * is a plain top-anchored wash. Neither can be the host's own box, and the host
 * has to stay `inset: 0` so the pseudo-elements can carry their own geometry.
 *
 * Source order is the layering, exactly as in the mockup: equal `z-index`, both
 * in the host's stacking context (a positioned element with a non-auto
 * `z-index` opens one, so nothing inside can escape behind it), so the grid
 * painted as `::before` lands under the glow painted as `::after`.
 *
 * Desktop only, as in the mockup. Two fixed full-viewport layers carrying a
 * `mask-image`, a `perspective()` transform and a 6s infinite animation are not
 * something to run on a phone. The media query is correct here because this is
 * chrome — the container-query rule binds design-system components, not the
 * shell.
 *
 * `aria-hidden` on the host: it is decoration with no text, and it must not add
 * a node to the accessibility tree.
 */
@Component({
  selector: 'joo-horizon-backdrop',
  template: '',
  styleUrl: './horizon-backdrop.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class HorizonBackdropComponent {}
