import { Component, computed, input, model } from '@angular/core';
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
})
export class ChromeSelectComponent {
  /**
   * Deliberately **not** `input.required`. `selectOptions` below reads it, and a
   * `computed` that reads a required input before it is set throws `NG0950`.
   * Normal rendering is unaffected — inputs are applied before the template
   * renders — but Angular's SSR error-**recovery** path calls `recreate()`
   * without re-applying inputs, so on a page containing this component any
   * recoverable render error escalates from a reported error into a thrown
   * `NG0950` with nothing catching it, and the process exits 1. This repo
   * prerenders, so that is a crashed build rather than a failed page. An empty
   * option list is a legitimate state anyway; the default costs nothing.
   */
  readonly options = input<readonly SelectOption[]>([]);
  readonly value = model<string | null>(null);
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly inputId = input('');
  /**
   * Pass-through to `p-select`'s own `[filter]` — a searchable/typeahead
   * text box inside the overlay panel. Default `false` so every existing
   * `joo-chrome-select` consumer is unaffected; `/search`'s Type/Region/
   * Language selects opt in (fix wave 5).
   */
  readonly filter = input(false);

  /**
   * `Select.options` is typed `any[] | null | undefined`, so the readonly
   * array the caller hands us is rejected outright (TS4104). Calling the input
   * `readonly` is the right public contract — this component never mutates it —
   * so the copy happens here rather than by weakening the interface. Computed
   * memoises it, so the identity PrimeNG sees changes only when the options do.
   */
  protected readonly selectOptions = computed(() => [...this.options()]);
}
