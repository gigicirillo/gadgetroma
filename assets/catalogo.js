const catalogSearch = document.querySelector('.catalog-search');

if (catalogSearch) {
  const input = catalogSearch.querySelector('input');
  const status = catalogSearch.querySelector('.catalog-search-status');
  const cards = [...document.querySelectorAll('[data-catalog-card]')];
  const groups = [...document.querySelectorAll('[data-catalog-group]')];
  const sections = [...document.querySelectorAll('[data-catalog-section]')];
  const normalize = (value) => value.toLocaleLowerCase('it').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const names = cards.map((card) => normalize(card.dataset.search));

  function filterCatalog() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    cards.forEach((card, i) => {
      card.hidden = !terms.every((term) => names[i].includes(term));
    });
    groups.forEach((group) => { group.hidden = !group.querySelector('[data-catalog-card]:not([hidden])'); });
    sections.forEach((section) => { section.hidden = !section.querySelector('[data-catalog-group]:not([hidden])'); });
    const visible = cards.filter((card) => !card.hidden).length;
    status.textContent = !terms.length ? '' : visible === 0
      ? 'Nessun catalogo corrispondente. Prova con un altro termine.'
      : visible === 1 ? '1 catalogo trovato.' : `${visible} cataloghi trovati.`;
  }

  input.addEventListener('input', filterCatalog);
  document.querySelector('.catalog-index nav').addEventListener('click', (event) => {
    if (event.target.closest('a') && input.value) {
      input.value = '';
      filterCatalog();
    }
  });
  catalogSearch.hidden = false;
}
