// CV Online entry point: wires the shared design system (theme, languages, signature, Alan) and the CV modules.
// All text is already in the HTML (tools/build.py); English comes from i18n/en.json with ?lang=en, as in IsAcademy.
import { initDesignSystem } from '/assets/ds/ds.js';
import { createI18n } from '/assets/ds/i18n.js';
import { initIntro } from '/assets/ds/intro.js';
import { initView } from './view.js';
import { initNav } from './nav.js';
import { initAssistant } from './assistant.js';
import { initPdfLinks } from './pdf.js';

const VERSION = new URL(import.meta.url).searchParams.get('v') || 'dev';
const data = JSON.parse(document.getElementById('cv-data').textContent);
const i18n = createI18n({ base: 'https://ismael-sarmiento.github.io/cv/', dict: code => `/cv/i18n/${code}.json?v=${VERSION}` });

initDesignSystem();
// the hero is the first screen: it rises on load (staggered), never waiting for a scroll that may not come
document.querySelectorAll('#top .reveal').forEach(el => el.classList.add('in'));
// ?pdf: the page as the PDF build prints it (tools/pdf.py): every text open, nothing waiting to be revealed
// (?pdf=dark prints it in the dark theme)
const pdfMode = new URLSearchParams(location.search).get('pdf');
if (pdfMode !== null) {
  document.documentElement.classList.add('pdf');
  if (pdfMode === 'dark') document.documentElement.dataset.theme = 'dark';
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
initView();
initNav();
initAssistant(data, i18n);
initPdfLinks(i18n);
await i18n.start();
initIntro({ i18n, steps: () => data[i18n.lang()].steps });
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
