import { Component } from '@angular/core';
import { KeycapComponent } from '../../shared/design-system/actions/keycap/keycap.component';

/** `/tools`: index of local utilities. Each tool is its own lazy route. */
@Component({
  selector: 'joo-tools-page',
  imports: [KeycapComponent],
  templateUrl: './tools.page.html',
  styleUrl: './tools.page.css',
})
export class ToolsPage {}
