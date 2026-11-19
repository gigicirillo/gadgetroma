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
  let activeClip = -1;
  let clipEnd = 0;
  let frame = 0;
  let timeout;
  let ready = false;
  let playing = false;
  let lastWheel = -Infinity;
  let lastWheelAdvance = -Infinity;
  let wheelTravel = 0;
  let wheelDirection = 0;
  let touchStart;
  let touchDirection = 0;

  function sizeStage() {
    const headerHeight = header.getBoundingClientRect().height;
    heroSequence.style.setProperty('--hero-height', `${Math.max(1, window.innerHeight - headerHeight)}px`);
  }

  function showStaticHero() {
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    ready = false;
    playing = false;
    activeClip = -1;
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
    if (!playing || sequenceVideo.seeking || sequenceVideo.currentTime < clipEnd - lastFrameOffset) return;
    sequenceVideo.pause();
    if (sequenceVideo.currentTime >= clipEnd) sequenceVideo.currentTime = clipEnd - lastFrameOffset * 0.5;
    playing = false;
    cancelAnimationFrame(frame);
  }

  function watchPlayback() {
    stopAtClipEnd();
    if (playing) frame = requestAnimationFrame(watchPlayback);
  }

  function playClip(direction) {
    cancelAnimationFrame(frame);
    const clip = Math.max(0, activeClip + direction);
    activeClip = clip;
    heroSequence.classList.toggle('clip-navigation', clip < clipCount - 1);
    clipEnd = (clip + 1) * clipDuration;
    playing = true;
    sequenceVideo.currentTime = clip * clipDuration;
    sequenceVideo.play().catch((error) => {
      if (error.name !== 'AbortError' && playing && activeClip === clip) showStaticHero();
    });
    frame = requestAnimationFrame(watchPlayback);
  }

  function inHero() {
    if (!ready) return false;
    const { top, bottom } = heroSequence.getBoundingClientRect();
    const headerBottom = header.getBoundingClientRect().bottom;
    return top <= headerBottom + 1 && bottom > headerBottom + 1;
  }

  function canPlay(direction) {
    return direction !== 0 && inHero() &&
      (direction > 0 ? activeClip < clipCount - 1 : activeClip > 0);
  }

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const direction = Math.sign(event.deltaY);
    const newGesture = direction !== wheelDirection || event.timeStamp - lastWheel > 160;
    lastWheel = event.timeStamp;
    wheelDirection = direction;
    if (newGesture) wheelTravel = 0;
    if (!event.cancelable) return;

    const pixelsPerUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    wheelTravel += Math.abs(event.deltaY) * pixelsPerUnit;
    const advance = newGesture || (event.timeStamp - lastWheelAdvance >= 360 && wheelTravel >= 240);
    if (!canPlay(direction)) {
      if (direction > 0 && inHero() && activeClip === clipCount - 1 && !advance &&
          heroSequence.getBoundingClientRect().bottom > innerHeight - 2) {
        event.preventDefault();
      }
      return;
    }
    event.preventDefault();
    if (advance) {
      lastWheelAdvance = event.timeStamp;
      wheelTravel = 0;
      playClip(direction);
    }
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    touchStart = event.touches.length === 1 && inHero() ? event.touches[0] : undefined;
    touchDirection = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (!touchStart || event.touches.length !== 1 || !event.cancelable) return;
    const touch = event.touches[0];
    const delta = touchStart.clientY - touch.clientY;
    if (touchDirection) {
      event.preventDefault();
    } else if (Math.abs(delta) > Math.max(16, Math.abs(touch.clientX - touchStart.clientX)) &&
               canPlay(Math.sign(delta))) {
      event.preventDefault();
      touchDirection = Math.sign(delta);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (canPlay(touchDirection)) playClip(touchDirection);
    touchStart = undefined;
    touchDirection = 0;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    touchStart = undefined;
    touchDirection = 0;
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey ||
        event.target.closest?.('a, button, input, textarea, select, [contenteditable]')) return;
    let direction = 0;
    if (event.key === ' ') direction = event.shiftKey ? -1 : 1;
    else if (!event.shiftKey && ['ArrowDown', 'PageDown'].includes(event.key)) direction = 1;
    else if (!event.shiftKey && ['ArrowUp', 'PageUp'].includes(event.key)) direction = -1;
    if (!canPlay(direction)) return;
    event.preventDefault();
    if (!event.repeat) playClip(direction);
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
