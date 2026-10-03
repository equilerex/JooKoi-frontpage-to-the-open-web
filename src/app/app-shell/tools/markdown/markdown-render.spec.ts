import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdown } from './markdown-render';

describe('renderMarkdown', () => {
  it('turns a mermaid fence into an escaped div and leaves other code as pre', () => {
    const html = renderMarkdown(
      [
        '```mermaid',
        'graph TD',
        '  A-->B',
        '  A["<b>x</b>"]',
        '```',
        '',
        '```ts',
        'const n = 1;',
        '```',
      ].join('\n'),
    );

    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain('A--&gt;B');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('<pre><code class="language-ts">');
    expect(html).not.toContain('<b>x</b>');
  });

  it('leaves raw script markup for the sanitizer, which strips it', () => {
    const html = renderMarkdown('Hello\n\n<script>alert(1)</script>');
    expect(html).toContain('<script>');

    TestBed.configureTestingModule({});
    const sanitizer = TestBed.inject(DomSanitizer);
    const safe = sanitizer.sanitize(SecurityContext.HTML, html);
    expect(safe ?? '').not.toContain('<script');
    expect(safe ?? '').toContain('Hello');
  });
});
