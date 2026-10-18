// The contact form of CV Online: the piece shared with IsAcademy (/assets/ds/contact.js + contact.css) with the CV's
// own fields; the email Ismael receives is always written in Spanish, whatever language the visitor uses.
import { initContactForm } from '/assets/ds/contact.js';

export function initContact(i18n) {
  const form = document.getElementById('cvForm');
  if (!form) return;
  const t = key => i18n.t(`ui.cv.form.${key}`);
  initContactForm({
    form,
    texts: () => ({ required: t('required'), badEmail: t('badEmail'), needPrivacy: t('needPrivacy'), send: t('send'), sending: t('sending'), ok: t('ok'), error: t('error') }),
    buildEmail: async f => {
      const v = name => f.elements[name].value.trim();
      const language = i18n.lang() === 'en' ? 'Inglés' : 'Español';
      return {
        Resumen: `${v('name')} te escribe desde el CV Online.${v('company') ? ` Empresa: ${v('company')}.` : ''} Idioma: ${language}.`,
        Nombre: v('name'), Email: v('email'), Empresa: v('company') || '—', Mensaje: v('message'), Idioma: language,
        _subject: `Nuevo contacto desde el CV — ${v('name')}`, _replyto: v('email'),
      };
    },
  });
}
