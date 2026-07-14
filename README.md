# Vite & Gourmand

Application web pour un traiteur bordelais : consultation des menus, commande en ligne avec calcul de prix (réductions et frais de livraison), suivi de commande horodaté, avis clients modérés, et espace de gestion pour les employés et l'administrateur.

Projet réalisé dans le cadre du Titre Professionnel Développeur Web et Web Mobile.

## Liens essentiels

- Application déployée : _à venir_
- Outil de gestion de projet : _à venir_
- Identifiants de démonstration : voir le manuel utilisateur (_à venir_)

## Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Full-stack en un seul déploiement : pages, API et rendu serveur au même endroit, ce qui réduit le risque de livraison |
| Styles | Tailwind CSS 4 | Rapidité de mise en page, responsive systématique |
| Base relationnelle | PostgreSQL | Exigée par le sujet : utilisateurs, rôles, menus, plats, commandes, statuts, avis |
| Base NoSQL | MongoDB | Exigée par le sujet pour les statistiques administrateur (commandes par menu, chiffre d'affaires) |
| Lint / format | Biome | Un seul outil rapide pour lint + format |
| Runtime de dev | Bun | Installation et exécution rapides ; compatible npm |

L'hébergement (application, PostgreSQL, MongoDB) sera choisi et documenté dans `.agent-forge/DECISIONS.md` avant le déploiement.

## Démarrage local

Prérequis : [Bun](https://bun.sh) (ou Node.js ≥ 20), PostgreSQL et MongoDB (instructions détaillées à venir avec les scripts SQL).

```bash
git clone https://github.com/Lilgim/vite-gourmand.git
cd vite-gourmand
cp .env.example .env   # puis renseigner les valeurs
bun install
bun dev
```

L'application est disponible sur http://localhost:3000.

Autres commandes :

```bash
bun run build      # build de production
bun run lint       # lint + format check (Biome)
```

## Organisation git

- `main` : version stable, déployable ;
- `dev` : intégration continue des fonctionnalités validées ;
- `feature/*` : une branche par fonctionnalité, partant de `dev` et fusionnée dans `dev` après vérification.

## Documentation

- `docs/` : documentation technique, gestion de projet, charte graphique et manuel utilisateur (à venir) ;
- `.agent-forge/` : journal des décisions, exigences et vérifications du projet.
