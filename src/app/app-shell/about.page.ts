import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../shared/design-system/typography/eyebrow-label/eyebrow-label.component';

/** `/about`: why the site exists and what it is not. Static copy, prerendered. */
@Component({
  selector: 'joo-about-page',
  imports: [RouterLink, ReadoutPanelComponent, EyebrowLabelComponent],
  templateUrl: './about.page.html',
  styleUrl: './about.page.css',
})
export class AboutPage {}
