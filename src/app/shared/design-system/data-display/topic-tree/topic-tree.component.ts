import {
  afterRenderEffect,
  Component,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';

type TreeFilterApi = Tree & {
  _filter?: (value: string) => void;
  resetFilter?: () => void;
};

/**
 * Wraps PrimeNG's `p-tree` — the fourth sanctioned PrimeNG adoption after
 * `chrome-select`, `filter-drawer` and `record-grid` (decision 011).
 *
 * Built-in `[filter]` hides non-matching nodes and expands ancestors of
 * matches (lenient mode). Filter copies are what the tree renders, so
 * folder-row expand toggles must use `getRootNode()`, not the raw input.
 *
 * `filterText` is controlled by the library layout store (decision 031) so
 * the query survives document drill-in. Applied via PrimeNG's filter API;
 * the visible filter field lives on the library layout.
 */
@Component({
  selector: 'joo-topic-tree',
  imports: [Tree],
  templateUrl: './topic-tree.component.html',
  styleUrl: './topic-tree.component.css',
  host: {
    '(click)': 'onHostClick($event)',
  },
})
export class TopicTreeComponent {
  readonly nodes = input<readonly TreeNode[]>([]);
  readonly ariaLabel = input('');
  readonly selectionKeys = input<{ [key: string]: boolean } | null>(null);
  /** Applied via PrimeNG filter API; UI lives on the library layout (store). */
  readonly filterText = input('');
  readonly nodeActivate = output<TreeNode>();

  private readonly tree = viewChild(Tree);

  /** Re-apply layout-store filter after node rebuilds. */
  private readonly syncFilter = afterRenderEffect(() => {
    const query = this.filterText();
    this.nodes();
    const tree = this.tree();
    untracked(() => applyTreeFilter(tree, query));
  });

  protected onHostClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.p-tree-node-toggle-button')) return;
    if (target.closest('.p-tree-filter, .p-tree-filter-input, .p-iconfield')) return;
    const treeitem = target.closest('[role="treeitem"]');
    const key = treeitem?.getAttribute('data-id');
    if (!key) return;
    const roots = this.tree()?.getRootNode() ?? this.nodes();
    const node = findNodeByKey(roots, key);
    if (node && !node.leaf) {
      node.expanded = !node.expanded;
    }
  }

  protected onNodeSelect(event: { node: TreeNode }): void {
    if (event.node.leaf) {
      this.nodeActivate.emit(event.node);
    }
  }
}

function applyTreeFilter(tree: Tree | undefined, query: string): void {
  if (!tree) return;
  const api = tree as TreeFilterApi;
  if (query) {
    api._filter?.(query);
  } else {
    api.resetFilter?.();
  }
}

function findNodeByKey(nodes: readonly TreeNode[], key: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}
