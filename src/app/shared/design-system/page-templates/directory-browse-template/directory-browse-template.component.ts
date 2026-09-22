import { Component } from '@angular/core';

/**
 * Browse and search: a toolbar across the top, a filter rack beside the
 * results, the results filling the rest. Below 1024px the rack sits above them.
 *
 * Ported from `features/design-theme/components.css` `.with-rack` (:1312-1334).
 * The named areas are the one structural addition — the toolbar row is a real
 * slot the mockup's two-column grid does not have, and naming every area is what
 * lets the narrow order be stated rather than inherited from source order.
 *
 * A media query, not a container query: a page template *is* the page, so the
 * viewport is the right thing to measure. `joo-toolbar-row` uses a container
 * query because a toolbar can appear inside a column; this cannot.
 *
 * Three projection slots and no inputs; what differs between two pages using
 * this template is arbitrary content.
 */
@Component({
  selector: 'joo-directory-browse-template',
  templateUrl: './directory-browse-template.component.html',
  styleUrl: './directory-browse-template.component.css',
})
export class DirectoryBrowseTemplateComponent {}
