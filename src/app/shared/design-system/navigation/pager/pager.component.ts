import { Component, computed, input, output } from '@angular/core';
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
  host: { role: 'navigation', 'aria-label': 'Pagination' },
})
export class PagerComponent {
  /**
   * Not `input.required`, and the reason is not style. `hasPrevious` and
   * `hasNext` below read both of these from a `computed`, and a `computed` that
   * reads a required input before it is set throws `NG0950`. Normal rendering is
   * unaffected — inputs are applied before the template renders — but Angular's
   * SSR error-**recovery** path calls `recreate()` without re-applying inputs,
   * so on a page containing this component any recoverable render error
   * escalates into an uncaught `NG0950` and the process exits 1. This repo
   * prerenders, so that is a crashed build rather than a failed page. Page 1 of
   * 1 is a coherent default for a pager.
   */
  readonly page = input(1);
  readonly pageCount = input(1);
  readonly pageChange = output<number>();

  protected readonly hasPrevious = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.pageCount());

  protected go(delta: number): void {
    this.pageChange.emit(this.page() + delta);
  }
}
