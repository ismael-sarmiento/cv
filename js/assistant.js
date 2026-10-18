// Alan on CV Online: the assistant shared with Inicio and IsAcademy (/assets/ds/assistant.js), fed with the public FAQ of the CV.
// Local and private (no network, no external model); one floating button, as on the other sites.
import { createAssistant, faqMatcher as matcher } from '/assets/ds/assistant.js';

export function initAssistant(data, i18n) {
  const alan = createAssistant({
    ...data.es.assistant,
    match: matcher(data.es.faq),
    onAction: ({ href }) => {
      if (href?.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ block: 'start' });
      else if (href) window.open(href, '_blank', 'noopener');   // WhatsApp and other sites open beside the CV
    },
  });
  // Alan speaks the language of the page (labels, suggestions and knowledge)
  i18n.onChange(lang => alan.refresh({ ...data[lang].assistant, match: matcher(data[lang].faq) }));
  // on phones the button steps aside over the contact form and while typing, as on IsAcademy, so it never covers a field
  let overForm = false, typing = false;
  const phone = () => matchMedia('(max-width: 640px)').matches;
  const update = () => alan.tuck(phone() && (overForm || typing));
  const contact = document.getElementById('contact');
  if (contact) new IntersectionObserver(([en]) => { overForm = en.isIntersecting; update(); }, { threshold: .15 }).observe(contact);
  document.addEventListener('focusin', e => {
    if (e.target.matches('input:not([type="checkbox"]), textarea, select') && !e.target.closest('#assistantPanel')) { typing = true; update(); }
  });
  document.addEventListener('focusout', () => { typing = false; update(); });
  // and never on top of the intro
  const intro = document.getElementById('intro');
  if (intro && !intro.hidden) {
    alan.tuck(true);
    new MutationObserver(() => { if (intro.hidden) update(); }).observe(intro, { attributes: true, attributeFilter: ['hidden'] });
  }
}
