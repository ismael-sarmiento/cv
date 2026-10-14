# CV Online · architecture

## Where it lives

- Repository `ismael-sarmiento/cv`, published by GitHub Pages at `https://ismael-sarmiento.github.io/cv/`.
- One page: Spanish at `/cv/`, English at `/cv/?lang=en` (shared i18n module, as in IsAcademy). Old addresses
  (`/index_en.html`, `/articles/`) are redirected by the portada.
- It depends on the portada repository (`ismael-sarmiento.github.io`) for the shared design system in `/assets/ds/`:
  `tokens.css`, `base.css`, `assistant.css`, `ds.js` (theme, reveal, top bar, spotlight), `i18n.js` (languages),
  `signature.js` (the "Is" signature),
  `avatar.js` + `assistant.js` (Alan). Same origin, so absolute paths work; publish design-system changes in the portada first.

## Build

- `data/content.json` is the only source of texts (ES/EN). `tools/build.py <version>` writes `index.html` (Spanish, with
  `data-i18n` keys), `i18n/es.json`, `i18n/en.json` and `sitemap.xml`. Never edit generated files by hand.
- Every text is rendered into the HTML (SEO, no-JS readers). An inert `<script type="application/json" id="cv-data">` carries
  what the JavaScript needs (Alan's texts and FAQ, the intro milestones) in both languages.
- An import map versions every module (`?v=<version>`), the design-system modules included; the build computes the CSP hashes
  of the boot script and of the import map.

## Behaviour (js/)

- `app.js` wires everything. `intro.js`: once per session, skipped on deep links, "Saltar intro" / Escape.
- `view.js`: summary mode hides `.detail` sections; `nav.js`: scroll spy and leaving summary mode for hidden targets.
- `assistant.js`: Alan from `/assets/ds/assistant.js` with a keyword matcher over the CV FAQ; tucked while the assistant
  section is visible and during the intro; it follows the page language.

## Rules

- Colours only through design-system tokens; light and dark checked on every change.
- Content changes go to `data/content.json` (both languages), then rebuild with a new version.
- Run `tools/qa/flows.js` in the browser console (local site) before publishing.
- Private working notes (positioning, decisions, interview preparation) live in `.private/PROJECT_CONTEXT.md`, never published.
