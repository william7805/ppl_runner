# ADR-000X : Hébergement de l'application sur Vercel et de la base sur Neon

- Statut : Accepté
- Date : 2026-11-04
- Décideur : William Determann

## Contexte

PPL_RUNNER est un monolithe Next.js (TypeScript) avec une base PostgreSQL
accédée via Drizzle. Il faut un hébergement pour mettre le site en ligne
avec une démarche DevOps (CI/CD en continuous deployment).

Contraintes :
- Budget nul : uniquement des offres gratuites
- Usage personnel, non commercial, un seul utilisateur
- Les données (séances importées depuis des fichiers .fit) doivent être
  conservées dans le temps
- Le déploiement doit pouvoir être piloté par une pipeline GitHub Actions

## Options envisagées

1. Vercel (app) + Neon (base)
2. Render (app + base)
3. VM gratuite avec Docker (app + base auto-hébergées)

## Décision

Option 1 : l'application est hébergée sur Vercel (plan Hobby) et la base
PostgreSQL sur Neon (plan Free).

## Justification

### Vercel + Neon
- (+) Vercel est conçu par l'éditeur de Next.js : support natif, aucune
  configuration serveur
- (+) Plan Hobby gratuit sans limite de durée, adapté à un usage personnel
  non commercial
- (+) Neon Free est permanent (pas un essai) et suffit en stockage pour le
  volume de données prévu
- (+) Neon propose le branching de base, utile pour tester les migrations
  dans la CI
- (+) Déploiement pilotable par la CLI Vercel depuis GitHub Actions
- (-) Usage commercial interdit sur Vercel Hobby
- (-) Dépendance à deux fournisseurs externes (vendor lock-in limité :
  Postgres reste standard)
- (-) La base Neon Free se met en veille : léger délai au premier accès

### Render
- (+) App et base sur une seule plateforme
- (-) La base Postgres gratuite expire au bout de 30 jours puis est
  supprimée : incompatible avec la conservation des données
- (-) Le service gratuit se met en veille après 15 min d'inactivité,
  avec environ 1 min de redémarrage

### VM gratuite avec Docker
- (+) Contrôle total, apprentissage plus poussé (Docker, reverse proxy,
  HTTPS, IaC)
- (-) Maintenance, sécurité et sauvegardes entièrement à ma charge
- (-) Trop de travail d'infra pour démarrer le projet

## Conséquences

- Le déploiement Git automatique de Vercel est désactivé
  (`git.deploymentEnabled: false`) : seule la pipeline GitHub Actions
  déploie, et uniquement si les tests passent (voir ADR sur la CI/CD)
- Les secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
  `DATABASE_URL`) sont stockés dans les GitHub Secrets
- Les migrations Drizzle sont appliquées sur Neon par la pipeline avant
  le déploiement
- En développement local, on utilise un Postgres via Docker Compose, pas Neon
- Cette décision pourra être revue si le projet passe à un usage
  commercial ou dépasse les limites gratuites (migration possible vers
  une VM conteneurisée, éventuellement décrite en IaC)