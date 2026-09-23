import { Component, computed, input } from '@angular/core';
import { Params } from '@angular/router';
import { HardwareKeyAccent, HardwareKeyComponent } from '../hardware-key/hardware-key.component';

/**
 * A legend key: small function line, label, optional trailing count.
 *
 * Composition, not a variant — the slab is `joo-hardware-key`, and the keycap
 * only supplies the projected content and its layout. It never restyles the
 * key. An `href` makes it an anchor, otherwise it is a button.
 *
 * `accent` passes straight through to the underlying key, so a keycap can
 * carry the same `key--hot` / `key--cyan` treatment a bare hardware key can —
 * the mock's `F6` AI-marketplace key needs the hot accent (backlog #8).
 */
@Component({
  selector: 'joo-keycap',
  imports: [HardwareKeyComponent],
  templateUrl: './keycap.component.html',
  styleUrl: './keycap.component.css',
})
export class KeycapComponent {
  readonly fn = input('');
  readonly label = input.required<string>();
  readonly count = input<number | null>(null);
  readonly href = input('');
  readonly routerLink = input<string | readonly unknown[] | null | undefined>(null);
  readonly queryParams = input<Params | null | undefined>(null);
  readonly accent = input<HardwareKeyAccent>('neutral');
  readonly target = input<string | null>(null);

  protected readonly resolvedTarget = computed(() => {
    const explicit = this.target();
    if (explicit) return explicit;
    return this.href().startsWith('http') ? '_blank' : null;
  });
}
