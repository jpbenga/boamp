import { asArray, safeString } from '../utils/text.js';

function pick(record, keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== '') {
      return record[key];
    }
  }
  return null;
}

function extractCpv(rawCpv) {
  const values = asArray(rawCpv).flatMap((v) => String(v).split(/[^0-9]/g));
  const codes = [...new Set(values.filter((v) => /^\d{8}$/.test(v)))];
  return codes;
}

export function normalizeBoampRecord(record) {
  const cpvRaw = pick(record, ['codecpv', 'cpv', 'cpvprincipal', 'cpv_principal']);
  const locationRaw = pick(record, ['lieuexecution', 'lieu_execution', 'departement', 'region', 'ville']);

  return {
    id: pick(record, ['idweb', 'id', 'recordid']),
    source: 'BOAMP',
    sourceUrl: pick(record, ['url', 'lien', 'permalink']),
    noticeType: pick(record, ['typeavis', 'nature', 'type']),
    title: pick(record, ['objet', 'titre', 'intitule']),
    description: pick(record, ['description', 'resume', 'texte', 'objet']),
    buyerName: pick(record, ['nomacheteur', 'acheteur', 'organisme']),
    publicationDate: pick(record, ['dateparution', 'datepublication']),
    responseDeadline: pick(record, ['date_limite', 'datecloture', 'datefinreponse']),
    location: {
      raw: locationRaw,
      department: pick(record, ['departement', 'code_departement']),
      region: pick(record, ['region']),
      city: pick(record, ['ville', 'commune'])
    },
    cpv: {
      raw: cpvRaw,
      codes: extractCpv(cpvRaw)
    },
    procedure: pick(record, ['procedure', 'typeprocedure']),
    lots: asArray(pick(record, ['lots', 'allotissement'])).filter(Boolean),
    buyerProfileUrl: pick(record, ['profilacheteur', 'profil_acheteur']),
    raw: record ?? {}
  };
}

export function normalizedText(normalized) {
  return [normalized.title, normalized.description, normalized.location.raw, safeString(normalized.raw)].filter(Boolean).join(' ');
}
