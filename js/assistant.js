// Alan on CV Online: the assistant shared with IsAcademy (/assets/ds/assistant.js), fed with the public FAQ of the CV.
// Local and private (no network, no external model); it hides while the assistant section itself is on screen.
import { createAssistant, faqMatcher as matcher } from '/assets/ds/assistant.js';
import { avatarSVG } from '/assets/ds/avatar.js';

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
