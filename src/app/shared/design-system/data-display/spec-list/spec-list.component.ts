import { Component, input } from '@angular/core';

export interface SpecEntry {
  readonly term: string;
  readonly value: string;
}

/**
 * A term/value table of source metadata.
 *
 * It takes data rather than projection because the two columns must align
 * across rows, which projected markup cannot guarantee.
 */
@Component({
  selector: 'joo-spec-list',
  templateUrl: './spec-list.component.html',
  styleUrl: './spec-list.component.css',
})
export class SpecListComponent {
  readonly entries = input.required<readonly SpecEntry[]>();
}
