# Master Plan Codex — Exploration API BOAMP pour prototype de matching d’appels d’offres

## 1. Contexte général du projet

Nous développons un prototype technique pour un projet appelé provisoirement **Opportunia / TenderPilot / AO Copilot**.

L’objectif long terme du produit est d’aider des petites entreprises à :

1. rechercher des opportunités B2B et appels d’offres publics ;
2. comprendre rapidement si une opportunité est pertinente ;
3. matcher une opportunité avec le profil réel d’une entreprise ;
4. produire une recommandation go/no-go ;
5. préparer ensuite un dossier de réponse.

À ce stade, il ne faut **pas** développer une application complète.

La mission actuelle consiste uniquement à explorer techniquement l’API BOAMP afin de comprendre :

- ce que l’API attend comme paramètres ;
- ce qu’elle renvoie réellement ;
- quels champs sont disponibles ;
- quels champs sont fiables ;
- quels champs sont utiles pour le matching ;
- quelles limites existent avant d’aller plus loin.

L’objectif est de produire un **harness d’exploration API** en Node.js, pas un MVP produit.

---

## 2. Objectif de la mission Codex

Créer un petit projet Node.js permettant d’explorer l’API BOAMP et de générer une documentation technique locale basée sur des appels réels.

À la fin de la mission, on doit pouvoir répondre précisément aux questions suivantes :

- Quel endpoint fonctionne ?
- Comment faire une recherche par mots-clés ?
- Comment paginer ?
- Quels paramètres sont acceptés ?
- Quels paramètres échouent ?
- Quelle est la structure exacte des réponses JSON ?
- Quels champs décrivent l’objet du marché ?
- Quels champs décrivent l’acheteur ?
- Quels champs décrivent la date limite de réponse ?
- Quels champs décrivent le lieu d’exécution ?
- Quels champs contiennent les codes CPV ?
- Quels champs contiennent les liens vers l’avis, le profil acheteur ou le DCE ?
- Les données sont-elles suffisantes pour faire un premier matching avec une entreprise fictive ?

---

## 3. Source API à explorer

Explorer en priorité le dataset BOAMP exposé via Opendatasoft.

Endpoint principal à tester :

```txt
https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records
```

L’API BOAMP est une API officielle de la DILA permettant de rechercher et consulter les annonces du Bulletin officiel des annonces de marchés publics.

Elle est libre d’accès et permet notamment :

- la recherche d’annonces BOAMP ;
- la recherche par mots-clés ;
- l’utilisation de filtres et critères ;
- la consultation des données en JSON, CSV ou Excel ;
- la récupération d’avis d’appel public à la concurrence, avis d’attribution, concessions, MAPA, avis divers, etc.

Important : l’API BOAMP mentionnée est en version bêta. Les champs, comportements ou paramètres peuvent donc évoluer. Le code doit être défensif et le rapport doit documenter les incertitudes.

---

## 4. Stack technique imposée

Utiliser :

```txt
Node.js 20+
JavaScript ESM
fetch natif
Aucune base de données
Aucun framework web
Sorties locales en JSON et Markdown
```

Ne pas utiliser :

- Next.js ;
- Express ;
- React ;
- une base SQL ;
- une interface utilisateur ;
- un système d’authentification ;
- de l’IA ;
- du scraping agressif.

---

## 5. Structure attendue du projet

Créer le projet suivant :

```txt
boamp-api-exploration/
├─ package.json
├─ README.md
├─ src/
│  ├─ index.js
│  ├─ boamp/
│  │  ├─ boampClient.js
│  │  ├─ boampExplorer.js
│  │  ├─ boampNormalizer.js
│  │  └─ boampSchemaInspector.js
│  ├─ fixtures/
│  │  └─ company.fixture.js
│  ├─ matching/
│  │  └─ basicMatcher.js
│  └─ utils/
│     ├─ fileWriter.js
│     └─ text.js
├─ output/
│  ├─ raw/
│  ├─ normalized/
│  ├─ reports/
│  └─ schemas/
└─ docs/
   └─ api-exploration-report.md
```

---

## 6. Scripts npm attendus

Le `package.json` doit proposer au minimum :

