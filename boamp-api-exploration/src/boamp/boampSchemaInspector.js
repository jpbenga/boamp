import { safeString } from '../utils/text.js';

function detectType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function inferMeaning(fieldName) {
  const key = fieldName.toLowerCase();
  if (/(objet|titre|intitule)/.test(key)) return 'title';
  if (/(acheteur|organisme)/.test(key)) return 'buyer';
  if (/(date.*limit|date.*clot|deadline)/.test(key)) return 'deadline';
  if (/(cpv)/.test(key)) return 'cpv';
  if (/(departement|region|ville|lieu)/.test(key)) return 'location';
  if (/(url|lien|profil)/.test(key)) return 'url';
  return 'unknown';
}

export function buildFieldInventory(records) {
  const inventory = {};

  for (const record of records) {
    for (const [field, value] of Object.entries(record ?? {})) {
      if (!inventory[field]) {
        inventory[field] = { count: 0, typeSet: new Set(), sampleValues: [], potentialMeaning: inferMeaning(field) };
      }
      const slot = inventory[field];
      slot.count += 1;
      slot.typeSet.add(detectType(value));
      if (slot.sampleValues.length < 2) {
        slot.sampleValues.push(safeString(value).slice(0, 200));
      }
    }
  }

  const output = {};
  for (const [field, info] of Object.entries(inventory)) {
    const types = [...info.typeSet];
    output[field] = {
      count: info.count,
      detectedType: types.length === 1 ? types[0] : 'mixed',
      sampleValues: info.sampleValues,
      potentialMeaning: info.potentialMeaning
    };
  }

  return output;
}
