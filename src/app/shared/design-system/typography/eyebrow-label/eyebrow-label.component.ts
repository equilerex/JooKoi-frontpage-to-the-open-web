import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-eyebrow-label',
  template: '<ng-content />',
  styleUrl: './eyebrow-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EyebrowLabelComponent {}
