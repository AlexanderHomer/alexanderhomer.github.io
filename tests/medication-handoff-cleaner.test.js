#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const page = fs.readFileSync('resources/medication-handoff-cleaner.md', 'utf8');
const scriptMatch = page.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  throw new Error('Could not find inline script in medication-handoff-cleaner.md');
}

const fakeEl = () => ({
  value: '',
  textContent: '',
  addEventListener: () => {},
});

const context = {
  console,
  setTimeout,
  clearTimeout,
  document: {
    getElementById: () => fakeEl(),
  },
  navigator: {
    clipboard: {
      writeText: async () => {},
    },
  },
  fetch: async (url) => {
    if (url.includes('conversions')) {
      return {
        ok: true,
        json: async () => ({ conversions: {} }),
      };
    }
    if (url.includes('antimicrobials')) {
      return {
        ok: true,
        json: async () => ({ antibiotics: ['ceftriaxone', 'metronidazole'], antifungals: [], antivirals: [] }),
      };
    }
    return { ok: false, json: async () => ({}) };
  },
};
vm.createContext(context);
vm.runInContext(scriptMatch[1], context);

assert.strictEqual(typeof context.cleanMedList, 'function', 'cleanMedList should be defined');

const input = `Scheduled Meds: albumin human, 12.5 g, intravenous, q6h
cefTRIAXone, 2 g, intravenous, q24h
heparin (porcine), 5,000 Units, subcutaneous, q8h SCH
insulin glargine/biosimilar, 30 Units, subcutaneous, q AM
ipratropium-albuterol, 3 mL, nebulization, q6h
metroNIDAZOLE, 500 mg, intravenous, q12h
pantoprazole, 40 mg, intravenous, q24h SCH
sodium chloride 0.9 %, 10 mL, intra-catheter, q8h
 
 
Continuous Infusions: fat emulsion fish oil/plant based, 100 mL, Last Rate: Stopped (02/11/26 0556)
 And
Adult 2-in-1 PN, 75 mL/hr, Last Rate: 75 mL/hr (02/11/26 1300)
Adult 2-in-1 PN, 75 mL/hr
cangrelor, 0.75 mcg/kg/min, Last Rate: 0.75 mcg/kg/min (02/11/26 1300)
dexmedetomidine, 0-1.5 mcg/kg/hr, Last Rate: Stopped (02/08/26 2320)
fentaNYL, 0-250 mcg/hr, Last Rate: 50 mcg/hr (02/11/26 1300)
insulin regular, 0-30 Units/hr, Last Rate: 5 Units/hr (02/11/26 1300)
lactated Ringer's, 100 mL/hr, Last Rate: 100 mL/hr (02/11/26 1300)
norEPINEPHrine, 0-1 mcg/kg/min (Adjusted), Last Rate: Stopped (02/11/26 1156)
propofol, 0-65 mcg/kg/min, Last Rate: 40 mcg/kg/min (02/11/26 1300)
 
 
PRN Meds: PRN medications: alteplase, calcium gluconate, calcium gluconate, dextrose 50%, fentaNYL, heparin (porcine), HYDROmorphone, HYDROmorphone, insulin regular, insulin regular, magnesium sulfate, magnesium sulfate, potassium chloride, propofol, sodium chloride 0.9 %, sodium phosphate, sodium phosphate
`;

const cleaned = context.cleanMedList(input);

assert.strictEqual(
  cleaned.Scheduled.filter((entry) => entry.startsWith('scheduled insulin')).length,
  1,
  'scheduled insulin should only appear once'
);

assert.ok(
  cleaned.PRN.includes('insulin regular'),
  'PRN insulin regular should remain in PRN output'
);

assert.ok(
  cleaned.PRN.includes('hydromorphone'),
  'PRN hydromorphone should remain in PRN output'
);

assert.ok(
  !cleaned.PRN.includes('sodium chloride'),
  'PRN sodium chloride should still be excluded'
);

console.log('All medication handoff cleaner tests passed.');
