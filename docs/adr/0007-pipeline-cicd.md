# ADR-000Y : Pipeline CI/CD en continuous deployment conditionné aux tests

- Statut : Accepté
- Date : 2026-11-04
- Décideur : William Determann

## Contexte

Le projet adopte une démarche DevOps. Chaque modification fusionnée sur
`main` doit arriver en production sans intervention manuelle, mais une
modification qui casse l'application ne doit jamais être déployée.

Par défaut, Vercel déploie automatiquement à chaque push, sans tenir
compte du résultat des tests.

## Options envisagées

1. Déploiement Git automatique de Vercel, sans pipeline de tests
2. Continuous delivery : la pipeline teste, puis la mise en prod est
   déclenchée manuellement
3. Continuous deployment : la pipeline teste et déploie automatiquement
   si tout passe

## Décision

Option 3 : une pipeline GitHub Actions exécute les vérifications puis
déploie automatiquement sur Vercel, uniquement si toutes les étapes
réussissent et uniquement depuis la branche `main`.

Étapes de la pipeline :

1. Installation des dépendances (`npm ci`)
2. Lint
3. Typecheck (`tsc --noEmit`)
4. Tests, sur un PostgreSQL jetable (service container)
5. Build
6. Migration Drizzle sur la base Neon de production
7. Déploiement en production via la CLI Vercel

Le job de déploiement dépend du job de tests (`needs`) : un échec
bloque le déploiement.

## Justification

### Déploiement automatique Vercel seul

- (+) Aucune configuration
- (-) Aucun garde-fou : du code cassé peut partir en production
- (-) Pas d'apprentissage DevOps

### Continuous delivery

- (+) Contrôle humain avant chaque mise en prod
- (-) Étape manuelle inutile pour un projet personnel à un seul développeur

### Continuous deployment

- (+) Mise en production rapide et sans action manuelle
- (+) Les tests deviennent le garde-fou de la production
- (+) Correspond à l'objectif d'apprentissage DevOps du projet
- (-) Exige des tests fiables : la qualité de la prod dépend directement
  de la couverture des tests

## Conséquences

- Le déploiement Git automatique de Vercel est désactivé
  (`git.deploymentEnabled: false` dans `vercel.json`)
- Les secrets sont stockés dans les GitHub Secrets, jamais dans le repo
- Des tests doivent être écrits en priorité sur les parties critiques
  (parsing des fichiers .fit, calculs du dashboard)
- Le bon fonctionnement du garde-fou est vérifié en poussant
  volontairement un test en échec : aucun déploiement ne doit avoir lieu
- Les migrations sont appliquées avant le déploiement : elles doivent
  rester compatibles avec la version précédente de l'application
