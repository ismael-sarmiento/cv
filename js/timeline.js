// The outer rail follows the reading position. Promotions have their own observer, so a long job description
// cannot play the whole progression before it reaches the screen. The completed career stays readable without JS.
export function initTimeline() {
  const wrap = document.querySelector('.tl-wrap');
  if (!wrap) return;
  const rail = wrap.querySelector('.tl-rail');
  const fill = rail?.querySelector('i');
  const items = [...wrap.querySelectorAll('.tl-item')];
  const stops = items.map(item => item.querySelector('.tl-stop'));
  const tracks = [...wrap.querySelectorAll('.tl-steps')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pdf = new URLSearchParams(location.search).has('pdf');
  let frame = 0, dirty = true, printing = false, geometry = null;
  let observer;

  const finishTracks = () => {
    tracks.forEach(track => track.classList.remove('is-pending', 'steps-in'));
    observer?.disconnect();
  };
  // Layout offsets exclude the reveal's temporary translateY, keeping the rail anchored while cards arrive.
  const offsetInWrap = element => {
    let y = 0;
    for (let node = element; node && node !== wrap; node = node.offsetParent) {
      y += node.offsetTop;
      if (node.offsetParent && node.offsetParent !== wrap) y += node.offsetParent.clientTop;
    }
    return y;
  };
  const measure = () => {
    dirty = false;
    if (!wrap.getClientRects().length) { geometry = null; return; }
    const top = wrap.getBoundingClientRect().top + scrollY;
    const centers = stops.map(stop => offsetInWrap(stop) + stop.offsetHeight / 2);
    const start = centers[0] || 0;
    const height = Math.max(1, (centers.at(-1) || start) - start);
    geometry = { start: top + start, height, stops: centers.map(y => top + y) };
    if (rail) {
      rail.style.top = `${start}px`;
      rail.style.bottom = 'auto';
      rail.style.height = `${height}px`;
    }
  };
  const update = () => {
    frame = 0;
    if (printing) return;
    if (dirty) measure();
    const still = motion.matches || pdf;
    const reading = scrollY + innerHeight * .62;
    const progress = still ? 1 : geometry ? Math.max(0, Math.min(1, (reading - geometry.start) / geometry.height)) : 0;
    if (fill) fill.style.transform = `scaleY(${progress.toFixed(4)})`;
    items.forEach((item, i) => item.classList.toggle('lit', still || !!geometry && geometry.stops[i] < reading));
  };
  const schedule = () => { frame ||= requestAnimationFrame(update); };
  const invalidate = () => { dirty = true; schedule(); };

  if (motion.matches || pdf || !('IntersectionObserver' in window)) finishTracks();
  else {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // Most of the track must be visible. Very short landscape windows still get a usable entry point.
        if (!entry.isIntersecting || (entry.intersectionRatio < .75 && entry.boundingClientRect.height <= innerHeight * .8)) continue;
        const track = entry.target;
        track.classList.remove('is-pending');
        track.classList.add('steps-in');
        const settled = event => {
          if (event.animationName !== 'tl-current-arrive') return;
          track.classList.remove('steps-in');
          track.removeEventListener('animationend', settled);
          track.removeEventListener('animationcancel', settled);
        };
        track.addEventListener('animationend', settled);
        track.addEventListener('animationcancel', settled);
        observer.unobserve(track);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: [0, .25, .5, .75, 1] });
    tracks.forEach(track => { track.classList.add('is-pending'); observer.observe(track); });
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', invalidate, { passive: true });
  addEventListener('pageshow', invalidate);
  // Opening details, changing language or switching summary mode can move the timeline without resizing it.
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(invalidate);
    resize.observe(wrap);
    const main = wrap.closest('main');
    if (main) resize.observe(main);
  }
  document.addEventListener('toggle', invalidate, true);
  document.fonts?.ready.then(invalidate);
  motion.addEventListener('change', () => { if (motion.matches) finishTracks(); invalidate(); });
  addEventListener('beforeprint', () => {
    printing = true;
    items.forEach(item => item.classList.add('lit'));
    if (fill) fill.style.transform = 'scaleY(1)';
  });
  addEventListener('afterprint', () => { printing = false; invalidate(); });
  update();
}
