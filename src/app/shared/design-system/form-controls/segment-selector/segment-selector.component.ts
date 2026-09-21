import { Component, input, model } from '@angular/core';

export interface SegmentOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'joo-segment-selector',
  templateUrl: './segment-selector.component.html',
  styleUrl: './segment-selector.component.css',
  host: { role: 'group', '[attr.aria-label]': 'ariaLabel() || null' },
})
export class SegmentSelectorComponent {
  readonly options = input.required<readonly SegmentOption[]>();
  readonly value = model('');
  readonly ariaLabel = input('');
}
