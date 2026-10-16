// Intro, as in IsAcademy: the signature ("Is" sketched + "mael Sarmiento" decoded), then "CV Online", the hook and
// the impact milestones on one line. "Entrar al CV" plays the entrance: the signature flies to its place in the bar
// while the intro lifts like a curtain with a gold edge, and the hero rises line by line. Every visit, as IsAcademy;
// deep links (#section) and the PDF build go straight to the page; "Saltar intro" or Escape jump to the end.
import { reducedMotion } from '/assets/ds/ds.js';
import { playSignature, skipSignature, fitSignature } from '/assets/ds/signature.js';

const STEP_MS = 1600;                       // enough to read a milestone of 6–8 words
const EASE_OUT = 'cubic-bezier(.2, .8, .2, 1)';
const EASE_IN_OUT = 'cubic-bezier(.65, 0, .35, 1)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const settled = anim => anim.finished.catch(() => {});

// a visitor coming from the portada has just watched the signature being drawn there
function fromPortada() {
  try {
    const r = new URL(document.referrer);
    return r.origin === location.origin && !/^\/(cv|isacademy)\//.test(r.pathname);
  } catch { return false; }
}

// the union of the "Is" and the name, in viewport pixels (the svg itself has margins around the letters)
function inkBox(svg) {
  const a = svg.querySelector('.is-fill').getBoundingClientRect(), b = svg.querySelector('.word').getBoundingClientRect();
  const left = Math.min(a.left, b.left), top = Math.min(a.top, b.top);
  return { left, top, width: Math.max(a.right, b.right) - left, height: Math.max(a.bottom, b.bottom) - top };
}

export function initIntro(data, i18n) {
  const intro = document.getElementById('intro');
  if (!intro) return;
  // #top is the start of the page, not a deep link: a refresh there plays the intro again (as #hero in IsAcademy)
  if (location.hash === '#top') history.replaceState(history.state, '', location.pathname + location.search);
  // deep links (#contact from an email, #cases from a message) and the PDF build (?pdf) go straight to the page
  const deepLink = location.hash && document.getElementById(location.hash.slice(1));
  if (deepLink || new URLSearchParams(location.search).has('pdf')) { intro.hidden = true; return; }

  const svg = intro.querySelector('.sig');
  const steps = () => data[i18n.lang()].steps;
  const segs = [...intro.querySelectorAll('.intro-segs span')];
  const stepText = intro.querySelector('.intro-step');
  const enter = intro.querySelector('[data-action="enter"]');
  const skip = intro.querySelector('[data-action="skip"]');
  let done = false, closing = false, shown = -1;
  // switching language during the intro keeps the current milestone, in the new language
  i18n.onChange(() => { if (shown >= 0) stepText.textContent = steps()[shown]; });

  const showMilestone = i => {
    segs.forEach((s, k) => s.classList.toggle('on', k <= i));
    stepText.textContent = steps()[i];
    shown = i;
    stepText.classList.remove('swap'); void stepText.offsetWidth; stepText.classList.add('swap');
  };
  const finish = () => {
    done = true;
    skipSignature(svg);
    showMilestone(steps().length - 1);
    intro.classList.add('after', 'ready');
    skip.hidden = true;
  };
  // the end state, whatever happened before: page visible, hero risen, intro gone
  const settle = () => {
    document.body.classList.remove('intro-open', 'entering');
    intro.hidden = true;
    document.querySelectorAll('.intro-flyer, .curtain-edge').forEach(el => el.remove());
    const h1 = document.getElementById('hero-title');
    h1?.setAttribute('tabindex', '-1');
    h1?.focus({ preventScroll: true });
  };

  const close = async () => {
    if (closing) return;
    closing = true;
    done = true;
    skipSignature(svg);
    if (reducedMotion()) {
      await settled(intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
      settle();
      return;
    }
    // safety net: never leave the visitor stuck on the intro if an animation stalls
    const safety = setTimeout(settle, 3500);
    const brand = document.querySelector('.topbar .brand');

    // 1) everything but the signature steps back
    intro.querySelectorAll('.intro-top, .intro-after, .intro-actions')
      .forEach(el => el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 300, easing: EASE_OUT, fill: 'forwards' }));

    // 2) the signature leaves the intro (a fixed copy, so the curtain never cuts it) and flies to the bar
    const from = svg.getBoundingClientRect();
    const ink = inkBox(svg);
    const to = brand?.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'intro-flyer';
    Object.assign(flyer.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px` });
    flyer.innerHTML = svg.outerHTML.replaceAll('is-edge', 'fly-edge').replaceAll('is-ink', 'fly-ink');   // own ids for the copy
    document.body.append(flyer);
    svg.style.visibility = 'hidden';
    document.body.classList.add('entering');
    let flight = Promise.resolve();
    if (to && to.width) {
      const k = to.width / ink.width;
      const dx = to.left - (from.left + (ink.left - from.left) * k);
      const dy = to.top + to.height / 2 - (from.top + (ink.top - from.top + ink.height / 2) * k);
      flight = settled(flyer.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${k})` }],
        { duration: 900, delay: 150, easing: EASE_IN_OUT, fill: 'forwards' }));
    }

    // 3) the intro lifts from the bottom like a curtain, with a gold edge; the page settles underneath (as IsAcademy)
    const edge = document.createElement('div');
    edge.className = 'curtain-edge';
    document.body.append(edge);
    const curtain = { duration: 850, delay: 420, easing: EASE_IN_OUT, fill: 'both' };   // 'both': the edge waits at the bottom
    intro.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], curtain);
    edge.animate([{ transform: `translateY(${innerHeight}px)`, opacity: 1 }, { transform: 'translateY(0)', opacity: 1, offset: .9 }, { transform: 'translateY(0)', opacity: 0 }], curtain);
    document.querySelector('main')?.animate([{ opacity: .4, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }],
      { duration: 900, delay: 420, easing: EASE_OUT, fill: 'backwards' });

    // 4) the hero rises line by line while the curtain clears it (staggered by .stagger in /assets/ds/base.css)
    setTimeout(() => document.body.classList.remove('intro-open'), 700);

    // 5) the signature lands: the real brand takes over
    await flight;
    brand?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'forwards' }).finished.then(() => brand.getAnimations().forEach(a => a.cancel()));
    await settled(flyer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }));
    await sleep(300);
    clearTimeout(safety);
    settle();
  };

  document.body.classList.add('intro-open');
  enter.addEventListener('click', close);
  skip.addEventListener('click', () => { finish(); enter.focus(); });
  intro.addEventListener('keydown', e => { if (e.key === 'Escape') { if (done) close(); else { finish(); enter.focus(); } } });

  if (reducedMotion()) { finish(); enter.focus(); return; }
  (async () => {
    await sleep(200);
    if (fromPortada()) {
      // the signature appears already drawn (it was just drawn on the portada) and the CV story starts at once
      await document.fonts.ready;
      fitSignature(svg);
      skipSignature(svg);
      intro.querySelector('.intro-sig').classList.add('drawn');
      await sleep(600);
    } else {
      await playSignature(svg);
    }
    if (done) return;
    intro.classList.add('after');
    await sleep(500);
    intro.classList.add('ready');          // "Entrar al CV" is available while the milestones run
    for (let i = 0; i < steps().length && !done; i++) { showMilestone(i); await sleep(STEP_MS); }
    if (!done) { done = true; skip.hidden = true; enter.focus(); }
  })();
}
