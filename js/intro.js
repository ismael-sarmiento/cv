// Intro, as in IsAcademy: the signature ("Is" sketched + "mael Sarmiento" decoded), then "CV Online", the hook and
// the impact milestones on one line. "Entrar al CV" opens the page. Once per browser session, never on deep links
// (#section); "Saltar intro" or Escape jump straight to the end.
import { reducedMotion } from '/assets/ds/ds.js';
import { playSignature, skipSignature } from '/assets/ds/signature.js';

const KEY = 'cv-intro-seen';
const STEP_MS = 900;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function seen() { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } }
function remember() { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ } }

export function initIntro(data, i18n) {
  const intro = document.getElementById('intro');
  if (!intro) return;
  if (seen() || location.hash) { intro.hidden = true; return; }

  const svg = intro.querySelector('.sig');
  const steps = () => data[i18n.lang()].steps;
  const segs = [...intro.querySelectorAll('.intro-segs span')];
  const stepText = intro.querySelector('.intro-step');
  const enter = intro.querySelector('[data-action="enter"]');
  const skip = intro.querySelector('[data-action="skip"]');
  let done = false, shown = -1;
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
  const close = () => {
    remember();
    intro.classList.add('leaving');
    document.body.classList.remove('intro-open');
    setTimeout(() => { intro.hidden = true; }, reducedMotion() ? 0 : 450);
  };

  document.body.classList.add('intro-open');
  enter.addEventListener('click', close);
  skip.addEventListener('click', () => { finish(); enter.focus(); });
  intro.addEventListener('keydown', e => { if (e.key === 'Escape') { if (done) close(); else { finish(); enter.focus(); } } });

  if (reducedMotion()) { finish(); enter.focus(); return; }
  (async () => {
    await sleep(200);
    await playSignature(svg);
    if (done) return;
    intro.classList.add('after');
    await sleep(500);
    intro.classList.add('ready');          // "Entrar al CV" is available while the milestones run
    for (let i = 0; i < steps().length && !done; i++) { showMilestone(i); await sleep(STEP_MS); }
    if (!done) { done = true; skip.hidden = true; enter.focus(); }
  })();
}
