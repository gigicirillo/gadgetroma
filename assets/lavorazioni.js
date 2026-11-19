const techniqueMedia = document.querySelectorAll('.technique-media');

techniqueMedia.forEach((media) => {
  const preview = media.querySelector('.technique-preview');
  preview.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    techniqueMedia.forEach((other) => {
      if (other === media) return;
      other.querySelector('iframe')?.remove();
      other.querySelector('.technique-preview').hidden = false;
    });

    const player = document.createElement('iframe');
    const url = new URL('https://www.youtube-nocookie.com/embed/' + media.dataset.videoId);
    url.searchParams.set('autoplay', '1');
    if (media.dataset.videoStart) url.searchParams.set('start', media.dataset.videoStart);
    player.src = url.href;
    player.title = media.dataset.videoTitle;
    player.allow = 'autoplay; encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    preview.hidden = true;
    media.append(player);
    player.focus();
  });
});
