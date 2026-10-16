// The PDF links of the CV (bar, intro, contact: [data-pdf]) download the CV as the visitor sees it: in the language
// and the theme of the page. tools/pdf.py writes the four files; the light names never change (links already shared).
import { isDark, onThemeChange } from '/assets/ds/ds.js';

const pdfName = (lang, dark) => `/cv/ismael-sarmiento-cv${lang === 'en' ? '-en' : ''}${dark ? '-dark' : ''}.pdf`;

export function initPdfLinks(i18n) {
  const sync = () => document.querySelectorAll('[data-pdf]').forEach(a => a.setAttribute('href', pdfName(i18n.lang(), isDark())));
  i18n.onChange(sync);
  onThemeChange(sync);
  sync();
}
