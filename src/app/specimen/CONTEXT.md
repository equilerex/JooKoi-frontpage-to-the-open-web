# specimen/

The dev-only parts kit at `/specimen` — every design-system component, in every state it has. It is a development tool, not a page of the site.

Rules: `_architecture/plans/decisions/004-static-prerendering-no-server.md` (what may and may not prerender). Full map: `_architecture/ARCHITECTURE.md`.

## Why it never ships

Two structural reasons, and both are needed:

- `src/app/app.routes.ts` adds the route only inside `isDevMode()`, so the production route table does not contain it at all.
- The route uses lazy `loadChildren` (`./specimen.routes`, then a lazy `loadComponent` per template demo), so its chunk is never in the initial bundle either way.

It follows that the route is never in the prerender route list — there is no route to prerender. **The check for whoever next runs a production build (CI, not the agent loop): `dist/jookoi-frontpage/browser/` contains no `specimen/` directory.** If it ever does, one of the two mechanisms above has been broken.

## Adding a component to it

Open `specimen.page.html` and append one `<joo-specimen-section label="…">` block, then render the component inside it in **every state it has** — each colour, each variant, each size, and its disabled or empty case. The section component is a labelled frame only; the demo markup is the page's.

Sections are kept in the order components were built (indicators, typography, actions, form-controls, data-display, surfaces, navigation, page-layouts, page-templates). A page template is the exception: it is a whole page, so it gets its own sibling route under `templates/` in `specimen.routes.ts` and renders into the shell's `router-outlet` rather than inside a section.

The page's own chrome (the title, the lede, the section frame) is `specimen.page.css` and `specimen-section.component.css`. That is page-level styling for a dev-only route, not part of the design system.

## Why this exists at all

The mockups in `features/design-theme/` are static HTML. Once a component is real, "does it look right" has to be asked of the running app, and this is the one route that shows all of them at once without building a feature first. Phase 3's real pages are checked at 390px and 1440px; so is this.