```json
{
  "scripts": {
    "explore": "node src/index.js",
    "explore:raw": "node src/index.js --mode=raw",
    "explore:queries": "node src/index.js --mode=queries",
    "explore:schema": "node src/index.js --mode=schema",
    "explore:matching": "node src/index.js --mode=matching"
  },
  "type": "module"
}
```

---

## 7. Requêtes à tester obligatoirement

### 7.1 Requête sans filtre

Objectif : comprendre la forme de base de la réponse.

```txt
GET /records?limit=5
```

Sauvegarder la réponse brute dans :

```txt
output/raw/boamp-no-filter.json
```

---

### 7.2 Recherche texte simple

Tester les recherches suivantes :

```txt
q=espaces verts
q=nettoyage
q=entretien paysager
q=élagage
q=maintenance informatique
```

Chaque réponse brute doit être sauvegardée dans `output/raw/`.

Exemples de fichiers attendus :

```txt
output/raw/boamp-query-espaces-verts.json
output/raw/boamp-query-nettoyage.json
output/raw/boamp-query-entretien-paysager.json
output/raw/boamp-query-elagage.json
output/raw/boamp-query-maintenance-informatique.json
```

---

### 7.3 Pagination

Tester :

```txt
limit=10&offset=0
limit=10&offset=10
limit=10&offset=20
```

Vérifier et documenter :

- si les résultats changent bien ;
- s’il existe un total global de résultats ;
- comment l’API exprime ce total ;
- si la pagination semble stable.

Sauvegarder :

```txt
output/raw/boamp-pagination-page-1.json
output/raw/boamp-pagination-page-2.json
output/raw/boamp-pagination-page-3.json
```

---

### 7.4 Sélection de champs

Tester le paramètre `select` si disponible.

Commencer par :

```txt
select=*
```

Puis essayer de sélectionner uniquement les champs utiles détectés après inspection du schéma.

Objectif : déterminer si l’on peut réduire la taille des réponses.

Ne pas supposer les noms de champs avant inspection.

---

### 7.5 Filtres `where`

Tester `where` seulement après inspection des champs réels.

Exemples à tenter uniquement si les champs correspondants existent :

```txt
where=dateparution >= date'2026-01-01'
where=contains(objet, "espaces verts")
where=departement="69"
```

Important : ne pas considérer ces exemples comme exacts. Ils doivent être adaptés aux champs réellement détectés.

Le rapport doit indiquer pour chaque filtre :

- requête testée ;
- succès ou échec ;
- erreur éventuelle ;
- comportement observé.

---

## 8. Champs à identifier dans les réponses

Codex doit inspecter les réponses et identifier quels champs correspondent aux concepts produit suivants.

| Concept produit | Champ BOAMP à identifier |
|---|---|
| identifiant annonce | id, recordid, idweb ou équivalent |
| titre / objet | objet, titre, objet_du_marche ou équivalent |
| description | texte, resume, description ou équivalent |
| acheteur | acheteur, nom_acheteur, organisme ou équivalent |
| type d’avis | AAPC, attribution, concession, MAPA ou équivalent |
| date de publication | dateparution ou équivalent |
| date limite de réponse | date_limite, datecloture ou équivalent |
| lieu d’exécution | lieu_execution, departement, region ou équivalent |
| code CPV | cpv, code_cpv, cpv_principal ou équivalent |
| lots | lots, allotissement ou équivalent |
| procédure | procedure, type_procedure ou équivalent |
| URL détail BOAMP | url, lien, avis_url ou équivalent |
| lien profil acheteur | profil_acheteur ou équivalent |
| texte intégral | texte complet de l’avis ou équivalent |

Très important :

- ne pas inventer les noms de champs ;
- ne pas présumer qu’un champ existe ;
- documenter explicitement les champs absents ;
- documenter les champs incertains ;
- conserver les réponses brutes pour vérification.

---

## 9. Inventaire de schéma attendu

Créer un fichier :

```txt
output/schemas/boamp-field-inventory.json
```

Format attendu :

```js
{
  "fieldName": {
    "count": 42,
    "detectedType": "string | number | boolean | array | object | null | mixed",
    "sampleValues": ["exemple 1", "exemple 2"],
    "potentialMeaning": "title | buyer | deadline | cpv | location | url | unknown"
  }
}
```

L’inventaire doit être construit à partir de plusieurs résultats, pas seulement d’une seule annonce.

---

## 10. Normalisation minimale attendue

