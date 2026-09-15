import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-field-label',
  template: '<label [attr.for]="for()"><ng-content /></label>',
  styleUrl: './field-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldLabelComponent {
  readonly for = input('');
}
