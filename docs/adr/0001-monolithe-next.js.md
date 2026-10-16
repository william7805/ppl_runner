# 0001. Application Next.js en monolithe

- Date : 2026-10-16
- Statut : Accepté

## Contexte

PPL_RUNNER doit afficher un dashboard de vignettes, permettre la saisie
des séances de musculation, recevoir des fichiers .fit et les stocker
en base de données. Le projet est développé par une seule personne,
pour un seul utilisateur au départ, avec un objectif d'apprentissage
et un hébergement sur mon propre serveur.

## Décision

PPL_RUNNER est une seule application Next.js qui gère à la fois
l'interface et la logique serveur (lecture en base, upload des .fit),
via les Server Components et les route handlers.

- Next.js est un framework fullstack : il rend le monolithe possible
  sans backend séparé.
- Une seule application à construire, tester et déployer (une image
  Docker, un pipeline CI).
- Pas de CORS ni de contrat d'API à maintenir entre deux projets.
- Les types TypeScript sont partagés entre la base, le serveur et
  l'interface.
- Je connais déjà Next.js, ce qui me permet de me concentrer sur la
  partie DevOps.

## Alternatives écartées

- **Front et backend séparés** (Express, FastAPI) : deux applications,
  deux images et deux pipelines à gérer pour aucun bénéfice à cette
  échelle.
- **SvelteKit, Nuxt** : fullstack aussi, mais je devrais apprendre un
  nouveau framework, et leur écosystème est plus petit que celui de React.
- **Django, Laravel** : fullstack éprouvés, mais le dashboard interactif
  demanderait d'ajouter du JavaScript à côté.

## Conséquences

- Positif : architecture simple, déploiement unique, développement rapide.
- Négatif : front et serveur sont couplés, impossible de les déployer
  ou de les dimensionner séparément.
- Négatif : un traitement lourd des .fit pourrait ralentir toute
  l'application. Si cela arrive, il sera extrait dans un worker séparé,
  avec un nouvel ADR.
- Négatif : dépendance aux évolutions de Next.js, qui change vite.