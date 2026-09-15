import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { GridColumn, RecordGridComponent } from './record-grid.component';

interface DemoRow {
  readonly name: string;
  readonly kind: string;
}

@Component({
  selector: 'joo-record-grid-host',
  imports: [RecordGridComponent],
  template: `
    <joo-record-grid
      [rows]="rows"
      [columns]="columns"
      ariaLabel="Records"
      (rowActivate)="activated = $event.name"
    />
    <p>activated: {{ activated }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RecordGridHost {
  readonly rows: readonly DemoRow[] = [
    { name: 'Alpha', kind: 'Zine' },
    { name: 'Beta', kind: 'Blog' },
  ];
  readonly columns: readonly GridColumn<DemoRow>[] = [
    { field: 'name', header: 'Name' },
    { field: 'kind', header: 'Kind' },
  ];
  activated = '';
}

describe('RecordGridComponent', () => {
  it('renders the given columns and rows and emits the activated row', async () => {
    const fixture = TestBed.createComponent(RecordGridHost);
    await fixture.whenStable();

    await expect.element(page.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    await expect.element(page.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();

    await userEvent.click(page.getByRole('row', { name: /beta/i }));
    await fixture.whenStable();

    await expect.element(page.getByText('activated: Beta')).toBeInTheDocument();
  });
});
