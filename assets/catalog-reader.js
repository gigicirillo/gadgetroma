const reader = document.querySelector('[data-reader]');

if (reader) {
  const ids = JSON.parse(reader.querySelector('[data-page-ids]').textContent);
  const controls = reader.querySelector('.reader-controls');
  const selector = controls.querySelector('select');
  const [previous, next] = controls.querySelectorAll('[data-step]');
  const page = reader.querySelector('.reader-page');
  const image = page.querySelector('img');
  const status = reader.querySelector('[role="status"]');
  const source = reader.querySelector('[data-source-page]');
  const title = document.querySelector('h1').textContent;
  let current = 0;

  function showPage(number) {
    if (!Number.isInteger(number) || number < 1 || number > ids.length || current === number) return;
    current = number;
    const id = ids[number - 1];
    const url = 'https://lh3.googleusercontent.com/d/' + id;
    selector.value = number;
    previous.disabled = number === 1;
    next.disabled = number === ids.length;
    image.alt = 'Pagina ' + number + ' del catalogo ' + title;
    image.src = url + '=w1600';
    page.href = url + '=w2200';
    source.href = 'https://drive.google.com/file/d/' + id + '/view';
    status.textContent = 'Pagina ' + number + ' di ' + ids.length;
  }

  function readHash() {
    const selected = Number(location.hash.match(/^#pagina-(\d+)$/)?.[1]);
    showPage(selected >= 1 && selected <= ids.length ? selected : 1);
  }

  function navigate(number) {
    if (number < 1 || number > ids.length) return;
    history.replaceState(null, '', '#pagina-' + number);
    showPage(number);
  }

  image.addEventListener('error', () => {
    status.textContent = 'Immagine non disponibile. Apri la pagina su Google Drive.';
  });
  previous.addEventListener('click', () => navigate(current - 1));
  next.addEventListener('click', () => navigate(current + 1));
  selector.addEventListener('change', () => navigate(Number(selector.value)));
  window.addEventListener('hashchange', readHash);
  controls.hidden = false;
  status.hidden = false;
  readHash();

  if (image.complete && !image.naturalWidth) {
    status.textContent = 'Immagine non disponibile. Apri la pagina su Google Drive.';
  }
}
