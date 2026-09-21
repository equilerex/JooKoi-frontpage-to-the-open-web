import { Component } from '@angular/core';

/**
 * Names a capability a source has — "RSS", "no tracking". The domain layer
 * decides the text; the tag only supplies the shape.
 */
@Component({
  selector: 'joo-capability-tag',
  template: '<ng-content />',
  styleUrl: './capability-tag.component.css'
})
export class CapabilityTagComponent {}
