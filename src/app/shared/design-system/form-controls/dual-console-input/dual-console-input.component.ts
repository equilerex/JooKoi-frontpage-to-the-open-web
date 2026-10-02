import { Component, input, model, output } from '@angular/core';

/**
 * One console frame with two input zones side by side: a left "filter" zone
 * and a right "query" zone, divided by a thin rule. The frame looks like
 * `joo-console-input` (size lg); each zone has its own small label. Content
 * projected into the component (an action key) sits at the right edge of the
 * right zone. Stacks vertically below 768px.
 */
@Component({
  selector: 'joo-dual-console-input',
  templateUrl: './dual-console-input.component.html',
  styleUrl: './dual-console-input.component.css',
})
export class DualConsoleInputComponent {
  readonly leftLabel = input.required<string>();
  readonly leftPlaceholder = input('');
  readonly leftId = input('');
  readonly leftValue = model('');

  readonly rightLabel = input.required<string>();
  readonly rightPlaceholder = input('');
  readonly rightId = input('');
  readonly rightValue = model('');

  readonly rightSubmitted = output<string>();
  readonly rightBlurred = output<string>();

  protected onLeftInput(event: Event): void {
    this.leftValue.set((event.target as HTMLInputElement).value);
  }

  protected onRightInput(event: Event): void {
    this.rightValue.set((event.target as HTMLInputElement).value);
  }
}
