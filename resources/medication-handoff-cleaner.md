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

  const PRN_EXCLUDED = new Set(['sodium chloride', 'glucagon']);

  const ANTIBIOTICS = new Set([
    'amoxicillin',
    'amoxicillin-clavulanate',
    'ampicillin',
    'azithromycin',
    'cefazolin',
    'cefepime',
    'cefixime',
    'cefotaxime',
    'cefotetan',
    'cefoxitin',
    'cefpodoxime',
    'ceftaroline',
    'ceftazidime',
    'ceftriaxone',
    'cefuroxime',
    'cephalexin',
    'ciprofloxacin',
    'clindamycin',
    'daptomycin',
    'doxycycline',
    'ertapenem',
    'gentamicin',
    'levofloxacin',
    'linezolid',
    'meropenem',
    'metronidazole',
    'moxifloxacin',
    'nafcillin',
    'piperacillin-tazobactam',
    'rifampin',
    'trimethoprim-sulfamethoxazole',
    'vancomycin',
  ]);

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

  function identifySection(line) {
    const trimmed = line.trim();
    if (/^scheduled meds/i.test(trimmed)) {
      return { section: 'Scheduled', remainder: trimmed.split(':').slice(1).join(':').trim() };
    }
    if (/^continuous infusions/i.test(trimmed)) {
      return { section: 'Continuous', remainder: trimmed.split(':').slice(1).join(':').trim() };
    }
    if (/^prn meds/i.test(trimmed)) {
      return { section: 'PRN', remainder: trimmed.split(':').slice(1).join(':').trim() };
    }
    return null;
  }

  function classifyMedication(name, sectionHint) {
    if (name === 'lactated ringer\'s') {
      return 'IVF';
    }
    if (ANTIBIOTICS.has(name)) {
      return 'ID';
    }
    return sectionHint;
  }

  function cleanLine(line, allowMultiple) {
    let working = line.replace(/\[[^\]]*\]/g, '').trim();
    if (!working) return [];

    const normalized = working.replace(/\*\*AND\*\*/gi, ',');
    working = normalized;

    if (/prn medications/i.test(working)) {
      const prnParts = working.split(':');
      working = prnParts.slice(1).join(':').trim();
    }

    const segments = working.split(',').map((segment) => segment.trim()).filter(Boolean);
    if (segments.length === 0) return [];

    if (!allowMultiple && segments.length > 1) {
      return [segments[0]];
    }

    return segments;
  }

  function cleanMedList(text) {
    const seen = {
      Scheduled: new Set(),
      Continuous: new Set(),
      IVF: new Set(),
      ID: new Set(),
      PRN: new Set(),
    };
    const results = {
      Scheduled: [],
      Continuous: [],
      IVF: [],
      ID: [],
      PRN: [],
    };
    let currentSection = 'Scheduled';

    text.split(/\r?\n/).forEach((rawLine) => {
      const sectionInfo = identifySection(rawLine);
      let lineToParse = rawLine;
      if (sectionInfo) {
        currentSection = sectionInfo.section;
        lineToParse = sectionInfo.remainder;
      }

      if (!lineToParse.trim()) return;

      const allowMultiple = currentSection === 'PRN';
      const names = cleanLine(lineToParse, allowMultiple);
      names.forEach((name) => {
        const normalized = normalizeName(name.toLowerCase());
        if (!normalized) return;
        if (EXCLUDED_PHRASES.some((phrase) => normalized.includes(phrase))) return;
        const resolvedSection = classifyMedication(normalized, currentSection);
        if (resolvedSection === 'PRN' && PRN_EXCLUDED.has(normalized)) return;
        if (!seen[resolvedSection].has(normalized)) {
          seen[resolvedSection].add(normalized);
          results[resolvedSection].push(normalized);
        }
      });
    });

    return results;
  }

  function renderOutput(listBySection) {
    const sections = ['Scheduled', 'Continuous', 'IVF', 'ID', 'PRN'];
    const lines = sections
      .map((section) => {
        const meds = listBySection[section];
        if (!meds || meds.length === 0) return null;
        return `${section}: ${meds.join(', ')}`;
      })
      .filter(Boolean);

    if (lines.length === 0) {
      outputEl.textContent = 'No medications found.';
      return;
    }

    outputEl.textContent = lines.join('\n');
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
