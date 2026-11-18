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
    'main section > :is(h2, p), .hero-copy > *, .facts > li, .trust, ' +
    '.card, .product-card, .feature, .steps li, .process-intro, .values-intro, .value-card, .review-heading, ' +
    '.tile, .faq-band h2, .faq-band .eyebrow, .faq-list details, .faq-band .button, .quote',
  );
  targets.forEach((element, index) => {
    element.style.setProperty('--entry-delay', `${(index % 4) * 45}ms`);
    element.classList.add('scroll-entry');
    reveal.observe(element);
  });
}

document.querySelectorAll('.card, .product-card, .feature, .steps li, .facts li, .tile, .faq-cubes details').forEach((element) => {
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

const processStory = document.querySelector('.process-story');
if (processStory) {
  const steps = [...processStory.querySelectorAll('.process-step')];
  const processIntro = processStory.querySelector('.process-intro');
  const processStage = processStory.querySelector('.process-stage');
  const pictures = [...processStage.querySelectorAll('img')];
  const wideLayout = window.matchMedia('(min-width: 850px)');
  let activeStep = 0;
  let frame;

  function updateProcess() {
    frame = undefined;
    if (!wideLayout.matches) {
      processStory.classList.remove('heading-over-image');
      return;
    }
    const stickyInset = parseFloat(getComputedStyle(processIntro).top);
    const stageReachesPin = processStory.getBoundingClientRect().top <= stickyInset + 1;
    processStory.classList.toggle('heading-over-image', stageReachesPin);

    const readingLine = window.innerHeight * 0.55;
    const current = steps.findIndex((step) => step.getBoundingClientRect().bottom >= readingLine);
    const nextStep = current === -1 ? steps.length - 1 : current;
    if (nextStep === activeStep) return;

    pictures[activeStep].classList.remove('active');
    steps[activeStep].removeAttribute('aria-current');
    pictures[nextStep].classList.add('active');
    steps[nextStep].setAttribute('aria-current', 'step');
    activeStep = nextStep;
  }

  function scheduleProcess() {
    if (frame === undefined) frame = requestAnimationFrame(updateProcess);
  }

  steps[0].setAttribute('aria-current', 'step');
  processStory.classList.add('enhanced');
  window.addEventListener('scroll', scheduleProcess, { passive: true });
  function measureProcess() {
    if (wideLayout.matches) {
      processIntro.style.setProperty('--process-heading-offset', `${processStage.offsetTop}px`);
    }
    scheduleProcess();
  }

  window.addEventListener('resize', measureProcess);
  new ResizeObserver(measureProcess).observe(processStory.querySelector('.process-heading'));
  measureProcess();
}

const reviewTrack = document.querySelector('#recensioni');
const reviewControls = document.querySelector('.review-controls');
if (reviewTrack && reviewControls) {
  const [previousReview, nextReview] = reviewControls.querySelectorAll('button');
  function updateReviewControls() {
    const { scrollLeft, clientWidth, scrollWidth } = reviewTrack;
    previousReview.setAttribute('aria-disabled', String(scrollLeft < 2));
    nextReview.setAttribute('aria-disabled', String(scrollLeft + clientWidth >= scrollWidth - 2));
  }
  reviewControls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-direction]');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    const [first, second] = reviewTrack.children;
    if (!second) return;
    const step = second.offsetLeft - first.offsetLeft;
    reviewTrack.scrollBy({
      left: step * Number(button.dataset.direction),
      behavior: motionPreference.matches ? 'instant' : 'smooth',
    });
  });
  reviewTrack.addEventListener('scroll', updateReviewControls, { passive: true });
  window.addEventListener('resize', updateReviewControls);
  updateReviewControls();
  reviewControls.hidden = false;
}
