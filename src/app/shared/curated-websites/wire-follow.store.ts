import { afterNextRender, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'jookoi.wire.followed';

/**
 * Source ids the visitor added to their Wire (toggled from the RSS pill on
 * `/search`, read by the home page Wire panel). Empty means "show every
 * source". Persisted in `localStorage`, loaded after first render so the
 * prerendered HTML and hydration agree.
 */
@Injectable({ providedIn: 'root' })
export class WireFollowStore {
  private readonly _followed = signal<ReadonlySet<string>>(new Set());
  readonly followed = this._followed.asReadonly();

  constructor() {
    afterNextRender(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this._followed.set(new Set(JSON.parse(raw) as string[]));
      } catch {
        // Storage blocked or corrupt: start with an empty selection.
      }
    });
  }

  toggle(id: string): void {
    const next = new Set(this._followed());
    if (!next.delete(id)) next.add(id);
    this.commit(next);
  }

  /** Drop one source from the Wire. While the selection is empty ("show
   *  every source") there is nothing to delete from, so the selection is
   *  seeded with `allIds` minus this one. */
  unfollow(id: string, allIds: Iterable<string>): void {
    const current = this._followed();
    const next = current.size ? new Set(current) : new Set(allIds);
    next.delete(id);
    this.commit(next);
  }

  /** Back to "show every source". */
  clear(): void {
    this.commit(new Set());
  }

  private commit(next: ReadonlySet<string>): void {
    this._followed.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Selection still works for this visit.
    }
  }
}
