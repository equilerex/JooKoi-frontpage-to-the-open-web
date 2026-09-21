import { Component, computed, input } from '@angular/core';
import { KeycapComponent } from '../../shared/design-system/actions/keycap/keycap.component';
import { KeycapGridComponent } from '../../shared/design-system/actions/keycap-grid/keycap-grid.component';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import { findLibraryFolder } from '../../shared/library-content/library-lookup';

/**
 * Presentational browse surface shown under the document reader layer.
 * Not routed — parent path only. Keeps underlay logic out of LibraryFolderPage.
 */
@Component({
  selector: 'joo-library-browse-underlay',
  imports: [KeycapGridComponent, KeycapComponent, ProseContentComponent],
  templateUrl: './library-browse-underlay.component.html',
  styleUrl: './library-browse-underlay.component.css',
})
export class LibraryBrowseUnderlayComponent {
  /** Folder path whose browse UI peeks under the reader (usually the doc parent). */
  readonly folderPath = input('');

  protected readonly folder = computed(() => findLibraryFolder(this.folderPath()));
  protected readonly isRoot = computed(() => this.folderPath() === '');
  protected readonly collections = computed(() => findLibraryFolder('')?.collections ?? []);
}
