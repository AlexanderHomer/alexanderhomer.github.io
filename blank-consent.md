---
layout: default
title: Blank Consent PDF Filler
---

# Blank Consent PDF Filler

Use this page to fill the Blank Consent PDF and download a completed copy. All fields are optional; leave anything blank to keep it empty (or keep the PDF default values where provided).

<style>
  .consent-layout {
    display: grid;
    gap: 1.5rem;
    align-items: start;
  }

  .consent-form {
    display: grid;
    gap: 1.5rem;
    width: min(100%, 1100px);
  }

  .consent-form section {
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(255, 255, 255, 0.75);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  }

  .consent-form h2 {
    margin-top: 0;
    font-size: 1.25rem;
    letter-spacing: 0.01em;
  }

  .consent-form label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .consent-form input[type="text"],
  .consent-form textarea {
    width: 100%;
    padding: 0.5rem 0.7rem;
    box-sizing: border-box;
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .consent-form input[type="text"]:focus,
  .consent-form textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .consent-form textarea {
    min-height: 4.5rem;
    resize: vertical;
  }

  .consent-grid {
    display: grid;
    gap: 0.75rem;
  }

  .consent-grid.two {
    grid-template-columns: 1fr;
  }

  .consent-grid.three {
    grid-template-columns: 1fr;
  }

  .radio-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 0.15rem 0;
  }

  .radio-group label {
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .helper-text {
    margin-top: 0.35rem;
    color: #475569;
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
  }

  .actions button {
    border: none;
    border-radius: 999px;
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #2563eb;
    color: #fff;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
  }

  .actions button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .status {
    font-size: 0.95rem;
    color: #0f172a;
  }

  .textarea-stack {
    margin-top: 0.75rem;
    display: grid;
    gap: 0.75rem;
  }

  .template-panel {
    position: sticky;
    top: 1rem;
  }

  .template-card {
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
    display: grid;
    gap: 1rem;
  }

  .template-card h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .template-buttons {
    display: grid;
    gap: 0.75rem;
  }

  .template-controls {
    display: grid;
    gap: 0.75rem;
  }

  .template-search {
    display: grid;
    gap: 0.35rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .template-search input {
    padding: 0.5rem 0.7rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 0.95rem;
    font-family: inherit;
  }

  .template-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .template-tab {
    border: 1px solid rgba(148, 163, 184, 0.4);
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    background: #f1f5f9;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .template-tab[aria-selected="true"] {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
  }

  .template-buttons button {
    border: 1px solid rgba(148, 163, 184, 0.4);
    border-radius: 0.75rem;
    padding: 0.6rem 0.9rem;
    text-align: left;
    background: #f8fafc;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .template-buttons button:hover {
    background: #e2e8f0;
  }

  .template-meta {
    font-size: 0.9rem;
    color: #475569;
  }

  .template-clear {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.1rem;
    font-weight: 600;
    cursor: pointer;
    background: #0f172a;
    color: #fff;
  }

  .template-status {
    font-size: 0.9rem;
    color: #0f172a;
  }

  @media (prefers-color-scheme: dark) {
    .consent-form section {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(148, 163, 184, 0.2);
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.4);
    }

    .consent-form input[type="text"],
    .consent-form textarea {
      background: #0f172a;
      border-color: #334155;
      color: #e2e8f0;
    }

    .helper-text {
      color: #94a3b8;
    }

    .status {
      color: #e2e8f0;
    }

    .template-card {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(148, 163, 184, 0.2);
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.4);
    }

    .template-buttons button {
      background: #0f172a;
      border-color: #334155;
      color: #e2e8f0;
    }

    .template-buttons button:hover {
      background: #1e293b;
    }

    .template-search input {
      background: #0f172a;
      border-color: #334155;
      color: #e2e8f0;
    }

    .template-tab {
      background: #0f172a;
      border-color: #334155;
      color: #e2e8f0;
    }

    .template-tab[aria-selected="true"] {
      background: #2563eb;
      color: #fff;
      border-color: #2563eb;
    }

    .template-meta {
      color: #94a3b8;
    }

    .template-status {
      color: #e2e8f0;
    }
  }

  @media (min-width: 900px) {
    .consent-layout {
      grid-template-columns: minmax(0, 1fr) 260px;
    }
  }

  @media (max-width: 899px) {
    .template-panel {
      position: static;
    }
  }
</style>

