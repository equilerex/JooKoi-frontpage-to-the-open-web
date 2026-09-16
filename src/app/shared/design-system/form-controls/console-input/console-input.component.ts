import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export type ConsoleInputSize = 'compact' | 'md' | 'lg';

@Component({
  selector: 'joo-console-input',
  templateUrl: './console-input.component.html',
  styleUrl: './console-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-compact]': "size() === 'compact'",
    '[class.is-large]': "size() === 'lg'",
  },
})
export class ConsoleInputComponent {
  readonly size = input<ConsoleInputSize>('md');
  readonly placeholder = input('');
  readonly inputId = input('');
  readonly value = model('');
  readonly submitted = output<string>();

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onEnter(): void {
    this.submitted.emit(this.value());
  }
}
