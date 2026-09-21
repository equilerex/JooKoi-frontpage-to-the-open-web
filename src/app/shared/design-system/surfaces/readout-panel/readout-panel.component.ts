import { Component, input } from '@angular/core';
import {
  StatusLightColor,
  StatusLightComponent,
} from '../../indicators/status-light/status-light.component';

/**
 * Rack-unit panel: chrome head strip with a label, flat readout body. Content
 * in the body never gets texture or glow.
 *
 * The head renders only when it has something to show — the label, the LED or
 * a projected `panelHead` — so a panel used purely as a frame loses the strip
 * rather than shipping an empty chrome bar.
 *
 * The strip's trailing item is whatever the consumer marks `panelHead`. It is
 * projected, so no rule in this component's stylesheet can reach it — the
 * label carries `margin-right: auto` instead to push it right. See the
 * component stylesheet for the full note.
 *
 * `led` puts a `joo-status-light` before the label, lit in the given colour —
 * mock `index.html:106,198`: the highlights panel carries a cyan LED beside
 * its title, the tag panel a magenta one. `null` (the default) omits it
 * rather than rendering an off/unlit light nobody asked for.
 */
@Component({
  selector: 'joo-readout-panel',
  imports: [StatusLightComponent],
  templateUrl: './readout-panel.component.html',
  styleUrl: './readout-panel.component.css',
  host: { '[class.is-flush]': 'flush()' },
})
export class ReadoutPanelComponent {
  readonly label = input('');
  readonly led = input<StatusLightColor | null>(null);
  /** Drops the body padding, for a table or grid that should fill the frame. */
  readonly flush = input(false);
}
