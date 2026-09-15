import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CountChipComponent } from '../../shared/design-system/data-display/count-chip/count-chip.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { StompboxToggleComponent } from '../../shared/design-system/form-controls/stompbox-toggle/stompbox-toggle.component';
import { ToolbarRowComponent } from '../../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { DirectoryBrowseTemplateComponent } from '../../shared/design-system/page-templates/directory-browse-template/directory-browse-template.component';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';

/**
 * The whole-page demo for `joo-directory-browse-template`. The toolbar row is a
 * real slot the mockup's `.with-rack` does not have, so it is a `grid-area` item
 * here — which is what gives `joo-toolbar-row` the definite inline size its
 * `container-type: inline-size` needs.
 */
@Component({
  selector: 'joo-directory-browse-demo-page',
  imports: [
    DirectoryBrowseTemplateComponent,
    ToolbarRowComponent,
    ReadoutPanelComponent,
    SegmentSelectorComponent,
    StompboxToggleComponent,
    CountChipComponent,
  ],
  templateUrl: './directory-browse-demo.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryBrowseDemoPage {
  protected readonly sortOptions: readonly SegmentOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
  ];
}
