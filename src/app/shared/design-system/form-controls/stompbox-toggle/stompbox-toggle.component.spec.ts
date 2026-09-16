import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { StompboxToggleComponent } from './stompbox-toggle.component';

@Component({
  selector: 'joo-stompbox-toggle-host',
  imports: [StompboxToggleComponent],
  template: `<joo-stompbox-toggle [(on)]="active">Has feed</joo-stompbox-toggle>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StompboxToggleHost {
  readonly active = signal(false);
}

describe('StompboxToggleComponent', () => {
  it('latches on click and reports its state through aria-pressed', async () => {
    const fixture = TestBed.createComponent(StompboxToggleHost);
    await fixture.whenStable();

    const toggle = page.getByRole('button', { name: /has feed/i });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    await fixture.whenStable();

    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByText('ON')).toBeInTheDocument();
  });
});
