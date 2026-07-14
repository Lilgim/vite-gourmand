# Journal des décisions

## D-001 — Stack applicative (2026-07-14)

**Décision :** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, exécuté avec Bun, lint/format avec Biome.

**Pourquoi :** le sujet exige une application web moderne avec front, back et deux bases. Un framework full-stack regroupe pages, API et rendu serveur dans un seul déploiement, ce qui réduit le risque de livraison à 9 jours de la deadline. TypeScript est la stack par défaut du brief.

**Alternatives écartées :** front séparé + API Express (deux déploiements à maintenir et sécuriser) ; PHP/Symfony (moins de familiarité, risque planning).

## D-002 — Bases de données (2026-07-14)

**Décision :** PostgreSQL pour le relationnel (utilisateurs, rôles, menus, plats, commandes, statuts, avis, horaires), MongoDB pour les statistiques administrateur (exigence explicite du sujet : base NoSQL pour les stats).

**À préciser :** ORM/driver (Prisma vs Drizzle vs SQL direct) — trancher au moment du schéma ; le sujet exige de toute façon des scripts SQL explicites de création et d'insertion.

## D-003 — Hébergement : EN ATTENTE

Comparer avant le déploiement (coût, simplicité, HTTPS, compatibilité PostgreSQL + MongoDB) et documenter ici. Candidats à évaluer : à lister lors de la phase déploiement. Contrainte : HTTPS obligatoire en production.
