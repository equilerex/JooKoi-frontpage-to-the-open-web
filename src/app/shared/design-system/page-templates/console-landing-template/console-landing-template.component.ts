import { Component } from '@angular/core';

/**
 * The front page's outermost grid: the identity block and the search console in
 * a lead column, the quick keys beside them.
 *
 * Ported from `features/design-theme/components.css` `.launcher` (:1396-1431).
 * In the mockup the launcher *is* the panel (`section.panel.brackets.launcher`,
 * `index.html:43`); here it is only the grid, and the demo supplies the frame
 * with `joo-readout-panel` plus the `jooCornerBrackets` directive. A template is
 * the outermost grid a page *is*, not a surface — decisions 012 and 013.
 *
 * Three projection slots and no inputs. What differs between two pages using
 * this template is arbitrary content, and a content input would force every page
 * through one data shape.
 *
 * `.launcher__lead` holds the hero and the console in one column. It reproduces
 * the mockup's `.stack` (:104-112) as grid `gap` rather than the mockup's
 * `> * + *` child combinator; the stylesheet explains why the combinator cannot
 * be ported.
 */
@Component({
  selector: 'joo-console-landing-template',
  templateUrl: './console-landing-template.component.html',
  styleUrl: './console-landing-template.component.css',
})
export class ConsoleLandingTemplateComponent {}
