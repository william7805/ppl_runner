# 0003. PostgreSQL comme base de données

- Date : 2026-10-16
- Statut : Accepté

## Contexte

Les données de PPL_RUNNER sont fortement reliées entre elles : une
séance contient des exercices, qui contiennent des séries ; une activité
contient des tours et des points GPS. Les vignettes du dashboard
reposent sur des agrégations (volume par semaine, meilleur 1RM, km du
mois). Le projet a aussi pour objectif d'apprendre à héberger et
exploiter moi-même la base.

## Décision

J'utilise PostgreSQL, lancé dans un conteneur Docker en développement
comme en production.

- Base relationnelle : clés étrangères et contraintes (reps positives,
  pas de fichier .fit importé deux fois) qui protègent les données.
- SQL adapté aux agrégations du dashboard.
- Types riches : dates avec fuseau horaire, décimaux exacts pour les
  charges, ENUM pour le split push / pull / legs.
- Extension PostGIS disponible si les tracés GPS demandent des
  requêtes géographiques.
- Open source, très répandu en entreprise, image Docker officielle
  simple à utiliser.

## Alternatives écartées

- **MySQL / MariaDB** : relationnel aussi, mais types moins riches et
  pas d'équivalent aussi complet à PostGIS.
- **SQLite** : suffisant pour démarrer, mais une base dans un simple
  fichier ne m'apprend rien sur l'exploitation d'un vrai serveur de
  base de données.
- **MongoDB** : sans schéma fixe, peu adapté à des données aussi
  reliées entre elles.
- **Supabase** : c'est du PostgreSQL, mais hébergé ; il masque
  justement la partie exploitation que je veux apprendre.

## Conséquences

- Positif : données cohérentes et protégées par la base elle-même.
- Négatif : je dois gérer moi-même les sauvegardes, la restauration
  et les mises à jour de version.
- Négatif : sans volume Docker, les données disparaissent avec le
  conteneur. Un volume est obligatoire.
- La base ne doit être exposée qu'en local (127.0.0.1), jamais sur
  le réseau.
