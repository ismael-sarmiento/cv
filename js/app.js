// CV Online entry point: wires the shared design system (theme, languages, signature, Alan) and the CV modules.
// All text is already in the HTML (tools/build.py); English comes from i18n/en.json with ?lang=en, as in IsAcademy.
import { initDesignSystem } from '/assets/ds/ds.js';
import { createI18n } from '/assets/ds/i18n.js';
import { initIntro } from './intro.js';
import { initView } from './view.js';
import { initNav } from './nav.js';
import { initAssistant } from './assistant.js';

const VERSION = new URL(import.meta.url).searchParams.get('v') || 'dev';
const data = JSON.parse(document.getElementById('cv-data').textContent);
const i18n = createI18n({ base: 'https://ismael-sarmiento.github.io/cv/', dict: code => `/cv/i18n/${code}.json?v=${VERSION}` });

initDesignSystem();
// ?pdf: the page as the PDF build prints it (tools/pdf.py): every text open, nothing waiting to be revealed
if (new URLSearchParams(location.search).has('pdf')) {
  document.documentElement.classList.add('pdf');
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
initView();
initNav();
initAssistant(data, i18n);
await i18n.start();
initIntro(data, i18n);
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
