import { Directive } from '@angular/core';

/**
 * HUD corner brackets. Decorative, applied _to_ a surface rather than wrapping
 * one, so it is a directive and adds no DOM node — the class lands on the
 * consumer's own box through the host binding.
 *
 * Its CSS is global. A directive has no stylesheet, so it cannot carry
 * encapsulated styles; the rules live in `src/styles.css` under
 * `@layer components`, keyed to `.joo-corner-brackets`. The mockup's
 * `.brackets` had no base rule at all (`components.css:882` reads "Decorative,
 * add to any positioned box") and relied on the consumer's box already being
 * positioned, which a directive cannot assume — so the global rule supplies
 * `position: relative` to anchor the absolutely positioned `::after`.
 * Decision 014.
 */
@Directive({
  selector: '[jooCornerBrackets]',
  host: { class: 'joo-corner-brackets' },
})
export class CornerBracketsDirective {}
