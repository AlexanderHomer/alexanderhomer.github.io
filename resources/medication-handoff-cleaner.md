---
layout: default
---

# Medication Handoff Cleaner

Paste a medication list below to create a clean handoff-ready list that keeps only generic names and removes routes, doses, rates, and status flags.

## Input

<textarea id="med-input" rows="14" style="width: 100%; max-width: 900px;">
Scheduled Meds:
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
  let conversionsMap = {};
  let conversionsLoaded = false;
  let antimicrobialsLoaded = false;
  const ANTIBIOTICS = new Set();
  const ANTIFUNGALS = new Set();
  const ANTIVIRALS = new Set();

  const EXCLUDED_PHRASES = [
    'insert peripheral iv',
    'saline lock iv',
    'heparin flush',
  ];

  const PRN_EXCLUDED = new Set(['sodium chloride', 'glucagon']);

  const IVF = new Set([
    'lactated ringer\'s',
    'sodium chloride'
  ])

  const INSULIN_KEYWORDS = [
    'insulin',
    'humalog',
    'lispro',
    'aspart',
    'novolog',
    'glargine',
    'lantus',
    'detemir',
    'levemir',
    'nph',
  ];
  
  const ANTICOAG_LABELS = {
    SQH: 'SQH',
    LVX: 'LVX',
    HEPARIN_GTT: 'heparin gtt',
    BIVAL: 'bival',
  };

  async function loadConversions() {
    if (conversionsLoaded) {
      return;
    }
    try {
      const response = await fetch('/resources/medication-handoff-conversions.json');
      if (!response.ok) {
        conversionsLoaded = true;
        return;
      }
      const data = await response.json();
      if (data && typeof data === 'object') {
        if (data.conversions && typeof data.conversions === 'object') {
          conversionsMap = data.conversions;
          conversionsLoaded = true;
          return;
        }
        conversionsMap = data;
      }
      conversionsLoaded = true;
    } catch (error) {
      conversionsMap = {};
      conversionsLoaded = true;
    }
  }

  async function loadAntimicrobials() {
    if (antimicrobialsLoaded) {
      return;
    }
    try {
      const response = await fetch('/resources/medication-handoff-antimicrobials.json');
      if (!response.ok) {
        antimicrobialsLoaded = true;
        return;
      }
      const data = await response.json();
      if (data && typeof data === 'object') {
        const antibiotics = Array.isArray(data.antibiotics) ? data.antibiotics : [];
        const antifungals = Array.isArray(data.antifungals) ? data.antifungals : [];
        const antivirals = Array.isArray(data.antivirals) ? data.antivirals : [];
        antibiotics.forEach((name) => ANTIBIOTICS.add(String(name).toLowerCase()));
        antifungals.forEach((name) => ANTIFUNGALS.add(String(name).toLowerCase()));
        antivirals.forEach((name) => ANTIVIRALS.add(String(name).toLowerCase()));
      }
      antimicrobialsLoaded = true;
    } catch (error) {
      antimicrobialsLoaded = true;
    }
  }

  function applyConversion(name) {
    const converted = conversionsMap[name];
    if (!converted) {
      return name;
    }
    return normalizeName(String(converted).toLowerCase());
  }

  function normalizeName(name) {
    return name
      .replace(/\*+/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\b\d+(?:\.\d+)?\s*%/gi, '')
      .replace(/\b\d+(?:\.\d+)?\s*(?:%|mcg|mg|g|kg|ml|mL|units|unit)\b/gi, '')
      .replace(/\s+\d+(?:\.\d+)?$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+[,.;:]/g, '')
      .trim();
  }

  function extractAnticoagEntry(line, held) {
    const lowered = line.toLowerCase();
    if (lowered.includes('heparin') && lowered.includes('flush')) {
      return null;
    }
    if (/(bivalirudin|\bbival\b)/i.test(lowered)) {
      return {
        section: 'Anticoagulation',
        displayName: held ? `${ANTICOAG_LABELS.BIVAL} (held)` : ANTICOAG_LABELS.BIVAL,
      };
    }
    if (/heparin/i.test(lowered) && /(gtt|drip|infusion|continuous)/i.test(lowered)) {
      return {
        section: 'Anticoagulation',
        displayName: held ? `${ANTICOAG_LABELS.HEPARIN_GTT} (held)` : ANTICOAG_LABELS.HEPARIN_GTT,
      };
    }
    if (/(enoxaparin|lovenox)/i.test(lowered)) {
      return {
        section: 'Anticoagulation',
        displayName: held ? `${ANTICOAG_LABELS.LVX} (held)` : ANTICOAG_LABELS.LVX,
      };
    }
    if (/heparin/i.test(lowered) && /(subcutaneous|\bsq\b|\bsc\b)/i.test(lowered)) {
      return {
        section: 'Anticoagulation',
        displayName: held ? `${ANTICOAG_LABELS.SQH} (held)` : ANTICOAG_LABELS.SQH,
      };
    }
    return null;
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

  function extractInsulinEntry(line, held) {
    const lowered = line.toLowerCase();
    const isInsulin = INSULIN_KEYWORDS.some((keyword) => lowered.includes(keyword));
    if (!isInsulin) return null;

    const isSlidingScale = /sliding scale|\biss\b/i.test(line)
      || /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?\s*(?:units?|u)\b/i.test(line);

    if (isSlidingScale) {
      return {
        section: 'Scheduled',
        displayName: held ? 'ISS (held)' : 'ISS',
      };
    }

    const doseMatch = line.match(/\b\d+(?:\.\d+)?\s*(?:units?|u)\b/i);
    const timingMatch = line.match(/\b(?:q\d+h|q\d+hr|q\d+hrs|qhs|qam|qpm|bid|tid|qid|qod|daily|nightly|weekly)\b/i);
    const dose = doseMatch ? doseMatch[0].toLowerCase().replace(/\s+/g, ' ') : null;
    const timing = timingMatch ? timingMatch[0].toUpperCase() : null;

    let displayName = 'scheduled insulin';
    if (dose) {
      displayName += ` ${dose}`;
    }
    if (timing) {
      displayName += ` ${timing}`;
    }
    if (held) {
      displayName += ' (held)';
    }

    return {
      section: 'Scheduled',
      displayName,
    };
  }

  function parseHeldFlag(line) {
    return /\[held by provider\]/i.test(line);
  }

  function classifyMedication(name, sectionHint) {
    if (IVF.has(name) && sectionHint === 'Continuous') {
      return 'IVF';
    }
    if (ANTIBIOTICS.has(name) || ANTIFUNGALS.has(name) || ANTIVIRALS.has(name)) {
      return 'ID';
    }
    return sectionHint;
  }

  function pickFirstOrOption(segment) {
    const cleanedSegment = segment.replace(/\*+/g, '');
    const parts = cleanedSegment.split(/\s+or\s+/i).map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[0] : cleanedSegment;
  }

  function cleanLine(line, allowMultiple, held) {
    let working = line.trim();
    if (!working) return [];

    const normalized = working.replace(/\*\*AND\*\*/gi, ',');
    working = normalized;

    if (/prn medications/i.test(working)) {
      const prnParts = working.split(':');
      working = prnParts.slice(1).join(':').trim();
    }

    const segments = working.split(',')
      .map((segment) => pickFirstOrOption(segment.trim()))
      .filter(Boolean);
    if (segments.length === 0) return [];

    if (!allowMultiple && segments.length > 1) {
      const first = segments[0];
      const isHeld = held || /\[held by provider\]/i.test(first);
      const cleaned = first.replace(/\[[^\]]*\]/g, '').trim();
      return cleaned ? [{ name: cleaned, held: isHeld }] : [];
    }

    return segments
      .map((segment) => {
        const isHeld = held || /\[held by provider\]/i.test(segment);
        const cleaned = segment.replace(/\[[^\]]*\]/g, '').trim();
        return cleaned ? { name: cleaned, held: isHeld } : null;
      })
      .filter(Boolean);
  }

  function extractInfusionRate(line) {
    const matches = [...line.matchAll(/(\d+(?:\.\d+)?)\s*(mL|ml|cc)\/hr/gi)];
    if (matches.length === 0) return null;
    const lastMatch = matches[matches.length - 1];
    return `${lastMatch[1]} ${lastMatch[2]}/hr`;
  }

  function cleanMedList(text) {
    const seen = {
      Scheduled: new Set(),
      Continuous: new Set(),
      IVF: new Set(),
      ID: new Set(),
      Anticoagulation: new Set(),
      PRN: new Set(),
    };
    const results = {
      Scheduled: [],
      Continuous: [],
      IVF: [],
      ID: [],
      Anticoagulation: [],
      PRN: [],
    };
    let currentSection = 'Scheduled';

    text.split(/\r?\n/).forEach((rawLine) => {
      const sectionInfo = identifySection(rawLine);
      let lineToParse = rawLine;
      const held = parseHeldFlag(rawLine);
      if (sectionInfo) {
        currentSection = sectionInfo.section;
        lineToParse = sectionInfo.remainder;
      }

      if (!lineToParse.trim()) return;

      if (/heparin/i.test(lineToParse) && /flush/i.test(lineToParse)) {
        return;
      }

      const anticoagEntry = extractAnticoagEntry(lineToParse, held);
      if (anticoagEntry) {
        const uniqueKey = anticoagEntry.displayName;
        if (!seen[anticoagEntry.section].has(uniqueKey)) {
          seen[anticoagEntry.section].add(uniqueKey);
          results[anticoagEntry.section].push(anticoagEntry.displayName);
        }
        return;
      }

      const insulinEntry = extractInsulinEntry(lineToParse, held);
      if (insulinEntry) {
        const uniqueKey = insulinEntry.displayName;
        if (!seen[insulinEntry.section].has(uniqueKey)) {
          seen[insulinEntry.section].add(uniqueKey);
          results[insulinEntry.section].push(insulinEntry.displayName);
        }
        return;
      }

      const allowMultiple = currentSection === 'PRN';
      const infusionRate = extractInfusionRate(rawLine);
      const entries = cleanLine(lineToParse, allowMultiple, allowMultiple ? false : held);
      entries.forEach(({ name, held: isHeld }) => {
        const normalized = normalizeName(name.toLowerCase());
        if (!normalized) return;
        if (EXCLUDED_PHRASES.some((phrase) => normalized.includes(phrase))) return;
        const convertedName = applyConversion(normalized);
        const resolvedSection = classifyMedication(convertedName, currentSection);
        if (resolvedSection === 'PRN' && PRN_EXCLUDED.has(normalized)) return;
        const rateSuffix = resolvedSection === 'IVF' && infusionRate ? ` ${infusionRate}` : '';
        const heldSuffix = isHeld ? ' (held)' : '';
        const displayName = `${convertedName}${rateSuffix}${heldSuffix}`;
        const uniqueKey = resolvedSection === 'PRN'
          ? `${convertedName}|${isHeld ? 'held' : 'active'}`
          : `${convertedName}|${infusionRate || 'no-rate'}|${isHeld ? 'held' : 'active'}`;
        if (!seen[resolvedSection].has(uniqueKey)) {
          seen[resolvedSection].add(uniqueKey);
          results[resolvedSection].push(displayName);
        }
      });
    });

    return results;
  }

  function renderOutput(listBySection) {
    const sections = ['Scheduled', 'Continuous', 'IVF', 'ID', 'Anticoagulation', 'PRN'];
    const lines = [];

    sections.forEach((section) => {
      const meds = listBySection[section];
      if (!meds || meds.length === 0) return;

      lines.push(`${section}: ${meds.join(', ')}`);
    });

    if (lines.length === 0) {
      outputEl.textContent = 'No medications found.';
      return;
    }

    outputEl.textContent = lines.join('\n');
  }

  async function refreshOutput() {
    await loadConversions();
    await loadAntimicrobials();
    const cleaned = cleanMedList(inputEl.value);
    renderOutput(cleaned);
  }

  cleanButton.addEventListener('click', async () => {
    await refreshOutput();
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

  refreshOutput();
</script>
