// Summary mode: hides the detail sections (.detail) for a quick read; ?view=summary links straight to it.
export function setView(summary) {
  document.body.classList.toggle('summary-mode', summary);
  const btn = document.querySelector('[data-action="view"]');
  btn?.setAttribute('aria-pressed', String(summary));  // css/cv.css shows the matching label (.when-on / .when-off)
  const url = new URL(location.href);
  if (summary) url.searchParams.set('view', 'summary'); else url.searchParams.delete('view');
  history.replaceState(history.state, '', url);
}

export const isSummary = () => document.body.classList.contains('summary-mode');

export function initView() {
  if (new URLSearchParams(location.search).get('view') === 'summary') setView(true);
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-action="view"]')) return;
    setView(!isSummary());
    // start from the top of the CV, so the change of view is obvious
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
