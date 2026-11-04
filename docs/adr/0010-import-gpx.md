# ADR-0010 : Import des activités de course au format GPX

- Statut : Proposé
- Date : 2026-11-04
- Décideur : William Determann

## Contexte

PPL_RUNNER doit récupérer les séances enregistrées par ma montre COROS.
La liaison directe avec l'API COROS est envisagée plus tard ; en attendant,
les activités sont importées manuellement par fichier.

Deux types de séances existent :

- la course : enregistrée avec GPS, elle produit une trace
- la musculation : sans GPS, elle n'a pas de trace exploitable

Contraintes :

- Format exportable depuis COROS (et idéalement depuis d'autres montres)
- Parsing réalisé dans l'application, en TypeScript, et testable
- Les fichiers sont envoyés par le navigateur : ce sont des entrées non
  fiables, à traiter comme telles
- Les traces contiennent des données de localisation sensibles

## Options envisagées

1. GPX (XML standard)
2. FIT (format binaire Garmin, utilisé par COROS)
3. TCX (XML Garmin, orienté entraînement)
4. Saisie manuelle uniquement

## Décision

- Les séances de course sont importées au format GPX
- Les séances de musculation sont saisies manuellement dans l'application
- Le FIT pourra être ajouté plus tard en complément, sans remettre en cause
  le schéma

Règles d'import :

- Upload réservé à l'utilisateur authentifié (vérification de session côté
  serveur)
- Taille maximale du fichier : 10 Mo
- Vérification de l'extension, puis de la structure (élément racine `gpx`)
- Parser XML configuré pour ne résoudre ni DTD ni entités externes
- Le fichier brut n'est pas conservé : seules les données extraites sont
  enregistrées en base (minimisation des données)

Données extraites : date de début, durée, distance, dénivelé positif et,
si présentes dans les extensions, fréquence cardiaque moyenne et maximale.

## Justification

### GPX

- (+) Format ouvert et standard, exporté par la plupart des montres et
  plateformes
- (+) Lisible (XML) : facile à comprendre, à déboguer et à tester
- (+) Contient l'essentiel pour la course : position, altitude, heure
- (+) Bon exercice d'apprentissage : distance, allure et dénivelé calculés
  par mon propre code
- (-) Pas de tours, calories ni type d'activité fiables
- (-) Fréquence cardiaque dans des extensions non standardisées
- (-) XML exposé aux attaques XXE et « billion laughs » si le parser est
  mal configuré

### FIT

- (+) Format le plus complet (tours, calories, capteurs)
- (+) Format natif de COROS
- (-) Binaire : moins lisible, dépend d'une bibliothèque de décodage
- (-) Plus complexe pour un premier import

### TCX

- (+) XML, contient les tours et la fréquence cardiaque
- (-) Format Garmin, moins universel que GPX
- (-) Mêmes risques XML que GPX, pour peu de gain

### Saisie manuelle uniquement

- (+) Aucun parsing, aucun risque lié aux fichiers
- (-) Fastidieux pour la course, pas de trace ni de dénivelé
- (+) Adaptée en revanche à la musculation (exercices, séries, charges)

## Conséquences

- Un module de parsing GPX isolé (`src/lib/gpx/`), sans dépendance à Next.js,
  couvert par des tests unitaires
- Des fichiers GPX d'exemple dans `tests/fixtures/`, courts et anonymisés
  (aucune trace partant de mon domicile)
- Des tests de sécurité : fichier trop gros, mauvais format, XML avec
  entités externes ou imbriquées, fichier vide ou sans points
- Nouvelle migration pour stocker le dénivelé et la fréquence cardiaque
- La conservation des points GPS (affichage de la carte) fera l'objet d'une
  décision séparée, avec la question des zones de confidentialité autour
  du domicile
- Un formulaire de saisie manuelle pour la musculation, à concevoir dans
  un second temps
