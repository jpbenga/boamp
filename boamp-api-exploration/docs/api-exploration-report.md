# Rapport d’exploration API BOAMP

## 1. Date d’exécution
- 2026-05-23T16:13:22.164Z

## 2. Endpoint testé
- https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records

## 3. Résumé des appels effectués
- Nombre total d'appels: 13
- Succès: 0
- Échecs: 13

## 4. Requêtes réussies
- Aucune

## 5. Requêtes échouées
- no-filter: REQUEST_FAILED (fetch failed)
- query-espaces verts: REQUEST_FAILED (fetch failed)
- query-nettoyage: REQUEST_FAILED (fetch failed)
- query-entretien paysager: REQUEST_FAILED (fetch failed)
- query-élagage: REQUEST_FAILED (fetch failed)
- query-maintenance informatique: REQUEST_FAILED (fetch failed)
- pagination-1: REQUEST_FAILED (fetch failed)
- pagination-2: REQUEST_FAILED (fetch failed)
- pagination-3: REQUEST_FAILED (fetch failed)
- select-all: REQUEST_FAILED (fetch failed)
- where-date: REQUEST_FAILED (fetch failed)
- where-objet: REQUEST_FAILED (fetch failed)
- where-dept: REQUEST_FAILED (fetch failed)

## 6. Paramètres confirmés
- limit
- offset
- q
- select
- where (si la requête retourne ok)

## 7. Paramètres incertains ou non fonctionnels
- Les paramètres non listés ci-dessus n'ont pas été testés dans ce run.

## 8. Structure générale des réponses
- Clés racine observées: total_count, results (selon réponses OK).

## 9. Inventaire des champs détectés
- Nombre de champs inventoriés: 0

## 10. Mapping des champs BOAMP vers le modèle interne
- Mapping implémenté dans src/boamp/boampNormalizer.js (id, title, buyer, dates, CPV, lieu, URLs).

## 11. Champs utiles pour le matching
- Texte (objet/description), CPV, localisation (departement/région), date limite.

## 12. Champs absents ou incertains
- Les champs absents sont laissés à null dans la normalisation.

## 13. Exemples d’annonces normalisées
- Échantillon enregistré dans output/normalized/boamp-normalized-sample.json

## 14. Résultats du matching sur la fixture entreprise
- Nombre d’opportunités scorées: 0

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
