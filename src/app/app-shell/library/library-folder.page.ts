import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycapComponent } from '../../shared/design-system/actions/keycap/keycap.component';
import { KeycapGridComponent } from '../../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import {
  LIBRARY_DOCS,
  LibraryFolderMeta,
} from '../../shared/library-content/library-index.generated';
import { findLibraryFolder } from '../../shared/library-content/library-lookup';
import { entryDocForFolder } from './library-tree';

/**
 * Right-hand pane for `/library` (collection tiles) and folder URLs
 * (intro + inert filters). File tree lives on the layout, on the left.
 */
@Component({
  selector: 'joo-library-folder-page',
  imports: [KeycapGridComponent, KeycapComponent, ProseContentComponent],
  templateUrl: './library-folder.page.html',
  styleUrl: './library-folder.page.css',
})
export class LibraryFolderPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });

  protected readonly path = computed(() => (this.routeData()['libraryPath'] as string) ?? '');
  protected readonly folder = computed<LibraryFolderMeta | undefined>(() =>
    findLibraryFolder(this.path()),
  );
  protected readonly isRoot = computed(() => this.path() === '');

  protected readonly collections = computed(() => findLibraryFolder('')?.collections ?? []);

  protected readonly filterChips = computed<readonly string[]>(() => {
    const folder = this.folder();
    if (!folder || this.isRoot()) return [];
    const tags = new Set<string>();
    const prefix = `${folder.path}/`;
    for (const doc of LIBRARY_DOCS) {
      if (!doc.path.startsWith(prefix) && doc.path !== folder.path) continue;
      for (const tag of doc.tags) tags.add(tag);
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  });

  /** In-app navigation so the layout store (filter/scroll) survives drill-in. */
  protected openCollection(collectionPath: string): void {
    const entry = entryDocForFolder(collectionPath);
    const commands = entry
      ? ['/library', ...entry.split('/')]
      : ['/library', ...collectionPath.split('/')];
    void this.router.navigate(commands, {
      queryParams: { expand: collectionPath },
    });
  }
}
