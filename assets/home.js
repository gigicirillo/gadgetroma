const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const valuesTrack = document.querySelector('.values-track');
const valuesControls = document.querySelector('.values-controls');
const valueCards = [...valuesTrack.children];
const [previousValue, nextValue] = valuesControls.querySelectorAll('button');
const valuesPosition = valuesControls.querySelector('.values-position');
let activeValue = 0;

function showValue(index) {
  const target = valueCards[index];
  if (!target) return;
  valuesTrack.scrollTo({
    left: target.offsetLeft,
    behavior: motionPreference.matches ? 'instant' : 'smooth',
  });
}

function updateValue(index) {
  activeValue = index;
  valuesPosition.textContent = `${index + 1} / ${valueCards.length}`;
  previousValue.setAttribute('aria-disabled', String(index === 0));
  nextValue.setAttribute('aria-disabled', String(index === valueCards.length - 1));
}

previousValue.addEventListener('click', () => showValue(activeValue - 1));
nextValue.addEventListener('click', () => showValue(activeValue + 1));
valuesTrack.addEventListener('keydown', (event) => {
  const targets = {
    ArrowLeft: activeValue - 1,
    ArrowRight: activeValue + 1,
    Home: 0,
    End: valueCards.length - 1,
  };
  if (!(event.key in targets)) return;
  event.preventDefault();
  showValue(targets[event.key]);
});
valuesTrack.addEventListener('scroll', () => {
  const left = valuesTrack.scrollLeft;
  const index = valueCards.reduce((closest, card, current) =>
    Math.abs(card.offsetLeft - left) < Math.abs(valueCards[closest].offsetLeft - left) ? current : closest, 0);
  if (index === activeValue) return;
  updateValue(index);
}, { passive: true });
updateValue(0);
valuesControls.hidden = false;

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.1 });

  const targets = document.querySelectorAll(
    'main section > :is(h2, p), .hero-copy > *, .hero-art, .facts > li, .trust, ' +
    '.card, .product-card, .feature, .steps li, .values-intro, .value-card, .tile, .faq-list details, .quote',
  );
  targets.forEach((element, index) => {
    element.style.setProperty('--entry-delay', `${(index % 4) * 45}ms`);
    element.classList.add('scroll-entry');
    reveal.observe(element);
  });
}

document.querySelectorAll('.card, .product-card, .feature, .steps li, .facts li, .tile, .hero-art').forEach((element) => {
  element.classList.add('pointer-depth');
  element.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType !== 'mouse') return;
    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    element.style.setProperty('--light-x', `${x * 100}%`);
    element.style.setProperty('--light-y', `${y * 100}%`);
    element.style.setProperty('--tilt-x', `${(0.5 - y) * 6}deg`);
    element.style.setProperty('--tilt-y', `${(x - 0.5) * 6}deg`);
    element.style.setProperty('--shadow-x', `${(0.5 - x) * 22}px`);
  }, { passive: true });
});

const heroVideo = document.querySelector('.hero-art video');
if (heroVideo) {
  const endTitle = document.querySelector('.hero-end-title');
  function updateEndTitle() {
    endTitle.classList.toggle('is-visible',
      Number.isFinite(heroVideo.duration) && heroVideo.currentTime >= heroVideo.duration * 0.77);
  }

  function showFallback() {
    heroVideo.hidden = true;
    document.querySelector('.hero-fallback').hidden = false;
    endTitle.classList.remove('is-visible');
  }

  heroVideo.addEventListener('error', showFallback);
  if (heroVideo.error) showFallback();
  heroVideo.addEventListener('timeupdate', updateEndTitle);
  heroVideo.addEventListener('seeked', updateEndTitle);

  if ('IntersectionObserver' in window) {
    const videoVisibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.45) {
        heroVideo.pause();
        return;
      }
      if (motionPreference.matches || navigator.connection?.saveData || heroVideo.currentTime > 0 || heroVideo.ended) return;
      heroVideo.play().catch(() => {});
    }, { threshold: 0.45 });
    videoVisibility.observe(heroVideo);
  }
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) heroVideo.pause();
  });
}
