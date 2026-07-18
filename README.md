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

Prérequis : [Bun](https://bun.sh), Node.js ≥ 20 et Docker (pour PostgreSQL et MongoDB).

```bash
git clone https://github.com/Lilgim/vite-gourmand.git
cd vite-gourmand
cp .env.example .env       # les valeurs par défaut correspondent au docker-compose
bun install
docker compose up -d       # PostgreSQL (port 5433) + MongoDB (port 27018)
bun run db:reset           # crée le schéma (sql/01_create.sql), insère les données
                           # de démo (sql/02_seed.sql) et synchronise les stats Mongo
bun dev
```

L'application est disponible sur http://localhost:3000.

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Client | `client@demo.vite-gourmand.fr` | `ClientDemo2026!` |
| Employé | `employe@demo.vite-gourmand.fr` | `EmployeDemo2026!` |
| Administrateur | `admin@demo.vite-gourmand.fr` | `AdminDemo2026!` |

Identifiants dédiés à la démonstration — aucune donnée réelle.

### Commandes

```bash
bun run build      # build de production
bun run lint       # lint + format check (Biome)
bun run typecheck  # vérification TypeScript
bun test           # tests unitaires des règles métier (prix, statuts)
bun run test:e2e   # remet la base à zéro puis joue les parcours Playwright
bun run db:reset   # base de démonstration propre (schéma + seed + stats)
```

## Sécurité

- Mots de passe hachés (bcrypt, coût 12), sessions serveur en base avec cookie
  `httpOnly`/`sameSite` — la désactivation d'un compte révoque ses sessions.
- Autorisation par rôle vérifiée côté serveur (layouts + chaque Server Action) ;
  le proxy ne fait qu'une redirection optimiste.
- Toutes les requêtes SQL sont paramétrées ; toutes les entrées sont validées
  par des schémas zod côté serveur.
- En-têtes de sécurité globaux (CSP, X-Frame-Options, nosniff, Referrer-Policy) ;
  protection CSRF des mutations assurée par les Server Actions de Next.js
  (vérification d'origine intégrée).

## Emails transactionnels

Confirmation de commande et notifications de changement de statut.
Sans configuration SMTP (`SMTP_HOST` vide), l'application fonctionne en
**mode test documenté** : chaque email est journalisé sur la sortie standard
du serveur au lieu d'être envoyé — c'est le mode utilisé en développement
et en démonstration. Renseigner les variables `SMTP_*` du `.env` bascule
sur un envoi réel via nodemailer.

## Organisation git

- `main` : version stable, déployable ;
- `dev` : intégration continue des fonctionnalités validées ;
- `feature/*` : une branche par fonctionnalité, partant de `dev` et fusionnée dans `dev` après vérification.

## Documentation

- `docs/` : documentation technique, gestion de projet, charte graphique et manuel utilisateur (à venir) ;
- `.agent-forge/` : journal des décisions, exigences et vérifications du projet.
