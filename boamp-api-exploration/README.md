# BOAMP API Exploration

Harness Node.js d'exploration de l'API BOAMP (Opendatasoft) pour préparer l'intégration d'un pipeline "données marchés publics → normalisation → matching".

## Objectif du dépôt

Ce projet sert de **socle technique temporaire** avant la mise en place du projet final :

- valider la connectivité API BOAMP ;
- tester les paramètres de requête utiles (`limit`, `offset`, `q`, `select`, `where`) ;
- inventorier les champs réellement observés ;
- normaliser un échantillon d'annonces vers un modèle interne ;
- produire un score de matching initial avec une fixture entreprise.

## Prérequis

- Node.js 20+
- npm 10+ (recommandé)

## Installation

```bash
cd boamp-api-exploration
npm install
```

## Commandes disponibles

```bash
npm run explore
npm run explore:raw
npm run explore:queries
npm run explore:schema
npm run explore:matching
```

### Détail des modes

- `explore` : exécute le pipeline complet (recommandé).
- `explore:raw` : exploration brute des appels API.
- `explore:queries` : tests des requêtes métier (mots-clés/filtrages).
- `explore:schema` : génération de l'inventaire des champs.
- `explore:matching` : normalisation + scoring de matching sur échantillon.

## Structure du projet

```text
boamp-api-exploration/
├─ docs/
│  ├─ api-exploration-report.md
│  ├─ master_plan_codex_exploration_api_boamp.md
│  ├─ openapi.json
│  └─ explore_v2.1.html
├─ output/
│  ├─ raw/
│  ├─ normalized/
│  ├─ reports/
│  └─ schemas/
└─ src/
   ├─ boamp/
   ├─ fixtures/
   ├─ matching/
   ├─ utils/
   └─ index.js
```

## Sorties générées

Après exécution, les principaux artefacts sont :

- `output/raw/*.json` : réponses API brutes par scénario ;
- `output/schemas/boamp-field-inventory.json` : inventaire des champs ;
- `output/normalized/boamp-normalized-sample.json` : annonces normalisées ;
- `output/reports/matching-results.json` : scoring des opportunités ;
- `docs/api-exploration-report.md` : rapport d'exploration consolidé.

## Pipeline logique

1. **Exploration API** : appels BOAMP via `boampClient` et scénarios `boampExplorer`.
2. **Inspection schéma** : agrégation des clés via `boampSchemaInspector`.
3. **Normalisation** : mapping BOAMP → modèle interne via `boampNormalizer`.
4. **Matching** : score heuristique via `basicMatcher` et `company.fixture`.
5. **Reporting** : écriture JSON + rapport markdown.

## Utilisation recommandée avant le projet final

- Exécuter `npm run explore` à chaque itération de règles de mapping.
- Versionner les artefacts importants (rapport, schéma, exemples normalisés).
- Comparer les inventaires de champs entre runs pour détecter les variations.
- Stabiliser le modèle normalisé avant d'implémenter la base de données finale.

## Limites connues

- Variabilité des champs selon les annonces BOAMP.
- Certaines conditions `where` nécessitent des fallbacks (`q` + filtrage local).
- Matching actuel volontairement simple (prototype de faisabilité).

## Prochaine étape recommandée

Créer un **module partagé de normalisation** (réutilisable) puis brancher une seconde source (TED ou plateforme acheteur) pour valider l'approche multi-sources avant industrialisation.
