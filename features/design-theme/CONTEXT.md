# CONTEXT — design-theme
updated: 2026-09-15

## What this is

Starting visual system for the app: `tokens.css` (values), `components.css` (classes), `demo.js` (toggle and drawer behaviour for the mockups). The mockup pages are `index.html` (home), `search.html`, `browse.html`, `source.html`, `learn-topic.html` (rendered markdown) and `specimen.html` (parts kit). Page types follow `_architecture/sitemap.yaml`. Plain CSS so Stage 2 HTML prototypes can link it directly and the Angular app can import the same files later. Proposal status, not yet an ADR.

Design read: dark neon HUD, 80s retro-futurism leaning Ready Player One and cyberpunk. Controls borrow from effect pedals and studio gear (latching keys with LEDs, stompbox-style filter toggles, seven-segment readout) without drawing literal devices. Desktop is the playful surface. Mobile shows information fast on a small screen.

## Why it's built this way

- **Two token layers.** Primitives (`--p-*`) hold raw values and components never reference them. Semantic tokens sit under `:root, [data-theme="retro"]`. The planned "sleek" theme is one `[data-theme="sleek"]` block redefining the semantic layer. `components.css` does not change.
- **Three surface families, three levels of decoration.**
  - chrome (`.hud`, `.dock`, `.key`, `.toggle`, `.segment`, `.console`, `.panel__head`, `.logotype`): bevels, LEDs, key travel, glow.
  - readout (`.panel__body`, `.data-table`, `.spec`, `.chip`, `.trust`, `.sig`): flat, no glow. Search results are plain tables.
  - sheet (`.sheet.prose`): light paper that copies the markdown rendering in the sibling repo JooKoi-md-archive (`_markdown-rendering.scss`). Documents read like documents.
- **Mobile is a different layout, not a shrunk one.** Below 768px the HUD compacts to brand plus search, nav moves to a bottom `.dock`, table rows become stacked cards through grid areas, filters collapse into `details.drawer`, and decoration (grid floor, horizon, HUD brackets) is dropped. The rack sidebar appears at 1024px. The table Lang column shows only at 1440px and up.
- **Three fonts, strict jobs.** Chakra Petch for display and controls, Inter for reading (same as md-archive), JetBrains Mono for data.
- **Real controls under the decoration.** Keys, toggles and segment options are `<button aria-pressed>`. LEDs, screws and brackets are `aria-hidden`.

## Gotchas

- Accessibility target is relaxed by the user's call (personal use): keyboard navigation must work, readout and sheet text keeps AA, decoration is exempt. `prefers-reduced-motion` kills animation. `prefers-contrast: more` removes glow, grid floor, brackets and the logotype gradient.
- Any single-column grid needs `grid-template-columns: minmax(0, 1fr)`. The implicit `auto` track grows to the widest child (a table or console) and overflows the phone viewport.
- `demo.js` gives radio behaviour to buttons inside `.segment` or `[data-radio]`. Elsewhere `aria-pressed` toggles freely. It also opens `details.drawer` at 1024px and up. The app replaces this with real component state.
- The Claude desktop preview pane shows `file://` pages without linked CSS. Use the `design-theme` entry in `.claude/launch.json` (python static server, port 8765).
- The mockups load fonts from Google Fonts. The app self-hosts them.
- Trust tier names Trusted and Discovered are placeholders until the data model names them.

## Don't

- Don't put glow, scanlines or bevels on readout or sheet surfaces.
- Don't build on Angular Material for this look. Use Angular CDK for behaviour with these classes for style. Stage 4/5 call, recommendation only.
- Don't signal trust tier by colour alone. The badges carry text and different shapes.
