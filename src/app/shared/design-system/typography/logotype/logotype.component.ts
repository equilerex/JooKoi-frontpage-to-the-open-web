import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-logotype',
  template: '<ng-content />',
  styleUrl: './logotype.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-small]': "size() === 'sm'" },
})
export class LogotypeComponent {
  readonly size = input<'md' | 'sm'>('md');
}
