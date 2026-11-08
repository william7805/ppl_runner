# 00XX. Librairie de graphiques : Recharts

## Statut

Accepté

## Contexte

Le dashboard running doit afficher des graphiques (km par semaine, allure et FC
par course). Il faut une librairie compatible React et Next.js, dont on contrôle
entièrement les couleurs, pour éviter le contraste rouge/vert.

## Options étudiées

- **Recharts** : très répandue, composants React déclaratifs, personnalisation complète.
- **Tremor** : composants de dashboard prêts à l'emploi, basés sur Recharts, mais
  avec un style imposé plus difficile à accorder au thème de l'île.
- **Chart.js** : performante, mais pensée pour le canvas et moins naturelle en React.

## Décision

Recharts, utilisée directement.

## Conséquences

- Contrôle total de la palette (violet pour la course, couple bleu/orange pour les comparaisons).
- Les composants Recharts ont besoin du navigateur : les graphiques seront des
  composants client (`'use client'`) qui reçoivent des données déjà calculées par le serveur.
- Plus de code de mise en forme à écrire qu'avec Tremor.
