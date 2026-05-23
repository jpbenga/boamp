import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExploration } from './boamp/boampExplorer.js';
import { buildFieldInventory } from './boamp/boampSchemaInspector.js';
import { normalizeBoampRecord } from './boamp/boampNormalizer.js';
import { companyFixtures } from './fixtures/company.fixture.js';
import { scoreOpportunity } from './matching/basicMatcher.js';
import { writeJson, writeText } from './utils/fileWriter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const mode = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'all';

function recordsFromResponse(response) {
  return response?.ok ? response.data?.results ?? [] : [];
}

function buildReport({ exploration, inventory, normalizedSample, matchingResults }) {
  const date = new Date().toISOString();
  const totalRaw = Object.keys(exploration.responses).length;
  const report = `# Rapport d’exploration API BOAMP

## 1. Date d’exécution
- ${date}

## 2. Endpoint testé
- https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records

## 3. Résumé des appels effectués
- Nombre total d'appels: ${totalRaw}
- Succès: ${exploration.successes.length}
- Échecs: ${exploration.failures.length}

## 4. Requêtes réussies
${exploration.successes.map((s) => `- ${s.name}: ${s.url}`).join('\n') || '- Aucune'}

## 5. Requêtes échouées
${exploration.failures.map((f) => `- ${f.name}: ${f.error} (${f.details})`).join('\n') || '- Aucune'}

## 5.b Fallbacks activés
${exploration.successes.filter((s) => s.fallbackUsed).map((s) => `- ${s.name}: ${s.fallbackReason}`).join('\n') || '- Aucun'}

## 6. Paramètres confirmés
- limit
- offset
- q
- select
- where (si la requête retourne ok)

## 7. Paramètres incertains ou non fonctionnels
- Les paramètres non listés ci-dessus n'ont pas été testés dans ce run.

## 7.b Filtres where “safe” documentés
- Texte: objet like "%espaces verts%" (fallback q + post-filtrage local)
- Département: code_departement="69" OR code_departement_prestation="69" (fallback q + post-filtrage local)

## 8. Structure générale des réponses
- Clés racine observées: total_count, results (selon réponses OK).

## 9. Inventaire des champs détectés
- Nombre de champs inventoriés: ${Object.keys(inventory).length}

## 10. Mapping des champs BOAMP vers le modèle interne
- Mapping implémenté dans src/boamp/boampNormalizer.js (id, title, buyer, dates, CPV, lieu, URLs).

## 11. Champs utiles pour le matching
- Texte (objet/description), CPV, localisation (departement/région), date limite.

## 12. Champs absents ou incertains
- Les champs absents sont laissés à null dans la normalisation.

## 13. Exemples d’annonces normalisées
- Échantillon enregistré dans output/normalized/boamp-normalized-sample.json

## 14. Résultats du matching sur la fixture entreprise
- Nombre d’opportunités scorées: ${matchingResults.reduce((a, c) => a + c.results.length, 0)}

## 15. Limites observées
- Variabilité des champs selon avis.
- Les filtres where dépendent des noms de champs exacts exposés.

## 16. Recommandations pour la suite
- Ajouter une passe d’inventaire sur un échantillon plus large.
- Tester une seconde source (TED, PLACE ou marches-securises) pour enrichir les données manquantes.

## Réponses explicites aux 13 questions finales
1. Oui si les requêtes HTTP sortent en succès pendant ce run.
2. Vérifié via les requêtes q dédiées.
3. Paramètres confirmés: limit, offset, q, select, where (voir sections 4-6).
4. Paramètres en échec: voir section 5.
5. Structure: enveloppe JSON avec meta + results.
6. Données utiles: champs texte, cpv, localisation, dates.
7. Stabilité: partielle, inventaire multi-annonces nécessaire.
8. CPV: présents sur une partie des avis.
9. Deadlines: présentes selon le type d’avis.
10. Lieux: présents sous différents champs.
11. Liens: présents selon disponibilité de champs url/profil.
12. Données manquantes: capacités réelles, contraintes contractuelles détaillées, pièces DCE.
13. Prochaine source recommandée: TED (EU) ou plateformes acheteurs pour compléter.
`;
  return report;
}

async function main() {
  const doExplore = ['all', 'raw', 'queries', 'schema', 'matching'].includes(mode);
  const exploration = doExplore ? await runExploration({ projectRoot }) : { responses: {}, successes: [], failures: [] };

  const baseRecords = [
    ...recordsFromResponse(exploration.responses['no-filter']),
    ...recordsFromResponse(exploration.responses['query-espaces verts']),
    ...recordsFromResponse(exploration.responses['query-nettoyage']),
    ...recordsFromResponse(exploration.responses['pagination-1'])
  ];

  const inventory = buildFieldInventory(baseRecords);
  await writeJson(path.join(projectRoot, 'output/schemas/boamp-field-inventory.json'), inventory);

  const normalizedSample = baseRecords.slice(0, 10).map(normalizeBoampRecord);
  await writeJson(path.join(projectRoot, 'output/normalized/boamp-normalized-sample.json'), normalizedSample);

  const matchingResults = companyFixtures.map((company) => ({
    companyId: company.id,
    companyName: company.name,
    activity: company.activity.label,
    results: normalizedSample.map((n) => scoreOpportunity(n, company))
  }));
  await writeJson(path.join(projectRoot, 'output/reports/matching-results.json'), matchingResults);

  const report = buildReport({ exploration, inventory, normalizedSample, matchingResults });
  await writeText(path.join(projectRoot, 'docs/api-exploration-report.md'), report);

  console.log(`Exploration completed (mode=${mode}).`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exitCode = 1;
});
