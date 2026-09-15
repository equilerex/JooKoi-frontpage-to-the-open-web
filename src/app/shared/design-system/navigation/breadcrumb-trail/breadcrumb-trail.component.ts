import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Crumb {
  readonly label: string;
  readonly href?: string;
}

/**
 * The trail back up the hierarchy.
 *
 * It takes data rather than projection because a crumb carries no per-item
 * freedom: a label and an optional target, and the last one is where you are.
 * The separator is decided once, by the component, not per caller.
 *
 * The separator is a real `<span>` rather than the mockup's generated content
 * (`components.css:1090-1094`), so it can carry `aria-hidden` and stay out of
 * the accessibility tree. A crumb without an `href`, or the last crumb, renders
 * as plain text instead of a link.
 */
@Component({
  selector: 'joo-breadcrumb-trail',
  templateUrl: './breadcrumb-trail.component.html',
  styleUrl: './breadcrumb-trail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Breadcrumb' },
})
export class BreadcrumbTrailComponent {
  readonly crumbs = input.required<readonly Crumb[]>();
}
