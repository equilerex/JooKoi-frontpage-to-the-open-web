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
    this._followed.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Selection still works for this visit.
    }
  }
}
