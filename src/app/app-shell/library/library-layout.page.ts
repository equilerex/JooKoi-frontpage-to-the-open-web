import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import type { TreeNode } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { filter, map, startWith } from 'rxjs';
import { TopicTreeComponent } from '../../shared/design-system/data-display/topic-tree/topic-tree.component';
import { ConsoleInputComponent } from '../../shared/design-system/form-controls/console-input/console-input.component';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { findLibraryDoc, findLibraryFolder } from '../../shared/library-content/library-lookup';
import { LibraryLayoutStore } from './library-layout.store';
import { buildFullLibraryTree, entryDocForFolder, expandAncestors } from './library-tree';

/**
 * Library frame: breadcrumb, file tree on the left (always), right pane renders
 * the active folder or document route.
 */
@Component({
  selector: 'joo-library-layout-page',
  imports: [
    RouterOutlet,
    BreadcrumbTrailComponent,
    ReadoutPanelComponent,
    TopicTreeComponent,
    ConsoleInputComponent,
    Drawer,
  ],
  templateUrl: './library-layout.page.html',
  styleUrl: './library-layout.page.css',
})
export class LibraryLayoutPage {
  private readonly router = inject(Router);
  protected readonly layoutStore = inject(LibraryLayoutStore);
  protected readonly isMobileDrawerOpen = signal(false);

  private readonly treePanel = viewChild('treePanel', { read: ElementRef });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly libraryPath = computed(() => {
    const url = this.currentUrl().split('?')[0] ?? '';
    return url.replace(/^\/library\/?/, '');
  });

  /** Folder path to fan out fully; set by landing tiles as `?expand=`. */
  protected readonly expandFolder = computed(() => {
    const expand = this.router.parseUrl(this.currentUrl()).queryParams['expand'];
    return typeof expand === 'string' ? expand : '';
  });

  protected readonly crumbs = computed<readonly Crumb[]>(() => crumbsFor(this.libraryPath()));

  protected readonly treeNodes = computed(() => {
    const nodes = buildFullLibraryTree(this.libraryPath(), this.expandFolder());
    // Hand-toggled folders keep their state across navigations; the focused
    // document's ancestors still open.
    applyFolderOpen(nodes, this.layoutStore.folderOpen());
    expandAncestors(nodes, this.libraryPath());
    return nodes;
  });

  protected readonly selectionKeys = computed<Record<string, boolean> | null>(() => {
    const path = this.libraryPath();
    if (!path || !findLibraryDoc(path)) return null;
    return { [path]: true };
  });

  protected readonly treeFilter = computed(() => this.layoutStore.treeFilter());

  /** Restore tree scroll after navigations that rebuild the panel content. */
  private readonly restoreScroll = afterRenderEffect(() => {
    this.treeNodes();
    const top = this.layoutStore.treeScrollTop();
    const el = this.treePanel()?.nativeElement;
    untracked(() => {
      if (el && Math.abs(el.scrollTop - top) > 1) el.scrollTop = top;
    });
  });

  protected onTreeScroll(event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    this.layoutStore.setTreeScrollTop(el.scrollTop);
  }

  protected onTreeFilter(value: string): void {
    this.layoutStore.setTreeFilter(value);
  }

  protected onNodeActivate(node: TreeNode): void {
    if (typeof node.key !== 'string') return;
    this.isMobileDrawerOpen.set(false);
    const queryParams = this.expandQueryParams(node.key);
    if (node.leaf) {
      void this.router.navigate(['/library', ...node.key.split('/')], { queryParams });
      return;
    }
    const entry = entryDocForFolder(node.key);
    if (entry) {
      void this.router.navigate(['/library', ...entry.split('/')], { queryParams });
      return;
    }
    if (findLibraryFolder(node.key)) {
      void this.router.navigate(['/library', ...node.key.split('/')], { queryParams });
    }
  }

  /** Keep `?expand=` while navigating inside that folder; drop it otherwise. */
  private expandQueryParams(targetPath: string): { expand: string } | undefined {
    const expand = this.expandFolder();
    if (!expand) return undefined;
    if (targetPath === expand || targetPath.startsWith(`${expand}/`)) {
      return { expand };
    }
    return undefined;
  }
}

function crumbsFor(path: string): readonly Crumb[] {
  const home: Crumb = { label: 'Home', routerLink: '/' };
  if (!path) return [home, { label: 'Library' }];
  const crumbs: Crumb[] = [home, { label: 'Library', routerLink: '/library' }];
  const parts = path.split('/').filter((part) => part.length > 0);
  let acc = '';
  for (let i = 0; i < parts.length; i++) {
    acc = acc ? `${acc}/${parts[i]}` : (parts[i] ?? '');
    const isLast = i === parts.length - 1;
    const doc = findLibraryDoc(acc);
    const folder = findLibraryFolder(acc);
    const label = doc?.title ?? folder?.title ?? parts[i] ?? acc;
    crumbs.push(isLast ? { label } : { label, routerLink: `/library/${acc}` });
  }
  return crumbs;
}

function applyFolderOpen(
  nodes: readonly TreeNode[],
  open: Readonly<Record<string, boolean>>,
): void {
  for (const node of nodes) {
    const state = typeof node.key === 'string' ? open[node.key] : undefined;
    if (state !== undefined) node.expanded = state;
    if (node.children) applyFolderOpen(node.children, open);
  }
}
