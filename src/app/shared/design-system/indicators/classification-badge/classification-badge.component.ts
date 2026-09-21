import { Component, input } from '@angular/core';

/** Border treatment, not colour. The shape is what carries the meaning. */
export type ClassificationVariant = 'solid' | 'dashed' | 'double';

@Component({
  selector: 'joo-classification-badge',
  template: '<ng-content />',
  styleUrl: './classification-badge.component.css',
  host: {
    '[class.is-dashed]': "variant() === 'dashed'",
    '[class.is-double]': "variant() === 'double'",
  },
})
export class ClassificationBadgeComponent {
  readonly variant = input<ClassificationVariant>('solid');
}
