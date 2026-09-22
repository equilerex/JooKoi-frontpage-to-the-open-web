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
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly GridColumn<T>[]>([]);
  readonly rowHeight = input(44);
  readonly virtual = input(false);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly emptyMessage = input('No records.');
  readonly ariaLabel = input('');
  readonly rowActivate = output<T>();

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
