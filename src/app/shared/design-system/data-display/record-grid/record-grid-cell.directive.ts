import { Directive, TemplateRef, inject, input } from '@angular/core';

/** Template context `record-grid` hands a cell template: the row twice, once
 *  as `$implicit` for `let row` shorthand and once named for clarity at the
 *  call site. */
export interface RecordGridCellContext<T> {
  $implicit: T;
  readonly row: T;
}

/**
 * Marks an `<ng-template>` as the cell renderer for one column, keyed by
 * `GridColumn.field`. `record-grid` reads all instances projected into it and
 * swaps a column's plain `{{ row[col.field] }}` text for the template when
 * one is registered — see `record-grid.component.ts` for the lookup.
 *
 * ```html
 * <joo-record-grid [rows]="rows" [columns]="columns">
 *   <ng-template jooRecordGridCell="trust" let-row>
 *     <joo-classification-badge>{{ row.trust }}</joo-classification-badge>
 *   </ng-template>
 * </joo-record-grid>
 * ```
 */
@Directive({
  selector: 'ng-template[jooRecordGridCell]',
})
export class RecordGridCellDirective<T = unknown> {
  readonly templateRef = inject<TemplateRef<RecordGridCellContext<T>>>(TemplateRef);

  readonly field = input.required<string>({ alias: 'jooRecordGridCell' });

  /**
   * Type-only inference anchor. Angular's template type checker infers a
   * generic directive's type parameters from its bound inputs the same way
   * TypeScript infers a generic function call's — so binding the same array
   * passed to `[rows]` here (`[rows]="recordRows"`, not just `jooRecordGridCell`
   * on its own) is what types `let-row` as the real row rather than
   * `unknown`. Purely a type anchor: the value is never read.
   */
  readonly rows = input<readonly T[]>([]);

  /** Types `let-row` at the call site — same mechanism `NgIf`/`NgFor` use
   *  for their own `let` bindings. */
  static ngTemplateContextGuard<T>(
    _dir: RecordGridCellDirective<T>,
    ctx: unknown,
  ): ctx is RecordGridCellContext<T> {
    void ctx;
    return true;
  }
}
