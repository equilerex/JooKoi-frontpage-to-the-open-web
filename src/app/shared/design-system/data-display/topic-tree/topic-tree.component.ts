import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';

/**
 * Wraps PrimeNG's `p-tree` for the `/learn` index — the fourth sanctioned
 * PrimeNG adoption after `chrome-select`, `filter-drawer` and `record-grid`
 * (decision 011). Given the same time-boxed skin check those got in Phase 2
 * task 9: the structural CSS and behaviour (expand/collapse, keyboard nav,
 * selection) are bought outright, and the visual gap left by preset tokens
 * alone (decision 011 step 1) is closed in `topic-tree.component.css` —
 * `tree.node.*` design tokens that `jookoi-preset.ts` does not already reach
 * through its broader `content`/`text`/`primary` overrides, specifically the
 * hover/selected states and the toggle-button icon. That closed the gap
 * inside the time box, so this stays PrimeNG rather than becoming a
 * hand-built tree — no deviation to log.
 *
 * `value` on `Tree` is typed `any`, so no defensive copy is needed the way
 * `record-grid` and `chrome-select` need one for their `readonly[]` inputs.
 */
@Component({
  selector: 'joo-topic-tree',
  imports: [Tree],
  templateUrl: './topic-tree.component.html',
  styleUrl: './topic-tree.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTreeComponent {
  readonly nodes = input<readonly TreeNode[]>([]);
  readonly ariaLabel = input('');
  readonly nodeActivate = output<TreeNode>();

  protected onNodeSelect(event: { node: TreeNode }): void {
    this.nodeActivate.emit(event.node);
  }
}
