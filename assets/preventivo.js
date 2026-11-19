const quoteForm = document.querySelector('#quote-form');

if (quoteForm) {
  const technique = quoteForm.elements.tecnica;
  const requested = new URLSearchParams(location.search).get('tecnica');
  if ([...technique.options].some((option) => option.value === requested)) technique.value = requested;

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = new FormData(quoteForm);
    const fields = [
      ['Nome', 'nome'], ['Azienda o ente', 'azienda'], ['Email', 'email'], ['Telefono', 'telefono'],
      ['Quantità', 'quantita'], ['Budget (€)', 'budget'], ['Data desiderata', 'data'],
    ];
    const details = fields
      .filter(([, key]) => values.get(key).trim())
      .map(([label, key]) => `${label}: ${values.get(key).trim()}`);
    if (technique.value) details.push(`Tecnica: ${technique.selectedOptions[0].text}`);
    const body = [...details, '', 'Progetto:', values.get('progetto').trim()].join('\r\n');
    document.querySelector('#testo-richiesta').value = body;
    document.querySelector('#quote-draft').hidden = false;
    document.querySelector('#quote-mail').href = `mailto:info@gadgetroma.com?subject=${encodeURIComponent('Richiesta preventivo GadgetRoma')}&body=${encodeURIComponent(body)}`;
    document.querySelector('#quote-mail').focus();
  });

  quoteForm.hidden = false;
}
