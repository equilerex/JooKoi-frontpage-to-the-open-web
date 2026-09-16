import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SegmentReadoutColor = 'cyan' | 'magenta' | 'amber';

@Component({
  selector: 'joo-segment-readout',
  template: '<ng-content />',
  styleUrl: './segment-readout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
  },
})
export class SegmentReadoutComponent {
  readonly color = input<SegmentReadoutColor>('cyan');
}
