import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type LibraryLayoutState = {
  /** Scroll offset of the left file-tree panel. */
  treeScrollTop: number;
  /** PrimeNG tree filter box text (ephemeral; not URL). */
  treeFilter: string;
};

const initialState: LibraryLayoutState = {
  treeScrollTop: 0,
  treeFilter: '',
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
  })),
);
