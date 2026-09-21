import { Component, computed, input, model } from '@angular/core';
import {
  BezelJewelComponent,
  BezelJewelColor,
} from '../../indicators/bezel-jewel/bezel-jewel.component';

@Component({
  selector: 'joo-stompbox-toggle',
  imports: [BezelJewelComponent],
  templateUrl: './stompbox-toggle.component.html',
  styleUrl: './stompbox-toggle.component.css',
  host: {
    '[class.is-on]': 'on()',
    // The mockup set --toggle-color from `.toggle--<colour>` modifier classes.
    // Colour now arrives as one input, and the toggle's own chrome reads the
    // same value the jewel does, so the host carries it as a custom property
    // rather than re-introducing a class per colour.
    '[style.--toggle-color]': 'toggleColor()',
  },
})
export class StompboxToggleComponent {
  readonly on = model(false);
  readonly color = input<BezelJewelColor>('cyan');

  protected readonly toggleColor = computed(() => `var(--led-${this.color()})`);

  protected toggle(): void {
    this.on.update((current) => !current);
  }
}
