import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HardwareKeyComponent } from '../hardware-key/hardware-key.component';

/**
 * A legend key: small function line, label, optional trailing count.
 *
 * Composition, not a variant — the slab is `joo-hardware-key`, and the keycap
 * only supplies the projected content and its layout. It never restyles the
 * key. An `href` makes it an anchor, otherwise it is a button.
 */
@Component({
  selector: 'joo-keycap',
  imports: [HardwareKeyComponent],
  templateUrl: './keycap.component.html',
  styleUrl: './keycap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeycapComponent {
  readonly fn = input('');
  readonly label = input.required<string>();
  readonly count = input<number | null>(null);
  readonly href = input('');
}
