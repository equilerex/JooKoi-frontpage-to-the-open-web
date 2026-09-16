import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A long-form document: breadcrumbs, then a single centred measure of prose.
 *
 * No mockup page maps to this template one-to-one. Its sibling is
 * `features/design-theme/learn-topic.html`, whose breadcrumb sits in `.page` and
 * whose document paper is `.sheet` (:1496-1509) — `max-width: var(--sheet-max);
 * margin-inline: auto`. `--sheet-max` is already a token
 * (`src/styles/design-tokens.css:180`), so the body measure is the same one
 * `joo-paper-sheet` carries and the two agree instead of fighting.
 *
 * The host gets no `justify-items`. Centring belongs to the body's own
 * `margin-inline: auto`, the mockup's mechanism for a document measure
 * (`.sheet` :1498, `.pager` :1461); `justify-items: center` on the host would
 * centre the breadcrumbs along with the body.
 *
 * Two projection slots and no inputs.
 */
@Component({
  selector: 'joo-document-template',
  templateUrl: './document-template.component.html',
  styleUrl: './document-template.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentTemplateComponent {}
