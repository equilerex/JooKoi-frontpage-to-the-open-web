import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';

/** Matches the phone breakpoint `src/styles.css` uses for `.fig`. */
const PHONE_QUERY = '(max-width: 768px)';

/**
 * Long-form body copy. It styles whatever arbitrary HTML the consumer projects
 * into it, which makes it the one part whose contract is descendant rules.
 *
 * Those rules cannot live in this file: emulated encapsulation compiles
 * `:host h2` to `[_nghost-c] h2[_ngcontent-c]`, and a projected `h2` carries the
 * *parent* template's `_ngcontent`, so the rule matches nothing. They are in
 * `src/styles.css` under `@layer components` instead — decision 014.
 *
 * Library figures (`.fig` svg, and plain `img` such as the hero art, decision 040) are drawn for ~900px. On phones
 * they shrink to the column as a preview and a tap opens a clone in a native
 * `<dialog>` at 640px, which pans both ways and pinch-zooms (the page viewport allows scaling). The click is delegated
 * from the host because the figures are projected innerHTML, not template nodes.
 * A figure that carries a `svg.fig-narrow` twin is redrawn for phones and skips the zoom.
 * The dialog is built on first tap and appended to `<body>`: a dialog in this
 * template sits after the projection slot, and the consumer's innerHTML breaks
 * hydration's node path to it (NG0502).
 */
@Component({
  selector: 'joo-prose-content',
  template: '<ng-content />',
  styleUrl: './prose-content.component.css',
  host: { '(click)': 'onClick($event)' },
})
export class ProseContentComponent {
  private readonly document = inject(DOCUMENT);

  protected onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const source = target.closest('.fig svg, img');
    if (
      !source ||
      source.closest('.fig')?.querySelector('.fig-narrow') ||
      !this.document.defaultView?.matchMedia(PHONE_QUERY).matches
    )
      return;
    const clone = source.cloneNode(true) as SVGElement | HTMLImageElement;
    clone.style.width = '640px';
    clone.style.minWidth = '640px';
    clone.style.maxWidth = 'none';
    this.openZoom(clone);
  }

  private openZoom(figure: SVGElement | HTMLImageElement): void {
    const dialog = this.document.createElement('dialog');
    dialog.className = 'fig-zoom';
    dialog.setAttribute('aria-label', 'Enlarged figure');
    const close = this.document.createElement('button');
    close.type = 'button';
    close.className = 'fig-zoom-close';
    close.textContent = 'Close';
    close.addEventListener('click', () => dialog.close());
    const wrap = this.document.createElement('figure');
    wrap.append(figure);
    dialog.append(close, wrap);
    dialog.addEventListener('close', () => dialog.remove());
    this.document.body.append(dialog);
    dialog.showModal();
  }
}
