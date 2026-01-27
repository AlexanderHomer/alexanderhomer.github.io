---
layout: default
title: Blank Consent PDF Filler
---

# Blank Consent PDF Filler

Use this page to fill the Blank Consent PDF and download a completed copy. All fields are optional; leave anything blank to keep it empty (or keep the PDF default values where provided).

<style>
  .consent-form {
    display: grid;
    gap: 1.5rem;
    max-width: 860px;
  }

  .consent-form section {
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(255, 255, 255, 0.75);
  }

  .consent-form h2 {
    margin-top: 0;
  }

  .consent-form label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.35rem;
  }

  .consent-form input[type="text"],
  .consent-form textarea {
    width: 100%;
    padding: 0.55rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 1rem;
    font-family: inherit;
  }

  .consent-form textarea {
    min-height: 4.5rem;
    resize: vertical;
  }

  .consent-grid {
    display: grid;
    gap: 1rem;
  }

  .consent-grid.two {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .consent-grid.three {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .radio-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
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

  @media (prefers-color-scheme: dark) {
    .consent-form section {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(148, 163, 184, 0.2);
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
  }
</style>

<form class="consent-form" id="consent-form">
  <section>
    <h2>Procedure Details</h2>
    <div class="consent-grid two">
      <div>
        <label for="procedure">Procedure</label>
        <input type="text" id="procedure" name="procedure" />
      </div>
      <div>
        <label for="site">Site</label>
        <input type="text" id="site" name="site" />
      </div>
      <div>
        <label>Side</label>
        <div class="radio-group">
          <label><input type="radio" name="side" value="Left" /> Left</label>
          <label><input type="radio" name="side" value="Right" /> Right</label>
          <label><input type="radio" name="side" value="Bilateral" /> Bilateral</label>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Providers</h2>
    <div class="consent-grid two">
      <div>
        <label for="primary-doctor">Primary Doctor</label>
        <input type="text" id="primary-doctor" name="primary-doctor" />
      </div>
      <div>
        <label for="secondary-doctor">Secondary Doctor</label>
        <input type="text" id="secondary-doctor" name="secondary-doctor" />
      </div>
      <div>
        <label for="authorized-doctor">Authorized Doctor</label>
        <input type="text" id="authorized-doctor" name="authorized-doctor" />
      </div>
      <div>
        <label for="attending">Attending Physician / Primary Operator</label>
        <input type="text" id="attending" name="attending" />
      </div>
    </div>
  </section>

  <section>
    <h2>Conditions</h2>
    <div class="consent-grid three">
      <div>
        <label for="conditions-line-1">Conditions Line 1</label>
        <input type="text" id="conditions-line-1" name="conditions-line-1" />
      </div>
      <div>
        <label for="conditions-line-2">Conditions Line 2</label>
        <input type="text" id="conditions-line-2" name="conditions-line-2" />
      </div>
      <div>
        <label for="conditions-line-3">Conditions Line 3</label>
        <input type="text" id="conditions-line-3" name="conditions-line-3" />
      </div>
    </div>
  </section>

  <section>
    <h2>Procedures</h2>
    <div class="consent-grid three">
      <div>
        <label for="procedures-line-1">Procedures Line 1</label>
        <input type="text" id="procedures-line-1" name="procedures-line-1" />
      </div>
      <div>
        <label for="procedures-line-2">Procedures Line 2</label>
        <input type="text" id="procedures-line-2" name="procedures-line-2" />
      </div>
      <div>
        <label for="procedures-line-3">Procedures Line 3</label>
        <input type="text" id="procedures-line-3" name="procedures-line-3" />
      </div>
    </div>
  </section>

  <section>
    <h2>Risks & Alternatives</h2>
    <div class="consent-grid three">
      <div>
        <label for="risks-line-1">Risks Line 1</label>
        <input type="text" id="risks-line-1" name="risks-line-1" />
      </div>
      <div>
        <label for="risks-line-2">Risks Line 2</label>
        <input type="text" id="risks-line-2" name="risks-line-2" />
      </div>
      <div>
        <label for="risks-line-3">Risks Line 3</label>
        <input type="text" id="risks-line-3" name="risks-line-3" />
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <label for="additional-risks">Additional Risks</label>
      <textarea id="additional-risks" name="additional-risks"></textarea>
    </div>
    <div style="margin-top: 1rem;">
      <label for="alternatives">Alternatives</label>
      <textarea id="alternatives" name="alternatives"></textarea>
    </div>
  </section>

  <section>
    <h2>Documentation Lines</h2>
    <p class="helper-text">Leave blank to keep the default list on the PDF.</p>
    <div class="consent-grid three">
      <div>
        <label for="documentation-line-1">Documentation Line 1</label>
        <input type="text" id="documentation-line-1" name="documentation-line-1" />
      </div>
      <div>
        <label for="documentation-line-2">Documentation Line 2</label>
        <input type="text" id="documentation-line-2" name="documentation-line-2" />
      </div>
      <div>
        <label for="documentation-line-3">Documentation Line 3</label>
        <input type="text" id="documentation-line-3" name="documentation-line-3" />
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

<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
<script>
  const pdfUrl = "{{ '/Blank Consent.pdf' | relative_url }}";
  const formEl = document.getElementById('consent-form');
  const statusEl = document.getElementById('status');
  const downloadButton = document.getElementById('download-button');

  const fieldMap = [
    { id: 'procedure', name: 'Procedure' },
    { id: 'site', name: 'Site' },
    { id: 'primary-doctor', name: 'Primary Doctor' },
    { id: 'secondary-doctor', name: 'Secondary Doctor' },
    { id: 'authorized-doctor', name: 'Autherized Doctor' },
    { id: 'attending', name: 'Attending Physician/Primary Operator' },
    { id: 'conditions-line-1', name: 'Conditions Line 1' },
    { id: 'conditions-line-2', name: 'Conditions Line 2' },
    { id: 'conditions-line-3', name: 'Conditions Line 3' },
    { id: 'procedures-line-1', name: 'Procedures Line 1' },
    { id: 'procedures-line-2', name: 'Procedures Line 2' },
    { id: 'procedures-line-3', name: 'Procedures Line 3' },
    { id: 'risks-line-1', name: 'Risks Line 1' },
    { id: 'risks-line-2', name: 'Risks Line 2' },
    { id: 'risks-line-3', name: 'Risks Line 3' },
    { id: 'alternatives', name: 'Alternatives' },
    { id: 'documentation-line-1', name: 'Documentation Line 1' },
    { id: 'documentation-line-2', name: 'Documentation Line 2' },
    { id: 'documentation-line-3', name: 'Documentation Line 3' },
    { id: 'additional-risks', name: 'Additional Risks' }
  ];

  const checkboxFields = {
    Left: 'Left',
    Right: 'Right',
    Bilateral: 'Bilateral'
  };

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function setButtonState(isDisabled) {
    downloadButton.disabled = isDisabled;
  }

  function getFieldMap(form) {
    const fields = form.getFields();
    const map = new Map();
    fields.forEach((field) => {
      map.set(field.getName(), field);
    });
    return map;
  }

  async function buildPdf() {
    setButtonState(true);
    setStatus('Loading PDF...');

    const response = await fetch(encodeURI(pdfUrl));
    if (!response.ok) {
      throw new Error('Unable to load the PDF.');
    }

    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const pdfFields = getFieldMap(form);

    fieldMap.forEach((field) => {
      const input = document.getElementById(field.id);
      if (!input) return;
      const value = input.value.trim();
      if (!value) return;
      const pdfField = pdfFields.get(field.name);
      if (!pdfField || !(pdfField instanceof PDFLib.PDFTextField)) {
        console.warn(`Missing or non-text field: ${field.name}`);
        return;
      }
      pdfField.setText(value);
    });

    Object.values(checkboxFields).forEach((fieldName) => {
      const pdfField = pdfFields.get(fieldName);
      if (!pdfField || !(pdfField instanceof PDFLib.PDFCheckBox)) {
        console.warn(`Missing or non-checkbox field: ${fieldName}`);
        return;
      }
      pdfField.uncheck();
    });

    const selectedSide = formEl.querySelector('input[name="side"]:checked');
    if (selectedSide) {
      const fieldName = checkboxFields[selectedSide.value];
      const pdfField = pdfFields.get(fieldName);
      if (pdfField && pdfField instanceof PDFLib.PDFCheckBox) {
        pdfField.check();
      } else {
        console.warn(`Missing checkbox field: ${fieldName}`);
      }
    }

    form.flatten();
    return await pdfDoc.save();
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
      setStatus(`There was a problem generating the PDF: ${message}`);
      console.error('PDF generation error:', error);
    } finally {
      setButtonState(false);
    }
  });
</script>
