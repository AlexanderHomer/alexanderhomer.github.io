---
layout: default
---

# Medication Handoff Cleaner

Paste a medication list below to create a clean handoff-ready list that keeps only generic names and removes routes, doses, rates, and status flags.

## Input

<textarea id="med-input" rows="14" style="width: 100%; max-width: 900px;">
Scheduled Meds:
dilTIAZem, 30 mg, g-tube, q6h SCH
[Held by provider] doxazosin, 2 mg, nasogastric tube, Daily
ezetimibe, 10 mg, g-tube, Nightly
folic acid, 1 mg, g-tube, Daily
metoprolol tartrate, 50 mg, g-tube, q6h
multivitamin, 1 each, g-tube, Daily
[Held by provider] OLANZapine, 2.5 mg, g-tube, Nightly
ondansetron, 4 mg, intravenous, Once
pantoprazole, 40 mg, intravenous, BID
polyethylene glycol, 3,000 mL, g-tube, Once
[Held by provider] propranolol, 10 mg, nasogastric tube, q8h SCH
ramelteon, 8 mg, nasogastric tube, Nightly
rosuvastatin, 40 mg, g-tube, Nightly
sodium chloride 0.9 %, 10 mL, intra-catheter, q8h

Continuous Infusions: lactated Ringer's, 100 mL/hr, Last Rate: 100 mL/hr (01/30/26 0906)
norEPINEPHrine, 0-1 mcg/kg/min (Adjusted)

PRN Meds: PRN medications: acetaminophen, alteplase, docusate sodium, glucagon, OLANZapine, OLANZapine, [COMPLETED] Insert peripheral IV **AND** [COMPLETED] Saline lock IV **AND** sodium chloride 0.9 %, sodium chloride 0.9 %, sodium chloride 0.9 %, traZODone
</textarea>

<div style="margin: 1rem 0; display: flex; gap: 0.75rem; flex-wrap: wrap;">
  <button id="clean-button" style="padding: 0.5rem 1rem;">Clean meds</button>
  <button id="copy-button" style="padding: 0.5rem 1rem;">Copy output</button>
</div>

## Cleaned Output

<pre id="med-output" style="white-space: pre-wrap; background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 0.5rem; max-width: 900px;"></pre>

<script>
  const inputEl = document.getElementById('med-input');
  const outputEl = document.getElementById('med-output');
  const cleanButton = document.getElementById('clean-button');
  const copyButton = document.getElementById('copy-button');

  const EXCLUDED_PHRASES = [
    'insert peripheral iv',
    'saline lock iv',
  ];

  function normalizeName(name) {
    return name
      .replace(/\*+/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\b\d+(?:\.\d+)?\s*(?:%|mcg|mg|g|kg|ml|mL|units|unit)\b/gi, '')
      .replace(/\s+\d+(?:\.\d+)?$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+[,.;:]/g, '')
      .trim();
  }

  function cleanLine(line) {
    let working = line.replace(/\[[^\]]*\]/g, '').trim();
    if (!working) return [];

    if (/^scheduled meds/i.test(working) || /^continuous infusions/i.test(working) || /^prn meds/i.test(working)) {
      const parts = working.split(':');
      if (parts.length > 1) {
        working = parts.slice(1).join(':').trim();
      }
    }

    if (!working) return [];

    const normalized = working.replace(/\*\*AND\*\*/gi, ',');

    if (/prn medications/i.test(normalized)) {
      const prnParts = normalized.split(':');
      working = prnParts.slice(1).join(':').trim();
    } else {
      working = normalized;
    }

    const segments = working.split(',').map((segment) => segment.trim()).filter(Boolean);
    if (segments.length === 0) return [];

    if (segments.length > 1 && !/prn medications/i.test(normalized)) {
      return [segments[0]];
    }

    return segments;
  }

  function cleanMedList(text) {
    const seen = new Set();
    const results = [];

    text.split(/\r?\n/).forEach((rawLine) => {
      const names = cleanLine(rawLine);
      names.forEach((name) => {
        const normalized = normalizeName(name.toLowerCase());
        if (!normalized) return;
        if (EXCLUDED_PHRASES.some((phrase) => normalized.includes(phrase))) return;
        if (!seen.has(normalized)) {
          seen.add(normalized);
          results.push(normalized);
        }
      });
    });

    return results;
  }

  function renderOutput(list) {
    if (list.length === 0) {
      outputEl.textContent = 'No medications found.';
      return;
    }

    outputEl.textContent = list.map((name) => `- ${name}`).join('\n');
  }

  cleanButton.addEventListener('click', () => {
    const cleaned = cleanMedList(inputEl.value);
    renderOutput(cleaned);
  });

  copyButton.addEventListener('click', async () => {
    const text = outputEl.textContent;
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy output';
      }, 1500);
    } catch (err) {
      copyButton.textContent = 'Copy failed';
      setTimeout(() => {
        copyButton.textContent = 'Copy output';
      }, 1500);
    }
  });

  renderOutput(cleanMedList(inputEl.value));
</script>
