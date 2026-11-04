# 0004. Drizzle ORM pour l'accès à la base et les migrations

- Date : 2026-10-16
- Statut : Accepté

## Contexte

L'application doit interroger PostgreSQL depuis TypeScript et faire
évoluer le schéma de la base au fil du projet. Ces évolutions doivent
être versionnées dans git, comme le code. Le schéma a d'abord été
conçu en SQL, et je veux comprendre les requêtes réellement exécutées.

## Décision

J'utilise Drizzle ORM :

- Le schéma est décrit en TypeScript dans `src/db/` : c'est la source
  de vérité, et les types en sont déduits automatiquement.
- Les migrations SQL sont générées dans `drizzle/` et commitées.
- La syntaxe des requêtes reste très proche du SQL.

## Alternatives écartées

- **Prisma** : très populaire, mais utilise son propre langage de
  schéma et s'éloigne davantage du SQL, ce qui cache ce que je veux
  apprendre.
- **SQL brut avec le driver `pg`** : contrôle total, mais pas de
  typage automatique des résultats, et un système de migrations à
  construire moi-même.

## Conséquences

- Positif : requêtes typées ; renommer une colonne fait apparaître
  toutes les erreurs dans le code.
- Positif : l'historique du schéma est lisible dans git.
- Négatif : certaines fonctionnalités PostgreSQL (vues, ENUM) devront
  être vérifiées dans les migrations générées, voire écrites à la main.
- Négatif : Drizzle est plus récent que Prisma, avec une communauté
  plus petite.
