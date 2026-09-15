import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HardwareKeyComponent } from '../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../shared/design-system/actions/keycap/keycap.component';
import { ConsoleInputComponent } from '../shared/design-system/form-controls/console-input/console-input.component';
import { FieldLabelComponent } from '../shared/design-system/form-controls/field-label/field-label.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { StompboxToggleComponent } from '../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { BezelJewelComponent } from '../shared/design-system/indicators/bezel-jewel/bezel-jewel.component';
import { ClassificationBadgeComponent } from '../shared/design-system/indicators/classification-badge/classification-badge.component';
import { SegmentReadoutComponent } from '../shared/design-system/indicators/segment-readout/segment-readout.component';
import { StatusLightComponent } from '../shared/design-system/indicators/status-light/status-light.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { LogotypeComponent } from '../shared/design-system/typography/logotype/logotype.component';
import { StripeRuleComponent } from '../shared/design-system/typography/stripe-rule/stripe-rule.component';
import { SpecimenSectionComponent } from './specimen-section/specimen-section.component';

@Component({
  selector: 'joo-specimen-page',
  imports: [
    SpecimenSectionComponent,
    StatusLightComponent,
    BezelJewelComponent,
    SegmentReadoutComponent,
    ClassificationBadgeComponent,
    EyebrowLabelComponent,
    LogotypeComponent,
    StripeRuleComponent,
    HardwareKeyComponent,
    KeycapComponent,
    KeycapGridComponent,
    FieldLabelComponent,
    ConsoleInputComponent,
    StompboxToggleComponent,
    SegmentSelectorComponent,
  ],
  templateUrl: './specimen.page.html',
  styleUrl: './specimen.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {
  protected readonly lightColors = ['off', 'cyan', 'magenta', 'amber', 'green'] as const;
  protected readonly jewelColors = ['cyan', 'magenta', 'amber', 'green'] as const;
  protected readonly sortOptions: readonly SegmentOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
    { value: 'alpha', label: 'A–Z' },
  ];
}
