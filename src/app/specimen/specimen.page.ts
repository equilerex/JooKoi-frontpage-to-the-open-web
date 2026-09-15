import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BezelJewelComponent } from '../shared/design-system/indicators/bezel-jewel/bezel-jewel.component';
import { ClassificationBadgeComponent } from '../shared/design-system/indicators/classification-badge/classification-badge.component';
import { SegmentReadoutComponent } from '../shared/design-system/indicators/segment-readout/segment-readout.component';
import { StatusLightComponent } from '../shared/design-system/indicators/status-light/status-light.component';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

@Component({
  selector: 'joo-specimen-page',
  imports: [
    SpecimenSectionComponent,
    StatusLightComponent,
    BezelJewelComponent,
    SegmentReadoutComponent,
    ClassificationBadgeComponent,
  ],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {
  protected readonly lightColors = ['off', 'cyan', 'magenta', 'amber', 'green'] as const;
  protected readonly jewelColors = ['cyan', 'magenta', 'amber', 'green'] as const;
}
