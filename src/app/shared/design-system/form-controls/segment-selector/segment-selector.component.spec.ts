import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { SegmentSelectorComponent } from './segment-selector.component';

@Component({
  selector: 'joo-segment-selector-host',
  imports: [SegmentSelectorComponent],
  template: `
    <joo-segment-selector [options]="sorts" [(value)]="sort" ariaLabel="Sort order" />
    <p>sort: {{ sort() }}</p>
  `,
})
class SegmentSelectorHost {
  readonly sorts = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
  ] as const;
  readonly sort = signal('relevance');
}

describe('SegmentSelectorComponent', () => {
  it('moves the pressed position to the clicked segment', async () => {
    const fixture = TestBed.createComponent(SegmentSelectorHost);
    await fixture.whenStable();

    await expect
      .element(page.getByRole('button', { name: 'Relevance' }))
      .toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(page.getByRole('button', { name: 'Recent' }));
    await fixture.whenStable();

    await expect.element(page.getByText('sort: recent')).toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Relevance' }))
      .toHaveAttribute('aria-pressed', 'false');
  });
});
