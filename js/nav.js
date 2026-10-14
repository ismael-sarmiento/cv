// Navigation: active menu item while scrolling, and links to hidden detail sections leave summary mode first.
import { setView, isSummary } from './view.js';

export function initNav() {
  const links = [...document.querySelectorAll('.nav a[data-nav]')];
  const byId = new Map(links.map(a => [a.dataset.nav, a]));
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('active'));
    byId.get(e.target.id)?.classList.add('active');
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[data-section]').forEach(s => spy.observe(s));

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target?.classList.contains('detail') && isSummary()) setView(false);
  });
}
