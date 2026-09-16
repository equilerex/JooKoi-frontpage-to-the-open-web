import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BezelJewelColor = 'cyan' | 'magenta' | 'amber' | 'green';

@Component({
  selector: 'joo-bezel-jewel',
  template: '',
  styleUrl: './bezel-jewel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
    '[class.is-green]': "color() === 'green'",
    '[class.is-lit]': 'on()',
  },
})
export class BezelJewelComponent {
  readonly color = input<BezelJewelColor>('cyan');
  readonly on = input(false);
}
