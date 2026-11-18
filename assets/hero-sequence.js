const heroSequence = document.querySelector('.hero-sequence');
const sequenceVideo = heroSequence.querySelector('.sequence-video');
const { source: sequenceSource, products: productList } = sequenceVideo.dataset;

if (sequenceSource) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroStage = heroSequence.querySelector('.hero');
  const sequenceArt = heroSequence.querySelector('.sequence-art');
  const caption = heroSequence.querySelector('.sequence-caption');
  const sceneName = caption.querySelector('.sequence-name');
  const sceneCount = caption.querySelector('.sequence-count');
  const header = document.querySelector('header.top');
  const products = productList.split('|');
  heroSequence.style.setProperty('--chapter-count', products.length);
  const framesPerSecond = 24;
  const framesPerProduct = 120;
  const totalFrames = products.length * framesPerProduct;
  let updateFrame = 0;
  let displayedFrame = 0;
  let requestedFrame = -1;
  let timeout;
  let active = false;

  function sizeStage() {
    const headerHeight = header.getBoundingClientRect().height;
    heroSequence.style.setProperty('--hero-header', `${headerHeight}px`);
    heroSequence.style.setProperty('--hero-height', `${Math.max(1, window.innerHeight - headerHeight)}px`);
  }

  function updateSequence() {
    updateFrame = 0;
    if (!active || sequenceVideo.seeking) return;
    const bounds = heroSequence.getBoundingClientRect();
    const distance = heroSequence.offsetHeight - heroStage.offsetHeight;
    const hold = parseFloat(getComputedStyle(heroStage).scrollMarginBottom);
    const traveled = header.getBoundingClientRect().bottom - bounds.top;
    const progress = Math.min(1, Math.max(0, traveled / Math.max(1, distance - hold)));
    const targetFrame = progress * (totalFrames - 1);
    const remaining = targetFrame - displayedFrame;
    // Blend small wheel and touch steps. Large jumps should catch up in a single seek.
    displayedFrame = Math.abs(remaining) < 2 || Math.abs(remaining) > framesPerProduct
      ? targetFrame : displayedFrame + remaining * 0.62;
    const nextFrame = Math.round(displayedFrame);
    if (nextFrame === requestedFrame) {
      if (nextFrame !== Math.round(targetFrame)) scheduleUpdate();
      return;
    }
    requestedFrame = nextFrame;
    sequenceVideo.currentTime = (nextFrame + 0.1) / framesPerSecond;
  }

  function scheduleUpdate() {
    if (!updateFrame) updateFrame = requestAnimationFrame(updateSequence);
  }

  function showFrame() {
    const chapter = Math.floor(Math.max(0, requestedFrame) / framesPerProduct);
    sceneName.textContent = products[chapter];
    sceneCount.textContent = `${chapter + 1} / ${products.length}`;
    caption.style.setProperty('--sequence-progress', requestedFrame / (totalFrames - 1));
    sequenceArt.classList.add('has-frame');
    scheduleUpdate();
  }

  function showStaticHero() {
    clearTimeout(timeout);
    active = false;
    heroSequence.classList.remove('is-scrubbing');
    sequenceArt.classList.remove('has-frame');
    caption.hidden = true;
    sequenceVideo.hidden = true;
    requestedFrame = -1;
    if (sequenceVideo.hasAttribute('src')) {
      sequenceVideo.removeAttribute('src');
      sequenceVideo.load();
    }
  }

  function loadSource(source) {
    clearTimeout(timeout);
    active = false;
    requestedFrame = -1;
    displayedFrame = 0;
    sequenceVideo.preload = 'auto';
    sequenceVideo.hidden = false;
    sequenceVideo.src = source;
    timeout = setTimeout(showStaticHero, 9000);
  }

  function loadSequence() {
    if (reduced.matches || navigator.connection?.saveData) {
      showStaticHero();
    } else {
      loadSource(sequenceSource);
    }
  }

  sequenceVideo.addEventListener('loadeddata', () => {
    if (!sequenceVideo.hasAttribute('src') || reduced.matches) return;
    if (Math.abs(sequenceVideo.duration - totalFrames / framesPerSecond) > 0.3) {
      showStaticHero();
      return;
    }
    clearTimeout(timeout);
    active = true;
    sizeStage();
    heroSequence.classList.add('is-scrubbing');
    caption.hidden = false;
    scheduleUpdate();
  });
  sequenceVideo.addEventListener('seeked', () => { if (active) showFrame(); });
  sequenceVideo.addEventListener('error', showStaticHero);
  reduced.addEventListener('change', loadSequence);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => { sizeStage(); scheduleUpdate(); });
  sizeStage();
  loadSequence();
}