Créer un normaliseur qui transforme une annonce BOAMP brute en objet interne stable.

Fichier :

```txt
src/boamp/boampNormalizer.js
```

Format cible :

```js
{
  id: null,
  source: "BOAMP",
  sourceUrl: null,
  noticeType: null,

  title: null,
  description: null,
  buyerName: null,

  publicationDate: null,
  responseDeadline: null,

  location: {
    raw: null,
    department: null,
    region: null,
    city: null
  },

  cpv: {
    raw: null,
    codes: []
  },

  procedure: null,
  lots: [],

  buyerProfileUrl: null,

  raw: {}
}
```

Le normaliseur doit être défensif :

- ne jamais crash si un champ manque ;
- garder l’objet brut complet dans `raw` ;
- mettre `null` si l’information n’est pas trouvée ;
- extraire les codes CPV sous forme de tableau quand c’est possible ;
- garder les valeurs brutes si elles ne sont pas interprétables.

Sauvegarder un échantillon normalisé dans :

```txt
output/normalized/boamp-normalized-sample.json
```

---

## 11. Fixture entreprise fictive

Créer une entreprise fictive pour tester le matching.

Fichier :

```txt
src/fixtures/company.fixture.js
```

Contenu attendu :

```js
export const companyFixture = {
  id: "fixture-espaces-verts-lyon",
  name: "Vert Rhône Services",
  siret: "12345678900011",

  activity: {
    label: "Espaces verts",
    keywords: [
      "espaces verts",
      "entretien paysager",
      "tonte",
      "taille",
      "élagage",
      "désherbage",
      "fauchage",
      "plantation",
      "entretien de parcs",
      "terrains sportifs"
    ],
    excludedKeywords: [
      "travaux forestiers lourds",
      "génie civil",
      "voirie",
      "abattage dangereux"
    ],
    cpvCodes: [
      "77310000",
      "77311000",
      "77312000",
      "77313000",
      "77314000"
    ]
  },

  geography: {
    baseCity: "Lyon",
    departments: ["69", "01", "38", "42"],
    regions: ["Auvergne-Rhône-Alpes"],
    maxDistanceKm: 50
  },

  capacity: {
    employees: 6,
    hasPublicTenderExperience: false,
    canHandleRecurringContracts: true
  },

  documents: {
    kbis: true,
    insurance: true,
    fiscalCertificate: false,
    socialCertificate: false,
    rib: true,
    technicalMemoirTemplate: false,
    references: true
  }
};
```

---

## 12. Matching basique attendu

Créer un matcher simple.

Fichier :

```txt
src/matching/basicMatcher.js
```

Objectif : vérifier si les données BOAMP récupérées suffisent à faire un premier scoring.

Critères de score :

| Critère | Poids |
|---|---:|
| mots-clés métier trouvés | 35 |
| CPV compatible | 30 |
| zone compatible | 20 |
| deadline détectée | 5 |
| absence de mots-clés d’exclusion | 10 |

Score final sur 100.

Décision :

```txt
0–39   : hors cible
40–69  : à examiner
70–84  : pertinent
85–100 : prioritaire
```

Sortie attendue :

```js
{
  opportunityId: "...",
  title: "...",
  score: 78,
  decision: "pertinent",
  reasons: [
    "Mot-clé métier détecté : espaces verts",
    "Code CPV compatible : 77310000",
    "Zone compatible : 69"
  ],
  risks: [
    "Date limite non détectée",
    "Attestation fiscale manquante côté entreprise"
  ],
  normalizedOpportunity: {}
}
```

Sauvegarder les résultats de matching dans :

```txt
output/reports/matching-results.json
```

---

## 13. Rapport Markdown attendu

Créer automatiquement un rapport :

```txt
docs/api-exploration-report.md
```

Le rapport doit contenir les sections suivantes :

```md
# Rapport d’exploration API BOAMP

## 1. Date d’exécution

## 2. Endpoint testé

## 3. Résumé des appels effectués

## 4. Requêtes réussies

## 5. Requêtes échouées

## 6. Paramètres confirmés

## 7. Paramètres incertains ou non fonctionnels

## 8. Structure générale des réponses

## 9. Inventaire des champs détectés

## 10. Mapping des champs BOAMP vers le modèle interne

## 11. Champs utiles pour le matching

## 12. Champs absents ou incertains

## 13. Exemples d’annonces normalisées

## 14. Résultats du matching sur la fixture entreprise

## 15. Limites observées

## 16. Recommandations pour la suite
```

