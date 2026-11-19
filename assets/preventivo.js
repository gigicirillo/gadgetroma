const quoteForm = document.querySelector('#quote-form');

if (quoteForm) {
  const technique = quoteForm.elements.tecnica;
  const requested = new URLSearchParams(location.search).get('tecnica');
  if ([...technique.options].some((option) => option.value === requested)) technique.value = requested;

  const printOptions = document.querySelector('#quote-print');
  const updatePrintOptions = () => {
    const withoutPrint = quoteForm.elements.personalizzazione.value === 'No';
    printOptions.hidden = withoutPrint;
    printOptions.querySelectorAll('input, select').forEach((field) => {
      field.disabled = withoutPrint;
    });
  };
  if (technique.value) quoteForm.elements.personalizzazione.value = 'Sì';
  quoteForm.addEventListener('change', updatePrintOptions);
  updatePrintOptions();

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = new FormData(quoteForm);
    const fields = [
      ['Nome', 'nome'], ['Azienda o ente', 'azienda'], ['Email', 'email'], ['Telefono', 'telefono'],
      ['Sede dell’azienda', 'sede'], ['Come ci hai conosciuto', 'provenienza'],
      ['Personalizzazione', 'personalizzazione'], ['Quantità per articolo', 'quantita'],
      ['Budget (€)', 'budget'], ['Data desiderata', 'data'], ['Città di consegna', 'consegna'],
    ];
    const details = fields
      .filter(([, key]) => values.get(key).trim())
      .map(([label, key]) => `${label}: ${values.get(key).trim()}`);
    const colors = values.getAll('colori');
    if (colors.length) details.push(`Colori: ${colors.join(', ')}`);
    if (values.get('tecnica')) details.push(`Tecnica: ${technique.selectedOptions[0].text}`);
    const body = [...details, '', 'Progetto:', values.get('progetto').trim()].join('\r\n');
    document.querySelector('#testo-richiesta').value = body;
    document.querySelector('#quote-draft').hidden = false;
    document.querySelector('#quote-mail').href = `mailto:info@gadgetroma.com?subject=${encodeURIComponent('Richiesta preventivo GadgetRoma')}&body=${encodeURIComponent(body)}`;
    document.querySelector('#quote-mail').focus();
  });

  quoteForm.hidden = false;
}
