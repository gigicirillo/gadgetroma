const heroSequence = document.querySelector('.hero-sequence');
const sequenceVideo = heroSequence.querySelector('.sequence-video');
const { source: sequenceSource } = sequenceVideo.dataset;

if (sequenceSource) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sequenceArt = heroSequence.querySelector('.sequence-art');
  const header = document.querySelector('header.top');
  const clipDuration = 5;
  const clipCount = 5;
  const lastFrameOffset = 1 / 24;
  let nextClip = 0;
  let clipEnd = 0;
  let frame = 0;
  let timeout;
  let ready = false;
  let playing = false;
  let lastWheel = -Infinity;
  let touchStart;
  let touchConsumed = false;

  function sizeStage() {
    const headerHeight = header.getBoundingClientRect().height;
    heroSequence.style.setProperty('--hero-height', `${Math.max(1, window.innerHeight - headerHeight)}px`);
  }

  function showStaticHero() {
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    ready = false;
    playing = false;
    nextClip = 0;
    sequenceVideo.pause();
    sequenceArt.classList.remove('has-frame');
    heroSequence.classList.remove('clip-navigation');
    sequenceVideo.hidden = true;
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

  function stopAtClipEnd() {
    if (!playing || sequenceVideo.currentTime < clipEnd - lastFrameOffset) return;
    sequenceVideo.pause();
    if (sequenceVideo.currentTime >= clipEnd) sequenceVideo.currentTime = clipEnd - lastFrameOffset * 0.5;
    playing = false;
    nextClip += 1;
    if (nextClip === clipCount) heroSequence.classList.remove('clip-navigation');
    cancelAnimationFrame(frame);
  }

  function watchPlayback() {
    stopAtClipEnd();
    if (playing) frame = requestAnimationFrame(watchPlayback);
  }

  function playNextClip() {
    if (playing) return;
    const clip = nextClip;
    clipEnd = (clip + 1) * clipDuration;
    playing = true;
    sequenceVideo.currentTime = clip * clipDuration;
    sequenceVideo.play().catch(() => {
      if (playing && nextClip === clip) showStaticHero();
    });
    frame = requestAnimationFrame(watchPlayback);
  }

  function canAdvance() {
    if (!ready || nextClip >= clipCount) return false;
    const { top, bottom } = heroSequence.getBoundingClientRect();
    const headerBottom = header.getBoundingClientRect().bottom;
    return top <= headerBottom + 1 && bottom > headerBottom + 1;
  }

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const newGesture = event.timeStamp - lastWheel > 160;
    lastWheel = event.timeStamp;
    if (event.deltaY <= 0 || !event.cancelable) return;
    if (!canAdvance()) {
      // Keep the tail of the final gesture from pulling the hero off screen.
      if (ready && nextClip === clipCount && !newGesture && heroSequence.getBoundingClientRect().bottom > innerHeight - 2) {
        event.preventDefault();
      }
      return;
    }
    event.preventDefault();
    if (newGesture) playNextClip();
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    touchStart = event.touches.length === 1 && canAdvance() ? event.touches[0] : undefined;
    touchConsumed = false;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (!touchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const delta = touchStart.clientY - touch.clientY;
    if (touchConsumed || (delta > 16 && delta > Math.abs(touch.clientX - touchStart.clientX))) {
      if (!event.cancelable) return;
      event.preventDefault();
      touchConsumed = true;
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (touchConsumed && canAdvance()) playNextClip();
    touchStart = undefined;
    touchConsumed = false;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    touchStart = undefined;
    touchConsumed = false;
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'PageDown', ' '].includes(event.key) || event.shiftKey || event.ctrlKey ||
        event.metaKey || event.altKey || event.target.closest?.('a, button, input, textarea, select, [contenteditable]')) return;
    if (!canAdvance()) return;
    event.preventDefault();
    if (!event.repeat) playNextClip();
  });

  sequenceVideo.addEventListener('loadeddata', () => {
    if (!sequenceVideo.hasAttribute('src') || reduced.matches) return;
    if (Math.abs(sequenceVideo.duration - clipCount * clipDuration) > 0.3) {
      showStaticHero();
      return;
    }
    clearTimeout(timeout);
    ready = true;
    sequenceArt.classList.add('has-frame');
    heroSequence.classList.add('clip-navigation');
  });
  sequenceVideo.addEventListener('timeupdate', stopAtClipEnd);
  sequenceVideo.addEventListener('ended', stopAtClipEnd);
  sequenceVideo.addEventListener('error', showStaticHero);
  reduced.addEventListener('change', loadSequence);
  window.addEventListener('resize', sizeStage);
  sizeStage();
  loadSequence();
}
