import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HardwareKeyComponent } from '../../actions/hardware-key/hardware-key.component';

/**
 * Step the caller through a result set one page at a time.
 *
 * It reports the page it wants, and owns nothing: the current page is an input
 * and the next one leaves through `pageChange`, so the caller stays the single
 * source of truth and a pager never contradicts the view it is paging.
 *
 * The keys disable themselves at the ends rather than clamping the emitted
 * value, so the control says why it will not move instead of doing nothing
 * silently. `page` is one-based; the boundaries are `page > 1` and
 * `page < pageCount`.
 */
@Component({
  selector: 'joo-pager',
  imports: [HardwareKeyComponent],
  templateUrl: './pager.component.html',
  styleUrl: './pager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Pagination' },
})
export class PagerComponent {
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly hasPrevious = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.pageCount());

  protected go(delta: number): void {
    this.pageChange.emit(this.page() + delta);
  }
}
