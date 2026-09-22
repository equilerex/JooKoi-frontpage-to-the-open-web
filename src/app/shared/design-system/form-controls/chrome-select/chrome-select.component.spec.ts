import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { page, userEvent } from 'vitest/browser';
import { jookoiPreset } from '../../theme/jookoi-preset';
import { ChromeSelectComponent } from './chrome-select.component';

@Component({
  selector: 'joo-chrome-select-host',
  imports: [ChromeSelectComponent],
  template: `
    <joo-chrome-select
      [options]="sorts"
      [(value)]="sort"
      inputId="sort"
      ariaLabel="Sort order"
      placeholder="Sort by"
    />
    <p>sort: {{ sort() }}</p>
  `,
})
class ChromeSelectHost {
  readonly sorts = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Recent' },
  ] as const;
  readonly sort = signal<string | null>(null);
}

describe('ChromeSelectComponent', () => {
  // PrimeNG resolves its theme and zIndex tiers from this provider, so the
  // wrapper needs the same one the app installs — the preset included, or the
  // test would exercise a different theme from the one that ships. No
  // `license`, which is why PrimeNG logs its unlicensed-instance warning
  // during this suite.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [providePrimeNG({ theme: { preset: jookoiPreset, options: { prefix: 'png' } } })],
    });
  });

  it('renders the options and writes the picked one back through the two-way value binding', async () => {
    const fixture = TestBed.createComponent(ChromeSelectHost);
    await fixture.whenStable();

    await userEvent.click(page.getByRole('combobox', { name: 'Sort order' }));
    await userEvent.click(page.getByRole('option', { name: 'Recent' }));
    await fixture.whenStable();

    await expect.element(page.getByText('sort: recent')).toBeInTheDocument();
  });

  it('selects with the keyboard, through PrimeNG’s own overlay', async () => {
    const fixture = TestBed.createComponent(ChromeSelectHost);
    await fixture.whenStable();

    await userEvent.click(page.getByRole('combobox', { name: 'Sort order' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await fixture.whenStable();

    await expect.element(page.getByText('sort: relevance')).toBeInTheDocument();
  });
});
