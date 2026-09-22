import { Component } from '@angular/core';
import { HardwareKeyComponent } from '../../shared/design-system/actions/hardware-key/hardware-key.component';
import { KeycapGridComponent } from '../../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { KeycapComponent } from '../../shared/design-system/actions/keycap/keycap.component';
import { ConsoleInputComponent } from '../../shared/design-system/form-controls/console-input/console-input.component';
import { FieldLabelComponent } from '../../shared/design-system/form-controls/field-label/field-label.component';
import {
  SegmentOption,
  SegmentSelectorComponent,
} from '../../shared/design-system/form-controls/segment-selector/segment-selector.component';
import { ToolbarRowComponent } from '../../shared/design-system/page-layouts/toolbar-row/toolbar-row.component';
import { ConsoleLandingTemplateComponent } from '../../shared/design-system/page-templates/console-landing-template/console-landing-template.component';
import { CornerBracketsDirective } from '../../shared/design-system/surfaces/corner-brackets/corner-brackets.directive';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { EyebrowLabelComponent } from '../../shared/design-system/typography/eyebrow-label/eyebrow-label.component';
import { LogotypeComponent } from '../../shared/design-system/typography/logotype/logotype.component';

/**
 * The whole-page demo for `joo-console-landing-template`. The template is a grid,
 * so the frame around it comes from here: the mockup's launcher *is*
 * `section.panel.brackets.launcher` (`index.html:43`), and `joo-readout-panel`
 * with an empty label plus `jooCornerBrackets` is that frame. `flush` drops the
 * panel body's own `--space-4`, leaving the template's ported `--space-8` as the
 * only inset — the mockup had one.
 *
 * The lead column is filled the way `index.html:43-82` fills it: an eyebrow, the
 * wordmark and a large console in `[templateHero]` and `[templateConsole]`, and
 * a field label above the key grid in `[templateKeys]`. The mockup's `p.lede`
 * has no counterpart — `.lede` is not in the component map, and
 * `joo-prose-content`, which `shared/design-system/CONTEXT.md` points `.lede` at
 * for prose, sets the sheet ink (`--sheet-text: #111827`) which measures ~1.1:1
 * against this panel's `--surface-panel: #110f1e`.
 */
@Component({
  selector: 'joo-console-landing-demo-page',
  imports: [
    ConsoleLandingTemplateComponent,
    ReadoutPanelComponent,
    CornerBracketsDirective,
    EyebrowLabelComponent,
    LogotypeComponent,
    ConsoleInputComponent,
    HardwareKeyComponent,
    ToolbarRowComponent,
    FieldLabelComponent,
    SegmentSelectorComponent,
    KeycapGridComponent,
    KeycapComponent,
  ],
  templateUrl: './console-landing-demo.page.html',
})
export class ConsoleLandingDemoPage {
  protected readonly scopeOptions: readonly SegmentOption[] = [
    { value: 'trusted', label: 'Trusted' },
    { value: 'all', label: 'All' },
    { value: 'discovered', label: 'Discovered' },
  ];
}