Le rapport doit être clair, factuel et basé sur les résultats réellement obtenus.

Ne pas écrire : “probablement”, “on peut supposer”, “il semble” sans expliquer sur quelle observation cela repose.

---

## 14. Fichiers de sortie obligatoires

À la fin, ces fichiers doivent exister :

```txt
output/raw/boamp-no-filter.json
output/raw/boamp-query-espaces-verts.json
output/raw/boamp-query-nettoyage.json
output/raw/boamp-query-entretien-paysager.json
output/raw/boamp-query-elagage.json
output/raw/boamp-query-maintenance-informatique.json
output/raw/boamp-pagination-page-1.json
output/raw/boamp-pagination-page-2.json
output/raw/boamp-pagination-page-3.json

output/schemas/boamp-field-inventory.json

output/normalized/boamp-normalized-sample.json

output/reports/matching-results.json

docs/api-exploration-report.md
```

---

## 15. Gestion des erreurs attendue

Le client API doit gérer proprement :

- erreur réseau ;
- réponse HTTP non 200 ;
- réponse JSON invalide ;
- aucun résultat ;
- champ manquant ;
- paramètre rejeté par l’API ;
- quota ou limitation éventuelle ;
- timeout éventuel.

Chaque erreur doit être documentée dans le rapport si elle survient pendant l’exploration.

---

## 16. Ce qu’il ne faut pas faire dans cette phase

Ne pas faire :

- application web ;
- interface utilisateur ;
- authentification ;
- base de données ;
- scraping de plateformes acheteurs ;
- téléchargement automatique des DCE ;
- analyse PDF ;
- génération de mémoire technique ;
- génération de documents juridiques ;
- dépôt de réponse ;
- IA ou LLM ;
- scoring complexe basé sur des hypothèses non vérifiées.

Cette phase sert uniquement à explorer et documenter BOAMP.

---

## 17. Critères de réussite

La mission est réussie si :

- `npm run explore` fonctionne ;
- les appels API BOAMP réussissent ;
- les réponses brutes sont sauvegardées ;
- un inventaire de champs existe ;
- des annonces sont normalisées ;
- un matching basique fonctionne avec la fixture ;
- un rapport Markdown explique clairement ce que l’API attend et renvoie ;
- les limites sont documentées ;
- aucune supposition de champ n’est présentée comme une certitude.

---

## 18. Questions finales auxquelles le rapport doit répondre

Le rapport final doit répondre explicitement à ces questions :

1. L’API BOAMP est-elle exploitable en accès libre depuis Node.js ?
2. La recherche texte fonctionne-t-elle correctement ?
3. Quels paramètres ont été confirmés par test réel ?
4. Quels paramètres n’ont pas fonctionné ?
5. Quelle est la structure exacte d’une réponse API ?
6. Où se trouvent les données utiles pour le matching ?
7. Les champs sont-ils stables d’une annonce à l’autre ?
8. Les codes CPV sont-ils présents ?
9. Les deadlines sont-elles présentes ?
10. Les lieux d’exécution sont-ils présents ?
11. Les liens vers les annonces ou DCE sont-ils présents ?
12. Quelles données manquent pour faire un vrai go/no-go ?
13. Quelle serait la prochaine source à explorer après BOAMP ?

---

## 19. Définition de “done”

La tâche est terminée quand on peut ouvrir :

```txt
docs/api-exploration-report.md
```

et comprendre clairement :

> Voici comment fonctionne l’API BOAMP, voici ce qu’elle attend, voici ce qu’elle renvoie, voici les champs utiles, voici ce qu’on peut déjà matcher, et voici ce qui manque pour aller vers un prototype complet.

---

## 20. Étape suivante après cette mission

Si cette exploration est concluante, la prochaine mission sera de construire une V0 technique qui fera :

1. recherche BOAMP ciblée ;
2. normalisation robuste ;
3. matching avec fixture entreprise ;
4. scoring ;
5. export d’une fiche go/no-go simplifiée ;
6. préparation d’un premier pipeline extensible à d’autres sources.

Mais cette étape ne doit pas être incluse dans la mission actuelle.
