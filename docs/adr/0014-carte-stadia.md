# 0014. Carte des parcours avec MapLibre et Stadia Maps

- Date : 2026-11-08
- Statut : Accepté

## Contexte

Le dashboard doit afficher le parcours de la dernière course, et plus tard
celui de chaque course sur sa page de détail. Aujourd'hui, seules les données
résumées sont enregistrées : l'ADR 0010 a laissé la conservation des points
GPS à une décision séparée, avec la question de la confidentialité autour du
domicile. Le style de la carte doit s'accorder au thème sombre du dashboard.

## Décision

- Les cartes sont affichées avec MapLibre GL (tuiles vectorielles), dans un
  composant client.
- Le fond de carte est fourni par Stadia Maps, style Stamen Toner Dark, avec
  une authentification par domaine (aucune clé d'API dans le code).
- L'URL du style est stockée dans une constante, pour pouvoir changer de style
  ou de fournisseur en une ligne.
- Une trace simplifiée est enregistrée pour chaque course (algorithme de
  Douglas-Peucker), au format encoded polyline, dans une colonne de la table
  activities.
- Une zone de confidentialité est appliquée avant l'enregistrement : le début
  et la fin de la trace sont coupés. Les points supprimés ne sont jamais
  stockés.

## Alternatives écartées

- **Leaflet** : plus simple, mais limité aux tuiles en images, dont on ne peut
  pas adapter le style.
- **OpenFreeMap** : gratuit sans inscription, mais pas de style sombre prêt à
  l'emploi qui corresponde au thème ; il aurait fallu écrire mon propre style.
- **Tuiles officielles OpenStreetMap** : politique d'usage stricte, et non
  recommandées comme fournisseur principal d'une application.
- **Trace seule en SVG, sans fond de carte** : aucune requête externe, mais on
  ne voit ni les rues ni le contexte du parcours.

## Conséquences

- Un compte Stadia Maps, gratuit pour un usage non commercial ; le domaine
  du site est déclaré dans leur tableau de bord.
- L'attribution (Stadia Maps, Stamen Design, OpenMapTiles, OpenStreetMap)
  reste affichée sur la carte.
- Chaque tuile chargée indique à Stadia Maps la zone affichée : la zone de
  confidentialité limite ce que ces requêtes révèlent.
- Nouvelle migration pour la colonne de la trace ; les courses déjà importées
  n'ont pas de trace et devront être réimportées pour en avoir une.
- Nouvelles fonctions pures et testées : simplification, coupe de la zone de
  confidentialité, encodage et décodage de la trace.
