import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A record's page: breadcrumbs, a head, the body, and an aside of supporting
 * detail. The aside drops below the body when narrow, or above it when
 * `asideFirst` is set.
 *
 * Ported from `features/design-theme/components.css` `.split` (:1433-1457). The
 * named areas replace the mockup's source-order placement so the narrow order is
 * explicit rather than a consequence of where the markup happens to sit.
 *
 * `asideFirst` reproduces `.split--aside-first` (:1452-1457), which the mockup
 * reaches with `.split--aside-first > :last-child { order: -1 }`. That mechanism
 * cannot be ported literally, for two separate reasons:
 *
 * - A `> :last-child` child combinator here would compile with this component's
 *   `_ngcontent` and match projected content, which carries the parent's — see
 *   `console-landing-template.component.css` for the measurement.
 * - `order` cannot move an item between explicitly named grid areas. `grid-area`
 *   places the item, and `order` only reorders auto-placement; measured in the
 *   browser, an `order: -1` item in `grid-area: aside` stays in its own row.
 *
 * So the modifier reassigns `grid-template-areas` instead. It is a boolean input
 * rather than a consumer-supplied class: a layout modifier is not content, and
 * making every consumer know an internal class name is the coupling decision 014
 * rejected. An unexercised variant is what a specimen exists to prevent, so
 * `record-detail-demo` sets it.
 */
@Component({
  selector: 'joo-record-detail-template',
  templateUrl: './record-detail-template.component.html',
  styleUrl: './record-detail-template.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.detail--aside-first]': 'asideFirst()' },
})
export class RecordDetailTemplateComponent {
  /** Puts the aside above the body below 1024px, for a page whose narrow order
   * leads with the short column. */
  readonly asideFirst = input(false);
}
