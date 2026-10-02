import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { RecordGridCellDirective } from './record-grid-cell.directive';

export interface GridColumn<T> {
  readonly field: keyof T & string;
  readonly header: string;
  readonly width?: string;
  readonly sortable?: boolean;
}

/** Row enter/leave duration. Keep in sync with the keyframes in `record-grid.component.css`. */
const ROW_MOTION_MS = 220;
/** At most this many rows animate in or out per change. A bigger swap just swaps. */
const ROW_MOTION_CAP = 30;

type RowState = 'enter' | 'leave';

/**
 * With `animateRows`, rows that appear grow from zero height and rows that
 * disappear collapse to zero. Rows are matched between updates by `rowKey`
 * (object identity when it is unset). A removed row stays in the table value
 * for one animation, flagged `leave`, then is dropped, so the virtual scroller
 * still sees one plain list. Under reduced motion the table swaps instantly.
 */
@Component({
  selector: 'joo-record-grid',
  imports: [TableModule, NgTemplateOutlet],
  templateUrl: './record-grid.component.html',
  styleUrl: './record-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordGridComponent<T> {
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly GridColumn<T>[]>([]);
  readonly rowHeight = input(44);
  readonly virtual = input(false);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly emptyMessage = input('No records.');
  readonly ariaLabel = input('');
  readonly sortable = input(false);
  readonly sortField = input<string | undefined>(undefined);
  readonly sortOrder = input<number>(1);
  readonly rowActivate = output<T>();
  readonly sortChange = output<{ field: string; order: number }>();

  private readonly cellTemplates = contentChildren(RecordGridCellDirective);
  protected readonly cellTemplateByField = computed(() => {
    const byField = new Map<string, RecordGridCellDirective['templateRef']>();
    for (const template of this.cellTemplates()) {
      byField.set(template.field(), template.templateRef);
    }
    return byField;
  });

  /** PrimeNG sizes the scroller to its content by default (autoSize), which measures layout after every
   *  change and collapses the box when the table empties. A fixed `scrollHeight` replaces that. */
  protected readonly virtualScrollOptions = { autoSize: false };

  readonly animateRows = input(false);
  /** Field that identifies a row across updates. Unset: the row object itself. */
  readonly rowKey = input<(keyof T & string) | undefined>(undefined);

  /** Starts as, and resets to, the plain rows so first render and SSR need no effect. */
  private readonly displayed = linkedSignal<readonly T[]>(() => this.rows());
  private readonly motion = signal<ReadonlyMap<unknown, RowState>>(new Map());
  private previousRows: readonly T[] | null = null;
  private motionTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly tableValue = computed(() => [...this.displayed()]);
  protected readonly tableColumns = computed(() => [...this.columns()]);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearMotionTimer());
    effect(() => {
      const next = this.rows();
      const animate = this.animateRows();
      untracked(() => this.reconcile(next, animate));
    });
  }

  protected rowState(row: T): RowState | undefined {
    return this.motion().get(this.keyOf(row));
  }

  private keyOf(row: T): unknown {
    const field = this.rowKey();
    return field ? row[field] : row;
  }

  private reconcile(next: readonly T[], animate: boolean): void {
    const previous = this.previousRows;
    this.previousRows = next;
    this.clearMotionTimer();

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || previous === null || reduceMotion) {
      this.displayed.set(next);
      this.motion.set(new Map());
      return;
    }

    const previousKeys = new Set(previous.map((row) => this.keyOf(row)));
    const nextKeys = new Set(next.map((row) => this.keyOf(row)));
    const entering = next
      .filter((row) => !previousKeys.has(this.keyOf(row)))
      .slice(0, ROW_MOTION_CAP);
    const leaving: { row: T; index: number }[] = [];
    previous.forEach((row, index) => {
      if (!nextKeys.has(this.keyOf(row)) && leaving.length < ROW_MOTION_CAP) {
        leaving.push({ row, index });
      }
    });
    if (!entering.length && !leaving.length) {
      this.displayed.set(next);
      this.motion.set(new Map());
      return;
    }

    const merged = [...next];
    for (const { row, index } of leaving) {
      merged.splice(Math.min(index, merged.length), 0, row);
    }
    const states = new Map<unknown, RowState>();
    for (const row of entering) states.set(this.keyOf(row), 'enter');
    for (const { row } of leaving) states.set(this.keyOf(row), 'leave');
    this.displayed.set(merged);
    this.motion.set(states);

    this.motionTimer = setTimeout(() => {
      this.motionTimer = null;
      this.displayed.set(next);
      this.motion.set(new Map());
    }, ROW_MOTION_MS);
  }

  private clearMotionTimer(): void {
    if (this.motionTimer) {
      clearTimeout(this.motionTimer);
      this.motionTimer = null;
    }
  }
}
