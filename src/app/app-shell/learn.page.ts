import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { TreeNode } from 'primeng/api';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { TopicTreeComponent } from '../shared/design-system/data-display/topic-tree/topic-tree.component';
import { ReadoutPanelComponent } from '../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { LEARN_TREE, LearnTreeGroup } from '../shared/learn-content/learn-content.generated';

const CRUMBS: readonly Crumb[] = [{ label: 'Home', href: '/' }, { label: 'Learn' }];

/** `LearnTreeGroup`'s arrays are `readonly` (plain generated data, no
 *  Angular/PrimeNG dependency in the script that emits it — see that
 *  file's header comment); `Tree`'s `value` wants `TreeNode[]`, and a
 *  readonly array is never assignable to its mutable counterpart. This
 *  rebuilds real `TreeNode` objects rather than casting past the mismatch. */
function toTreeNodes(groups: readonly LearnTreeGroup[]): TreeNode[] {
  return groups.map((group) => ({
    key: group.key,
    label: group.label,
    children: group.children.map((child) => ({
      key: child.key,
      label: child.label,
      leaf: child.leaf,
    })),
  }));
}

/**
 * `/learn` — the index (brief's task 6, plan's "Learn" section). Tree
 * structure comes from `topic-index.md` via the generated `LEARN_TREE`
 * (see `scripts/build-learn-content.mjs`'s `parseTopicIndexTree`), rendered
 * with `joo-topic-tree` (Task 1's `p-tree` wrapper) — its first real usage
 * outside `/specimen`.
 *
 * No mockup maps to this page one-to-one (`features/design-theme/` has
 * `learn-topic.html` but no learn index), so this stays a plain composition:
 * breadcrumb, then the tree in a `joo-readout-panel` frame, matching the
 * chrome every other panel on the site already uses.
 */
@Component({
  selector: 'joo-learn-page',
  imports: [BreadcrumbTrailComponent, TopicTreeComponent, ReadoutPanelComponent],
  templateUrl: './learn.page.html',
  styleUrl: './learn.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnPage {
  private readonly router = inject(Router);

  protected readonly crumbs = CRUMBS;
  protected readonly treeNodes: readonly TreeNode[] = toTreeNodes(LEARN_TREE);

  /** Only leaves navigate — a group node's `key` (`group-0`, …) is not a
   *  route, and `p-tree` already handles expand/collapse for it on its own. */
  protected onNodeActivate(node: TreeNode): void {
    if (node.leaf && node.key) {
      void this.router.navigate(['/learn', node.key]);
    }
  }
}
