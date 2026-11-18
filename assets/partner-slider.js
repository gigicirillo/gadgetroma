const slider = document.querySelector('.trust');
const track = slider.querySelector('.trust-track');
const previous = slider.querySelector('.previous');
const next = slider.querySelector('.next');
const motion = slider.querySelector('.trust-motion');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasLogos = () => track.querySelector('img') !== null;
let paused = false;

function updateMotion() {
  const motionAvailable = hasLogos() && !reducedMotion.matches;
  motion.hidden = !motionAvailable;
  slider.classList.toggle('drifting', motionAvailable && !paused);
  motion.textContent = paused ? 'Riprendi il movimento' : 'Ferma il movimento';
}

function updateArrows() {
  const canScroll = track.scrollWidth - track.clientWidth > 1;
  previous.hidden = !canScroll;
  next.hidden = !canScroll;
  slider.classList.toggle('enhanced', canScroll);
}

function move(direction) {
  const first = track.firstElementChild;
  const second = first?.nextElementSibling;
  if (!second) return;

  const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  const limit = track.scrollWidth - track.clientWidth;
  const position = track.scrollLeft;
  let target = position + step * direction;

  if (direction < 0 && position <= 1) target = limit;
  if (direction > 0 && position >= limit - 1) target = 0;

  track.scrollTo({ left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

previous.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1));
motion.addEventListener('click', () => {
  paused = !paused;
  updateMotion();
});
reducedMotion.addEventListener('change', updateMotion);
new ResizeObserver(updateArrows).observe(track);
updateArrows();
updateMotion();
