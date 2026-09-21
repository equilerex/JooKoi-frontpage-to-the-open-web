import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';

export type HardwareKeySize = 'xs' | 'sm' | 'md' | 'lg';
export type HardwareKeyAccent = 'neutral' | 'hot' | 'cyan';

/**
 * The pressable slab. One component in five placements — button, nav link,
 * latching toggle, pager card, dock item — never four separate components.
 *
 * It is the one design-system component that owns a real inner element rather
 * than styling its own host. `<button>` and `<a>` are different semantics and
 * have to be real DOM elements, and an Angular component's host tag name
 * cannot change, so the host is `display: contents` and the inner `.key`
 * becomes the direct child of whatever grid or flex container holds the key.
 *
 * The latched light seen in the mockups is NOT styled from here — see the
 * file header of `hardware-key.component.css` for why, and what to do instead.
 *
 * Two template constraints, both learned the hard way:
 *
 * - `as` is a keyword to the template expression parser, so the input is only
 *   readable as `this.as()` inside this component's own template. Consumers
 *   bind it normally (`[as]="'anchor'"`).
 * - The template holds exactly ONE `<ng-content>` placeholder, and it is not
 *   inside the `@if`. Angular compiles every placeholder at build time whether
 *   or not its branch renders, so a catch-all placeholder in each branch does
 *   not split content between them — one of the two wins and the other element
 *   renders empty. The single placeholder lives in an `<ng-template>` that the
 *   live branch instantiates.
 */
@Component({
  selector: 'joo-hardware-key',
  imports: [NgTemplateOutlet],
  templateUrl: './hardware-key.component.html',
  styleUrl: './hardware-key.component.css',
  host: {
    '[class.is-xs]': "size() === 'xs'",
    '[class.is-sm]': "size() === 'sm'",
    '[class.is-lg]': "size() === 'lg'",
    '[class.is-hot]': "accent() === 'hot'",
    '[class.is-cyan]': "accent() === 'cyan'",
    '[class.is-block]': 'block()',
  },
})
export class HardwareKeyComponent {
  readonly size = input<HardwareKeySize>('md');
  readonly accent = input<HardwareKeyAccent>('neutral');
  readonly block = input(false);
  /** null means "not a latching control" — no aria-pressed attribute at all. */
  readonly pressed = input<boolean | null>(null);
  readonly current = input(false);
  readonly as = input<'button' | 'anchor'>('button');
  readonly href = input('');
  /** Passed through to the anchor's `target` when `as="anchor"`. Defaults to
   * normal same-tab navigation so every existing consumer is unaffected. */
  readonly target = input<string | null>(null);
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly press = output<void>();
}
