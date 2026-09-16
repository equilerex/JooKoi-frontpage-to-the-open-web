import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * One toolbar row: a leading cluster of controls at the left, a trailing cluster
 * pushed to the far edge.
 *
 * Default content lands in `.toolbar__lead`; anything marked `toolbarTrailing`
 * lands in `.toolbar__trail`, which takes `margin-left: auto` and so absorbs the
 * free space between the two clusters. That mechanism — rather than
 * `justify-content: space-between` on the host — is what groups several leading
 * controls together and pushes only the trailing cluster across.
 *
 * The row reflows on its OWN width, not the viewport's: `container-type:
 * inline-size` on the host makes it the container the `@container` query in
 * `toolbar-row.component.css` measures, so a toolbar inside a narrow column
 * stacks even in a wide window. That containment also makes the host's intrinsic
 * width zero, so it needs a definite inline size — the stylesheet's `width: 100%`
 * is the default that supplies one.
 */
@Component({
  selector: 'joo-toolbar-row',
  templateUrl: './toolbar-row.component.html',
  styleUrl: './toolbar-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarRowComponent {}
