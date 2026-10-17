// Navigation: active menu item while scrolling, and links to hidden detail sections leave summary mode first.
import { setView, isSummary } from './view.js';

export function initNav() {
  const links = [...document.querySelectorAll('.nav a[data-nav]')];
  const byId = new Map(links.map(a => [a.dataset.nav, a]));
  // sections without their own menu entry (credentials, ecosystem, Alan) keep the previous entry highlighted
  const owner = new Map();
  let current = null;
  document.querySelectorAll('main section[id]').forEach(s => { if (byId.has(s.id)) current = s.id; owner.set(s, current); });
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('active'));
    const a = byId.get(owner.get(e.target));
    if (!a) return;
    a.classList.add('active');
    // on phones the menu scrolls sideways: move only the menu, never the page (as IsAcademy)
    const nav = a.parentElement;
    if (nav.scrollWidth > nav.clientWidth) nav.scrollBy({ left: a.getBoundingClientRect().left - nav.getBoundingClientRect().left - 16, behavior: 'smooth' });
  }), { rootMargin: '-45% 0px -50% 0px' });
  owner.forEach((_, s) => spy.observe(s));

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target?.classList.contains('detail') && isSummary()) setView(false);
  });
}
