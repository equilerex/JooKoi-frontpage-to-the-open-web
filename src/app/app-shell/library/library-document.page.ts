import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  resource,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PaperSheetComponent } from '../../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { ProseContentComponent } from '../../shared/design-system/data-display/prose-content/prose-content.component';
import { PagerComponent } from '../../shared/design-system/navigation/pager/pager.component';
import { LIBRARY_DOCS } from '../../shared/library-content/library-index.generated';
import { loadLibraryDocHtml } from '../../shared/library-content/library-lookup';

/** Document pane to the right of the persistent file tree. */
@Component({
  selector: 'joo-library-document-page',
  imports: [PaperSheetComponent, ProseContentComponent, PagerComponent],
  templateUrl: './library-document.page.html',
  styleUrl: './library-document.page.css',
})
export class LibraryDocumentPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });

  protected readonly path = computed(() => (this.routeData()['libraryPath'] as string) ?? '');
  protected readonly doc = computed(() => LIBRARY_DOCS.find((d) => d.path === this.path()));

  private readonly folderPath = computed(() => this.path().split('/').slice(0, -1).join('/'));

  private readonly siblingDocs = computed(() => {
    const parent = this.folderPath();
    const prefix = `${parent}/`;
    return LIBRARY_DOCS.filter((d) => {
      if (!d.path.startsWith(prefix)) return false;
      return !d.path.slice(prefix.length).includes('/');
    }).sort((a, b) => a.order - b.order);
  });

  protected readonly page = computed(() => {
    const index = this.siblingDocs().findIndex((d) => d.path === this.path());
    return index + 1;
  });
  protected readonly pageCount = computed(() => this.siblingDocs().length);

  /**
   * `id` caches the SSR result in TransferState so hydration does not blank the
   * page and re-show a loading label (that flash was slower than the real paint).
   * `defaultValue: ''` keeps the ref defined while loading.
   */
  protected readonly html = resource({
    params: () => this.path(),
    loader: ({ params }) => loadLibraryDocHtml(params),
    defaultValue: '',
    id: 'library-doc-html',
  });

  /** Keep the last HTML while the next path loads (stale-while-revalidate). */
  protected readonly displayedHtml = linkedSignal<string, string>({
    source: () => this.html.value(),
    computation: (current, previous) => (current !== '' ? current : (previous?.value ?? '')),
  });

  private readonly mermaidEffect = afterRenderEffect(() => {
    const content = this.displayedHtml();
    const path = this.path();
    if (!content || !this.doc()?.hasDiagrams || this.html.isLoading()) return;
    const nodes = this.host.nativeElement.querySelectorAll('.mermaid');
    if (nodes.length === 0) return;
    void import('mermaid').then(({ default: mermaid }) => {
      if (this.path() !== path) return;
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      void mermaid.run({ nodes, suppressErrors: true });
    });
  });

  protected onPageChange(page: number): void {
    const target = this.siblingDocs()[page - 1];
    if (target) {
      void this.router.navigate(['/library', ...target.path.split('/')]);
    }
  }
}
