const heroSequence = document.querySelector('.hero-sequence');
const sequenceVideo = heroSequence.querySelector('.sequence-video');
const sequenceSource = sequenceVideo.dataset.source;

if (sequenceSource) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroStage = heroSequence.querySelector('.hero');
  const sequenceArt = heroSequence.querySelector('.sequence-art');
  const caption = heroSequence.querySelector('.sequence-caption');
  const sceneName = caption.querySelector('.sequence-name');
  const sceneCount = caption.querySelector('.sequence-count');
  const header = document.querySelector('header.top');
  const products = [
    'Borraccia', 'Tazza', 'Notebook', 'Penna', 'Shopper',
    'T-shirt', 'Sacca', 'Power bank', 'Lanyard', 'Ombrello',
  ];
  const framesPerSecond = 24;
  const framesPerProduct = 120;
  const totalFrames = products.length * framesPerProduct;
  let updateFrame = 0;
  let desiredFrame = 0;
  let requestedFrame = -1;
  let timeout;
  let active = false;

  function sizeStage() {
    const headerHeight = header.getBoundingClientRect().height;
    heroSequence.style.setProperty('--hero-header', `${headerHeight}px`);
    heroSequence.style.setProperty('--hero-height', `${Math.max(1, window.innerHeight - headerHeight)}px`);
  }

  function requestFrame() {
    if (!active || sequenceVideo.seeking || requestedFrame === desiredFrame) return;
    requestedFrame = desiredFrame;
    sequenceVideo.currentTime = (requestedFrame + 0.1) / framesPerSecond;
  }

  function updateSequence() {
    updateFrame = 0;
    if (!active) return;
    const bounds = heroSequence.getBoundingClientRect();
    const distance = heroSequence.offsetHeight - heroStage.offsetHeight;
    const hold = Math.max(140, window.innerHeight * 0.28);
    const traveled = header.getBoundingClientRect().bottom - bounds.top;
    const progress = Math.min(1, Math.max(0, traveled / Math.max(1, distance - hold)));
    desiredFrame = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
    requestFrame();
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
    requestFrame();
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

  function loadSequence() {
    if (reduced.matches || navigator.connection?.saveData) {
      showStaticHero();
      return;
    }
    sequenceVideo.preload = 'auto';
    sequenceVideo.hidden = false;
    sequenceVideo.src = sequenceSource;
    timeout = setTimeout(showStaticHero, 9000);
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
