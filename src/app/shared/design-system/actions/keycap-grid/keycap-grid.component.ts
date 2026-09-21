import { Component } from '@angular/core';

/**
 * The recessed panel that keycaps sit in. A grid of auto-filling cells, sized
 * so the keys read as a row of physical caps rather than a list of links.
 */
@Component({
  selector: 'joo-keycap-grid',
  template: '<ng-content />',
  styleUrl: './keycap-grid.component.css'
})
export class KeycapGridComponent {}
