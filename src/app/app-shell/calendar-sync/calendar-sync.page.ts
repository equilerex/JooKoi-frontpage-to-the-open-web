import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../../shared/design-system/typography/eyebrow-label/eyebrow-label.component';

/** `/calendar-sync`: what the personal calendar sync service is. Static copy, prerendered. */
@Component({
  selector: 'joo-calendar-sync-page',
  imports: [RouterLink, ReadoutPanelComponent, EyebrowLabelComponent],
  templateUrl: './calendar-sync.page.html',
  styleUrl: './calendar-sync.page.css',
})
export class CalendarSyncPage {}
