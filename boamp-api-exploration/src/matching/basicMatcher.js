import { normalizedText } from '../boamp/boampNormalizer.js';

function decisionFromScore(score) {
  if (score <= 39) return 'hors cible';
  if (score <= 69) return 'à examiner';
  if (score <= 84) return 'pertinent';
  return 'prioritaire';
}

export function scoreOpportunity(normalizedOpportunity, company) {
  const reasons = [];
  const risks = [];
  let score = 0;

  const text = normalizedText(normalizedOpportunity).toLowerCase();
  const hitKeywords = company.activity.keywords.filter((k) => text.includes(k.toLowerCase()));
  if (hitKeywords.length > 0) {
    score += 35;
    reasons.push(`Mot-clé métier détecté : ${hitKeywords[0]}`);
  }

  const cpvMatch = normalizedOpportunity.cpv.codes.find((c) => company.activity.cpvCodes.includes(c));
  if (cpvMatch) {
    score += 30;
    reasons.push(`Code CPV compatible : ${cpvMatch}`);
  }

  const dept = String(normalizedOpportunity.location.department ?? '');
  const region = String(normalizedOpportunity.location.region ?? '');
  if (company.geography.departments.includes(dept) || company.geography.regions.some((r) => region.includes(r))) {
    score += 20;
    reasons.push(`Zone compatible : ${dept || region}`);
  }

  if (normalizedOpportunity.responseDeadline) {
    score += 5;
  } else {
    risks.push('Date limite non détectée');
  }

  const excluded = company.activity.excludedKeywords.filter((k) => text.includes(k.toLowerCase()));
  if (excluded.length === 0) {
    score += 10;
  } else {
    risks.push(`Mots-clés d'exclusion détectés : ${excluded.join(', ')}`);
  }

  if (!company.documents.fiscalCertificate) {
    risks.push('Attestation fiscale manquante côté entreprise');
  }

  return {
    opportunityId: normalizedOpportunity.id,
    title: normalizedOpportunity.title,
    score,
    decision: decisionFromScore(score),
    reasons,
    risks,
    normalizedOpportunity
  };
}
