import { Component } from '@angular/core';

/**
 * Document paper. Ported from `features/design-theme/components.css` `.sheet`
 * (:1496-1509) and its mobile override (:1514-1521).
 *
 * There is no texture and no ruled edge to port. The mockup file's own header
 * (components.css:9) states the intent as "Flat and calm. No glow or texture
 * under text", and those two rules are the whole of `.sheet`.
 *
 * `.sheet :focus-visible` (:1510-1512) reaches content the consumer projects
 * into the sheet, so it cannot live in this stylesheet — it is in
 * `src/styles.css` under `@layer components`, keyed to this element name.
 * Decision 014.
 */
@Component({
  selector: 'joo-paper-sheet',
  template: '<ng-content />',
  styleUrl: './paper-sheet.component.css'
})
export class PaperSheetComponent {}
