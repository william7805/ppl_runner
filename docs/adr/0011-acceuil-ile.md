# 0011. Page d'accueil en carte isométrique (île)

- Date : 2026-11-05
- Statut : Accepté

## Contexte

La page d'accueil doit donner accès à chaque sport et donner envie de
revenir. Une liste ou une grille de vignettes ressemble à toutes les apps
de sport. Je veux une identité visuelle propre au projet, sans sacrifier
la lisibilité des données.

## Décision

La page d'accueil est une île en vue isométrique, avec un lieu par sport :
piste (course à pied), piscine (natation), espace musculation et maison
(données de santé).

En V1 :

- l'île est une image fixe (`public/island.webp`) ;
- les lieux sont des liens HTML positionnés en pourcentage par-dessus ;
- seule la piste est active, les autres lieux affichent « Bientôt » ;
- les données détaillées restent sur le dashboard, la carte sert de
  navigation.

## Alternatives écartées

- **Grille de vignettes classique** : simple, mais sans identité.
- **Spline** (scène 3D intégrée) : rotation et zoom, mais dépendance à un
  service externe et scène plus lourde à charger.
- **React Three Fiber** : contrôle total (animations, bâtiments qui
  évoluent), mais beaucoup trop de travail pour une V1.

## Conséquences

- Positif : rapide à réaliser, léger, accessible (les lieux sont de vrais
  liens, utilisables au clavier et lus par les lecteurs d'écran).
- Positif : la 3D reste possible plus tard sans changer la navigation.
- Négatif : pas de rotation ni de zoom.
- Négatif : remplacer l'image impose de garder le même cadrage, sinon les
  positions des lieux sont à recalculer.
- Sur petit écran, la carte est remplacée par une liste des lieux.
- L'île 2D de l'ADR 0011 est abandonnée, sans solution de repli : le site
  est réservé à moi et à quelques amis, sur des navigateurs récents qui
  gèrent tous WebGL. Maintenir deux versions de l'île n'en vaut pas la
  peine. À reconsidérer si le site s'ouvre à plus de monde.