<div class="consent-layout">
  <form id="consent-form" class="consent-form">
  <section>
    <h2>Procedure Details</h2>
    <div class="consent-grid two">
      <div class="field">
        <label for="procedure">Procedure</label>
        <input type="text" id="procedure" name="procedure" required />
      </div>
      <div class="field">
        <label for="site">Site</label>
        <input type="text" id="site" name="site" required />
      </div>
      <div class="field">
        <label>Side</label>
        <div class="radio-group">
          <label><input type="radio" name="side" value="Left" required /> Left</label>
          <label><input type="radio" name="side" value="Right" /> Right</label>
          <label><input type="radio" name="side" value="Bilateral" /> Bilateral</label>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Providers</h2>
    <div class="consent-grid two">
      <div class="field">
        <label for="primary-doctor">Attending Physician</label>
        <input type="text" id="primary-doctor" name="primary-doctor" required />
      </div>
      <div class="field">
        <label for="secondary-doctor">Secondary Doctor</label>
        <input type="text" id="secondary-doctor" name="secondary-doctor" />
      </div>
      <div class="field">
        <label for="physician-extenders">Residents Line 1</label>
        <input
          type="text"
          id="physician-extenders"
          name="physician-extenders"
          value="Drs. Hanna, Danis, Spagnuolo, Dalal"
        />
      </div>
      <div class="field">
        <label for="physician-extenders-2">Residents Line 2</label>
        <input
          type="text"
          id="physician-extenders-2"
          name="physician-extenders-2"
          value="Heiser, Chen, Fan, Smith, O'Brien, Doyel, and Homer"
        />
      </div>
    </div>
  </section>

  <section>
    <h2>Conditions</h2>
    <div class="consent-grid three">
      <div class="field">
        <label for="conditions-line-1">Conditions Line 1</label>
        <input type="text" id="conditions-line-1" name="conditions-line-1" required />
      </div>
      <div class="field">
        <label for="conditions-line-2">Conditions Line 2</label>
        <input type="text" id="conditions-line-2" name="conditions-line-2" />
      </div>
      <div class="field">
        <label for="conditions-line-3">Conditions Line 3</label>
        <input type="text" id="conditions-line-3" name="conditions-line-3" />
      </div>
    </div>
  </section>

  <section>
    <h2>Risks & Alternatives</h2>
    <div class="consent-grid three">
      <div class="field">
        <label for="risks-line-1">Risks Line 1</label>
        <input type="text" id="risks-line-1" name="risks-line-1" required />
      </div>
      <div class="field">
        <label for="risks-line-2">Risks Line 2</label>
        <input type="text" id="risks-line-2" name="risks-line-2" />
      </div>
      <div class="field">
        <label for="risks-line-3">Risks Line 3</label>
        <input type="text" id="risks-line-3" name="risks-line-3" />
      </div>
    </div>
    <div class="textarea-stack">
      <div class="field">
        <label for="additional-risks">Additional Risks</label>
        <textarea id="additional-risks" name="additional-risks"></textarea>
      </div>
      <div class="field">
        <label for="alternatives">Alternatives</label>
        <textarea id="alternatives" name="alternatives" required>No Procedure</textarea>
      </div>
    </div>
  </section>

  <section>
    <h2>Generate PDF</h2>
    <div class="actions">
      <button type="submit" id="download-button">Download Filled PDF</button>
      <span class="status" id="status">Ready to fill the PDF.</span>
    </div>
  </section>
</form>

  <aside class="template-panel">
    <div class="template-card">
      <h2>Templates</h2>
      <p class="template-meta">
        Load a template to auto-fill the consent form. Update the JSON file to add your own.
      </p>
      <div class="template-controls">
        <label class="template-search">
          Search templates
          <input
            type="search"
            id="template-search"
            placeholder="Search by label, procedure, or tag"
            autocomplete="off"
          />
        </label>
        <div class="template-tabs" id="template-tabs" role="tablist" aria-label="Template specialties"></div>
      </div>
      <div class="template-buttons" id="template-buttons"></div>
      <button type="button" class="template-clear" id="clear-form">Clear form</button>
      <div class="template-status" id="template-status">Templates ready.</div>
    </div>
  </aside>
</div>

