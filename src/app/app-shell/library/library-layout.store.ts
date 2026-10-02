import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface LibraryLayoutState {
  /** Scroll offset of the left file-tree panel. */
  treeScrollTop: number;
  /** PrimeNG tree filter box text (ephemeral; not URL). */
  treeFilter: string;
  /** Folders the user opened or closed by hand; survives tree rebuilds on navigation. */
  folderOpen: Readonly<Record<string, boolean>>;
}

const initialState: LibraryLayoutState = {
  treeScrollTop: 0,
  treeFilter: '',
  folderOpen: {},
};

/**
 * Ephemeral library chrome that must survive document drill-in (decision 031).
 * Provided on the library layout route so it lives as long as `/library` does.
 * Shareable fan-out stays in `?expand=` (URL), not here.
 */
export const LibraryLayoutStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setTreeScrollTop(treeScrollTop: number): void {
      patchState(store, { treeScrollTop });
    },
    setTreeFilter(treeFilter: string): void {
      patchState(store, { treeFilter });
    },
    setFolderOpen(key: string, open: boolean): void {
      patchState(store, { folderOpen: { ...store.folderOpen(), [key]: open } });
    },
  })),
);
