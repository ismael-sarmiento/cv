// CV Online · flows battery. Paste in the browser console on /cv/ (local universe site) before publishing.
// Every check prints PASS or FAIL; nothing is sent anywhere.
(async () => {
  const R = []; const ok = (n, c) => R.push((c ? 'PASS ' : 'FAIL ') + n); const sleep = ms => new Promise(r => setTimeout(r, ms));
  const anchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href'));
  ok(`all # anchors resolve (${anchors.length})`, anchors.every(h => document.getElementById(h.slice(1))));
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id); ok('ids unique', new Set(ids).size === ids.length);
  const vb = document.querySelector('.topbar [data-action=view]'); vb.click(); await sleep(80);
  ok('summary mode hides details and shows the notice', getComputedStyle(document.getElementById('story')).display === 'none'
    && getComputedStyle(document.querySelector('.summary-notice')).display !== 'none');
  document.querySelector('.nav a[href="#summary"]').click(); await sleep(50);
  document.querySelector('.summary-notice [data-action=view]').click(); await sleep(80);
  ok('the notice button goes back to the full CV', !document.body.classList.contains('summary-mode'));
  const d = document.querySelector('details.more'); d.querySelector('summary').click(); await sleep(50); ok('read more opens', d.open); d.querySelector('summary').click();
  const before = document.documentElement.dataset.theme; document.querySelector('.topbar [data-action=theme]').click(); await sleep(50);
  ok('theme toggles and is remembered', before !== document.documentElement.dataset.theme && localStorage.getItem('isa-theme') === document.documentElement.dataset.theme);
  document.querySelector('.topbar [data-action=theme]').click();
  ok('Alan lives only in the floating button (no section of its own, as on Inicio and IsAcademy)', !document.getElementById('assistant') && !!document.querySelector('.assistant-fab'));
  document.querySelector('.assistant-fab').click(); await sleep(500);
  const p = document.getElementById('assistantPanel'); ok('the floating button opens the panel with four suggestions', !p.hidden && p.querySelectorAll('.chip').length === 4);
  p.querySelector('.chip').click(); await sleep(2000); ok('a suggestion gets an answer', p.querySelectorAll('.msg-bot').length >= 2);
  // each question gets its own answer (Alan types for ~2 s before answering)
  const input = p.querySelector('.as-form input'), form = p.querySelector('.as-form');
  const ask = async q => { input.value = q; form.requestSubmit(); await sleep(2600); return [...p.querySelectorAll('.msg-bot')].pop().innerText; };
  for (const [q, expected] of [['¿Qué es IsAcademy?', 'IsAcademy es la academia'], ['¿Lidera equipos?', 'lidera el área'],
    ['¿Qué hace en Savana?', 'En Savana pasó'], ['¿Cómo puedo contactar con él?', 'Por correo'], ['xyzzy', 'No tengo una respuesta']]) {
    ok(`Alan answers «${q}»`, (await ask(q)).includes(expected));
  }
  p.querySelector('.as-close').click(); await sleep(300); ok('panel closes', p.hidden);
  const lb = document.querySelector('.topbar [data-action=lang]'); lb.click(); await sleep(400);
  ok('English via ?lang=en', document.documentElement.lang === 'en' && location.search.includes('lang=en') && lb.textContent.trim() === 'ES');
  lb.click(); await sleep(400); ok('back to Spanish', document.documentElement.lang === 'es' && !location.search.includes('lang'));
  ok('compact timeline starts with Savana', document.querySelector('.tl-item h3')?.textContent === 'Savana');
  ok('IsAcademy right after Savana, with its «En paralelo» badge', document.querySelectorAll('.tl-item h3')[1]?.textContent === 'IsAcademy' && !!document.querySelectorAll('.tl-item')[1].querySelector('.tl-badge'));
  ok('Savana draws its three promotions as steps', document.querySelectorAll('.tl-item')[0].querySelectorAll('.tl-steps li').length === 3);
  const track = document.querySelector('.tl-steps');
  ok('Savana marks Head as the current step with a translated label', track.querySelector('[aria-current="step"] .tl-step-role')?.textContent === 'Head of Data Management'
    && track.querySelector('[aria-current="step"] .tl-step-tag')?.textContent === 'Actual');
  ok('every promotion stays readable during its animation', [...track.querySelectorAll('.tl-step-role')].every(el =>
    getComputedStyle(el).opacity === '1' && parseFloat(getComputedStyle(el).fontSize) >= 14));
  ok('mobile promotions use the available width instead of three narrow columns', innerWidth > 640 ||
    [...track.children].every(el => el.getBoundingClientRect().width >= track.getBoundingClientRect().width - 1));
  ok('career accents always finish', track.getAnimations({ subtree: true }).every(a => a.effect.getTiming().iterations !== Infinity));
  ok('every timeline stop sits on the rail', (() => { const r = document.querySelector('.tl-rail').getBoundingClientRect(), c = r.left + r.width / 2;
    return [...document.querySelectorAll('.tl-stop')].every(s => { const b = s.getBoundingClientRect(); return Math.abs(b.left + b.width / 2 - c) < 1; }); })());
  ok('contact without the extra «También me encuentras» links', !document.querySelector('.contact-more') && !/También me encuentras/.test(document.body.innerText));
  ok('eight intro milestones, Savana last in three steps', (() => { const s = JSON.parse(document.getElementById('cv-data')?.textContent || 'null')?.es?.steps || [];
    return s.length === 8 && s.slice(-3).every(x => x.includes('Savana ·')) && /IsAcademy/.test(s[4]); })());
  ok('ladder: three rungs, current on top', document.querySelectorAll('.rung').length === 3 && document.querySelector('.rung-now'));
  ok('five ecosystem groups', document.querySelectorAll('.eco').length === 5);
  ok('external links rel=noopener', [...document.querySelectorAll('a[href^="http"]')].every(a => /noopener/.test(a.rel)));
  ok('bar controls share one height', new Set([...document.querySelectorAll('.topbar-row > .btn, .tools > .btn')].filter(b => b.offsetParent).map(b => Math.round(b.getBoundingClientRect().height))).size === 1);
  ok('single h1', document.querySelectorAll('h1').length === 1);
  // the PDF links follow the language and the theme of the page (js/pdf.js)
  const pdfs = () => [...new Set([...document.querySelectorAll('[data-pdf]')].map(x => x.getAttribute('href')))];
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  ok('two PDF links (bar, intro) share one file', document.querySelectorAll('[data-pdf]').length === 2 && pdfs().length === 1);
  ok('PDF of the language and theme shown', pdfs()[0] === `/cv/ismael-sarmiento-cv${dark ? '-dark' : ''}.pdf`);
  document.querySelector('.topbar [data-action=theme]').click(); await sleep(50);
  ok('changing the theme changes the PDF', pdfs()[0] === `/cv/ismael-sarmiento-cv${dark ? '' : '-dark'}.pdf`);
  document.querySelector('.topbar [data-action=theme]').click();
  document.querySelector('.topbar [data-action=lang]').click(); await sleep(400);
  ok('changing the language changes the PDF', pdfs()[0] === `/cv/ismael-sarmiento-cv-en${dark ? '-dark' : ''}.pdf`);
  document.querySelector('.topbar [data-action=lang]').click(); await sleep(400);
  ok('the intro offers «Entrar al CV» and «Descargar PDF»', document.querySelectorAll('#intro .intro-actions .btn').length === 2);
  ok('no DataHub or Power BI → Superset (LinkedIn rule)', !/DataHub|Power BI|Superset/.test(document.body.innerText));
  ok('no horizontal overflow', document.documentElement.scrollWidth <= innerWidth);
  console.log(R.join('\n'));
  return R.filter(r => r.startsWith('FAIL')).length ? 'FAILURES' : 'ALL PASS';
})();
