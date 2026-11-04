# Roadmap PPL_RUNNER

## Vision

Un site personnel façon Strava pour suivre mes activités sportives :
un dashboard à vignettes, d'abord pour la course à pied, puis pour tous
les types d'activités dont la musculation. À terme, synchronisation
automatique avec ma montre COROS et analyse des séances avec l'API Claude.

Le projet sert aussi de terrain d'apprentissage : développement web,
démarche DevOps (CI/CD, IaC) et sécurité applicative.

## Principes

- Chaque décision structurante fait l'objet d'un ADR (`docs/adr/`)
- Toute modification passe par une PR et la CI avant d'être déployée
- Sécurité par défaut : inscription fermée, second facteur obligatoire,
  vérification de session côté serveur, secrets jamais dans le code
- Minimisation des données : on ne stocke que ce qui est utile
- Chaque version livrée est marquée par un tag Git et une release GitHub

## V1 : dashboard des courses

Objectif : voir mes courses dans un dashboard, à partir d'imports manuels.

- [x] Stack : monolithe Next.js, TypeScript, PostgreSQL, Drizzle
- [x] CI : format, lint, typecheck, tests, build
- [x] CD : migrations Neon puis déploiement Vercel, automatiques sur `main`
- [x] Branche `main` protégée, garde-fou vérifié
- [x] Environnement local : PostgreSQL 18 via Docker Compose
- [x] Authentification : Better Auth, TOTP obligatoire, inscription fermée
- [x] Parser GPX sécurisé et testé
- [ ] Import d'un fichier GPX depuis le site
- [ ] Dashboard : liste des courses en vignettes
- [ ] Statistiques globales (distance de la semaine, du mois, total)
- [ ] Page de détail d'une activité
- [ ] Suppression d'une activité
- [ ] Tag `v1.0.0` et release GitHub

## V2 : toutes les activités

Objectif : suivre aussi la musculation et les autres sports.

- [ ] Nouveaux types d'activité (vélo, natation, marche...)
- [ ] Saisie manuelle d'une séance
- [ ] Musculation : table dédiée (exercices, séries, répétitions, charges)
- [ ] Filtres du dashboard par type d'activité
- [ ] Import FIT en complément du GPX (à évaluer)

## V3 : synchronisation COROS

Objectif : ne plus importer de fichiers à la main.

- [ ] ADR : intégration COROS via OAuth 2.0 (API officielle self-service)
- [ ] Connexion du compte COROS depuis le site
- [ ] Stockage chiffré des jetons OAuth
- [ ] Import automatique des nouvelles activités
- [ ] Gestion des doublons avec les imports manuels
- [ ] Déconnexion et révocation de l'accès

## V4 : ouverture à quelques amis

Objectif : faire tester le site par 2 ou 3 personnes.

- [ ] ADR : inscription sur invitation
- [ ] Génération d'invitations à usage unique
- [ ] TOTP obligatoire pour tous les comptes
- [ ] Isolation des données vérifiée par des tests (aucun accès aux
      activités d'un autre utilisateur)
- [ ] RGPD : page d'information sur les données stockées, consentement,
      export et suppression du compte
- [ ] Sauvegardes régulières de la base

## V5 : analyse avec l'API Claude

Objectif : obtenir un feedback sur mes séances et planifier l'entraînement.

- [ ] ADR : intégration de l'API Claude (données envoyées, coûts, consentement)
- [ ] Clé API uniquement côté serveur, stockée en secret
- [ ] Limite d'usage par utilisateur
- [ ] Feedback sur une activité
- [ ] Analyse de tendances sur plusieurs semaines
- [ ] Planification de séances (avec écriture vers COROS si possible)

## Chantiers transverses

À traiter au fil des versions :

- [ ] Hook Git `pre-push` (tests locaux avant chaque push)
- [ ] Dependabot et `npm audit --omit=dev` dans la CI
- [ ] Sauvegardes de la base (`pg_dump` planifié)
- [ ] Infrastructure as Code : Vercel et Neon décrits avec Terraform
- [ ] Tests d'intégration sur une base PostgreSQL en CI
- [ ] Mise à jour d'ESLint 9 vers une version maintenue
- [ ] Zones de confidentialité autour du domicile (avant l'affichage des cartes)

## Versions prévues

| Version | Tag Git  | Contenu                                                      | État     |
| ------- | -------- | ------------------------------------------------------------ | -------- |
| V1      | `v1.0.0` | Dashboard des courses, import GPX manuel                     | En cours |
| V2      | `v2.0.0` | Toutes les activités, dont la musculation en saisie manuelle | Prévue   |
| V3      | `v3.0.0` | Synchronisation automatique avec COROS (OAuth 2.0)           | Prévue   |
| V4      | `v4.0.0` | Ouverture à 2 ou 3 amis, inscription sur invitation          | Prévue   |
| V5      | `v5.0.0` | Analyse et planification avec l'API Claude                   | Prévue   |

L'ordre de V3 et V4 peut être inversé selon les priorités du moment.

### Numérotation

Les versions suivent le versionnage sémantique (`MAJEUR.MINEUR.CORRECTIF`) :

- **MAJEUR** (`v2.0.0`) : une nouvelle étape de la roadmap est livrée
- **MINEUR** (`v1.1.0`) : une fonctionnalité est ajoutée au sein d'une version
- **CORRECTIF** (`v1.0.1`) : un bug est corrigé, sans nouvelle fonctionnalité

Chaque tag est accompagné d'une release GitHub qui résume les changements
et renvoie vers les PR concernées.
