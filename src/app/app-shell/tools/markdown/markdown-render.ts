import { Marked } from 'marked';

/** GFM to HTML. A mermaid fence becomes a div the page draws later. */
export function renderMarkdown(body: string): string {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = fenceLanguage(lang);
        if (language === 'mermaid') {
          return `<div class="mermaid">${escapeHtml(text)}</div>\n`;
        }
        const klass = language ? ` class="language-${escapeHtml(language)}"` : '';
        return `<pre><code${klass}>${escapeHtml(text)}</code></pre>\n`;
      },
    },
  });
  const html = marked.parse(body);
  if (typeof html !== 'string') {
    throw new Error('Markdown parse did not return a string');
  }
  return html;
}

function fenceLanguage(lang: string | undefined): string {
  return (lang ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
