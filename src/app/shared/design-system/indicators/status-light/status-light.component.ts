import { Component, computed, input } from '@angular/core';

export type StatusLightColor = 'off' | 'cyan' | 'magenta' | 'amber' | 'green';

@Component({
  selector: 'joo-status-light',
  template: '',
  styleUrl: './status-light.component.css',
  host: {
    role: 'img',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[class.is-cyan]': "color() === 'cyan'",
    '[class.is-magenta]': "color() === 'magenta'",
    '[class.is-amber]': "color() === 'amber'",
    '[class.is-green]': "color() === 'green'",
    '[class.is-lit]': 'lit()',
    '[class.is-blinking]': 'blink()',
  },
})
export class StatusLightComponent {
  readonly color = input<StatusLightColor>('off');
  readonly on = input(false);
  readonly blink = input(false);
  readonly label = input('');

  /** A coloured light is lit unless it is explicitly the `off` colour. */
  protected readonly lit = computed(() => this.on() && this.color() !== 'off');
}
