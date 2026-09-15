import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Drawer } from 'primeng/drawer';

/**
 * Filter drawer. An overlay frame, not a feature: it takes `open` and
 * `heading` and projects whatever the caller puts in it. It does not know what
 * a filter is, does not hold filter state, and takes no data input.
 *
 * Adoption test (decision 011): **step 1 — preset tokens alone reach the
 * design.** `jookoi-preset.ts` maps `semantic.overlay.modal` and
 * `semantic.content` onto `--surface-panel`, `--border-panel`,
 * `--radius-panel` and `--shadow-deep`, and `mask.background` onto
 * `--shadow-deep`, so the panel, its header strip, its close control and the
 * scrim all arrive themed. Steps 2 and 3 were not needed: nothing about the
 * design asks for structure PrimeNG does not emit. This is an **adoption, not
 * a port** — the mockup has no overlay drawer at all. Its `.drawer`
 * (`features/design-theme/components.css:1348`) is an in-flow
 * `<details class="drawer panel">` disclosure in the browse/search rack
 * column, which shares nothing with this component but the word.
 *
 * Decisions that are this file's to make:
 *
 * - **`position="left"`**. No value is ported — the mockup has no overlay — so
 *   the choice is free and PrimeNG's own default happens to be right. The
 *   mockup's filter panel is the **left** rack column (`browse.html:60` inside
 *   `.with-rack`, `components.css:1312-1334`; in `search.html:59` it is the
 *   rack column's first child), so a drawer that slides from the same edge the
 *   filters live on matches the design's own geography.
 * - **`appendTo="body"`**, a deliberate deviation from PrimeNG's `'self'`
 *   default. Layout containment (`container-type`, `contain: layout`) makes an
 *   element a containing block for its fixed-position descendants, and this app
 *   uses `container-type: inline-size` (`joo-toolbar-row`, Task 12). A drawer
 *   left on `'self'` would position its fixed mask and panel against whatever
 *   ancestor it was placed in rather than the viewport, and the breakage would
 *   appear only once a demo was dropped inside a container. Body also puts the
 *   overlay in the layer the `zIndex` tiers in `app.config.ts` govern. Same
 *   reasoning as `chrome-select`.
 * - **`[blockScroll]="true"`**. PrimeNG 22.1.1 defaults `blockScroll` to
 *   `false` (`primeng-drawer.mjs:205`), so the page behind would keep
 *   scrolling. Every other behaviour this component is bought for —
 *   `modal`, `dismissible`, `closeOnEscape`, `closable`, `autoZIndex` — is
 *   already the default.
 *
 * The header is PrimeNG's own, through the `[header]` input, and the close
 * control is PrimeNG's default icon; both are themed by the preset. The
 * template slots are `<ng-template #headerTemplate>` and
 * `#closeIconTemplate` (content children, not `pTemplate`), and are unused
 * here — swapping the close icon for one of our chrome keys is parked work.
 */
@Component({
  selector: 'joo-filter-drawer',
  imports: [Drawer],
  templateUrl: './filter-drawer.component.html',
  styleUrl: './filter-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDrawerComponent {
  readonly open = model(false);
  readonly heading = input('Filters');
}
