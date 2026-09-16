import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joo-stripe-rule',
  template: '',
  styleUrl: './stripe-rule.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
})
export class StripeRuleComponent {}
