# ADR-000Z : Utilisation de Docker Compose pour le développement et les tests en local

- Statut : Accepté
- Date : 2026-11-04
- Décideur : William Determann

## Contexte

L'application a besoin d'une base PostgreSQL pour fonctionner et pour
exécuter les tests. Utiliser la base Neon de production en local
risquerait de corrompre les données réelles. Les tests doivent pouvoir
être lancés avant chaque push, dans un environnement proche de la CI.

## Options envisagées

1. Se connecter directement à la base Neon (production ou branche)
2. Installer PostgreSQL nativement sur la machine
3. Lancer PostgreSQL dans un conteneur via Docker Compose

## Décision

Option 3 : un fichier `docker-compose.yml` lance un PostgreSQL local,
dans la même version majeure que celle utilisée sur Neon. L'application
sélectionne la base via la variable `DATABASE_URL`.

Les tests sont lancés en local avant chaque push, idéalement de façon
automatique avec un hook Git `pre-push`.

## Justification

### Base Neon

- (+) Aucune installation locale
- (-) Risque de toucher aux données de production
- (-) Dépend de la connexion internet et des quotas gratuits

### PostgreSQL natif

- (+) Pas de couche Docker
- (-) Version difficile à aligner avec la production
- (-) Pollue la machine, peu reproductible

### Docker Compose

- (+) Environnement reproductible et jetable
- (+) Version de PostgreSQL alignée avec Neon
- (+) Même principe que le service container utilisé dans la CI
- (+) Isolation totale des données de production
- (-) Nécessite Docker installé et lancé

## Conséquences

- Un fichier `.env.example` documente les variables attendues ; les
  fichiers `.env` réels sont exclus du repo via `.gitignore`
- Deux usages sont possibles : une base de dev persistante (volume) et
  une base de test vide recréée à chaque lancement
- Les tests locaux ne remplacent pas la CI : la pipeline relance
  systématiquement les tests avant tout déploiement
- La conteneurisation de l'application elle-même et l'IaC (Terraform)
  sont reportées à une décision ultérieure
