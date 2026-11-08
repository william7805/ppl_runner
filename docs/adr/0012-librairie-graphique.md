# 0013. Graphiques du dashboard avec Recharts

- Date : 2026-11-08
- Statut : Accepté

## Contexte

Le dashboard running doit afficher l'évolution de mes courses : les
kilomètres par semaine et l'allure avec la fréquence cardiaque. Il faut une
bibliothèque de graphiques compatible React et Next.js, dont je contrôle
entièrement les couleurs (palette de l'île, et pas de contraste rouge/vert
puisque je suis daltonien).

## Décision

- Graphiques réalisés avec Recharts, utilisée directement.
- Les calculs (agrégats par semaine, allure par course) restent dans
  src/lib/stats.ts, en fonctions pures testées avec Vitest.
- Les graphiques sont des composants client ('use client') qui reçoivent
  des données déjà calculées par la page, côté serveur.

## Alternatives écartées

- **Tremor** : composants de dashboard tout faits (basés sur Recharts),
  mais au style imposé, plus difficile à accorder au thème de l'île.
- **Chart.js** : performante, mais pensée pour le canvas et moins naturelle
  en React.
- **Graphiques faits main en SVG** : formateur, mais long à écrire pour
  les axes, les infobulles et le redimensionnement.

## Conséquences

- Une dépendance de plus, à surveiller avec les mises à jour.
- Le code des graphiques est envoyé au navigateur : seuls les composants
  de graphiques sont en 'use client', le reste de la page reste rendu
  côté serveur.
- Couleurs choisies à la main : violet pour la course, bleu ciel en
  pointillés pour la FC, pour que les courbes se distinguent sans la couleur.
