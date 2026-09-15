import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Chrome dropdown. PrimeNG's `Select`, skinned entirely by the preset.
 *
 * Adoption test (decision 011): **step 1 — preset tokens alone reach the
 * design.** Every visible part of `select.root.*` resolves through
 * `{form.field.*}`, and `jookoi-preset.ts` already points that block at the
 * mockup's own tokens, so background, border, text, radius, padding, the
 * overlay panel and the option hover/selected states all arrive without a rule
 * written here. Steps 2 and 3 were not needed.
 *
 * Two things PrimeNG does not tokenise are set in the stylesheet, and are the
 * whole of it: the control's width (PrimeNG's `.p-select` is an inline-flex
 * box with no width token) and the chevron colour (one `--png-*` variable,
 * because Aura has no `form.field.icon.color` we want). The mockup's caret
 * gradients are deliberately not ported — they exist only because the mockup's
 * `.select` is a native element with `appearance: none`.
 *
 * `appendTo="body"` puts the panel in the overlay layer that the `zIndex`
 * tiers in `app.config.ts` govern, so it draws above the HUD and clear of the
 * page's stacking and clipping contexts generally.
 */
@Component({
  selector: 'joo-chrome-select',
  imports: [Select, FormsModule],
  templateUrl: './chrome-select.component.html',
  styleUrl: './chrome-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChromeSelectComponent {
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = model<string | null>(null);
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly inputId = input('');

  /**
   * `Select.options` is typed `any[] | null | undefined`, so the readonly
   * array the caller hands us is rejected outright (TS4104). Calling the input
   * `readonly` is the right public contract — this component never mutates it —
   * so the copy happens here rather than by weakening the interface. Computed
   * memoises it, so the identity PrimeNG sees changes only when the options do.
   */
  protected readonly selectOptions = computed(() => [...this.options()]);
}
