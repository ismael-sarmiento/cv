// Alan on CV Online: the assistant shared with IsAcademy (/assets/ds/assistant.js), fed with the public FAQ of the CV.
// Local and private (no network, no external model); it hides while the assistant section itself is on screen.
import { createAssistant } from '/assets/ds/assistant.js';
import { avatarSVG } from '/assets/ds/avatar.js';

const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// words that carry no meaning in a question ("qué", "es", "his"...) never decide the answer
const STOP = new Set(('que cual cuales como donde cuando quien quienes por para con sin sus del las los una uno unos unas este esta esto eso '
  + 'hay hace hacer tiene tienes eres puedes puede sobre mas muy '
  + 'the what which who how does did can his her you are with for and from about has have this that').split(' '));
const words = s => normalize(s).split(/[^a-z0-9+#]+/).filter(t => t.length >= 3 && !STOP.has(t));

// the best FAQ entry: a keyword weighs 3, a word of the question 2 and a word of the answer 1;
// below 2 points Alan admits it has no answer instead of guessing
function matcher(faq) {
  const index = faq.map(item => ({ item, keys: new Set((item.keywords || []).flatMap(words)), q: new Set(words(item.q)), a: new Set(words(item.a)) }));
  return question => {
    const tokens = words(question);
    let best = null, bestScore = 0;
    for (const e of index) {
      const score = tokens.reduce((n, t) => n + (e.keys.has(t) ? 3 : 0) + (e.q.has(t) ? 2 : 0) + (e.a.has(t) ? 1 : 0), 0);
      if (score > bestScore) { best = e.item; bestScore = score; }
    }
    return bestScore >= 2 ? { answer: best.a } : null;
  };
}

export function initAssistant(data, i18n) {
  const alan = createAssistant({
    ...data.es.assistant,
    match: matcher(data.es.faq),
    onAction: ({ href }) => {
      if (href?.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ block: 'start' });
    },
  });
  // Alan speaks the language of the page (labels, suggestions and knowledge)
  i18n.onChange(lang => alan.refresh({ ...data[lang].assistant, match: matcher(data[lang].faq) }));
  const section = document.getElementById('assistant');
  section.querySelector('.alan-avatar').innerHTML = avatarSVG('section');
  document.addEventListener('click', e => { if (e.target.closest('[data-action="open-alan"]')) alan.open(); });
  // one entry point at a time: no floating button while the assistant section is visible (unless the chat is open)
  new IntersectionObserver(([en]) => alan.tuck(en.isIntersecting && alan.panel.hidden), { threshold: .3 }).observe(section);
  // and never on top of the intro
  const intro = document.getElementById('intro');
  if (intro && !intro.hidden) {
    alan.tuck(true);
    new MutationObserver(() => { if (intro.hidden) alan.tuck(false); }).observe(intro, { attributes: true, attributeFilter: ['hidden'] });
  }
}
