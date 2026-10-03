# markdown-to-pdf-converter

<!-- Plan for client-side Markdown to PDF converter tool. jookoi-paper-trail. -->

Session: 24-09-2026 00:15. Status: updated to modal-based workflow matching JooKoi-md-archive.

## Context

Users frequently need to read local markdown documents or export them to cleanly formatted PDF files. Doing this usually requires installing command-line utilities, configuring headless browsers, or uploading sensitive text to third-party web services.

This repository already maintains a refined reading surface for internal documentation in the library section. It pairs `joo-paper-sheet` with `joo-prose-content` and custom marked and mermaid rendering to produce clean typographic sheets.

Replicating the pattern from `JooKoi-md-archive`, this page provides a focused document reading and printing canvas. The page does not have a live split-screen editor. Instead, markdown is pasted into a modal dialog window. Upon clicking Apply, the modal parses the markdown, updates the main reading canvas with the rendered output, and closes. The user can then read the document or trigger browser print (`window.print()`) to export a clean PDF without any surrounding application chrome or button controls.

## Core requirements

### R1. Modal-based content entry

- Markdown text is entered inside a modal dialog window.
- The modal provides a spacious textarea, a sample loader, a Cancel button, and an Apply button.
- Clicking Apply renders the markdown to HTML, updates the reading canvas, and dismisses the modal.
- When no document has been pasted yet, the canvas displays a clean empty state with a call-to-action button to open the paste modal.

### R2. Rendering parity with archive pages

The canvas renders Markdown using the exact same parser rules and styling as the library reader:

- GitHub Flavored Markdown (GFM) including tables, autolinks, and strikethrough.
- Heading slugs matching the anchor generator.
- Code blocks with syntax block styling.
- Mermaid code blocks rendered dynamically through the lazy-loaded mermaid engine.
- Container structure matching `joo-paper-sheet` and `joo-prose-content`.

### R3. Strict print isolation

The browser print engine must output only the rendered document:

- All surrounding shell elements hidden via `@media print`: `joo-horizon-backdrop`, `joo-heads-up-display-header`, `footer.shell-footer`. The header includes the phone sheet.
- The shell content container `main.page` reset to full width with zero padding and margins.
- All page toolbars, floating action buttons, and modal dialogs hidden during print.
- The paper sheet frame (shadows, background rings, dark borders) removed so the printed paper has a clean white background and natural margins.
- Proper print page breaks configured on headings, tables, blockquotes, and diagram containers.
- Color printing forced with `-webkit-print-color-adjust: exact` and `print-color-adjust: exact`.
- Link pseudo-element URL expansions suppressed.

### R4. Zero bundle bloat

- Routed lazily via `loadComponent` under `/tools/markdown-to-pdf`.
- `marked` imported on demand when the tool page initializes.
- `mermaid` imported dynamically only when diagrams are present in the document.

### R5. Local privacy and SSR safety

- All parsing and rendering executes strictly inside the client browser. No text is ever transmitted across the network.
- All browser globals (`window`, `localStorage`) guarded against server execution so SSR and static prerendering build cleanly.

## Architectural decisions

- **D1. Route location.**
  The tool is accessible at `/tools/markdown-to-pdf`. A convenience alias `/tools/md-to-pdf` redirects to this route. It is logged in `_architecture/sitemap.yaml` under the utilities group.

- **D2. Modal dialog for input.**
  Follow `JooKoi-md-archive`: keep the primary page as a pure reading surface. Text entry occurs in an overlay modal dialog, avoiding screen clutter and eliminating continuous typing parse overhead.

- **D3. Runtime dependency placement.**
  Move `marked` from `devDependencies` to `dependencies` in `package.json` because it executes in the client runtime rather than solely during build-time content generation.

- **D4. Native browser print integration.**
  Use `window.print()` instead of third-party PDF generators like jsPDF or html2pdf. Native print preserves vector fonts, selectable text, crisp SVG diagrams, and high-DPI printer fidelity without adding library overhead.

