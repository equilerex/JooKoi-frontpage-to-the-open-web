import { Component } from '@angular/core';

/**
 * The wrapping row that holds capability tags and count chips.
 *
 * The mockup repeated this flex row inline at every use site (`.sigs`, `.chips`
 * and the bare style attributes between them). Extracting it is the point, so
 * tags and chips share one rhythm wherever they appear.
 */
@Component({
  selector: 'joo-tag-set',
  template: '<ng-content />',
  styleUrl: './tag-set.component.css'
})
export class TagSetComponent {}
