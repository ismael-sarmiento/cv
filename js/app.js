// CV Online entry point: wires the shared design system (theme, languages, signature, Alan) and the CV modules.
// All text is already in the HTML (tools/build.py); English comes from i18n/en.json with ?lang=en, as in IsAcademy.
import { initDesignSystem } from '/assets/ds/ds.js';
import { createI18n } from '/assets/ds/i18n.js';
import { initIntro } from '/assets/ds/intro.js';
import { initView } from './view.js';
import { initNav } from './nav.js';
import { initPdfLinks } from './pdf.js';
import { initContact } from './contact.js';
import { initTimeline } from './timeline.js';

async function boot() {
  const startup = globalThis.isaStartup;
  if (!startup) {
    document.documentElement.classList.remove('js', 'i18n-wait');
    const intro = document.getElementById('intro');
    if (intro) intro.hidden = true;
    return;
  }
  if (startup.isFailed()) return;
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
  initPdfLinks(i18n);
  initContact(i18n);
  initTimeline();
  await i18n.start();
  if (startup.isFailed()) return;
  initIntro({ i18n, steps: () => data[i18n.lang()].steps, stepMs: 1650 });
  startup.ready();
  void import('./assistant.js').then(({ initAssistant }) => {
    if (!startup.isFailed()) initAssistant(data, i18n);
  }).catch(() => console.warn('Alan is unavailable.'));
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
}

boot().catch(() => globalThis.isaStartup?.fail());
