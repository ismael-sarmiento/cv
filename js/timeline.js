// The career timeline: the gold rail fills with the reading position and every stop lights up once its card reaches
// the lower part of the screen; a job with promotions draws its steps the first time it is seen. The PDF (?pdf),
// printing and reduced motion show everything lit at once.
export function initTimeline() {
  const wrap = document.querySelector('.tl-wrap');
  if (!wrap) return;
  const fill = wrap.querySelector('.tl-rail i');
  const items = [...wrap.querySelectorAll('.tl-item')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('pdf');
  if (still) { items.forEach(it => it.classList.add('lit', 'seen')); if (fill) fill.style.height = '100%'; return; }
  let frame = 0;
  const update = () => {
    frame = 0;
    const line = innerHeight * 0.62, box = wrap.getBoundingClientRect();
    if (fill) fill.style.height = `${(Math.max(0, Math.min(1, (line - box.top) / box.height)) * 100).toFixed(1)}%`;
    items.forEach(it => {
      const lit = it.getBoundingClientRect().top + 34 < line;
      it.classList.toggle('lit', lit);
      if (lit) it.classList.add('seen');
    });
  };
  addEventListener('scroll', () => { frame ||= requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', () => { frame ||= requestAnimationFrame(update); });
  addEventListener('beforeprint', () => { items.forEach(it => it.classList.add('lit', 'seen')); if (fill) fill.style.height = '100%'; });
  update();
}
