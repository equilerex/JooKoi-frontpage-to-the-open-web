import { Component } from '@angular/core';

/**
 * Long-form body copy. It styles whatever arbitrary HTML the consumer projects
 * into it, which makes it the one part whose contract is descendant rules.
 *
 * Those rules cannot live in this file: emulated encapsulation compiles
 * `:host h2` to `[_nghost-c] h2[_ngcontent-c]`, and a projected `h2` carries the
 * *parent* template's `_ngcontent`, so the rule matches nothing. They are in
 * `src/styles.css` under `@layer components` instead — decision 014.
 */
@Component({
  selector: 'joo-prose-content',
  template: '<ng-content />',
  styleUrl: './prose-content.component.css',
})
export class ProseContentComponent {}
