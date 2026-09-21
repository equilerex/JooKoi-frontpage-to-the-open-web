import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { ConsoleInputComponent } from './console-input.component';

@Component({
  selector: 'joo-console-input-host',
  imports: [ConsoleInputComponent],
  template: `
    <joo-console-input [(value)]="query" inputId="q" placeholder="Search" />
    <p>echo: {{ query() }}</p>
  `
})
class ConsoleInputHost {
  readonly query = signal('');
}

describe('ConsoleInputComponent', () => {
  it('writes typed text back through the two-way value binding', async () => {
    const fixture = TestBed.createComponent(ConsoleInputHost);
    await fixture.whenStable();

    await userEvent.type(page.getByRole('textbox', { name: 'Search' }), 'weather');
    await fixture.whenStable();

    await expect.element(page.getByText('echo: weather')).toBeInTheDocument();
  });
});
