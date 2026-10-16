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
  document.querySelector('[data-action=open-alan]').click(); await sleep(500);
  const p = document.getElementById('assistantPanel'); ok('"Talk to Alan" opens the panel with four suggestions', !p.hidden && p.querySelectorAll('.chip').length === 4);
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
  ok('ladder: three rungs, current on top', document.querySelectorAll('.rung').length === 3 && document.querySelector('.rung-now'));
  ok('five ecosystem groups', document.querySelectorAll('.eco').length === 5);
  ok('external links rel=noopener', [...document.querySelectorAll('a[href^="http"]')].every(a => /noopener/.test(a.rel)));
  ok('bar controls share one height', new Set([...document.querySelectorAll('.topbar-row > .btn, .tools > .btn')].filter(b => b.offsetParent).map(b => Math.round(b.getBoundingClientRect().height))).size === 1);
  ok('single h1', document.querySelectorAll('h1').length === 1);
  ok('the PDF button of the bar points to the PDF of the language', document.querySelector('.pdf-mini').getAttribute('href') === '/cv/ismael-sarmiento-cv.pdf');
  ok('no horizontal overflow', document.documentElement.scrollWidth <= innerWidth);
  console.log(R.join('\n'));
  return R.filter(r => r.startsWith('FAIL')).length ? 'FAILURES' : 'ALL PASS';
})();
