import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A labelled count in the readout surface's chip shape.
 *
 * `interactive` only changes the hover affordance — a chip that is actually
 * clickable wraps a `joo-hardware-key`, and this input exists so a chip sitting
 * inside one reads as pressable too.
 */
@Component({
  selector: 'joo-count-chip',
  templateUrl: './count-chip.component.html',
  styleUrl: './count-chip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-interactive]': 'interactive()' },
})
export class CountChipComponent {
  readonly count = input<number | null>(null);
  readonly interactive = input(false);
}
