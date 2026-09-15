import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface GridColumn<T> {
  readonly field: keyof T & string;
  readonly header: string;
  readonly width?: string;
}

@Component({
  selector: 'joo-record-grid',
  imports: [TableModule],
  templateUrl: './record-grid.component.html',
  styleUrl: './record-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordGridComponent<T> {
  /**
   * Neither array is `input.required`, and the reason is not style. The two
   * `computed`s below read them, and a `computed` that reads a required input
   * before it is set throws `NG0950`. Normal rendering is unaffected — inputs
   * are applied before the template renders — but Angular's SSR error-
   * **recovery** path calls `recreate()` without re-applying inputs, so on a
   * page containing this component any recoverable render error escalates into
   * an uncaught `NG0950` and the process exits 1. This repo prerenders, so that
   * is a crashed build rather than a failed page. An empty grid is a coherent
   * default anyway; the same reasoning is written out in `chrome-select` and
   * `pager`, which were bitten by it for real.
   *
   * The copies exist because `Table.value` and `Table.columns` are both typed
   * `any[] | undefined`, so a `readonly` array is rejected outright (TS4104).
   * Calling these inputs `readonly` is the right public contract — the
   * component never mutates either one — so the copy happens here rather than
   * by weakening the interface to a mutable array and pushing the problem onto
   * every caller. `computed` memoises, so the identity PrimeNG sees changes
   * only when the data does.
   *
   * Row activation is `(click)` only. A row is not focusable and there is no
   * key handler, so the grid is not operable from the keyboard today. That is
   * a recorded gap rather than an oversight: a row that can be activated needs
   * a real destination and a focus model, and Phase 3 is where those exist.
   */
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly GridColumn<T>[]>([]);
  readonly rowHeight = input(44);
  readonly virtual = input(false);
  readonly emptyMessage = input('No records.');
  readonly ariaLabel = input('');
  readonly rowActivate = output<T>();

  protected readonly tableValue = computed(() => [...this.rows()]);
  protected readonly tableColumns = computed(() => [...this.columns()]);
}
