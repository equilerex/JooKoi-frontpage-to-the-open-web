import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Minimal placeholder for `/search` (plan's "Search — `/search?q=`" section,
 * Task 5). Task 4 needed *a* real route here — the home launcher console,
 * the header's compact console and the F1-F6 quick keys all submit or link
 * to `/search?…` — so this exists to catch that navigation instead of the
 * wildcard 404. It echoes the query params it was given back as plain text
 * and does nothing else: no filter rack, no sort, no results panel. Task 5
 * replaces this file's contents wholesale rather than building on it.
 *
 * Reads `route.snapshot` rather than the reactive `queryParamMap` stream —
 * fine for a page whose whole job is to render once and be thrown away, but
 * it means a second `/search?…` navigation while already on this page (e.g.
 * clicking another quick key from here) won't update the echoed params
 * without a full reload. Not worth fixing on a placeholder Task 5 deletes.
 */
@Component({
  selector: 'joo-search-page',
  imports: [RouterLink],
  templateUrl: './search.page.html',
  styleUrl: './search.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParamMap = this.route.snapshot.queryParamMap;

  protected readonly q = this.queryParamMap.get('q');
  protected readonly category = this.queryParamMap.get('category');
  protected readonly tag = this.queryParamMap.get('tag');
}
