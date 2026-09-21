import type { TreeNode } from 'primeng/api';
import { findLibraryDoc, findLibraryFolder } from '../../shared/library-content/library-lookup';

/** Build a PrimeNG tree node for a library folder path. */
export function folderToNode(path: string, expanded = false): TreeNode {
  const folder = findLibraryFolder(path);
  if (!folder) return { key: path, label: path, leaf: true };

  // Default sort: stray files A–Z on top, then subfolders A–Z (recursive).
  const docs = [...folder.docs]
    .map((docPath) => ({
      key: docPath,
      label: findLibraryDoc(docPath)?.title ?? docPath,
      leaf: true as const,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

  const childFolders = [...folder.childFolders]
    .sort((a, b) =>
      folderLabel(a).localeCompare(folderLabel(b), undefined, { sensitivity: 'base' }),
    )
    .map((child) => folderToNode(child, false));

  return {
    key: folder.path,
    label: folder.title,
    expanded,
    children: [...docs, ...childFolders],
  };
}

/**
 * Full library tree. Top-level branches other than the focused / expand
 * collection stay collapsed. `expandFolder` (from `?expand=`) fans out that
 * folder and every descendant folder; otherwise only ancestors of
 * `focusPath` open.
 */
export function buildFullLibraryTree(focusPath = '', expandFolder = ''): TreeNode[] {
  const root = findLibraryFolder('');
  const tops = [...(root?.childFolders ?? [])].sort((a, b) =>
    folderLabel(a).localeCompare(folderLabel(b), undefined, { sensitivity: 'base' }),
  );
  const focusTop = focusPath.split('/')[0] ?? '';
  const expandTop = expandFolder.split('/')[0] ?? '';

  return tops.map((path) => {
    const openTop = path === focusTop || path === expandTop;
    const node = folderToNode(path, openTop);

    if (expandFolder && path === expandTop) {
      expandAncestors([node], expandFolder);
      const branch = expandFolder === path ? node : findNodeByKey([node], expandFolder);
      if (branch) expandDescendants(branch);
    } else if (focusPath && path === focusTop) {
      expandAncestors([node], focusPath);
    }

    return node;
  });
}

/**
 * Prefer `README.md` (decision 030), then legacy `topic-index`, then any
 * `*index*` doc, then the first ordered doc here or in a child folder.
 * Used when opening a collection tile or folder row.
 */
export function entryDocForFolder(folderPath: string): string | null {
  const folder = findLibraryFolder(folderPath);
  if (!folder) return null;

  const readme = folder.docs.find((docPath) => {
    const slug = docPath.split('/').pop() ?? '';
    return slug.toLowerCase() === 'readme';
  });
  if (readme) return readme;

  const topicIndex = folder.docs.find((docPath) => {
    const slug = docPath.split('/').pop() ?? '';
    return slug === 'topic-index';
  });
  if (topicIndex) return topicIndex;

  const indexish = folder.docs.find((docPath) => {
    const slug = docPath.split('/').pop() ?? '';
    return slug === 'index' || slug.endsWith('-index') || slug.includes('index');
  });
  if (indexish) return indexish;

  const ordered = folder.docs
    .map((docPath) => findLibraryDoc(docPath))
    .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined)
    .sort((a, b) => a.order - b.order || a.path.localeCompare(b.path));
  if (ordered[0]) return ordered[0].path;

  for (const child of folder.childFolders) {
    const nested = entryDocForFolder(child);
    if (nested) return nested;
  }
  return null;
}

export function expandAncestors(nodes: readonly TreeNode[], target: string): void {
  if (!target) return;
  const keys = new Set(ancestorKeys(nodes, target));
  const walk = (list: readonly TreeNode[]): void => {
    for (const node of list) {
      if (typeof node.key === 'string' && keys.has(node.key)) node.expanded = true;
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
}

/** Open this folder and every nested folder under it. */
export function expandDescendants(node: TreeNode): void {
  if (node.leaf) return;
  node.expanded = true;
  for (const child of node.children ?? []) {
    expandDescendants(child);
  }
}

function folderLabel(path: string): string {
  return findLibraryFolder(path)?.title ?? path;
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

function ancestorKeys(nodes: readonly TreeNode[], target: string): readonly string[] {
  const trail: string[] = [];
  const walk = (list: readonly TreeNode[], parents: readonly string[]): boolean => {
    for (const node of list) {
      if (node.key === target) {
        trail.push(...parents);
        return true;
      }
      if (node.children && walk(node.children, [...parents, String(node.key ?? '')])) {
        return true;
      }
    }
    return false;
  };
  walk(nodes, []);
  return trail;
}
