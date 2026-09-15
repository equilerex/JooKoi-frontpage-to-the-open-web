import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Rack-unit panel: chrome head strip with a label, flat readout body. Content
 * in the body never gets texture or glow.
 *
 * The head renders only when `label` is set, so a panel used purely as a frame
 * loses the strip rather than shipping an empty chrome bar.
 *
 * The strip's trailing item is whatever the consumer marks `panelHead`. It is
 * projected, so no rule in this component's stylesheet can reach it — the
 * label carries `margin-right: auto` instead to push it right. See the
 * component stylesheet for the full note.
 */
@Component({
  selector: 'joo-readout-panel',
  templateUrl: './readout-panel.component.html',
  styleUrl: './readout-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-flush]': 'flush()' },
})
export class ReadoutPanelComponent {
  readonly label = input('');
  /** Drops the body padding, for a table or grid that should fill the frame. */
  readonly flush = input(false);
}
