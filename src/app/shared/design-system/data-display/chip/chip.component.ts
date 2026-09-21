import { Component, input } from '@angular/core';

/**
 * A flat pill with an optional inline dim count — the mock's `.chip`
 * (backlog #18): "css 22", "accessibility 9". Distinct from both
 * `joo-capability-tag` (a bordered mono signal badge, not a pill) and
 * `joo-count-chip` (a boxed, raised chip meant for a toolbar count) — the app
 * currently wraps `joo-hardware-key` and `joo-count-chip` together for tag
 * chips, which reads raised and uppercase, wraps to two rows and is the wrong
 * object entirely. This component is the real one; applying it to the real
 * tag panel is Task 2.
 */
@Component({
  selector: 'joo-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.css',
  host: {
    // Same convention as `joo-stompbox-toggle`'s `[class.is-on]` — a boolean
    // input toggling a host state class, not a variant baked into a new
    // selector. Fix wave 5: the search page's Category chips need a
    // selected look, and this is the minimal extension the brief called for
    // rather than a second component.
    '[class.chip--active]': 'active()',
  },
})
export class ChipComponent {
  readonly count = input<number | null>(null);
  readonly active = input(false);
}
