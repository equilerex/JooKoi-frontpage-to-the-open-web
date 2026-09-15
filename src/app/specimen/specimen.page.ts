import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

@Component({
  selector: 'joo-specimen-page',
  imports: [SpecimenSectionComponent],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {}
