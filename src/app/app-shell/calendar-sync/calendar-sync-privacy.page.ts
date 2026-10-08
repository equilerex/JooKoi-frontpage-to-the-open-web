import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EyebrowLabelComponent } from '../../shared/design-system/typography/eyebrow-label/eyebrow-label.component';

/** `/calendar-sync/privacy`: privacy policy for the calendar sync service. Static copy, prerendered. */
@Component({
  selector: 'joo-calendar-sync-privacy-page',
  imports: [RouterLink, EyebrowLabelComponent],
  templateUrl: './calendar-sync-privacy.page.html',
  styleUrl: './calendar-sync-privacy.page.css',
})
export class CalendarSyncPrivacyPage {}
