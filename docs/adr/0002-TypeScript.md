# 0002. TypeScript comme langage

- Date : 2026-10-16
- Statut : Accepté

## Contexte

PPL_RUNNER va principalement parser des fichiers .fit dans un premier
temps. Ces fichiers contiennent parfois des champs vides (pas de
fréquence cardiaque, pas de GPS). L'application manipulera beaucoup de
données numériques, et celles liées à la musculation (reps, charge,
lest) sont faciles à confondre.

## Décision

Ma décision s'est portée sur TypeScript :

- Il oblige à gérer explicitement les champs vides.
- Les types sont partagés avec Drizzle, ce qui rend les modifications
  du schéma plus rapides et plus sûres.
- VS Code propose l'autocomplétion, ce qui facilite le travail.

## Alternatives écartées

- **JavaScript** : les erreurs de type ne sont découvertes qu'à
  l'exécution, alors que TypeScript les signale pendant l'écriture
  du code.

## Conséquences

- Plus de code à écrire.
- TypeScript ne vérifie que le code, pas les données reçues à
  l'exécution. Un formulaire, un fichier uploadé ou une requête API
  peuvent contenir n'importe quoi, quel que soit le type déclaré.
  En cybersécurité, on ne fait jamais confiance aux entrées
  utilisateur : ces données devront donc être validées avec une
  bibliothèque dédiée (Zod).