<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
<script>
  const pdfUrl = "{{ '/blank-consent.pdf' | relative_url }}";
  const templatesUrl = "{{ '/consent-templates.json' | relative_url }}";
  const formEl = document.getElementById('consent-form');
  const statusEl = document.getElementById('status');
  const downloadButton = document.getElementById('download-button');
  const patientNameInput = document.getElementById('patient-name');
  const templateButtonsEl = document.getElementById('template-buttons');
  const templateStatusEl = document.getElementById('template-status');
  const clearFormButton = document.getElementById('clear-form');
  const templateSearchInput = document.getElementById('template-search');
  const templateTabsEl = document.getElementById('template-tabs');

  const inputSelectors = 'input[type="text"], textarea';
  const specialtyOrder = [
    'All',
    'Pediatrics',
    'Otology',
    'Rhinology',
    'Laryngology',
    'Head & Neck',
    'Facial Plastics',
    'General'
  ];
  let templatesData = [];
  let activeSpecialty = 'All';

  const fieldMap = [
    { id: 'procedure', name: 'Procedure' },
    { id: 'site', name: 'Site' },
    { id: 'primary-doctor', name: 'Primary Doctor' },
    { id: 'secondary-doctor', name: 'Secondary Doctor' },
    { id: 'primary-doctor', name: 'Autherized Doctor' },
    { id: 'primary-doctor', name: 'Attending Physician/Primary Operator' },
    { id: 'conditions-line-1', name: 'Conditions Line 1' },
    { id: 'conditions-line-2', name: 'Conditions Line 2' },
    { id: 'conditions-line-3', name: 'Conditions Line 3' },
    { id: 'pprocedure', name: 'Procedures Line 1' },
    { id: 'risks-line-1', name: 'Risks Line 1' },
    { id: 'risks-line-2', name: 'Risks Line 2' },
    { id: 'risks-line-3', name: 'Risks Line 3' },
    { id: 'alternatives', name: 'Alternatives' },
    { id: 'physician-extenders', name: 'Documentation Line 1' },
    { id: 'physician-extenders-2', name: 'Documentation Line 2' },
    { id: 'additional-risks', name: 'Additional Risks' }
  ];

  const checkboxFields = {
    Left: 'Left',
    Right: 'Right',
    Bilateral: 'Bilateral'
  };

  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#b91c1c' : '';
  }

  function setButtonState(isDisabled) {
    downloadButton.disabled = isDisabled;
  }

  function setTemplateStatus(message, isError = false) {
    templateStatusEl.textContent = message;
    templateStatusEl.style.color = isError ? '#b91c1c' : '';
  }

  function renderTabs(specialties) {
    templateTabsEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    specialties.forEach((specialty) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'template-tab';
      button.textContent = specialty;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', specialty === activeSpecialty ? 'true' : 'false');
      button.addEventListener('click', () => {
        activeSpecialty = specialty;
        renderTabs(specialties);
        renderTemplates();
      });
      fragment.appendChild(button);
    });
    templateTabsEl.appendChild(fragment);
  }

  function renderTemplates() {
    const searchTerm = templateSearchInput.value.trim().toLowerCase();
    const filtered = templatesData.filter((template) => {
      const matchesSpecialty =
        activeSpecialty === 'All' || template.specialties.includes(activeSpecialty);
      const label = (template.label ?? '').toLowerCase();
      const procedure = (template.fields?.procedure ?? '').toLowerCase();
      const tags = (template.tags ?? []).map((tag) => tag.toLowerCase());
      const matchesSearch =
        !searchTerm ||
        label.includes(searchTerm) ||
        procedure.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));
      return matchesSpecialty && matchesSearch;
    });

    templateButtonsEl.innerHTML = '';
    if (filtered.length === 0) {
      templateButtonsEl.innerHTML = '<p class="template-meta">No templates match this filter.</p>';
      setTemplateStatus('No templates to show.', true);
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach((template, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = template.label || `Template ${index + 1}`;
      button.addEventListener('click', () => {
        applyTemplate(template);
        setTemplateStatus(`Loaded: ${button.textContent}`);
      });
      fragment.appendChild(button);
    });
    templateButtonsEl.appendChild(fragment);
    setTemplateStatus(`Showing ${filtered.length} template${filtered.length === 1 ? '' : 's'}.`);
  }

  function setRadioValue(name, value) {
    if (!value) return;
    const radio = formEl.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
    }
  }

  function applyTemplate(template) {
    if (!template || !template.fields) return;
    Object.entries(template.fields).forEach(([fieldId, fieldValue]) => {
      if (fieldId === 'side') {
        setRadioValue('side', fieldValue);
        return;
      }
      const input = document.getElementById(fieldId);
      if (!input) return;
      input.value = fieldValue ?? '';
    });
  }

  function clearForm() {
    formEl.querySelectorAll(inputSelectors).forEach((input) => {
      if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea') {
        input.value = '';
      }
    });
    formEl.querySelectorAll('input[name="side"]').forEach((radio) => {
      radio.checked = false;
    });
  }

  async function loadTemplates() {
    templateButtonsEl.innerHTML = '';
    setTemplateStatus('Loading templates...');

    let response;
    try {
      response = await fetch(templatesUrl);
    } catch (error) {
      setTemplateStatus('Unable to load templates.', true);
      return;
    }

    if (!response.ok) {
      setTemplateStatus(`Unable to load templates (HTTP ${response.status}).`, true);
      return;
    }

    let templates;
    try {
      templates = await response.json();
    } catch (error) {
      setTemplateStatus('Templates file is not valid JSON.', true);
      return;
    }

    if (!Array.isArray(templates) || templates.length === 0) {
      setTemplateStatus('No templates found. Add some to the JSON file.', true);
      return;
    }

    templatesData = templates
      .map((template) => {
        const specialties = Array.isArray(template.specialties) && template.specialties.length
          ? template.specialties
          : Array.isArray(template.specialty)
            ? template.specialty
            : template.specialty
              ? [template.specialty]
              : ['General'];
        const tags = Array.isArray(template.tags) ? template.tags : [];
        return {
          ...template,
          specialties,
          tags
        };
      })
      .sort((a, b) => (a.label || '').localeCompare(b.label || ''));

    const specialties = Array.from(
      new Set(templatesData.flatMap((template) => template.specialties)),
    );
    const orderedSpecialties = specialtyOrder.filter(
      (specialty) => specialty === 'All' || specialties.includes(specialty),
    );
    activeSpecialty = 'All';
    renderTabs(orderedSpecialties);
    renderTemplates();
  }

  clearFormButton.addEventListener('click', () => {
    clearForm();
    setTemplateStatus('Form cleared.');
  });

  templateSearchInput.addEventListener('input', () => {
    renderTemplates();
  });

  loadTemplates();

  async function buildPdf() {
    setButtonState(true);
    setStatus('Loading PDF...');

    let response;
    try {
      response = await fetch(encodeURI(pdfUrl));
    } catch (error) {
      throw new Error(`Unable to load the PDF. Request failed before receiving a response.`);
    }

    if (!response.ok) {
      throw new Error(`Unable to load the PDF (HTTP ${response.status}).`);
    }

    const existingPdfBytes = await response.arrayBuffer();
    let pdfDoc;
    try {
      pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: true
      });
    } catch (error) {
      pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false
      });
    }
    const form = pdfDoc.getForm();
    const formFieldNames = new Set(form.getFields().map((field) => field.getName()));

    fieldMap.forEach((field) => {
      const input = document.getElementById(field.id);
      if (!input) return;
      const value = input.value.trim();
      if (!value) return;
      if (!formFieldNames.has(field.name)) return;
      const textField = form.getTextField(field.name);
      textField.setText(value);
    });

    const patientName = patientNameInput ? patientNameInput.value.trim() : '';
    if (patientName) {
      if (formFieldNames.has('Patient Name')) {
        const patientField = form.getTextField('Patient Name');
        patientField.setText(patientName);
      } else {
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const page = pages[2] ?? pages[pages.length - 1];
        if (page) {
          page.drawText(patientName, {
            x: 215,
            y: 157,
            size: 10,
            font,
            color: PDFLib.rgb(0, 0, 0)
          });
        }
      }
    }

    Object.values(checkboxFields).forEach((fieldName) => {
      if (!formFieldNames.has(fieldName)) return;
      const checkbox = form.getCheckBox(fieldName);
      checkbox.uncheck();
    });

    const selectedSide = formEl.querySelector('input[name="side"]:checked');
    if (selectedSide) {
      const fieldName = checkboxFields[selectedSide.value];
      if (formFieldNames.has(fieldName)) {
        const checkbox = form.getCheckBox(fieldName);
        checkbox.check();
      }
    }

    let updateFieldAppearances = true;
    try {
      form.flatten();
    } catch (error) {
      updateFieldAppearances = false;
      console.warn('Unable to flatten the PDF form fields.', error);
    }

    return await pdfDoc.save({ updateFieldAppearances });
  }

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const pdfBytes = await buildPdf();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Blank-Consent-Filled.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('PDF generated! Your download should begin automatically.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`There was a problem generating the PDF: ${message}`, true);
      console.error(error);
    } finally {
      setButtonState(false);
    }
  });
</script>
