import {
  afterNextRender,
  afterRenderEffect,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { HardwareKeyComponent } from '../../../shared/design-system/actions/hardware-key/hardware-key.component';
import { ProseContentComponent } from '../../../shared/design-system/data-display/prose-content/prose-content.component';
import { PaperSheetComponent } from '../../../shared/design-system/surfaces/paper-sheet/paper-sheet.component';
import { markdownMermaidConfig } from './markdown-mermaid';
import { renderMarkdown } from './markdown-render';

const SAMPLE = `# Sample note

A short paragraph with **bold** and a list.

- one
- two

\`\`\`mermaid
graph TD
  A[Source] --> B[Preview]
\`\`\`
`;

type PhonePane = 'edit' | 'preview';

/** `/tools/markdown`: local split preview. `marked` and `mermaid` load with this page only. */
@Component({
  selector: 'joo-markdown-tool-page',
  imports: [HardwareKeyComponent, PaperSheetComponent, ProseContentComponent],
  templateUrl: './markdown-tool.page.html',
  styleUrl: './markdown-tool.page.css',
})
export class MarkdownToolPage {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  protected readonly source = signal('');
  protected readonly html = signal('');
  protected readonly error = signal('');
  protected readonly pane = signal<PhonePane>('edit');

  constructor() {
    effect((onCleanup) => {
      const text = this.source();
      const handle = setTimeout(() => this.publish(text), 200);
      onCleanup(() => clearTimeout(handle));
    });

    afterRenderEffect(() => {
      const html = this.html();
      if (!html.includes('class="mermaid"')) return;
      const nodes = this.host.nativeElement.querySelectorAll('.mermaid');
      if (nodes.length === 0) return;
      void import('mermaid').then(({ default: mermaid }) => {
        if (this.html() !== html) return;
        mermaid.initialize(markdownMermaidConfig);
        void mermaid.run({ nodes, suppressErrors: true });
      });
    });
  }

  protected onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    this.source.set(target.value);
  }

  protected loadSample(): void {
    this.source.set(SAMPLE);
    this.pane.set('preview');
  }

  /** Browser print is the PDF export. The dialog opens after diagrams have drawn. */
  protected print(): void {
    this.publish(this.source());
    afterNextRender(() => void this.finishPrint(), { injector: this.injector });
  }

  private async finishPrint(): Promise<void> {
    const html = this.html();
    if (html.includes('class="mermaid"')) {
      const nodes = this.host.nativeElement.querySelectorAll('.mermaid');
      if (nodes.length > 0) {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize(markdownMermaidConfig);
        await mermaid.run({ nodes, suppressErrors: true });
      }
    }
    window.print();
  }

  private publish(text: string): void {
    try {
      this.html.set(renderMarkdown(text));
      this.error.set('');
    } catch {
      this.error.set('Could not render this markdown.');
    }
  }
}
