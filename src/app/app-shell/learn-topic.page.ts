import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BreadcrumbTrailComponent,
  Crumb,
} from '../shared/design-system/navigation/breadcrumb-trail/breadcrumb-trail.component';
import { PaperSheetComponent } from '../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { ProseContentComponent } from '../shared/design-system/data-display/prose-content/prose-content.component';
import { PagerComponent } from '../shared/design-system/navigation/pager/pager.component';
import { DocumentTemplateComponent } from '../shared/design-system/page-templates/document-template/document-template.component';
import { LEARN_TOPICS } from '../shared/learn-content/learn-content.generated';

/**
 * `/learn/:topic` — one article (brief's task 6). Mockup
 * (`features/design-theme/learn-topic.html`) is breadcrumb -> `.sheet.prose`
 * -> pager, and all three design-system parts already exist
 * (`joo-breadcrumb-trail`, `joo-paper-sheet` + `joo-prose-content`,
 * `joo-pager`), plus `joo-document-template` for the breadcrumb/body slots
 * and the shared reading measure — so this page is composition, matching
 * the brief's "mostly composition, not new component work."
 *
 * `[innerHTML]` on the rendered article is safe here: the HTML comes from
 * `marked` running at *build* time over the vendored markdown
 * (`scripts/build-learn-content.mjs`), baked into the generated module as a
 * plain string — not user input, and not fetched at runtime.
 *
 * Order is the generated module's own `order` (`LEARN_TOPICS` is already
 * sorted by it), so `previous`/`next` and the pager's position both read
 * off one list and can't disagree with each other.
 */
@Component({
  selector: 'joo-learn-topic-page',
  imports: [
    DocumentTemplateComponent,
    BreadcrumbTrailComponent,
    PaperSheetComponent,
    ProseContentComponent,
    PagerComponent,
  ],
  templateUrl: './learn-topic.page.html',
  styleUrl: './learn-topic.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnTopicPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly slug = computed(() => this.paramMap().get('topic') ?? '');
  private readonly index = computed(() => LEARN_TOPICS.findIndex((t) => t.slug === this.slug()));
  protected readonly topic = computed(() => LEARN_TOPICS[this.index()]);

  protected readonly crumbs = computed<readonly Crumb[]>(() => [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: this.topic()?.title ?? 'Not found' },
  ]);

  /** One-based, matching `joo-pager`'s contract. An unknown slug (`index`
   *  -1) reads as page 0 of `pageCount` — `hasPrevious`/`hasNext` both read
   *  false off that, which disables the pager instead of miscounting. */
  protected readonly page = computed(() => this.index() + 1);
  protected readonly pageCount = LEARN_TOPICS.length;

  protected onPageChange(page: number): void {
    const target = LEARN_TOPICS[page - 1];
    if (target) {
      void this.router.navigate(['/learn', target.slug]);
    }
  }
}