- **D5. Scoped print stylesheet in global layer.**
  Print overrides sit within `@media print` rules in `src/styles.css` under the `@layer components` layer to ensure they override emulated component boundaries without using `::ng-deep`.

## Detailed UI and UX design

### Main reading canvas

- Centered `joo-paper-sheet` containing `joo-prose-content`.
- When content is empty: shows a clean prompt with an "Open Markdown Input" button.
- When content is loaded: shows the rendered document.
- Floating or top toolbar with "Paste / Edit Markdown" and "Print / Save PDF" buttons. Both buttons are marked with `.no-print` to disappear during print.

### Markdown input modal

- Triggered by clicking "Paste / Edit Markdown" or the empty state button.
- Modal backdrop and centered card with header, textarea, and action buttons.
- Keyboard shortcuts: Escape to dismiss, Ctrl+Enter / Cmd+Enter to apply.
- Buttons:
  - "Load Sample" (populates sample markdown with headings, lists, tables, code, and diagram).
  - "Clear" (empties the textarea).
  - "Cancel" (closes modal without changing current rendered document).
  - "Apply" (parses markdown, updates canvas, runs mermaid if needed, and closes modal).

### Print layout styling

```css
@media print {
  /* Force exact color printing */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide application shell elements and tool controls */
  joo-horizon-backdrop,
  joo-heads-up-display-header,
  footer.shell-footer,
  .no-print,
  .md-converter__toolbar,
  .md-converter__modal-backdrop {
    display: none !important;
  }

  /* Reset layout constraints on main container */
  main.page {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Reset body and page backgrounds */
  body,
  html {
    background: #ffffff !important;
    color: #000000 !important;
  }

  /* Strip card shadows and frame rings from paper sheet */
  joo-paper-sheet {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    background: #ffffff !important;
  }

  /* Ensure tables and code blocks expand naturally without scrollbars */
  joo-prose-content table {
    display: table !important;
    overflow: visible !important;
    width: 100% !important;
  }

  joo-prose-content pre {
    white-space: pre-wrap !important;
    word-break: break-word !important;
    overflow: visible !important;
  }

  /* Prevent browser print engines from injecting raw link URLs */
  joo-prose-content a::after {
    content: none !important;
  }

  /* Prevent awkward page breaks */
  h1,
  h2,
  h3,
  h4 {
    break-after: avoid;
    page-break-after: avoid;
  }

  pre,
  blockquote,
  table,
  .mermaid {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  @page {
    margin: 1.5cm;
  }
}
```

## Build order

1. **Dependency adjustment.** Move `marked` into runtime dependencies in `package.json`.
2. **Markdown parsing helper.** Implement client-compatible `renderMarkdown` function returning parsed HTML and diagram presence flags.
3. **Component scaffolding.** Create `MarkdownToPdfPage` standalone component in `src/app/app-shell/tools/markdown-to-pdf/`.
4. **Modal and reading canvas wiring.** Implement modal dialog with textarea and Apply action, passing output into `PaperSheetComponent` and `ProseContentComponent`.
5. **Mermaid execution.** Run `mermaid.run()` after Apply on newly rendered diagram nodes.
6. **Print styling integration.** Add print rules in `src/styles.css` ensuring full suppression of shell chrome and clean paper output.
7. **Routing and server routes.** Register `/tools/markdown-to-pdf` in `src/app/app.routes.ts` and `src/app/app.routes.server.ts`, and update `_architecture/sitemap.yaml`.
8. **Verification.** Validate modal open/apply flow, verify rendering against archive pages, and test print output in browser preview.

## Implementation deviations

The live preview is `/tools/markdown` and does not follow this plan's modal. Print PDF on that page calls `window.print()`. Print CSS hides the header, which includes the phone sheet, plus the footer and the horizon. There is no separate `/tools/markdown-to-pdf` route.
