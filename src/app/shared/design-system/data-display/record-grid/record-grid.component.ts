import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { RecordGridCellDirective } from './record-grid-cell.directive';

export interface GridColumn<T> {
  readonly field: keyof T & string;
  readonly header: string;
  readonly width?: string;
}

@Component({
  selector: 'joo-record-grid',
  imports: [TableModule, NgTemplateOutlet],
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

  /**
   * Cell-template API (Phase 3 task 1, backlog #11-14): a consumer projects
   * `<ng-template jooRecordGridCell="field">` for any column that needs more
   * than `{{ row[col.field] }}` — the trust chip, the signal pills, the `OPEN`
   * key. Columns with no matching template keep the plain-text fallback, so
   * this is additive and every existing consumer keeps working unchanged.
   *
   * Chosen over a hand-written `.data-table` (the brief's other option)
   * because the CSS this table needs is already ported and keyed to
   * `.joo-record-grid`/`data-col` (`src/styles.css:242-360`), not to a
   * `.data-table` class — bypassing the grid would either duplicate that CSS
   * under a new selector or leave it unused. A template API reuses it as-is.
   *
   * A consumer that wants `let-row` typed as the real row rather than
   * `unknown` also binds `[rows]` on the `<ng-template>` itself — see
   * `RecordGridCellDirective`'s own doc comment for why.
   */
  private readonly cellTemplates = contentChildren(RecordGridCellDirective);
  protected readonly cellTemplateByField = computed(() => {
    const byField = new Map<string, RecordGridCellDirective['templateRef']>();
    for (const template of this.cellTemplates()) {
      byField.set(template.field(), template.templateRef);
    }
    return byField;
  });

  protected readonly tableValue = computed(() => [...this.rows()]);
  protected readonly tableColumns = computed(() => [...this.columns()]);
}
