import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import type { TreeNode } from 'primeng/api';
import { filter, map, startWith } from 'rxjs';
import { TopicTreeComponent } from '../../shared/design-system/data-display/topic-tree/topic-tree.component';
import { ConsoleInputComponent } from '../../shared/design-system/form-controls/console-input/console-input.component';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { ReadoutPanelComponent } from '../../shared/design-system/surfaces/readout-panel/readout-panel.component';
import { findLibraryDoc, findLibraryFolder } from '../../shared/library-content/library-lookup';
import { LibraryBrowseUnderlayComponent } from './library-browse-underlay.component';
import { LibraryLayoutStore } from './library-layout.store';
import { buildFullLibraryTree, entryDocForFolder } from './library-tree';

/**
 * Library frame: breadcrumb, file tree on the left (always), right pane is either
 * browse (folder/landing) or a layered reader over a browse underlay (ADR 031).
 */
@Component({
  selector: 'joo-library-layout-page',
  imports: [
    RouterOutlet,
    BreadcrumbTrailComponent,
    ReadoutPanelComponent,
    TopicTreeComponent,
    ConsoleInputComponent,
    LibraryBrowseUnderlayComponent,
  ],
  templateUrl: './library-layout.page.html',
  styleUrl: './library-layout.page.css',
})
export class LibraryLayoutPage {
  private readonly router = inject(Router);
  private readonly layoutStore = inject(LibraryLayoutStore);

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

  protected readonly isReading = computed(() => !!findLibraryDoc(this.libraryPath()));

  /** Parent folder shown under the reader layer. */
  protected readonly browseUnderlayPath = computed(() => {
    const path = this.libraryPath();
    if (!findLibraryDoc(path)) return '';
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return parts.join('/');
  });

  protected readonly crumbs = computed<readonly Crumb[]>(() => crumbsFor(this.libraryPath()));

  protected readonly treeNodes = computed(() =>
    buildFullLibraryTree(this.libraryPath(), this.expandFolder()),
  );

  protected readonly selectionKeys = computed<{ [key: string]: boolean } | null>(() => {
    const path = this.libraryPath();
    if (!path || !findLibraryDoc(path)) return null;
    return { [path]: true };
  });

  protected readonly treeFilter = computed(() => this.layoutStore.treeFilter());

  /** Restore tree scroll after navigations that rebuild the panel content. */
  private readonly restoreScroll = afterRenderEffect(() => {
    this.treeNodes();
    this.isReading();
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
  const home: Crumb = { label: 'Home', href: '/' };
  if (!path) return [home, { label: 'Library' }];
  const crumbs: Crumb[] = [home, { label: 'Library', href: '/library' }];
  const parts = path.split('/').filter((part) => part.length > 0);
  let acc = '';
  for (let i = 0; i < parts.length; i++) {
    acc = acc ? `${acc}/${parts[i]}` : (parts[i] ?? '');
    const isLast = i === parts.length - 1;
    const doc = findLibraryDoc(acc);
    const folder = findLibraryFolder(acc);
    const label = doc?.title ?? folder?.title ?? parts[i] ?? acc;
    crumbs.push(isLast ? { label } : { label, href: `/library/${acc}` });
  }
  return crumbs;
}
