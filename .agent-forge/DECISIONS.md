# Journal des décisions

## D-001 — Stack applicative (2026-07-14)

**Décision :** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, exécuté avec Bun, lint/format avec Biome.

**Pourquoi :** le sujet exige une application web moderne avec front, back et deux bases. Un framework full-stack regroupe pages, API et rendu serveur dans un seul déploiement, ce qui réduit le risque de livraison à 9 jours de la deadline. TypeScript est la stack par défaut du brief.

**Alternatives écartées :** front séparé + API Express (deux déploiements à maintenir et sécuriser) ; PHP/Symfony (moins de familiarité, risque planning).

## D-002 — Bases de données (2026-07-14)

**Décision :** PostgreSQL pour le relationnel (utilisateurs, rôles, menus, plats, commandes, statuts, avis, horaires), MongoDB pour les statistiques administrateur (exigence explicite du sujet : base NoSQL pour les stats).

**À préciser :** ORM/driver (Prisma vs Drizzle vs SQL direct) — trancher au moment du schéma ; le sujet exige de toute façon des scripts SQL explicites de création et d'insertion.

## D-003 — Hébergement : VPS personnel + sous-domaine (2026-07-15)

**Décision (lilgim) :** déploiement sur son VPS personnel (Hostinger) avec un sous-domaine dédié.

**Options comparées :**
- *VPS dédié neuf (~4-6 €/mois)* : isolation parfaite mais coût et machine supplémentaires à gérer ;
- *PaaS gratuit (Vercel + Neon + Atlas M0)* : 0 € mais trois services, cold starts, déploiement moins démonstratif pour l'examen ;
- *VPS personnel existant (retenu)* : coût zéro, contrôle total, et le déploiement (Docker Compose + reverse proxy + TLS) constitue un livrable défendable à l'oral.

**Garde-fous :** stack Docker Compose et réseau Docker dédiés (aucune interaction avec les autres services de la machine), secrets générés sur le serveur et jamais commités, HTTPS via reverse proxy avec certificat automatique.

## D-004 — Architecture de déploiement (2026-07-18)

**Décision :** image Docker multistage (build `oven/bun:1`, runtime `node:24-alpine` sur la sortie `standalone` de Next), stack `docker-compose.prod.yml` isolée (projet `vite-gourmand-prod`, réseau bridge dédié), PostgreSQL et MongoDB sans aucun port publié, TLS par Caddy 2 (Let's Encrypt automatique).

**Pourquoi :**
- *Runtime Node pour l'app* : la sortie standalone de Next est officiellement supportée sur Node — zéro risque d'incompatibilité le jour de la correction ; Bun reste l'outil de build et de dev. Node 24 exécute aussi `scripts/reset-db.ts` nativement (initialisation des données de démo en prod en une commande).
- *Caddy plutôt que nginx+certbot ou traefik* : obtention et renouvellement Let's Encrypt automatiques avec un Caddyfile de 5 lignes — la simplicité et la reproductibilité priment pour un rendu d'examen.
- *Cas « proxy déjà présent sur le VPS »* : l'app publie toujours `127.0.0.1:3001` (loopback, inoffensif) ; si 80/443 sont pris, on démarre la stack sans le service caddy et on branche le proxy existant sur ce port.

**Alternatives écartées :** runtime Bun en prod (support standalone Next 16 moins éprouvé) ; nginx + certbot (2 conteneurs + cron de renouvellement) ; exposition directe du port 3000 (pas de TLS).
