import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'joo-specimen-section',
  templateUrl: './specimen-section.component.html',
  styleUrl: './specimen-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenSectionComponent {
  readonly label = input.required<string>();
}
