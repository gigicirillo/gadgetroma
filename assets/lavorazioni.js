const techniqueVideos = document.querySelectorAll('.technique-card video');

techniqueVideos.forEach((video) => {
  video.addEventListener('play', () => {
    techniqueVideos.forEach((other) => {
      if (other !== video) other.pause();
    });
  });
});
